import fs from 'fs';
import { db } from '../server/db';
import { examQuestions } from '../shared/schema';
import type { InsertExamQuestion } from '../shared/schema';

const CATEGORY_MAP: Record<string, string> = {
  'B-001': 'regulations',
  'B-002': 'operating',
  'B-003': 'technical',
  'B-004': 'technical',
  'B-005': 'technical',
  'B-006': 'technical',
  'B-007': 'antenna',
  'B-008': 'operating',
};

interface CSVQuestion {
  questionNumber: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

function parseCSV(csvPath: string): CSVQuestion[] {
  console.log(`📄 Reading CSV file: ${csvPath}`);
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Skip header
  const dataLines = lines.slice(1);
  
  const questions: CSVQuestion[] = [];
  
  for (const line of dataLines) {
    // Parse CSV line (handle quoted fields)
    const fields = parseCSVLine(line);
    
    if (fields.length >= 7) {
      const correctAnswerLetter = fields[6].trim().toUpperCase();
      
      questions.push({
        questionNumber: fields[0].trim(),
        question: fields[1].trim(),
        optionA: fields[2].trim(),
        optionB: fields[3].trim(),
        optionC: fields[4].trim(),
        optionD: fields[5].trim(),
        correctAnswer: correctAnswerLetter
      });
    }
  }
  
  console.log(`✅ Parsed ${questions.length} questions from CSV`);
  return questions;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  fields.push(current);
  return fields;
}

async function importFromCSV(csvPath: string) {
  try {
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found: ${csvPath}`);
      process.exit(1);
    }
    
    console.log('🚀 Starting CSV import...\n');
    
    const questions = parseCSV(csvPath);
    
    // Validate
    console.log('\n🔍 Validating questions...');
    let hasErrors = false;
    const errors: string[] = [];
    
    questions.forEach((q, idx) => {
      if (!q.questionNumber.match(/^B-\d{3}-\d{3}-\d{3}$/)) {
        errors.push(`Row ${idx + 2}: Invalid question number: ${q.questionNumber}`);
        hasErrors = true;
      }
      
      if (q.question.includes('[NEED QUESTION TEXT]') || q.question.length < 10) {
        errors.push(`Row ${idx + 2}: Question text not filled in: ${q.questionNumber}`);
        hasErrors = true;
      }
      
      if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
        errors.push(`Row ${idx + 2}: Invalid correct answer: ${q.correctAnswer}`);
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      console.log(`\n❌ Found ${errors.length} validation errors:`);
      errors.slice(0, 20).forEach(e => console.log(`   ${e}`));
      if (errors.length > 20) {
        console.log(`   ... and ${errors.length - 20} more errors`);
      }
      console.log('\n⚠️  Please fix the CSV and try again');
      process.exit(1);
    }
    
    console.log('✅ All questions validated!');
    
    console.log(`\n📊 Import Summary:`);
    console.log(`   Total questions: ${questions.length}`);
    
    const categoryCounts: Record<string, number> = {};
    questions.forEach(q => {
      const categoryCode = q.questionNumber.substring(0, 5);
      const category = CATEGORY_MAP[categoryCode] || 'technical';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    console.log('\n📋 Questions by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });
    
    console.log('\n🗑️  Deleting existing questions...');
    await db.delete(examQuestions);
    console.log('✅ Existing questions deleted');
    
    console.log('\n💾 Inserting questions...');
    
    const batchSize = 100;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, Math.min(i + batchSize, questions.length));
      
      const insertData: InsertExamQuestion[] = batch.map(q => {
        const categoryCode = q.questionNumber.substring(0, 5);
        const category = CATEGORY_MAP[categoryCode] || 'technical';
        const correctAnswer = q.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
        
        return {
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer,
          explanation: null,
          category,
          subcategory: null,
          difficulty: 'basic',
          examType: 'basic',
          questionNumber: q.questionNumber,
          isActive: true
        };
      });
      
      await db.insert(examQuestions).values(insertData);
      console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1} (questions ${i + 1}-${Math.min(i + batchSize, questions.length)})`);
    }
    
    console.log('\n✅ Import complete!');
    console.log(`📊 Total questions in database: ${questions.length}`);
    console.log('\n🎉 Official ISED question bank successfully imported!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  }
}

// Get CSV path from command line argument
const csvPath = process.argv[2] || '/tmp/official_questions.csv';
importFromCSV(csvPath);

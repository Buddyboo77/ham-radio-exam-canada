import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { db } from '../server/db';
import { examQuestions } from '../shared/schema';

const CATEGORY_MAP: Record<string, string> = {
  'B-001': 'regulations',
  'B-002': 'regulations',
  'B-003': 'technical',
  'B-004': 'operating',
  'B-005': 'operating',
  'B-006': 'technical',
  'B-007': 'antenna',
  'B-008': 'safety',
};

interface Question {
  questionNumber: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: number;
  category: string;
}

function preprocessCSV(content: string): string {
  // Pre-process CSV to add proper quotes around all fields
  // This handles fields with commas (like "$10,000") correctly using placeholder replacement
  const lines = content.trim().split('\n');
  const output: string[] = [];
  
  // Add header
  output.push('Question ID,Question Text,Option A,Option B,Option C,Option D,Correct Answer');
  
  for (const line of lines) {
    // Skip header line
    if (line.startsWith('Question ID') || line.startsWith('QuestionID')) {
      continue;
    }
    
    // Match QuestionID at start and Answer at end
    const match = line.match(/^(B-\d{3}-\d{3}-\d{3}),(.+),([A-D])\s*$/);
    
    if (!match) {
      // Invalid line - skip
      continue;
    }
    
    const [_, questionId, middle, answer] = match;
    
    // Replace dollar amounts with placeholders to protect commas
    const dollarPattern = /\$\d{1,3},\d{3,4}/g;
    const dollarAmounts: string[] = [];
    let processed = middle.replace(dollarPattern, (match) => {
      const placeholder = `__DOLLAR_${dollarAmounts.length}__`;
      dollarAmounts.push(match);
      return placeholder;
    });
    
    // Now split on commas
    const parts = processed.split(',').map(p => p.trim());
    
    // Restore dollar amounts
    const restored = parts.map(part => {
      return part.replace(/__DOLLAR_(\d+)__/g, (_, index) => dollarAmounts[parseInt(index)]);
    });
    
    // We need exactly 5 fields (question + 4 options)
    let fields: string[];
    if (restored.length === 5) {
      fields = [questionId, ...restored, answer];
    } else if (restored.length > 5) {
      // If we have more, assume extras are in the question (first field)
      const question = restored.slice(0, restored.length - 4).join(',');
      const options = restored.slice(restored.length - 4);
      fields = [questionId, question, ...options, answer];
    } else {
      // Insufficient fields - skip
      console.warn(`⚠️  Skipping line: insufficient fields (${restored.length})`);
      continue;
    }
    
    // Quote each field and escape internal quotes
    const quotedFields = fields.map(f => 
      `"${f.replace(/"/g, '""')}"`
    );
    
    output.push(quotedFields.join(','));
  }
  
  return output.join('\n');
}

function parseOfficialCSV(filePath: string): Question[] {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  
  // Check if the file is already properly quoted (starts with quote after first comma)
  const firstLine = rawContent.split('\n')[1] || '';
  const isAlreadyQuoted = firstLine.match(/^"B-\d{3}-\d{3}-\d{3}","/) !== null;
  
  const quotedContent = isAlreadyQuoted ? rawContent : preprocessCSV(rawContent);
  
  // Now use proper CSV parser with quote handling
  const records = parse(quotedContent, {
    columns: false,
    skip_empty_lines: true,
    trim: true,
  });
  
  const questions: Question[] = [];
  
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    
    // Skip header row
    if (row[0] === 'Question ID' || row[0] === 'QuestionID') {
      continue;
    }
    
    // Validate row has all required fields
    if (!row || row.length < 7) {
      console.warn(`⚠️  Row ${i + 1}: Insufficient columns (${row?.length || 0})`);
      continue;
    }
    
    const questionId = row[0]?.trim();
    const questionText = row[1]?.trim();
    const optionA = row[2]?.trim();
    const optionB = row[3]?.trim();
    const optionC = row[4]?.trim();
    const optionD = row[5]?.trim();
    const answerLetter = row[6]?.trim()?.toUpperCase();
    
    // Validate question ID format
    if (!questionId || !questionId.match(/^B-\d{3}-\d{3}-\d{3}$/)) {
      continue;
    }
    
    // Validate answer letter
    if (!answerLetter || !['A', 'B', 'C', 'D'].includes(answerLetter)) {
      console.warn(`⚠️  Skipping ${questionId}: Invalid answer "${answerLetter}"`);
      continue;
    }
    
    // Validate we have question text and all options
    if (!questionText || !optionA || !optionB || !optionC || !optionD) {
      console.warn(`⚠️  Skipping ${questionId}: Missing question text or options`);
      continue;
    }
    
    const correctAnswer = answerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    
    // Determine category from question ID prefix
    const categoryCode = questionId.substring(0, 5);
    const category = CATEGORY_MAP[categoryCode] || 'technical';
    
    questions.push({
      questionNumber: questionId,
      question: questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      category
    });
  }
  
  return questions;
}

async function importQuestions(filePath: string) {
  console.log('📄 Reading official ISED CSV...\n');
  
  const questions = parseOfficialCSV(filePath);
  console.log(`✅ Parsed ${questions.length} questions\n`);
  
  if (questions.length === 0) {
    console.error('❌ No questions found!');
    process.exit(1);
  }
  
  // Show first few questions
  console.log('📋 Sample questions:');
  questions.slice(0, 3).forEach(q => {
    const preview = q.question.length > 50 ? q.question.substring(0, 50) + '...' : q.question;
    const optionPreview = q.optionA.length > 40 ? q.optionA.substring(0, 40) + '...' : q.optionA;
    console.log(`  ${q.questionNumber}: ${preview}`);
    console.log(`    A) ${optionPreview}`);
    console.log(`    Correct: ${['A', 'B', 'C', 'D'][q.correctAnswer]}\n`);
  });
  
  console.log('🗑️  Clearing existing questions...');
  await db.delete(examQuestions);
  
  console.log('💾 Importing questions...\n');
  
  for (const q of questions) {
    await db.insert(examQuestions).values({
      questionNumber: q.questionNumber,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      category: q.category,
      explanation: null
    });
  }
  
  console.log(`✅ Imported ${questions.length} questions!`);
  
  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  questions.forEach(q => {
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
  });
  
  console.log('\n📊 Questions by category:');
  Object.entries(categoryCounts).sort().forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
  
  console.log('\n🎉 Import complete!');
}

const csvPath = process.argv[2] || '/tmp/official_import.csv';
importQuestions(csvPath).catch(console.error);

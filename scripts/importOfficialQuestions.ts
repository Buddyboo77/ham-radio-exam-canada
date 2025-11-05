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

interface ParsedQuestion {
  questionNumber: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: number;
}

async function extractFromPDF(): Promise<ParsedQuestion[]> {
  console.log('📄 Reading PDF with proper two-column parsing...');
  
  const { PDFParse } = await import('pdf-parse');
  const dataBuffer = fs.readFileSync('attached_assets/amateur_basic_questions_en_2025-07-15_1762335694399.pdf');
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText();
  
  const text = data.text;
  const lines = text.split('\n').map(l => l.trim());
  
  const questions: ParsedQuestion[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Look for question header with answer: B-001-001-001 (A)
    const match = line.match(/^(B-\d{3}-\d{3}-\d{3})\s+\(([A-D])\)/);
    
    if (match) {
      const questionNumber = match[1];
      const correctAnswerLetter = match[2];
      const correctAnswer = correctAnswerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      
      i++;
      
      // Collect question text until we hit option A
      let questionText = '';
      while (i < lines.length && !lines[i].match(/^A\s+/)) {
        if (lines[i].length > 0 && !lines[i].match(/^B-\d{3}/)) {
          questionText += (questionText ? ' ' : '') + lines[i];
        }
        i++;
      }
      
      // Collect 4 options
      const options: string[] = [];
      for (let optNum = 0; optNum < 4; optNum++) {
        if (i >= lines.length) break;
        
        const expectedLabel = String.fromCharCode(65 + optNum); // A, B, C, D
        if (lines[i].match(new RegExp(`^${expectedLabel}\\s+`))) {
          let optionText = lines[i].replace(/^[A-D]\s+/, '');
          i++;
          
          // Continue collecting until next option or question
          while (i < lines.length && 
                 !lines[i].match(/^[A-D]\s+/) && 
                 !lines[i].match(/^B-\d{3}/)) {
            if (lines[i].length > 0) {
              optionText += ' ' + lines[i];
            }
            i++;
          }
          
          options.push(optionText.trim());
        } else {
          break;
        }
      }
      
      if (options.length === 4 && questionText.length > 5) {
        const categoryCode = questionNumber.substring(0, 5);
        const category = CATEGORY_MAP[categoryCode] || 'technical';
        
        questions.push({
          questionNumber,
          questionText: questionText.trim(),
          optionA: options[0],
          optionB: options[1],
          optionC: options[2],
          optionD: options[3],
          correctAnswer
        });
        
        if (questions.length % 100 === 0) {
          console.log(`✅ Parsed ${questions.length} questions...`);
        }
      }
    } else {
      i++;
    }
  }
  
  return questions;
}

async function importQuestions() {
  try {
    console.log('🚀 Starting official ISED question import...\n');
    
    const questions = await extractFromPDF();
    
    console.log(`\n✅ Extracted ${questions.length} questions`);
    
    if (questions.length < 900) {
      console.log(`⚠️  Expected ~984, got ${questions.length}`);
    }
    
    // Show samples
    console.log('\n📋 First 2 questions:');
    questions.slice(0, 2).forEach(q => {
      console.log(`\n${q.questionNumber} (Answer: ${String.fromCharCode(65 + q.correctAnswer)}):`);
      console.log(`Q: ${q.questionText}`);
      console.log(`A: ${q.optionA}`);
      console.log(`B: ${q.optionB}`);
      console.log(`C: ${q.optionC}`);
      console.log(`D: ${q.optionD}`);
    });
    
    console.log('\n💾 Importing to database...');
    
    await db.delete(examQuestions);
    
    const batchSize = 100;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, Math.min(i + batchSize, questions.length));
      
      const insertData = batch.map(q => {
        const categoryCode = q.questionNumber.substring(0, 5);
        const category = CATEGORY_MAP[categoryCode] || 'technical';
        
        return {
          question: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: null,
          category,
          subcategory: null,
          difficulty: 'basic' as const,
          examType: 'basic' as const,
          questionNumber: q.questionNumber,
          isActive: true
        };
      });
      
      await db.insert(examQuestions).values(insertData);
      
      if ((i + batch.length) % 200 === 0) {
        console.log(`   Inserted ${i + batch.length} questions...`);
      }
    }
    
    console.log(`\n✅ Successfully imported ${questions.length} official ISED questions!`);
    console.log('🎉 Your app now has the official question bank!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

importQuestions();

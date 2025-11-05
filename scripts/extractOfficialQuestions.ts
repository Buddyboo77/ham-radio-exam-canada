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

interface QuestionData {
  questionNumber: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: number;
}

async function extractQuestionsFromPDF(pdfPath: string): Promise<QuestionData[]> {
  console.log('📄 Loading PDF...');
  
  const { PDFParse } = await import('pdf-parse');
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText();
  const text = data.text;
  
  console.log(`📊 PDF text length: ${text.length} characters`);
  
  const questions: QuestionData[] = [];
  const pages = text.split(/-- \d+ of \d+ --/);
  
  console.log(`📄 Processing ${pages.length} pages...\n`);
  
  for (let pageNum = 0; pageNum < pages.length; pageNum++) {
    const pageText = pages[pageNum];
    const lines = pageText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const questionIds: string[] = [];
    const textLines: string[] = [];
    const answerIndicators: string[] = [];
    
    for (const line of lines) {
      if (line.match(/^B-\d{3}-\d{3}-\d{3}$/)) {
        questionIds.push(line);
      } else if (line.match(/^\([A-D]\)$/)) {
        answerIndicators.push(line.replace(/[()]/g, ''));
      } else if (!line.match(/^[A-D]$/)) {
        textLines.push(line);
      }
    }
    
    if (questionIds.length === 0) continue;
    
    // Each question needs: 1 question text + 4 options
    const linesPerQuestion = Math.floor(textLines.length / questionIds.length);
    
    for (let i = 0; i < questionIds.length; i++) {
      const questionId = questionIds[i];
      const answerLetter = answerIndicators[i];
      
      if (!answerLetter) continue;
      
      const correctAnswer = answerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      
      // Calculate which text lines belong to this question
      const startIdx = i * linesPerQuestion;
      const endIdx = Math.min(startIdx + linesPerQuestion, textLines.length);
      const questionTextLines = textLines.slice(startIdx, endIdx);
      
      if (questionTextLines.length >= 5) {
        // Last line is typically the question, first 4 are options
        const questionText = questionTextLines[questionTextLines.length - 1];
        const options = questionTextLines.slice(0, 4);
        
        const categoryCode = questionId.substring(0, 5);
        const category = CATEGORY_MAP[categoryCode] || 'technical';
        
        questions.push({
          questionNumber: questionId,
          questionText: questionText || '',
          optionA: options[0] || '',
          optionB: options[1] || '',
          optionC: options[2] || '',
          optionD: options[3] || '',
          correctAnswer
        });
      }
    }
    
    if ((pageNum + 1) % 20 === 0) {
      console.log(`✅ Processed ${pageNum + 1} pages, ${questions.length} questions so far...`);
    }
  }
  
  console.log(`\n✅ Extracted ${questions.length} questions`);
  return questions;
}

async function validateAndImport(questions: QuestionData[]) {
  console.log('\n🔍 Validating extraction...');
  
  // Basic validation
  console.log(`   Total questions: ${questions.length}`);
  
  if (questions.length !== 984) {
    console.log(`   ⚠️  Expected 984, got ${questions.length}`);
  }
  
  // Check a few samples
  console.log('\n📋 First 3 questions:');
  questions.slice(0, 3).forEach(q => {
    console.log(`\n${q.questionNumber}:`);
    console.log(`  Q: ${q.questionText.substring(0, 60)}...`);
    console.log(`  A: ${q.optionA.substring(0, 50)}...`);
    console.log(`  Correct: ${String.fromCharCode(65 + q.correctAnswer)}`);
  });
  
  // Import anyway - we'll verify after
  console.log('\n💾 Importing to database...');
  
  await db.delete(examQuestions);
  
  const batchSize = 100;
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, Math.min(i + batchSize, questions.length));
    
    const insertData: InsertExamQuestion[] = batch.map(q => {
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
        difficulty: 'basic',
        examType: 'basic',
        questionNumber: q.questionNumber,
        isActive: true
      };
    });
    
    await db.insert(examQuestions).values(insertData);
    
    if ((i + batch.length) % 200 === 0) {
      console.log(`   Inserted ${i + batch.length} questions...`);
    }
  }
  
  console.log(`\n✅ Imported ${questions.length} questions to database`);
  console.log('\n⚠️  NOTE: Due to PDF table format, question text may need manual review.');
  console.log('Check a few questions in the app to verify quality.');
}

async function main() {
  try {
    const pdfPath = 'attached_assets/amateur_basic_questions_en_2025-07-15_1762335694399.pdf';
    
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ PDF file not found');
      process.exit(1);
    }
    
    console.log('🚀 Starting ISED question import...\n');
    
    const questions = await extractQuestionsFromPDF(pdfPath);
    await validateAndImport(questions);
    
    console.log('\n🎉 Import complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

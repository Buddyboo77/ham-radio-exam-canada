import fs from 'fs';
import { db } from '../server/db';
import { examQuestions } from '../shared/schema';
import type { InsertExamQuestion } from '../shared/schema';
import { sql } from 'drizzle-orm';

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
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: number;
  category: string;
}

async function parseOfficialQuestions(pdfPath: string): Promise<ParsedQuestion[]> {
  console.log('📄 Reading PDF file...');
  const dataBuffer = fs.readFileSync(pdfPath);
  
  console.log('🔍 Parsing PDF content...');
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText();
  const text = data.text;
  
  console.log(`📊 Total PDF text length: ${text.length} characters`);
  
  const questions: ParsedQuestion[] = [];
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
        answerIndicators.push(line);
      } else if (line.length > 3 && !line.match(/^[A-D]$/)) {
        textLines.push(line);
      }
    }
    
    if (questionIds.length === 0) continue;
    
    // Each question needs: 1 question text + 4 options = 5 text lines
    const expectedTextLines = questionIds.length * 5;
    const actualTextLines = textLines.length;
    
    // Process each question on this page
    for (let i = 0; i < questionIds.length; i++) {
      const questionId = questionIds[i];
      const answerIndicator = answerIndicators[i];
      
      if (!answerIndicator) continue;
      
      const answerMatch = answerIndicator.match(/\(([A-D])\)/);
      if (!answerMatch) continue;
      
      const correctAnswerLetter = answerMatch[1];
      const correctAnswer = correctAnswerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      
      // Estimate which text lines belong to this question
      // The PDF has questions in columns, so distribution is complex
      // Try to grab 5 consecutive lines for each question
      const startIdx = Math.floor((i / questionIds.length) * actualTextLines);
      const linesPerQuestion = Math.floor(actualTextLines / questionIds.length);
      
      const questionTextLines = textLines.slice(
        startIdx,
        Math.min(startIdx + linesPerQuestion, actualTextLines)
      );
      
      if (questionTextLines.length >= 5) {
        // Last line is typically the question, first 4 are options
        const questionText = questionTextLines[questionTextLines.length - 1];
        const options = questionTextLines.slice(0, 4);
        
        const categoryCode = questionId.substring(0, 5);
        const category = CATEGORY_MAP[categoryCode] || 'technical';
        
        questions.push({
          questionNumber: questionId,
          question: questionText,
          optionA: options[0] || 'Option A',
          optionB: options[1] || 'Option B',
          optionC: options[2] || 'Option C',
          optionD: options[3] || 'Option D',
          correctAnswer,
          category
        });
      }
    }
    
    if (pageNum % 20 === 0 && pageNum > 0) {
      console.log(`✅ Processed ${pageNum} pages, ${questions.length} questions so far...`);
    }
  }
  
  console.log(`\n✅ Successfully parsed ${questions.length} questions`);
  return questions;
}

async function importQuestions() {
  try {
    const pdfPath = '/tmp/official_basic_questions.pdf';
    
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ PDF file not found at:', pdfPath);
      process.exit(1);
    }
    
    console.log('🚀 Starting official question import...\n');
    
    const parsedQuestions = await parseOfficialQuestions(pdfPath);
    
    if (parsedQuestions.length < 900) {
      console.warn(`\n⚠️  Warning: Only parsed ${parsedQuestions.length} questions (expected ~984)`);
      console.warn('    The complex PDF table layout makes automated parsing difficult.');
      console.warn('    Proceeding with available questions, but manual review recommended.\n');
    }
    
    if (parsedQuestions.length === 0) {
      console.error('❌ No questions were parsed');
      process.exit(1);
    }
    
    console.log('\n📊 Import Summary:');
    console.log(`   Total questions parsed: ${parsedQuestions.length}`);
    
    const categoryCounts: Record<string, number> = {};
    parsedQuestions.forEach(q => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    });
    
    console.log('\n📋 Questions by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });
    
    console.log('\n🗑️  Deleting existing questions...');
    await db.delete(examQuestions);
    console.log('✅ Existing questions deleted');
    
    console.log('\n💾 Inserting official questions...');
    
    const batchSize = 100;
    for (let i = 0; i < parsedQuestions.length; i += batchSize) {
      const batch = parsedQuestions.slice(i, Math.min(i + batchSize, parsedQuestions.length));
      const insertData: InsertExamQuestion[] = batch.map(q => ({
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: null,
        category: q.category,
        subcategory: null,
        difficulty: 'basic',
        examType: 'basic',
        questionNumber: q.questionNumber,
        isActive: true
      }));
      
      await db.insert(examQuestions).values(insertData);
      console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1} (questions ${i + 1}-${Math.min(i + batchSize, parsedQuestions.length)})`);
    }
    
    console.log('\n✅ Import complete!');
    const count = await db.select({ count: sql<number>`count(*)::int` }).from(examQuestions);
    console.log(`📊 Total questions in database: ${count[0].count}`);
    
    console.log('\n🎉 Official ISED question bank import attempted!');
    console.log('⚠️  Manual review of questions recommended due to PDF parsing complexity');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  }
}

importQuestions();

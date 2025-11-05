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

interface ExcelQuestion {
  questionNumber: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

async function parseExcelFile(excelPath: string): Promise<ExcelQuestion[]> {
  console.log('📄 Reading Excel file...');
  
  const XLSX = await import('xlsx');
  const fileBuffer = fs.readFileSync(excelPath);
  const workbook = XLSX.read(fileBuffer);
  
  console.log(`📊 Total sheets: ${workbook.SheetNames.length}`);
  
  const allQuestions: ExcelQuestion[] = [];
  const allText: string[] = [];
  
  // Read all text from all sheets
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Collect all text from this sheet
    data.forEach(row => {
      row.forEach(cell => {
        if (cell) {
          const text = String(cell).trim();
          if (text.length > 0) {
            allText.push(text);
          }
        }
      });
    });
  }
  
  console.log(`📝 Total text entries collected: ${allText.length}`);
  console.log('\n🔍 Parsing questions...');
  
  // Now parse through all text to find questions
  const questionIds: string[] = [];
  const correctAnswers: string[] = [];
  const textLines: string[] = [];
  
  allText.forEach(line => {
    if (line.match(/^B-\d{3}-\d{3}-\d{3}$/)) {
      questionIds.push(line);
    } else if (line.match(/^\([A-D]\)$/)) {
      const match = line.match(/^\(([A-D])\)$/);
      if (match) correctAnswers.push(match[1]);
    } else if (!line.match(/^[A-D]$/)) {
      textLines.push(line);
    }
  });
  
  console.log(`   Question IDs found: ${questionIds.length}`);
  console.log(`   Correct answers found: ${correctAnswers.length}`);
  console.log(`   Text lines: ${textLines.length}`);
  
  // Match questions with their data
  const linesPerQuestion = Math.floor(textLines.length / questionIds.length);
  
  for (let i = 0; i < questionIds.length; i++) {
    const questionId = questionIds[i];
    const answerLetter = correctAnswers[i];
    
    if (!answerLetter) continue;
    
    const startIdx = i * linesPerQuestion;
    const endIdx = Math.min(startIdx + linesPerQuestion, textLines.length);
    const questionTextLines = textLines.slice(startIdx, endIdx);
    
    if (questionTextLines.length >= 5) {
      // Last line is typically the question, first 4 are options
      const questionText = questionTextLines[questionTextLines.length - 1];
      const options = questionTextLines.slice(0, 4);
      
      allQuestions.push({
        questionNumber: questionId,
        questionText: questionText || '',
        optionA: options[0] || '',
        optionB: options[1] || '',
        optionC: options[2] || '',
        optionD: options[3] || '',
        correctAnswer: answerLetter
      });
      
      if (allQuestions.length % 100 === 0) {
        console.log(`   ✅ Parsed ${allQuestions.length} questions...`);
      }
    }
  }
  
  console.log(`\n✅ Extracted ${allQuestions.length} questions`);
  return allQuestions;
}

async function validateAndImport(questions: ExcelQuestion[]) {
  console.log('\n🔍 Validating...');
  console.log(`   Total questions: ${questions.length}`);
  
  if (questions.length < 900) {
    console.log(`   ⚠️  Expected ~984, got ${questions.length}`);
  }
  
  // Show samples
  console.log('\n📋 Sample questions:');
  questions.slice(0, 2).forEach(q => {
    console.log(`\n${q.questionNumber} (Correct: ${q.correctAnswer}):`);
    console.log(`Q: ${q.questionText.substring(0, 70)}...`);
    console.log(`A: ${q.optionA.substring(0, 50)}...`);
  });
  
  console.log('\n💾 Importing to database...');
  
  await db.delete(examQuestions);
  
  const batchSize = 100;
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, Math.min(i + batchSize, questions.length));
    
    const insertData: InsertExamQuestion[] = batch.map(q => {
      const categoryCode = q.questionNumber.substring(0, 5);
      const category = CATEGORY_MAP[categoryCode] || 'technical';
      const correctAnswer = q.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
      
      return {
        question: q.questionText,
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
    
    if ((i + batch.length) % 200 === 0) {
      console.log(`   Inserted ${i + batch.length} questions...`);
    }
  }
  
  console.log(`\n✅ Imported ${questions.length} questions!`);
  console.log('\n⚠️  NOTE: Due to PDF conversion limitations, please verify question quality in the app.');
}

async function main() {
  try {
    const excelPath = '/tmp/official_questions.xlsx';
    
    if (!fs.existsSync(excelPath)) {
      console.error('❌ Excel file not found');
      process.exit(1);
    }
    
    console.log('🚀 Starting multi-sheet Excel import...\n');
    
    const questions = await parseExcelFile(excelPath);
    await validateAndImport(questions);
    
    console.log('\n🎉 Import complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

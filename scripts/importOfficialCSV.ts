import fs from 'fs';
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

function parseOfficialCSV(filePath: string): Question[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  const questions: Question[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('Question ID')) continue; // Skip header
    
    // Parse: QuestionID,QuestionText,OptA,OptB,OptC,OptD,Answer
    // Problem: options may contain commas (like $5,000)
    // Solution: Last field is always a single letter (A-D), and first field is always B-###-###-###
    
    // Extract question ID (first field before first comma)
    const idMatch = line.match(/^(B-\d{3}-\d{3}-\d{3}),/);
    if (!idMatch) continue;
    
    const questionId = idMatch[1];
    const rest = line.substring(questionId.length + 1); // Everything after "ID,"
    
    // Extract answer letter (last field, should be single letter A-D)
    const answerMatch = rest.match(/,([A-D])\s*$/);
    if (!answerMatch) {
      console.warn(`⚠️  Skipping ${questionId}: No valid answer found`);
      continue;
    }
    
    const answerLetter = answerMatch[1];
    const correctAnswer = answerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    
    // Everything between ID and answer letter
    const middle = rest.substring(0, rest.length - answerMatch[0].length);
    
    // Split middle into question + 4 options
    // We know structure: Question,OptA,OptB,OptC,OptD
    const parts = middle.split(',').map(p => p.trim());
    
    if (parts.length < 5) {
      console.warn(`⚠️  Skipping ${questionId}: Not enough fields (${parts.length})`);
      continue;
    }
    
    // First part is question text
    const questionText = parts[0];
    
    // Remaining parts are 4 options, but they might have been split by commas in dollar amounts
    // We need to reconstruct them into exactly 4 options
    const optionParts = parts.slice(1);
    const options: string[] = [];
    let currentOption = '';
    
    for (const part of optionParts) {
      if (currentOption === '') {
        currentOption = part;
      } else {
        currentOption += ',' + part;
      }
      
      // Check if this looks like a complete option:
      // - Doesn't end with a lone $ sign followed by digits
      // - OR ends with 3-4 digits (completing a $X,XXX pattern)
      const endsIncomplete = /\$\d{1,2}$/.test(currentOption);
      const endsComplete = /\d{3,4}$/.test(currentOption) && /\$\d+,\d{3,4}$/.test(currentOption);
      
      if (!endsIncomplete || endsComplete) {
        options.push(currentOption);
        currentOption = '';
      }
    }
    
    if (currentOption) {
      options.push(currentOption);
    }
    
    // Ensure we have exactly 4 options
    while (options.length < 4) options.push('');
    if (options.length > 4) {
      // Merge extras
      while (options.length > 4) {
        options[3] += ',' + options.pop();
      }
    }
    
    // Determine category
    const categoryCode = questionId.substring(0, 5);
    const category = CATEGORY_MAP[categoryCode] || 'technical';
    
    questions.push({
      questionNumber: questionId,
      question: questionText,
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
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
    console.log(`  ${q.questionNumber}: ${q.question.substring(0, 50)}...`);
    console.log(`    A) ${q.optionA.substring(0, 40)}...`);
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
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
  
  console.log('\n🎉 Import complete!');
}

const csvPath = process.argv[2] || '/tmp/official_import.csv';
importQuestions(csvPath).catch(console.error);

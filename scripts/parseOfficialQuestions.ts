import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
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

async function getAllText(): Promise<string> {
  const data = new Uint8Array(fs.readFileSync('attached_assets/amateur_basic_questions_en_2025-07-15_1762335694399.pdf'));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join('\n');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

function parseQuestions(text: string): Question[] {
  const questions: Question[] = [];
  const lines = text.split('\n').map(l => l.trim());
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Look for question ID: B-001-001-001     (A)
    const match = line.match(/^(B-\d{3}-\d{3}-\d{3})\s+\(([A-D])\)$/);
    
    if (match) {
      const questionNumber = match[1];
      const correctAnswerLetter = match[2];
      const correctAnswer = {'A': 0, 'B': 1, 'C': 2, 'D': 3}[correctAnswerLetter] || 0;
      
      // Determine category
      const prefix = questionNumber.substring(0, 5); // B-001
      const category = CATEGORY_MAP[prefix] || 'technical';
      
      i++; // Move past question ID line
      
      // Collect question text
      let questionText = '';
      while (i < lines.length && lines[i].length > 0 && !lines[i].match(/^A\s/)) {
        if (!lines[i].match(/^B-\d{3}/)) {
          questionText += lines[i] + ' ';
        }
        i++;
      }
      
      // Find and collect option A
      let optionA = '';
      if (i < lines.length && lines[i].match(/^A\s/)) {
        optionA = lines[i].substring(2).trim();
        i++;
        while (i < lines.length && lines[i].length > 0 && !lines[i].match(/^[B-D]\s/) && !lines[i].match(/^B-\d{3}/)) {
          optionA += ' ' + lines[i];
          i++;
        }
      }
      
      // Find and collect option B
      let optionB = '';
      if (i < lines.length && lines[i].match(/^B\s/)) {
        optionB = lines[i].substring(2).trim();
        i++;
        while (i < lines.length && lines[i].length > 0 && !lines[i].match(/^[C-D]\s/) && !lines[i].match(/^B-\d{3}/)) {
          optionB += ' ' + lines[i];
          i++;
        }
      }
      
      // Find and collect option C
      let optionC = '';
      if (i < lines.length && lines[i].match(/^C\s/)) {
        optionC = lines[i].substring(2).trim();
        i++;
        while (i < lines.length && lines[i].length > 0 && !lines[i].match(/^D\s/) && !lines[i].match(/^B-\d{3}/)) {
          optionC += ' ' + lines[i];
          i++;
        }
      }
      
      // Find and collect option D
      let optionD = '';
      if (i < lines.length && lines[i].match(/^D\s/)) {
        optionD = lines[i].substring(2).trim();
        i++;
        while (i < lines.length && lines[i].length > 0 && !lines[i].match(/^[A-D]\s/) && !lines[i].match(/^B-\d{3}/)) {
          optionD += ' ' + lines[i];
          i++;
        }
      }
      
      // Clean up
      questionText = questionText.trim();
      optionA = optionA.trim();
      optionB = optionB.trim();
      optionC = optionC.trim();
      optionD = optionD.trim();
      
      // Only add if we have all parts
      if (questionText && optionA && optionB && optionC && optionD) {
        questions.push({
          questionNumber,
          question: questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer,
          category
        });
        
        if (questions.length <= 10 || questions.length % 100 === 0) {
          console.log(`✅ ${questionNumber}: ${questionText.substring(0, 60)}...`);
        }
      }
    } else {
      i++;
    }
  }
  
  return questions;
}

async function importToDatabase(questions: Question[]) {
  console.log('\n💾 Clearing existing questions...');
  await db.delete(examQuestions);
  
  console.log('💾 Importing to database...');
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
  
  console.log(`\n✅ Successfully imported ${questions.length} official ISED Canada questions!`);
  
  // Show category breakdown
  const categoryCount: Record<string, number> = {};
  questions.forEach(q => {
    categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
  });
  
  console.log('\n📊 Questions by category:');
  Object.entries(categoryCount).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
}

async function main() {
  console.log('📄 Reading official ISED Canada PDF...\n');
  
  const text = await getAllText();
  console.log('📝 Parsing questions...\n');
  
  const questions = parseQuestions(text);
  console.log(`\n✅ Extracted ${questions.length} questions`);
  
  if (questions.length > 0) {
    await importToDatabase(questions);
    console.log('\n🎉 Done!');
  } else {
    console.log('\n❌ No questions found - check the parsing logic');
  }
}

main().catch(console.error);

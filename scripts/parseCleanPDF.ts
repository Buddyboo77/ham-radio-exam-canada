import fs from 'fs';
import { createRequire } from 'module';
import { db } from '../server/db';
import { examQuestions } from '../shared/schema';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

interface Question {
  questionNumber: string;
  correctAnswer: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

async function parseOfficialPDF() {
  console.log('📄 Reading PDF...');
  const dataBuffer = fs.readFileSync('attached_assets/amateur_basic_questions_en_2025-07-15_1762335694399.pdf');
  const data = await pdf(dataBuffer);
  
  console.log('📝 Parsing questions...');
  const text = data.text;
  const lines = text.split('\n');
  
  const questions: Question[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Look for question ID pattern: B-001-001-001     (A)
    const match = line.match(/^(B-\d{3}-\d{3}-\d{3})\s+\(([A-D])\)$/);
    
    if (match) {
      const questionNumber = match[1];
      const correctAnswerLetter = match[2];
      const correctAnswer = correctAnswerLetter === 'A' ? 0 : 
                           correctAnswerLetter === 'B' ? 1 : 
                           correctAnswerLetter === 'C' ? 2 : 3;
      
      i++; // Move to question text
      
      // Collect question text until we hit option A
      let questionText = '';
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        if (currentLine.match(/^A\s{3}/)) {
          break;
        }
        if (currentLine.length > 0) {
          questionText += currentLine + ' ';
        }
        i++;
      }
      
      // Get option A
      let optionA = '';
      if (i < lines.length && lines[i].trim().match(/^A\s{3}/)) {
        optionA = lines[i].trim().substring(4).trim(); // Remove "A   "
        i++;
        while (i < lines.length && !lines[i].trim().match(/^[B-D]\s{3}/) && !lines[i].trim().match(/^B-\d{3}/)) {
          const currentLine = lines[i].trim();
          if (currentLine.length > 0) {
            optionA += ' ' + currentLine;
          }
          i++;
        }
      }
      
      // Get option B
      let optionB = '';
      if (i < lines.length && lines[i].trim().match(/^B\s{3}/)) {
        optionB = lines[i].trim().substring(4).trim();
        i++;
        while (i < lines.length && !lines[i].trim().match(/^[C-D]\s{3}/) && !lines[i].trim().match(/^B-\d{3}/)) {
          const currentLine = lines[i].trim();
          if (currentLine.length > 0) {
            optionB += ' ' + currentLine;
          }
          i++;
        }
      }
      
      // Get option C
      let optionC = '';
      if (i < lines.length && lines[i].trim().match(/^C\s{3}/)) {
        optionC = lines[i].trim().substring(4).trim();
        i++;
        while (i < lines.length && !lines[i].trim().match(/^D\s{3}/) && !lines[i].trim().match(/^B-\d{3}/)) {
          const currentLine = lines[i].trim();
          if (currentLine.length > 0) {
            optionC += ' ' + currentLine;
          }
          i++;
        }
      }
      
      // Get option D
      let optionD = '';
      if (i < lines.length && lines[i].trim().match(/^D\s{3}/)) {
        optionD = lines[i].trim().substring(4).trim();
        i++;
        while (i < lines.length && !lines[i].trim().match(/^[A-D]\s{3}/) && !lines[i].trim().match(/^B-\d{3}/)) {
          const currentLine = lines[i].trim();
          if (currentLine.length > 0) {
            optionD += ' ' + currentLine;
          }
          i++;
        }
      }
      
      // Clean up text
      questionText = questionText.trim();
      optionA = optionA.trim();
      optionB = optionB.trim();
      optionC = optionC.trim();
      optionD = optionD.trim();
      
      if (questionText && optionA && optionB && optionC && optionD) {
        questions.push({
          questionNumber,
          correctAnswer: correctAnswer.toString(),
          question: questionText,
          optionA,
          optionB,
          optionC,
          optionD
        });
        
        console.log(`✅ ${questionNumber}: ${questionText.substring(0, 50)}...`);
      }
    } else {
      i++;
    }
  }
  
  console.log(`\n✅ Total questions extracted: ${questions.length}`);
  
  // Map to categories based on question number pattern
  const categoryMap: Record<string, string> = {
    '001': 'regulations',
    '002': 'regulations', 
    '003': 'regulations',
    '004': 'operating',
    '005': 'operating',
    '006': 'technical',
    '007': 'technical',
    '008': 'antenna',
    '009': 'safety',
  };
  
  console.log('\n💾 Clearing existing questions...');
  await db.delete(examQuestions);
  
  console.log('💾 Importing to database...');
  for (const q of questions) {
    const section = q.questionNumber.split('-')[1];
    const category = categoryMap[section] || 'technical';
    
    await db.insert(examQuestions).values({
      questionNumber: q.questionNumber,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: parseInt(q.correctAnswer),
      category,
      explanation: null
    });
  }
  
  console.log(`✅ Imported ${questions.length} official questions!`);
  console.log('🎉 Done!');
}

parseOfficialPDF().catch(console.error);

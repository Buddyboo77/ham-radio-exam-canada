import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
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

interface TextItem {
  text: string;
  x: number;
  y: number;
}

interface Question {
  number: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

async function extractWithCoordinates() {
  console.log('📄 Loading PDF with coordinate extraction...');
  
  const data = new Uint8Array(fs.readFileSync('attached_assets/amateur_basic_questions_en_2025-07-15_1762335694399.pdf'));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  
  console.log(`📊 PDF has ${pdf.numPages} pages`);
  
  const allQuestions: Question[] = [];
  
  // Process all pages after the foreword (starting around page 3)
  for (let pageNum = 3; pageNum <= pdf.numPages; pageNum++) {
    console.log(`\nProcessing page ${pageNum}...`);
    
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Extract items with positions
    const items: TextItem[] = textContent.items
      .filter((item: any) => item.str && item.str.trim().length > 0)
      .map((item: any) => ({
        text: item.str.trim(),
        x: item.transform[4],
        y: item.transform[5]
      }));
    
    // Group by approximate Y position (rows)
    const rows = new Map<number, TextItem[]>();
    items.forEach(item => {
      const roundedY = Math.round(item.y / 5) * 5; // Group items within 5 units
      if (!rows.has(roundedY)) {
        rows.set(roundedY, []);
      }
      rows.get(roundedY)!.push(item);
    });
    
    // Sort rows top to bottom
    const sortedRows = Array.from(rows.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([_, items]) => items.sort((a, b) => a.x - b.x));
    
    // Find median X to split left/right columns
    const allX = items.map(i => i.x);
    const medianX = allX.sort((a, b) => a - b)[Math.floor(allX.length / 2)];
    
    // Split into left and right columns
    const leftText: string[] = [];
    const rightText: string[] = [];
    
    sortedRows.forEach(row => {
      const leftItems = row.filter(item => item.x < medianX);
      const rightItems = row.filter(item => item.x >= medianX);
      
      if (leftItems.length > 0) {
        leftText.push(leftItems.map(i => i.text).join(' '));
      }
      if (rightItems.length > 0) {
        rightText.push(rightItems.map(i => i.text).join(' '));
      }
    });
    
    console.log(`  Left column lines: ${leftText.length}`);
    console.log(`  Right column lines: ${rightText.length}`);
    
    // Parse each column
    [leftText, rightText].forEach((columnLines, colIndex) => {
      let i = 0;
      while (i < columnLines.length) {
        const line = columnLines[i];
        
        // Look for question number with answer
        const match = line.match(/^(B-\d{3}-\d{3}-\d{3})\s+\(([A-D])\)/);
        if (match) {
          const questionNumber = match[1];
          const correctAnswerLetter = match[2];
          const correctAnswer = correctAnswerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
          
          i++;
          
          // Collect question text
          let questionText = '';
          while (i < columnLines.length && !columnLines[i].match(/^A\s+/)) {
            questionText += (questionText ? ' ' : '') + columnLines[i];
            i++;
          }
          
          // Collect options
          const options: string[] = [];
          for (let opt = 0; opt < 4; opt++) {
            if (i >= columnLines.length) break;
            
            const optMatch = columnLines[i].match(/^[A-D]\s+(.+)$/);
            if (optMatch) {
              options.push(optMatch[1]);
              i++;
            } else {
              break;
            }
          }
          
          if (options.length === 4 && questionText.length > 10) {
            allQuestions.push({
              number: questionNumber,
              text: questionText.trim(),
              options,
              correctAnswer
            });
            
            console.log(`  ✅ Found: ${questionNumber}`);
          }
        } else {
          i++;
        }
      }
    });
  }
  
  console.log(`\n✅ Total questions extracted: ${allQuestions.length}`);
  
  // Show samples
  if (allQuestions.length > 0) {
    console.log('\n📋 Sample questions:');
    allQuestions.slice(0, 2).forEach(q => {
      console.log(`\n${q.number} (Answer: ${String.fromCharCode(65 + q.correctAnswer)}):`);
      console.log(`Q: ${q.text.substring(0, 80)}...`);
      console.log(`A: ${q.options[0].substring(0, 50)}...`);
    });
  }
  
  return allQuestions;
}

async function main() {
  try {
    const questions = await extractWithCoordinates();
    
    if (questions.length === 0) {
      console.log('\n❌ No questions extracted - PDF parsing unsuccessful');
      process.exit(1);
    }
    
    console.log('\n💾 Importing to database...');
    
    await db.delete(examQuestions);
    
    const insertData = questions.map(q => {
      const categoryCode = q.number.substring(0, 5);
      const category = CATEGORY_MAP[categoryCode] || 'technical';
      
      return {
        question: q.text,
        optionA: q.options[0],
        optionB: q.options[1],
        optionC: q.options[2],
        optionD: q.options[3],
        correctAnswer: q.correctAnswer,
        explanation: null,
        category,
        subcategory: null,
        difficulty: 'basic' as const,
        examType: 'basic' as const,
        questionNumber: q.number,
        isActive: true
      };
    });
    
    await db.insert(examQuestions).values(insertData);
    
    console.log(`✅ Imported ${questions.length} questions!`);
    console.log('\n🎉 Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

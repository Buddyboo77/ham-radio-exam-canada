import fs from 'fs';

interface QuestionData {
  questionNumber: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

async function extractQuestionsFromPDF(pdfPath: string): Promise<QuestionData[]> {
  console.log('📄 Loading PDF...');
  
  const { PDFParse } = await import('pdf-parse');
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText();
  const text = data.text;
  
  console.log(`📊 PDF text length: ${text.length} characters`);
  
  const allQuestions: QuestionData[] = [];
  const pages = text.split(/-- \d+ of \d+ --/);
  
  console.log(`📄 Processing ${pages.length} pages...\n`);
  
  for (let pageNum = 0; pageNum < pages.length; pageNum++) {
    const pageText = pages[pageNum];
    const lines = pageText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Extract question IDs
    const questionIds: string[] = [];
    const correctAnswers: string[] = [];
    const otherLines: string[] = [];
    
    for (const line of lines) {
      if (line.match(/^B-\d{3}-\d{3}-\d{3}$/)) {
        questionIds.push(line);
      } else if (line.match(/^\([A-D]\)$/)) {
        correctAnswers.push(line.replace(/[()]/g, ''));
      } else if (!line.match(/^[A-D]$/)) {  // Skip standalone A, B, C, D markers
        otherLines.push(line);
      }
    }
    
    if (questionIds.length === 0) continue;
    
    const numQuestions = questionIds.length;
    const numOptions = numQuestions * 4; // 4 options per question
    
    // Split otherLines into options and questions
    // The options come first (4 per question), then questions
    const optionLines = otherLines.slice(0, numOptions);
    const questionLines = otherLines.slice(numOptions, numOptions + numQuestions);
    
    // Build questions
    for (let i = 0; i < numQuestions; i++) {
      if (i >= correctAnswers.length) break;
      
      const questionNumber = questionIds[i];
      const correctAnswer = correctAnswers[i];
      const questionText = questionLines[i] || '';
      
      // Get 4 options for this question
      const optionStart = i * 4;
      const options = optionLines.slice(optionStart, optionStart + 4);
      
      if (options.length === 4 && questionText) {
        allQuestions.push({
          questionNumber,
          questionText,
          optionA: options[0] || '',
          optionB: options[1] || '',
          optionC: options[2] || '',
          optionD: options[3] || '',
          correctAnswer
        });
      }
    }
    
    if ((pageNum + 1) % 20 === 0) {
      console.log(`✅ Processed ${pageNum + 1} pages, ${allQuestions.length} questions so far...`);
    }
  }
  
  console.log(`\n✅ Extracted ${allQuestions.length} questions from PDF`);
  return allQuestions;
}

async function validateExtraction(questions: QuestionData[]): Promise<boolean> {
  console.log('\n🔍 Validating extraction...');
  
  let valid = true;
  const issues: string[] = [];
  
  // Check total count
  if (questions.length !== 984) {
    issues.push(`Expected 984 questions, got ${questions.length}`);
    if (questions.length < 900) {
      valid = false; // Only fail if significantly off
    }
  }
  
  // Check for duplicate question numbers
  const questionNumbers = new Set<string>();
  const shortQuestions: string[] = [];
  const missingOptions: string[] = [];
  
  questions.forEach((q, idx) => {
    if (questionNumbers.has(q.questionNumber)) {
      issues.push(`Duplicate question number: ${q.questionNumber}`);
      valid = false;
    }
    questionNumbers.add(q.questionNumber);
    
    // Validate question has content
    if (q.questionText.length < 10) {
      shortQuestions.push(`${q.questionNumber}: "${q.questionText}"`);
    }
    
    // Validate all options have content
    if (!q.optionA || !q.optionB || !q.optionC || !q.optionD) {
      missingOptions.push(q.questionNumber);
    }
    
    // Validate correct answer
    if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
      issues.push(`Question ${q.questionNumber} has invalid correct answer: ${q.correctAnswer}`);
      valid = false;
    }
  });
  
  if (shortQuestions.length > 0) {
    issues.push(`${shortQuestions.length} questions have short text (possible parse errors)`);
    if (shortQuestions.length > 50) valid = false;
  }
  
  if (missingOptions.length > 0) {
    issues.push(`${missingOptions.length} questions have missing options`);
    if (missingOptions.length > 50) valid = false;
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️  Validation notes:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    
    if (shortQuestions.length > 0 && shortQuestions.length <= 10) {
      console.log('\n   Short questions:');
      shortQuestions.slice(0, 5).forEach(q => console.log(`     ${q}`));
    }
  }
  
  if (valid) {
    console.log('✅ Validation passed!');
  }
  
  return valid;
}

async function main() {
  try {
    const pdfPath = '/tmp/official_basic_questions.pdf';
    
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ PDF file not found at:', pdfPath);
      process.exit(1);
    }
    
    console.log('🚀 Starting PDF extraction with page-section parser...\n');
    
    const questions = await extractQuestionsFromPDF(pdfPath);
    
    const isValid = await validateExtraction(questions);
    
    // Save to JSON file
    const outputPath = '/tmp/official_questions.json';
    fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
    console.log(`\n💾 Saved ${questions.length} questions to: ${outputPath}`);
    
    // Show sample
    console.log('\n📋 Sample questions:');
    questions.slice(0, 3).forEach(q => {
      console.log(`\n${q.questionNumber} (Correct: ${q.correctAnswer}):`);
      console.log(`Q: ${q.questionText}`);
      console.log(`A: ${q.optionA}`);
      console.log(`B: ${q.optionB}`);
      console.log(`C: ${q.optionC}`);
      console.log(`D: ${q.optionD}`);
    });
    
    if (isValid) {
      console.log('\n✅ Extraction complete and validated!');
      console.log('📁 Ready to import: /tmp/official_questions.json');
      process.exit(0);
    } else {
      console.log('\n❌ Validation failed - please review extraction');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error during extraction:', error);
    process.exit(1);
  }
}

main();

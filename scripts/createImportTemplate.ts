import fs from 'fs';

async function createTemplate() {
  console.log('📄 Loading PDF to extract question IDs and answers...');
  
  const { PDFParse } = await import('pdf-parse');
  const dataBuffer = fs.readFileSync('/tmp/official_basic_questions.pdf');
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText();
  const text = data.text;
  
  const pages = text.split(/-- \d+ of \d+ --/);
  
  const questionData: Array<{id: string, answer: string}> = [];
  
  for (const pageText of pages) {
    const lines = pageText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const questionIds: string[] = [];
    const correctAnswers: string[] = [];
    
    for (const line of lines) {
      if (line.match(/^B-\d{3}-\d{3}-\d{3}$/)) {
        questionIds.push(line);
      } else if (line.match(/^\([A-D]\)$/)) {
        correctAnswers.push(line.replace(/[()]/g, ''));
      }
    }
    
    // Match them up
    for (let i = 0; i < Math.min(questionIds.length, correctAnswers.length); i++) {
      questionData.push({
        id: questionIds[i],
        answer: correctAnswers[i]
      });
    }
  }
  
  console.log(`✅ Found ${questionData.length} questions with IDs and answers`);
  
  // Create CSV template
  const csvLines = [
    'question_number,question_text,option_a,option_b,option_c,option_d,correct_answer'
  ];
  
  questionData.forEach(q => {
    csvLines.push(`${q.id},"[NEED QUESTION TEXT]","[OPTION A]","[OPTION B]","[OPTION C]","[OPTION D]",${q.answer}`);
  });
  
  const csvPath = '/tmp/question_template.csv';
  fs.writeFileSync(csvPath, csvLines.join('\n'));
  
  console.log(`\n💾 Created CSV template: ${csvPath}`);
  console.log(`📊 Template has ${questionData.length} rows`);
  console.log(`\n✅ Template is ready!`);
  console.log('\nNext steps:');
  console.log('1. Open the PDF and the CSV side-by-side');
  console.log('2. Fill in the question text and options for each question ID');
  console.log('3. Save the completed CSV');
  console.log('4. Import using the importFromCSV script');
}

createTemplate();

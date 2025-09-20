
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function exportQuestions() {
  try {
    console.log('Fetching questions from database...');
    
    const result = await sql`
      SELECT DISTINCT ON (question, category, correct_answer)
        question,
        option_a as optionA,
        option_b as optionB,
        option_c as optionC,
        option_d as optionD,
        correct_answer as correctAnswer,
        explanation,
        category
      FROM exam_questions 
      WHERE is_active = true 
      ORDER BY question, category, correct_answer, id
    `;
    
    const questions = result.map(q => ({
      question: q.question,
      options: [q.optiona, q.optionb, q.optionc, q.optiond],
      correctAnswer: q.correctanswer,
      explanation: q.explanation,
      category: q.category
    }));
    
    console.log(`Exporting ${questions.length} unique questions...`);
    
    const fs = require('fs');
    fs.writeFileSync('client/public/questions.json', JSON.stringify(questions, null, 2));
    
    console.log(`Successfully exported ${questions.length} questions to offline database!`);
    
    // Show breakdown by category
    const breakdown = {};
    questions.forEach(q => {
      breakdown[q.category] = (breakdown[q.category] || 0) + 1;
    });
    console.log('Questions by category:', breakdown);
    
  } catch (error) {
    console.error('Export failed:', error.message);
  }
}

exportQuestions();

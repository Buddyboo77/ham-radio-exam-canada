import OpenAI from 'openai';
import { db } from '../server/db';
import { examQuestions } from '../shared/schema';
import { isNull } from 'drizzle-orm';

// This is using Replit's AI Integrations service
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

async function testSingleQuestion() {
  // Fetch one question
  const questions = await db.select()
    .from(examQuestions)
    .where(isNull(examQuestions.explanation))
    .limit(1);
  
  if (questions.length === 0) {
    console.log('No questions found without explanations');
    return;
  }
  
  const q = questions[0];
  const correctOption = [q.optionA, q.optionB, q.optionC, q.optionD][q.correctAnswer];
  
  console.log('\n=== Test Question ===');
  console.log(`Question: ${q.question}`);
  console.log(`Correct Answer: ${String.fromCharCode(65 + q.correctAnswer)}) ${correctOption}\n`);
  
  const prompt = `You are an expert Canadian amateur radio instructor. Generate a clear, concise explanation for why the correct answer is right for this official ISED Canada exam question.

Question: ${q.question}
Options:
A) ${q.optionA}
B) ${q.optionB}
C) ${q.optionC}
D) ${q.optionD}

Correct Answer: ${String.fromCharCode(65 + q.correctAnswer)}) ${correctOption}

Provide a 1-2 sentence explanation that:
1. Explains WHY this answer is correct
2. Helps the student learn and understand the concept
3. Is factually accurate for Canadian amateur radio regulations and technical standards
4. Is concise and clear (2-3 sentences maximum)

Explanation:`;
  
  console.log('=== Making API Call ===');
  console.log(`Using baseURL: ${process.env.AI_INTEGRATIONS_OPENAI_BASE_URL}`);
  console.log(`API Key exists: ${!!process.env.AI_INTEGRATIONS_OPENAI_API_KEY}\n`);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for faster, more cost-effective generation
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 150,
    });
    
    console.log('=== API Response ===');
    console.log('Full response:', JSON.stringify(response, null, 2));
    console.log('\n=== Extracted Content ===');
    console.log('Content:', response.choices[0]?.message?.content);
    console.log('Content (trimmed):', response.choices[0]?.message?.content?.trim());
    console.log('Content length:', response.choices[0]?.message?.content?.length);
    
  } catch (error: any) {
    console.error('=== Error ===');
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

testSingleQuestion().catch(console.error);

import OpenAI from 'openai';
import pLimit from 'p-limit';
import { db } from '../server/db';
import { examQuestions } from '../shared/schema';
import { eq, isNull } from 'drizzle-orm';

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

interface Question {
  id: number;
  questionNumber: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: number;
  category: string;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateExplanation(q: Question): Promise<string> {
  const correctOption = [q.optionA, q.optionB, q.optionC, q.optionD][q.correctAnswer];
  
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

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using gpt-4o-mini for faster, more cost-effective explanation generation
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 150, // Keep explanations concise
  });
  
  return response.choices[0]?.message?.content?.trim() || "No explanation available.";
}

async function processQuestionWithRetry(q: Question, maxRetries = 5): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const explanation = await generateExplanation(q);
      
      // Update database
      await db.update(examQuestions)
        .set({ explanation })
        .where(eq(examQuestions.id, q.id));
      
      console.log(`✅ ${q.questionNumber}: Generated explanation`);
      return;
    } catch (error: any) {
      const isRateLimitError = error?.message?.includes("429") || 
                               error?.message?.toLowerCase().includes("rate limit");
      
      if (attempt === maxRetries) {
        console.error(`❌ ${q.questionNumber}: Failed after ${maxRetries} attempts:`, error.message);
        throw error;
      }
      
      if (isRateLimitError) {
        const backoffMs = Math.min(2000 * Math.pow(2, attempt - 1), 128000);
        console.log(`⚠️  ${q.questionNumber}: Rate limit, retry ${attempt}/${maxRetries} after ${backoffMs}ms`);
        await sleep(backoffMs);
      } else {
        console.error(`❌ ${q.questionNumber}: Error:`, error.message);
        throw error; // Don't retry non-rate-limit errors
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting explanation generation for official ISED questions...\n');
  
  // Fetch all questions without explanations
  const questions = await db.select()
    .from(examQuestions)
    .where(isNull(examQuestions.explanation));
  
  console.log(`📝 Found ${questions.length} questions needing explanations\n`);
  
  if (questions.length === 0) {
    console.log('✅ All questions already have explanations!');
    return;
  }
  
  console.log('⚙️  Processing with rate limiting (2 concurrent requests)...\n');
  
  // Process questions with rate limiting
  const limit = pLimit(2); // Process 2 requests concurrently
  const startTime = Date.now();
  let completed = 0;
  let failed = 0;
  
  const tasks = questions.map((q) =>
    limit(async () => {
      try {
        await processQuestionWithRetry(q as Question);
        completed++;
      } catch (error) {
        failed++;
      }
      
      // Progress update every 10 questions
      if ((completed + failed) % 10 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const total = completed + failed;
        const rate = (total / (Date.now() - startTime) * 1000).toFixed(2);
        const remaining = questions.length - total;
        const eta = (remaining / parseFloat(rate)).toFixed(0);
        console.log(`\n📊 Progress: ${total}/${questions.length} (${(total/questions.length*100).toFixed(1)}%) - Success: ${completed}, Failed: ${failed}`);
        console.log(`⏱️  Elapsed: ${elapsed}s | Rate: ${rate} q/s | ETA: ${eta}s\n`);
      }
    })
  );
  
  await Promise.all(tasks);
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 Complete! Generated ${completed} explanations in ${totalTime}s`);
  if (failed > 0) {
    console.log(`⚠️  ${failed} questions failed - you may need to re-run for those`);
  } else {
    console.log(`✅ All 984 official ISED questions now have educational explanations!`);
  }
}

main().catch(console.error);

import { useLocalStorage } from './use-local-storage';

// ================================================================
// CONFIGURATION — Edit these values to change behaviour
// ================================================================

/**
 * Number of recent tests used to calculate the Readiness Score.
 * Only the last N completed exams (of any type) are considered.
 */
export const READINESS_HISTORY_COUNT = 5;

/**
 * Weights applied to each of the last N tests.
 * Index 0 = oldest test, last index = most recent test.
 * Values should roughly sum to 1.0 (they are normalised automatically).
 * Increase the last values to give newer tests more influence.
 */
export const READINESS_WEIGHTS = [0.08, 0.12, 0.20, 0.25, 0.35];

/**
 * Full Exam attempts are multiplied by this bonus before weighting,
 * so they influence the score slightly more than category-only quizzes.
 * 1.2 = 20% bonus weight.
 */
export const FULL_EXAM_WEIGHT_BONUS = 1.2;

/**
 * Number of questions pulled for a Full Exam.
 * Change this single number to resize the Full Exam.
 */
export const FULL_EXAM_QUESTION_COUNT = 100;

/**
 * Minimum error rate (%) a topic must have to be listed as a Weak Topic.
 * E.g. 25 means the user got more than 25% of questions in that topic wrong.
 */
export const WEAK_TOPIC_THRESHOLD = 25;

/** Maximum number of weak topics shown on the dashboard and results screen. */
export const MAX_WEAK_TOPICS = 3;

// ================================================================

export interface ExamAttempt {
  id: string;
  date: string;              // ISO date string
  score: number;             // number of correct answers
  totalQuestions: number;
  percentage: number;        // 0-100
  category: string;          // 'all', 'regulations', etc.
  mode: 'practice' | 'simulation' | 'full-exam';
  timeTakenSeconds: number;
  incorrectByCategory: Record<string, number>; // category -> wrong count
  correctByCategory: Record<string, number>;   // category -> correct count
  isFullExam: boolean;
}

export interface WeakTopic {
  category: string;
  errorRate: number; // 0-100
}

export interface ReadinessResult {
  score: number;          // 0-100 weighted readiness score
  passProbability: number; // same value — chance of passing real exam
  weakTopics: WeakTopic[];
  examCount: number;      // how many exams fed into the calculation
  trend: 'improving' | 'declining' | 'stable' | 'not-enough-data';
}

// ================================================================
// FORMULA — Edit calculateReadinessScore() to change the math
// ================================================================

function calculateWeakTopics(attempts: ExamAttempt[]): WeakTopic[] {
  const errors: Record<string, number> = {};
  const totals: Record<string, number> = {};

  for (const attempt of attempts) {
    for (const [cat, wrong] of Object.entries(attempt.incorrectByCategory)) {
      errors[cat] = (errors[cat] || 0) + wrong;
      const correct = attempt.correctByCategory[cat] || 0;
      totals[cat] = (totals[cat] || 0) + wrong + correct;
    }
    for (const [cat, correct] of Object.entries(attempt.correctByCategory)) {
      if (!totals[cat]) {
        totals[cat] = correct;
      }
    }
  }

  return Object.entries(errors)
    .map(([category, wrong]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      errorRate: totals[category] > 0 ? Math.round((wrong / totals[category]) * 100) : 0
    }))
    .filter(t => t.errorRate >= WEAK_TOPIC_THRESHOLD)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, MAX_WEAK_TOPICS);
}

export function calculateReadinessScore(history: ExamAttempt[]): ReadinessResult {
  if (history.length === 0) {
    return {
      score: 0,
      passProbability: 0,
      weakTopics: [],
      examCount: 0,
      trend: 'not-enough-data'
    };
  }

  const recent = history.slice(-READINESS_HISTORY_COUNT);

  let weightedSum = 0;
  let totalWeight = 0;

  recent.forEach((attempt, i) => {
    // Map position in the recent slice to the weight array
    const weightIndex = READINESS_WEIGHTS.length - recent.length + i;
    const baseWeight = READINESS_WEIGHTS[Math.max(0, weightIndex)] ?? 0.1;
    const finalWeight = attempt.isFullExam ? baseWeight * FULL_EXAM_WEIGHT_BONUS : baseWeight;

    weightedSum += attempt.percentage * finalWeight;
    totalWeight += finalWeight;
  });

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  // Trend: compare average of newest half vs older half
  let trend: ReadinessResult['trend'] = 'not-enough-data';
  if (recent.length >= 3) {
    const half = Math.ceil(recent.length / 2);
    const latestAvg = recent.slice(-half).reduce((s, a) => s + a.percentage, 0) / half;
    const earlierAvg = recent.slice(0, -half).reduce((s, a) => s + a.percentage, 0) / (recent.length - half);
    if (latestAvg > earlierAvg + 3) trend = 'improving';
    else if (latestAvg < earlierAvg - 3) trend = 'declining';
    else trend = 'stable';
  }

  return {
    score,
    passProbability: score,
    weakTopics: calculateWeakTopics(recent),
    examCount: recent.length,
    trend
  };
}

export function useExamHistory() {
  const [history, setHistory] = useLocalStorage<ExamAttempt[]>('ham-app-exam-history', []);

  const addExamAttempt = (attempt: Omit<ExamAttempt, 'id' | 'date'>) => {
    const newAttempt: ExamAttempt = {
      ...attempt,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    setHistory(prev => [...(prev ?? []), newAttempt]);
    return newAttempt;
  };

  const clearHistory = () => setHistory([]);

  const readiness = calculateReadinessScore(history ?? []);

  return {
    history: history ?? [],
    addExamAttempt,
    clearHistory,
    readiness
  };
}

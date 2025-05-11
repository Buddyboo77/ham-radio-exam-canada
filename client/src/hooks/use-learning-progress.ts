import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

export interface LearningProgress {
  // Quiz progress
  completedQuizzes: number;
  totalCorrect: number;
  totalQuestions: number;
  quizzesByCategory: Record<string, {
    completed: number;
    correct: number;
    total: number;
    lastScore: number;
  }>;
  
  // Flashcard progress
  flashcardsReviewed: number;
  flashcardMastery: Record<string, 'new' | 'learning' | 'review' | 'mastered'>;
  flashcardsByCategory: Record<string, {
    reviewed: number;
    mastered: number;
  }>;
  
  // Morse Code progress
  morseHighestWPM: number;
  morseAccuracy: number;
  morseLessonsCompleted: number;
  
  // Achievement badges
  badges: {
    id: string;
    name: string;
    description: string;
    acquired: boolean;
    date?: string;
  }[];
  
  // Study streak
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

const defaultBadges = [
  {
    id: 'first-quiz',
    name: 'First Steps',
    description: 'Completed your first practice exam',
    acquired: false
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Achieved 100% on a practice exam',
    acquired: false
  },
  {
    id: 'study-streak-7',
    name: 'Consistent Learner',
    description: 'Maintained a 7-day study streak',
    acquired: false
  },
  {
    id: 'morse-10wpm',
    name: 'Morse Apprentice',
    description: 'Reached 10 WPM in Morse code',
    acquired: false
  },
  {
    id: 'flashcard-master',
    name: 'Flashcard Master',
    description: 'Mastered 50 flashcards',
    acquired: false
  },
  {
    id: 'technical-expert',
    name: 'Technical Expert',
    description: 'Scored above 90% on Technical exam',
    acquired: false
  },
  {
    id: 'regulations-expert',
    name: 'Regulations Expert',
    description: 'Scored above 90% on Regulations exam',
    acquired: false
  },
  {
    id: 'operating-expert',
    name: 'Operating Expert',
    description: 'Scored above 90% on Operating exam',
    acquired: false
  },
  {
    id: 'all-rounder',
    name: 'All-Rounder',
    description: 'Earned at least one badge in each category',
    acquired: false
  },
  {
    id: 'exam-ready',
    name: 'Exam Ready',
    description: 'Passed 5 full practice exams with 80%+',
    acquired: false
  },
];

const initialProgress: LearningProgress = {
  completedQuizzes: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  quizzesByCategory: {
    all: { completed: 0, correct: 0, total: 0, lastScore: 0 },
    regulations: { completed: 0, correct: 0, total: 0, lastScore: 0 },
    technical: { completed: 0, correct: 0, total: 0, lastScore: 0 },
    operating: { completed: 0, correct: 0, total: 0, lastScore: 0 }
  },
  
  flashcardsReviewed: 0,
  flashcardMastery: {},
  flashcardsByCategory: {
    all: { reviewed: 0, mastered: 0 },
    regulations: { reviewed: 0, mastered: 0 },
    technical: { reviewed: 0, mastered: 0 },
    operating: { reviewed: 0, mastered: 0 }
  },
  
  morseHighestWPM: 0,
  morseAccuracy: 0,
  morseLessonsCompleted: 0,
  
  badges: defaultBadges,
  
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null
};

export function useLearningProgress() {
  const [progress, setProgress] = useLocalStorage<LearningProgress>('learning-progress', initialProgress);
  
  // Update streak when component mounts
  useEffect(() => {
    updateStreak();
  }, []);
  
  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (progress.lastStudyDate === today) {
      // Already logged today
      return;
    }
    
    const lastDate = progress.lastStudyDate ? new Date(progress.lastStudyDate) : null;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    setProgress(prev => {
      let newStreak = prev.currentStreak;
      
      // If last study was yesterday, increment streak
      if (prev.lastStudyDate === yesterdayString) {
        newStreak += 1;
      } 
      // If more than a day has passed, reset streak
      else if (prev.lastStudyDate && prev.lastStudyDate !== today) {
        newStreak = 1;
      } 
      // First time studying
      else if (!prev.lastStudyDate) {
        newStreak = 1;
      }
      
      const newLongestStreak = Math.max(prev.longestStreak, newStreak);
      
      // Check if streak badge should be awarded
      const updatedBadges = [...prev.badges];
      const streakBadge = updatedBadges.find(b => b.id === 'study-streak-7');
      if (streakBadge && !streakBadge.acquired && newStreak >= 7) {
        streakBadge.acquired = true;
        streakBadge.date = today;
      }
      
      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastStudyDate: today,
        badges: updatedBadges
      };
    });
  };
  
  const recordQuizCompletion = (category: string, correct: number, total: number) => {
    updateStreak();
    
    const score = Math.round((correct / total) * 100);
    const today = new Date().toISOString().split('T')[0];
    
    setProgress(prev => {
      const updatedQuizzesByCategory = { ...prev.quizzesByCategory };
      
      // Update specific category
      if (updatedQuizzesByCategory[category]) {
        updatedQuizzesByCategory[category] = {
          completed: updatedQuizzesByCategory[category].completed + 1,
          correct: updatedQuizzesByCategory[category].correct + correct,
          total: updatedQuizzesByCategory[category].total + total,
          lastScore: score
        };
      } else {
        updatedQuizzesByCategory[category] = {
          completed: 1,
          correct,
          total,
          lastScore: score
        };
      }
      
      // Also update 'all' category
      updatedQuizzesByCategory.all = {
        completed: updatedQuizzesByCategory.all.completed + 1,
        correct: updatedQuizzesByCategory.all.correct + correct,
        total: updatedQuizzesByCategory.all.total + total,
        lastScore: score
      };
      
      // Check for badges
      const updatedBadges = [...prev.badges];
      
      // First quiz badge
      const firstQuizBadge = updatedBadges.find(b => b.id === 'first-quiz');
      if (firstQuizBadge && !firstQuizBadge.acquired) {
        firstQuizBadge.acquired = true;
        firstQuizBadge.date = today;
      }
      
      // Perfect score badge
      const perfectBadge = updatedBadges.find(b => b.id === 'perfect-score');
      if (perfectBadge && !perfectBadge.acquired && score === 100) {
        perfectBadge.acquired = true;
        perfectBadge.date = today;
      }
      
      // Category expert badges
      if (score >= 90 && total >= 10) {
        const categoryBadgeMap: Record<string, string> = {
          technical: 'technical-expert',
          regulations: 'regulations-expert',
          operating: 'operating-expert'
        };
        
        if (categoryBadgeMap[category]) {
          const expertBadge = updatedBadges.find(b => b.id === categoryBadgeMap[category]);
          if (expertBadge && !expertBadge.acquired) {
            expertBadge.acquired = true;
            expertBadge.date = today;
          }
        }
      }
      
      // Exam Ready badge
      let fullExamsWithGoodScore = 0;
      Object.values(updatedQuizzesByCategory).forEach(catStats => {
        if (catStats.completed >= 5 && catStats.correct / catStats.total >= 0.8) {
          fullExamsWithGoodScore++;
        }
      });
      
      const examReadyBadge = updatedBadges.find(b => b.id === 'exam-ready');
      if (examReadyBadge && !examReadyBadge.acquired && fullExamsWithGoodScore >= 1) {
        examReadyBadge.acquired = true;
        examReadyBadge.date = today;
      }
      
      // Check for All-Rounder badge
      const technicalBadge = updatedBadges.find(b => b.id === 'technical-expert');
      const regulationsBadge = updatedBadges.find(b => b.id === 'regulations-expert');
      const operatingBadge = updatedBadges.find(b => b.id === 'operating-expert');
      
      if (technicalBadge?.acquired && regulationsBadge?.acquired && operatingBadge?.acquired) {
        const allRounderBadge = updatedBadges.find(b => b.id === 'all-rounder');
        if (allRounderBadge && !allRounderBadge.acquired) {
          allRounderBadge.acquired = true;
          allRounderBadge.date = today;
        }
      }
      
      return {
        ...prev,
        completedQuizzes: prev.completedQuizzes + 1,
        totalCorrect: prev.totalCorrect + correct,
        totalQuestions: prev.totalQuestions + total,
        quizzesByCategory: updatedQuizzesByCategory,
        badges: updatedBadges
      };
    });
  };
  
  const recordFlashcardReview = (id: string, category: string, mastery: 'new' | 'learning' | 'review' | 'mastered') => {
    updateStreak();
    
    const today = new Date().toISOString().split('T')[0];
    
    setProgress(prev => {
      const currentMastery = prev.flashcardMastery[id] || 'new';
      const becameMastered = mastery === 'mastered' && currentMastery !== 'mastered';
      
      const updatedFlashcardMastery = { 
        ...prev.flashcardMastery,
        [id]: mastery
      };
      
      const updatedFlashcardsByCategory = { ...prev.flashcardsByCategory };
      
      // Update category stats
      if (updatedFlashcardsByCategory[category]) {
        updatedFlashcardsByCategory[category] = {
          reviewed: updatedFlashcardsByCategory[category].reviewed + 1,
          mastered: updatedFlashcardsByCategory[category].mastered + (becameMastered ? 1 : 0)
        };
      } else {
        updatedFlashcardsByCategory[category] = {
          reviewed: 1,
          mastered: becameMastered ? 1 : 0
        };
      }
      
      // Also update 'all' category
      updatedFlashcardsByCategory.all = {
        reviewed: updatedFlashcardsByCategory.all.reviewed + 1,
        mastered: updatedFlashcardsByCategory.all.mastered + (becameMastered ? 1 : 0)
      };
      
      // Check for flashcard master badge
      const updatedBadges = [...prev.badges];
      const flashcardMasterBadge = updatedBadges.find(b => b.id === 'flashcard-master');
      
      const totalMastered = Object.values(updatedFlashcardMastery).filter(m => m === 'mastered').length;
      if (flashcardMasterBadge && !flashcardMasterBadge.acquired && totalMastered >= 50) {
        flashcardMasterBadge.acquired = true;
        flashcardMasterBadge.date = today;
      }
      
      return {
        ...prev,
        flashcardsReviewed: prev.flashcardsReviewed + 1,
        flashcardMastery: updatedFlashcardMastery,
        flashcardsByCategory: updatedFlashcardsByCategory,
        badges: updatedBadges
      };
    });
  };
  
  const recordMorseProgress = (wpm: number, accuracy: number, lessonCompleted: boolean) => {
    updateStreak();
    
    const today = new Date().toISOString().split('T')[0];
    
    setProgress(prev => {
      const highestWPM = Math.max(prev.morseHighestWPM, wpm);
      let lessonsCompleted = prev.morseLessonsCompleted;
      if (lessonCompleted) {
        lessonsCompleted += 1;
      }
      
      // Update accuracy as a weighted average
      const newAccuracy = prev.morseAccuracy > 0
        ? (prev.morseAccuracy * 0.7) + (accuracy * 0.3)  // 70% old value, 30% new value
        : accuracy;
      
      // Check for Morse badge
      const updatedBadges = [...prev.badges];
      const morseBadge = updatedBadges.find(b => b.id === 'morse-10wpm');
      if (morseBadge && !morseBadge.acquired && highestWPM >= 10) {
        morseBadge.acquired = true;
        morseBadge.date = today;
      }
      
      return {
        ...prev,
        morseHighestWPM: highestWPM,
        morseAccuracy: newAccuracy,
        morseLessonsCompleted: lessonsCompleted,
        badges: updatedBadges
      };
    });
  };
  
  const resetProgress = () => {
    setProgress(initialProgress);
  };
  
  const getNextRecommendation = (): {
    type: 'quiz' | 'flashcard' | 'morse';
    category?: string;
    reason: string;
  } => {
    // Basic recommendation algorithm based on weakest areas
    const quizAvgs: Record<string, number> = {};
    
    // Calculate quiz averages by category
    Object.entries(progress.quizzesByCategory).forEach(([category, stats]) => {
      if (stats.total > 0) {
        quizAvgs[category] = stats.correct / stats.total;
      } else {
        quizAvgs[category] = 0;
      }
    });
    
    // Find weakest quiz category
    let weakestCategory = 'all';
    let lowestScore = 1;
    
    Object.entries(quizAvgs).forEach(([category, avg]) => {
      if (category !== 'all' && (avg < lowestScore || lowestScore === 1)) {
        weakestCategory = category;
        lowestScore = avg;
      }
    });
    
    // If user has very low flashcard mastery, recommend flashcards
    const masteredCount = Object.values(progress.flashcardMastery).filter(m => m === 'mastered').length;
    const totalFlashcards = 50; // Approximate number of flashcards
    
    if (masteredCount < totalFlashcards * 0.3) { // Less than 30% mastered
      return {
        type: 'flashcard',
        reason: 'You have many flashcards to master yet.'
      };
    }
    
    // If morse progress is low, recommend it occasionally
    if (progress.morseHighestWPM < 10 && Math.random() > 0.7) {
      return {
        type: 'morse',
        reason: 'Practice Morse code to improve your speed.'
      };
    }
    
    // Default to quiz in weakest category
    return {
      type: 'quiz',
      category: weakestCategory,
      reason: `You could improve your knowledge in ${weakestCategory.charAt(0).toUpperCase() + weakestCategory.slice(1)}.`
    };
  };
  
  return {
    progress,
    recordQuizCompletion,
    recordFlashcardReview,
    recordMorseProgress,
    updateStreak,
    resetProgress,
    getNextRecommendation
  };
}
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

const initialBadges = [
  {
    id: 'first-quiz',
    name: 'Quiz Novice',
    description: 'Complete your first practice quiz',
    acquired: false
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Score 100% on a quiz with at least 10 questions',
    acquired: false
  },
  {
    id: 'technical-expert',
    name: 'Technical Expert',
    description: 'Score at least 80% on a technical category quiz',
    acquired: false
  },
  {
    id: 'regulations-expert',
    name: 'Regulations Expert',
    description: 'Score at least 80% on a regulations category quiz',
    acquired: false
  },
  {
    id: 'operating-expert',
    name: 'Operating Expert',
    description: 'Score at least 80% on an operating category quiz',
    acquired: false
  },
  {
    id: 'flashcard-starter',
    name: 'Flashcard Starter',
    description: 'Review your first 10 flashcards',
    acquired: false
  },
  {
    id: 'memory-master',
    name: 'Memory Master',
    description: 'Master at least 20 flashcards',
    acquired: false
  },
  {
    id: 'morse-beginner',
    name: 'Morse Beginner',
    description: 'Complete your first Morse code lesson',
    acquired: false
  },
  {
    id: 'morse-expert',
    name: 'Morse Expert',
    description: 'Achieve a speed of at least 10 WPM with 90% accuracy',
    acquired: false
  },
  {
    id: 'circuit-builder',
    name: 'Circuit Builder',
    description: 'Successfully build your first working circuit',
    acquired: false
  },
  {
    id: 'ham-dedication',
    name: 'Ham Dedication',
    description: 'Maintain a study streak of at least 5 days',
    acquired: false
  },
  {
    id: 'exam-ready',
    name: 'Exam Ready',
    description: 'Pass a full 100-question practice exam with at least 80%',
    acquired: false
  }
];

const initialProgress: LearningProgress = {
  completedQuizzes: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  quizzesByCategory: {
    all: { completed: 0, correct: 0, total: 0, lastScore: 0 },
    technical: { completed: 0, correct: 0, total: 0, lastScore: 0 },
    regulations: { completed: 0, correct: 0, total: 0, lastScore: 0 },
    operating: { completed: 0, correct: 0, total: 0, lastScore: 0 }
  },
  
  flashcardsReviewed: 0,
  flashcardMastery: {},
  flashcardsByCategory: {
    technical: { reviewed: 0, mastered: 0 },
    regulations: { reviewed: 0, mastered: 0 },
    operating: { reviewed: 0, mastered: 0 }
  },
  
  morseHighestWPM: 0,
  morseAccuracy: 0,
  morseLessonsCompleted: 0,
  
  badges: initialBadges,
  
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null
};

export function useLearningProgress() {
  const [progress, setProgress] = useLocalStorage<LearningProgress>(
    'ham-radio-learning-progress',
    initialProgress
  );
  
  // Check and update streak on component mount
  useEffect(() => {
    updateStreak();
  }, []);
  
  // Record that studying occurred today and update streak
  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (progress.lastStudyDate === today) {
      // Already recorded today's activity
      return;
    }
    
    setProgress(prev => {
      // Check if last study date was yesterday
      let newStreak = prev.currentStreak;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      if (prev.lastStudyDate === yesterdayString) {
        // Continue streak
        newStreak += 1;
      } else if (prev.lastStudyDate !== today) {
        // Broke streak, start over
        newStreak = 1;
      }
      
      // Update longest streak if current streak is longer
      const newLongestStreak = Math.max(newStreak, prev.longestStreak);
      
      // Check badge for streak
      const updatedBadges = [...prev.badges];
      const streakBadge = updatedBadges.find(b => b.id === 'ham-dedication');
      if (streakBadge && !streakBadge.acquired && newStreak >= 5) {
        const badgeIndex = updatedBadges.findIndex(b => b.id === 'ham-dedication');
        updatedBadges[badgeIndex] = {
          ...streakBadge,
          acquired: true,
          date: today
        };
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
  
  // Record quiz completion
  const recordQuizCompletion = (category: string, correct: number, total: number) => {
    updateStreak(); // Count this as a study day
    
    setProgress(prev => {
      // Normalize category string
      const normCategory = category.toLowerCase();
      
      // Get existing category stats or create new ones
      const allCatStats = prev.quizzesByCategory.all || { 
        completed: 0, correct: 0, total: 0, lastScore: 0 
      };
      const catStats = prev.quizzesByCategory[normCategory] || { 
        completed: 0, correct: 0, total: 0, lastScore: 0 
      };
      
      // Calculate percentage for badge purposes
      const percentage = (correct / total) * 100;
      
      // Update badges based on quiz performance
      const updatedBadges = [...prev.badges];
      const today = new Date().toISOString().split('T')[0];
      
      // First quiz badge
      if (prev.completedQuizzes === 0) {
        const badgeIndex = updatedBadges.findIndex(b => b.id === 'first-quiz');
        if (badgeIndex !== -1 && !updatedBadges[badgeIndex].acquired) {
          updatedBadges[badgeIndex] = {
            ...updatedBadges[badgeIndex],
            acquired: true,
            date: today
          };
        }
      }
      
      // Perfect score badge
      if (percentage === 100 && total >= 10) {
        const badgeIndex = updatedBadges.findIndex(b => b.id === 'quiz-master');
        if (badgeIndex !== -1 && !updatedBadges[badgeIndex].acquired) {
          updatedBadges[badgeIndex] = {
            ...updatedBadges[badgeIndex],
            acquired: true,
            date: today
          };
        }
      }
      
      // Category expert badges
      if (percentage >= 80 && total >= 5) {
        if (normCategory === 'technical') {
          const badgeIndex = updatedBadges.findIndex(b => b.id === 'technical-expert');
          if (badgeIndex !== -1 && !updatedBadges[badgeIndex].acquired) {
            updatedBadges[badgeIndex] = {
              ...updatedBadges[badgeIndex],
              acquired: true,
              date: today
            };
          }
        } else if (normCategory === 'regulations') {
          const badgeIndex = updatedBadges.findIndex(b => b.id === 'regulations-expert');
          if (badgeIndex !== -1 && !updatedBadges[badgeIndex].acquired) {
            updatedBadges[badgeIndex] = {
              ...updatedBadges[badgeIndex],
              acquired: true,
              date: today
            };
          }
        } else if (normCategory === 'operating') {
          const badgeIndex = updatedBadges.findIndex(b => b.id === 'operating-expert');
          if (badgeIndex !== -1 && !updatedBadges[badgeIndex].acquired) {
            updatedBadges[badgeIndex] = {
              ...updatedBadges[badgeIndex],
              acquired: true,
              date: today
            };
          }
        }
      }
      
      // Full exam badge
      if (total === 100 && percentage >= 80) {
        const badgeIndex = updatedBadges.findIndex(b => b.id === 'exam-ready');
        if (badgeIndex !== -1 && !updatedBadges[badgeIndex].acquired) {
          updatedBadges[badgeIndex] = {
            ...updatedBadges[badgeIndex],
            acquired: true,
            date: today
          };
        }
      }
      
      // Update quiz category stats
      const updatedCategoryStats = {
        ...prev.quizzesByCategory,
        [normCategory]: {
          completed: catStats.completed + 1,
          correct: catStats.correct + correct,
          total: catStats.total + total,
          lastScore: percentage
        },
        all: {
          completed: allCatStats.completed + 1,
          correct: allCatStats.correct + correct,
          total: allCatStats.total + total,
          lastScore: percentage
        }
      };
      
      return {
        ...prev,
        completedQuizzes: prev.completedQuizzes + 1,
        totalCorrect: prev.totalCorrect + correct,
        totalQuestions: prev.totalQuestions + total,
        quizzesByCategory: updatedCategoryStats,
        badges: updatedBadges
      };
    });
  };
  
  // Record flashcard review
  const recordFlashcardReview = (cardId: string, status: 'new' | 'learning' | 'review' | 'mastered', category: string) => {
    updateStreak(); // Count this as a study day
    
    setProgress(prev => {
      // Check if this is the first time we've seen this card
      const isNewReview = !prev.flashcardMastery[cardId];
      
      // Update flashcard mastery status
      const updatedMastery = {
        ...prev.flashcardMastery,
        [cardId]: status
      };
      
      // Get existing category stats
      const normCategory = category.toLowerCase();
      const categoryStats = prev.flashcardsByCategory[normCategory] || { reviewed: 0, mastered: 0 };
      
      // Count new mastered cards for category
      const wasMastered = prev.flashcardMastery[cardId] === 'mastered';
      const isMastered = status === 'mastered';
      const masteredChange = isMastered && !wasMastered ? 1 : 0;
      
      // Update category stats
      const updatedCategoryStats = {
        ...prev.flashcardsByCategory,
        [normCategory]: {
          reviewed: isNewReview ? categoryStats.reviewed + 1 : categoryStats.reviewed,
          mastered: categoryStats.mastered + masteredChange
        }
      };
      
      // Count total mastered cards
      const totalMastered = Object.values(updatedMastery).filter(s => s === 'mastered').length;
      
      // Update badges
      const updatedBadges = [...prev.badges];
      const today = new Date().toISOString().split('T')[0];
      
      // Flashcard starter badge
      if (prev.flashcardsReviewed === 9 && isNewReview) {
        const badgeIndex = updatedBadges.findIndex(b => b.id === 'flashcard-starter');
        if (badgeIndex !== -1 && !updatedBadges[badgeIndex].acquired) {
          updatedBadges[badgeIndex] = {
            ...updatedBadges[badgeIndex],
            acquired: true,
            date: today
          };
        }
      }
      
      // Memory master badge
      if (totalMastered >= 20 && prev.badges.find(b => b.id === 'memory-master' && !b.acquired)) {
        const badgeIndex = updatedBadges.findIndex(b => b.id === 'memory-master');
        if (badgeIndex !== -1) {
          updatedBadges[badgeIndex] = {
            ...updatedBadges[badgeIndex],
            acquired: true,
            date: today
          };
        }
      }
      
      return {
        ...prev,
        flashcardsReviewed: isNewReview ? prev.flashcardsReviewed + 1 : prev.flashcardsReviewed,
        flashcardMastery: updatedMastery,
        flashcardsByCategory: updatedCategoryStats,
        badges: updatedBadges
      };
    });
  };
  
  // Record Morse code practice
  const recordMorsePractice = (wpm: number, accuracy: number, isLessonComplete: boolean) => {
    updateStreak(); // Count this as a study day
    
    setProgress(prev => {
      const updatedBadges = [...prev.badges];
      const today = new Date().toISOString().split('T')[0];
      
      // Morse beginner badge for first lesson completion
      if (isLessonComplete && prev.morseLessonsCompleted === 0) {
        const badgeIndex = updatedBadges.findIndex(b => b.id === 'morse-beginner');
        if (badgeIndex !== -1 && !updatedBadges[badgeIndex].acquired) {
          updatedBadges[badgeIndex] = {
            ...updatedBadges[badgeIndex],
            acquired: true,
            date: today
          };
        }
      }
      
      // Morse expert badge
      if (wpm >= 10 && accuracy >= 90) {
        const badgeIndex = updatedBadges.findIndex(b => b.id === 'morse-expert');
        if (badgeIndex !== -1 && !updatedBadges[badgeIndex].acquired) {
          updatedBadges[badgeIndex] = {
            ...updatedBadges[badgeIndex],
            acquired: true,
            date: today
          };
        }
      }
      
      return {
        ...prev,
        morseHighestWPM: Math.max(prev.morseHighestWPM, wpm),
        morseAccuracy: Math.max(prev.morseAccuracy, accuracy),
        morseLessonsCompleted: isLessonComplete 
          ? prev.morseLessonsCompleted + 1 
          : prev.morseLessonsCompleted,
        badges: updatedBadges
      };
    });
  };
  
  // Record circuit simulator usage
  const recordCircuitSuccess = () => {
    updateStreak(); // Count this as a study day
    
    setProgress(prev => {
      const updatedBadges = [...prev.badges];
      const today = new Date().toISOString().split('T')[0];
      
      // Circuit builder badge
      const badgeIndex = updatedBadges.findIndex(b => b.id === 'circuit-builder');
      if (badgeIndex !== -1 && !updatedBadges[badgeIndex].acquired) {
        updatedBadges[badgeIndex] = {
          ...updatedBadges[badgeIndex],
          acquired: true,
          date: today
        };
      }
      
      return {
        ...prev,
        badges: updatedBadges
      };
    });
  };
  
  return {
    progress,
    recordQuizCompletion,
    recordFlashcardReview,
    recordMorsePractice,
    recordCircuitSuccess,
    updateStreak
  };
}
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

const initialProgress: LearningProgress = {
  // Quiz progress
  completedQuizzes: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  quizzesByCategory: {},
  
  // Flashcard progress
  flashcardsReviewed: 0,
  flashcardMastery: {},
  flashcardsByCategory: {},
  
  // Morse Code progress
  morseHighestWPM: 0,
  morseAccuracy: 0,
  morseLessonsCompleted: 0,
  
  // Achievement badges
  badges: [
    {
      id: 'first-quiz',
      name: 'First Quiz',
      description: 'Complete your first quiz',
      acquired: false
    },
    {
      id: 'perfect-score',
      name: 'Perfect Score',
      description: 'Score 100% on a quiz',
      acquired: false
    },
    {
      id: 'flashcard-master',
      name: 'Flashcard Master',
      description: 'Master 50 flashcards',
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
      description: 'Reach 15 WPM with 90% accuracy',
      acquired: false
    },
    {
      id: 'circuit-builder',
      name: 'Circuit Builder',
      description: 'Successfully build a working circuit',
      acquired: false
    },
    {
      id: 'study-streak',
      name: 'Study Streak',
      description: 'Maintain a 7-day study streak',
      acquired: false
    }
  ],
  
  // Study streak
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null
};

export function useLearningProgress() {
  const [progress, setProgress] = useLocalStorage<LearningProgress>(
    'ham-app-learning-progress', 
    initialProgress
  );
  
  // Check and update streak on mount
  useEffect(() => {
    updateStreak();
  }, []);
  
  // Update streak based on last study date
  const updateStreak = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // If already studied today, do nothing
    if (progress.lastStudyDate === todayString) {
      return;
    }
    
    // Check if yesterday was the last study day
    if (progress.lastStudyDate) {
      const lastDate = new Date(progress.lastStudyDate);
      const dayDifference = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (dayDifference === 1) {
        // Consecutive day - increment streak
        setProgress(prev => ({
          ...prev,
          currentStreak: prev.currentStreak + 1,
          longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
          lastStudyDate: todayString
        }));
        
        // Check for streak badge
        if (!progress.badges.find(b => b.id === 'study-streak')?.acquired && 
            progress.currentStreak + 1 >= 7) {
          updateBadge('study-streak');
        }
      } else if (dayDifference > 1) {
        // Streak broken
        setProgress(prev => ({
          ...prev,
          currentStreak: 1,
          lastStudyDate: todayString
        }));
      }
    } else {
      // First study day
      setProgress(prev => ({
        ...prev,
        currentStreak: 1,
        lastStudyDate: todayString
      }));
    }
  };
  
  // Record quiz completion
  const recordQuizCompletion = (
    category: string, 
    correct: number, 
    total: number
  ) => {
    updateStreak();
    
    // Calculate score as percentage
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    setProgress(prev => {
      // Get or initialize category data
      const categoryData = prev.quizzesByCategory[category] || {
        completed: 0,
        correct: 0,
        total: 0,
        lastScore: 0
      };
      
      // Update category data
      const updatedCategoryData = {
        completed: categoryData.completed + 1,
        correct: categoryData.correct + correct,
        total: categoryData.total + total,
        lastScore: score
      };
      
      // First quiz badge
      let updatedBadges = [...prev.badges];
      if (!prev.badges.find(b => b.id === 'first-quiz')?.acquired) {
        updatedBadges = updatedBadges.map(b => 
          b.id === 'first-quiz' 
            ? { ...b, acquired: true, date: new Date().toISOString() } 
            : b
        );
      }
      
      // Perfect score badge
      if (score === 100 && total >= 5 && !prev.badges.find(b => b.id === 'perfect-score')?.acquired) {
        updatedBadges = updatedBadges.map(b => 
          b.id === 'perfect-score' 
            ? { ...b, acquired: true, date: new Date().toISOString() } 
            : b
        );
      }
      
      return {
        ...prev,
        completedQuizzes: prev.completedQuizzes + 1,
        totalCorrect: prev.totalCorrect + correct,
        totalQuestions: prev.totalQuestions + total,
        quizzesByCategory: {
          ...prev.quizzesByCategory,
          [category]: updatedCategoryData
        },
        badges: updatedBadges
      };
    });
  };
  
  // Record flashcard review
  const recordFlashcardReview = (
    cardId: string, 
    status: 'new' | 'learning' | 'review' | 'mastered',
    category: string
  ) => {
    updateStreak();
    
    setProgress(prev => {
      // Update flashcard mastery status
      const wasAlreadyMastered = prev.flashcardMastery[cardId] === 'mastered';
      const isMasteredNow = status === 'mastered';
      
      // Get or initialize category data
      const categoryData = prev.flashcardsByCategory[category] || {
        reviewed: 0,
        mastered: 0
      };
      
      // Update category stats
      const updatedCategoryData = {
        reviewed: status === 'new' ? categoryData.reviewed : categoryData.reviewed + 1,
        mastered: categoryData.mastered + (isMasteredNow && !wasAlreadyMastered ? 1 : 0)
      };
      
      // Check for flashcard master badge
      let updatedBadges = [...prev.badges];
      const totalMastered = Object.values(prev.flashcardMastery).filter(s => s === 'mastered').length;
      
      if (totalMastered + (isMasteredNow && !wasAlreadyMastered ? 1 : 0) >= 50 && 
          !prev.badges.find(b => b.id === 'flashcard-master')?.acquired) {
        updatedBadges = updatedBadges.map(b => 
          b.id === 'flashcard-master' 
            ? { ...b, acquired: true, date: new Date().toISOString() } 
            : b
        );
      }
      
      return {
        ...prev,
        flashcardsReviewed: status === 'new' ? prev.flashcardsReviewed : prev.flashcardsReviewed + 1,
        flashcardMastery: {
          ...prev.flashcardMastery,
          [cardId]: status
        },
        flashcardsByCategory: {
          ...prev.flashcardsByCategory,
          [category]: updatedCategoryData
        },
        badges: updatedBadges
      };
    });
  };
  
  // Record Morse code practice
  const recordMorsePractice = (
    wpm: number, 
    accuracy: number, 
    isLessonComplete = false
  ) => {
    updateStreak();
    
    setProgress(prev => {
      // Check for badges
      let updatedBadges = [...prev.badges];
      
      // Morse beginner badge
      if (isLessonComplete && !prev.badges.find(b => b.id === 'morse-beginner')?.acquired) {
        updatedBadges = updatedBadges.map(b => 
          b.id === 'morse-beginner' 
            ? { ...b, acquired: true, date: new Date().toISOString() } 
            : b
        );
      }
      
      // Morse expert badge
      if (wpm >= 15 && accuracy >= 90 && !prev.badges.find(b => b.id === 'morse-expert')?.acquired) {
        updatedBadges = updatedBadges.map(b => 
          b.id === 'morse-expert' 
            ? { ...b, acquired: true, date: new Date().toISOString() } 
            : b
        );
      }
      
      return {
        ...prev,
        morseHighestWPM: Math.max(prev.morseHighestWPM, wpm),
        morseAccuracy: accuracy, // Store most recent accuracy
        morseLessonsCompleted: isLessonComplete ? prev.morseLessonsCompleted + 1 : prev.morseLessonsCompleted,
        badges: updatedBadges
      };
    });
  };
  
  // Record circuit simulator success
  const recordCircuitSuccess = () => {
    updateStreak();
    
    setProgress(prev => {
      // Check for circuit builder badge
      if (prev.badges.find(b => b.id === 'circuit-builder')?.acquired) {
        return prev; // Badge already acquired
      }
      
      const updatedBadges = prev.badges.map(b => 
        b.id === 'circuit-builder' 
          ? { ...b, acquired: true, date: new Date().toISOString() } 
          : b
      );
      
      return {
        ...prev,
        badges: updatedBadges
      };
    });
  };
  
  // Update a specific badge
  const updateBadge = (badgeId: string) => {
    setProgress(prev => {
      const updatedBadges = prev.badges.map(b => 
        b.id === badgeId 
          ? { ...b, acquired: true, date: new Date().toISOString() } 
          : b
      );
      
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
    updateBadge
  };
}
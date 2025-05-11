import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

// Interface for card review data (using SM-2 algorithm)
interface CardReview {
  id: string;
  nextReviewDate: string; // ISO date string
  ease: number; // SM-2 algorithm ease factor (initially 2.5)
  interval: number; // Days until next review
  repetitions: number; // Number of times reviewed
  lastReviewDate: string; // ISO date string
  category: string;
}

export interface FlashcardWithMetadata {
  id: string;
  question: string;
  answer: string;
  category: string;
  nextReviewDate: string;
  ease: number;
  interval: number;
  repetitions: number;
  status: 'new' | 'learning' | 'review' | 'mastered';
}

export function useSpacedRepetition() {
  // Store card review history
  const [cardReviews, setCardReviews] = useLocalStorage<Record<string, CardReview>>(
    'ham-radio-card-reviews',
    {}
  );
  
  // Get all cards that are due for review today
  const getDueCards = (allCards: FlashcardWithMetadata[], maxCount = 20): FlashcardWithMetadata[] => {
    const today = new Date();
    
    // Filter cards that are due for review (nextReviewDate <= today)
    const dueCards = allCards.filter(card => {
      if (!cardReviews[card.id]) {
        // New card that has never been reviewed
        return true;
      }
      
      const reviewDate = new Date(cardReviews[card.id].nextReviewDate);
      return reviewDate <= today;
    });
    
    // Sort by priority: new cards first, then by due date (oldest first)
    dueCards.sort((a, b) => {
      // New cards have highest priority
      const aIsNew = !cardReviews[a.id];
      const bIsNew = !cardReviews[b.id];
      
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      
      if (!aIsNew && !bIsNew) {
        // Both are review cards, sort by due date (oldest first)
        const aDate = new Date(cardReviews[a.id].nextReviewDate);
        const bDate = new Date(cardReviews[b.id].nextReviewDate);
        return aDate.getTime() - bDate.getTime();
      }
      
      return 0;
    });
    
    // Return up to maxCount cards
    return dueCards.slice(0, maxCount);
  };
  
  // Get cards that are considered "mastered" (interval > 30 days)
  const getMasteredCards = (allCards: FlashcardWithMetadata[]): FlashcardWithMetadata[] => {
    return allCards.filter(card => {
      const review = cardReviews[card.id];
      return review && review.interval > 30;
    });
  };
  
  // Rate a card from 0-5 (SM-2 algorithm)
  // 0 - Complete blackout, wrong answer
  // 1 - Wrong answer but recognized
  // 2 - Correct answer but with difficulty
  // 3 - Correct answer with some effort
  // 4 - Correct answer with little difficulty
  // 5 - Perfect response
  const rateCard = (cardId: string, quality: number, category: string) => {
    setCardReviews(prev => {
      const today = new Date();
      const todayStr = today.toISOString();
      
      // Get existing review or create new one
      const existingReview = prev[cardId];
      
      // Initialize values for new cards
      let ease = existingReview ? existingReview.ease : 2.5;
      let interval = existingReview ? existingReview.interval : 0;
      let repetitions = existingReview ? existingReview.repetitions : 0;
      
      // Apply SM-2 algorithm
      if (quality < 3) {
        // Failed response, reset repetitions
        repetitions = 0;
        interval = 1;
      } else {
        // Successful response
        if (repetitions === 0) {
          interval = 1;
        } else if (repetitions === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * ease);
        }
        
        repetitions += 1;
      }
      
      // Update ease factor based on response quality
      ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
      
      // Calculate next review date
      const nextReview = new Date(today);
      nextReview.setDate(nextReview.getDate() + interval);
      
      // Create updated review
      const updatedReview: CardReview = {
        id: cardId,
        nextReviewDate: nextReview.toISOString(),
        ease,
        interval,
        repetitions,
        lastReviewDate: todayStr,
        category,
      };
      
      // Update the reviews map
      return {
        ...prev,
        [cardId]: updatedReview
      };
    });
  };
  
  // Determine the current status of a card
  const getCardStatus = (cardId: string): 'new' | 'learning' | 'review' | 'mastered' => {
    const review = cardReviews[cardId];
    
    if (!review) {
      return 'new';
    }
    
    if (review.repetitions < 2) {
      return 'learning';
    }
    
    if (review.interval > 30) {
      return 'mastered';
    }
    
    return 'review';
  };
  
  // Enrich cards with their spaced repetition metadata
  const getCardsWithMetadata = (cards: { id: string, question: string, answer: string, category: string }[]): FlashcardWithMetadata[] => {
    return cards.map(card => {
      const review = cardReviews[card.id];
      
      // Default values for new cards
      const defaultValues = {
        nextReviewDate: new Date().toISOString(),
        ease: 2.5,
        interval: 0,
        repetitions: 0,
        status: 'new' as const
      };
      
      // Use existing review data if available, otherwise defaults
      if (review) {
        return {
          ...card,
          nextReviewDate: review.nextReviewDate,
          ease: review.ease,
          interval: review.interval,
          repetitions: review.repetitions,
          status: getCardStatus(card.id)
        };
      } else {
        return { ...card, ...defaultValues };
      }
    });
  };
  
  // Get statistics about card progress
  const getStats = () => {
    const now = new Date();
    const reviewValues = Object.values(cardReviews);
    
    // Count by status
    const newCount = 0; // We don't track cards that haven't been reviewed yet
    const learningCount = reviewValues.filter(r => r.repetitions < 2).length;
    const reviewCount = reviewValues.filter(r => r.repetitions >= 2 && r.interval <= 30).length;
    const masteredCount = reviewValues.filter(r => r.interval > 30).length;
    
    // Count by due date
    const dueTodayCount = reviewValues.filter(r => {
      const reviewDate = new Date(r.nextReviewDate);
      return reviewDate <= now;
    }).length;
    
    // Count by category
    const categoryStats: Record<string, { count: number, mastered: number }> = {};
    reviewValues.forEach(review => {
      const cat = review.category.toLowerCase();
      if (!categoryStats[cat]) {
        categoryStats[cat] = { count: 0, mastered: 0 };
      }
      
      categoryStats[cat].count += 1;
      if (review.interval > 30) {
        categoryStats[cat].mastered += 1;
      }
    });
    
    return {
      total: reviewValues.length,
      new: newCount,
      learning: learningCount,
      review: reviewCount,
      mastered: masteredCount,
      dueToday: dueTodayCount,
      categories: categoryStats
    };
  };
  
  return {
    cardReviews,
    getDueCards,
    getMasteredCards,
    rateCard,
    getCardStatus,
    getCardsWithMetadata,
    getStats
  };
}
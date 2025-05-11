import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

// Interface for card review data
interface CardReview {
  id: string;
  nextReviewDate: string; // ISO date string
  ease: number; // SM-2 algorithm ease factor (initially 2.5)
  interval: number; // Days until next review
  repetitions: number; // Number of times reviewed
  lastReviewDate: string; // ISO date string
  category: string;
}

// Interface for a flashcard with its review metadata
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

// SuperMemo SM-2 algorithm for spaced repetition
export function useSpacedRepetition() {
  const [cardReviews, setCardReviews] = useLocalStorage<Record<string, CardReview>>('flashcard-reviews', {});
  
  // Calculate the next review date based on current date and interval
  const calculateNextReviewDate = (interval: number): string => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    return nextDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  };
  
  // Process a card review using SM-2 algorithm
  // quality: 0-5 rating of how well the user remembered (0=worst, 5=best)
  const processReview = (cardId: string, quality: number, card: { category: string }): 'new' | 'learning' | 'review' | 'mastered' => {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Get existing review or create new one
    const existingReview = cardReviews[cardId];
    let ease = 2.5; // Default ease factor
    let interval = 0; // Default interval
    let repetitions = 0; // Default repetitions count
    
    if (existingReview) {
      ease = existingReview.ease;
      interval = existingReview.interval;
      repetitions = existingReview.repetitions;
    }
    
    // Implement SM-2 algorithm
    if (quality < 3) {
      // User didn't remember well - reset to learning
      repetitions = 0;
      interval = 1;
    } else {
      // User remembered well - increase interval
      repetitions += 1;
      
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 4;
      } else {
        interval = Math.ceil(interval * ease);
      }
      
      // Update ease factor
      ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    }
    
    // Calculate status based on repetitions and interval
    let status: 'new' | 'learning' | 'review' | 'mastered';
    if (repetitions === 0) {
      status = 'new';
    } else if (repetitions < 3) {
      status = 'learning';
    } else if (interval < 30) {
      status = 'review';
    } else {
      status = 'mastered';
    }
    
    // Store the updated review
    const updatedReview: CardReview = {
      id: cardId,
      nextReviewDate: calculateNextReviewDate(interval),
      ease,
      interval,
      repetitions,
      lastReviewDate: today,
      category: card.category
    };
    
    setCardReviews(prev => ({
      ...prev,
      [cardId]: updatedReview
    }));
    
    return status;
  };
  
  // Get flashcards due for review
  const getDueFlashcards = (cards: Array<{id: string, question: string, answer: string, category: string}>, limit?: number): FlashcardWithMetadata[] => {
    const today = new Date().toISOString().split('T')[0];
    
    // Add metadata to cards
    const cardsWithMetadata: FlashcardWithMetadata[] = cards.map(card => {
      const review = cardReviews[card.id];
      
      if (!review) {
        // This is a new card that hasn't been reviewed yet
        return {
          ...card,
          nextReviewDate: today,
          ease: 2.5,
          interval: 0,
          repetitions: 0,
          status: 'new'
        };
      }
      
      // Determine status based on repetitions and interval
      let status: 'new' | 'learning' | 'review' | 'mastered';
      if (review.repetitions === 0) {
        status = 'new';
      } else if (review.repetitions < 3) {
        status = 'learning';
      } else if (review.interval < 30) {
        status = 'review';
      } else {
        status = 'mastered';
      }
      
      return {
        ...card,
        nextReviewDate: review.nextReviewDate,
        ease: review.ease,
        interval: review.interval,
        repetitions: review.repetitions,
        status
      };
    });
    
    // Filter cards due for review (today or earlier)
    const dueCards = cardsWithMetadata.filter(card => 
      card.nextReviewDate <= today || 
      card.status === 'new'
    );
    
    // If limit is specified, return only that many cards
    // Prioritize: 1. Learning cards, 2. Review cards, 3. New cards
    if (limit && dueCards.length > limit) {
      // Sort by status priority
      const statusPriority: Record<string, number> = {
        'learning': 0,
        'review': 1,
        'new': 2,
        'mastered': 3
      };
      
      const sortedCards = [...dueCards].sort((a, b) => 
        statusPriority[a.status] - statusPriority[b.status]
      );
      
      return sortedCards.slice(0, limit);
    }
    
    return dueCards;
  };
  
  // Reset all reviews (for debugging/testing)
  const resetAllReviews = () => {
    setCardReviews({});
  };
  
  // Get review statistics
  const getStats = () => {
    const reviews = Object.values(cardReviews);
    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
      total: reviews.length,
      new: reviews.filter(r => r.repetitions === 0).length,
      learning: reviews.filter(r => r.repetitions > 0 && r.repetitions < 3).length,
      review: reviews.filter(r => r.repetitions >= 3 && r.interval < 30).length,
      mastered: reviews.filter(r => r.repetitions >= 3 && r.interval >= 30).length,
      dueToday: reviews.filter(r => r.nextReviewDate <= today).length
    };
    
    return stats;
  };
  
  return { processReview, getDueFlashcards, getStats, resetAllReviews };
}
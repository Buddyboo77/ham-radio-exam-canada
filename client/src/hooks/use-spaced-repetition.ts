import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

// Card review data (SM-2 algorithm)
interface CardReview {
  id: string;
  nextReviewDate: string; // ISO date string
  ease: number; // SM-2 algorithm ease factor (initially 2.5)
  interval: number; // Days until next review
  repetitions: number; // Number of times reviewed
  lastReviewDate: string; // ISO date string
  category: string;
}

// A flashcard with metadata
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

// Basic flashcard information
export interface Flashcard {
  id?: string;
  question: string;
  answer: string;
  category: string;
}

// Predefined flashcards for amateur radio
const RADIO_FLASHCARDS: Flashcard[] = [
  { question: "What is QRP?", answer: "Low-power operation, typically 5 watts or less", category: "Q-Codes" },
  { question: "What is QSL?", answer: "Confirmation of contact or receipt", category: "Q-Codes" },
  { question: "What is QTH?", answer: "Location or position", category: "Q-Codes" },
  { question: "What is QSO?", answer: "A contact or conversation between amateur radio operators", category: "Q-Codes" },
  { question: "What is QRZ?", answer: "Who is calling me?", category: "Q-Codes" },
  { question: "What is QRN?", answer: "Natural noise or static", category: "Q-Codes" },
  { question: "What is QRM?", answer: "Man-made interference", category: "Q-Codes" },
  { question: "What is QSY?", answer: "Change frequency", category: "Q-Codes" },
  { question: "What is QRX?", answer: "Stand by", category: "Q-Codes" },
  
  { question: "What does VHF stand for?", answer: "Very High Frequency (30-300 MHz)", category: "Terminology" },
  { question: "What does UHF stand for?", answer: "Ultra High Frequency (300-3000 MHz)", category: "Terminology" },
  { question: "What does HF stand for?", answer: "High Frequency (3-30 MHz)", category: "Terminology" },
  { question: "What does CW stand for?", answer: "Continuous Wave (Morse code)", category: "Terminology" },
  { question: "What does DX stand for?", answer: "Distance (typically long-distance communication)", category: "Terminology" },
  { question: "What is a repeater?", answer: "A station that receives and retransmits signals to extend range", category: "Terminology" },
  { question: "What is SSB?", answer: "Single Side Band - a form of amplitude modulation with suppressed carrier", category: "Terminology" },
  { question: "What is an ARRL?", answer: "American Radio Relay League - national association for amateur radio in the USA", category: "Terminology" },
  { question: "What is RAC?", answer: "Radio Amateurs of Canada - national association for amateur radio in Canada", category: "Terminology" },
  
  { question: "What is the calling frequency for VHF FM?", answer: "146.52 MHz", category: "Frequencies" },
  { question: "What band does 14.200 MHz belong to?", answer: "20 meter band", category: "Frequencies" },
  { question: "What band does 7.200 MHz belong to?", answer: "40 meter band", category: "Frequencies" },
  { question: "What band does 28.400 MHz belong to?", answer: "10 meter band", category: "Frequencies" },
  { question: "What band does 3.850 MHz belong to?", answer: "80 meter band", category: "Frequencies" },
  
  { question: "What is a dipole antenna?", answer: "A straight electrical conductor with a feed point at the center", category: "Antennas" },
  { question: "What is a Yagi antenna?", answer: "A directional antenna with a driven element and parasitic elements", category: "Antennas" },
  { question: "What is a J-pole antenna?", answer: "A vertical antenna made from a half-wave element with a quarter-wave matching stub", category: "Antennas" },
  { question: "What is a balun?", answer: "A device that transforms between balanced and unbalanced lines", category: "Antennas" },
  { question: "What is an SWR meter?", answer: "A device that measures standing wave ratio to indicate antenna match", category: "Antennas" },
  
  { question: "What is a capacitor?", answer: "An electronic component that stores electrical energy in an electric field", category: "Electronics" },
  { question: "What is an inductor?", answer: "An electronic component that stores energy in a magnetic field when current flows through it", category: "Electronics" },
  { question: "What is Ohm's Law?", answer: "V = IR (Voltage equals current multiplied by resistance)", category: "Electronics" },
  { question: "What is a diode?", answer: "An electronic component that allows current to flow in one direction only", category: "Electronics" },
  { question: "What is a transistor?", answer: "A semiconductor device used to amplify or switch electronic signals", category: "Electronics" }
];

export function useSpacedRepetition(initialCards: Flashcard[] = RADIO_FLASHCARDS) {
  // Store card review data persistently
  const [cardReviews, setCardReviews] = useLocalStorage<Record<string, CardReview>>(
    'ham-app-flashcard-reviews',
    {}
  );
  
  // Keep flashcards in state
  const [flashcards, setFlashcards] = useState<FlashcardWithMetadata[]>([]);
  const [initialized, setInitialized] = useState(false);
  
  // Initialize flashcards on mount
  useEffect(() => {
    if (initialized) return;
    
    const today = new Date();
    const todayStr = today.toISOString();
    
    // Convert plain flashcards to flashcards with metadata
    const flashcardsWithMetadata: FlashcardWithMetadata[] = initialCards.map(card => {
      const id = card.id || uuidv4();
      const review = cardReviews[id];
      
      if (review) {
        // Already has review data
        const status = getCardStatus(review);
        return {
          id,
          question: card.question,
          answer: card.answer,
          category: card.category,
          nextReviewDate: review.nextReviewDate,
          ease: review.ease,
          interval: review.interval,
          repetitions: review.repetitions,
          status
        };
      } else {
        // New card
        return {
          id,
          question: card.question,
          answer: card.answer,
          category: card.category,
          nextReviewDate: todayStr,
          ease: 2.5, // Initial ease factor
          interval: 0,
          repetitions: 0,
          status: 'new'
        };
      }
    });
    
    setFlashcards(flashcardsWithMetadata);
    setInitialized(true);
  }, [initialCards, cardReviews, initialized]);
  
  // Determine card status based on review data
  const getCardStatus = (review: CardReview): 'new' | 'learning' | 'review' | 'mastered' => {
    if (review.repetitions === 0) {
      return 'new';
    } else if (review.repetitions < 3) {
      return 'learning';
    } else if (review.interval >= 21) {
      return 'mastered';
    } else {
      return 'review';
    }
  };
  
  // Add a new flashcard
  const addFlashcard = (card: Flashcard) => {
    const id = card.id || uuidv4();
    const today = new Date().toISOString();
    
    const newCard: FlashcardWithMetadata = {
      id,
      question: card.question,
      answer: card.answer,
      category: card.category,
      nextReviewDate: today,
      ease: 2.5,
      interval: 0,
      repetitions: 0,
      status: 'new'
    };
    
    setFlashcards(prev => [...prev, newCard]);
  };
  
  // Get due cards for review
  const getDueCards = (maxCards = 20, category?: string): FlashcardWithMetadata[] => {
    const today = new Date();
    
    // Filter cards by due date and optionally by category
    const dueCards = flashcards.filter(card => {
      const nextReviewDate = new Date(card.nextReviewDate);
      const isDue = nextReviewDate <= today;
      const isCorrectCategory = !category || card.category === category;
      return isDue && isCorrectCategory;
    });
    
    // Sort by interval (shorter intervals first)
    const sortedCards = [...dueCards].sort((a, b) => a.interval - b.interval);
    
    // Return limited number of cards
    return sortedCards.slice(0, maxCards);
  };
  
  // Get all cards by category
  const getCardsByCategory = (category: string): FlashcardWithMetadata[] => {
    return flashcards.filter(card => card.category === category);
  };
  
  // Get a specific card by ID
  const getCardById = (id: string): FlashcardWithMetadata | undefined => {
    return flashcards.find(card => card.id === id);
  };
  
  // Record a card review using SM-2 algorithm
  const reviewCard = (cardId: string, quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const card = flashcards.find(c => c.id === cardId);
    if (!card) return;
    
    const today = new Date();
    const todayStr = today.toISOString();
    
    // Apply SM-2 algorithm
    let { ease, interval, repetitions } = card;
    
    // If quality is less than 3, reset repetitions
    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      // Calculate new interval
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ease);
      }
      
      // Increment repetitions
      repetitions += 1;
      
      // Adjust ease factor (min 1.3)
      ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    }
    
    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(today.getDate() + interval);
    
    // Update card review data
    const updatedReview: CardReview = {
      id: cardId,
      nextReviewDate: nextReviewDate.toISOString(),
      ease,
      interval,
      repetitions,
      lastReviewDate: todayStr,
      category: card.category
    };
    
    // Update state
    setCardReviews(prev => ({
      ...prev,
      [cardId]: updatedReview
    }));
    
    // Update flashcards state
    setFlashcards(prev => 
      prev.map(c => 
        c.id === cardId 
          ? {
              ...c,
              nextReviewDate: updatedReview.nextReviewDate,
              ease,
              interval,
              repetitions,
              status: getCardStatus(updatedReview)
            }
          : c
      )
    );
    
    return getCardStatus(updatedReview);
  };
  
  // Reset a card back to new status
  const resetCard = (cardId: string) => {
    const card = flashcards.find(c => c.id === cardId);
    if (!card) return;
    
    const today = new Date().toISOString();
    
    // Create a reset review
    const resetReview: CardReview = {
      id: cardId,
      nextReviewDate: today,
      ease: 2.5,
      interval: 0,
      repetitions: 0,
      lastReviewDate: today,
      category: card.category
    };
    
    // Update state
    setCardReviews(prev => ({
      ...prev,
      [cardId]: resetReview
    }));
    
    // Update flashcards state
    setFlashcards(prev => 
      prev.map(c => 
        c.id === cardId 
          ? {
              ...c,
              nextReviewDate: today,
              ease: 2.5,
              interval: 0,
              repetitions: 0,
              status: 'new'
            }
          : c
      )
    );
  };
  
  // Get statistics about the flashcards
  const getStats = () => {
    const total = flashcards.length;
    const newCards = flashcards.filter(c => c.status === 'new').length;
    const learning = flashcards.filter(c => c.status === 'learning').length;
    const review = flashcards.filter(c => c.status === 'review').length;
    const mastered = flashcards.filter(c => c.status === 'mastered').length;
    
    const categories = [...new Set(flashcards.map(c => c.category))];
    const categoryStats = categories.map(category => {
      const cardsInCategory = flashcards.filter(c => c.category === category);
      return {
        category,
        total: cardsInCategory.length,
        mastered: cardsInCategory.filter(c => c.status === 'mastered').length,
        learning: cardsInCategory.filter(c => c.status === 'learning' || c.status === 'review').length,
        new: cardsInCategory.filter(c => c.status === 'new').length
      };
    });
    
    const dueToday = getDueCards(1000).length;
    
    return {
      total,
      newCards,
      learning,
      review,
      mastered,
      dueToday,
      categories: categoryStats
    };
  };
  
  return {
    flashcards,
    addFlashcard,
    getDueCards,
    getCardsByCategory,
    getCardById,
    reviewCard,
    resetCard,
    getStats
  };
}
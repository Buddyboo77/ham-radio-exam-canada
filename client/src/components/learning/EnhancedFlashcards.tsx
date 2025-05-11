import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  RotateCw, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Check,
  X,
  Bookmark,
  Shuffle,
  Plus,
  Clock,
  Calendar,
  Tag,
  Lightbulb,
  FastForward,
  Undo,
  Save
} from 'lucide-react';
import { useSpacedRepetition, FlashcardWithMetadata } from '@/hooks/use-spaced-repetition';
import { useLearningProgress } from '@/hooks/use-learning-progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// This would normally come from an API or database
const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    question: "What is the purpose of a balun in an antenna system?",
    answer: "A balun (balanced to unbalanced) is used to connect a balanced line to an unbalanced line and prevent RF current from flowing on the outer shield of coaxial cable.",
    category: "Technical"
  },
  {
    id: 'fc-2',
    question: "What is the ITU?",
    answer: "The International Telecommunication Union - a United Nations agency that coordinates global telecommunications and radio frequency spectrum allocation.",
    category: "Regulations"
  },
  {
    id: 'fc-3',
    question: "What does 'CQ' mean?",
    answer: "CQ is a general call to any station. It means 'Calling any station' or 'Seek you'.",
    category: "Operating"
  },
  {
    id: 'fc-4',
    question: "What is the formula for calculating wavelength in meters?",
    answer: "Wavelength (meters) = 300 / Frequency (MHz)",
    category: "Technical"
  },
  {
    id: 'fc-5',
    question: "What does QTH mean in Q-codes?",
    answer: "QTH means 'What is your location?' or 'My location is...'",
    category: "Operating"
  },
  {
    id: 'fc-6',
    question: "What is the maximum permitted power output for Basic with Honours qualification in Canada?",
    answer: "250 watts (PEP)",
    category: "Regulations"
  },
  {
    id: 'fc-7',
    question: "How do you calculate Ohm's Law?",
    answer: "V = I × R (Voltage = Current × Resistance)",
    category: "Technical"
  },
  {
    id: 'fc-8',
    question: "What does 73 mean in ham radio?",
    answer: "73 means 'Best regards' or 'Best wishes'",
    category: "Operating"
  },
  {
    id: 'fc-9',
    question: "What is the purpose of a dummy load?",
    answer: "A dummy load allows testing and tuning of transmitters without radiating a signal. It's a non-radiating 50-ohm resistive load.",
    category: "Technical"
  },
  {
    id: 'fc-10',
    question: "What is the phonetic alphabet for E-K-O?",
    answer: "Echo-Kilo-Oscar",
    category: "Operating"
  },
  {
    id: 'fc-11',
    question: "What is the call-sign format used for Canadian amateur radio operators?",
    answer: "VA/VE/VO/VY followed by a number (0-9) and up to 3 letters",
    category: "Regulations"
  },
  {
    id: 'fc-12',
    question: "What is the formula for calculating electrical power?",
    answer: "P = V × I (Power = Voltage × Current)",
    category: "Technical"
  },
  {
    id: 'fc-13',
    question: "What does 'RST' stand for in signal reports?",
    answer: "Readability, Strength, Tone",
    category: "Operating"
  },
  {
    id: 'fc-14',
    question: "What is the frequency range of the 2-meter band?",
    answer: "144-148 MHz in Canada",
    category: "Regulations"
  },
  {
    id: 'fc-15',
    question: "What is the difference between a directional and omnidirectional antenna?",
    answer: "A directional antenna focuses RF energy in specific directions, while an omnidirectional antenna radiates equally in all horizontal directions.",
    category: "Technical"
  }
];

// Create a custom flashcard component
interface FlashcardProps {
  card: FlashcardWithMetadata;
  onFlip: () => void;
  onRate: (quality: number) => void;
  showAnswer: boolean;
  isReview: boolean;
}

const FlashcardDisplay = ({ card, onFlip, onRate, showAnswer, isReview }: FlashcardProps) => {
  return (
    <div className="p-2">
      <div className={`bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700 ${showAnswer ? 'min-h-[220px]' : 'min-h-[180px]'}`}>
        <div className="mb-3 flex justify-between items-center">
          <Badge 
            variant="outline" 
            className={`text-[10px] ${
              card.category === 'Technical' ? 'border-blue-700 text-blue-300' :
              card.category === 'Operating' ? 'border-green-700 text-green-300' :
              'border-amber-700 text-amber-300'
            }`}
          >
            {card.category}
          </Badge>
          <div className="text-xs text-gray-400 font-mono">
            <Badge variant="outline" className={`
              ${card.status === 'new' ? 'bg-blue-900/40 text-blue-300 border-blue-800' : 
                card.status === 'learning' ? 'bg-amber-900/40 text-amber-300 border-amber-800' :
                card.status === 'review' ? 'bg-purple-900/40 text-purple-300 border-purple-800' :
                'bg-green-900/40 text-green-300 border-green-800'}
            `}>
              {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-md p-3 mb-3">
          <div className="text-xs text-blue-300 uppercase mb-1 font-mono">Question:</div>
          <p className="text-sm text-gray-200">{card.question}</p>
        </div>
        
        {showAnswer ? (
          <div className="bg-gray-900 rounded-md p-3 mb-3">
            <div className="text-xs text-green-300 uppercase mb-1 font-mono">Answer:</div>
            <p className="text-sm text-gray-200">{card.answer}</p>
          </div>
        ) : (
          <Button 
            className="w-full bg-blue-900 hover:bg-blue-800 mb-3"
            onClick={onFlip}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Show Answer
          </Button>
        )}
        
        {showAnswer && isReview && (
          <div className="grid grid-cols-4 gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="bg-red-900/40 hover:bg-red-900/60 border-red-800 text-xs"
              onClick={() => onRate(0)}
            >
              <X className="h-3 w-3 mr-1" />
              Forgot
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="bg-amber-900/40 hover:bg-amber-900/60 border-amber-800 text-xs"
              onClick={() => onRate(3)}
            >
              Hard
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="bg-blue-900/40 hover:bg-blue-900/60 border-blue-800 text-xs"
              onClick={() => onRate(4)}
            >
              Good
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="bg-green-900/40 hover:bg-green-900/60 border-green-800 text-xs"
              onClick={() => onRate(5)}
            >
              <Check className="h-3 w-3 mr-1" />
              Easy
            </Button>
          </div>
        )}
        
        {showAnswer && !isReview && (
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="bg-blue-900/40 hover:bg-blue-900/60 border-blue-800"
              onClick={onFlip}
            >
              <Undo className="h-4 w-4 mr-1" />
              Try Again
            </Button>
            <Button 
              size="sm" 
              className="bg-green-800 hover:bg-green-700"
              onClick={() => onRate(4)}
            >
              <FastForward className="h-4 w-4 mr-1" />
              Next Card
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Create a dialog for adding custom flashcards
const AddFlashcardDialog = ({ 
  onAddCard 
}: {
  onAddCard: (card: Flashcard) => void;
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Technical');
  const { toast } = useToast();
  
  const handleSubmit = () => {
    if (!question.trim() || !answer.trim()) {
      toast({
        title: "Validation Error",
        description: "Question and answer are required",
        variant: "destructive"
      });
      return;
    }
    
    const newCard: Flashcard = {
      id: `fc-custom-${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
      category: category
    };
    
    onAddCard(newCard);
    
    // Reset form
    setQuestion('');
    setAnswer('');
    setCategory('Technical');
    
    toast({
      title: "Flashcard Added",
      description: "Your custom flashcard has been added to the deck",
    });
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Flashcard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Custom Flashcard</DialogTitle>
          <DialogDescription>
            Add your own flashcard to study material that matters to you
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Operating">Operating</SelectItem>
                <SelectItem value="Regulations">Regulations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Question</label>
            <textarea
              className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Answer</label>
            <textarea
              className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter the answer..."
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-600">
            <Save className="h-4 w-4 mr-2" />
            Save Flashcard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EnhancedFlashcardsProps {
  initialCategory?: string;
  studyMode?: 'learn' | 'review' | 'browse';
}

export default function EnhancedFlashcards({ 
  initialCategory = 'all', 
  studyMode = 'review' 
}: EnhancedFlashcardsProps) {
  // Cards data and state
  const [flashcards, setFlashcards] = useState<Flashcard[]>(DEFAULT_FLASHCARDS);
  const [customCards, setCustomCards] = useState<Flashcard[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardsCompleted, setCardsCompleted] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(studyMode === 'review');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Get hooks
  const { getDueFlashcards, processReview, getStats } = useSpacedRepetition();
  const { recordFlashcardReview } = useLearningProgress();
  const { toast } = useToast();
  
  // Combine default and custom cards
  const allCards = [...flashcards, ...customCards];
  
  // Get cards with spaced repetition metadata
  const cardsWithMetadata = getDueFlashcards(
    allCards.filter(card => activeCategory === 'all' || card.category === activeCategory)
  );
  
  // Set current card
  const currentCard = cardsWithMetadata[currentCardIndex];
  
  // Get stats
  const stats = getStats();
  
  // Initialize
  useEffect(() => {
    // Load custom cards from localStorage if available
    const savedCards = localStorage.getItem('custom-flashcards');
    if (savedCards) {
      try {
        setCustomCards(JSON.parse(savedCards));
      } catch (e) {
        console.error('Failed to load custom cards', e);
      }
    }
    
    // Reset state when category changes
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setCardsCompleted(0);
  }, [activeCategory, isReviewMode]);
  
  // Save custom cards to localStorage
  useEffect(() => {
    if (customCards.length > 0) {
      localStorage.setItem('custom-flashcards', JSON.stringify(customCards));
    }
  }, [customCards]);
  
  // Handle flashcard flipping
  const handleFlip = () => {
    setShowAnswer(true);
  };
  
  // Handle rating a card (spaced repetition)
  const handleRate = (quality: number) => {
    if (!currentCard) return;
    
    // Process the review with spaced repetition algorithm
    const newStatus = processReview(currentCard.id, quality, { category: currentCard.category });
    
    // Record the review in learning progress system
    recordFlashcardReview(currentCard.id, currentCard.category, newStatus);
    
    // Move to next card or finish
    handleNextCard();
    
    // Update completion count
    setCardsCompleted(prev => prev + 1);
  };
  
  // Move to next card
  const handleNextCard = () => {
    if (currentCardIndex < cardsWithMetadata.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // End of deck
      toast({
        title: "Study Session Complete",
        description: `You've reviewed ${cardsCompleted + 1} flashcards. Great job!`,
      });
      
      // Reset to first card
      setCurrentCardIndex(0);
      setShowAnswer(false);
    }
  };
  
  // Move to previous card
  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };
  
  // Shuffle the deck
  const handleShuffle = () => {
    // Create a shuffled copy of the indices
    const indices = [...Array(cardsWithMetadata.length).keys()];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Reset and start with the first shuffled card
    setCurrentCardIndex(0);
    setShowAnswer(false);
    
    toast({
      title: "Deck Shuffled",
      description: "The flashcards have been randomly shuffled",
    });
  };
  
  // Add a custom card
  const handleAddCard = (card: Flashcard) => {
    setCustomCards(prev => [...prev, card]);
  };
  
  // Calculate progress percentage
  const progressPercentage = cardsWithMetadata.length > 0 
    ? Math.round(((currentCardIndex) / cardsWithMetadata.length) * 100)
    : 0;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Flashcards
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`
                ${isReviewMode ? 'bg-purple-900/40 text-purple-300 border-purple-800' : 
                  'bg-blue-900/40 text-blue-300 border-blue-800'}
              `}>
                {isReviewMode ? 'Spaced Repetition' : 'Learning Mode'}
              </Badge>
            </div>
          </div>
          <CardDescription>
            Master radio concepts with spaced repetition flashcards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls and mode selector */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button 
              variant="outline" 
              className={`${!isReviewMode ? 'bg-blue-900/30 border-blue-800' : ''}`}
              onClick={() => setIsReviewMode(false)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Learning Mode
            </Button>
            <Button 
              variant="outline" 
              className={`${isReviewMode ? 'bg-purple-900/30 border-purple-800' : ''}`}
              onClick={() => setIsReviewMode(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Review Mode
            </Button>
          </div>
          
          {/* Category filters */}
          <div className="mb-4">
            <div className="text-xs mb-2 text-gray-400">Filter by category:</div>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className={`cursor-pointer px-3 py-1 ${
                  activeCategory === 'all' 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => setActiveCategory('all')}
              >
                All ({allCards.length})
              </Badge>
              <Badge 
                variant="outline" 
                className={`cursor-pointer px-3 py-1 ${
                  activeCategory === 'Technical' 
                    ? 'bg-blue-900/50 border-blue-800 text-blue-200' 
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => setActiveCategory('Technical')}
              >
                Technical ({allCards.filter(c => c.category === 'Technical').length})
              </Badge>
              <Badge 
                variant="outline" 
                className={`cursor-pointer px-3 py-1 ${
                  activeCategory === 'Operating' 
                    ? 'bg-green-900/50 border-green-800 text-green-200' 
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => setActiveCategory('Operating')}
              >
                Operating ({allCards.filter(c => c.category === 'Operating').length})
              </Badge>
              <Badge 
                variant="outline" 
                className={`cursor-pointer px-3 py-1 ${
                  activeCategory === 'Regulations' 
                    ? 'bg-amber-900/50 border-amber-800 text-amber-200' 
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => setActiveCategory('Regulations')}
              >
                Regulations ({allCards.filter(c => c.category === 'Regulations').length})
              </Badge>
            </div>
          </div>
          
          {/* Progress tracking */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Card {currentCardIndex + 1} of {cardsWithMetadata.length}</span>
              <span>Progress: {progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-1" />
          </div>
          
          {/* Current flashcard */}
          {currentCard ? (
            <FlashcardDisplay 
              card={currentCard}
              onFlip={handleFlip}
              onRate={handleRate}
              showAnswer={showAnswer}
              isReview={isReviewMode}
            />
          ) : (
            <div className="bg-gray-800 rounded-md p-4 text-center mb-4">
              <p className="text-gray-400 mb-2">No flashcards available for the selected category.</p>
              <p className="text-sm text-gray-500">Try selecting a different category or creating your own flashcards.</p>
            </div>
          )}
          
          {/* Navigation and action buttons */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    onClick={handlePrevCard}
                    disabled={currentCardIndex === 0 || cardsWithMetadata.length === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous Card</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    onClick={handleShuffle}
                    disabled={cardsWithMetadata.length < 2}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Shuffle Cards</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    onClick={handleNextCard}
                    disabled={currentCardIndex === cardsWithMetadata.length - 1 || cardsWithMetadata.length === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next Card</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
      
      {/* Add custom flashcard section */}
      <AddFlashcardDialog onAddCard={handleAddCard} />
      
      {/* Statistics card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Study Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-800 rounded-md p-2">
              <div className="text-xs text-gray-400">Due Today</div>
              <div className="text-lg font-mono text-blue-300">{stats.dueToday}</div>
            </div>
            <div className="bg-gray-800 rounded-md p-2">
              <div className="text-xs text-gray-400">Mastered</div>
              <div className="text-lg font-mono text-green-300">{stats.mastered}</div>
            </div>
            <div className="bg-gray-800 rounded-md p-2">
              <div className="text-xs text-gray-400">Total Cards</div>
              <div className="text-lg font-mono text-amber-300">{stats.total}</div>
            </div>
          </div>
          
          <div className="text-xs text-center text-gray-400 mt-2">
            Using spaced repetition for efficient long-term retention
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
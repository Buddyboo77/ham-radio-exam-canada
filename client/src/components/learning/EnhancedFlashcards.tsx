import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RotateCw, 
  Plus, 
  Book, 
  AlertCircle, 
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Brain,
  ArrowLeftRight,
  Sparkles
} from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

// Import hooks
import { useSpacedRepetition, FlashcardWithMetadata } from "@/hooks/use-spaced-repetition";
import { useLearningProgress } from "@/hooks/use-learning-progress";

// Define basic flashcard structure
interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Default flashcards data
const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: "1",
    question: "What is the wavelength of a radio wave with a frequency of 146.52 MHz?",
    answer: "Approximately 2 meters",
    category: "Technical"
  },
  {
    id: "2",
    question: "What is the purpose of an antenna tuner?",
    answer: "To match the impedance of the radio to the impedance of the antenna",
    category: "Technical"
  },
  {
    id: "3",
    question: "What does APRS stand for?",
    answer: "Automatic Packet Reporting System",
    category: "Operating"
  },
  {
    id: "4",
    question: "What type of electronic component opposes any change in current?",
    answer: "Inductor",
    category: "Technical"
  },
  {
    id: "5",
    question: "What is the phonetic alphabet designation for the letter 'Q'?",
    answer: "Quebec",
    category: "Operating"
  },
  {
    id: "6",
    question: "What is the function of a balun?",
    answer: "To convert between balanced and unbalanced feed lines",
    category: "Technical"
  },
  {
    id: "7",
    question: "Which frequency range is allocated to the 70cm band in Canada?",
    answer: "430-450 MHz",
    category: "Regulations"
  },
  {
    id: "8",
    question: "What does the Q-signal 'QSL' mean?",
    answer: "I acknowledge receipt",
    category: "Operating"
  },
  {
    id: "9",
    question: "What is the maximum power output allowed for Basic with Honours qualification in Canada?",
    answer: "250 watts PEP",
    category: "Regulations"
  },
  {
    id: "10",
    question: "What is the velocity factor of coaxial cable and why is it important?",
    answer: "It's the speed at which radio waves travel through the cable compared to free space (typically 0.66 or 66%). It's important for calculating electrical length of feed lines.",
    category: "Technical"
  },
  {
    id: "11",
    question: "What is the term for unwanted signals generated in a receiver?",
    answer: "Intermodulation distortion",
    category: "Technical"
  },
  {
    id: "12",
    question: "What is the primary purpose of the RG-58 coaxial cable type?",
    answer: "RG-58 is a thin, flexible 50-ohm coaxial cable commonly used for shorter runs in amateur radio setups",
    category: "Technical"
  },
  {
    id: "13",
    question: "Which antenna type provides gain in all horizontal directions but compresses the signal vertically?",
    answer: "Collinear antenna",
    category: "Technical"
  },
  {
    id: "14",
    question: "What does the term 'front-to-back ratio' refer to when discussing antennas?",
    answer: "The difference in gain between the front and back of a directional antenna",
    category: "Technical"
  },
  {
    id: "15",
    question: "What is the main advantage of single sideband (SSB) transmission?",
    answer: "More efficient use of power and bandwidth",
    category: "Operating"
  }
];

// Component to display a single flashcard
interface FlashcardProps {
  card: FlashcardWithMetadata;
  onFlip: () => void;
  onRate: (quality: number) => void;
  showAnswer: boolean;
  isReview: boolean;
}

const FlashcardDisplay = ({ card, onFlip, onRate, showAnswer, isReview }: FlashcardProps) => {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 h-64 relative">
      <div className="absolute top-2 right-2 flex gap-1">
        <Badge variant={
          card.status === 'new' ? 'outline' :
          card.status === 'learning' ? 'default' :
          card.status === 'review' ? 'secondary' : 'success'
        }>
          {card.status}
        </Badge>
        <Badge variant="outline">{card.category}</Badge>
      </div>

      <div className="flex flex-col justify-between h-full">
        <div className="mt-8 text-center">
          {!showAnswer ? (
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Question</h3>
              <p className="text-gray-300">{card.question}</p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-green-400 mb-2">Answer</h3>
              <p className="text-gray-300">{card.answer}</p>
            </div>
          )}
        </div>

        <div className="mt-2">
          {!showAnswer ? (
            <Button 
              onClick={onFlip} 
              className="w-full bg-blue-800 hover:bg-blue-700">
              Show Answer
            </Button>
          ) : (
            <div>
              {isReview && (
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-300 mb-1">How well did you know this?</h4>
                  <div className="grid grid-cols-6 gap-1">
                    <Button 
                      onClick={() => onRate(0)} 
                      size="sm" 
                      className="bg-red-900 hover:bg-red-800 p-0 h-7"
                      title="Complete blackout">
                      0
                    </Button>
                    <Button 
                      onClick={() => onRate(1)} 
                      size="sm" 
                      className="bg-red-800 hover:bg-red-700 p-0 h-7"
                      title="Wrong, but recognized">
                      1
                    </Button>
                    <Button 
                      onClick={() => onRate(2)} 
                      size="sm" 
                      className="bg-amber-700 hover:bg-amber-600 p-0 h-7"
                      title="Wrong, but almost right">
                      2
                    </Button>
                    <Button 
                      onClick={() => onRate(3)} 
                      size="sm" 
                      className="bg-amber-600 hover:bg-amber-500 p-0 h-7"
                      title="Right, but with effort">
                      3
                    </Button>
                    <Button 
                      onClick={() => onRate(4)} 
                      size="sm" 
                      className="bg-green-700 hover:bg-green-600 p-0 h-7"
                      title="Right, with little difficulty">
                      4
                    </Button>
                    <Button 
                      onClick={() => onRate(5)} 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-500 p-0 h-7"
                      title="Perfect response">
                      5
                    </Button>
                  </div>
                </div>
              )}
              
              {!isReview && (
                <Button 
                  onClick={onFlip} 
                  className="w-full bg-blue-800 hover:bg-blue-700">
                  Back to Question
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// The main Flashcards component
interface EnhancedFlashcardsProps {
  initialCategory?: string;
  studyMode?: 'learn' | 'review' | 'browse';
}

export default function EnhancedFlashcards({ 
  initialCategory = 'all', 
  studyMode = 'review' 
}: EnhancedFlashcardsProps) {
  // State for flashcards data
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsLoaded, setFlashcardsLoaded] = useState(false);
  
  // Spaced repetition and learning progress hooks
  const { 
    getCardsWithMetadata, 
    getDueCards, 
    getMasteredCards,
    rateCard, 
    getStats 
  } = useSpacedRepetition();
  const { recordFlashcardReview } = useLearningProgress();
  
  // Study session state
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeMode, setActiveMode] = useState<'learn' | 'review' | 'browse'>(studyMode);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyCards, setStudyCards] = useState<FlashcardWithMetadata[]>([]);
  
  // New card form state
  const [addCardDialogOpen, setAddCardDialogOpen] = useState(false);
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');
  const [newCardCategory, setNewCardCategory] = useState('Technical');
  
  // Use local storage for flashcards
  useEffect(() => {
    const storedCards = localStorage.getItem('ham-radio-flashcards');
    if (storedCards) {
      setAllFlashcards(JSON.parse(storedCards));
    } else {
      setAllFlashcards(DEFAULT_FLASHCARDS);
      localStorage.setItem('ham-radio-flashcards', JSON.stringify(DEFAULT_FLASHCARDS));
    }
    setFlashcardsLoaded(true);
  }, []);
  
  // Prepare study cards whenever dependencies change
  useEffect(() => {
    if (!flashcardsLoaded) return;
    prepareStudySession();
  }, [flashcardsLoaded, activeCategory, activeMode, allFlashcards]);
  
  // Function to prepare cards for current study session
  const prepareStudySession = () => {
    if (!allFlashcards.length) return;
    
    // Add metadata to all cards
    const cardsWithMetadata = getCardsWithMetadata(allFlashcards);
    
    // Filter by category if needed
    const categoryFiltered = activeCategory === 'all' 
      ? cardsWithMetadata 
      : cardsWithMetadata.filter(card => 
          card.category.toLowerCase() === activeCategory.toLowerCase()
        );
    
    let cardsToStudy: FlashcardWithMetadata[] = [];
    
    if (activeMode === 'review') {
      // In review mode, get cards due for review
      cardsToStudy = getDueCards(categoryFiltered, 20);
    } else if (activeMode === 'browse') {
      // In browse mode, show all cards
      cardsToStudy = categoryFiltered;
    } else {
      // In learn mode, prioritize new cards
      cardsToStudy = categoryFiltered.sort((a, b) => {
        // New cards first
        if (a.status === 'new' && b.status !== 'new') return -1;
        if (a.status !== 'new' && b.status === 'new') return 1;
        
        // Then learning cards
        if (a.status === 'learning' && b.status !== 'learning') return -1;
        if (a.status !== 'learning' && b.status === 'learning') return 1;
        
        // Then review cards
        if (a.status === 'review' && b.status !== 'review') return -1;
        if (a.status !== 'review' && b.status === 'review') return 1;
        
        return 0;
      }).slice(0, 30);
    }
    
    // If no cards to study, get all cards
    if (cardsToStudy.length === 0 && categoryFiltered.length > 0) {
      cardsToStudy = categoryFiltered;
    }
    
    // Reset state for new study session
    setStudyCards(cardsToStudy);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };
  
  // Handle flipping the card
  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };
  
  // Handle rating a card
  const handleRate = (quality: number) => {
    if (!studyCards.length) return;
    
    const currentCard = studyCards[currentCardIndex];
    
    // Update card review history
    rateCard(currentCard.id, quality, currentCard.category);
    
    // Update learning progress
    const newStatus = quality >= 4 
      ? (currentCard.interval > 25 ? 'mastered' : 'review') 
      : (quality >= 3 ? 'review' : 'learning');
    
    recordFlashcardReview(currentCard.id, newStatus as any, currentCard.category);
    
    // Move to next card
    goToNextCard();
  };
  
  // Go to next card
  const goToNextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // End of study session
      setCurrentCardIndex(0);
      setShowAnswer(false);
      
      // Refresh the study cards
      prepareStudySession();
    }
  };
  
  // Handle adding a new flashcard
  const handleAddCard = (card: Flashcard) => {
    const newCard: Flashcard = {
      ...card,
      id: uuidv4()
    };
    
    const updatedCards = [...allFlashcards, newCard];
    setAllFlashcards(updatedCards);
    localStorage.setItem('ham-radio-flashcards', JSON.stringify(updatedCards));
    
    // Close dialog and reset form
    setAddCardDialogOpen(false);
    setNewCardQuestion('');
    setNewCardAnswer('');
    setNewCardCategory('Technical');
  };
  
  // Get flashcard statistics
  const stats = getStats();
  
  return (
    <div className="space-y-4">
      {/* Flashcard study controls */}
      <div className="flex justify-between items-center">
        <div className="flex">
          <Tabs 
            value={activeMode} 
            onValueChange={(value) => setActiveMode(value as 'learn' | 'review' | 'browse')}
            className="w-full"
          >
            <TabsList className="bg-gray-800 p-1">
              <TabsTrigger 
                value="learn"
                className="data-[state=active]:bg-blue-800 text-xs"
              >
                <Brain className="h-3 w-3 mr-1" /> Learn
              </TabsTrigger>
              <TabsTrigger 
                value="review"
                className="data-[state=active]:bg-blue-800 text-xs"
              >
                <RotateCw className="h-3 w-3 mr-1" /> Review
              </TabsTrigger>
              <TabsTrigger 
                value="browse"
                className="data-[state=active]:bg-blue-800 text-xs"
              >
                <Book className="h-3 w-3 mr-1" /> Browse
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Dialog open={addCardDialogOpen} onOpenChange={setAddCardDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-green-700 hover:bg-green-600">
              <Plus className="h-4 w-4 mr-1" /> Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle>Add New Flashcard</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new flashcard to study.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Question</label>
                <Textarea 
                  value={newCardQuestion}
                  onChange={(e) => setNewCardQuestion(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter the question..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300">Answer</label>
                <Textarea 
                  value={newCardAnswer}
                  onChange={(e) => setNewCardAnswer(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter the answer..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300">Category</label>
                <Select 
                  value={newCardCategory}
                  onValueChange={setNewCardCategory}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Operating">Operating</SelectItem>
                    <SelectItem value="Regulations">Regulations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setAddCardDialogOpen(false)}
                className="bg-transparent text-gray-300 border-gray-600 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleAddCard({
                  id: "",
                  question: newCardQuestion,
                  answer: newCardAnswer,
                  category: newCardCategory
                })}
                className="bg-green-700 hover:bg-green-600"
                disabled={!newCardQuestion || !newCardAnswer}
              >
                Add Flashcard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Category filter */}
      <div className="grid grid-cols-4 gap-1">
        <button
          className={`px-2 py-1 text-xs rounded-sm ${
            activeCategory === 'all' 
              ? 'bg-blue-900 text-blue-100' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => setActiveCategory('all')}
        >
          All ({allFlashcards.length})
        </button>
        <button
          className={`px-2 py-1 text-xs rounded-sm ${
            activeCategory === 'technical' 
              ? 'bg-blue-900 text-blue-100' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => setActiveCategory('technical')}
        >
          Technical ({allFlashcards.filter(c => c.category.toLowerCase() === 'technical').length})
        </button>
        <button
          className={`px-2 py-1 text-xs rounded-sm ${
            activeCategory === 'operating' 
              ? 'bg-blue-900 text-blue-100' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => setActiveCategory('operating')}
        >
          Operating ({allFlashcards.filter(c => c.category.toLowerCase() === 'operating').length})
        </button>
        <button
          className={`px-2 py-1 text-xs rounded-sm ${
            activeCategory === 'regulations' 
              ? 'bg-blue-900 text-blue-100' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => setActiveCategory('regulations')}
        >
          Regulations ({allFlashcards.filter(c => c.category.toLowerCase() === 'regulations').length})
        </button>
      </div>
      
      {/* Study progress */}
      <div className="bg-gray-900 p-3 rounded-md mb-4 border border-gray-800">
        <div className="mb-2 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-300 flex items-center">
            <Sparkles className="h-3 w-3 mr-1 text-yellow-500" /> 
            Flashcard Progress
          </h3>
          <div className="text-xs text-gray-400">
            {activeMode === 'review' && 
              <span>{stats.dueToday} due today</span>
            }
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="bg-gray-800 rounded-sm p-1 text-center">
            <div className="text-sm font-medium text-gray-300">{stats.total}</div>
            <div className="text-[10px] text-gray-500">Total</div>
          </div>
          <div className="bg-gray-800 rounded-sm p-1 text-center">
            <div className="text-sm font-medium text-blue-300">{stats.learning}</div>
            <div className="text-[10px] text-gray-500">Learning</div>
          </div>
          <div className="bg-gray-800 rounded-sm p-1 text-center">
            <div className="text-sm font-medium text-amber-300">{stats.review}</div>
            <div className="text-[10px] text-gray-500">Review</div>
          </div>
          <div className="bg-gray-800 rounded-sm p-1 text-center">
            <div className="text-sm font-medium text-green-300">{stats.mastered}</div>
            <div className="text-[10px] text-gray-500">Mastered</div>
          </div>
        </div>
        
        {/* Mastery progress bar */}
        {stats.total > 0 && (
          <div className="mb-1">
            <div className="flex justify-between items-center mb-1 text-[10px] text-gray-400">
              <span>Mastery progress</span>
              <span>{Math.round((stats.mastered / stats.total) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-green-500"
                style={{width: `${(stats.mastered / stats.total) * 100}%`}}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Current flashcard */}
      {studyCards.length > 0 ? (
        <div>
          <div className="text-xs text-gray-400 mb-1 flex justify-between">
            <span>Card {currentCardIndex + 1} of {studyCards.length}</span>
            {activeMode === 'review' && (
              <span>
                Next review: {new Date(studyCards[currentCardIndex].nextReviewDate).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <Progress 
            value={(currentCardIndex / studyCards.length) * 100} 
            className="h-1 mb-3" 
          />
          
          <FlashcardDisplay
            card={studyCards[currentCardIndex]}
            onFlip={handleFlip}
            onRate={handleRate}
            showAnswer={showAnswer}
            isReview={activeMode === 'review'}
          />
          
          {activeMode === 'browse' && (
            <div className="mt-3 flex justify-between">
              <Button 
                onClick={() => {
                  setCurrentCardIndex(prev => Math.max(0, prev - 1));
                  setShowAnswer(false);
                }}
                className="bg-gray-800 hover:bg-gray-700"
                disabled={currentCardIndex === 0}
              >
                Previous
              </Button>
              <Button 
                onClick={() => {
                  setCurrentCardIndex(prev => Math.min(studyCards.length - 1, prev + 1));
                  setShowAnswer(false);
                }}
                className="bg-gray-800 hover:bg-gray-700"
                disabled={currentCardIndex === studyCards.length - 1}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 text-center">
          <Info className="h-6 w-6 text-blue-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-200 mb-1">No cards to study</h3>
          <p className="text-gray-400 text-sm mb-4">
            {activeCategory === 'all' 
              ? "You don't have any flashcards yet."
              : `You don't have any ${activeCategory} flashcards.`
            }
          </p>
          <Button 
            onClick={() => setAddCardDialogOpen(true)}
            className="bg-blue-800 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Your First Card
          </Button>
        </div>
      )}
    </div>
  );
}
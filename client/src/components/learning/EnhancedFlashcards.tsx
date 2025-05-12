import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Brain, RefreshCw, Check, X, ChevronRight, BookOpen, HelpCircle } from "lucide-react";
import { 
  useSpacedRepetition, 
  FlashcardWithMetadata 
} from "@/hooks/use-spaced-repetition";
import { useLearningProgress } from "@/hooks/use-learning-progress";

export default function EnhancedFlashcards() {
  // Hooks
  const { 
    flashcards, 
    getDueCards, 
    getCardsByCategory, 
    reviewCard, 
    resetCard,
    getStats 
  } = useSpacedRepetition();
  
  const { recordFlashcardReview } = useLearningProgress();
  
  // State
  const [activeTab, setActiveTab] = useState('review');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [dueCards, setDueCards] = useState<FlashcardWithMetadata[]>([]);
  const [categoryCards, setCategoryCards] = useState<FlashcardWithMetadata[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    total: 0
  });
  
  // Compute categories from flashcards
  const categories = [...new Set(flashcards.map(card => card.category))];
  
  // Get stats
  const stats = getStats();
  
  // Load cards based on active tab
  useEffect(() => {
    if (activeTab === 'review') {
      // For review tab, get all due cards
      const due = getDueCards(20);
      setDueCards(due);
      setCurrentCardIndex(0);
      setIsShowingAnswer(false);
      setSessionStats({
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: due.length
      });
    } else if (activeTab === 'browse' && currentCategory) {
      // For browse tab, get all cards in the selected category
      const cards = getCardsByCategory(currentCategory);
      setCategoryCards(cards);
      setCurrentCardIndex(0);
      setIsShowingAnswer(false);
    }
  }, [activeTab, currentCategory, flashcards.length]);
  
  // Calculate current card
  const getCurrentCard = (): FlashcardWithMetadata | null => {
    if (activeTab === 'review') {
      return dueCards.length > 0 && currentCardIndex < dueCards.length
        ? dueCards[currentCardIndex]
        : null;
    } else if (activeTab === 'browse') {
      return categoryCards.length > 0 && currentCardIndex < categoryCards.length
        ? categoryCards[currentCardIndex]
        : null;
    }
    return null;
  };
  
  // Handle card review
  const handleCardReview = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const currentCard = getCurrentCard();
    if (!currentCard) return;
    
    // Record review in spaced repetition system
    const newStatus = reviewCard(currentCard.id, quality);
    
    // Record in learning progress
    if (newStatus) {
      recordFlashcardReview(currentCard.id, newStatus, currentCard.category);
    }
    
    // Update session stats
    if (quality >= 3) {
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
    
    // Go to next card
    goToNextCard();
  };
  
  // Handle skip
  const handleSkip = () => {
    setSessionStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    goToNextCard();
  };
  
  // Go to next card
  const goToNextCard = () => {
    setCurrentCardIndex(prev => prev + 1);
    setIsShowingAnswer(false);
  };
  
  // Reset current session
  const resetSession = () => {
    if (activeTab === 'review') {
      const due = getDueCards(20);
      setDueCards(due);
      setCurrentCardIndex(0);
      setIsShowingAnswer(false);
      setSessionStats({
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: due.length
      });
    }
  };
  
  // Reset specific card
  const handleResetCard = () => {
    const currentCard = getCurrentCard();
    if (currentCard) {
      resetCard(currentCard.id);
    }
  };
  
  // Determine if the session is complete
  const isSessionComplete = (): boolean => {
    if (activeTab === 'review') {
      return currentCardIndex >= dueCards.length;
    }
    return false;
  };
  
  // Calculate session progress
  const calculateProgress = (): number => {
    if (activeTab === 'review') {
      return dueCards.length > 0 
        ? (currentCardIndex / dueCards.length) * 100
        : 0;
    }
    return 0;
  };
  
  // Get status badge color
  const getStatusColor = (status: 'new' | 'learning' | 'review' | 'mastered'): "default" | "secondary" | "outline" | "success" => {
    switch (status) {
      case 'new':
        return 'outline';
      case 'learning':
        return 'default';
      case 'review':
        return 'secondary';
      case 'mastered':
        return 'success';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          Spaced Repetition Flashcards
        </h2>
        
        <div>
          <Badge variant="outline" className="mr-2">
            {stats.total} Cards
          </Badge>
          <Badge variant="secondary">
            {stats.dueToday} Due Today
          </Badge>
        </div>
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="review">Review Due Cards</TabsTrigger>
          <TabsTrigger value="browse">Browse By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="review" className="pt-4 space-y-4">
          {isSessionComplete() ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Session Complete!</CardTitle>
                <CardDescription>
                  You've reviewed all your due cards for now.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center py-4">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{sessionStats.correct}</div>
                    <div className="text-xs text-gray-400">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{sessionStats.incorrect}</div>
                    <div className="text-xs text-gray-400">Incorrect</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-400">{sessionStats.skipped}</div>
                    <div className="text-xs text-gray-400">Skipped</div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={resetSession} className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Start New Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : dueCards.length === 0 ? (
            <Card className="bg-gray-900 border-gray-700 text-center p-8">
              <BookOpen className="h-12 w-12 mx-auto text-gray-700 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Cards Due</h3>
              <p className="text-gray-400 mb-4">
                You don't have any cards to review right now. Check back later or browse by category.
              </p>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">
                  Card {currentCardIndex + 1} of {dueCards.length}
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {getCurrentCard()?.category}
                  </Badge>
                  <Badge variant={getStatusColor(getCurrentCard()?.status || 'new')}>
                    {getCurrentCard()?.status}
                  </Badge>
                </div>
              </div>
              
              <Progress value={calculateProgress()} className="mb-4" />
              
              <Card className="bg-gray-900 border-gray-700 overflow-hidden">
                <div 
                  className={`min-h-[200px] p-6 flex items-center justify-center text-center transition-all cursor-pointer ${
                    isShowingAnswer ? 'bg-gray-800' : 'bg-gray-900'
                  }`}
                  onClick={() => setIsShowingAnswer(true)}
                >
                  {isShowingAnswer ? (
                    <div className="animate-fadeIn">
                      <p className="text-2xl font-medium text-white mb-2">
                        {getCurrentCard()?.answer}
                      </p>
                      <div className="text-sm text-gray-400">
                        Click on a rating button below
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-medium text-white mb-4">
                        {getCurrentCard()?.question}
                      </p>
                      <Button variant="outline" size="sm">
                        Show Answer
                      </Button>
                    </div>
                  )}
                </div>
                
                {isShowingAnswer && (
                  <CardFooter className="flex flex-col gap-4 pb-6 pt-4 bg-gray-800">
                    <div className="w-full">
                      <div className="grid grid-cols-4 gap-2">
                        <Button 
                          onClick={() => handleCardReview(1)} 
                          variant="outline"
                          className="bg-red-900 bg-opacity-50 border-red-700 hover:bg-red-800"
                        >
                          <div className="text-center w-full">
                            <div className="font-mono text-xs">1</div>
                            <div className="text-[10px] text-gray-400">Forgot</div>
                          </div>
                        </Button>
                        <Button 
                          onClick={() => handleCardReview(3)} 
                          variant="outline"
                          className="bg-yellow-900 bg-opacity-50 border-yellow-700 hover:bg-yellow-800"
                        >
                          <div className="text-center w-full">
                            <div className="font-mono text-xs">3</div>
                            <div className="text-[10px] text-gray-400">Hard</div>
                          </div>
                        </Button>
                        <Button 
                          onClick={() => handleCardReview(4)} 
                          variant="outline"
                          className="bg-blue-900 bg-opacity-50 border-blue-700 hover:bg-blue-800"
                        >
                          <div className="text-center w-full">
                            <div className="font-mono text-xs">4</div>
                            <div className="text-[10px] text-gray-400">Good</div>
                          </div>
                        </Button>
                        <Button 
                          onClick={() => handleCardReview(5)} 
                          variant="outline"
                          className="bg-green-900 bg-opacity-50 border-green-700 hover:bg-green-800"
                        >
                          <div className="text-center w-full">
                            <div className="font-mono text-xs">5</div>
                            <div className="text-[10px] text-gray-400">Easy</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between w-full">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleSkip}
                        className="text-gray-400"
                      >
                        Skip
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleResetCard}
                        className="text-gray-400"
                      >
                        Reset Card
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="browse" className="pt-4 space-y-4">
          <div className="mb-4">
            <Select
              value={currentCategory || ""}
              onValueChange={setCurrentCategory}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {!currentCategory ? (
            <div className="bg-gray-900 rounded-md border border-gray-800 p-8 text-center">
              <HelpCircle className="h-12 w-12 mx-auto text-gray-700 mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Category</h3>
              <p className="text-gray-400 mb-4">
                Choose a category from the dropdown to browse flashcards.
              </p>
              
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mt-6">
                {stats.categories.map(cat => (
                  <div 
                    key={cat.category} 
                    className="bg-gray-800 p-3 rounded-md border border-gray-700 cursor-pointer hover:bg-gray-750"
                    onClick={() => setCurrentCategory(cat.category)}
                  >
                    <div className="font-medium">{cat.category}</div>
                    <div className="text-sm text-gray-400">{cat.total} cards</div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="success" className="h-1.5 w-1.5 rounded-full p-0" />
                      <div className="text-xs text-gray-500">{cat.mastered} mastered</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : categoryCards.length === 0 ? (
            <div className="bg-gray-900 rounded-md border border-gray-800 p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-gray-700 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Cards</h3>
              <p className="text-gray-400 mb-4">
                This category doesn't have any flashcards yet.
              </p>
            </div>
          ) : (
            <Card className="bg-gray-900 border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                <div className="text-sm text-gray-400">
                  Card {currentCardIndex + 1} of {categoryCards.length}
                </div>
                <Badge variant={getStatusColor(getCurrentCard()?.status || 'new')}>
                  {getCurrentCard()?.status}
                </Badge>
              </div>
              
              <div 
                className={`min-h-[200px] p-6 flex items-center justify-center text-center transition-all cursor-pointer ${
                  isShowingAnswer ? 'bg-gray-800' : 'bg-gray-900'
                }`}
                onClick={() => setIsShowingAnswer(!isShowingAnswer)}
              >
                {isShowingAnswer ? (
                  <div className="animate-fadeIn">
                    <p className="text-xl font-medium text-white">
                      {getCurrentCard()?.answer}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xl font-medium text-white mb-4">
                      {getCurrentCard()?.question}
                    </p>
                    <Button variant="outline" size="sm">
                      Show Answer
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between p-3 bg-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetCard}
                  className="text-gray-400"
                >
                  Reset Card
                </Button>
                
                <Button
                  onClick={goToNextCard}
                  disabled={currentCardIndex >= categoryCards.length - 1}
                  className="bg-blue-800 hover:bg-blue-700"
                >
                  <ChevronRight className="h-4 w-4" />
                  {currentCardIndex >= categoryCards.length - 1 ? 'Last Card' : 'Next Card'}
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
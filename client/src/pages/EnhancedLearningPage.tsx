import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  BookOpen, 
  BookOpenCheck,
  Lightbulb, 
  Radio, 
  RotateCw, 
  Cpu,
  GraduationCap,
  BarChart4,
  Home as HomeIcon,
  Zap
} from "lucide-react";
import { Link, useLocation } from "wouter";

// Import enhanced learning components
import LearningDashboard from "@/components/learning/LearningDashboard";
import EnhancedFlashcards from "@/components/learning/EnhancedFlashcards";
import EnhancedMorseCodeGame from "@/components/games/EnhancedMorseCodeGame";
import CircuitSimulator from "@/components/learning/CircuitSimulator";
import ProgressBadges from "@/components/learning/ProgressBadges";

// Import hooks
import { useLearningProgress } from '@/hooks/use-learning-progress';

// Question data - import it or directly declare here
import { QUIZ_QUESTIONS } from './quizQuestions';

export default function EnhancedLearningPage() {
  // Navigation state
  const [location, setLocation] = useLocation();
  
  // Main view state
  const [activeView, setActiveView] = useState<'dashboard' | 'quiz' | 'flashcards' | 'morse' | 'circuit' | 'badges'>('dashboard');
  
  // Quiz state
  const [showQuizConfig, setShowQuizConfig] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [questionsCount, setQuestionsCount] = useState<number>(10);
  const [questionsToUse, setQuestionsToUse] = useState<typeof QUIZ_QUESTIONS>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  
  // Learning progress
  const { recordQuizCompletion } = useLearningProgress();
  
  // Filter questions by category
  const filterQuestions = (category: string) => {
    if (category === 'all') return QUIZ_QUESTIONS;
    return QUIZ_QUESTIONS.filter(q => q.category.toLowerCase() === category.toLowerCase());
  };
  
  // Get category count
  const getCategoryCount = (category: string) => {
    return filterQuestions(category).length;
  };
  
  // Start a quiz
  const startQuiz = () => {
    // Get appropriate questions for the selected category
    const categoryQuestions = filterQuestions(activeCategory);
    
    // Limit to the selected number and shuffle
    const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionsCount, shuffled.length));
    
    // Set up quiz state
    setQuestionsToUse(selected);
    setCurrentQuestion(0);
    setScore(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setShowQuizConfig(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };
  
  // Handle selecting an answer
  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    // Update score if correct
    if (answerIndex === questionsToUse[currentQuestion].correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
  };
  
  // Go to next question or finish quiz
  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;
    
    // Store the selected answer
    setUserAnswers(prev => [...prev, selectedAnswer]);
    
    // Move to next question or finish
    if (currentQuestion < questionsToUse.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz is complete
      setQuizCompleted(true);
      
      // Record progress
      recordQuizCompletion(
        activeCategory, 
        score + (selectedAnswer === questionsToUse[currentQuestion].correctAnswer ? 1 : 0), 
        questionsToUse.length
      );
    }
  };
  
  // Exit quiz back to configuration
  const exitQuiz = () => {
    setShowQuizConfig(true);
    setQuizCompleted(false);
  };
  
  // Reset all quiz state
  const resetQuiz = () => {
    setShowQuizConfig(true);
    setQuestionsToUse([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setShowExplanation(false);
  };
  
  // Return to dashboard
  const returnToDashboard = () => {
    setActiveView('dashboard');
    resetQuiz();
  };
  
  return (
    <div className="p-2">
      {/* Fixed Home Button at bottom */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link href="/frequencies">
          <button className="bg-green-600 hover:bg-green-500 p-3 rounded-full shadow-lg border-2 border-green-400 shadow-glow-green">
            <HomeIcon size={24} className="text-white" />
          </button>
        </Link>
      </div>
      
      {/* Radio display header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              Learning Module
              {activeView !== 'dashboard' && ` - ${activeView.toUpperCase()}`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {activeView !== 'dashboard' && (
              <button 
                className="text-xs text-blue-300 hover:text-blue-100 font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-800"
                onClick={returnToDashboard}
              >
                RETURN
              </button>
            )}
            <Link href="/frequencies">
              <button className="text-xs text-green-300 hover:text-green-100 font-mono bg-green-900 px-2 py-0.5 rounded border border-green-800 flex items-center gap-1">
                <HomeIcon size={10} /> HOME
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Radio code shortcuts */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-900 rounded-md px-2 py-1 text-center border border-gray-700">
          <div className="text-sm font-mono text-yellow-300">CQ</div>
          <div className="text-[10px] text-gray-400">Calling All</div>
        </div>
        <div className="bg-gray-900 rounded-md px-2 py-1 text-center border border-gray-700">
          <div className="text-sm font-mono text-yellow-300">73</div>
          <div className="text-[10px] text-gray-400">Best Wishes</div>
        </div>
        <div className="bg-gray-900 rounded-md px-2 py-1 text-center border border-gray-700">
          <div className="text-sm font-mono text-yellow-300">88</div>
          <div className="text-[10px] text-gray-400">Love & Kisses</div>
        </div>
      </div>
      
      {/* Main content area */}
      {activeView === 'dashboard' ? (
        <div>
          {/* Display learning dashboard with progress */}
          <LearningDashboard />
          
          {/* Main menu */}
          <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
            <button 
              className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-md gap-2 border border-gray-800 hover:bg-gray-800 transition-colors"
              onClick={() => setActiveView('quiz')}
            >
              <div className="bg-blue-900 p-2 rounded-full">
                <BookOpenCheck size={24} className="text-blue-200" />
              </div>
              <span className="text-sm font-medium text-gray-200">Practice Exam</span>
              <span className="text-xs text-gray-400 text-center">Test your knowledge with practice questions</span>
            </button>
            
            <button 
              className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-md gap-2 border border-gray-800 hover:bg-gray-800 transition-colors"
              onClick={() => setActiveView('flashcards')}
            >
              <div className="bg-green-900 p-2 rounded-full">
                <BookOpen size={24} className="text-green-200" />
              </div>
              <span className="text-sm font-medium text-gray-200">Flashcards</span>
              <span className="text-xs text-gray-400 text-center">Learn concepts with adaptive flashcards</span>
            </button>
            
            <button 
              className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-md gap-2 border border-gray-800 hover:bg-gray-800 transition-colors"
              onClick={() => setActiveView('morse')}
            >
              <div className="bg-amber-900 p-2 rounded-full">
                <Radio size={24} className="text-amber-200" />
              </div>
              <span className="text-sm font-medium text-gray-200">Morse Code</span>
              <span className="text-xs text-gray-400 text-center">Interactive Morse code training</span>
            </button>
            
            <button 
              className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-md gap-2 border border-gray-800 hover:bg-gray-800 transition-colors"
              onClick={() => setActiveView('circuit')}
            >
              <div className="bg-purple-900 p-2 rounded-full">
                <Cpu size={24} className="text-purple-200" />
              </div>
              <span className="text-sm font-medium text-gray-200">Circuit Simulator</span>
              <span className="text-xs text-gray-400 text-center">Experiment with interactive circuits</span>
            </button>
          </div>
          
          {/* View badges summary */}
          <div className="mt-6">
            <ProgressBadges collapsed={true} onToggleCollapsed={() => setActiveView('badges')} />
          </div>
        </div>
      ) : activeView === 'quiz' ? (
        <div>
          {showQuizConfig ? (
            <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-blue-400" />
                  Practice Exam Settings
                </h3>
                
                <div className="mb-4">
                  <div className="mb-2 text-xs text-gray-300">Select a question category:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['all', 'technical', 'regulations', 'operating'].map(category => (
                      <div 
                        key={category}
                        className={`px-2 py-1 rounded-sm text-xs cursor-pointer border ${
                          activeCategory === category 
                            ? "bg-blue-900 border-blue-600 text-blue-100" 
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                        }`}
                        onClick={() => setActiveCategory(category)}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)} ({getCategoryCount(category)})
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="mb-2 text-xs text-gray-300">Number of questions:</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map(count => (
                      <div
                        key={count}
                        className={`px-2 py-1 rounded-sm text-[10px] cursor-pointer text-center border ${
                          questionsCount === count 
                            ? "bg-blue-900 border-blue-600 text-blue-100" 
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                        }`}
                        onClick={() => setQuestionsCount(count)}
                      >
                        {count} Q
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={startQuiz} 
                    className="bg-green-800 hover:bg-green-700 text-xs w-full"
                  >
                    Start {activeCategory !== "all" ? activeCategory : ""} Practice Exam ({questionsCount} questions)
                  </Button>
                </div>
                
                <div className="mt-3 p-2 bg-blue-900 bg-opacity-20 rounded-sm text-[10px] text-gray-300 border border-blue-900">
                  <p className="mb-1"><span className="text-blue-300 font-medium">Tip:</span> The actual Canadian Basic Qualification Exam has 100 questions. A score of 70% is required to pass.</p>
                  <p>To obtain Basic with Honours (allowing HF privileges), you need to score 80% or higher.</p>
                </div>
              </div>
            </div>
          ) : !quizCompleted ? (
            <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700">
              <div className="mb-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-green-700 text-green-300">
                    {questionsToUse[currentQuestion].category}
                  </Badge>
                  <span className="text-xs text-gray-400 font-mono">
                    Q {currentQuestion + 1}/{questionsToUse.length}
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-300">
                  {Math.floor((userAnswers.length / questionsToUse.length) * 100)}% complete
                </div>
              </div>
              
              <Progress 
                value={(userAnswers.length / questionsToUse.length) * 100} 
                className="h-1 mb-3" 
              />
              
              <div className="bg-gray-900 p-3 rounded-md mb-3">
                <p className="text-sm text-gray-200">{questionsToUse[currentQuestion].question}</p>
              </div>
              
              <div className="space-y-2">
                {questionsToUse[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    className={`w-full text-left px-3 py-2 rounded-md border ${
                      selectedAnswer === idx
                        ? showExplanation
                          ? idx === questionsToUse[currentQuestion].correctAnswer
                            ? "bg-green-900 border-green-700 text-green-100"
                            : "bg-red-900 border-red-700 text-red-100"
                          : "bg-blue-900 border-blue-700 text-blue-100"
                        : "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300"
                    }`}
                    onClick={() => !showExplanation && selectAnswer(idx)}
                    disabled={showExplanation}
                  >
                    <span className="font-mono mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </button>
                ))}
              </div>
              
              {showExplanation && (
                <div className="mt-4 bg-gray-900 p-3 rounded-md border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <h4 className="text-sm font-medium text-gray-200">Explanation</h4>
                  </div>
                  <p className="text-xs text-gray-300">{questionsToUse[currentQuestion].explanation}</p>
                </div>
              )}
              
              <div className="flex justify-between mt-4">
                <Button
                  onClick={exitQuiz}
                  size="sm"
                  variant="outline"
                  className="px-3 py-0 h-7 text-xs font-medium border-gray-700 text-gray-300 hover:bg-gray-700">
                  Exit
                </Button>
                
                {showExplanation && (
                  <Button
                    onClick={handleNextQuestion}
                    size="sm"
                    className="px-3 py-0 h-7 text-xs font-medium w-28 bg-blue-800 hover:bg-blue-700">
                    {currentQuestion < questionsToUse.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-gray-200 mb-2">Quiz Complete!</h2>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {Math.round((score / questionsToUse.length) * 100)}%
                </div>
                <p className="text-sm text-gray-300">
                  You scored {score} out of {questionsToUse.length} questions correct.
                </p>
              </div>
              
              {Math.round((score / questionsToUse.length) * 100) >= 80 ? (
                <div className="mb-4 p-3 bg-green-900 bg-opacity-30 rounded-md text-center border border-green-800">
                  <GraduationCap className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="font-medium text-green-300 text-sm">Congratulations! You qualified for Basic with Honours.</p>
                  <p className="text-xs text-green-400 mt-1">You would be granted HF privileges with this score (≥80%).</p>
                </div>
              ) : Math.round((score / questionsToUse.length) * 100) >= 70 ? (
                <div className="mb-4 p-3 bg-blue-900 bg-opacity-30 rounded-md text-center border border-blue-800">
                  <GraduationCap className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="font-medium text-blue-300 text-sm">You passed the Basic Qualification!</p>
                  <p className="text-xs text-blue-400 mt-1">Aim for 80% or higher to get HF privileges.</p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-amber-900 bg-opacity-30 rounded-md text-center border border-amber-800">
                  <RotateCw className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                  <p className="font-medium text-amber-300 text-sm">You're almost there! Try again to improve your score.</p>
                  <p className="text-xs text-amber-400 mt-1">Aim for at least 70% to pass the Basic Qualification exam.</p>
                </div>
              )}
              
              <div className="mb-4">
                <Button
                  onClick={() => setShowQuizConfig(true)}
                  className="bg-blue-800 hover:bg-blue-700 w-full"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Try Another Quiz
                </Button>
              </div>
              
              {/* Question analysis */}
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-200">Question Analysis</h4>
                
                {questionsToUse.slice(0, 5).map((question, idx) => (
                  <div key={idx} className="bg-gray-900 p-2 rounded-md border-l-2 border-r-0 border-t-0 border-b-0 border-solid border-opacity-50 border-gray-700">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium text-gray-300">Question {idx + 1}</span>
                      <Badge 
                        variant="outline"
                        className={
                          userAnswers[idx] === question.correctAnswer 
                            ? "border-green-700 text-green-300" 
                            : "border-red-700 text-red-300"
                        }
                      >
                        {userAnswers[idx] === question.correctAnswer ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-300 mb-1">{question.question}</p>
                    <div className="text-[10px] text-gray-400">
                      {userAnswers[idx] !== undefined && (
                        <p>Your answer: <span className={
                          userAnswers[idx] === question.correctAnswer ? "text-green-300" : "text-red-300"
                        }>
                          {question.options[userAnswers[idx]]}
                        </span></p>
                      )}
                      {userAnswers[idx] !== question.correctAnswer && userAnswers[idx] !== undefined && (
                        <p>Correct answer: <span className="text-green-300">
                          {question.options[question.correctAnswer]}
                        </span></p>
                      )}
                    </div>
                  </div>
                ))}
                
                {questionsToUse.length > 5 && (
                  <div className="text-center text-xs text-gray-400">
                    Showing 5 of {questionsToUse.length} questions
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : activeView === 'flashcards' ? (
        <EnhancedFlashcards />
      ) : activeView === 'morse' ? (
        <EnhancedMorseCodeGame />
      ) : activeView === 'circuit' ? (
        <CircuitSimulator initialTemplate="Basic LED Circuit" />
      ) : activeView === 'badges' ? (
        <ProgressBadges collapsed={false} onToggleCollapsed={() => setActiveView('dashboard')} />
      ) : null}
    </div>
  );
}
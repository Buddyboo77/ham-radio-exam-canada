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
  Zap,
  CalendarDays,
  CheckCircle,
  Clock,
  Trophy,
  Loader2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

// Import enhanced learning components
import LearningDashboard from "@/components/learning/LearningDashboard";
import EnhancedFlashcards from "@/components/learning/EnhancedFlashcards";
import EnhancedMorseCodeGame from "@/components/games/EnhancedMorseCodeGame";
import CircuitSimulator from "@/components/learning/CircuitSimulator";
import ProgressBadges from "@/components/learning/ProgressBadges";

// Import hooks
import { useLearningProgress } from '@/hooks/use-learning-progress';

// Define types for questions
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

interface DatabaseQuestion {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: number;
  explanation: string;
  category: string;
  subcategory: string | null;
  difficulty: string;
  examType: string;
  questionNumber: string | null;
  isActive: boolean;
  createdAt: string;
}

// Convert database question to quiz question format
const convertDatabaseQuestion = (dbQuestion: DatabaseQuestion): QuizQuestion => ({
  question: dbQuestion.question,
  options: [dbQuestion.optionA, dbQuestion.optionB, dbQuestion.optionC, dbQuestion.optionD],
  correctAnswer: dbQuestion.correctAnswer,
  explanation: dbQuestion.explanation,
  category: dbQuestion.category
});

// Fallback questions for when database is unavailable
const FALLBACK_QUIZ_QUESTIONS = [
  {
    question: "What does APRS stand for?",
    options: [
      "Amateur Position Reporting System",
      "Automatic Packet Reporting System",
      "Automated Position Radio Service",
      "Amateur Packet Radio Service"
    ],
    correctAnswer: 1,
    explanation: "APRS stands for Automatic Packet Reporting System, which is used for real-time digital communications for local situational awareness.",
    category: "Operating"
  },
  {
    question: "What frequency range is allocated to the Canadian 2-meter amateur band?",
    options: [
      "144-148 MHz",
      "222-225 MHz",
      "420-450 MHz",
      "50-54 MHz"
    ],
    correctAnswer: 0,
    explanation: "The 2-meter amateur band in Canada is allocated to 144-148 MHz.",
    category: "Regulations"
  },
  {
    question: "Which of the following is NOT a digital mode used in amateur radio?",
    options: [
      "PSK31",
      "RTTY",
      "CDMA",
      "FT8"
    ],
    correctAnswer: 2,
    explanation: "CDMA (Code Division Multiple Access) is a commercial cellular technology, not an amateur radio digital mode.",
    category: "Technical"
  },
  {
    question: "What is the correct way to call CQ on a repeater?",
    options: [
      "CQ CQ CQ, this is VE7XXX calling CQ and listening",
      "VE7XXX listening",
      "This is VE7XXX, anyone around for a chat?",
      "CQ DX, CQ DX, this is VE7XXX"
    ],
    correctAnswer: 2,
    explanation: "On a repeater, it's customary to simply announce your callsign and that you're listening or available for a chat. 'CQ' calls are typically used on HF bands.",
    category: "Operating"
  },
  {
    question: "Which component is used to store electrical energy in an electric field?",
    options: [
      "Resistor",
      "Inductor",
      "Capacitor",
      "Diode"
    ],
    correctAnswer: 2,
    explanation: "A capacitor stores electrical energy in an electric field between its plates.",
    category: "Technical"
  },
  {
    question: "What is the maximum DC power input allowed for Canadian amateur operators with Basic qualification?",
    options: [
      "250 watts",
      "1000 watts",
      "100 watts",
      "1500 watts"
    ],
    correctAnswer: 0,
    explanation: "Amateur operators with Basic qualification in Canada are limited to 250 watts DC power input.",
    category: "Regulations"
  },
  {
    question: "What is the resonant frequency of a circuit with a 10 µH inductor and a 100 pF capacitor?",
    options: [
      "5.03 MHz",
      "1.59 MHz",
      "15.9 MHz",
      "50.3 MHz"
    ],
    correctAnswer: 0,
    explanation: "Using the formula f = 1/(2π√LC), the resonant frequency is 5.03 MHz.",
    category: "Technical"
  },
  {
    question: "In the RST signal reporting system, what does the 'T' stand for?",
    options: [
      "Time",
      "Tone",
      "Transmitter",
      "Throughput"
    ],
    correctAnswer: 1,
    explanation: "In the RST (Readability, Strength, Tone) signal reporting system, 'T' stands for Tone, which describes the quality of the CW (Morse code) signal.",
    category: "Operating"
  },
  {
    question: "Which of the following bands requires a special authorization in Canada?",
    options: [
      "70 cm (430-450 MHz)",
      "10 m (28-29.7 MHz)",
      "60 m (5 MHz channels)",
      "2 m (144-148 MHz)"
    ],
    correctAnswer: 2,
    explanation: "In Canada, the 60-meter band requires special authorization and has specific restrictions on power and modes.",
    category: "Regulations"
  },
  {
    question: "What is the purpose of an RF choke in an antenna system?",
    options: [
      "To match impedances",
      "To filter DC power",
      "To block RF current on the outside of a coaxial cable",
      "To reduce harmonic radiation"
    ],
    correctAnswer: 2,
    explanation: "An RF choke in an antenna system is used to block unwanted RF current from flowing on the outside of a coaxial cable shield.",
    category: "Technical"
  },
  {
    question: "Which Q-signal means 'I am changing frequency'?",
    options: [
      "QSY",
      "QRT",
      "QRZ",
      "QTH"
    ],
    correctAnswer: 0,
    explanation: "QSY means 'I am changing frequency' or 'Change your frequency to...'. Q-signals are shorthand codes used in radio communications.",
    category: "Operating"
  },
  {
    question: "As a Canadian amateur, what prefix would you use for portable operation in the U.S.?",
    options: [
      "K/VE7XXX",
      "VE7XXX/W",
      "VE7XXX/K",
      "W/VE7XXX"
    ],
    correctAnswer: 3,
    explanation: "When operating in the U.S., Canadian amateurs should use the format W/VE7XXX, indicating the U.S. prefix followed by your Canadian call sign.",
    category: "Regulations"
  },
  {
    question: "What is the velocity factor of a typical coaxial cable?",
    options: [
      "1.0",
      "0.66",
      "2.0",
      "0.1"
    ],
    correctAnswer: 1,
    explanation: "The velocity factor of a typical coaxial cable is around 0.66, meaning radio waves travel at about 66% of the speed of light through the cable.",
    category: "Technical"
  },
  {
    question: "What does the term 'QRM' refer to?",
    options: [
      "Atmospheric noise",
      "Man-made interference",
      "Fading signals",
      "A good readable signal"
    ],
    correctAnswer: 1,
    explanation: "QRM refers to man-made interference to radio communications.",
    category: "Operating"
  },
  {
    question: "Which organization is responsible for licensing amateur radio operators in Canada?",
    options: [
      "RAC (Radio Amateurs of Canada)",
      "ARRL (American Radio Relay League)",
      "ISED (Innovation, Science and Economic Development Canada)",
      "CRTC (Canadian Radio-television and Telecommunications Commission)"
    ],
    correctAnswer: 2,
    explanation: "Innovation, Science and Economic Development Canada (ISED), formerly Industry Canada, administers amateur radio regulations in Canada.",
    category: "Regulations"
  }
];

export default function EnhancedLearningPage() {
  // Navigation state
  const [location, setLocation] = useLocation();
  
  // Main view state
  const [activeView, setActiveView] = useState<'dashboard' | 'quiz' | 'flashcards' | 'morse' | 'circuit' | 'badges'>('dashboard');
  
  // Quiz state
  const [showQuizConfig, setShowQuizConfig] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [questionsCount, setQuestionsCount] = useState<number>(25);
  const [questionsToUse, setQuestionsToUse] = useState<QuizQuestion[]>([]);
  const [examMode, setExamMode] = useState<'practice' | 'simulation'>('practice');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  
  // Debug state changes
  // useEffect(() => {
  //   console.log('activeView changed to:', activeView);
  // }, [activeView]);
  
  // useEffect(() => {
  //   console.log('showQuizConfig changed to:', showQuizConfig);
  // }, [showQuizConfig]);
  
  // useEffect(() => {
  //   console.log('quizCompleted changed to:', quizCompleted);
  // }, [quizCompleted]);
  
  // Learning progress
  const { recordQuizCompletion } = useLearningProgress();

  // Fetch questions for quiz (only when starting a quiz)
  const { data: quizQuestions, isLoading: isLoadingQuestions, error: questionsError } = useQuery<DatabaseQuestion[]>({
    queryKey: ['/api/exam-questions', 'quiz', activeCategory, questionsCount],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') {
        params.append('category', activeCategory);
      }
      params.append('count', questionsCount.toString());
      
      const response = await fetch(`/api/exam-questions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    enabled: !showQuizConfig // Only fetch when starting quiz
  });

  // Fetch category counts for dashboard (lightweight)
  const { data: categoryCounts } = useQuery<Record<string, number>>({
    queryKey: ['/api/exam-questions', 'counts'],
    queryFn: async () => {
      // Fetch just the counts for each category
      const categories = ['regulations', 'operating', 'technical', 'antenna', 'safety', 'digital', 'emergency'];
      const counts: Record<string, number> = {};
      
      // Get total count
      const totalResponse = await fetch('/api/exam-questions');
      if (totalResponse.ok) {
        const allQuestions = await totalResponse.json();
        counts['all'] = allQuestions.length;
        
        // Count by category
        categories.forEach(cat => {
          counts[cat] = allQuestions.filter((q: DatabaseQuestion) => 
            q.category.toLowerCase() === cat.toLowerCase()
          ).length;
        });
      }
      
      return counts;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - counts don't change often
    retry: 1,
    enabled: showQuizConfig // Only fetch for dashboard
  });
  
  // Get category count for dashboard display
  const getCategoryCount = (category: string) => {
    return categoryCounts?.[category] || 0;
  };
  
  // Start a quiz
  const startQuiz = () => {
    // Questions will be fetched by the query when showQuizConfig becomes false
    setShowQuizConfig(false);
    
    // Set up quiz state
    setCurrentQuestion(0);
    setScore(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    // Set timer for simulation mode (time in seconds)
    if (examMode === 'simulation') {
      // For official exam simulation: 3 hours for 100 questions = 108 seconds per question
      const examTime = questionsCount === 100 ? 10800 : Math.max(questionsCount * 108, 300);
      setTimeLeft(examTime);
    } else {
      // No timer for practice mode
      setTimeLeft(null);
    }
  };
  
  // Update questions when they arrive from the API
  useEffect(() => {
    console.log('Questions useEffect triggered', {
      quizQuestions: quizQuestions?.length || 0,
      isLoadingQuestions,
      showQuizConfig,
      questionsCount
    });
    
    if (quizQuestions && quizQuestions.length > 0 && !showQuizConfig) {
      console.log('Setting questions from API:', quizQuestions.length);
      const convertedQuestions = quizQuestions.map(convertDatabaseQuestion);
      setQuestionsToUse(convertedQuestions);
    } else if (!quizQuestions && !isLoadingQuestions && !showQuizConfig && questionsError) {
      console.log('API failed, using fallback questions');
      // Fallback to sample questions if API fails
      const fallbackQuestions = FALLBACK_QUIZ_QUESTIONS.slice(0, Math.min(questionsCount, FALLBACK_QUIZ_QUESTIONS.length));
      setQuestionsToUse(fallbackQuestions);
    }
  }, [quizQuestions, isLoadingQuestions, showQuizConfig, questionsCount, questionsError]);

  // Timer effect for simulation mode
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (examMode === 'simulation' && timeLeft !== null && timeLeft > 0 && !quizCompleted && !showQuizConfig) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime && prevTime > 1) {
            return prevTime - 1;
          } else {
            // Auto-submit the exam when time runs out
            console.log('Timer expired, completing quiz');
            setQuizCompleted(true);
            return 0;
          }
        });
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [examMode, quizCompleted, showQuizConfig]); // Removed timeLeft from dependencies
  
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
    console.log('handleNextQuestion called', {
      selectedAnswer,
      currentQuestion,
      questionsLength: questionsToUse.length,
      showQuizConfig,
      quizCompleted
    });
    
    if (selectedAnswer === null) {
      console.log('No answer selected, returning early');
      return;
    }
    
    // Store the selected answer
    setUserAnswers(prev => [...prev, selectedAnswer]);
    
    // Move to next question or finish
    if (currentQuestion < questionsToUse.length - 1) {
      console.log('Moving to next question:', currentQuestion + 1);
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      console.log('Quiz completed!');
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
    console.log('exitQuiz called - showing quiz config');
    console.trace('exitQuiz stack trace');
    setShowQuizConfig(true);
    setQuizCompleted(false);
  };
  
  // Reset all quiz state
  const resetQuiz = () => {
    console.log('resetQuiz called - resetting all state');
    console.trace('resetQuiz stack trace');
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
    console.log('returnToDashboard called');
    console.trace('returnToDashboard stack trace');
    setActiveView('dashboard');
    resetQuiz();
  };
  
  return (
    <div className="p-2">
      {/* Fixed Home Button at bottom */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link href="/learning">
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('RETURN button clicked - calling returnToDashboard');
                  returnToDashboard();
                }}
              >
                RETURN
              </button>
            )}
            <Link href="/learning">
              <button 
                className="text-xs text-green-300 hover:text-green-100 font-mono bg-green-900 px-2 py-0.5 rounded border border-green-800 flex items-center gap-1"
                onClick={() => console.log('HOME button clicked - navigating to /learning')}
              >
                <HomeIcon size={10} /> HOME
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Exam info banner */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 rounded-md p-3 mb-3 border border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="text-blue-300" size={18} />
          <h3 className="text-sm font-medium text-blue-100">Canadian Amateur Radio Exam Preparation</h3>
        </div>
        <p className="text-xs text-gray-300">Study the material, take practice tests, and master Morse code to prepare for your ham radio license exam. Complete all modules to be fully prepared.</p>
      </div>
      
      {/* Main content area */}
      {activeView === 'dashboard' ? (
        <div>
          {/* Exam practice tests at the very top */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
              <BookOpenCheck size={18} className="text-blue-300" />
              Exam Practice Tests
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="flex flex-col items-center justify-center p-4 bg-blue-900 rounded-md gap-2 border border-blue-700 hover:bg-blue-800 transition-colors"
                onClick={() => setActiveView('quiz')}
              >
                <div className="bg-blue-800 p-2 rounded-full">
                  <BookOpenCheck size={24} className="text-blue-100" />
                </div>
                <span className="text-sm font-medium text-blue-100">License Exam</span>
                <span className="text-xs text-blue-300 text-center">Practice with official Canadian exam questions</span>
              </button>
              
              <button 
                className="flex flex-col items-center justify-center p-4 bg-green-900 rounded-md gap-2 border border-green-700 hover:bg-green-800 transition-colors"
                onClick={() => setActiveView('flashcards')}
              >
                <div className="bg-green-800 p-2 rounded-full">
                  <BookOpen size={24} className="text-green-100" />
                </div>
                <span className="text-sm font-medium text-green-100">Study Cards</span>
                <span className="text-xs text-green-300 text-center">Master license concepts with spaced repetition</span>
              </button>
            </div>
          </div>
          
          {/* Display learning dashboard with progress */}
          <LearningDashboard />
          
          {/* Learning Resources section at the bottom */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-purple-300" />
              Learning Resources
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/morse-code" 
                className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-md gap-2 border border-gray-800 hover:bg-gray-800 transition-colors"
              >
                <div className="bg-amber-900 p-2 rounded-full">
                  <Radio size={24} className="text-amber-200" />
                </div>
                <span className="text-sm font-medium text-gray-200">Morse Code</span>
                <span className="text-xs text-gray-400 text-center">Master Morse code for ham radio operations</span>
              </Link>
              
              <Link 
                href="/reference" 
                className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-md gap-2 border border-gray-800 hover:bg-gray-800 transition-colors"
              >
                <div className="bg-purple-900 p-2 rounded-full">
                  <BookOpen size={24} className="text-purple-200" />
                </div>
                <span className="text-sm font-medium text-gray-200">Reference Guide</span>
                <span className="text-xs text-gray-400 text-center">Essential reference materials for your exam</span>
              </Link>
            </div>
          </div>
          
          {/* View badges summary */}
          <div className="mt-6">
            {/* Achievement badges removed */}
          </div>
        </div>
      ) : activeView === 'quiz' ? (
        <div>
          {/* Loading state for questions */}
          {isLoadingQuestions ? (
            <div className="bg-gray-800 bg-opacity-70 rounded-md p-6 border border-gray-700 text-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <h3 className="text-lg font-medium text-blue-200">Loading Exam Questions</h3>
                <p className="text-sm text-gray-300">Fetching thousands of practice questions from our database...</p>
              </div>
            </div>
          ) : questionsError ? (
            <div className="bg-gray-800 bg-opacity-70 rounded-md p-6 border border-gray-700">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <h3 className="text-lg font-medium text-red-200">Unable to Load Questions</h3>
                <p className="text-sm text-gray-300">
                  There was an error loading the exam questions from our database. Using fallback questions for now.
                </p>
                <p className="text-xs text-gray-400">
                  Questions loaded: {FALLBACK_QUIZ_QUESTIONS.length} available (fallback)
                </p>
              </div>
            </div>
          ) : showQuizConfig ? (
            <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-blue-200 mb-3 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-400" />
                  Canadian Amateur Radio Exam Preparation
                </h3>
                
                <div className="bg-blue-950 bg-opacity-40 rounded-md p-3 mb-4 border border-blue-900">
                  <p className="text-xs text-blue-200">
                    The Basic Qualification exam consists of 100 multiple-choice questions, drawn from the Basic Question Bank.
                    You must score at least 70% to pass. Practice with different sections to build your knowledge.
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="mb-2 text-xs text-gray-300 font-semibold">Select Exam Section:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['all', 'technical', 'regulations', 'operating'].map(category => (
                      <div 
                        key={category}
                        className={`px-2 py-2 rounded-md text-xs cursor-pointer border ${
                          activeCategory === category 
                            ? "bg-blue-900 border-blue-600 text-blue-100" 
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                        } flex flex-col items-center justify-center`}
                        onClick={() => setActiveCategory(category)}
                      >
                        <span className="font-medium">{category === 'all' ? 'Full Exam' : category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        <span className="text-[10px] mt-1">({getCategoryCount(category)} Questions)</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="mb-2 text-xs text-gray-300 font-semibold">Number of Questions:</div>
                  <div className="grid grid-cols-5 gap-2">
                    {[10, 25, 50, 75, 100].map(count => (
                      <div
                        key={count}
                        className={`px-2 py-2 rounded-md text-xs cursor-pointer text-center border ${
                          questionsCount === count 
                            ? "bg-blue-900 border-blue-600 text-blue-100" 
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                        }`}
                        onClick={() => setQuestionsCount(count)}
                      >
                        {count}
                        {count === 100 && <span className="ml-1 text-[10px] bg-green-700 px-1 rounded">Official</span>}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="mb-2 text-xs text-gray-300 font-semibold">Exam Mode:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      className={`px-2 py-2 rounded-md text-xs cursor-pointer border ${
                        examMode === 'practice' 
                          ? "bg-green-800 border-green-600 text-green-100" 
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                      } flex flex-col items-center`}
                      onClick={() => setExamMode('practice')}
                    >
                      <div className="flex items-center gap-1.5">
                        <BookOpenCheck size={14} className="text-green-400" />
                        <span className="font-medium">Practice Mode</span>
                      </div>
                      <span className="text-[10px] mt-1">See explanations & instant feedback</span>
                    </div>
                    
                    <div 
                      className={`px-2 py-2 rounded-md text-xs cursor-pointer border ${
                        examMode === 'simulation' 
                          ? "bg-amber-800 border-amber-600 text-amber-100" 
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                      } flex flex-col items-center`}
                      onClick={() => setExamMode('simulation')}
                    >
                      <div className="flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-amber-400" />
                        <span className="font-medium">Exam Simulation</span>
                      </div>
                      <span className="text-[10px] mt-1">Timed, results at end (realistic)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={startQuiz} 
                    className={`text-sm w-full py-3 flex items-center justify-center gap-2 ${
                      examMode === 'practice' 
                        ? 'bg-green-800 hover:bg-green-700 text-white'
                        : 'bg-amber-800 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {examMode === 'practice' 
                      ? <BookOpenCheck className="h-4 w-4" />
                      : <GraduationCap className="h-4 w-4" />
                    }
                    {examMode === 'practice' 
                      ? `Start ${activeCategory !== "all" ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) : "Full"} Practice Exam (${questionsCount} Q)` 
                      : `Begin Official Exam Simulation (${questionsCount} Questions)`
                    }
                  </Button>
                </div>
                
                <div className="mt-3 p-2 bg-blue-900 bg-opacity-20 rounded-sm text-[10px] text-gray-300 border border-blue-900">
                  <p className="mb-1"><span className="text-blue-300 font-medium">Note:</span> The Canadian Basic Qualification Exam has 100 questions. A score of 70% is required to pass.</p>
                  <p>To obtain Basic with Honours (allowing HF privileges), you need to score 80% or higher.</p>
                </div>
              </div>
            </div>
          ) : isLoadingQuestions ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-300">Loading practice questions...</p>
              <p className="text-xs text-gray-400 mt-2">
                Fetching {questionsCount} questions for {activeCategory === 'all' ? 'all categories' : activeCategory}
              </p>
            </div>
          ) : questionsToUse.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Questions not available</p>
              <p className="text-xs text-gray-400 mb-4">
                Debug: Questions received: {quizQuestions?.length || 0}, Error: {questionsError ? 'yes' : 'no'}
              </p>
              <Button onClick={() => setShowQuizConfig(true)} className="mt-4">
                <RotateCw className="w-4 h-4 mr-2" />
                Back to Quiz Settings
              </Button>
            </div>
          ) : !quizCompleted ? (
            (() => {
              console.log('Rendering quiz question', {
                currentQuestion,
                questionsToUseLength: questionsToUse.length,
                showQuizConfig,
                quizCompleted,
                questionExists: !!questionsToUse[currentQuestion]
              });
              
              if (!questionsToUse[currentQuestion]) {
                console.error('Question not found at index', currentQuestion, 'Array length:', questionsToUse.length);
                return (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Question not found</p>
                    <p className="text-xs text-gray-400 mb-4">
                      Trying to access question {currentQuestion + 1} but only {questionsToUse.length} questions loaded
                    </p>
                    <Button onClick={() => setShowQuizConfig(true)}>
                      <RotateCw className="w-4 h-4 mr-2" />
                      Restart Quiz
                    </Button>
                  </div>
                );
              }
              
              return (
                <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700">
                  <div className="mb-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant={examMode === 'practice' ? "outline" : "default"} 
                        className={`text-xs ${examMode === 'practice' 
                          ? 'border-green-700 text-green-300' 
                          : 'bg-amber-800 text-amber-100'
                        }`}
                      >
                        {questionsToUse[currentQuestion].category} Section
                      </Badge>
                  {examMode === 'simulation' && timeLeft && (
                    <Badge variant="default" className="bg-red-800 text-red-100 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300 font-mono">
                    Question {currentQuestion + 1} of {questionsToUse.length}
                  </span>
                  <Badge variant="secondary" className="text-xs bg-gray-700">
                    {Math.floor((userAnswers.length / questionsToUse.length) * 100)}% complete
                  </Badge>
                </div>
              </div>
              
              <Progress 
                value={(userAnswers.length / questionsToUse.length) * 100} 
                className="h-1.5 mb-4" 
              />
              
              <div className="bg-gradient-to-r from-gray-900 to-gray-850 p-4 rounded-md mb-4 border border-gray-700 shadow-sm">
                <p className="text-sm text-gray-100 font-medium">{questionsToUse[currentQuestion].question}</p>
              </div>
              
              <div className="space-y-3">
                {questionsToUse[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    className={`w-full text-left px-4 py-3 rounded-md border ${
                      selectedAnswer === idx
                        ? showExplanation
                          ? idx === questionsToUse[currentQuestion].correctAnswer
                            ? "bg-green-900 border-green-700 text-green-100"
                            : "bg-red-900 border-red-700 text-red-100"
                          : "bg-blue-900 border-blue-700 text-blue-100"
                        : examMode === 'simulation'
                          ? "bg-gray-900 hover:bg-gray-800 border-gray-800 text-gray-200"
                          : "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200"
                    }`}
                    onClick={() => !showExplanation && selectAnswer(idx)}
                    disabled={showExplanation}
                  >
                    <div className="flex">
                      <div className="w-6 font-mono font-bold mr-2">{String.fromCharCode(65 + idx)})</div>
                      <div>{option}</div>
                    </div>
                    {showExplanation && idx === questionsToUse[currentQuestion].correctAnswer && (
                      <div className="mt-2 text-xs text-green-300 border-t border-green-800 pt-2">
                        ✓ Correct Answer
                      </div>
                    )}
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Exit button clicked in quiz - calling exitQuiz');
                    exitQuiz();
                  }}
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
              );
            })()
          ) : (
            <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-gray-200 mb-2">
                  {examMode === 'simulation' ? 'Exam Results' : 'Practice Results'}
                </h2>
                <div className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
                  <span className={`${
                    Math.round((score / questionsToUse.length) * 100) >= 80 
                      ? 'text-green-400' 
                      : Math.round((score / questionsToUse.length) * 100) >= 70 
                        ? 'text-blue-400' 
                        : 'text-red-400'
                  }`}>
                    {Math.round((score / questionsToUse.length) * 100)}%
                  </span>
                  {Math.round((score / questionsToUse.length) * 100) >= 80 && (
                    <Badge className="bg-green-700 text-green-100">Honours</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-300">
                  You answered {score} out of {questionsToUse.length} questions correctly.
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
        <div className="text-center p-4">
          <p className="text-gray-300">Achievement badges have been removed to focus on exam preparation.</p>
          <button 
            onClick={() => setActiveView('dashboard')}
            className="mt-3 px-4 py-1 bg-blue-800 hover:bg-blue-700 rounded-md text-sm text-white"
          >
            Back to Dashboard
          </button>
        </div>
      ) : null}
    </div>
  );
}
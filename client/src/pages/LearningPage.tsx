import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Award, 
  BookOpen, 
  ExternalLink, 
  FlaskConical, 
  Lightbulb, 
  Radio, 
  RotateCw, 
  GamepadIcon,
  GraduationCap,
  Zap,
  BookOpenCheck,
  BarChart4
} from "lucide-react";
import MorseCodeGame from "@/components/games/MorseCodeGame";
import { useState } from "react";

// Flashcard data
const FLASHCARDS = [
  {
    question: "What is the wavelength of a radio wave with a frequency of 146.52 MHz?",
    answer: "Approximately 2 meters",
    category: "Technical"
  },
  {
    question: "What is the purpose of an antenna tuner?",
    answer: "To match the impedance of the radio to the impedance of the antenna",
    category: "Technical"
  },
  {
    question: "What does APRS stand for?",
    answer: "Automatic Packet Reporting System",
    category: "Operating"
  },
  {
    question: "What type of electronic component opposes any change in current?",
    answer: "Inductor",
    category: "Technical"
  },
  {
    question: "What is the phonetic alphabet designation for the letter 'Q'?",
    answer: "Quebec",
    category: "Operating"
  },
  {
    question: "What does 'QTH' mean in Q codes?",
    answer: "My location is...",
    category: "Operating"
  },
  {
    question: "What does SWR stand for?",
    answer: "Standing Wave Ratio",
    category: "Technical"
  },
  {
    question: "What does DMR stand for?",
    answer: "Digital Mobile Radio",
    category: "Digital Modes"
  },
  {
    question: "What is the standard frequency used for APRS in North America?",
    answer: "144.390 MHz",
    category: "Digital Modes"
  },
  {
    question: "What is the primary purpose of a balun?",
    answer: "To convert between balanced and unbalanced lines",
    category: "Technical"
  }
];

// Sample questions from Canadian Amateur Radio exam syllabus
const QUIZ_QUESTIONS = [
  {
    question: "Which of the following is NOT a valid band for amateur radio operators in Canada?",
    options: [
      "2 meters (144-148 MHz)",
      "70 centimeters (430-450 MHz)",
      "5 meters (60-64 MHz)",
      "6 meters (50-54 MHz)"
    ],
    correctAnswer: 2,
    explanation: "The 5 meter band (60-64 MHz) is not allocated to amateur radio in Canada. The valid bands are 6 meters (50-54 MHz), 2 meters (144-148 MHz), and 70 centimeters (430-450 MHz).",
    category: "Regulations"
  },
  {
    question: "What is the maximum transmitting power allowed for Basic qualification holders with Honours in Canada?",
    options: [
      "100 watts",
      "250 watts",
      "560 watts",
      "1000 watts"
    ],
    correctAnswer: 1,
    explanation: "Basic with Honours operators are limited to 250 watts PEP (peak envelope power) output.",
    category: "Regulations"
  },
  {
    question: "What does SWR stand for?",
    options: [
      "Signal Wattage Reading",
      "Standing Wave Ratio",
      "Simple Wire Resonance",
      "Single Wave Reflection"
    ],
    correctAnswer: 1,
    explanation: "SWR stands for Standing Wave Ratio, which measures the efficiency of the antenna system.",
    category: "Technical"
  },
  {
    question: "What is the proper way to call another station on a repeater?",
    options: [
      "Say 'Breaker, breaker' followed by the other station's call sign",
      "Say the other station's call sign, followed by 'this is' and your call sign",
      "Say your call sign followed by the other station's call sign",
      "Whistle into the microphone to get attention, then say both call signs"
    ],
    correctAnswer: 1,
    explanation: "The proper procedure is to say the call sign of the station you are calling, followed by 'this is' and your call sign.",
    category: "Operating"
  },
  {
    question: "Which of the following modes is most effective for long-distance communication during poor conditions?",
    options: [
      "FM voice",
      "CW (Morse code)",
      "SSB voice",
      "AM voice"
    ],
    correctAnswer: 1,
    explanation: "CW (Morse code) is the most effective mode for long-distance communication during poor conditions because it has the narrowest bandwidth and can be copied at lower signal-to-noise ratios.",
    category: "Technical"
  }
];

// Flashcard component
interface FlashcardProps {
  card: {
    question: string;
    answer: string;
    category: string;
  };
  onNext: () => void;
}

function Flashcard({ card, onNext }: FlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };
  
  const handleNext = () => {
    setShowAnswer(false);
    onNext();
  };
  
  return (
    <div className="p-2">
      <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700">
        <div className="mb-3 flex justify-between items-center">
          <Badge variant="outline" className="text-[10px] border-blue-700 text-blue-300">{card.category}</Badge>
          <div className="text-xs text-gray-400 font-mono">CARD MODE</div>
        </div>
        
        <div className="bg-gray-900 rounded-md p-3 mb-3">
          <div className="text-xs text-blue-300 uppercase mb-1 font-mono">Question:</div>
          <p className="text-sm text-gray-200">{card.question}</p>
        </div>
        
        {showAnswer ? (
          <div className="bg-gray-900 rounded-md p-3 mb-3 border-l-2 border-green-500">
            <div className="text-xs text-green-400 uppercase mb-1 font-mono">Answer:</div>
            <p className="text-sm text-gray-200">{card.answer}</p>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <Button 
              onClick={toggleAnswer} 
              className="bg-blue-800 hover:bg-blue-700 text-xs h-8"
            >
              Reveal Answer
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          {showAnswer && (
            <div className="flex gap-2">
              <Button 
                onClick={handleNext} 
                className="bg-green-800 hover:bg-green-700 text-xs h-7"
              >
                Next Card
              </Button>
              <Button 
                onClick={toggleAnswer} 
                variant="outline" 
                className="text-xs h-7 border-gray-700 text-gray-300"
              >
                Hide
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Quiz Component
interface QuizProps {
  questions: typeof QUIZ_QUESTIONS;
}

function Quiz({ questions }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  
  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showExplanation) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
    
    setAnsweredQuestions(prev => [...prev, currentQuestion]);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion >= questions.length - 1) {
      setQuizComplete(true);
      return;
    }
    
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentQuestion(prevQuestion => prevQuestion + 1);
  };
  
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizComplete(false);
    setAnsweredQuestions([]);
  };
  
  return (
    <div className="p-2">
      {!quizComplete ? (
        <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700">
          <div className="mb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-green-700 text-green-300">{questions[currentQuestion].category}</Badge>
              <span className="text-xs text-gray-400 font-mono">Q {currentQuestion + 1}/{questions.length}</span>
            </div>
            <div className="text-xs font-mono text-gray-300">
              Score: {score}/{answeredQuestions.length}
              {answeredQuestions.length > 0 && (
                <span className="text-green-400 ml-1">
                  ({Math.round((score / answeredQuestions.length) * 100)}%)
                </span>
              )}
            </div>
          </div>
          
          <Progress value={(currentQuestion / questions.length) * 100} className="mb-3 h-1.5" />
          
          <div className="bg-gray-900 rounded-md p-3 mb-3">
            <p className="text-sm text-gray-200 mb-3">{questions[currentQuestion].question}</p>
            <div className="space-y-2">
              {questions[currentQuestion].options.map((option, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-sm border cursor-pointer transition-colors ${
                    selectedAnswer === index 
                      ? index === questions[currentQuestion].correctAnswer 
                        ? 'bg-green-900 border-green-700' 
                        : 'bg-red-900 border-red-700'
                      : 'hover:bg-gray-800 border-gray-700'
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-sm flex items-center justify-center mr-2 ${
                      selectedAnswer === index 
                        ? index === questions[currentQuestion].correctAnswer 
                          ? 'bg-green-700 text-white' 
                          : 'bg-red-700 text-white'
                        : 'bg-gray-700'
                    }`}>
                      {['A', 'B', 'C', 'D'][index]}
                    </div>
                    <span className="text-xs text-gray-300">{option}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {showExplanation && (
              <div className="mt-3 p-2 bg-blue-900 bg-opacity-30 rounded-sm border border-blue-800">
                <div className="flex items-center mb-1">
                  <AlertCircle className="mr-1 h-3 w-3 text-blue-400" />
                  <div className="text-[10px] font-medium uppercase text-blue-300">Explanation:</div>
                </div>
                <p className="text-xs text-gray-300">{questions[currentQuestion].explanation}</p>
              </div>
            )}
          </div>
          
          {showExplanation && (
            <div className="flex justify-end">
              <Button
                onClick={handleNextQuestion}
                size="sm"
                className="px-3 py-0 h-7 text-xs font-medium w-28 bg-blue-800 hover:bg-blue-700">
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-gray-200 mb-2">Quiz Complete!</h2>
            <div className="text-3xl font-bold text-blue-400 mb-2">{Math.round((score / questions.length) * 100)}%</div>
            <p className="text-sm text-gray-300">You scored {score} out of {questions.length} questions correct.</p>
          </div>
          
          {Math.round((score / questions.length) * 100) >= 70 ? (
            <div className="mb-4 p-3 bg-green-900 bg-opacity-30 rounded-md text-center border border-green-800">
              <Award className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="font-medium text-green-300 text-sm">Congratulations! You passed the practice exam.</p>
              <p className="text-xs text-green-400 mt-1">70% is the required passing score for the Basic Qualification.</p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-amber-900 bg-opacity-30 rounded-md text-center border border-amber-800">
              <RotateCw className="h-5 w-5 text-amber-400 mx-auto mb-2" />
              <p className="font-medium text-amber-300 text-sm">You're almost there! Try again to improve your score.</p>
              <p className="text-xs text-amber-400 mt-1">Aim for at least 70% to pass the actual Basic Qualification exam.</p>
            </div>
          )}
          
          <div className="flex justify-center">
            <Button onClick={resetQuiz} className="bg-blue-800 hover:bg-blue-700 text-sm">
              Restart Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Learning Page Component
export default function LearningPage() {
  const [showMorseGame, setShowMorseGame] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [learningMode, setLearningMode] = useState<'main' | 'morse' | 'quiz' | 'flashcards'>('main');

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % FLASHCARDS.length);
  };

  // Reset all views
  const resetViews = () => {
    setShowMorseGame(false);
    setShowQuiz(false);
    setShowFlashcard(false);
    setLearningMode('main');
  };

  // Toggle a specific view
  const toggleView = (view: 'morse' | 'quiz' | 'flashcards') => {
    resetViews();
    setLearningMode(view);
    
    if (view === 'morse') setShowMorseGame(true);
    if (view === 'quiz') setShowQuiz(true);
    if (view === 'flashcards') setShowFlashcard(true);
  };

  return (
    <div className="p-2">
      {/* Radio display header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              Learning Module {learningMode !== 'main' ? `- ${learningMode.toUpperCase()}` : ''}
            </h2>
          </div>
          {learningMode !== 'main' && (
            <button 
              className="text-xs text-blue-300 hover:text-blue-100 font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-800"
              onClick={resetViews}
            >
              RETURN
            </button>
          )}
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
          <div className="text-sm font-mono text-yellow-300">DX</div>
          <div className="text-[10px] text-gray-400">Distance</div>
        </div>
      </div>
      
      {/* Main content area with radio styling */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        {showMorseGame ? (
          <MorseCodeGame />
        ) : showQuiz ? (
          <Quiz questions={QUIZ_QUESTIONS} />
        ) : showFlashcard ? (
          <Flashcard card={FLASHCARDS[currentCardIndex]} onNext={handleNextCard} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Morse Code Practice Option */}
            <div 
              className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden hover:border-blue-600 transition-colors cursor-pointer"
              onClick={() => toggleView('morse')}
            >
              <div className="bg-gradient-to-r from-purple-900 to-blue-900 px-3 py-1.5 border-b border-gray-700">
                <h3 className="text-sm font-medium text-white flex items-center">
                  <GamepadIcon className="h-3.5 w-3.5 mr-1.5 text-purple-300" />
                  Morse Code Practice
                </h3>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-300">
                  Master Morse code through interactive practice - essential for ham radio operation
                </p>
                <div className="mt-2 px-2 py-1 bg-gray-900 rounded-sm text-center">
                  <span className="text-xs font-mono text-blue-300">· · · — — — · · ·</span>
                </div>
              </div>
            </div>
            
            {/* Practice Quiz Option */}
            <div 
              className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden hover:border-blue-600 transition-colors cursor-pointer"
              onClick={() => toggleView('quiz')}
            >
              <div className="bg-gradient-to-r from-green-900 to-blue-900 px-3 py-1.5 border-b border-gray-700">
                <h3 className="text-sm font-medium text-white flex items-center">
                  <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-green-300" />
                  Practice Exam
                </h3>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-300">
                  Test your knowledge with real exam questions from the Canadian Amateur Radio test
                </p>
                <div className="mt-2 px-2 py-1 bg-gray-900 rounded-sm text-center">
                  <span className="text-xs text-green-400 flex justify-center gap-1 items-center">
                    <Badge variant="outline" className="text-[9px] border-green-800 py-0">Basic</Badge>
                    <Badge variant="outline" className="text-[9px] border-green-800 py-0">Advanced</Badge>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Flashcards Option */}
            <div 
              className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden hover:border-blue-600 transition-colors cursor-pointer"
              onClick={() => toggleView('flashcards')}
            >
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-3 py-1.5 border-b border-gray-700">
                <h3 className="text-sm font-medium text-white flex items-center">
                  <BookOpenCheck className="h-3.5 w-3.5 mr-1.5 text-blue-300" />
                  Flashcards
                </h3>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-300">
                  Learn key concepts with flashcards covering terms, operating procedures, and regulations
                </p>
                <div className="mt-2 px-2 py-1 bg-gray-900 rounded-sm text-center">
                  <span className="text-xs text-blue-400 flex justify-center gap-1 items-center">
                    <BarChart4 className="h-3 w-3" /> 10 Cards
                  </span>
                </div>
              </div>
            </div>
            
            {/* Exam Resources */}
            <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-900 to-orange-900 px-3 py-1.5 border-b border-gray-700">
                <h3 className="text-sm font-medium text-white flex items-center">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-amber-300" />
                  Exam Resources
                </h3>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-300 mb-2">
                  Official exam preparation materials
                </p>
                <div className="space-y-1">
                  <div className="px-2 py-1 bg-gray-900 rounded-sm text-[10px] text-amber-300">
                    Canadian Amateur Radio Basic Qualification
                  </div>
                  <div className="px-2 py-1 bg-gray-900 rounded-sm text-[10px] text-amber-300">
                    Industry Canada Study Guide (IC-2828)
                  </div>
                </div>
              </div>
            </div>
            
            {/* Study Tips */}
            <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-900 to-blue-900 px-3 py-1.5 border-b border-gray-700">
                <h3 className="text-sm font-medium text-white flex items-center">
                  <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-cyan-300" />
                  Study Tips
                </h3>
              </div>
              <div className="p-2">
                <ul className="space-y-1 text-[10px] text-gray-300 list-disc ml-3">
                  <li>Practice Morse 15 minutes daily</li>
                  <li>Study Q-codes and abbreviations</li>
                  <li>Review frequency bands</li>
                  <li>Take practice tests regularly</li>
                </ul>
              </div>
            </div>
            
            {/* Exam Session */}
            <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-red-900 to-red-800 px-3 py-1.5 border-b border-gray-700">
                <h3 className="text-sm font-medium text-white flex items-center">
                  <Radio className="h-3.5 w-3.5 mr-1.5 text-red-300" />
                  Local Exam Sessions
                </h3>
              </div>
              <div className="p-2">
                <div className="space-y-1">
                  <div className="px-2 py-1 bg-gray-900 rounded-sm">
                    <div className="text-[10px] font-medium text-red-300">Powell River Amateur Radio Club</div>
                    <div className="text-[9px] text-gray-400">Next: Second Wednesday, 7:00pm</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
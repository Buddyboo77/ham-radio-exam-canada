import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Award, BookOpen, ExternalLink, FlaskConical, Lightbulb, Radio, RotateCw, GamepadIcon } from "lucide-react";
import MorseCodeGame from "@/components/games/MorseCodeGame";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

// Practice quiz questions (simplified for demo)
const QUIZ_QUESTIONS = [
  {
    question: "Which of the following is NOT a valid band for amateur radio operators in Canada?",
    options: [
      "2 meters (144-148 MHz)",
      "70 centimeters (430-450 MHz)",
      "5 meters (60-64 MHz)",
      "6 meters (50-54 MHz)"
    ],
    correctAnswer: 2
  },
  {
    question: "What is the maximum transmitting power allowed for Basic qualification holders with Honours in Canada?",
    options: [
      "100 watts",
      "250 watts",
      "500 watts",
      "1000 watts"
    ],
    correctAnswer: 1
  },
  {
    question: "When identifying your station, how often must you send your call sign?",
    options: [
      "Every 5 minutes during a contact and at the end",
      "At the beginning and end of a contact",
      "At least every 30 minutes during a contact and at the end",
      "Only at the end of a contact"
    ],
    correctAnswer: 2
  },
  {
    question: "Which of the following frequency bands has the longest range during nighttime hours?",
    options: [
      "20 meters",
      "40 meters",
      "80 meters",
      "2 meters"
    ],
    correctAnswer: 2
  },
  {
    question: "What is the relationship between frequency and wavelength?",
    options: [
      "They are directly proportional",
      "They are inversely proportional",
      "They are independent of each other",
      "They increase together logarithmically"
    ],
    correctAnswer: 1
  }
];

// Exam resources
const EXAM_RESOURCES = [
  {
    title: "Industry Canada Amateur Radio Operator Certificate",
    description: "Official exam information",
    url: "https://www.ic.gc.ca/eic/site/025.nsf/eng/h_00006.html"
  },
  {
    title: "Radio Amateurs of Canada (RAC)",
    description: "Exam preparation guides and resources",
    url: "https://www.rac.ca/amateur-radio-courses/"
  },
  {
    title: "HamExam.ca",
    description: "Practice exams and question banks",
    url: "https://www.hamexam.ca/"
  },
  {
    title: "ExHAMiner App",
    description: "Mobile app for exam preparation",
    url: "https://play.google.com/store/apps/details?id=com.cwhite.hamexam"
  },
  {
    title: "Powell River Amateur Radio Club",
    description: "Local exam sessions and study groups",
    url: "https://powellriverarc.ca"
  },
  {
    title: "Basic Qualification Study Guide",
    description: "Official RAC study guide",
    url: "https://www.coaxpublications.ca/basic.php"
  }
];

// Local exam sessions
const LOCAL_EXAMS = [
  {
    title: "Powell River Amateur Radio Club",
    location: "Powell River Recreation Complex",
    schedule: "First Tuesday of each month, 7:00 PM (after club meeting)",
    contact: "examiner@powellriverarc.ca",
    notes: "Contact the club 2 weeks in advance to schedule"
  },
  {
    title: "Vancouver Island Regional ExamFest",
    location: "Comox Valley Community Center",
    schedule: "Every 3 months, next session: August 15, 2023",
    contact: "ve7xyz@rac.ca",
    notes: "Pre-registration required, bring two pieces of ID"
  }
];

interface FlashcardProps {
  card: {
    question: string;
    answer: string;
    category: string;
  };
  onNext: () => void;
}

function Flashcard({ card, onNext }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNext();
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative h-64 mb-4">
        {/* Front of card */}
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out bg-white rounded-lg border p-6 shadow-md ${
            isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          onClick={handleCardClick}
        >
          <Badge className="mb-2">{card.category}</Badge>
          <h3 className="text-xl font-bold mb-4">{card.question}</h3>
          <div className="flex items-center mt-4 text-blue-600">
            <span>Click to see answer</span>
          </div>
        </div>
        
        {/* Back of card */}
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out bg-white rounded-lg border p-6 shadow-md ${
            isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={handleCardClick}
        >
          <Badge className="mb-2" variant="outline">{card.category}</Badge>
          <h3 className="text-xl font-bold mb-4">Answer:</h3>
          <p className="text-primary font-medium text-lg">{card.answer}</p>
          <div className="flex items-center mt-4 text-blue-600">
            <span>Click to see question</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <Button variant="secondary" size="sm" onClick={handleCardClick}>
          {isFlipped ? "Show Question" : "Show Answer"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleNextCard}>
          Next Card <RotateCw className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface QuizProps {
  questions: typeof QUIZ_QUESTIONS;
}

function Quiz({ questions }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setShowExplanation(true);
    
    if (optionIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="p-6 bg-white rounded-lg border shadow-sm">
        <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
        <p className="mb-4">You scored {score} out of {questions.length} ({percentage}%)</p>
        
        <Progress value={percentage} className="mb-4" />
        
        {passed ? (
          <Alert className="mb-4 bg-green-50">
            <Award className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Congratulations!</AlertTitle>
            <AlertDescription className="text-green-700">
              You passed with {percentage}%. In Canada, you need 70% to pass the Basic Qualification exam.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-4 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800">Keep studying!</AlertTitle>
            <AlertDescription className="text-amber-700">
              You need 70% to pass the Basic Qualification exam in Canada.
            </AlertDescription>
          </Alert>
        )}
        
        <Button onClick={resetQuiz} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</span>
        <Badge variant="outline">{Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete</Badge>
      </div>
      
      <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mb-6" />
      
      <h3 className="text-xl font-bold mb-4">{questions[currentQuestion].question}</h3>
      
      <div className="space-y-3">
        {questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={showExplanation}
            className={`w-full text-left p-3 rounded-md transition-colors ${
              showExplanation
                ? index === questions[currentQuestion].correctAnswer
                  ? 'bg-green-100 border-green-300 border'
                  : selectedOption === index
                  ? 'bg-red-100 border-red-300 border'
                  : 'bg-gray-100 border border-gray-200'
                : 'border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      
      {showExplanation && (
        <div className={`mt-4 p-4 rounded-md ${
          selectedOption === questions[currentQuestion].correctAnswer
            ? 'bg-green-50'
            : 'bg-red-50'
        }`}>
          <p className={`font-medium ${
            selectedOption === questions[currentQuestion].correctAnswer
              ? 'text-green-700'
              : 'text-red-700'
          }`}>
            {selectedOption === questions[currentQuestion].correctAnswer
              ? 'Correct!'
              : `Incorrect. The correct answer is: ${
                  questions[currentQuestion].options[questions[currentQuestion].correctAnswer]
                }`
            }
          </p>
        </div>
      )}
      
      {showExplanation && (
        <Button onClick={handleNext} className="mt-4">
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      )}
    </div>
  );
}

export default function LearningPage() {
  const [showMorseGame, setShowMorseGame] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % FLASHCARDS.length);
  };

  // Reset all views
  const resetViews = () => {
    setShowMorseGame(false);
    setShowQuiz(false);
    setShowFlashcard(false);
  };

  // Toggle a specific view
  const toggleView = (viewSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    resetViews();
    viewSetter(prev => !prev);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-2">Ham Radio Learning Center</h1>
      <p className="text-muted-foreground mb-6">Interactive resources to help you learn and pass your ham radio license exam</p>
      
      {!showMorseGame && !showQuiz && !showFlashcard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Morse Code Game Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <GamepadIcon className="mr-2 h-5 w-5 text-purple-600" />
                Morse Code Practice
              </CardTitle>
              <CardDescription>
                Learn Morse code through this interactive game - an essential skill for ham radio operators
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Radio className="h-10 w-10 text-purple-600" />
              </div>
              <p className="text-sm mb-4">
                Test your knowledge of Morse code with different difficulty levels. Learn the skill that's been used by operators for over a century.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <Button onClick={() => toggleView(setShowMorseGame)} className="bg-purple-600 hover:bg-purple-700">
                Start Practice
              </Button>
            </CardFooter>
          </Card>

          {/* Practice Quiz Card */}
          <Card className="bg-gradient-to-br from-green-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FlaskConical className="mr-2 h-5 w-5 text-green-600" />
                Practice Quiz
              </CardTitle>
              <CardDescription>
                Test your knowledge with questions similar to those on the Canadian Amateur Radio Operator exam
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-green-600" />
              </div>
              <p className="text-sm mb-4">
                Perfect your exam readiness with multiple-choice questions that mimic the actual Amateur Radio exam format.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <Button onClick={() => toggleView(setShowQuiz)} className="bg-green-600 hover:bg-green-700">
                Take Quiz
              </Button>
            </CardFooter>
          </Card>

          {/* Flashcards Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                Flashcards
              </CardTitle>
              <CardDescription>
                Test your knowledge with flashcards covering technical concepts and operating procedures
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-10 w-10 text-blue-600" />
              </div>
              <p className="text-sm mb-4">
                Review key concepts with interactive flashcards covering technical terms, operating procedures, and regulations.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <Button onClick={() => toggleView(setShowFlashcard)} className="bg-blue-600 hover:bg-blue-700">
                Study Cards
              </Button>
            </CardFooter>
          </Card>

          {/* External Resources */}
          <Card className="bg-gradient-to-br from-amber-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <ExternalLink className="mr-2 h-5 w-5 text-amber-600" />
                Exam Resources
              </CardTitle>
              <CardDescription>
                Official exam preparation materials and study guides
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-1 gap-2">
                {EXAM_RESOURCES.slice(0, 3).map((resource, index) => (
                  <a 
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-sm border rounded-md hover:bg-amber-50 transition-colors flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2 text-amber-600" />
                    {resource.title}
                  </a>
                ))}
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // Show all resources as an alert or modal
                    alert("View all resources on the Exam Resources tab");
                  }}
                  className="p-2 text-sm text-center text-amber-800 hover:underline"
                >
                  View all resources...
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Local Exam Sessions */}
          <Card className="bg-gradient-to-br from-red-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Radio className="mr-2 h-5 w-5 text-red-600" />
                Local Exam Sessions
              </CardTitle>
              <CardDescription>
                Find amateur radio license exams near Powell River, BC
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                {LOCAL_EXAMS.slice(0, 1).map((exam, index) => (
                  <div key={index} className="p-2 border rounded-md">
                    <h3 className="font-semibold text-sm text-red-800">{exam.title}</h3>
                    <p className="text-xs text-muted-foreground">Next: {exam.schedule}</p>
                    <p className="text-xs font-medium mt-1">{exam.location}</p>
                  </div>
                ))}
                <Alert className="py-2 px-3 mt-2 bg-red-50 text-xs">
                  <AlertTitle className="text-red-800 text-sm">Tip:</AlertTitle>
                  <AlertDescription className="text-red-700 text-xs">
                    Basic with Honours (80%+) grants HF privileges
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Study Tips Card */}
          <Card className="bg-gradient-to-br from-cyan-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-cyan-600" />
                Study Tips
              </CardTitle>
              <CardDescription>
                Strategies to help you pass your ham radio license exam
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="space-y-2 text-sm px-2">
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-cyan-100 rounded-full text-cyan-700 flex items-center justify-center mr-2 mt-0.5">1</span>
                  <span>Practice Morse code for 15 minutes daily</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-cyan-100 rounded-full text-cyan-700 flex items-center justify-center mr-2 mt-0.5">2</span>
                  <span>Study Q-codes and common abbreviations</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-cyan-100 rounded-full text-cyan-700 flex items-center justify-center mr-2 mt-0.5">3</span>
                  <span>Review frequency bands and their characteristics</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-cyan-100 rounded-full text-cyan-700 flex items-center justify-center mr-2 mt-0.5">4</span>
                  <span>Take practice exams until you score consistently above 80%</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Morse Code Game */}
      {showMorseGame && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Morse Code Practice</CardTitle>
              <CardDescription>Learn Morse code through this interactive game</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowMorseGame(false)}>
              Back to Learning Center
            </Button>
          </CardHeader>
          <CardContent>
            <MorseCodeGame />
          </CardContent>
        </Card>
      )}

      {/* Quiz Game */}
      {showQuiz && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Practice Quiz</CardTitle>
              <CardDescription>Test your knowledge with exam-style questions</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowQuiz(false)}>
              Back to Learning Center
            </Button>
          </CardHeader>
          <CardContent>
            <Quiz questions={QUIZ_QUESTIONS} />
          </CardContent>
        </Card>
      )}

      {/* Flashcards */}
      {showFlashcard && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Ham Radio Flashcards</CardTitle>
              <CardDescription>Test your knowledge with these flashcards</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFlashcard(false)}>
              Back to Learning Center
            </Button>
          </CardHeader>
          <CardContent>
            <Flashcard 
              card={FLASHCARDS[currentCardIndex]} 
              onNext={handleNextCard} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
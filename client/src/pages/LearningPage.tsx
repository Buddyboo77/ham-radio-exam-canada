import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
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
  const [activeTab, setActiveTab] = useState("flashcards");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyStarted, setStudyStarted] = useState(false);

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % FLASHCARDS.length);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-2">Ham Radio Learning Center</h1>
      <p className="text-muted-foreground mb-6">Interactive resources to help you learn and pass your ham radio license exam</p>
      
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border">
        <h2 className="text-lg font-semibold mb-3 text-center">Choose Learning Activity</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-1 md:grid-cols-5 gap-2">
            <TabsTrigger value="flashcards" className="flex items-center justify-center py-3">
              <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
              <span>Flashcards</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center justify-center py-3">
              <FlaskConical className="mr-2 h-5 w-5 text-green-600" />
              <span>Practice Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center justify-center py-3">
              <GamepadIcon className="mr-2 h-5 w-5 text-purple-600" />
              <span>Morse Code</span>
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center justify-center py-3">
              <Award className="mr-2 h-5 w-5 text-amber-600" />
              <span>Exam Resources</span>
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center justify-center py-3">
              <Radio className="mr-2 h-5 w-5 text-red-600" />
              <span>Local Exams</span>
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="flashcards" className="mt-6">
            {!studyStarted ? (
              <Card>
                <CardHeader>
                  <CardTitle>Ham Radio Flashcard Study</CardTitle>
                  <CardDescription>Test your knowledge with these flashcards covering technical concepts, operating procedures, and digital modes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-6">
                    <Lightbulb className="w-16 h-16 text-yellow-500 mb-4" />
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium">Ready to study?</h3>
                    <p className="text-sm text-muted-foreground">Click through the flashcards to test your knowledge</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button onClick={() => setStudyStarted(true)} size="lg">Start Studying</Button>
                </CardFooter>
              </Card>
            ) : (
              <Flashcard 
                card={FLASHCARDS[currentCardIndex]} 
                onNext={handleNextCard} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="practice" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Practice Quiz</CardTitle>
                <CardDescription>Test your knowledge with questions similar to those on the Canadian Amateur Radio Operator exam</CardDescription>
              </CardHeader>
              <CardContent>
                <Quiz questions={QUIZ_QUESTIONS} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="games" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Morse Code Practice</CardTitle>
                <CardDescription>Learn Morse code through this interactive game - an essential skill for ham radio operators</CardDescription>
              </CardHeader>
              <CardContent>
                <MorseCodeGame />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="exams" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Resources</CardTitle>
                <CardDescription>Links to official exam materials and study resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {EXAM_RESOURCES.map((resource, index) => (
                    <a 
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex flex-col"
                    >
                      <h3 className="font-semibold mb-1 flex items-center">
                        {resource.title}
                        <ExternalLink className="ml-2 h-4 w-4 text-gray-400" />
                      </h3>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="local" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Local Exam Sessions</CardTitle>
                <CardDescription>Find amateur radio license exams near Powell River, BC</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {LOCAL_EXAMS.map((exam, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-lg mb-1">{exam.title}</h3>
                      <p className="mb-1"><strong>Location:</strong> {exam.location}</p>
                      <p className="mb-1"><strong>Schedule:</strong> {exam.schedule}</p>
                      <p className="mb-1"><strong>Contact:</strong> {exam.contact}</p>
                      <p className="text-sm text-muted-foreground">{exam.notes}</p>
                    </div>
                  ))}
                </div>
                
                <Alert className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Exam Preparation Tip</AlertTitle>
                  <AlertDescription>
                    In Canada, you need a score of 70% to pass the Basic Qualification exam. 
                    With a score of 80% or higher, you will receive "Basic with Honours" which 
                    grants additional HF privileges.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
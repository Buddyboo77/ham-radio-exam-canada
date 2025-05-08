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

// Practice quiz questions - realistic exam questions for Canadian amateur radio license
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
    explanation: "The 5 meter band (60-64 MHz) is not allocated to amateur radio in Canada. The valid bands are 6 meters (50-54 MHz), 2 meters (144-148 MHz), and 70 centimeters (430-450 MHz)."
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
    explanation: "Basic with Honours operators are limited to 250 watts PEP (peak envelope power) output."
  },
  {
    question: "When identifying your station, how often must you send your call sign?",
    options: [
      "Every 5 minutes during a contact and at the end",
      "At the beginning and end of a contact",
      "At least every 30 minutes during a contact and at the end",
      "Only at the end of a contact"
    ],
    correctAnswer: 2,
    explanation: "Canadian regulations require station identification at least every 30 minutes during a contact and at the end of the communication."
  },
  {
    question: "Which of the following frequency bands has the longest range during nighttime hours?",
    options: [
      "20 meters",
      "40 meters",
      "80 meters",
      "2 meters"
    ],
    correctAnswer: 2,
    explanation: "The 80-meter band typically has the longest range during nighttime hours due to improved ionospheric reflection at lower frequencies."
  },
  {
    question: "What is the relationship between frequency and wavelength?",
    options: [
      "They are directly proportional",
      "They are inversely proportional",
      "They are independent of each other",
      "They increase together logarithmically"
    ],
    correctAnswer: 1,
    explanation: "Frequency and wavelength are inversely proportional. As frequency increases, wavelength decreases, and vice versa."
  },
  {
    question: "What power level is recommended for a hand-held radio with a rubber duck antenna to access a local VHF repeater 15 km away?",
    options: [
      "The highest power setting to ensure signal clarity",
      "The lowest power setting that maintains reliable communication",
      "Always set at 50 watts to ensure you're heard",
      "Exactly 10 watts to minimize interference"
    ],
    correctAnswer: 1,
    explanation: "You should always use the minimum power necessary for reliable communications. This conserves power and reduces the possibility of interference to other stations."
  },
  {
    question: "What does SWR stand for and why is it important?",
    options: [
      "Signal Wattage Rating - important for calculating transmitter power",
      "Standing Wave Ratio - important for antenna system efficiency",
      "Single Wire Resonance - important for wire antenna construction",
      "Standard Waveform Regulation - important for frequency stability"
    ],
    correctAnswer: 1,
    explanation: "SWR stands for Standing Wave Ratio, which is a measure of how efficiently RF power is transmitted from the radio to the antenna. High SWR can damage transmitters and reduce signal effectiveness."
  },
  {
    question: "Which of the following would reduce RF energy in your station?",
    options: [
      "Using a rubber duck antenna instead of a beam antenna",
      "Increasing your transmitter power",
      "Adjusting the microphone gain",
      "Using a dummy load when testing"
    ],
    correctAnswer: 3,
    explanation: "A dummy load absorbs RF energy instead of radiating it, making it useful for testing transmitters without causing interference."
  },
  {
    question: "What are the three main components of a complete antenna system?",
    options: [
      "Transmitter, lightning arrestor, ground rod",
      "Feed line, tuner, ground rod",
      "Antenna, feed line, transmitter",
      "Antenna, feed line, antenna tuner"
    ],
    correctAnswer: 3,
    explanation: "A complete antenna system consists of the antenna itself, the feed line (coaxial cable or ladder line), and often an antenna tuner to match impedances."
  },
  {
    question: "What type of modulation is used for most voice communications on the VHF and UHF bands?",
    options: [
      "SSB (Single Sideband)",
      "FM (Frequency Modulation)",
      "AM (Amplitude Modulation)",
      "CW (Continuous Wave)"
    ],
    correctAnswer: 1,
    explanation: "FM (Frequency Modulation) is the most common modulation used for voice communications on VHF and UHF bands due to its noise resistance and audio clarity."
  },
  {
    question: "What is the phonetic alphabet word for the letter 'C'?",
    options: [
      "Cobra",
      "Canada",
      "Charlie",
      "Cottage"
    ],
    correctAnswer: 2,
    explanation: "In the NATO phonetic alphabet used in ham radio, the letter 'C' is represented by 'Charlie'."
  },
  {
    question: "What does the Q-code 'QTH' mean?",
    options: [
      "What time is it?",
      "What is your location?",
      "Can you hear me?",
      "Are you busy?"
    ],
    correctAnswer: 1,
    explanation: "The Q-code 'QTH' means 'What is your location?' or when stating 'My QTH is...' it means 'My location is...'"
  },
  {
    question: "How long is the term of a Canadian Amateur Radio Operator Certificate?",
    options: [
      "One year, renewable",
      "Five years, renewable",
      "Ten years, renewable",
      "Life (no renewal required)"
    ],
    correctAnswer: 3,
    explanation: "The Canadian Amateur Radio Operator Certificate is valid for life and does not require renewal."
  },
  {
    question: "What is required to operate an amateur radio station in Canada?",
    options: [
      "A valid Amateur Radio Operator Certificate and a station license",
      "Only a valid Amateur Radio Operator Certificate",
      "Only a valid station license",
      "A commercial radio operator's license"
    ],
    correctAnswer: 1,
    explanation: "To operate an amateur radio station in Canada, you need both a valid Amateur Radio Operator Certificate and a station license issued by Innovation, Science and Economic Development Canada."
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
    explanation: "The proper procedure is to say the call sign of the station you are calling, followed by 'this is' and your own call sign."
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
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white rounded-lg border shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono">Question {currentQuestion + 1} of {questions.length}</span>
        </div>
        <Badge variant="outline" className="bg-blue-50">
          <div className="font-mono">{Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete</div>
        </Badge>
      </div>
      
      <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mb-6 h-2 bg-gray-200" 
        style={{
          background: 'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e5e5e5 10px, #e5e5e5 20px)'
        }} />
      
      <div className="border-l-4 border-blue-600 pl-4 mb-6">
        <h3 className="text-xl font-bold mb-2 text-blue-900">{questions[currentQuestion].question}</h3>
        <div className="text-xs text-gray-500 font-mono">SELECT BEST ANSWER</div>
      </div>
      
      <div className="space-y-3">
        {questions[currentQuestion].options.map((option, index) => {
          const optionLetters = ['A', 'B', 'C', 'D'];
          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-md transition-all relative ${
                showExplanation
                  ? index === questions[currentQuestion].correctAnswer
                    ? 'bg-green-50 border-green-300 border-2 shadow-inner'
                    : selectedOption === index
                    ? 'bg-red-50 border-red-300 border-2 shadow-inner'
                    : 'bg-gray-50 border border-gray-200'
                  : 'border border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center">
                <div className={`h-7 w-7 rounded-full mr-3 text-sm flex items-center justify-center font-bold ${
                  showExplanation
                    ? index === questions[currentQuestion].correctAnswer
                      ? 'bg-green-600 text-white'
                      : selectedOption === index
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-100 text-blue-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {optionLetters[index]}
                </div>
                <span>{option}</span>
              </div>
            </button>
          );
        })}
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
          
          {/* Display explanation */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Explanation: </span>
              {questions[currentQuestion].explanation}
            </p>
          </div>
        </div>
      )}
      
      {showExplanation && (
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleNext} 
            size="sm"
            className="px-3 py-1 h-8 text-xs font-medium">
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </div>
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
      <div className="mb-8 text-center bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 p-6 rounded-lg shadow-md">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
          <span className="inline-block transform -rotate-2 text-yellow-300">Ham Radio</span> Learning Center
        </h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
          Interactive resources to help you learn, practice, and pass your ham radio license exam
        </p>
        <div className="mt-4 grid grid-cols-3 max-w-lg mx-auto gap-4">
          <div className="bg-blue-800 rounded-lg p-2 text-center">
            <div className="text-xl font-mono text-yellow-300">CQ</div>
            <div className="text-xs text-blue-200">Calling All</div>
          </div>
          <div className="bg-blue-800 rounded-lg p-2 text-center">
            <div className="text-xl font-mono text-yellow-300">73</div>
            <div className="text-xs text-blue-200">Best Wishes</div>
          </div>
          <div className="bg-blue-800 rounded-lg p-2 text-center">
            <div className="text-xl font-mono text-yellow-300">DX</div>
            <div className="text-xs text-blue-200">Distance</div>
          </div>
        </div>
      </div>
      
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
        <div>
          <div className="bg-blue-900 text-white rounded-lg p-4 mb-6 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-center z-10 relative">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Award className="h-6 w-6" /> 
                  Canadian Amateur Radio Exam Prep
                </h2>
                <p className="text-blue-200 mt-1">
                  Practice with realistic exam-style questions to prepare for certification
                </p>
              </div>
              <Button variant="outline" size="sm" 
                className="text-white border-white hover:bg-blue-800 bg-transparent" 
                onClick={() => setShowQuiz(false)}>
                Back to Learning Center
              </Button>
            </div>
            <div className="absolute right-0 top-0 opacity-10">
              <svg width="150" height="150" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3-5.5l8-8 1.5 1.5-8 8z" fill="white"/>
              </svg>
            </div>
            <div className="font-mono text-xs text-blue-300 mt-4 relative z-10">
              <div className="flex justify-between items-center">
                <div>VERSION 2.0 / RAC APPROVED</div>
                <div>BASIC QUALIFICATION (BQ)</div>
              </div>
            </div>
          </div>
          <Quiz questions={QUIZ_QUESTIONS} />
        </div>
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
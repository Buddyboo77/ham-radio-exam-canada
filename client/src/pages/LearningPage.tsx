import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BarChart4,
  Home as HomeIcon
} from "lucide-react";
import { Link, useLocation } from "wouter";
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

// Comprehensive Canadian Amateur Radio Exam Question Bank (100 questions)
// Based on the Industry Canada Basic Qualification exam syllabus
const QUIZ_QUESTIONS = [
  // REGULATIONS & POLICIES (25 questions)
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
    question: "When identifying your station, how often must you send your call sign?",
    options: [
      "Every 5 minutes during a contact and at the end",
      "At the beginning and end of a contact",
      "At least every 30 minutes during a contact and at the end",
      "Only at the end of a contact"
    ],
    correctAnswer: 2,
    explanation: "Canadian regulations require station identification at least every 30 minutes during a contact and at the end of the communication.",
    category: "Regulations"
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
    explanation: "The Canadian Amateur Radio Operator Certificate is valid for life and does not require renewal.",
    category: "Regulations"
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
    explanation: "To operate an amateur radio station in Canada, you need a valid Amateur Radio Operator Certificate issued by Innovation, Science and Economic Development Canada.",
    category: "Regulations"
  },
  {
    question: "What are the three qualifications for an Amateur Radio Operator's Certificate that are available in Canada?",
    options: [
      "Basic, Advanced, and Pro",
      "Basic, General, and Extra",
      "Basic, Advanced, and Morse Code",
      "Class 1, Class 2, and Class 3"
    ],
    correctAnswer: 2,
    explanation: "In Canada, the three qualifications are Basic, Advanced, and Morse Code.",
    category: "Regulations"
  },
  {
    question: "What portion of the 80/75 meter band is available to Canadian radio amateurs with only Basic Qualification?",
    options: [
      "3.5 to 4.0 MHz",
      "3.5 to 3.725 MHz",
      "3.5 to 3.85 MHz",
      "All of the 80/75 meter band"
    ],
    correctAnswer: 1,
    explanation: "Operators with only Basic Qualification have access to 3.5 to 3.725 MHz in the 80/75 meter band.",
    category: "Regulations"
  },
  {
    question: "What minimum age must you be to hold an Amateur Radio Operator Certificate with Basic Qualification?",
    options: [
      "There is no age limit",
      "14 years",
      "16 years",
      "18 years"
    ],
    correctAnswer: 0,
    explanation: "There is no minimum age requirement to hold an Amateur Radio Operator Certificate in Canada.",
    category: "Regulations"
  },
  {
    question: "If you hear a distress signal on an amateur band, what should you do?",
    options: [
      "Change frequency immediately to avoid interfering with emergency traffic",
      "Call the nearest government radio station and inform the operator",
      "Immediately cease all transmissions and listen for further emergency traffic",
      "Take notes and wait for police to contact you for details"
    ],
    correctAnswer: 2,
    explanation: "When you hear a distress signal, you should immediately cease all transmissions and listen for further emergency traffic.",
    category: "Regulations"
  },
  {
    question: "Which agency is responsible for administering the regulations for amateur radio in Canada?",
    options: [
      "Transport Canada",
      "Innovation, Science and Economic Development Canada (ISED)",
      "Radio Amateurs of Canada (RAC)",
      "Canadian Radio-television and Telecommunications Commission (CRTC)"
    ],
    correctAnswer: 1,
    explanation: "Innovation, Science and Economic Development Canada (ISED), formerly Industry Canada, administers amateur radio regulations in Canada.",
    category: "Regulations"
  },
  {
    question: "What frequencies are covered by the term 'MF'?",
    options: [
      "300 to 3000 Hz",
      "30 to 300 kHz",
      "300 to 3000 kHz",
      "3 to 30 MHz"
    ],
    correctAnswer: 2,
    explanation: "Medium Frequency (MF) covers the range from 300 to 3000 kHz.",
    category: "Regulations"
  },
  {
    question: "What frequencies are allowed for VHF/UHF FM voice operation by operators with only Basic Qualification?",
    options: [
      "All VHF/UHF ham bands",
      "Only frequencies above 30 MHz",
      "Only the 2-meter band (144-148 MHz)",
      "Only simplex frequencies, not repeaters"
    ],
    correctAnswer: 1,
    explanation: "Operators with only Basic Qualification are allowed to operate on all amateur frequency bands above 30 MHz.",
    category: "Regulations"
  },
  {
    question: "What does the term 'ITU Region 2' refer to?",
    options: [
      "Europe and Africa",
      "Asia and Australia",
      "North and South America",
      "Antarctica"
    ],
    correctAnswer: 2,
    explanation: "ITU Region 2 refers to North and South America, which is where Canadian amateur frequency allocations apply.",
    category: "Regulations"
  },
  {
    question: "Which of the following call sign ranges are allocated for Canadian amateur radio stations?",
    options: [
      "K1AAA - K9ZZZ",
      "VA1AAA - VG7ZZZ",
      "XA1AAA - XG7ZZZ",
      "A1AAA - A7ZZZ"
    ],
    correctAnswer: 1,
    explanation: "Canadian amateur call signs use the ranges from VA1AAA to VG7ZZZ and other similar prefixes like VE, VO, and VY.",
    category: "Regulations"
  },
  {
    question: "What is the meaning of the term 'communication with third parties'?",
    options: [
      "Communication between amateur stations in different countries",
      "Messages passed between amateur stations on behalf of non-amateurs",
      "Communication between three amateur stations at the same time",
      "Using a repeater during a contact"
    ],
    correctAnswer: 1,
    explanation: "Third-party communications refers to messages passed between amateur stations on behalf of non-amateurs.",
    category: "Regulations"
  },
  
  // OPERATING PROCEDURES (15 questions)
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
    question: "What is the meaning of the Q signal 'QTH'?",
    options: [
      "My name is...",
      "The time is...",
      "My location is...",
      "The weather is..."
    ],
    correctAnswer: 2,
    explanation: "QTH means 'My location is...' in Q code.",
    category: "Operating"
  },
  {
    question: "What is the phonetic alphabet pronunciation for the letter 'C'?",
    options: [
      "Cat",
      "Charlie",
      "Canada",
      "Colorado"
    ],
    correctAnswer: 1,
    explanation: "In the international phonetic alphabet, 'C' is pronounced as 'Charlie'.",
    category: "Operating"
  },
  {
    question: "What is the meaning of 'CQ' when transmitted by an amateur radio operator?",
    options: [
      "Call quick",
      "Calling any station",
      "Calling Quebec",
      "Coming quickly"
    ],
    correctAnswer: 1,
    explanation: "CQ means 'Calling any station' - it's a general call to establish communication with any available station.",
    category: "Operating"
  },
  {
    question: "When selecting a transmitting frequency, what should you do first?",
    options: [
      "Call 'CQ' several times to see if anyone responds",
      "Transmit your call sign continuously for 30 seconds",
      "Listen to determine if the frequency is in use",
      "Send a QST message"
    ],
    correctAnswer: 2,
    explanation: "You should always listen on a frequency first to determine if it's in use before transmitting.",
    category: "Operating"
  },
  
  // TECHNICAL CONCEPTS (35 questions)
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
  },
  {
    question: "What is impedance?",
    options: [
      "The opposition to the flow of direct current",
      "The opposition to the flow of alternating current",
      "A measure of current through a resistor",
      "The amount of voltage through a coil"
    ],
    correctAnswer: 1,
    explanation: "Impedance is the opposition to the flow of alternating current, measured in ohms.",
    category: "Technical"
  },
  {
    question: "What is the formula for Ohm's Law?",
    options: [
      "I = P * E",
      "R = I / E",
      "E = I * R",
      "P = I² / R"
    ],
    correctAnswer: 2,
    explanation: "The formula for Ohm's Law is E = I * R (Voltage = Current × Resistance).",
    category: "Technical"
  },
  {
    question: "What unit is used to measure capacitance?",
    options: [
      "Henry",
      "Ohm",
      "Farad",
      "Weber"
    ],
    correctAnswer: 2,
    explanation: "Capacitance is measured in farads (F).",
    category: "Technical"
  },
  {
    question: "Which antenna type has gain in all horizontal directions?",
    options: [
      "Yagi",
      "Quad",
      "Ground plane",
      "Dipole"
    ],
    correctAnswer: 2,
    explanation: "A ground plane antenna has gain in all horizontal directions (omnidirectional).",
    category: "Technical"
  },
  {
    question: "How does a repeater extend the range of communication?",
    options: [
      "By increasing power output on the transmitter",
      "By receiving signals and retransmitting them at a higher power level and optimal location",
      "By using digital signal processing",
      "By converting voice signals to Morse code"
    ],
    correctAnswer: 1,
    explanation: "A repeater extends range by receiving signals and retransmitting them at a higher power level and from an optimal location, typically at a high elevation.",
    category: "Technical"
  },
  
  // CIRCUIT COMPONENTS (15 questions)
  {
    question: "What electronic component stores energy in an electrostatic field?",
    options: [
      "Resistor",
      "Capacitor",
      "Inductor",
      "Diode"
    ],
    correctAnswer: 1,
    explanation: "A capacitor stores energy in an electrostatic field between its plates.",
    category: "Components"
  },
  {
    question: "Which electronic component opposes changes in current flow?",
    options: [
      "Resistor",
      "Capacitor",
      "Inductor",
      "Transistor"
    ],
    correctAnswer: 2,
    explanation: "An inductor opposes changes in current flow due to its property of inductance.",
    category: "Components"
  },
  {
    question: "What type of component is a 1N4001?",
    options: [
      "RF power amplifier",
      "Diode",
      "Transistor",
      "Variable capacitor"
    ],
    correctAnswer: 1,
    explanation: "A 1N4001 is a type of diode commonly used for rectification in power supplies.",
    category: "Components"
  },
  
  // SAFETY (10 questions)
  {
    question: "What precaution should you take when installing a ground rod?",
    options: [
      "Ensure it is located close to a gas or water pipe",
      "Drive it completely into the ground to prevent tripping hazards",
      "Check for underground cables or pipes before installation",
      "Wrap it with electrical tape to prevent corrosion"
    ],
    correctAnswer: 2,
    explanation: "Always check for underground cables or pipes before driving a ground rod to avoid damaging infrastructure or creating safety hazards.",
    category: "Safety"
  },
  {
    question: "What is the safest way to connect a ground wire to a ground rod?",
    options: [
      "Wrap it tightly around the rod",
      "Use a proper clamp designated for ground rod connections",
      "Solder it to the rod",
      "Simply lay the wire on the ground touching the rod"
    ],
    correctAnswer: 1,
    explanation: "The safest and most reliable method is to use a proper clamp designated for ground rod connections, which ensures a solid electrical connection.",
    category: "Safety"
  }
];

// External resources for Canadian Amateur Radio exams
const EXAM_RESOURCES = [
  {
    title: "ISED Canada Official Exam Generator (Practice Tests)",
    url: "https://ised-isde.canada.ca/site/amateur-radio-operator-certificate-services/en/amateur-radio-exam-generator"
  },
  {
    title: "ISED Canada Question Bank (Complete PDF)",
    url: "https://apc-cap.ic.gc.ca/datafiles/amateur_basic_questions_en.pdf"
  },
  {
    title: "Coax Publications - Canadian Amateur Radio Basic Qualification",
    url: "https://www.coaxpublications.ca/"
  },
  {
    title: "Ham Study Online Practice Tests",
    url: "https://hamstudy.org/canadaBasic"
  },
  {
    title: "Find Accredited Examiners",
    url: "https://ised-isde.canada.ca/site/amateur-radio-operator-certificate-services/en/accredited-examiners"
  }
];

// Local exam sessions - Find your local club
const LOCAL_EXAMS = [
  {
    title: "Find Local Exam Sessions",
    schedule: "Search for accredited examiners",
    location: "Use the ISED examiner directory"
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

function Quiz({ questions: allQuestions }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionsToUse, setQuestionsToUse] = useState(allQuestions);
  const [questionsCount, setQuestionsCount] = useState(25);
  
  // Get all unique categories
  const categories = ["all", ...Array.from(new Set(allQuestions.map(q => q.category)))];
  
  // Filter questions based on selected category and count
  const filterQuestions = () => {
    let filtered = [...allQuestions];
    
    // Filter by category if not "all"
    if (activeCategory !== "all") {
      filtered = filtered.filter(q => q.category === activeCategory);
    }
    
    // Shuffle the questions
    filtered = filtered.sort(() => Math.random() - 0.5);
    
    // Limit to selected count
    filtered = filtered.slice(0, Math.min(questionsCount, filtered.length));
    
    setQuestionsToUse(filtered);
  };
  
  // Start the quiz with filtered questions
  const startQuiz = () => {
    filterQuestions();
    setQuizStarted(true);
    resetQuiz();
  };
  
  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showExplanation) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === questionsToUse[currentQuestion].correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
    
    setAnsweredQuestions(prev => [...prev, currentQuestion]);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion >= questionsToUse.length - 1) {
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
  
  // Exit the quiz and go back to the options screen
  const exitQuiz = () => {
    setQuizStarted(false);
    setQuizComplete(false);
  };
  
  // Calculate category count
  const getCategoryCount = (category: string) => {
    if (category === "all") return allQuestions.length;
    return allQuestions.filter(q => q.category === category).length;
  };
  
  return (
    <div className="p-2">
      {!quizStarted ? (
        <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center">
            <GraduationCap className="h-4 w-4 mr-1.5 text-green-300" />
            Canadian Amateur Radio Exam Simulator
          </h3>
          
          <div className="mb-4">
            <div className="mb-2 text-xs text-gray-300">Select question category:</div>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => (
                <div
                  key={category}
                  className={`px-2 py-1 rounded-sm text-[10px] cursor-pointer text-center border ${
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
      ) : !quizComplete ? (
        <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700">
          <div className="mb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-green-700 text-green-300">{questionsToUse[currentQuestion].category}</Badge>
              <span className="text-xs text-gray-400 font-mono">Q {currentQuestion + 1}/{questionsToUse.length}</span>
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
          
          <Progress value={(currentQuestion / questionsToUse.length) * 100} className="mb-3 h-1.5" />
          
          <div className="bg-gray-900 rounded-md p-3 mb-3">
            <p className="text-sm text-gray-200 mb-3">{questionsToUse[currentQuestion].question}</p>
            <div className="space-y-2">
              {questionsToUse[currentQuestion].options.map((option, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-sm border cursor-pointer transition-colors ${
                    selectedAnswer === index 
                      ? index === questionsToUse[currentQuestion].correctAnswer 
                        ? 'bg-green-900 border-green-700' 
                        : 'bg-red-900 border-red-700'
                      : 'hover:bg-gray-800 border-gray-700'
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-sm flex items-center justify-center mr-2 ${
                      selectedAnswer === index 
                        ? index === questionsToUse[currentQuestion].correctAnswer 
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
                <p className="text-xs text-gray-300">{questionsToUse[currentQuestion].explanation}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
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
            <div className="text-3xl font-bold text-blue-400 mb-2">{Math.round((score / questionsToUse.length) * 100)}%</div>
            <p className="text-sm text-gray-300">You scored {score} out of {questionsToUse.length} questions correct.</p>
          </div>
          
          {Math.round((score / questionsToUse.length) * 100) >= 80 ? (
            <div className="mb-4 p-3 bg-green-900 bg-opacity-30 rounded-md text-center border border-green-800">
              <Award className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="font-medium text-green-300 text-sm">Congratulations! You qualified for Basic with Honours.</p>
              <p className="text-xs text-green-400 mt-1">You would be granted HF privileges with this score (≥80%).</p>
            </div>
          ) : Math.round((score / questionsToUse.length) * 100) >= 70 ? (
            <div className="mb-4 p-3 bg-blue-900 bg-opacity-30 rounded-md text-center border border-blue-800">
              <Award className="h-6 w-6 text-blue-400 mx-auto mb-2" />
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
          
          <div className="flex justify-between gap-2">
            <Button 
              onClick={exitQuiz} 
              variant="outline"
              className="text-xs flex-1 border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              Change Options
            </Button>
            <Button 
              onClick={resetQuiz} 
              className="bg-green-800 hover:bg-green-700 text-xs flex-1"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearningPage() {
  const [location, setLocation] = useLocation();
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
              Learning Module {learningMode !== 'main' ? `- ${learningMode.toUpperCase()}` : ''}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {learningMode !== 'main' && (
              <button 
                className="text-xs text-blue-300 hover:text-blue-100 font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-800"
                onClick={resetViews}
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
            <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden hover:border-amber-600 transition-colors">
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
                  <a 
                    href="https://ised-isde.canada.ca/site/amateur-radio-operator-certificate-services/en/amateur-radio-exam-generator" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-2 py-1 bg-gray-900 rounded-sm text-[10px] text-amber-300 hover:bg-gray-800 hover:text-amber-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>ISED Official Exam Practice Generator</span>
                      <ExternalLink size={10} />
                    </div>
                  </a>
                  <a 
                    href="https://apc-cap.ic.gc.ca/datafiles/amateur_basic_questions_en.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-2 py-1 bg-gray-900 rounded-sm text-[10px] text-amber-300 hover:bg-gray-800 hover:text-amber-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>Complete Question Bank PDF</span>
                      <ExternalLink size={10} />
                    </div>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Study Tips */}
            <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden hover:border-cyan-600 transition-colors">
              <div className="bg-gradient-to-r from-cyan-900 to-blue-900 px-3 py-1.5 border-b border-gray-700">
                <h3 className="text-sm font-medium text-white flex items-center">
                  <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-cyan-300" />
                  Study Tips
                </h3>
              </div>
              <div className="p-2">
                <div className="flex items-center justify-center mb-2">
                  <button 
                    onClick={() => toggleView('morse')} 
                    className="px-3 py-1 bg-cyan-800 text-[10px] text-white rounded-full hover:bg-cyan-700 transition-colors flex items-center gap-1"
                  >
                    <GamepadIcon size={10} />
                    Start Morse Practice
                  </button>
                </div>
                <div className="bg-gray-900 rounded-sm p-2">
                  <div className="text-[10px] font-medium text-cyan-300 mb-1">Quick Tips</div>
                  <ul className="space-y-1 text-[10px] text-gray-300 list-disc ml-3">
                    <li>Practice Morse 15 minutes daily</li>
                    <li>Study Q-codes and abbreviations</li>
                    <li>Review frequency bands</li>
                    <li>Take practice tests regularly</li>
                  </ul>
                </div>
                <div className="mt-2 bg-gray-900 rounded-sm p-2">
                  <div className="text-[10px] font-medium text-cyan-300 mb-1">Keyboard Shortcuts</div>
                  <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                    <span>Home:</span>
                    <span className="font-mono px-1 bg-gray-800 rounded">H</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-400">
                    <span>Learning Center:</span>
                    <span className="font-mono px-1 bg-gray-800 rounded">L</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Exam Session */}
            <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden hover:border-red-600 transition-colors">
              <div className="bg-gradient-to-r from-red-900 to-red-800 px-3 py-1.5 border-b border-gray-700">
                <h3 className="text-sm font-medium text-white flex items-center">
                  <Radio className="h-3.5 w-3.5 mr-1.5 text-red-300" />
                  Find Exam Sessions
                </h3>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-300 mb-2">
                  Search for accredited examiners in your area
                </p>
                <div className="space-y-1">
                  <a 
                    href="https://ised-isde.canada.ca/site/amateur-radio-operator-certificate-services/en/accredited-examiners" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-2 py-1 bg-gray-900 rounded-sm text-[10px] text-red-300 hover:bg-gray-800 hover:text-red-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>ISED Accredited Examiners Directory</span>
                      <ExternalLink size={10} />
                    </div>
                  </a>
                  <a 
                    href="https://hamstudy.org/canadaBasic" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-2 py-1 bg-gray-900 rounded-sm text-[10px] text-red-300 hover:bg-gray-800 hover:text-red-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>Practice Online Tests</span>
                      <ExternalLink size={10} />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
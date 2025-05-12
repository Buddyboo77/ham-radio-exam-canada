import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  SkipForward, 
  Timer, 
  Award, 
  Radio, 
  Settings, 
  Heart, 
  RefreshCw, 
  VolumeX,
  Volume1
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLearningProgress } from "@/hooks/use-learning-progress";

// Morse code dictionary
const MORSE_CODE_DICT: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', 
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', 
  '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', 
  "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', 
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', 
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
  'SOS': '...---...'
};

// Convert keys to array for random selection
const CHARACTERS = Object.keys(MORSE_CODE_DICT);

// Audio context for Morse code playback
let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;

// Question types
type QuestionType = 'morse-to-char' | 'char-to-morse' | 'hear-to-char' | 'word-to-morse' | 'hear-to-word';

// Word lists for different difficulty levels
const COMMON_WORDS = [
  'CQ', 'DE', 'RST', 'ANT', 'RIG', 'WX', 'ES', 'SIG', 'RPT', 'OP', 'HI', 'NAME',
  'QTH', 'QRM', 'QRN', 'QRP', 'QSO', 'QSL', 'QRZ', 'QSY', 'TNX', '73', '88', 'DX',
  'CUL', 'PSE', 'TEST', 'HAM'
];

const BEGINNER_SENTENCES = [
  'CQ CQ CQ DE [CALLSIGN]',
  'RST 599',
  'NAME IS [NAME]',
  'QTH IS [CITY]',
  'RIG IS [RIG]',
  'ANT IS [ANT]',
  'WX IS [WX]',
  'TNX QSO 73',
  'QRZ?',
  'PSE K'
];

// Challenge types
interface Question {
  id: string;
  type: QuestionType;
  question: string;
  correctAnswer: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  category: string;
}

interface GameStats {
  correct: number;
  total: number;
  streak: number;
  longestStreak: number;
  wpm: number;
  lastSessionScore: number;
  lastSessionDate: string | null;
  charactersLearned: string[];
}

interface SettingsType {
  wpm: number;
  volume: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  enableSound: boolean;
  enableAnimation: boolean;
  charactersToInclude: string[];
  questionTypes: QuestionType[];
}

// Character categories for the quiz
const CHARACTER_CATEGORIES = {
  'Letters (A-Z)': CHARACTERS.filter(char => /^[A-Z]$/.test(char)),
  'Numbers (0-9)': CHARACTERS.filter(char => /^[0-9]$/.test(char)),
  'Punctuation': CHARACTERS.filter(char => /^[^A-Z0-9]$/.test(char)),
  'Special/Prosigns': CHARACTERS.filter(char => char.length > 1)
};

// Generate a large bank of questions
const generateQuestions = (settings: SettingsType): Question[] => {
  const questions: Question[] = [];
  const charactersToUse = settings.charactersToInclude.length > 0 
    ? settings.charactersToInclude 
    : CHARACTERS;
  
  // Function to generate incorrect options that are somewhat similar
  const generateOptions = (correctAnswer: string, type: 'char' | 'morse'): string[] => {
    const allOptions = type === 'char' ? CHARACTERS : Object.values(MORSE_CODE_DICT);
    const similarOptions = allOptions.filter(option => 
      option !== correctAnswer && 
      (type === 'morse' 
        ? option.length === correctAnswer.length 
        : true)
    );
    
    // Shuffle and take 3 options
    return shuffleArray([...similarOptions])
      .slice(0, 3)
      .concat(correctAnswer)
      .sort(() => Math.random() - 0.5);
  };
  
  // 1. Morse to Character questions
  if (settings.questionTypes.includes('morse-to-char')) {
    charactersToUse.forEach(char => {
      const morse = MORSE_CODE_DICT[char];
      questions.push({
        id: `morse-to-char-${char}`,
        type: 'morse-to-char',
        question: morse,
        correctAnswer: char,
        options: generateOptions(char, 'char'),
        difficulty: char.length === 1 ? 'easy' : 'medium',
        category: getCharacterCategory(char)
      });
    });
  }
  
  // 2. Character to Morse questions
  if (settings.questionTypes.includes('char-to-morse')) {
    charactersToUse.forEach(char => {
      const morse = MORSE_CODE_DICT[char];
      questions.push({
        id: `char-to-morse-${char}`,
        type: 'char-to-morse',
        question: char,
        correctAnswer: morse,
        options: generateOptions(morse, 'morse'),
        difficulty: char.length === 1 ? 'easy' : 'medium',
        category: getCharacterCategory(char)
      });
    });
  }
  
  // 3. Hear to Character questions
  if (settings.questionTypes.includes('hear-to-char')) {
    charactersToUse.forEach(char => {
      const morse = MORSE_CODE_DICT[char];
      questions.push({
        id: `hear-to-char-${char}`,
        type: 'hear-to-char',
        question: morse, // The morse code to play
        correctAnswer: char,
        options: generateOptions(char, 'char'),
        difficulty: 'medium',
        category: getCharacterCategory(char)
      });
    });
  }
  
  // 4. Word to Morse questions (for intermediate/advanced)
  if (settings.questionTypes.includes('word-to-morse') && 
      (settings.difficulty === 'intermediate' || settings.difficulty === 'advanced')) {
    COMMON_WORDS.forEach(word => {
      const morse = wordToMorse(word);
      questions.push({
        id: `word-to-morse-${word}`,
        type: 'word-to-morse',
        question: word,
        correctAnswer: morse,
        options: [], // No options for this type, user types it
        difficulty: 'hard',
        category: 'Words'
      });
    });
  }
  
  // 5. Hear to Word questions (advanced)
  if (settings.questionTypes.includes('hear-to-word') && settings.difficulty === 'advanced') {
    COMMON_WORDS.slice(0, 15).forEach(word => {
      const morse = wordToMorse(word);
      questions.push({
        id: `hear-to-word-${word}`,
        type: 'hear-to-word',
        question: morse, // The morse code to play
        correctAnswer: word,
        options: [], // For advanced, no options
        difficulty: 'hard',
        category: 'Words'
      });
    });
  }
  
  return shuffleArray(questions);
};

// Helper to categorize a character
const getCharacterCategory = (char: string): string => {
  if (/^[A-Z]$/.test(char)) return 'Letters';
  if (/^[0-9]$/.test(char)) return 'Numbers';
  if (char.length > 1) return 'Special/Prosigns';
  return 'Punctuation';
};

// Helper to convert a word to Morse code
const wordToMorse = (word: string): string => {
  return word.split('').map(char => {
    const upperChar = char.toUpperCase();
    return MORSE_CODE_DICT[upperChar] || ' ';
  }).join(' ');
};

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Default settings
const DEFAULT_SETTINGS: SettingsType = {
  wpm: 12,
  volume: 70,
  difficulty: 'beginner',
  enableSound: true,
  enableAnimation: true,
  charactersToInclude: [],
  questionTypes: ['morse-to-char', 'char-to-morse', 'hear-to-char']
};

// Create 30 placeholder stats with incremental difficulty
const generateProgressiveDrills = (): Question[] => {
  const drills: Question[] = [];
  
  // Group 1: Single letters (A-Z)
  const letters = 'ETIANMSURWDKGOHVFLPJBXCYZQ'.split('');
  letters.forEach((letter, index) => {
    drills.push({
      id: `drill-${letter}`,
      type: 'hear-to-char',
      question: MORSE_CODE_DICT[letter],
      correctAnswer: letter,
      options: [],
      difficulty: 'easy',
      category: 'Letters',
      hint: `Drill ${index + 1}: Recognize '${letter}' in Morse code`
    });
  });
  
  // Group 2: Numbers (0-9)
  for (let i = 0; i <= 9; i++) {
    const num = i.toString();
    drills.push({
      id: `drill-${num}`,
      type: 'hear-to-char',
      question: MORSE_CODE_DICT[num],
      correctAnswer: num,
      options: [],
      difficulty: 'medium',
      category: 'Numbers',
      hint: `Drill ${letters.length + i + 1}: Recognize '${num}' in Morse code`
    });
  }
  
  // Group 3: Common punctuation
  const punctuation = '.,:?/=+';
  punctuation.split('').forEach((char, index) => {
    drills.push({
      id: `drill-${char}`,
      type: 'hear-to-char',
      question: MORSE_CODE_DICT[char],
      correctAnswer: char,
      options: [],
      difficulty: 'hard',
      category: 'Punctuation',
      hint: `Drill ${letters.length + 10 + index + 1}: Recognize '${char}' in Morse code`
    });
  });
  
  return drills;
};

const PROGRESSIVE_DRILLS = generateProgressiveDrills();

// Main component
const MorseCodeGame: React.FC = () => {
  // Game state
  const [gameMode, setGameMode] = useState<'quiz' | 'practice' | 'challenge' | 'learn'>('learn');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    total: 0,
    streak: 0,
    longestStreak: 0,
    wpm: 12,
    lastSessionScore: 0,
    lastSessionDate: null,
    charactersLearned: []
  });
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [currentSoundChar, setCurrentSoundChar] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [drillCompleted, setDrillCompleted] = useState<boolean[]>(Array(PROGRESSIVE_DRILLS.length).fill(false));
  const [showLearnDialog, setShowLearnDialog] = useState(false);
  const [learningChar, setLearningChar] = useState<string | null>(null);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Learning progress hooks
  const { progress, recordMorsePractice } = useLearningProgress();
  
  // Prepare questions
  useEffect(() => {
    const allQuestions = generateQuestions(settings);
    setQuestions(shuffleArray(allQuestions));
    
    if (allQuestions.length > 0) {
      setCurrentQuestion(allQuestions[0]);
    }
    
    return () => {
      // Clean up audio context
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [settings]);
  
  // Update current question when index changes
  useEffect(() => {
    if (gameMode === 'quiz' && questions.length > 0) {
      setCurrentQuestion(questions[currentQuestionIndex]);
      setIsCorrect(null);
      setShowFeedback(false);
      setSelectedAnswer("");
      setTextInput("");
    } else if (gameMode === 'learn' && PROGRESSIVE_DRILLS.length > 0) {
      setCurrentQuestion(PROGRESSIVE_DRILLS[currentDrillIndex]);
    }
  }, [currentQuestionIndex, gameMode, questions]);
  
  // Initialize or clean up timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const handleAnswerSelect = (answer: string) => {
    if (isCorrect !== null || !currentQuestion) return; // Already answered
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Update stats
    updateStats(correct);
    
    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };
  
  const handleTextInputAnswer = () => {
    if (isCorrect !== null || !currentQuestion) return; // Already answered
    
    const correct = textInput.toUpperCase() === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Update stats
    updateStats(correct);
    
    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };
  
  const updateStats = (correct: boolean) => {
    setStats(prevStats => {
      const newStats = { 
        ...prevStats,
        total: prevStats.total + 1,
        correct: correct ? prevStats.correct + 1 : prevStats.correct,
        streak: correct ? prevStats.streak + 1 : 0,
        lastSessionDate: new Date().toISOString(),
        lastSessionScore: prevStats.lastSessionScore + (correct ? 1 : 0)
      };
      
      // Update longest streak if needed
      if (newStats.streak > newStats.longestStreak) {
        newStats.longestStreak = newStats.streak;
      }
      
      // Add character to learned list if correct
      if (correct && currentQuestion && 
          !newStats.charactersLearned.includes(currentQuestion.correctAnswer)) {
        newStats.charactersLearned.push(currentQuestion.correctAnswer);
      }
      
      // Update global progress
      recordMorsePractice(
        settings.wpm, 
        (newStats.correct / newStats.total) * 100,
        drillCompleted.filter(Boolean).length > 0
      );
      
      return newStats;
    });
    
    // Handle drill completion in learn mode
    if (gameMode === 'learn' && correct) {
      const newDrillCompleted = [...drillCompleted];
      newDrillCompleted[currentDrillIndex] = true;
      setDrillCompleted(newDrillCompleted);
    }
    
    // Handle lives and game over in challenge mode
    if (gameMode === 'challenge' && !correct) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setIsGameOver(true);
        }
        return newLives;
      });
    }
  };
  
  const handleNextQuestion = () => {
    setIsCorrect(null);
    setShowFeedback(false);
    setSelectedAnswer("");
    setTextInput("");
    
    if (gameMode === 'quiz' || gameMode === 'challenge') {
      // Move to next question or wrap around
      setCurrentQuestionIndex(prev => (prev + 1) % questions.length);
    } else if (gameMode === 'learn') {
      // In learn mode, only advance if completed current drill
      if (drillCompleted[currentDrillIndex]) {
        setCurrentDrillIndex(prev => Math.min(prev + 1, PROGRESSIVE_DRILLS.length - 1));
      }
    }
  };
  
  const startChallengeMode = () => {
    setLives(3);
    setIsGameOver(false);
    setCurrentQuestionIndex(0);
    setStats({
      ...stats,
      lastSessionScore: 0
    });
    setGameMode('challenge');
    
    // Set timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setTimeLeft(60); // 60 seconds for challenge mode
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setIsCorrect(null);
    setShowFeedback(false);
    setSelectedAnswer("");
    setTextInput("");
    setIsGameOver(false);
    setLives(3);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimeLeft(null);
    }
    
    // Reshuffle questions
    setQuestions(shuffleArray([...questions]));
  };
  
  const playMorseCode = (morse: string) => {
    if (!settings.enableSound) return;
    
    // Clean up previous audio
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
    }
    
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (!audioContext) return; // Browser doesn't support Web Audio API
    
    const dotDuration = 1.2 / settings.wpm; // Duration of a dot in seconds
    const dashDuration = dotDuration * 3; // Duration of a dash
    const pauseBetweenElements = dotDuration; // Pause between dots and dashes
    const pauseBetweenCharacters = dotDuration * 3; // Pause between characters
    
    gainNode = audioContext.createGain();
    oscillator = audioContext.createOscillator();
    
    oscillator.type = "sine";
    oscillator.frequency.value = 700; // Hz
    
    gainNode.gain.value = settings.volume / 100; // Convert percentage to gain (0-1)
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    gainNode.gain.value = 0; // Start silent
    
    let currentTime = audioContext.currentTime;
    
    // Split into characters
    const characters = morse.split(' ');
    
    characters.forEach((character, idx) => {
      for (let i = 0; i < character.length; i++) {
        const symbol = character[i];
        
        if (symbol === '.') {
          // Play a dot
          gainNode!.gain.setValueAtTime(settings.volume / 100, currentTime);
          currentTime += dotDuration;
          gainNode!.gain.setValueAtTime(0, currentTime);
          currentTime += pauseBetweenElements;
        } else if (symbol === '-') {
          // Play a dash
          gainNode!.gain.setValueAtTime(settings.volume / 100, currentTime);
          currentTime += dashDuration;
          gainNode!.gain.setValueAtTime(0, currentTime);
          currentTime += pauseBetweenElements;
        }
      }
      
      // Add pause between characters unless it's the last character
      if (idx < characters.length - 1) {
        currentTime += pauseBetweenCharacters;
      }
    });
    
    // Stop after playing the last symbol
    oscillator.stop(currentTime);
    
    // Flag playback as active
    setIsPlaying(true);
    
    // Set a timeout to update the UI when playback finishes
    setTimeout(() => {
      setIsPlaying(false);
    }, (currentTime - audioContext.currentTime) * 1000);
  };
  
  const handlePlayButtonClick = () => {
    if (!currentQuestion) return;
    
    if (currentQuestion.type === 'hear-to-char' || currentQuestion.type === 'hear-to-word') {
      playMorseCode(currentQuestion.question);
    } else if (currentQuestion.type === 'morse-to-char') {
      // Visual morse code, play the morse code string
      playMorseCode(currentQuestion.question);
    } else if (currentQuestion.type === 'char-to-morse' || currentQuestion.type === 'word-to-morse') {
      // Character to morse, play the correct morse code answer
      playMorseCode(currentQuestion.correctAnswer);
    }
  };
  
  const handleLearnChar = (char: string) => {
    setLearningChar(char);
    setShowLearnDialog(true);
    setCurrentSoundChar(char);
    
    // Play the morse code for this character
    if (char.length === 1) {
      playMorseCode(MORSE_CODE_DICT[char]);
    } else {
      playMorseCode(wordToMorse(char));
    }
  };
  
  // Get the correct game content based on the mode
  const renderGameContent = () => {
    if (!currentQuestion) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-lg text-gray-400">No questions available.</div>
          <Button 
            className="mt-4" 
            onClick={() => setShowSettings(true)}
          >
            Configure Settings
          </Button>
        </div>
      );
    }
    
    // Quiz Mode
    if (gameMode === 'quiz') {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="bg-gray-800">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <Badge variant="outline" className={currentQuestion.difficulty === 'easy' ? 'bg-green-900 text-green-100' : 
              currentQuestion.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-100' : 
              'bg-red-900 text-red-100'}>
              {currentQuestion.difficulty}
            </Badge>
          </div>
          
          <Card className="bg-gray-850 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentQuestion.type === 'hear-to-char' || currentQuestion.type === 'hear-to-word' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`${isPlaying ? 'bg-blue-900 text-blue-100' : 'bg-gray-800'}`}
                      onClick={handlePlayButtonClick}
                    >
                      {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                      Listen
                    </Button>
                  ) : (
                    <>
                      {currentQuestion.type === 'morse-to-char' ? (
                        <span className="font-mono text-blue-300">
                          {currentQuestion.question}
                        </span>
                      ) : (
                        <span>
                          {currentQuestion.question}
                        </span>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handlePlayButtonClick}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <Badge>{currentQuestion.category}</Badge>
              </CardTitle>
              <CardDescription>
                {currentQuestion.type === 'morse-to-char' ? "Convert Morse to character" : 
                 currentQuestion.type === 'char-to-morse' ? "Convert character to Morse" :
                 currentQuestion.type === 'hear-to-char' ? "Listen and identify the character" :
                 currentQuestion.type === 'word-to-morse' ? "Convert word to Morse" :
                 "Listen and identify the word"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* For questions with options */}
              {(currentQuestion.type === 'morse-to-char' || 
                currentQuestion.type === 'hear-to-char' ||
                currentQuestion.type === 'char-to-morse') && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {currentQuestion.options.map((option, idx) => (
                    <Button
                      key={`${option}-${idx}`}
                      className={`h-12 text-lg ${
                        selectedAnswer === option
                          ? isCorrect
                            ? 'bg-green-700 hover:bg-green-800 border-green-600'
                            : 'bg-red-700 hover:bg-red-800 border-red-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                      disabled={isCorrect !== null}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
              
              {/* For questions requiring text input */}
              {(currentQuestion.type === 'word-to-morse' || 
                currentQuestion.type === 'hear-to-word') && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className={`w-full p-3 text-lg bg-gray-900 border ${
                      isCorrect === null
                        ? 'border-gray-700'
                        : isCorrect
                        ? 'border-green-600'
                        : 'border-red-600'
                    } rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Type your answer here..."
                    disabled={isCorrect !== null}
                  />
                  <Button
                    className="w-full mt-2"
                    onClick={handleTextInputAnswer}
                    disabled={isCorrect !== null || textInput.trim() === ''}
                  >
                    Submit Answer
                  </Button>
                </div>
              )}
              
              {showFeedback && (
                <div className={`mt-4 p-3 rounded-md ${
                  isCorrect ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'
                }`}>
                  <p className="text-sm font-medium">
                    {isCorrect 
                      ? "Correct! Well done." 
                      : `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={() => setGameMode('learn')}>
                Back to Learning
              </Button>
              <Button onClick={handleNextQuestion}>
                Next Question
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
    
    // Challenge Mode
    if (gameMode === 'challenge') {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {Array(3).fill(0).map((_, idx) => (
                <Heart 
                  key={idx} 
                  className={`h-5 w-5 ${idx < lives ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} 
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-yellow-400" />
              <span className="font-mono text-sm">{timeLeft}s</span>
            </div>
            <Badge variant="outline" className="bg-blue-900 text-blue-100">
              Score: {stats.lastSessionScore}
            </Badge>
          </div>
          
          {isGameOver ? (
            <Card className="bg-gray-850 border-gray-700">
              <CardHeader>
                <CardTitle>Challenge Complete!</CardTitle>
                <CardDescription>
                  {timeLeft === 0 
                    ? "Time's up!" 
                    : lives <= 0 
                    ? "You've run out of lives." 
                    : "Challenge complete!"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">
                    {stats.lastSessionScore}
                  </div>
                  <div className="text-gray-400">points</div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-gray-800 p-3 rounded-md">
                      <div className="text-gray-400 text-xs">Accuracy</div>
                      <div className="text-xl font-bold">
                        {stats.total > 0 
                          ? Math.round((stats.correct / stats.total) * 100) 
                          : 0}%
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-md">
                      <div className="text-gray-400 text-xs">Longest Streak</div>
                      <div className="text-xl font-bold">{stats.longestStreak}</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-md">
                      <div className="text-gray-400 text-xs">WPM</div>
                      <div className="text-xl font-bold">{settings.wpm}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" onClick={() => setGameMode('learn')}>
                  Back to Learning
                </Button>
                <Button onClick={startChallengeMode}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Try Again
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-gray-850 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentQuestion.type === 'hear-to-char' || currentQuestion.type === 'hear-to-word' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={`${isPlaying ? 'bg-blue-900 text-blue-100' : 'bg-gray-800'}`}
                        onClick={handlePlayButtonClick}
                      >
                        {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                        Listen
                      </Button>
                    ) : (
                      <>
                        {currentQuestion.type === 'morse-to-char' ? (
                          <span className="font-mono text-blue-300">
                            {currentQuestion.question}
                          </span>
                        ) : (
                          <span>
                            {currentQuestion.question}
                          </span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handlePlayButtonClick}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <Badge>{currentQuestion.category}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* For questions with options */}
                {(currentQuestion.type === 'morse-to-char' || 
                  currentQuestion.type === 'hear-to-char' ||
                  currentQuestion.type === 'char-to-morse') && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {currentQuestion.options.map((option, idx) => (
                      <Button
                        key={`${option}-${idx}`}
                        className={`h-12 text-lg ${
                          selectedAnswer === option
                            ? isCorrect
                              ? 'bg-green-700 hover:bg-green-800 border-green-600'
                              : 'bg-red-700 hover:bg-red-800 border-red-600'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                        disabled={isCorrect !== null}
                        onClick={() => handleAnswerSelect(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* For questions requiring text input */}
                {(currentQuestion.type === 'word-to-morse' || 
                  currentQuestion.type === 'hear-to-word') && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className={`w-full p-3 text-lg bg-gray-900 border ${
                        isCorrect === null
                          ? 'border-gray-700'
                          : isCorrect
                          ? 'border-green-600'
                          : 'border-red-600'
                      } rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Type your answer here..."
                      disabled={isCorrect !== null}
                    />
                    <Button
                      className="w-full mt-2"
                      onClick={handleTextInputAnswer}
                      disabled={isCorrect !== null || textInput.trim() === ''}
                    >
                      Submit Answer
                    </Button>
                  </div>
                )}
                
                {showFeedback && (
                  <div className={`mt-4 p-3 rounded-md ${
                    isCorrect ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'
                  }`}>
                    <p className="text-sm font-medium">
                      {isCorrect 
                        ? "Correct! Well done." 
                        : `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleNextQuestion}>
                  Next
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      );
    }
    
    // Learn Mode - progressive drill-based learning
    if (gameMode === 'learn') {
      const drillQuestion = PROGRESSIVE_DRILLS[currentDrillIndex];
      const progress = Math.round((drillCompleted.filter(Boolean).length / PROGRESSIVE_DRILLS.length) * 100);
      
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Learning Progress</h3>
            <Badge variant="outline" className="bg-gray-800">
              {drillCompleted.filter(Boolean).length} / {PROGRESSIVE_DRILLS.length} Completed
            </Badge>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <Card className="bg-gray-850 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div>Drill {currentDrillIndex + 1}: {drillQuestion.correctAnswer}</div>
                <Badge>{drillQuestion.category}</Badge>
              </CardTitle>
              <CardDescription>
                {drillQuestion.hint || "Practice recognizing this character in Morse code"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4 py-6">
                <div className="text-5xl font-bold text-blue-300">
                  {drillQuestion.correctAnswer}
                </div>
                <div className="text-xl font-mono text-gray-300">
                  {MORSE_CODE_DICT[drillQuestion.correctAnswer] || wordToMorse(drillQuestion.correctAnswer)}
                </div>
              </div>
              
              <div className="flex justify-center mb-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  className={`${isPlaying ? 'bg-blue-900 text-blue-100' : 'bg-gray-800'}`}
                  onClick={() => playMorseCode(MORSE_CODE_DICT[drillQuestion.correctAnswer] || wordToMorse(drillQuestion.correctAnswer))}
                >
                  {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                  Listen to Morse Code
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button 
                  variant={drillCompleted[currentDrillIndex] ? "outline" : "default"}
                  className={drillCompleted[currentDrillIndex] ? "bg-green-900 text-green-100" : ""}
                  onClick={() => {
                    if (!drillCompleted[currentDrillIndex]) {
                      const newDrillCompleted = [...drillCompleted];
                      newDrillCompleted[currentDrillIndex] = true;
                      setDrillCompleted(newDrillCompleted);
                      
                      // Update global progress
                      recordMorsePractice(
                        settings.wpm,
                        (stats.correct / Math.max(stats.total, 1)) * 100,
                        newDrillCompleted.filter(Boolean).length > 0
                      );
                    }
                    
                    // Move to next drill if there is one
                    if (currentDrillIndex < PROGRESSIVE_DRILLS.length - 1) {
                      setCurrentDrillIndex(prev => prev + 1);
                    }
                  }}
                >
                  {drillCompleted[currentDrillIndex] ? "Completed ✓" : "Mark as Completed"}
                </Button>
                
                <Button 
                  variant="secondary"
                  onClick={() => setGameMode('quiz')}
                >
                  Practice in Quiz Mode
                </Button>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  disabled={currentDrillIndex === 0}
                  onClick={() => setCurrentDrillIndex(prev => Math.max(0, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  disabled={currentDrillIndex >= PROGRESSIVE_DRILLS.length - 1}
                  onClick={() => setCurrentDrillIndex(prev => Math.min(prev + 1, PROGRESSIVE_DRILLS.length - 1))}
                >
                  Next
                </Button>
              </div>
              
              <Button 
                variant="default"
                onClick={startChallengeMode}
              >
                <Award className="h-4 w-4 mr-1" />
                Start Challenge
              </Button>
            </CardFooter>
          </Card>
          
          {/* Character Explorer for quick reference */}
          <div className="mt-6">
            <h3 className="text-base font-semibold mb-3">Character Explorer</h3>
            <Tabs defaultValue="Letters">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="Letters">Letters</TabsTrigger>
                <TabsTrigger value="Numbers">Numbers</TabsTrigger>
                <TabsTrigger value="Punctuation">Punctuation</TabsTrigger>
                <TabsTrigger value="Special/Prosigns">Prosigns</TabsTrigger>
              </TabsList>
              
              {Object.entries(CHARACTER_CATEGORIES).map(([categoryName, chars]) => (
                <TabsContent key={categoryName} value={categoryName} className="mt-2">
                  <div className="bg-gray-900 rounded-md border border-gray-800 p-3">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {chars.map((char) => (
                        <TooltipProvider key={char}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className={`p-2 rounded-md ${
                                  stats.charactersLearned.includes(char)
                                    ? 'bg-blue-900 border border-blue-700'
                                    : 'bg-gray-800 border border-gray-700'
                                } hover:bg-gray-700 transition-colors`}
                                onClick={() => handleLearnChar(char)}
                              >
                                <div className="text-lg font-bold">
                                  {char}
                                </div>
                                <div className="text-xs text-gray-400 font-mono">
                                  {MORSE_CODE_DICT[char]}
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Click to practice
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Character learning dialog
  const renderLearningDialog = () => {
    if (!learningChar) return null;
    
    const morse = MORSE_CODE_DICT[learningChar] || wordToMorse(learningChar);
    
    return (
      <Dialog open={showLearnDialog} onOpenChange={setShowLearnDialog}>
        <DialogContent className="bg-gray-850 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Learn: {learningChar}</span>
              <Badge>{getCharacterCategory(learningChar)}</Badge>
            </DialogTitle>
            <DialogDescription>
              Practice listening and recognizing this character
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className="text-6xl font-bold text-blue-300">
              {learningChar}
            </div>
            <div className="text-xl font-mono text-gray-300">
              {morse}
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {morse.split('').map((symbol, index) => (
                symbol !== ' ' && (
                  <span 
                    key={index} 
                    className={`inline-block ${symbol === '.' ? 'w-2 h-2' : 'w-6 h-2'} rounded-full ${
                      symbol === '.' ? 'bg-blue-400' : 'bg-blue-600'
                    }`}
                  />
                )
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="lg"
              className={`${isPlaying ? 'bg-blue-900 text-blue-100' : 'bg-gray-800'} mt-4`}
              onClick={() => playMorseCode(morse)}
            >
              {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              Listen to Morse Code
            </Button>
            
            <div className="text-xs text-gray-400 mt-2">
              Click play repeatedly to help memorize the sound pattern
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowLearnDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Settings dialog
  const renderSettingsDialog = () => {
    return (
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-gray-850 border-gray-700 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Game Settings</DialogTitle>
            <DialogDescription>
              Customize your Morse code learning experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Speed (WPM)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={settings.wpm}
                    onChange={(e) => setSettings({
                      ...settings,
                      wpm: parseInt(e.target.value)
                    })}
                    className="flex-1 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="w-10 text-center font-mono text-sm">{settings.wpm}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Volume</label>
                <div className="flex items-center gap-2">
                  <VolumeX className="h-4 w-4" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.volume}
                    onChange={(e) => setSettings({
                      ...settings,
                      volume: parseInt(e.target.value)
                    })}
                    className="flex-1 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                  <Volume2 className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select
                value={settings.difficulty}
                onValueChange={(value: any) => setSettings({
                  ...settings,
                  difficulty: value
                })}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select a difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Question Types</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'morse-to-char', label: 'Morse → Character' },
                  { id: 'char-to-morse', label: 'Character → Morse' },
                  { id: 'hear-to-char', label: 'Audio → Character' },
                  { id: 'word-to-morse', label: 'Word → Morse' },
                  { id: 'hear-to-word', label: 'Audio → Word' }
                ].map((type) => (
                  <div key={type.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={type.id}
                      checked={settings.questionTypes.includes(type.id as QuestionType)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings({
                            ...settings,
                            questionTypes: [...settings.questionTypes, type.id as QuestionType]
                          });
                        } else {
                          setSettings({
                            ...settings,
                            questionTypes: settings.questionTypes.filter(t => t !== type.id)
                          });
                        }
                      }}
                      className="bg-gray-700 border-gray-600 rounded-sm"
                    />
                    <label htmlFor={type.id} className="text-sm">{type.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setSettings(DEFAULT_SETTINGS);
              }}
            >
              Reset to Defaults
            </Button>
            <Button
              onClick={() => {
                setShowSettings(false);
                resetGame();
              }}
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="space-y-5">
      {/* Game header with stats */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-3 border border-blue-700">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white">Morse Code Trainer</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-100"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="bg-blue-900 bg-opacity-50 rounded-md p-2 text-center">
            <div className="text-xs text-blue-200">Accuracy</div>
            <div className="text-sm font-medium text-white">
              {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
            </div>
          </div>
          <div className="bg-blue-900 bg-opacity-50 rounded-md p-2 text-center">
            <div className="text-xs text-blue-200">Score</div>
            <div className="text-sm font-medium text-white">{stats.correct}</div>
          </div>
          <div className="bg-blue-900 bg-opacity-50 rounded-md p-2 text-center">
            <div className="text-xs text-blue-200">Streak</div>
            <div className="text-sm font-medium text-white">{stats.streak}</div>
          </div>
          <div className="bg-blue-900 bg-opacity-50 rounded-md p-2 text-center">
            <div className="text-xs text-blue-200">Speed</div>
            <div className="text-sm font-medium text-white">{settings.wpm} WPM</div>
          </div>
        </div>
      </div>
      
      {/* Game mode tabs */}
      <div>
        <Tabs value={gameMode} onValueChange={(value: any) => setGameMode(value)}>
          <TabsList className="grid grid-cols-3 h-auto p-1 bg-gray-900">
            <TabsTrigger value="learn" className="text-sm py-1.5 h-auto data-[state=active]:bg-blue-900">
              <Radio className="h-3.5 w-3.5 mr-1" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="quiz" className="text-sm py-1.5 h-auto data-[state=active]:bg-green-900">
              <Radio className="h-3.5 w-3.5 mr-1" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="challenge" className="text-sm py-1.5 h-auto data-[state=active]:bg-yellow-900">
              <Radio className="h-3.5 w-3.5 mr-1" />
              Challenge
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={gameMode} className="pt-4">
            {renderGameContent()}
          </TabsContent>
        </Tabs>
      </div>
      
      {renderLearningDialog()}
      {renderSettingsDialog()}
    </div>
  );
};

export { MorseCodeGame };
export default MorseCodeGame;
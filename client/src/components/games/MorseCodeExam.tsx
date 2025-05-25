import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Radio, 
  Check,
  X,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  CheckCircle,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Morse code mapping
const morseCodeMap: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', 
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', 
  '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  '/': '-..-.', '@': '.--.-.', '=': '-...-', '+': '.-.-.', '-': '-....-',
  '"': '.-..-.', "'": '.----.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
  ':': '---...', ';': '-.-.-.', '_': '..--.-', '!': '-.-.--'
};

// Reverse lookup map
const charFromMorse: Record<string, string> = Object.entries(morseCodeMap).reduce(
  (acc, [char, morse]) => ({ ...acc, [morse]: char }), {}
);

// Categories for the exam
type ExamCategory = "letters" | "numbers" | "punctuation" | "words" | "callsigns" | "mixed";

// Sample words for testing
const sampleWords = [
  "RADIO", "MORSE", "CODE", "SIGNAL", "ANTENNA", "TRANSMIT", 
  "RECEIVE", "AMATEUR", "FREQUENCY", "BAND", "STATION", "OPERATOR",
  "LICENSE", "CALL", "SIGN", "BASIC", "ADVANCED", "EXAM", "TEST",
  "TELEGRAPH", "COMMUNICATION", "TRANSCEIVER", "HAM", "REPEATER"
];

// Sample callsigns for testing
const sampleCallsigns = [
  "VA7HAM", "VE3XYZ", "VE7ABC", "VA3DEF", "VE5GHI", "VA6JKL", 
  "VE2MNO", "VA1PQR", "VE4STU", "VE9VWX", "VE8YZ", "VA2BC"
];

// Exam levels
const examLevels = [
  { name: "Beginner", wpm: 5, description: "5 WPM - Basic recognition" },
  { name: "Standard", wpm: 12, description: "12 WPM - Basic qualification requirement" },
  { name: "Advanced", wpm: 20, description: "20 WPM - Advanced operators" }
];

// Audio context for generating Morse code sounds
let audioCtx: AudioContext | null = null;

// Function to play a single tone
const playTone = (frequency: number, duration: number, startTime: number, volume: number) => {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.005);
  gainNode.gain.setValueAtTime(volume, startTime + duration - 0.005);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

// Function to convert text to Morse code audio
const textToMorseAudio = (
  text: string, 
  wpm: number, 
  frequency: number = 700, 
  volume: number = 0.5
) => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  
  // Timing calculations
  const dotDuration = 1.2 / wpm; // Dot duration in seconds
  const dashDuration = dotDuration * 3; // Dash is 3x dot length
  const symbolSpaceDuration = dotDuration; // Space between symbols in same character
  const charSpaceDuration = dotDuration * 3; // Space between characters
  const wordSpaceDuration = dotDuration * 7; // Space between words
  
  let currentTime = audioCtx.currentTime + 0.2; // Add a small delay before starting
  
  text = text.toUpperCase();
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === ' ') {
      currentTime += wordSpaceDuration;
      continue;
    }
    
    const morseChar = morseCodeMap[char];
    
    if (morseChar) {
      for (let j = 0; j < morseChar.length; j++) {
        const symbol = morseChar[j];
        
        if (symbol === '.') {
          playTone(frequency, dotDuration, currentTime, volume);
          currentTime += dotDuration;
        } else if (symbol === '-') {
          playTone(frequency, dashDuration, currentTime, volume);
          currentTime += dashDuration;
        }
        
        // Add space between symbols (but not after the last symbol)
        if (j < morseChar.length - 1) {
          currentTime += symbolSpaceDuration;
        }
      }
      
      // Add space between characters
      currentTime += charSpaceDuration;
    }
  }
  
  return currentTime - audioCtx.currentTime; // Return duration of the audio
};

// Generate random content for the exam
const generateRandomContent = (category: ExamCategory): string => {
  switch (category) {
    case "letters":
      return Array.from({ length: 5 }, () => 
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      ).join('');
      
    case "numbers":
      return Array.from({ length: 5 }, () => 
        String.fromCharCode(48 + Math.floor(Math.random() * 10))
      ).join('');
      
    case "punctuation":
      const punctuation = ['.', ',', '?', '/', '@', '=', '+', '-', '"', "'", '(', ')', '&', ':', ';', '_', '!'];
      return Array.from({ length: 5 }, () => 
        punctuation[Math.floor(Math.random() * punctuation.length)]
      ).join('');
      
    case "words":
      return sampleWords[Math.floor(Math.random() * sampleWords.length)];
      
    case "callsigns":
      return sampleCallsigns[Math.floor(Math.random() * sampleCallsigns.length)];
      
    case "mixed":
      // Combine letters, numbers, and some punctuation
      let result = "";
      for (let i = 0; i < 5; i++) {
        const type = Math.floor(Math.random() * 3);
        if (type === 0) {
          result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        } else if (type === 1) {
          result += String.fromCharCode(48 + Math.floor(Math.random() * 10));
        } else {
          const simplePunctuation = ['.', ',', '?', '/', '-'];
          result += simplePunctuation[Math.floor(Math.random() * simplePunctuation.length)];
        }
      }
      return result;
  }
};

// Morse Code Exam Component
export const MorseCodeExam: React.FC = () => {
  // Audio settings
  const [frequency, setFrequency] = useState<number>(700);
  const [volume, setVolume] = useState<number>(0.7);
  const [wpm, setWpm] = useState<number>(12);
  const [muted, setMuted] = useState<boolean>(false);
  
  // Exam settings
  const [examMode, setExamMode] = useState<boolean>(false);
  const [examCategory, setExamCategory] = useState<ExamCategory>("letters");
  const [examLevel, setExamLevel] = useState<number>(1); // 0: Beginner, 1: Standard, 2: Advanced
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  
  // Exam content
  const [examContent, setExamContent] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [examCompleted, setExamCompleted] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  
  // Audio playback
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioProgressRef = useRef<number>(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Additional state for the exam timer
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Practice mode state
  const [practiceText, setPracticeText] = useState<string>("CQ CQ CQ");
  const [showMorse, setShowMorse] = useState<boolean>(true);

  // Initialize exam
  const initExam = () => {
    // Generate questions based on category
    const questions = Array.from({ length: totalQuestions }, () => 
      generateRandomContent(examCategory)
    );
    
    setExamContent(questions);
    setUserAnswers(Array(totalQuestions).fill(""));
    setCurrentQuestion(0);
    setExamCompleted(false);
    setCorrectAnswers(0);
    setUserInput("");
    setExamMode(true);
  };

  // Update WPM based on exam level
  useEffect(() => {
    setWpm(examLevels[examLevel].wpm);
  }, [examLevel]);
  
  // Play the current question
  const playCurrentQuestion = () => {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    
    if (isPlaying || !examContent[currentQuestion]) return;
    
    setIsPlaying(true);
    audioProgressRef.current = 0;
    setAudioProgress(0);
    
    const effectiveVolume = muted ? 0 : volume;
    const duration = textToMorseAudio(
      examContent[currentQuestion], 
      wpm, 
      frequency, 
      effectiveVolume
    );
    
    setAudioDuration(duration);
    
    // Start progress tracking
    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(100, (elapsed / duration) * 100);
      audioProgressRef.current = progress;
      setAudioProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval.current!);
        setIsPlaying(false);
        
        // Automatically start the answer timer after playing
        startAnswerTimer();
      }
    }, 100);
  };

  // Start timer for answering
  const startAnswerTimer = () => {
    // Set answer time based on difficulty (more time for beginners)
    const answerTime = examLevel === 0 ? 20 : examLevel === 1 ? 15 : 10;
    setTimeLeft(answerTime);
    setTimerActive(true);
    
    clearInterval(timerInterval.current!);
    timerInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current!);
          setTimerActive(false);
          // Move to next question if time runs out
          submitAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Submit answer and move to next question
  const submitAnswer = () => {
    clearInterval(timerInterval.current!);
    setTimerActive(false);
    
    // Update user answers
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = userInput.toUpperCase();
    setUserAnswers(newAnswers);
    
    // Check if answer is correct
    if (userInput.toUpperCase() === examContent[currentQuestion]) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    // Clear input for next question
    setUserInput("");
    
    // Move to next question or complete the exam
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeExam();
    }
  };
  
  // Complete the exam and show results
  const completeExam = () => {
    setExamCompleted(true);
    setExamMode(false);
  };

  // Play custom text in practice mode
  const playPracticeText = () => {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    
    if (isPlaying) return;
    
    setIsPlaying(true);
    audioProgressRef.current = 0;
    setAudioProgress(0);
    
    const effectiveVolume = muted ? 0 : volume;
    const duration = textToMorseAudio(
      practiceText, 
      wpm, 
      frequency, 
      effectiveVolume
    );
    
    setAudioDuration(duration);
    
    // Start progress tracking
    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(100, (elapsed / duration) * 100);
      audioProgressRef.current = progress;
      setAudioProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval.current!);
        setIsPlaying(false);
      }
    }, 100);
  };

  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  // Convert text to Morse code display
  const textToMorseDisplay = (text: string): string => {
    return text
      .toUpperCase()
      .split('')
      .map(char => {
        if (char === ' ') return '    ';
        return morseCodeMap[char] || '';
      })
      .filter(morse => morse !== '')
      .join(' ');
  };

  // Calculate exam results
  const calculateResults = () => {
    const score = (correctAnswers / totalQuestions) * 100;
    
    let grade = '';
    let message = '';
    
    if (score >= 90) {
      grade = 'Excellent';
      message = 'You have mastered Morse code at this level!';
    } else if (score >= 75) {
      grade = 'Good';
      message = 'You have a solid understanding of Morse code.';
    } else if (score >= 60) {
      grade = 'Satisfactory';
      message = 'You\'re making progress. Keep practicing!';
    } else {
      grade = 'Needs Practice';
      message = 'Continue to work on your Morse code skills.';
    }
    
    return { score, grade, message };
  };

  // Stop audio playback
  const stopAudio = () => {
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    setIsPlaying(false);
    setAudioProgress(0);
  };

  // Render Exam Configuration UI
  const renderExamConfig = () => (
    <div className="space-y-4 bg-gray-850 p-4 rounded-md border border-gray-700">
      <h3 className="text-sm font-medium text-gray-200 mb-2">Official Morse Code Exam</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Content Type</Label>
          <Select 
            value={examCategory} 
            onValueChange={(value) => setExamCategory(value as ExamCategory)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="letters">Letters</SelectItem>
              <SelectItem value="numbers">Numbers</SelectItem>
              <SelectItem value="punctuation">Punctuation</SelectItem>
              <SelectItem value="words">Words</SelectItem>
              <SelectItem value="callsigns">Callsigns</SelectItem>
              <SelectItem value="mixed">Mixed Characters</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Exam Level</Label>
          <Select 
            value={examLevel.toString()} 
            onValueChange={(value) => setExamLevel(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {examLevels.map((level, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {level.name} ({level.wpm} WPM)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Number of Questions</Label>
          <Select 
            value={totalQuestions.toString()} 
            onValueChange={(value) => setTotalQuestions(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select questions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Questions</SelectItem>
              <SelectItem value="10">10 Questions</SelectItem>
              <SelectItem value="15">15 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Tone Frequency</Label>
          <Select 
            value={frequency.toString()} 
            onValueChange={(value) => setFrequency(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="600">Low (600 Hz)</SelectItem>
              <SelectItem value="700">Medium (700 Hz)</SelectItem>
              <SelectItem value="800">High (800 Hz)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Alert className="bg-blue-900 bg-opacity-30 border-blue-800">
        <AlertTriangle className="h-4 w-4 text-blue-300" />
        <AlertTitle className="text-blue-300 text-sm">Exam Information</AlertTitle>
        <AlertDescription className="text-xs text-blue-200">
          The official Canadian ham radio exam requires recognizing Morse code at 5 WPM for the Basic
          qualification. This test simulates the exam environment.
        </AlertDescription>
      </Alert>
      
      <Button 
        className="w-full bg-blue-700 hover:bg-blue-600"
        onClick={initExam}
      >
        Start Morse Code Exam
      </Button>
    </div>
  );

  // Render Exam Question UI
  const renderExamQuestion = () => (
    <div className="space-y-4 bg-gray-850 p-4 rounded-md border border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <Badge variant="outline" className="text-blue-300 border-blue-700">
            Question {currentQuestion + 1} of {totalQuestions}
          </Badge>
        </div>
        <div>
          <Badge className={`
            ${timeLeft > 10 ? 'bg-green-700 text-green-100' : 
              timeLeft > 5 ? 'bg-amber-700 text-amber-100' : 
              'bg-red-700 text-red-100 animate-pulse'}
          `}>
            <Timer className="h-3 w-3 mr-1" />
            {timeLeft}s
          </Badge>
        </div>
      </div>
      
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex justify-between items-center">
            <span>Listen to the Morse Code</span>
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              {examLevels[examLevel].name} - {wpm} WPM
            </Badge>
          </CardTitle>
          <CardDescription>
            Type what you hear in the box below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-3">
            <Button
              variant="outline"
              size="icon"
              className={`mr-2 ${isPlaying ? 'bg-amber-900 text-amber-300' : 'bg-blue-900 text-blue-300'}`}
              onClick={playCurrentQuestion}
              disabled={isPlaying}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-gray-800 text-gray-300"
              onClick={() => setMuted(!muted)}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          
          <Progress value={audioProgress} className="h-1 mb-4" />
          
          <Input
            className="bg-gray-850 border-gray-700 text-center"
            placeholder="Type what you hear"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isPlaying}
            autoFocus
          />
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-green-700 hover:bg-green-600"
            onClick={submitAnswer}
            disabled={isPlaying || !userInput.trim()}
          >
            Submit Answer
          </Button>
        </CardFooter>
      </Card>
      
      <Alert className="bg-gray-900 border-gray-800">
        <HelpCircle className="h-4 w-4 text-blue-300" />
        <AlertTitle className="text-gray-200 text-sm">Exam Instructions</AlertTitle>
        <AlertDescription className="text-xs text-gray-400">
          Click the play button to hear the Morse code. Type your answer and submit.
          You have {examLevel === 0 ? 20 : examLevel === 1 ? 15 : 10} seconds to respond after the audio finishes.
        </AlertDescription>
      </Alert>
    </div>
  );

  // Render Exam Results UI
  const renderExamResults = () => {
    const { score, grade, message } = calculateResults();
    
    return (
      <div className="space-y-4 bg-gray-850 p-4 rounded-md border border-gray-700">
        <h3 className="text-lg font-semibold text-center text-gray-200 mb-2">
          Morse Code Exam Results
        </h3>
        
        <div className="text-center mb-4">
          <div className="text-4xl font-bold mb-2 text-blue-300">{Math.round(score)}%</div>
          <Badge className={`
            ${score >= 90 ? 'bg-green-700 text-green-100' : 
              score >= 75 ? 'bg-blue-700 text-blue-100' : 
              score >= 60 ? 'bg-amber-700 text-amber-100' : 
              'bg-red-700 text-red-100'}
          `}>
            {grade}
          </Badge>
          <p className="text-sm text-gray-300 mt-2">
            {message}
          </p>
        </div>
        
        <div className="bg-gray-900 rounded-md p-3 border border-gray-800 mb-4">
          <h4 className="text-sm font-medium text-gray-200 mb-2">Answer Summary</h4>
          
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {examContent.map((question, index) => (
              <div 
                key={index}
                className={`p-2 rounded-md text-xs ${
                  userAnswers[index].toUpperCase() === question.toUpperCase()
                    ? 'bg-green-900 bg-opacity-30 border border-green-800'
                    : 'bg-red-900 bg-opacity-30 border border-red-800'
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Question {index + 1}</span>
                  {userAnswers[index].toUpperCase() === question.toUpperCase() 
                    ? <Check className="h-4 w-4 text-green-400" />
                    : <X className="h-4 w-4 text-red-400" />
                  }
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400">Expected:</span>
                    <div className="font-mono text-green-300">{question}</div>
                    <div className="font-mono text-xs text-green-500 opacity-70">
                      {textToMorseDisplay(question)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Your answer:</span>
                    <div className={`font-mono ${
                      userAnswers[index].toUpperCase() === question.toUpperCase()
                        ? 'text-green-300'
                        : 'text-red-300'
                    }`}>
                      {userAnswers[index] || '(no answer)'}
                    </div>
                    <div className="font-mono text-xs text-blue-500 opacity-70">
                      {textToMorseDisplay(userAnswers[index])}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setExamMode(false)}
          >
            Return to Options
          </Button>
          <Button
            className="flex-1 bg-blue-700 hover:bg-blue-600"
            onClick={initExam}
          >
            Retry Exam
          </Button>
        </div>
      </div>
    );
  };

  // Render Practice Mode UI
  const renderPracticeMode = () => (
    <div className="space-y-4 bg-gray-850 p-4 rounded-md border border-gray-700">
      <h3 className="text-sm font-medium text-gray-200 mb-2">Morse Code Practice</h3>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Practice Text</Label>
          <Input
            className="bg-gray-900 border-gray-700"
            placeholder="Enter text to convert to Morse code"
            value={practiceText}
            onChange={(e) => setPracticeText(e.target.value)}
          />
        </div>
        
        {showMorse && (
          <div className="bg-gray-900 p-3 rounded-md border border-gray-800">
            <Label className="text-xs text-gray-400">Morse Code</Label>
            <div className="font-mono text-sm text-blue-300 mt-1 break-words">
              {textToMorseDisplay(practiceText)}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="space-y-1 flex-1">
            <Label className="text-xs text-gray-400">Speed (WPM)</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[wpm]}
                min={5}
                max={30}
                step={1}
                onValueChange={(values) => setWpm(values[0])}
                className="flex-1"
              />
              <span className="text-xs text-gray-300 w-8 text-right">{wpm}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="space-y-1 flex-1">
            <Label className="text-xs text-gray-400">Volume</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[volume * 100]}
                min={0}
                max={100}
                step={5}
                onValueChange={(values) => setVolume(values[0] / 100)}
                className="flex-1"
                disabled={muted}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setMuted(!muted)}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-blue-700 hover:bg-blue-600 gap-2"
            onClick={playPracticeText}
            disabled={isPlaying || !practiceText.trim()}
          >
            <Headphones className="h-4 w-4" />
            <span>{isPlaying ? 'Playing...' : 'Play Morse Code'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="bg-gray-800"
            onClick={() => setShowMorse(!showMorse)}
          >
            {showMorse ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          </Button>
        </div>
        
        {isPlaying && (
          <Progress value={audioProgress} className="h-1" />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="exam" className="space-y-4">
        <TabsList className="grid grid-cols-2 h-auto p-1 bg-gray-900">
          <TabsTrigger value="exam" className="text-xs py-1 h-auto data-[state=active]:bg-blue-900">
            <div className="flex flex-col items-center gap-0.5">
              <CheckCircle className="h-3 w-3" />
              <span>Morse Code Exam</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="practice" className="text-xs py-1 h-auto data-[state=active]:bg-green-900">
            <div className="flex flex-col items-center gap-0.5">
              <Headphones className="h-3 w-3" />
              <span>Practice Mode</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="exam" className="space-y-4 mt-4">
          {!examMode && !examCompleted && renderExamConfig()}
          {examMode && !examCompleted && renderExamQuestion()}
          {examCompleted && renderExamResults()}
        </TabsContent>
        
        <TabsContent value="practice" className="space-y-4 mt-4">
          {renderPracticeMode()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MorseCodeExam;
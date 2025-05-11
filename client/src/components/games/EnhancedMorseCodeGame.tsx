import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Radio, Lightbulb, Zap, AlertCircle, BookOpen, Volume2, CheckCircle2, XCircle } from "lucide-react";

// Import hooks
import { useLearningProgress } from '@/hooks/use-learning-progress';

// Morse code mapping
const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 
  'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
  'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
  'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
  '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  '/': '-..-.', '@': '.--.-.', '=': '-...-', ' ': '/'
};

// Reverse mapping for decoding
const MORSE_TO_CHAR: Record<string, string> = {};
Object.entries(MORSE_CODE).forEach(([char, code]) => {
  MORSE_TO_CHAR[code] = char;
});

// Lesson structure
interface MorseLesson {
  id: string;
  title: string;
  description: string;
  characters: string[];
  words?: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
}

const MORSE_LESSONS: MorseLesson[] = [
  {
    id: 'lesson1',
    title: 'Lesson 1: E, T, A, N',
    description: 'Start with the simplest and most common letters: E (.), T (-), A (.-), and N (-.)',
    characters: ['E', 'T', 'A', 'N'],
    level: 'beginner'
  },
  {
    id: 'lesson2',
    title: 'Lesson 2: I, M, S, O',
    description: 'Learn the next set of common letters: I (..), M (--), S (...), and O (---)',
    characters: ['I', 'M', 'S', 'O'],
    level: 'beginner'
  },
  {
    id: 'lesson3',
    title: 'Lesson 3: R, D, U, K',
    description: 'Practice with R (.-.), D (-..), U (..-), and K (-.-)',
    characters: ['R', 'D', 'U', 'K'],
    level: 'beginner'
  },
  {
    id: 'lesson4',
    title: 'Lesson 4: G, W, H, V',
    description: 'Continue with G (--.), W (.--), H (....), and V (...-)',
    characters: ['G', 'W', 'H', 'V'],
    level: 'intermediate'
  },
  {
    id: 'lesson5',
    title: 'Lesson 5: F, L, P, J',
    description: 'Learn F (..-.), L (.-..), P (.--.), and J (.---)',
    characters: ['F', 'L', 'P', 'J'],
    level: 'intermediate'
  },
  {
    id: 'lesson6',
    title: 'Lesson 6: B, X, C, Y',
    description: 'Practice B (-...), X (-..-), C (-.-.), and Y (-.--)',
    characters: ['B', 'X', 'C', 'Y'],
    level: 'intermediate'
  },
  {
    id: 'lesson7',
    title: 'Lesson 7: Z, Q',
    description: 'Finish the alphabet with Z (--..) and Q (--.-)',
    characters: ['Z', 'Q'],
    level: 'advanced'
  },
  {
    id: 'lesson8',
    title: 'Lesson 8: Numbers 0-9',
    description: 'Learn the numbers 0 through 9 in Morse code',
    characters: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    level: 'advanced'
  },
  {
    id: 'lesson9',
    title: 'Lesson 9: Common Punctuation',
    description: 'Practice punctuation: period, comma, question mark, and slash',
    characters: ['.', ',', '?', '/'],
    level: 'advanced'
  },
  {
    id: 'lesson10',
    title: 'Lesson 10: Common Words',
    description: 'Practice some common words used in ham radio',
    characters: [],
    words: ['CQ', 'DE', 'DX', 'RST', '73', 'QTH', 'OM', 'QSO', 'QSL', 'QRM'],
    level: 'advanced'
  }
];

// Common words for practice
const COMMON_WORDS = [
  'CQ', 'DE', 'DX', 'ANT', 'RIG', 'PWR', 'WX', 'NAME',
  'QTH', 'RST', 'QSL', 'QSO', 'QRM', 'QRN', 'QRP', 'QRZ',
  'QSY', 'LOG', 'HF', 'VHF', 'UHF', 'HAM', 'NET', '73'
];

// Ham radio alphabet words (used for phonetics)
const PHONETIC_ALPHABET = [
  'ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO',
  'FOXTROT', 'GOLF', 'HOTEL', 'INDIA', 'JULIETT',
  'KILO', 'LIMA', 'MIKE', 'NOVEMBER', 'OSCAR',
  'PAPA', 'QUEBEC', 'ROMEO', 'SIERRA', 'TANGO',
  'UNIFORM', 'VICTOR', 'WHISKEY', 'XRAY', 'YANKEE', 'ZULU'
];

export default function EnhancedMorseCodeGame() {
  // Audio context
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Game settings
  const [wpm, setWpm] = useState<number>(10);
  const [frequency, setFrequency] = useState<number>(600);
  const [volume, setVolume] = useState<number>(0.5);
  const [activeTab, setActiveTab] = useState<string>('learn');
  const [activeLesson, setActiveLesson] = useState<MorseLesson>(MORSE_LESSONS[0]);
  
  // Game state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [results, setResults] = useState<Array<{ expected: string; actual: string; correct: boolean }>>([]);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  
  // Mode-specific state
  const [practiceMode, setPracticeMode] = useState<'characters' | 'words' | 'sentences'>('characters');
  const [customText, setCustomText] = useState<string>('');
  const [displayedMorse, setDisplayedMorse] = useState<string>('');
  
  // Learning progress hook
  const { recordMorsePractice } = useLearningProgress();
  
  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = volume;
    }
    
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    };
  }, []);
  
  // Update gain when volume changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);
  
  // Play a dot (short beep)
  const playDot = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const dot_duration = 1.2 / wpm; // Seconds
    
    oscillatorRef.current = audioContextRef.current.createOscillator();
    oscillatorRef.current.frequency.value = frequency;
    oscillatorRef.current.connect(gainNodeRef.current!);
    oscillatorRef.current.start();
    
    setTimeout(() => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    }, dot_duration * 1000);
    
    return dot_duration;
  }, [wpm, frequency]);
  
  // Play a dash (long beep)
  const playDash = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const dot_duration = 1.2 / wpm; // Seconds
    const dash_duration = dot_duration * 3;
    
    oscillatorRef.current = audioContextRef.current.createOscillator();
    oscillatorRef.current.frequency.value = frequency;
    oscillatorRef.current.connect(gainNodeRef.current!);
    oscillatorRef.current.start();
    
    setTimeout(() => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    }, dash_duration * 1000);
    
    return dash_duration;
  }, [wpm, frequency]);
  
  // Play a character's morse code
  const playCharacter = useCallback((char: string) => {
    if (!audioContextRef.current) return;
    
    const morseCode = MORSE_CODE[char.toUpperCase()] || '';
    const dot_duration = 1.2 / wpm; // Seconds
    
    let delay = 0;
    
    for (let i = 0; i < morseCode.length; i++) {
      const symbol = morseCode[i];
      
      setTimeout(() => {
        if (symbol === '.') {
          playDot();
        } else if (symbol === '-') {
          playDash();
        }
        // Space or slash don't make sound
      }, delay * 1000);
      
      if (symbol === '.') {
        delay += dot_duration;
      } else if (symbol === '-') {
        delay += dot_duration * 3;
      } else if (symbol === ' ') {
        delay += dot_duration * 3; // Space between words is 7 units, but we already have 3 from the letter spacing
      }
      
      // Add spacing between symbols within a character
      if (i < morseCode.length - 1 && morseCode[i] !== ' ' && morseCode[i+1] !== ' ') {
        delay += dot_duration;
      }
    }
    
    // Return total duration
    return delay;
  }, [wpm, playDot, playDash]);
  
  // Play a word or phrase
  const playText = useCallback((text: string) => {
    if (!audioContextRef.current || !text) return;
    
    const dot_duration = 1.2 / wpm; // Seconds
    let delay = 0;
    
    const chars = text.toUpperCase().split('');
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      
      // Play this character after the appropriate delay
      setTimeout(() => {
        if (char === ' ') return; // Skip spaces, they're handled by the delay
        const charDuration = playCharacter(char);
      }, delay * 1000);
      
      // If this is a space, add word spacing (7 dots)
      if (char === ' ') {
        delay += dot_duration * 7;
      } else {
        // Add character time
        const morseCode = MORSE_CODE[char.toUpperCase()] || '';
        let charDuration = 0;
        
        for (let j = 0; j < morseCode.length; j++) {
          if (morseCode[j] === '.') charDuration += dot_duration;
          else if (morseCode[j] === '-') charDuration += dot_duration * 3;
          
          // Add symbol spacing
          if (j < morseCode.length - 1) charDuration += dot_duration;
        }
        
        delay += charDuration;
        
        // Add letter spacing if not the last character and not followed by a space
        if (i < chars.length - 1 && chars[i+1] !== ' ') {
          delay += dot_duration * 3;
        }
      }
    }
    
    // Signal when playback is complete
    setTimeout(() => {
      setIsPlaying(false);
    }, delay * 1000);
    
  }, [wpm, playCharacter]);
  
  // Initialize or change lesson
  useEffect(() => {
    if (activeTab === 'learn') {
      const characters = [...activeLesson.characters];
      setCurrentText(characters.length > 0 ? characters[Math.floor(Math.random() * characters.length)] : '');
    }
  }, [activeLesson, activeTab]);
  
  // Handle practice mode generation
  const generatePracticeText = useCallback(() => {
    let text = '';
    
    if (practiceMode === 'characters') {
      // Generate a random sequence of 5 characters
      const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?/=@';
      for (let i = 0; i < 5; i++) {
        text += allChars.charAt(Math.floor(Math.random() * allChars.length));
      }
    } else if (practiceMode === 'words') {
      // Use a random ham radio word
      const usePhoneticsChance = Math.random() > 0.7; // 30% chance of phonetic alphabet
      if (usePhoneticsChance) {
        text = PHONETIC_ALPHABET[Math.floor(Math.random() * PHONETIC_ALPHABET.length)];
      } else {
        text = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
      }
    } else if (practiceMode === 'sentences') {
      // Generate a short ham radio phrase
      const callsigns = ['VE7ABC', 'KL7XYZ', 'W1AW', 'G4ABC', 'JA3XYZ'];
      const prefixes = ['CQ', 'CQ DX', 'DE', 'QRZ'];
      const suffixes = ['K', 'AR', 'SK', 'BK', '73'];
      
      text = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${callsigns[Math.floor(Math.random() * callsigns.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    }
    
    setCurrentText(text);
    setUserInput('');
    setShowAnswer(false);
    
    return text;
  }, [practiceMode]);
  
  // Play current text
  const handlePlay = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    // Generate morse code display
    let morseDisplay = '';
    for (const char of currentText.toUpperCase()) {
      if (char === ' ') {
        morseDisplay += ' / ';
      } else {
        morseDisplay += (MORSE_CODE[char] || '?') + ' ';
      }
    }
    setDisplayedMorse(morseDisplay.trim());
    
    // Play the text
    playText(currentText);
  }, [currentText, isPlaying, playText]);
  
  // Check answer
  const checkAnswer = useCallback(() => {
    const expected = currentText.toUpperCase();
    const actual = userInput.toUpperCase();
    
    // Calculate accuracy
    let correct = 0;
    let total = expected.length;
    
    // Exact match gets all points
    if (actual === expected) {
      correct = total;
    } else {
      // Otherwise, count character by character
      for (let i = 0; i < Math.min(expected.length, actual.length); i++) {
        if (expected[i] === actual[i]) {
          correct++;
        }
      }
    }
    
    // Add to results
    setResults(prev => [...prev, { expected, actual, correct: expected === actual }]);
    
    // Update score
    setScore(prev => ({
      correct: prev.correct + correct,
      total: prev.total + total
    }));
    
    // Show answer
    setShowAnswer(true);
    
    // If we have 10 or more results, end the game
    if (results.length >= 9) {
      setGameComplete(true);
      
      // Record the progress
      const accuracy = score.total > 0 ? (score.correct / score.total) * 100 : 0;
      recordMorsePractice(wpm, accuracy, true);
    }
  }, [currentText, userInput, results, score, recordMorsePractice, wpm]);
  
  // Handle next item
  const handleNext = useCallback(() => {
    if (activeTab === 'learn') {
      // Get a random character from the lesson
      const characters = [...activeLesson.characters];
      if (activeLesson.words) {
        characters.push(...activeLesson.words);
      }
      setCurrentText(characters[Math.floor(Math.random() * characters.length)]);
    } else if (activeTab === 'practice') {
      generatePracticeText();
    } else if (activeTab === 'custom') {
      // Do nothing, keep the custom text
    }
    
    setUserInput('');
    setShowAnswer(false);
  }, [activeTab, activeLesson, generatePracticeText]);
  
  // Start a new game
  const handleNewGame = useCallback(() => {
    setResults([]);
    setScore({ correct: 0, total: 0 });
    setGameComplete(false);
    handleNext();
  }, [handleNext]);
  
  // Format the morse code to look nice
  const formatMorseCode = (text: string): string => {
    let result = '';
    for (const char of text.toUpperCase()) {
      if (char === ' ') {
        result += '/ ';
      } else {
        result += (MORSE_CODE[char] || '?') + ' ';
      }
    }
    return result.trim();
  };
  
  return (
    <div className="space-y-4">
      {/* Header with title and controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Radio className="h-5 w-5 text-green-400" />
          Morse Code Training
        </h2>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">WPM:</span>
            <Select 
              value={wpm.toString()} 
              onValueChange={(value) => setWpm(parseInt(value))}
            >
              <SelectTrigger className="h-7 w-16 text-xs bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="30">30</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1">
            <Volume2 className="h-3 w-3 text-gray-400" />
            <Slider
              value={[volume * 100]}
              onValueChange={(value) => setVolume(value[0] / 100)}
              className="w-14 h-4"
              max={100}
              step={5}
            />
          </div>
        </div>
      </div>
      
      {/* Mode tabs */}
      <Tabs
        defaultValue="learn"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="learn" className="text-sm">Learn</TabsTrigger>
          <TabsTrigger value="practice" className="text-sm">Practice</TabsTrigger>
          <TabsTrigger value="custom" className="text-sm">Custom</TabsTrigger>
        </TabsList>
        
        {/* Learn tab */}
        <TabsContent value="learn" className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-2">
            {MORSE_LESSONS.map((lesson, index) => (
              <button
                key={lesson.id}
                className={`p-2 rounded-md text-left text-xs ${
                  activeLesson.id === lesson.id 
                    ? 'bg-blue-900 text-blue-100 border border-blue-700' 
                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                }`}
                onClick={() => setActiveLesson(lesson)}
              >
                <div className="font-medium">{lesson.title}</div>
                <div className="text-[10px] mt-1 opacity-80">
                  {lesson.characters.length > 0 
                    ? lesson.characters.join(' ') 
                    : lesson.words?.join(' ')}
                </div>
                <Badge
                  variant="outline"
                  className={`mt-2 text-[9px] ${
                    lesson.level === 'beginner' 
                      ? 'border-green-700 text-green-400' 
                      : lesson.level === 'intermediate'
                      ? 'border-amber-700 text-amber-400'
                      : 'border-red-700 text-red-400'
                  }`}
                >
                  {lesson.level}
                </Badge>
              </button>
            ))}
          </div>
          
          {/* Current lesson practice */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-200">
                {activeLesson.title}
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                {activeLesson.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!gameComplete ? (
                <div className="space-y-4">
                  <div className="bg-gray-800 p-4 rounded-md flex flex-col items-center justify-center">
                    <div className="text-4xl font-mono font-bold text-white mb-4">
                      {showAnswer ? currentText : '?'}
                    </div>
                    <div className="text-sm font-mono text-gray-300">
                      {showAnswer ? formatMorseCode(currentText) : ''}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handlePlay}
                      className="bg-blue-800 hover:bg-blue-700 flex-1"
                      disabled={isPlaying || !currentText}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Play Sound
                    </Button>
                    
                    <Button
                      onClick={() => setShowAnswer(true)}
                      className="bg-gray-800 hover:bg-gray-700"
                      disabled={showAnswer}
                    >
                      Show
                    </Button>
                    
                    <Button
                      onClick={handleNext}
                      className="bg-blue-800 hover:bg-blue-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-900 bg-opacity-30 p-4 rounded-md border border-green-800 text-center">
                    <div className="text-xl font-bold text-green-400 mb-1">Lesson Complete!</div>
                    <p className="text-sm text-green-300">
                      You've completed the lesson. Move on to the next one or practice more.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        const currentIndex = MORSE_LESSONS.findIndex(l => l.id === activeLesson.id);
                        if (currentIndex < MORSE_LESSONS.length - 1) {
                          setActiveLesson(MORSE_LESSONS[currentIndex + 1]);
                        }
                        setGameComplete(false);
                      }}
                      className="bg-blue-800 hover:bg-blue-700 flex-1"
                      disabled={MORSE_LESSONS.findIndex(l => l.id === activeLesson.id) === MORSE_LESSONS.length - 1}
                    >
                      Next Lesson
                    </Button>
                    
                    <Button
                      onClick={() => setGameComplete(false)}
                      className="bg-gray-800 hover:bg-gray-700"
                    >
                      Practice More
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Reference section */}
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
              Morse Code Reference
            </h3>
            <div className="grid grid-cols-9 gap-x-1 gap-y-2 text-xs">
              {Object.entries(MORSE_CODE)
                .filter(([char]) => char !== ' ')
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([char, code]) => (
                  <div key={char} className="flex items-center p-1 bg-gray-900 rounded border border-gray-700">
                    <div className="font-mono font-bold w-5 text-center">{char}</div>
                    <div className="font-mono ml-1 text-gray-400">{code}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </TabsContent>
        
        {/* Practice tab */}
        <TabsContent value="practice" className="space-y-4 mt-4">
          <div className="flex gap-2 bg-gray-800 p-2 rounded-md">
            <Button
              variant={practiceMode === 'characters' ? 'default' : 'outline'}
              onClick={() => setPracticeMode('characters')}
              className={practiceMode === 'characters' 
                ? 'bg-blue-800 hover:bg-blue-700' 
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}
              size="sm"
            >
              Characters
            </Button>
            <Button
              variant={practiceMode === 'words' ? 'default' : 'outline'}
              onClick={() => setPracticeMode('words')}
              className={practiceMode === 'words' 
                ? 'bg-blue-800 hover:bg-blue-700' 
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}
              size="sm"
            >
              Words
            </Button>
            <Button
              variant={practiceMode === 'sentences' ? 'default' : 'outline'}
              onClick={() => setPracticeMode('sentences')}
              className={practiceMode === 'sentences' 
                ? 'bg-blue-800 hover:bg-blue-700' 
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}
              size="sm"
            >
              Sentences
            </Button>
          </div>
          
          {!gameComplete ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-gray-300">
                    {results.length + 1}/10
                  </div>
                  <div className="text-sm font-medium text-gray-300">
                    {score.total > 0 ? `${Math.round((score.correct / score.total) * 100)}%` : '100%'}
                  </div>
                </div>
                
                <Progress
                  value={(results.length / 10) * 100}
                  className="h-1"
                />
                
                {isPlaying && (
                  <div className="flex justify-center text-center mt-4">
                    <div className="bg-gray-800 p-3 rounded-md">
                      <div className="text-sm text-gray-300 mb-2">Listening...</div>
                      <div className="animate-pulse">
                        <Radio className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="font-mono text-xs text-gray-400 mt-2">
                        {showAnswer ? displayedMorse : ''}
                      </div>
                    </div>
                  </div>
                )}
                
                {!isPlaying && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePlay}
                        className="bg-green-800 hover:bg-green-700 flex-1"
                      >
                        <Volume2 className="h-4 w-4 mr-2" />
                        Play Code
                      </Button>
                      
                      <Button
                        onClick={() => setShowAnswer(true)}
                        className="bg-gray-800 hover:bg-gray-700"
                        disabled={showAnswer}
                      >
                        Show Answer
                      </Button>
                    </div>
                    
                    {showAnswer && (
                      <Alert className="bg-blue-900 bg-opacity-30 border-blue-800">
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-lg text-white">{currentText}</div>
                          <div className="font-mono text-sm text-gray-400">{displayedMorse}</div>
                        </div>
                      </Alert>
                    )}
                    
                    {!showAnswer && (
                      <div className="space-y-2">
                        <Input
                          placeholder="Type what you hear..."
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={checkAnswer}
                            className="bg-blue-800 hover:bg-blue-700 flex-1"
                            disabled={!userInput}
                          >
                            Check Answer
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {showAnswer && (
                      <div className="flex justify-center">
                        <Button
                          onClick={handleNext}
                          className="bg-blue-800 hover:bg-blue-700"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-100">Practice Complete!</CardTitle>
                <CardDescription>
                  You've completed the practice session with a score of {Math.round((score.correct / score.total) * 100)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm font-medium text-gray-300">Accuracy</div>
                    <div className="text-sm font-medium text-gray-300">
                      {score.correct}/{score.total} characters
                    </div>
                  </div>
                  <Progress
                    value={(score.correct / score.total) * 100}
                    className="h-2"
                  />
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Results:</h4>
                    {results.map((result, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2 rounded-md text-xs flex justify-between items-center ${
                          result.correct ? 'bg-green-900 bg-opacity-20' : 'bg-red-900 bg-opacity-20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {result.correct ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <span className="font-mono">{result.expected}</span>
                            {!result.correct && (
                              <span className="text-gray-400 ml-2">
                                You entered: <span className="font-mono">{result.actual}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={handleNewGame}
                  className="w-full bg-blue-800 hover:bg-blue-700"
                >
                  New Practice Session
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Custom tab */}
        <TabsContent value="custom" className="space-y-4 mt-4">
          <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
            <h3 className="text-sm font-medium text-gray-200 mb-2">
              Custom Morse Code Text
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Enter text you'd like to practice with. The morse code audio will be played when you click "Play Morse".
            </p>
            
            <Textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter text here..."
              className="bg-gray-900 border-gray-700 text-white mb-4"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setCurrentText(customText);
                  setIsPlaying(true);
                  
                  // Generate morse code display
                  let morseDisplay = '';
                  for (const char of customText.toUpperCase()) {
                    if (char === ' ') {
                      morseDisplay += ' / ';
                    } else {
                      morseDisplay += (MORSE_CODE[char] || '?') + ' ';
                    }
                  }
                  setDisplayedMorse(morseDisplay.trim());
                  
                  // Play the text
                  playText(customText);
                }}
                className="bg-blue-800 hover:bg-blue-700 flex-1"
                disabled={!customText || isPlaying}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Play Morse
              </Button>
            </div>
          </div>
          
          {isPlaying && (
            <div className="bg-gray-900 p-4 rounded-md border border-gray-700 flex flex-col items-center">
              <div className="text-sm text-gray-300 mb-2">Playing...</div>
              <div className="animate-pulse mb-3">
                <Radio className="h-10 w-10 text-green-500" />
              </div>
              <div className="font-mono text-xs text-gray-400 text-center">
                {displayedMorse}
              </div>
            </div>
          )}
          
          <div className="bg-blue-900 bg-opacity-20 p-3 rounded-md border border-blue-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-300 mb-1">Tips for Learning Morse Code</h4>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>• Focus on the rhythm and sound patterns, not counting dots and dashes</li>
                  <li>• Practice regularly for short periods rather than long sessions</li>
                  <li>• Start slow and gradually increase your speed</li>
                  <li>• Learn to recognize entire words or common phrases</li>
                  <li>• Use headphones to block out distractions</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
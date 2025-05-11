import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  VolumeX, 
  Volume2,
  Wand2,
  RefreshCw,
  Play,
  Pause,
  Timer,
  ArrowUp,
  AlertTriangle,
  BarChart2,
  Award,
  Headphones,
  BookOpen 
} from 'lucide-react';
import { useLearningProgress } from '@/hooks/use-learning-progress';

interface MorseCodeChar {
  char: string;
  code: string;
}

// Morse code mappings
const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '/': '-..-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '"': '.-..-.', '@': '.--.-.'
};

// Get the morse code for a character, or return empty string if not found
const getMorseCode = (char: string): string => {
  return MORSE_CODE[char.toUpperCase()] || '';
};

// Get the character for a morse code, or return empty string if not found
const getCharFromMorse = (morse: string): string => {
  for (const [char, code] of Object.entries(MORSE_CODE)) {
    if (code === morse) {
      return char;
    }
  }
  return '';
};

// Difficulty levels with WPM and character sets
const DIFFICULTY_LEVELS = [
  { 
    name: 'Beginner',
    wpm: 5,
    chars: 'ETANIM'.split(''),
    description: 'Learn the most common letters at a slow pace'
  },
  { 
    name: 'Basic',
    wpm: 8,
    chars: 'ETANIMSORKDLUGWH'.split(''),
    description: 'Common letters at a moderate pace'
  },
  { 
    name: 'Intermediate',
    wpm: 12,
    chars: 'ETANIMSORKDLUGWHVFJPBXCYZQ'.split(''),
    description: 'All letters at a faster pace'
  },
  { 
    name: 'Advanced',
    wpm: 15,
    chars: 'ETANIMSORKDLUGWHVFJPBXCYZQ1234567890'.split(''),
    description: 'Letters and numbers at a fast pace'
  },
  { 
    name: 'Expert',
    wpm: 20,
    chars: 'ETANIMSORKDLUGWHVFJPBXCYZQ1234567890.,?/=+"@'.split(''),
    description: 'All characters at high speed'
  }
];

// Real-world scenarios for practice
const PRACTICE_SCENARIOS = [
  {
    name: 'CQ Call',
    text: 'CQ CQ CQ DE VE7XXX VE7XXX K',
    description: 'Standard CQ call'
  },
  {
    name: 'Signal Report',
    text: 'UR RST 599 5NN',
    description: 'Giving a signal report'
  },
  {
    name: 'Weather Report',
    text: 'WX SUNNY TEMP 22C WIND LIGHT',
    description: 'Basic weather information'
  },
  {
    name: 'QSO Info',
    text: 'NAME IS JOHN QTH POWELL RIVER RIG FT-450 ANT DIPOLE',
    description: 'Basic QSO information exchange'
  },
  {
    name: 'Emergency',
    text: 'EMERGENCY NEED HELP AT 49.8N 124.5W MEDICAL',
    description: 'Emergency call for help'
  }
];

interface EnhancedMorseCodeGameProps {
  onProgressUpdate?: (wpm: number, accuracy: number, completed: boolean) => void;
}

export default function EnhancedMorseCodeGame({ onProgressUpdate }: EnhancedMorseCodeGameProps) {
  // User settings
  const [wpm, setWpm] = useState<number>(10);
  const [volume, setVolume] = useState<number>(50);
  const [showVisualDots, setShowVisualDots] = useState<boolean>(true);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [gameMode, setGameMode] = useState<'learn' | 'decode' | 'type' | 'scenario'>('learn');
  const [customText, setCustomText] = useState<string>('');
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  
  // Game state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<{char: string, correct: boolean}[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [charactersTyped, setCharactersTyped] = useState<number>(0);
  const [errorsCount, setErrorsCount] = useState<number>(0);
  const [currentWpm, setCurrentWpm] = useState<number>(0);
  const [currentAccuracy, setCurrentAccuracy] = useState<number>(100);
  
  // Audio context
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Progress tracking
  const { recordMorseProgress } = useLearningProgress();
  
  // Load audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // Update WPM based on difficulty level
  useEffect(() => {
    if (difficultyLevel >= 0 && difficultyLevel < DIFFICULTY_LEVELS.length) {
      setWpm(DIFFICULTY_LEVELS[difficultyLevel].wpm);
    }
  }, [difficultyLevel]);
  
  // Generate random text based on current difficulty level
  const generateRandomText = (length: number = 10) => {
    let text = '';
    const availableChars = DIFFICULTY_LEVELS[difficultyLevel].chars;
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * availableChars.length);
      text += availableChars[randomIndex];
    }
    
    return text;
  };
  
  // Initialize game with random text
  const initializeGame = () => {
    switch (gameMode) {
      case 'learn':
        // For learning mode, generate a short string of random characters
        setCurrentText(generateRandomText(5));
        break;
      case 'decode':
        // For decode mode, generate a medium-length string
        setCurrentText(generateRandomText(8));
        break;
      case 'type':
        // For type mode, generate a longer string
        setCurrentText(generateRandomText(15));
        break;
      case 'scenario':
        // For scenario mode, use the selected scenario
        setCurrentText(PRACTICE_SCENARIOS[scenarioIndex].text);
        break;
    }
    
    setCurrentCharIndex(0);
    setUserInput('');
    setFeedback([]);
    setScore(0);
    setStartTime(null);
    setEndTime(null);
    setCharactersTyped(0);
    setErrorsCount(0);
    setCurrentWpm(0);
    setCurrentAccuracy(100);
  };
  
  // Initialize the game when component mounts or difficulty/mode changes
  useEffect(() => {
    initializeGame();
  }, [difficultyLevel, gameMode, scenarioIndex]);
  
  // Play a single dot or dash
  const playSound = (isDot: boolean, duration: number) => {
    if (!audioContextRef.current) return;
    
    // Calculate timing based on the formula: 
    // 1 unit (dot) = 60 / (50 * WPM) seconds
    // E.g. at 10 WPM, one dot is 60 / (50 * 10) = 0.12 seconds
    const dotDuration = 60 / (50 * wpm);
    const dashDuration = 3 * dotDuration;
    const actualDuration = isDot ? dotDuration : dashDuration;
    
    // Create oscillator and gain node
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 700; // 700 Hz is common for Morse code
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    // Set volume (0 to 1)
    gainNode.gain.value = volume / 100;
    
    // Store for cleanup
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    
    // Start the sound
    oscillator.start();
    
    // Stop after duration
    setTimeout(() => {
      oscillator.stop();
      oscillator.disconnect();
    }, actualDuration * 1000);
  };
  
  // Play a morse code character
  const playMorseChar = (morseCode: string) => {
    if (!audioContextRef.current) return;
    
    // Calculate timing
    const dotDuration = 60 / (50 * wpm);
    const dashDuration = 3 * dotDuration;
    const intraCharGap = dotDuration; // Gap between dots/dashes within a character
    
    let delay = 0;
    
    // Play each symbol with appropriate timing
    morseCode.split('').forEach((symbol, index) => {
      setTimeout(() => {
        if (symbol === '.') {
          playSound(true, dotDuration);
        } else if (symbol === '-') {
          playSound(false, dashDuration);
        }
      }, delay * 1000);
      
      delay += symbol === '.' ? dotDuration : dashDuration;
      
      // Add gap between symbols (except for the last one)
      if (index < morseCode.length - 1) {
        delay += intraCharGap;
      }
    });
    
    return delay;
  };
  
  // Play the current character
  const playCurrentChar = () => {
    if (currentCharIndex >= currentText.length) return 0;
    
    const char = currentText[currentCharIndex];
    const morseCode = getMorseCode(char);
    
    return playMorseChar(morseCode);
  };
  
  // Start playing the morse code
  const startPlaying = () => {
    setIsPlaying(true);
    setStartTime(Date.now());
    
    // Play sequence based on game mode
    if (gameMode === 'learn' || gameMode === 'decode') {
      playSequence();
    }
  };
  
  // Pause playing
  const pausePlaying = () => {
    setIsPlaying(false);
    
    // Stop any active sound
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
    }
  };
  
  // Play the complete sequence automatically
  const playSequence = () => {
    if (!isPlaying) return;
    
    // Reset to beginning if we're at the end
    if (currentCharIndex >= currentText.length) {
      setCurrentCharIndex(0);
      setTimeout(playSequence, 1000); // Wait a bit before restarting
      return;
    }
    
    // Calculate timing
    const dotDuration = 60 / (50 * wpm);
    const charGap = 3 * dotDuration; // Gap between characters (3 units)
    
    // Play current character and get its duration
    const charDuration = playCurrentChar();
    
    // Move to next character after current finishes playing plus character gap
    setTimeout(() => {
      setCurrentCharIndex(prev => prev + 1);
      
      // Continue with next character
      setTimeout(playSequence, charGap * 1000);
    }, charDuration * 1000);
  };
  
  // Handle key press in typing mode
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isPlaying || gameMode !== 'type') return;
    
    // Start timing when first character is typed
    if (startTime === null) {
      setStartTime(Date.now());
    }
    
    if (e.key === 'Enter') {
      checkAllInput();
      return;
    }
    
    // Only process alphanumeric keys and spaces
    if (e.key.length !== 1) return;
    
    setCharactersTyped(prev => prev + 1);
    
    // Check if typed character matches current expected character
    const expectedChar = currentText[userInput.length]?.toUpperCase();
    const typedChar = e.key.toUpperCase();
    
    const isCorrect = typedChar === expectedChar;
    
    if (!isCorrect) {
      setErrorsCount(prev => prev + 1);
    }
    
    // Add to feedback
    setFeedback(prev => [
      ...prev,
      { char: typedChar, correct: isCorrect }
    ]);
    
    // Update score and progress
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Calculate current WPM and accuracy
    const elapsedMinutes = (Date.now() - (startTime || Date.now())) / 60000;
    const rawWPM = charactersTyped / 5 / Math.max(0.01, elapsedMinutes);
    const accuracy = Math.max(0, 100 - (errorsCount / Math.max(1, charactersTyped) * 100));
    
    setCurrentWpm(Math.round(rawWPM));
    setCurrentAccuracy(Math.round(accuracy));
    
    // Check if complete
    if (userInput.length + 1 >= currentText.length) {
      setEndTime(Date.now());
      setIsPlaying(false);
      
      // Report progress
      if (onProgressUpdate) {
        onProgressUpdate(currentWpm, currentAccuracy, true);
      }
      
      // Record progress in learning system
      recordMorseProgress(currentWpm, currentAccuracy, true);
    }
  };
  
  // Check the entire input against expected text
  const checkAllInput = () => {
    if (!isPlaying || gameMode !== 'decode') return;
    
    setEndTime(Date.now());
    setIsPlaying(false);
    
    // Compare each character
    const input = userInput.toUpperCase();
    const expected = currentText.toUpperCase();
    const maxLength = Math.max(input.length, expected.length);
    
    let correctCount = 0;
    let errors = 0;
    const newFeedback = [];
    
    for (let i = 0; i < maxLength; i++) {
      const inputChar = i < input.length ? input[i] : '';
      const expectedChar = i < expected.length ? expected[i] : '';
      
      const isCorrect = inputChar === expectedChar;
      
      if (isCorrect) {
        correctCount++;
      } else {
        errors++;
      }
      
      newFeedback.push({
        char: inputChar || ' ',
        correct: isCorrect
      });
    }
    
    setFeedback(newFeedback);
    setScore(correctCount);
    setErrorsCount(errors);
    
    // Calculate accuracy
    const accuracy = Math.max(0, 100 - (errors / Math.max(1, maxLength) * 100));
    setCurrentAccuracy(Math.round(accuracy));
    
    // Calculate WPM (if we have timing)
    if (startTime && endTime) {
      const elapsedMinutes = (endTime - startTime) / 60000;
      const rawWPM = maxLength / 5 / Math.max(0.01, elapsedMinutes);
      setCurrentWpm(Math.round(rawWPM));
    }
    
    // Report progress
    if (onProgressUpdate) {
      onProgressUpdate(currentWpm, currentAccuracy, true);
    }
    
    // Record progress in learning system
    recordMorseProgress(currentWpm, currentAccuracy, true);
  };
  
  // Get the appropriate title based on game mode
  const getModeTitle = () => {
    switch (gameMode) {
      case 'learn':
        return 'Learning Mode';
      case 'decode':
        return 'Decode Mode';
      case 'type':
        return 'Typing Practice';
      case 'scenario':
        return `Scenario: ${PRACTICE_SCENARIOS[scenarioIndex].name}`;
    }
  };
  
  // Render the dots and dashes visualizer
  const renderMorseVisualizer = () => {
    if (!showVisualDots || !isPlaying) return null;
    
    const currentChar = currentText[currentCharIndex];
    if (!currentChar) return null;
    
    const morseCode = getMorseCode(currentChar);
    
    return (
      <div className="flex items-center justify-center gap-1 my-2">
        {morseCode.split('').map((symbol, index) => (
          <div 
            key={index}
            className={`${symbol === '.' ? 'w-2 h-2 rounded-full' : 'w-6 h-2 rounded-md'} bg-blue-500`}
          />
        ))}
      </div>
    );
  };
  
  // Format timer display
  const formatTimer = () => {
    if (!startTime) return '00:00';
    
    const elapsed = (endTime ?? Date.now()) - startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = (seconds % 60).toString().padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
  };
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="game" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="game">Game</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="game" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{getModeTitle()}</CardTitle>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-mono text-gray-300">{formatTimer()}</span>
                </div>
              </div>
              <CardDescription>
                {gameMode === 'learn' && 'Listen to Morse code characters and learn their sounds'}
                {gameMode === 'decode' && 'Listen to Morse code and decode it to text'}
                {gameMode === 'type' && 'Type the text as quickly and accurately as possible'}
                {gameMode === 'scenario' && PRACTICE_SCENARIOS[scenarioIndex].description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Current character display - shown in learn mode */}
              {gameMode === 'learn' && (
                <div className="bg-gray-800 p-4 rounded-md text-center">
                  <div className="text-4xl font-mono font-bold text-blue-300 mb-2">
                    {currentText[currentCharIndex] || 'Done!'}
                  </div>
                  <div className="text-sm font-mono text-gray-400">
                    {currentText[currentCharIndex] ? getMorseCode(currentText[currentCharIndex]) : ''}
                  </div>
                  {renderMorseVisualizer()}
                </div>
              )}
              
              {/* Text to type - shown in type mode */}
              {gameMode === 'type' && (
                <div className="bg-gray-800 p-4 rounded-md">
                  <div className="font-mono text-lg tracking-wide leading-relaxed text-gray-300 font-semibold">
                    {currentText.split('').map((char, index) => (
                      <span 
                        key={index}
                        className={`${index === userInput.length ? 'bg-blue-800 text-blue-100' : ''} ${index < userInput.length ? 'text-gray-500' : ''}`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Morse code for scenarios */}
              {gameMode === 'scenario' && (
                <div className="bg-gray-800 p-4 rounded-md">
                  <div className="font-mono text-sm text-gray-300 space-y-1">
                    {currentText.split('').map((char, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-4 text-blue-300">{char}</span>
                        <span className="text-gray-400">{getMorseCode(char)}</span>
                        {index === currentCharIndex && isPlaying && (
                          <span className="text-xs bg-blue-900 px-1 rounded text-blue-200">
                            Playing
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Input field for decode and type modes */}
              {(gameMode === 'decode' || gameMode === 'type') && (
                <div>
                  <input
                    type="text"
                    placeholder={gameMode === 'decode' ? "Type what you hear..." : "Type the text above..."}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-lg font-mono text-blue-100"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={!isPlaying}
                  />
                </div>
              )}
              
              {/* Live performance metrics */}
              {isPlaying && (gameMode === 'type' || (gameMode === 'decode' && startTime)) && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-gray-800 p-2 rounded-md">
                    <div className="text-xs text-gray-400 mb-1">Speed</div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-blue-900 text-blue-200 border-none">
                        {currentWpm} WPM
                      </Badge>
                      <BarChart2 className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="bg-gray-800 p-2 rounded-md">
                    <div className="text-xs text-gray-400 mb-1">Accuracy</div>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={`border-none ${
                          currentAccuracy > 90 
                            ? 'bg-green-900 text-green-200' 
                            : currentAccuracy > 70 
                              ? 'bg-yellow-900 text-yellow-200' 
                              : 'bg-red-900 text-red-200'
                        }`}
                      >
                        {currentAccuracy}%
                      </Badge>
                      <Progress value={currentAccuracy} className="h-1 w-20" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Results display after completion */}
              {endTime && (
                <div className="mt-3 bg-gray-800 rounded-md p-3 border border-gray-700">
                  <div className="text-sm font-semibold text-gray-200 mb-2">Results</div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-900 p-2 rounded-sm">
                      <div className="text-xs text-gray-400">Score</div>
                      <div className="font-mono text-lg text-blue-300">{score}/{currentText.length}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded-sm">
                      <div className="text-xs text-gray-400">Accuracy</div>
                      <div className="font-mono text-lg text-blue-300">{currentAccuracy}%</div>
                    </div>
                  </div>
                  
                  {gameMode === 'decode' && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Your answer:</div>
                      <div className="font-mono text-sm bg-gray-900 p-2 rounded-sm">{userInput.toUpperCase()}</div>
                      <div className="text-xs text-gray-400 mb-1 mt-2">Expected:</div>
                      <div className="font-mono text-sm bg-gray-900 p-2 rounded-sm">{currentText}</div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-blue-800 hover:bg-blue-700"
                    onClick={initializeGame}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-0">
              <div className="flex items-center justify-between w-full">
                {/* Playback controls */}
                <div>
                  {!isPlaying ? (
                    <Button 
                      onClick={startPlaying}
                      variant="outline"
                      className="bg-green-900 hover:bg-green-800 border-green-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button 
                      onClick={pausePlaying}
                      variant="outline"
                      className="bg-yellow-900 hover:bg-yellow-800 border-yellow-700"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                </div>
                
                {/* Game mode indicators */}
                <div className="flex items-center gap-1">
                  {gameMode === 'learn' && <BookOpen className="h-4 w-4 text-blue-400" />}
                  {gameMode === 'decode' && <Headphones className="h-4 w-4 text-purple-400" />}
                  {gameMode === 'type' && <ArrowUp className="h-4 w-4 text-green-400" />}
                  {gameMode === 'scenario' && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                  
                  <span className="text-xs font-mono text-gray-300">
                    {DIFFICULTY_LEVELS[difficultyLevel].name}
                  </span>
                  
                  <Badge variant="outline" className="ml-1 text-xs py-0 h-5 border-blue-900">
                    {wpm} WPM
                  </Badge>
                </div>
                
                {/* Submit button for decode mode */}
                {gameMode === 'decode' && isPlaying && (
                  <Button 
                    onClick={checkAllInput}
                    variant="outline"
                    size="sm"
                    className="bg-blue-900 hover:bg-blue-800 border-blue-700"
                  >
                    Check
                  </Button>
                )}
                
                {/* Generate new content button */}
                {!isPlaying && !endTime && (
                  <Button 
                    onClick={initializeGame}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    New
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Customize your Morse code learning experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Game mode selection */}
              <div className="space-y-1.5">
                <Label>Game Mode</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={gameMode === 'learn' ? 'default' : 'outline'}
                    onClick={() => setGameMode('learn')}
                    className={gameMode === 'learn' ? 'bg-blue-800 hover:bg-blue-700' : ''}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Learn
                  </Button>
                  <Button 
                    variant={gameMode === 'decode' ? 'default' : 'outline'}
                    onClick={() => setGameMode('decode')}
                    className={gameMode === 'decode' ? 'bg-purple-800 hover:bg-purple-700' : ''}
                  >
                    <Headphones className="h-4 w-4 mr-2" />
                    Decode
                  </Button>
                  <Button 
                    variant={gameMode === 'type' ? 'default' : 'outline'}
                    onClick={() => setGameMode('type')}
                    className={gameMode === 'type' ? 'bg-green-800 hover:bg-green-700' : ''}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Type
                  </Button>
                  <Button 
                    variant={gameMode === 'scenario' ? 'default' : 'outline'}
                    onClick={() => setGameMode('scenario')}
                    className={gameMode === 'scenario' ? 'bg-yellow-800 hover:bg-yellow-700' : ''}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Scenario
                  </Button>
                </div>
              </div>
              
              {/* Difficulty level */}
              <div className="space-y-1.5">
                <Label>Difficulty Level</Label>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTY_LEVELS.map((level, index) => (
                    <Button 
                      key={level.name}
                      variant={difficultyLevel === index ? 'default' : 'outline'}
                      onClick={() => setDifficultyLevel(index)}
                      className={`py-1 px-2 h-auto text-xs ${
                        difficultyLevel === index 
                          ? 'bg-blue-800 hover:bg-blue-700' 
                          : ''
                      }`}
                    >
                      {level.name} ({level.wpm} WPM)
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {DIFFICULTY_LEVELS[difficultyLevel].description}
                </p>
              </div>
              
              {/* Scenario selection - only shown when in scenario mode */}
              {gameMode === 'scenario' && (
                <div className="space-y-1.5">
                  <Label>Scenario</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRACTICE_SCENARIOS.map((scenario, index) => (
                      <Button 
                        key={scenario.name}
                        variant={scenarioIndex === index ? 'default' : 'outline'}
                        onClick={() => setScenarioIndex(index)}
                        className={`py-1 px-2 h-auto text-xs ${
                          scenarioIndex === index 
                            ? 'bg-yellow-800 hover:bg-yellow-700' 
                            : ''
                        }`}
                      >
                        {scenario.name}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {PRACTICE_SCENARIOS[scenarioIndex].description}
                  </p>
                </div>
              )}
              
              {/* Speed adjustment */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label>Speed: {wpm} WPM</Label>
                </div>
                <Slider 
                  defaultValue={[wpm]} 
                  min={1} 
                  max={30} 
                  step={1}
                  onValueChange={(value) => setWpm(value[0])}
                />
              </div>
              
              {/* Volume adjustment */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label>Volume: {volume}%</Label>
                  <div className="flex items-center gap-2">
                    <VolumeX className="h-4 w-4 text-gray-400" />
                    <Slider 
                      defaultValue={[volume]} 
                      min={0} 
                      max={100} 
                      step={1}
                      className="w-32"
                      onValueChange={(value) => setVolume(value[0])}
                    />
                    <Volume2 className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              {/* Visual aids toggle */}
              <div className="flex items-center justify-between">
                <Label>Show visual dots and dashes</Label>
                <Switch 
                  checked={showVisualDots} 
                  onCheckedChange={setShowVisualDots} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-300" />
                Your Progress
              </CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* WPM progress */}
              <div>
                <div className="text-sm text-gray-300 mb-1">Speed Progress</div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-2xl text-blue-300">{currentWpm} WPM</div>
                  <Badge variant="outline" className="bg-blue-900 text-blue-200 border-none">
                    {currentWpm >= 20 ? 'Expert' : 
                     currentWpm >= 15 ? 'Advanced' : 
                     currentWpm >= 10 ? 'Intermediate' : 
                     currentWpm >= 5 ? 'Basic' : 'Beginner'}
                  </Badge>
                </div>
                <Progress value={Math.min(100, currentWpm * 4)} className="mt-1" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Beginner (5)</span>
                  <span>Intermediate (10)</span>
                  <span>Expert (25)</span>
                </div>
              </div>
              
              {/* Accuracy */}
              <div className="mt-4">
                <div className="text-sm text-gray-300 mb-1">Accuracy</div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-2xl text-green-300">{currentAccuracy}%</div>
                  <Badge 
                    variant="outline" 
                    className={`border-none ${
                      currentAccuracy > 90 
                        ? 'bg-green-900 text-green-200' 
                        : currentAccuracy > 70 
                          ? 'bg-yellow-900 text-yellow-200' 
                          : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {currentAccuracy > 95 ? 'Perfect' : 
                     currentAccuracy > 90 ? 'Excellent' : 
                     currentAccuracy > 80 ? 'Good' : 
                     currentAccuracy > 70 ? 'Fair' : 'Needs Practice'}
                  </Badge>
                </div>
                <Progress 
                  value={currentAccuracy} 
                  className={`mt-1 ${
                    currentAccuracy > 90 
                      ? 'bg-green-900' 
                      : currentAccuracy > 70 
                        ? 'bg-yellow-900' 
                        : 'bg-red-900'
                  }`}
                />
              </div>
              
              {/* Characters learned */}
              <div className="mt-4">
                <div className="text-sm text-gray-300 mb-1">Character Proficiency</div>
                <div className="grid grid-cols-6 gap-1 mt-2">
                  {Object.keys(MORSE_CODE).map(char => (
                    <div 
                      key={char} 
                      className={`text-center p-1 border rounded ${
                        // In a real implementation, you would check which characters the user has mastered
                        Math.random() > 0.3 ? 'border-green-700 bg-green-900/30 text-green-300' :
                        Math.random() > 0.5 ? 'border-yellow-700 bg-yellow-900/30 text-yellow-300' :
                        'border-gray-700 bg-gray-800 text-gray-400'
                      }`}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
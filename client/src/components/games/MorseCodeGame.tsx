import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, Radio, RefreshCw, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Complete Morse code mapping required for the Canadian Morse Code exam
const MORSE_CODE: Record<string, string> = {
  // Letters
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  
  // Numbers
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  
  // Punctuation and special characters
  '.': '.-.-.-', // Period
  ',': '--..--', // Comma
  '?': '..--..', // Question mark
  "'": '.----.', // Apostrophe
  '!': '-.-.--', // Exclamation mark
  '/': '-..-.', // Slash
  '(': '-.--.', // Left parenthesis
  ')': '-.--.-', // Right parenthesis
  '&': '.-...', // Ampersand
  ':': '---...', // Colon
  ';': '-.-.-.', // Semicolon
  '=': '-...-', // Equal sign
  '+': '.-.-.', // Plus sign
  '-': '-....-', // Hyphen/minus
  '_': '..--.-', // Underscore
  '"': '.-..-.', // Quotation mark
  '$': '...-..-', // Dollar sign
  '@': '.--.-.', // At sign
  '¿': '..-.-', // Inverted question mark
  '¡': '--...-', // Inverted exclamation mark
  
  // Procedural signals and prosigns (represented as multiple characters)
  'AR': '.-.-.', // End of message
  'SK': '...-.-', // End of contact
  'BT': '-...-', // Break / new paragraph
  'KN': '-.--.', // Go only named station
  'CL': '-.-..-', // Going off the air (clear)
  'SOS': '...---...', // Distress call
};

// Common ham radio call signs, terms, and exam-relevant content
const RADIO_WORDS = [
  // Q-codes (required for exam)
  'QRL', 'QRM', 'QRN', 'QRO', 'QRP', 'QRS', 'QRT', 'QRU', 'QRV', 'QRX',
  'QRZ', 'QSB', 'QSL', 'QSO', 'QSY', 'QTH',
  
  // Common procedural terms
  'CQ', 'DE', 'K', 'R', 'SK', 'AR', 'BT', 'KN', 'CL', 'SOS', '73', '88',
  
  // Call sign formats (for practice)
  'VE7BC', 'VA3XYZ', 'VY1AAA', 'CQ DX', 'TEST',
  
  // Technical terms
  'RADIO', 'MORSE', 'CODE', 'HAM', 'SIGNAL', 'ANTENNA', 'DIPOLE', 'YAGI',
  'BEAM', 'COAX', 'FILTER', 'HF', 'VHF', 'UHF', 'DX', 'RIG', 'LINEAR',
  
  // Canadian specific
  'RAC', 'ISED', 'BASIC', 'ADVANCED', 'CW', 'EXAM', 'HONOURS',
  
  // Common abbreviations
  'ANT', 'PWR', 'RX', 'TX', 'FB', 'OM', 'YL', 'HPE', 'TNX', 'WX', 'LOG'
];

// Define special categories for Canadian exam-focused practice
type PracticeCategory = 'all' | 'letters' | 'numbers' | 'punctuation' | 'prosigns' | 'qcodes' | 'callsigns';

export default function MorseCodeGame() {
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameActive, setGameActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [highScore, setHighScore] = useState(0);
  const [practiceCategory, setPracticeCategory] = useState<PracticeCategory>('all');
  const [examModeActive, setExamModeActive] = useState(false);

  // Start new game
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setLives(3);
    setStreak(0);
    setFeedback('');
    setFeedbackType('');
    setUserInput('');
    generateNewWord();
  };

  // Generate a new word for the player to decode
  const generateNewWord = () => {
    let newWord = '';
    let possibleChars: string[] = [];
    
    // Filter characters based on practice category
    if (examModeActive) {
      switch (practiceCategory) {
        case 'letters':
          possibleChars = Object.keys(MORSE_CODE).filter(char => 
            char.length === 1 && char >= 'A' && char <= 'Z'
          );
          break;
        case 'numbers':
          possibleChars = Object.keys(MORSE_CODE).filter(char => 
            char.length === 1 && char >= '0' && char <= '9'
          );
          break;
        case 'punctuation':
          possibleChars = Object.keys(MORSE_CODE).filter(char => 
            char.length === 1 && 
            !(char >= 'A' && char <= 'Z') && 
            !(char >= '0' && char <= '9')
          );
          break;
        case 'prosigns':
          possibleChars = Object.keys(MORSE_CODE).filter(char => 
            char.length > 1 && char !== 'SOS' && !char.startsWith('Q')
          );
          break;
        case 'qcodes':
          // Get Q-codes from RADIO_WORDS
          possibleChars = RADIO_WORDS.filter(word => word.startsWith('Q'));
          break;
        case 'callsigns':
          // Get call signs from RADIO_WORDS
          possibleChars = RADIO_WORDS.filter(word => 
            (word.startsWith('V') && word.length > 2) || word === 'CQ DX'
          );
          break;
        case 'all':
        default:
          // Use all characters according to difficulty level
          if (difficulty === 'easy') {
            possibleChars = Object.keys(MORSE_CODE);
          } else if (difficulty === 'medium') {
            possibleChars = [
              ...Object.keys(MORSE_CODE).filter(char => char.length === 1),
              ...RADIO_WORDS.filter(word => word.length <= 3)
            ];
          } else {
            possibleChars = [
              ...Object.keys(MORSE_CODE),
              ...RADIO_WORDS
            ];
          }
          break;
      }
      
      // Make sure we have at least some options
      if (possibleChars.length === 0) {
        possibleChars = Object.keys(MORSE_CODE);
      }
      
      // Pick a random item from the filtered list
      newWord = possibleChars[Math.floor(Math.random() * possibleChars.length)];
    } else {
      // Regular game mode based on difficulty
      if (difficulty === 'easy') {
        // Single letters or numbers
        possibleChars = Object.keys(MORSE_CODE);
        newWord = possibleChars[Math.floor(Math.random() * possibleChars.length)];
      } else if (difficulty === 'medium') {
        // Short radio words (2-3 letters)
        const shortWords = RADIO_WORDS.filter(word => word.length <= 3);
        newWord = shortWords[Math.floor(Math.random() * shortWords.length)];
      } else {
        // Any radio word
        newWord = RADIO_WORDS[Math.floor(Math.random() * RADIO_WORDS.length)];
      }
    }
    
    setCurrentWord(newWord);
    setShowHint(false);
  };

  // Convert word to morse code
  const wordToMorse = (word: string): string => {
    return word.split('').map(char => {
      const upperChar = char.toUpperCase();
      return MORSE_CODE[upperChar] || char;
    }).join(' ');
  };

  // Handle user guess submission
  const handleSubmit = () => {
    if (!gameActive || !userInput) return;
    
    const userGuess = userInput.toUpperCase();
    const correctAnswer = currentWord.toUpperCase();
    
    if (userGuess === correctAnswer) {
      // Correct guess
      const newScore = score + (difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 3 : 5));
      setScore(newScore);
      setStreak(streak + 1);
      setFeedback('Correct! Great job!');
      setFeedbackType('success');
      
      // Update high score if needed
      if (newScore > highScore) {
        setHighScore(newScore);
      }
      
      // Give bonus if streak is good
      if ((streak + 1) % 5 === 0) {
        setLives(prev => Math.min(prev + 1, 5));
        setFeedback('Correct! +1 life for 5 in a row!');
      }
      
      // Generate new word after a slight delay
      setTimeout(() => {
        setUserInput('');
        generateNewWord();
      }, 1500);
    } else {
      // Incorrect guess
      setLives(lives - 1);
      setStreak(0);
      setFeedback(`Incorrect! The answer was ${currentWord}`);
      setFeedbackType('error');
      
      if (lives <= 1) {
        // Game over
        setGameActive(false);
        setFeedback(`Game Over! Final score: ${score}`);
      } else {
        // Continue with new word after delay
        setTimeout(() => {
          setUserInput('');
          generateNewWord();
        }, 2000);
      }
    }
  };

  // Play morse code sound with visualization
  const playMorseCode = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Slow down the speed for beginners to make it easier to learn
    const dotDuration = difficulty === 'easy' ? 180 : difficulty === 'medium' ? 140 : 100; // milliseconds
    const dashDuration = dotDuration * 3;
    const pauseBetweenElements = dotDuration;
    const pauseBetweenChars = dotDuration * 3;
    
    const morse = wordToMorse(currentWord);
    let currentTime = audioContext.currentTime;
    
    // Visual feedback elements
    const morseElement = document.getElementById('morse-playback');
    if (morseElement) {
      morseElement.innerHTML = '';
      
      // Create visual elements for each morse symbol
      morse.split('').forEach((char, index) => {
        setTimeout(() => {
          if (char === '.') {
            // Add dot with visual highlight
            const dotSpan = document.createElement('span');
            dotSpan.className = 'text-green-500 animate-pulse font-bold text-2xl';
            dotSpan.textContent = '•';
            morseElement.appendChild(dotSpan);
          } else if (char === '-') {
            // Add dash with visual highlight
            const dashSpan = document.createElement('span');
            dashSpan.className = 'text-blue-500 animate-pulse font-bold text-2xl';
            dashSpan.textContent = '—';
            morseElement.appendChild(dashSpan);
          } else if (char === ' ') {
            // Add space
            const spaceSpan = document.createElement('span');
            spaceSpan.textContent = ' ';
            spaceSpan.className = 'mx-1';
            morseElement.appendChild(spaceSpan);
          }
        }, index * dotDuration);
      });
    }
    
    // Audio playback
    morse.split('').forEach(char => {
      if (char === '.') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 700;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Apply smoother attack and release
        gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.7, currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + (dotDuration / 1000) - 0.01);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + dotDuration / 1000);
        currentTime += dotDuration / 1000;
      } else if (char === '-') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 700;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Apply smoother attack and release
        gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.7, currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + (dashDuration / 1000) - 0.01);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + dashDuration / 1000);
        currentTime += dashDuration / 1000;
      } else if (char === ' ') {
        currentTime += pauseBetweenChars / 1000;
      }
      
      // Add pause between elements
      currentTime += pauseBetweenElements / 1000;
    });
  };

  // Handle difficulty change
  const changeDifficulty = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    if (gameActive) {
      // If game is active, confirm before changing difficulty
      if (confirm('Changing difficulty will reset your current game. Continue?')) {
        setDifficulty(newDifficulty);
        startGame();
      }
    } else {
      setDifficulty(newDifficulty);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Morse Code Decoder {examModeActive && "- Canadian Exam Practice"}</h3>
          <p className="text-sm text-muted-foreground">
            {examModeActive 
              ? "Practice the actual characters needed for the Canadian Advanced Qualification" 
              : "Translate morse code into letters and words!"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={examModeActive ? "default" : "outline"}
            size="sm"
            className={examModeActive ? "bg-green-600 hover:bg-green-700" : ""}
            onClick={() => {
              if (gameActive) {
                if (confirm('Switching modes will reset your current game. Continue?')) {
                  setExamModeActive(!examModeActive);
                  startGame();
                }
              } else {
                setExamModeActive(!examModeActive);
              }
            }}
          >
            {examModeActive ? "Exam Mode Active" : "Enable Exam Mode"}
          </Button>

          {!examModeActive && (
            <div className="flex space-x-1">
              <Button 
                variant={difficulty === 'easy' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => changeDifficulty('easy')}
              >
                Easy
              </Button>
              <Button 
                variant={difficulty === 'medium' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => changeDifficulty('medium')}
              >
                Medium
              </Button>
              <Button 
                variant={difficulty === 'hard' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => changeDifficulty('hard')}
              >
                Hard
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Exam Mode Category Selector */}
      {examModeActive && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">Canadian Morse Code Exam Practice</h4>
              <p className="text-xs text-blue-600">For the Advanced Qualification (5 WPM), focus on specific character groups</p>
            </div>
            
            <div className="flex flex-wrap gap-1">
              <Button 
                variant={practiceCategory === 'all' ? 'default' : 'outline'} 
                size="sm"
                className={practiceCategory === 'all' ? 'bg-blue-700' : 'border-blue-300 text-blue-700'}
                onClick={() => setPracticeCategory('all')}
              >
                All
              </Button>
              <Button 
                variant={practiceCategory === 'letters' ? 'default' : 'outline'} 
                size="sm"
                className={practiceCategory === 'letters' ? 'bg-blue-700' : 'border-blue-300 text-blue-700'}
                onClick={() => setPracticeCategory('letters')}
              >
                Letters
              </Button>
              <Button 
                variant={practiceCategory === 'numbers' ? 'default' : 'outline'} 
                size="sm"
                className={practiceCategory === 'numbers' ? 'bg-blue-700' : 'border-blue-300 text-blue-700'}
                onClick={() => setPracticeCategory('numbers')}
              >
                Numbers
              </Button>
              <Button 
                variant={practiceCategory === 'punctuation' ? 'default' : 'outline'} 
                size="sm"
                className={practiceCategory === 'punctuation' ? 'bg-blue-700' : 'border-blue-300 text-blue-700'}
                onClick={() => setPracticeCategory('punctuation')}
              >
                Punctuation
              </Button>
              <Button 
                variant={practiceCategory === 'prosigns' ? 'default' : 'outline'} 
                size="sm"
                className={practiceCategory === 'prosigns' ? 'bg-blue-700' : 'border-blue-300 text-blue-700'}
                onClick={() => setPracticeCategory('prosigns')}
              >
                Prosigns
              </Button>
              <Button 
                variant={practiceCategory === 'qcodes' ? 'default' : 'outline'} 
                size="sm"
                className={practiceCategory === 'qcodes' ? 'bg-blue-700' : 'border-blue-300 text-blue-700'}
                onClick={() => setPracticeCategory('qcodes')}
              >
                Q-Codes
              </Button>
              <Button 
                variant={practiceCategory === 'callsigns' ? 'default' : 'outline'} 
                size="sm"
                className={practiceCategory === 'callsigns' ? 'bg-blue-700' : 'border-blue-300 text-blue-700'}
                onClick={() => setPracticeCategory('callsigns')}
              >
                Call Signs
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Game status */}
        <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between md:col-span-3 bg-white">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Radio className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center">
                <p className="font-medium">Score: {score}</p>
                <Badge variant="outline" className="ml-2">High Score: {highScore}</Badge>
              </div>
              <div className="flex mt-1">
                {Array.from({length: 3}).map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-4 h-4 rounded-full mr-1 ${index < lives ? 'bg-green-500' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={startGame} 
            className="mt-2 md:mt-0"
            disabled={gameActive && lives > 0}
          >
            {gameActive ? "Game in progress" : "Start Game"}
          </Button>
        </Card>
        
        {/* Morse code display */}
        <Card className="p-6 flex flex-col justify-center items-center col-span-1 md:col-span-2 min-h-[200px] bg-gray-50 relative overflow-hidden shadow-inner">
          {gameActive ? (
            <>
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={playMorseCode}
                  title="Play Morse Code"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setShowHint(true)}
                  title="Show Hint"
                >
                  <Lightbulb className="h-4 w-4" />
                </Button>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-mono mb-2 tracking-wider text-center">
                {wordToMorse(currentWord)}
              </h3>
              
              {/* Visual morse code playback element */}
              <div id="morse-playback" className="h-10 flex items-center justify-center my-2 font-mono"></div>
              
              <div className="flex justify-center space-x-4 mb-4">
                <button 
                  onClick={playMorseCode}
                  className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-md text-sm text-white"
                >
                  <Volume2 className="h-4 w-4" /> Play Sound
                </button>
                <button 
                  onClick={() => setShowHint(true)}
                  className="flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded-md text-sm text-white"
                >
                  <Lightbulb className="h-4 w-4" /> Show Hint
                </button>
              </div>
              
              {showHint && (
                <div className="mt-4 p-2 bg-amber-50 rounded text-amber-800 text-sm">
                  {difficulty === 'easy' ? 'Hint: It\'s a single character' : 
                   difficulty === 'medium' ? 'Hint: It\'s a short ham radio term' : 
                   'Hint: It\'s a ham radio term'}
                </div>
              )}
              
              <div className="flex flex-col mt-6 w-full max-w-sm">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Your answer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button 
                  onClick={handleSubmit} 
                  variant="default"
                  size="sm"
                  className="mt-2 px-3 w-24 mx-auto"
                >
                  Submit
                </Button>
              </div>
              
              {feedbackType && (
                <div className={`mt-4 p-2 rounded ${
                  feedbackType === 'success' ? 'bg-green-50 text-green-700' : 
                  'bg-red-50 text-red-700'
                }`}>
                  {feedback}
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <Radio className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-2">Morse Code Decoder Challenge</h3>
              <p className="text-muted-foreground mb-4">
                Decode Morse code signals into letters and words. Test your skills as a radio operator!
              </p>
              <Button onClick={startGame} size="lg">Start Game</Button>
            </div>
          )}
        </Card>
        
        {/* Morse code reference */}
        <Card className="p-6 col-span-1 bg-white border overflow-hidden">
          <h3 className="font-medium mb-2 text-primary">Morse Code Reference</h3>
          <div className="overflow-y-auto h-[250px] pr-2 text-sm">
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(MORSE_CODE).map(([char, code]) => (
                <div key={char} className="flex items-center space-x-1">
                  <span className="font-bold">{char}</span>
                  <span className="text-gray-600">{code}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-2 border-t">
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Dot (.)</span>: Short beep<br />
                <span className="font-semibold">Dash (-)</span>: Long beep (3x dot length)<br />
                <span className="font-semibold">Space between letters</span>: 3 dot lengths<br />
                <span className="font-semibold">Space between words</span>: 7 dot lengths
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        <h4 className="font-medium mb-1">Canadian Morse Code Requirements</h4>
        <p className="mb-2">
          For the Advanced Qualification in Canada, operators must demonstrate the ability to send and receive 
          Morse code at a minimum of 5 words per minute (WPM). The exam tests reception and transmission of:
        </p>
        <ul className="list-disc pl-5 mb-2 text-blue-700 space-y-1">
          <li>All 26 letters (A-Z)</li>
          <li>Numbers 0-9</li>
          <li>Period, comma, question mark, slash, and AR (end of message)</li>
          <li>Basic Q-codes (QTH, QSO, QSL, QRM, QRN)</li>
          <li>Prosigns like AR, SK, BT, and KN</li>
        </ul>
        <div className="p-2 bg-blue-100 rounded text-blue-900 text-xs">
          <strong>Tip:</strong> 5 WPM corresponds to about 1 character per second. Although no longer mandatory for Basic Qualification, 
          Morse code remains popular and opens up additional operating frequencies in the HF bands. 
          Many operators find it's one of the most reliable modes of communication during poor conditions.
        </div>
      </div>
    </div>
  );
}
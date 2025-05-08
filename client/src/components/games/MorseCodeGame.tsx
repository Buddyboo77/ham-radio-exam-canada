import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, Radio, RefreshCw, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Morse code mapping
const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
};

// Common ham radio call signs and terms
const RADIO_WORDS = [
  'CQ', 'QSL', 'QTH', 'QSO', '73', 'DX', 'HF', 'VHF', 'UHF',
  'RADIO', 'MORSE', 'HAM', 'SIGNAL', 'ANTENNA', 'DIPOLE', 'YAGI',
  'ARRL', 'CONTACT', 'QRM', 'QRN'
];

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
    
    // Different word generation based on difficulty
    if (difficulty === 'easy') {
      // Single letters or numbers
      const possibleChars = Object.keys(MORSE_CODE);
      newWord = possibleChars[Math.floor(Math.random() * possibleChars.length)];
    } else if (difficulty === 'medium') {
      // Short radio words (2-3 letters)
      const shortWords = RADIO_WORDS.filter(word => word.length <= 3);
      newWord = shortWords[Math.floor(Math.random() * shortWords.length)];
    } else {
      // Any radio word
      newWord = RADIO_WORDS[Math.floor(Math.random() * RADIO_WORDS.length)];
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

  // Play morse code sound
  const playMorseCode = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dotDuration = 100; // milliseconds
    const dashDuration = dotDuration * 3;
    const pauseBetweenElements = dotDuration;
    const pauseBetweenChars = dotDuration * 3;
    
    const morse = wordToMorse(currentWord);
    let currentTime = audioContext.currentTime;
    
    morse.split('').forEach(char => {
      if (char === '.') {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = 700;
        oscillator.connect(audioContext.destination);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + dotDuration / 1000);
        currentTime += dotDuration / 1000;
      } else if (char === '-') {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = 700;
        oscillator.connect(audioContext.destination);
        
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
          <h3 className="text-lg font-semibold">Morse Code Decoder</h3>
          <p className="text-sm text-muted-foreground">Translate morse code into letters and words!</p>
        </div>
        
        <div className="flex space-x-2">
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
      </div>
      
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
              
              <h3 className="text-2xl md:text-3xl font-mono mb-4 tracking-wider text-center">
                {wordToMorse(currentWord)}
              </h3>
              
              {showHint && (
                <div className="mt-4 p-2 bg-amber-50 rounded text-amber-800 text-sm">
                  {difficulty === 'easy' ? 'Hint: It\'s a single character' : 
                   difficulty === 'medium' ? 'Hint: It\'s a short ham radio term' : 
                   'Hint: It\'s a ham radio term'}
                </div>
              )}
              
              <div className="flex mt-6 w-full max-w-sm">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Your answer"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button 
                  onClick={handleSubmit} 
                  variant="default"
                  className="rounded-l-none"
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
        <h4 className="font-medium mb-1">Did you know?</h4>
        <p>
          Morse code is still used by many ham radio operators worldwide. The ability to copy Morse code 
          (also called CW or Continuous Wave) used to be required for amateur radio licensing, and many operators 
          find it's still one of the most reliable modes of communication during poor conditions.
        </p>
      </div>
    </div>
  );
}
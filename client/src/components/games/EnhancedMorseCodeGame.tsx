import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Radio, Lightbulb, AlertCircle, BookOpen, Volume2, CheckCircle2, XCircle } from "lucide-react";

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
  
  // Game state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentText, setCurrentText] = useState<string>('CQ');
  const [userInput, setUserInput] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  
  // Learning progress hook
  const { recordMorsePractice } = useLearningProgress();
  
  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = volume;
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
      }
    }
    
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    };
  }, []);
  
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
  
  // Play a dot (short beep)
  const playDot = () => {
    if (!audioContextRef.current) return;
    
    const dotDuration = 1.2 / wpm;
    
    oscillatorRef.current = audioContextRef.current.createOscillator();
    oscillatorRef.current.frequency.value = frequency;
    oscillatorRef.current.connect(gainNodeRef.current!);
    oscillatorRef.current.start();
    
    setTimeout(() => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    }, dotDuration * 1000);
    
    return dotDuration;
  };
  
  // Play a dash (long beep)
  const playDash = () => {
    if (!audioContextRef.current) return;
    
    const dotDuration = 1.2 / wpm;
    const dashDuration = dotDuration * 3;
    
    oscillatorRef.current = audioContextRef.current.createOscillator();
    oscillatorRef.current.frequency.value = frequency;
    oscillatorRef.current.connect(gainNodeRef.current!);
    oscillatorRef.current.start();
    
    setTimeout(() => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    }, dashDuration * 1000);
    
    return dashDuration;
  };
  
  // Play morse code for text
  const playMorse = () => {
    if (!audioContextRef.current || isPlaying) return;
    
    setIsPlaying(true);
    
    const text = currentText.toUpperCase();
    const dotDuration = 1.2 / wpm;
    let delay = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const morseChar = MORSE_CODE[char] || '';
      
      for (let j = 0; j < morseChar.length; j++) {
        const symbol = morseChar[j];
        
        setTimeout(() => {
          if (symbol === '.') {
            playDot();
          } else if (symbol === '-') {
            playDash();
          }
        }, delay * 1000);
        
        if (symbol === '.') {
          delay += dotDuration;
        } else if (symbol === '-') {
          delay += dotDuration * 3;
        }
        
        // Add space between symbols
        if (j < morseChar.length - 1) {
          delay += dotDuration;
        }
      }
      
      // Add space between characters
      delay += dotDuration * 3;
    }
    
    // Mark as done playing after all tones
    setTimeout(() => {
      setIsPlaying(false);
      
      // Record progress (WPM speed, accuracy guessed as 80%, and complete a lesson if in learn mode)
      recordMorsePractice(wpm, 80, activeTab === 'learn');
    }, delay * 1000);
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
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
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
        
        <TabsContent value="learn" className="space-y-4 mt-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-200">
                Basic Morse Code
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Learn the most common Morse code characters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-md flex flex-col items-center justify-center">
                  <div className="text-4xl font-mono font-bold text-white mb-4">
                    {currentText}
                  </div>
                  <div className="text-sm font-mono text-gray-300">
                    {formatMorseCode(currentText)}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={playMorse}
                    className="bg-blue-800 hover:bg-blue-700 flex-1"
                    disabled={isPlaying}
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    {isPlaying ? "Playing..." : "Play Sound"}
                  </Button>
                  
                  <Button
                    onClick={() => setCurrentText(prev => {
                      if (prev === "CQ") return "DE";
                      if (prev === "DE") return "73";
                      if (prev === "73") return "QTH";
                      return "CQ";
                    })}
                    className="bg-green-800 hover:bg-green-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Reference section */}
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
              Morse Code Reference
            </h3>
            <div className="grid grid-cols-10 gap-1 text-xs">
              {Object.entries(MORSE_CODE)
                .filter(([char]) => char !== ' ')
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([char, code]) => (
                  <div key={char} className="flex items-center p-1 bg-gray-900 rounded">
                    <div className="font-mono font-bold w-4 text-center">{char}</div>
                    <div className="font-mono ml-1 text-gray-400">{code}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="practice" className="space-y-4 mt-4">
          <div className="bg-gray-900 rounded-md p-4 border border-gray-700 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-blue-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-100 mb-1">Coming Soon</h3>
            <p className="text-sm text-gray-400">
              The Morse Code practice module is under development.
              <br />Try the learn tab to practice with basic characters.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4 mt-4">
          <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
            <h3 className="text-sm font-medium text-gray-200 mb-2">
              Custom Morse Code Text
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Enter text you'd like to practice with. The morse code audio will be played when you click "Play Morse".
            </p>
            
            <Input
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Enter text here..."
              className="bg-gray-900 border-gray-700 text-white mb-4"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={playMorse}
                className="bg-blue-800 hover:bg-blue-700 flex-1"
                disabled={!currentText || isPlaying}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {isPlaying ? "Playing..." : "Play Morse"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
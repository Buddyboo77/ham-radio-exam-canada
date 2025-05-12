import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Music, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

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

// Reverse morse code dictionary for decoding
const REVERSE_MORSE_CODE_DICT: Record<string, string> = 
  Object.entries(MORSE_CODE_DICT).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {} as Record<string, string>);

// Prosigns
const PROSIGNS = {
  'AR': '.-.-.',    // End of message
  'AS': '.-...',    // Wait
  'BT': '-...-',    // Break / New section
  'KN': '-.--.',    // Go only named station
  'SK': '...-.-',   // End of contact
  'CL': '-.-..-..'  // Going off the air / Clear
};

// Audio context for Morse code playback
let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;

// Helper to encode text to morse code
const textToMorse = (text: string): string => {
  return text
    .toUpperCase()
    .split('')
    .map(char => {
      if (char === ' ') {
        return ' / ';
      }
      return MORSE_CODE_DICT[char] || '';
    })
    .filter(code => code !== '')
    .join(' ');
};

// Helper to decode morse to text
const morseToText = (morse: string): string => {
  return morse
    .split(' / ')
    .map(word => 
      word
        .split(' ')
        .map(code => REVERSE_MORSE_CODE_DICT[code] || '')
        .join('')
    )
    .join(' ');
};

const EnhancedMorseCode: React.FC = () => {
  // State
  const [inputText, setInputText] = useState<string>('');
  const [morseCode, setMorseCode] = useState<string>('');
  const [decodedText, setDecodedText] = useState<string>('');
  const [wpm, setWpm] = useState<number>(15);
  const [volume, setVolume] = useState<number>(70);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('converter');
  const [copied, setCopied] = useState<boolean>(false);
  
  // Update morse code when input text changes
  useEffect(() => {
    setMorseCode(textToMorse(inputText));
  }, [inputText]);
  
  // Update decoded text when morse code changes
  useEffect(() => {
    try {
      setDecodedText(morseToText(morseCode));
    } catch (error) {
      setDecodedText('');
    }
  }, [morseCode]);
  
  // Play morse code
  const playMorseCode = () => {
    if (morseCode.trim() === '') return;
    
    // Clean up previous audio
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
    }
    
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (!audioContext) return; // Browser doesn't support Web Audio API
    
    const dotDuration = 1.2 / wpm; // Duration of a dot in seconds
    const dashDuration = dotDuration * 3; // Duration of a dash
    const pauseBetweenElements = dotDuration; // Pause between dots and dashes
    const pauseBetweenCharacters = dotDuration * 3; // Pause between characters
    const pauseBetweenWords = dotDuration * 7; // Pause between words
    
    gainNode = audioContext.createGain();
    oscillator = audioContext.createOscillator();
    
    oscillator.type = "sine";
    oscillator.frequency.value = 700; // Hz
    
    gainNode.gain.value = volume / 100; // Convert percentage to gain (0-1)
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    gainNode.gain.value = 0; // Start silent
    
    let currentTime = audioContext.currentTime;
    
    // Split into words (separated by /)
    const words = morseCode.split(' / ');
    
    words.forEach((word, wordIdx) => {
      // Split word into characters (separated by space)
      const characters = word.split(' ');
      
      characters.forEach((character, charIdx) => {
        for (let i = 0; i < character.length; i++) {
          const symbol = character[i];
          
          if (symbol === '.') {
            // Play a dot
            gainNode!.gain.setValueAtTime(volume / 100, currentTime);
            currentTime += dotDuration;
            gainNode!.gain.setValueAtTime(0, currentTime);
            currentTime += pauseBetweenElements;
          } else if (symbol === '-') {
            // Play a dash
            gainNode!.gain.setValueAtTime(volume / 100, currentTime);
            currentTime += dashDuration;
            gainNode!.gain.setValueAtTime(0, currentTime);
            currentTime += pauseBetweenElements;
          }
        }
        
        // Add pause between characters unless it's the last character
        if (charIdx < characters.length - 1) {
          currentTime += pauseBetweenCharacters;
        }
      });
      
      // Add pause between words unless it's the last word
      if (wordIdx < words.length - 1) {
        currentTime += pauseBetweenWords;
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
  
  // Stop playback
  const stopPlayback = () => {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
    }
    setIsPlaying(false);
  };
  
  // Handle copying to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      
      toast({
        title: "Copied to clipboard",
        description: "The text has been copied to your clipboard.",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };
  
  // Organized character sets for the reference cards
  const characterSets = {
    'Letters': Object.entries(MORSE_CODE_DICT).filter(([key]) => /^[A-Z]$/.test(key)),
    'Numbers': Object.entries(MORSE_CODE_DICT).filter(([key]) => /^[0-9]$/.test(key)),
    'Punctuation': Object.entries(MORSE_CODE_DICT).filter(([key]) => /^[^A-Z0-9]$/.test(key) && key.length === 1),
    'Prosigns': Object.entries(PROSIGNS)
  };
  
  // Render the converter tab content
  const renderConverterTab = () => (
    <div className="space-y-4">
      <Card className="bg-gray-850 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Text to Morse Code Converter</CardTitle>
          <CardDescription>
            Type text below to convert it to Morse code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-300">Input Text</label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setInputText('')}
                >
                  Clear
                </Button>
              </div>
              <Textarea 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type text to convert to Morse code..."
                className="bg-gray-950 border-gray-800 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-300">Morse Code</label>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => copyToClipboard(morseCode)}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                  <Button 
                    variant={isPlaying ? "destructive" : "default"}
                    size="sm"
                    className="h-6 px-2"
                    onClick={isPlaying ? stopPlayback : playMorseCode}
                    disabled={morseCode.trim() === ''}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </Button>
                </div>
              </div>
              <div className="bg-gray-950 border border-gray-800 rounded-md p-3 font-mono text-gray-300 min-h-[60px] break-all">
                {morseCode || <span className="text-gray-500">Morse code will appear here...</span>}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-300">Playback Settings</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Speed (WPM)</span>
                    <Badge variant="outline" className="text-xs h-5">{wpm} WPM</Badge>
                  </div>
                  <Slider 
                    min={5} 
                    max={40} 
                    step={1} 
                    value={[wpm]} 
                    onValueChange={value => setWpm(value[0])}
                    className="py-4"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Volume</span>
                    <Badge variant="outline" className="text-xs h-5">{volume}%</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <VolumeX size={16} className="text-gray-400" />
                    <Slider 
                      min={0} 
                      max={100} 
                      step={5} 
                      value={[volume]} 
                      onValueChange={value => setVolume(value[0])}
                      className="flex-1"
                    />
                    <Volume2 size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  // Render the reference tab content
  const renderReferenceTab = () => (
    <div className="space-y-4">
      <Tabs defaultValue="Letters">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="Letters">Letters</TabsTrigger>
          <TabsTrigger value="Numbers">Numbers</TabsTrigger>
          <TabsTrigger value="Punctuation">Punctuation</TabsTrigger>
          <TabsTrigger value="Prosigns">Prosigns</TabsTrigger>
        </TabsList>
        
        {Object.entries(characterSets).map(([category, chars]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {chars.map(([char, code]) => (
                <Card key={char} className="bg-gray-850 border-gray-700">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-mono font-bold text-blue-300">{char}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          if (!audioContext) {
                            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                          }
                          
                          // Play just this character
                          setMorseCode(code);
                          playMorseCode();
                        }}
                      >
                        <Music size={14} />
                      </Button>
                    </div>
                    <div className="font-mono text-gray-300 mt-1">{code}</div>
                    <div className="flex items-center gap-1 mt-2">
                      {code.split('').map((symbol, index) => (
                        <span 
                          key={index} 
                          className={`inline-block ${symbol === '.' ? 'w-2 h-2' : 'w-6 h-2'} rounded-full ${
                            symbol === '.' ? 'bg-blue-400' : 'bg-blue-600'
                          }`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
  
  // Main component render
  return (
    <div className="space-y-4">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="converter">Converter & Playback</TabsTrigger>
          <TabsTrigger value="reference">Character Reference</TabsTrigger>
        </TabsList>
        
        <TabsContent value="converter">
          {renderConverterTab()}
        </TabsContent>
        
        <TabsContent value="reference">
          {renderReferenceTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedMorseCode;
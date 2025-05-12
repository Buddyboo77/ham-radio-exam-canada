import { useState, useEffect } from "react";
import { Play, Pause, Volume2, Copy, Info, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MorseCharacter {
  char: string;
  morse: string;
  color?: string;
}

// Modern grouped Morse code chart
const MORSE_CODE: Record<string, MorseCharacter[]> = {
  "Letters": [
    { char: "A", morse: ".-" },
    { char: "B", morse: "-..." },
    { char: "C", morse: "-.-." },
    { char: "D", morse: "-.." },
    { char: "E", morse: "." },
    { char: "F", morse: "..-." },
    { char: "G", morse: "--." },
    { char: "H", morse: "...." },
    { char: "I", morse: ".." },
    { char: "J", morse: ".---" },
    { char: "K", morse: "-.-" },
    { char: "L", morse: ".-.." },
    { char: "M", morse: "--" },
    { char: "N", morse: "-." },
    { char: "O", morse: "---" },
    { char: "P", morse: ".--." },
    { char: "Q", morse: "--.-" },
    { char: "R", morse: ".-." },
    { char: "S", morse: "..." },
    { char: "T", morse: "-" },
    { char: "U", morse: "..-" },
    { char: "V", morse: "...-" },
    { char: "W", morse: ".--" },
    { char: "X", morse: "-..-" },
    { char: "Y", morse: "-.--" },
    { char: "Z", morse: "--.." }
  ],
  "Numbers": [
    { char: "0", morse: "-----", color: "text-amber-400" },
    { char: "1", morse: ".----", color: "text-amber-400" },
    { char: "2", morse: "..---", color: "text-amber-400" },
    { char: "3", morse: "...--", color: "text-amber-400" },
    { char: "4", morse: "....-", color: "text-amber-400" },
    { char: "5", morse: ".....", color: "text-amber-400" },
    { char: "6", morse: "-....", color: "text-amber-400" },
    { char: "7", morse: "--...", color: "text-amber-400" },
    { char: "8", morse: "---..", color: "text-amber-400" },
    { char: "9", morse: "----.", color: "text-amber-400" }
  ],
  "Punctuation": [
    { char: ".", morse: ".-.-.-", color: "text-green-400" },
    { char: ",", morse: "--..--", color: "text-green-400" },
    { char: "?", morse: "..--..", color: "text-green-400" },
    { char: "'", morse: ".----.", color: "text-green-400" },
    { char: "!", morse: "-.-.--", color: "text-green-400" },
    { char: "/", morse: "-..-.", color: "text-green-400" },
    { char: "(", morse: "-.--.", color: "text-green-400" },
    { char: ")", morse: "-.--.-", color: "text-green-400" },
    { char: "&", morse: ".-...", color: "text-green-400" },
    { char: ":", morse: "---...", color: "text-green-400" },
    { char: ";", morse: "-.-.-.", color: "text-green-400" },
    { char: "=", morse: "-...-", color: "text-green-400" },
    { char: "+", morse: ".-.-.", color: "text-green-400" },
    { char: "-", morse: "-....-", color: "text-green-400" },
    { char: "_", morse: "..--.-", color: "text-green-400" },
    { char: "\"", morse: ".-..-.", color: "text-green-400" },
    { char: "$", morse: "...-..-", color: "text-green-400" },
    { char: "@", morse: ".--.-.", color: "text-green-400" }
  ],
  "Prosigns": [
    { char: "AR", morse: ".-.-.", color: "text-purple-400" },
    { char: "SK", morse: "...-.-", color: "text-purple-400" },
    { char: "BT", morse: "-...-", color: "text-purple-400" },
    { char: "KN", morse: "-.--.", color: "text-purple-400" },
    { char: "CL", morse: "-.-..-..", color: "text-purple-400" },
    { char: "SOS", morse: "...---...", color: "text-red-500" }
  ]
};

// Audio context for Morse code playback
let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;

const EnhancedMorseCode: React.FC = () => {
  const [selectedChar, setSelectedChar] = useState<MorseCharacter | null>(null);
  const [inputText, setInputText] = useState("");
  const [morseOutput, setMorseOutput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [wpm, setWpm] = useState(15); // Words per minute
  const [activeSection, setActiveSection] = useState<string>("Letters");
  const [copySuccess, setCopySuccess] = useState(false);

  // Initialize audio context
  useEffect(() => {
    return () => {
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Convert text to Morse code
  useEffect(() => {
    const convertToMorse = (text: string): string => {
      return text
        .toUpperCase()
        .split("")
        .map(char => {
          // Find the character in our Morse code dictionary
          for (const section in MORSE_CODE) {
            const found = MORSE_CODE[section].find(item => item.char === char);
            if (found) return found.morse;
          }
          // Handle space
          if (char === " ") return "   "; // 3 spaces for word separation
          return ""; // Ignore characters not in the dictionary
        })
        .join(" "); // 1 space between characters
    };

    setMorseOutput(convertToMorse(inputText));
  }, [inputText]);

  const handleCharClick = (char: MorseCharacter) => {
    setSelectedChar(char);
    if (!isMuted) {
      playMorseSound(char.morse);
    }
  };

  const handleCopyMorse = () => {
    navigator.clipboard.writeText(morseOutput);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopMorseSound();
    } else {
      playMorseSound(morseOutput);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      stopMorseSound();
      setIsPlaying(false);
    }
  };

  // Play Morse code as sound
  const playMorseSound = (morse: string) => {
    stopMorseSound(); // Stop any current playback
    
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
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = 0; // Start silent
    oscillator.start();
    
    let currentTime = audioContext.currentTime;
    
    for (let i = 0; i < morse.length; i++) {
      const char = morse[i];
      
      if (char === ".") {
        // Play a dot
        gainNode.gain.setValueAtTime(0.5, currentTime);
        currentTime += dotDuration;
        gainNode.gain.setValueAtTime(0, currentTime);
        currentTime += pauseBetweenElements;
      } else if (char === "-") {
        // Play a dash
        gainNode.gain.setValueAtTime(0.5, currentTime);
        currentTime += dashDuration;
        gainNode.gain.setValueAtTime(0, currentTime);
        currentTime += pauseBetweenElements;
      } else if (char === " ") {
        // Space - adjust timing depending on number of consecutive spaces
        if (i + 1 < morse.length && morse[i + 1] === " " && morse[i + 2] === " ") {
          // Three spaces means a pause between words
          currentTime += pauseBetweenWords;
          i += 2; // Skip the next two spaces
        } else {
          // Otherwise it's a pause between characters
          currentTime += pauseBetweenCharacters;
        }
      }
    }
    
    // Stop after playing the last symbol
    oscillator.stop(currentTime);
    
    // Set a timeout to update the UI when playback finishes
    setTimeout(() => {
      setIsPlaying(false);
    }, (currentTime - audioContext.currentTime) * 1000);
  };

  const stopMorseSound = () => {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with title and Morse code fact */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-3 border border-blue-700">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <span className="morse-icon w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">•</span>
          Morse Code Reference
        </h2>
        <p className="text-xs text-blue-100 mb-2">
          Developed in the 1830s, Morse code remains vital for emergency communications
          and is used by radio operators worldwide.
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-blue-800 hover:bg-blue-700 text-[10px]">
              SOS = ...---...
            </Badge>
            <Badge variant="secondary" className="bg-purple-800 hover:bg-purple-700 text-[10px] hidden sm:flex">
              International Standard
            </Badge>
          </div>
          <div className="text-[9px] text-blue-200 flex items-center">
            <Info size={10} className="mr-1" /> 
            <span>Dots: short signals, Dashes: long signals</span>
          </div>
        </div>
      </div>

      {/* Interactive Morse translator */}
      <div className="bg-gray-850 rounded-lg p-3 border border-gray-700">
        <div className="mb-3">
          <label className="text-xs text-gray-400 mb-1 block">Type to convert to Morse code:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text here..."
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className={`h-9 px-2 ${copySuccess ? 'text-green-400' : 'text-gray-400'}`}
                onClick={handleCopyMorse}
              >
                <Copy size={16} />
              </Button>
            </div>
            <div className="flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className={`h-9 px-2 ${isPlaying ? 'text-blue-400' : 'text-gray-400'}`}
                onClick={togglePlay}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
            </div>
            <div className="flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className={`h-9 px-2 ${isMuted ? 'text-gray-500' : 'text-gray-400'}`}
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </Button>
            </div>
          </div>
          <div className="mt-2 p-2 bg-gray-900 border border-gray-800 rounded-md min-h-[40px] text-sm font-mono">
            <span className="text-blue-400">{morseOutput || '• • •   — — —   • • •'}</span>
          </div>
        </div>

        {/* WPM (speed) slider */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12">Speed:</span>
          <input
            type="range"
            min="5"
            max="30"
            value={wpm}
            onChange={(e) => setWpm(parseInt(e.target.value))}
            className="flex-1 h-1.5 appearance-none rounded-full bg-gray-700"
          />
          <span className="text-xs font-mono text-gray-300 w-12">{wpm} WPM</span>
        </div>

        {/* Selected character focus view */}
        {selectedChar && (
          <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg flex flex-col items-center">
            <div className="text-4xl font-bold mb-2 text-blue-300">{selectedChar.char}</div>
            <div className="text-xl font-mono mb-1">{selectedChar.morse}</div>
            <div className="flex items-center gap-2">
              {selectedChar.morse.split('').map((symbol, index) => (
                <span 
                  key={index} 
                  className={`inline-block ${symbol === '.' ? 'w-2 h-2' : 'w-6 h-2'} rounded-full ${
                    symbol === '.' ? 'bg-blue-400' : 'bg-blue-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Morse code chart with tabs */}
        <div className="rounded-lg border border-gray-700 overflow-hidden">
          <div className="flex bg-gray-800">
            {Object.keys(MORSE_CODE).map((section) => (
              <button
                key={section}
                className={`text-xs py-2 px-3 ${
                  activeSection === section
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                }`}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </button>
            ))}
          </div>
          
          <div className="p-3 bg-gray-850 max-h-[220px] overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {MORSE_CODE[activeSection].map((item) => (
                <TooltipProvider key={item.char}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`relative p-2 rounded-md border transition-all ${
                          selectedChar?.char === item.char
                            ? 'bg-blue-900 border-blue-700'
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                        }`}
                        onClick={() => handleCharClick(item)}
                      >
                        <div className={`text-xl font-bold mb-1 ${item.color || 'text-blue-300'}`}>
                          {item.char}
                        </div>
                        <div className="text-xs text-gray-300 font-mono">{item.morse}</div>
                        <div className="absolute bottom-0 right-0 opacity-20">
                          {item.morse.includes('...---...') && (
                            <span className="text-red-500 font-bold text-4xl">SOS</span>
                          )}
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-gray-800 border-gray-700">
                      <div className="text-center">
                        <p className="text-sm">Click to play</p>
                        <div className="flex items-center justify-center mt-1 gap-1">
                          {item.morse.split('').map((symbol, index) => (
                            <span 
                              key={index} 
                              className={`inline-block ${symbol === '.' ? 'w-1.5 h-1.5' : 'w-5 h-1.5'} rounded-full ${
                                symbol === '.' ? 'bg-blue-400' : 'bg-blue-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tips and tricks section */}
      <div className="bg-blue-900 bg-opacity-20 rounded-lg p-3 border border-blue-800">
        <h3 className="text-sm font-medium text-blue-300 mb-2">Tips for Learning Morse Code</h3>
        <ul className="space-y-1 text-xs text-gray-300">
          <li className="flex items-start gap-1">
            <span className="text-blue-400 text-lg leading-none">•</span>
            <span>Focus on sound patterns rather than dots and dashes</span>
          </li>
          <li className="flex items-start gap-1">
            <span className="text-blue-400 text-lg leading-none">•</span>
            <span>Practice daily with short, regular sessions</span>
          </li>
          <li className="flex items-start gap-1">
            <span className="text-blue-400 text-lg leading-none">•</span>
            <span>Start with common letters (E, T, A, N, I, S, O)</span>
          </li>
          <li className="flex items-start gap-1">
            <span className="text-blue-400 text-lg leading-none">•</span>
            <span>Use the integrated translator tool to practice sending messages</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedMorseCode;
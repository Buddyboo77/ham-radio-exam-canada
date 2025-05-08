import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Radio, Target, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameTarget {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  hit: boolean;
  type: 'normal' | 'bonus' | 'special';
}

export default function RadioTargetGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<GameTarget[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize game
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setLevel(1);
    
    // Start timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Start target generation
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    gameIntervalRef.current = setInterval(() => {
      if (targets.length < 5 + level) {
        addTarget();
      }
      
      // Move targets
      setTargets(prev => 
        prev.map(target => ({
          ...target,
          y: target.y + target.speed,
        })).filter(target => target.y < (containerRef.current?.clientHeight || 400) && !target.hit)
      );
    }, 50);
  };
  
  // End game
  const endGame = () => {
    setIsPlaying(false);
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    if (score > highScore) {
      setHighScore(score);
      
      // Celebration with confetti if it's a high score
      if (score > 10) {
        // Fire multiple bursts for more celebration
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        
        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };
        
        const firework = () => {
          const timeLeft = animationEnd - Date.now();
          
          if (timeLeft <= 0) return;
          
          // Set a random position near the center
          const position = {
            x: 0.5,
            y: 0.5
          };
          
          confetti({
            particleCount: 50,
            spread: randomInRange(50, 100),
            origin: position,
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff']
          });
          
          if (timeLeft > 0) {
            requestAnimationFrame(firework);
          }
        };
        
        firework();
      }
    }
  };
  
  // Add a new target
  const addTarget = () => {
    if (!containerRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const type = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'bonus' : 'special') : 'normal';
    const size = type === 'bonus' ? 60 : (type === 'special' ? 40 : 50);
    
    setTargets(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: Math.random() * (width - size),
        y: -size,
        size,
        speed: 1 + Math.random() * (level * 0.5),
        hit: false,
        type
      }
    ]);
  };
  
  // Handle target click
  const handleTargetClick = (id: number, type: 'normal' | 'bonus' | 'special') => {
    // Mark as hit
    setTargets(prev => 
      prev.map(target => 
        target.id === id ? { ...target, hit: true } : target
      )
    );
    
    // Add score based on type
    const points = type === 'bonus' ? 5 : (type === 'special' ? 10 : 1);
    setScore(prev => {
      const newScore = prev + points;
      
      // Level up every 20 points
      if (Math.floor(newScore / 20) > Math.floor(prev / 20)) {
        setLevel(current => current + 1);
        setTimeLeft(current => Math.min(current + 5, 30)); // Bonus time for leveling up
      }
      
      return newScore;
    });
  };
  
  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium">Score: {score}</span>
          <span className="text-xs text-muted-foreground">High score: {highScore}</span>
        </div>
        
        <div className="flex-1 mx-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Time left: {timeLeft}s</span>
            <span>Level: {level}</span>
          </div>
          <Progress value={(timeLeft / 30) * 100} />
        </div>
        
        <Button 
          size="sm"
          onClick={isPlaying ? endGame : startGame}
          variant={isPlaying ? "destructive" : "default"}
        >
          {isPlaying ? "End Game" : "Start Game"}
        </Button>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full h-[400px] border border-gray-200 rounded-lg bg-slate-50 overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {!isPlaying && !score && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <Target className="w-12 h-12 text-primary mb-2" />
            <h3 className="text-lg font-semibold mb-2">Amateur Radio Target Practice</h3>
            <p className="text-muted-foreground mb-4">
              Click on the radio targets as they appear. Different targets are worth different points!
            </p>
            <Button onClick={startGame}>Start Game</Button>
          </div>
        )}
        
        {!isPlaying && score > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/5">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
              <p className="text-xl mb-4">Your score: <span className="text-primary font-bold">{score}</span></p>
              {score > highScore - 5 && (
                <p className="text-green-600 font-medium mb-4">
                  {score > highScore ? "🎉 New high score!" : "Almost beat your high score!"}
                </p>
              )}
              <Button onClick={startGame} size="lg">Play Again</Button>
            </div>
          </div>
        )}
        
        {targets.map(target => (
          <button
            key={target.id}
            className={`absolute rounded-full flex items-center justify-center transition-colors
              ${target.type === 'normal' ? 'bg-blue-100 hover:bg-blue-200' : 
                target.type === 'bonus' ? 'bg-green-100 hover:bg-green-200' : 
                'bg-purple-100 hover:bg-purple-200'}`}
            style={{
              left: `${target.x}px`,
              top: `${target.y}px`,
              width: `${target.size}px`,
              height: `${target.size}px`,
              opacity: target.hit ? 0 : 1,
              transform: `scale(${target.hit ? 1.5 : 1})`,
              transition: 'opacity 200ms, transform 200ms',
            }}
            onClick={() => handleTargetClick(target.id, target.type)}
            disabled={target.hit || !isPlaying}
          >
            {target.type === 'normal' ? (
              <Radio className="w-6 h-6 text-blue-500" />
            ) : target.type === 'bonus' ? (
              <Radio className="w-7 h-7 text-green-500" />
            ) : (
              <Zap className="w-6 h-6 text-purple-500" />
            )}
          </button>
        ))}
      </div>
      
      <div className="w-full mt-4 text-sm text-center text-muted-foreground">
        <p>Click on the targets to score points. More targets appear at higher levels!</p>
        <div className="flex justify-center gap-4 mt-2">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-100 mr-1 flex items-center justify-center">
              <Radio className="w-3 h-3 text-blue-500" />
            </div>
            <span>1 point</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-100 mr-1 flex items-center justify-center">
              <Radio className="w-3 h-3 text-green-500" />
            </div>
            <span>5 points</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-purple-100 mr-1 flex items-center justify-center">
              <Zap className="w-3 h-3 text-purple-500" />
            </div>
            <span>10 points</span>
          </div>
        </div>
      </div>
    </div>
  );
}
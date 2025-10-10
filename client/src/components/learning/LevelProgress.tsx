import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelData {
  level: number;
  xp: number;
  xpForNextLevel: number;
  rank: string;
}

const RANKS = [
  { level: 1, name: 'Beginner', xp: 0 },
  { level: 5, name: 'Novice', xp: 500 },
  { level: 10, name: 'Intermediate', xp: 1500 },
  { level: 15, name: 'Advanced', xp: 3000 },
  { level: 20, name: 'Expert', xp: 5000 },
  { level: 25, name: 'Master', xp: 7500 },
  { level: 30, name: 'SignalAce', xp: 10000 }
];

export function LevelProgress() {
  const [levelData, setLevelData] = useState<LevelData>({
    level: 1,
    xp: 0,
    xpForNextLevel: 100,
    rank: 'Beginner'
  });

  useEffect(() => {
    const savedXP = parseInt(localStorage.getItem('user-xp') || '0');
    const level = calculateLevel(savedXP);
    const rank = RANKS.find(r => level >= r.level)?.name || 'Beginner';
    const xpForNextLevel = calculateXPForLevel(level + 1);
    const xpForCurrentLevel = calculateXPForLevel(level);

    setLevelData({
      level,
      xp: savedXP - xpForCurrentLevel,
      xpForNextLevel: xpForNextLevel - xpForCurrentLevel,
      rank
    });
  }, []);

  const calculateLevel = (totalXP: number): number => {
    let level = 1;
    while (calculateXPForLevel(level + 1) <= totalXP) {
      level++;
    }
    return level;
  };

  const calculateXPForLevel = (level: number): number => {
    return Math.floor(100 * Math.pow(level, 1.5));
  };

  const addXP = (amount: number) => {
    const currentTotalXP = parseInt(localStorage.getItem('user-xp') || '0');
    const newTotalXP = currentTotalXP + amount;
    localStorage.setItem('user-xp', newTotalXP.toString());

    const oldLevel = levelData.level;
    const newLevel = calculateLevel(newTotalXP);

    if (newLevel > oldLevel) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.4 }
      });
    }

    const rank = RANKS.find(r => newLevel >= r.level)?.name || 'Beginner';
    const xpForNextLevel = calculateXPForLevel(newLevel + 1);
    const xpForCurrentLevel = calculateXPForLevel(newLevel);

    setLevelData({
      level: newLevel,
      xp: newTotalXP - xpForCurrentLevel,
      xpForNextLevel: xpForNextLevel - xpForCurrentLevel,
      rank
    });
  };

  const progressPercentage = (levelData.xp / levelData.xpForNextLevel) * 100;

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Star className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Level {levelData.level}</h3>
              <p className="text-xs text-gray-400">{levelData.rank}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-600/10 border-blue-500/30">
            <TrendingUp className="h-3 w-3 mr-1" />
            {levelData.xp} / {levelData.xpForNextLevel} XP
          </Badge>
        </div>
        
        <Progress value={progressPercentage} className="h-3 bg-gray-800" />
        
        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <span>{Math.floor(progressPercentage)}% to next level</span>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>Next: {RANKS.find(r => r.level > levelData.level)?.name || 'Max Level'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
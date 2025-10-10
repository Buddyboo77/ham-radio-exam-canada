import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Target, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  current: number;
  reward: string;
  icon: any;
}

export function DailyChallenge() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [completedToday, setCompletedToday] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date().toDateString();
    const savedCompleted = localStorage.getItem('daily-challenges-completed');
    const savedDate = localStorage.getItem('daily-challenges-date');

    if (savedDate === today && savedCompleted) {
      setCompletedToday(JSON.parse(savedCompleted));
    } else {
      localStorage.setItem('daily-challenges-date', today);
      localStorage.setItem('daily-challenges-completed', JSON.stringify([]));
      setCompletedToday([]);
      generateDailyChallenges();
    }
  }, []);

  const generateDailyChallenges = () => {
    const allChallenges = [
      {
        id: 'quick-quiz',
        title: 'Quick Quiz Master',
        description: 'Complete 3 quizzes today',
        goal: 3,
        current: 0,
        reward: '+50 XP',
        icon: Target
      },
      {
        id: 'perfect-score',
        title: 'Perfect Performance',
        description: 'Score 100% on any quiz',
        goal: 1,
        current: 0,
        reward: '+100 XP',
        icon: Trophy
      },
      {
        id: 'morse-practice',
        title: 'Morse Master',
        description: 'Practice Morse code for 10 minutes',
        goal: 10,
        current: 0,
        reward: '+75 XP',
        icon: Zap
      },
      {
        id: 'streak-keeper',
        title: 'Streak Keeper',
        description: 'Study today to keep your streak alive',
        goal: 1,
        current: 0,
        reward: '+25 XP',
        icon: Flame
      }
    ];

    const dailyChallenges = allChallenges.slice(0, 3);
    setChallenges(dailyChallenges);
  };

  const completeChallenge = (challengeId: string) => {
    if (completedToday.includes(challengeId)) return;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const newCompleted = [...completedToday, challengeId];
    setCompletedToday(newCompleted);
    localStorage.setItem('daily-challenges-completed', JSON.stringify(newCompleted));
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          Daily Challenges
        </CardTitle>
        <CardDescription>Complete challenges to earn bonus XP!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map(challenge => {
          const Icon = challenge.icon;
          const isCompleted = completedToday.includes(challenge.id);
          
          return (
            <div 
              key={challenge.id}
              className={`p-3 rounded-lg border ${
                isCompleted 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-gray-800/40 border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-600/20' : 'bg-purple-600/20'}`}>
                    <Icon className={`h-5 w-5 ${isCompleted ? 'text-green-400' : 'text-purple-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{challenge.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{challenge.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {challenge.reward}
                      </Badge>
                      {isCompleted && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> Completed!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!isCompleted && (
                  <Button 
                    size="sm" 
                    onClick={() => completeChallenge(challenge.id)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Claim
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        
        {completedToday.length === challenges.length && challenges.length > 0 && (
          <div className="text-center py-4 text-green-400 flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5" />
            <span className="font-medium">All challenges completed! Come back tomorrow! 🎉</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
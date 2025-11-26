import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Coins, Star, Trophy } from 'lucide-react';
import { celebrate } from '@/lib/celebrateUtils';

export function DailyLoginBonus() {
  const [showBonus, setShowBonus] = useState(false);
  const [bonusDay, setBonusDay] = useState(1);
  const [bonusXP, setBonusXP] = useState(25);

  useEffect(() => {
    checkDailyBonus();
  }, []);

  const checkDailyBonus = () => {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('last-login-date');
    const loginStreak = parseInt(localStorage.getItem('login-streak') || '0');

    if (lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const newStreak = lastLogin === yesterday.toDateString() ? loginStreak + 1 : 1;
      const xp = 25 + (newStreak * 10);

      localStorage.setItem('last-login-date', today);
      localStorage.setItem('login-streak', newStreak.toString());

      setBonusDay(newStreak);
      setBonusXP(xp);
      setShowBonus(true);
    }
  };

  const claimBonus = () => {
    const currentXP = parseInt(localStorage.getItem('user-xp') || '0');
    localStorage.setItem('user-xp', (currentXP + bonusXP).toString());

    celebrate({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 }
    });

    setShowBonus(false);
  };

  return (
    <Dialog open={showBonus} onOpenChange={setShowBonus}>
      <DialogContent className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Gift className="h-6 w-6 text-yellow-400" />
            Daily Login Bonus!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-6">
          <div className="inline-block p-6 bg-yellow-600/10 rounded-full mb-4">
            <Coins className="h-16 w-16 text-yellow-400" />
          </div>
          
          <h3 className="text-3xl font-bold mb-2 text-yellow-400">+{bonusXP} XP</h3>
          
          <p className="text-gray-300 mb-1">Day {bonusDay} Login Streak!</p>
          <p className="text-sm text-gray-400">Keep coming back for bigger bonuses!</p>
          
          <div className="mt-6 flex justify-center gap-2">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i}
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  i < bonusDay 
                    ? 'bg-yellow-600/30 border-2 border-yellow-500' 
                    : 'bg-gray-800 border border-gray-700'
                }`}
              >
                {i < bonusDay ? (
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ) : (
                  <span className="text-xs text-gray-500">{i + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={claimBonus}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6"
          size="lg"
        >
          <Trophy className="h-5 w-5 mr-2" />
          Claim Bonus!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyChallenge } from "@/components/learning/DailyChallenge";
import { LevelProgress } from "@/components/learning/LevelProgress";
import { DailyLoginBonus } from "@/components/learning/DailyLoginBonus";
import { Trash2 } from 'lucide-react';

export default function TestGamification() {
  const clearAllData = () => {
    localStorage.removeItem('last-login-date');
    localStorage.removeItem('login-streak');
    localStorage.removeItem('user-xp');
    localStorage.removeItem('daily-challenges-completed');
    localStorage.removeItem('daily-challenges-date');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-red-900/20 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400">Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={clearAllData}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Reset All Progress (Test Daily Bonus Again)
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              This will clear all XP, streaks, and challenges so you can test the daily bonus popup
            </p>
          </CardContent>
        </Card>

        <DailyLoginBonus />
        
        <LevelProgress />
        
        <DailyChallenge />
        
        <Card className="bg-blue-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle>Current Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Last Login: {localStorage.getItem('last-login-date') || 'Never'}</p>
            <p>Login Streak: {localStorage.getItem('login-streak') || '0'} days</p>
            <p>Total XP: {localStorage.getItem('user-xp') || '0'}</p>
            <p>Today's Date: {new Date().toDateString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
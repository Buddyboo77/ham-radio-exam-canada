import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Award, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function ProUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-pro-upgrade', handleOpen);
    return () => window.removeEventListener('open-pro-upgrade', handleOpen);
  }, []);

  const upgradeToPro = () => {
    localStorage.setItem('signalace-pro', 'true');
    
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.4 }
    });

    setTimeout(() => {
      setIsOpen(false);
      window.location.reload();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-400" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            Unlock the complete SignalAce experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="inline-block p-4 bg-yellow-600/10 rounded-full mb-4">
              <Sparkles className="h-12 w-12 text-yellow-400" />
            </div>
            
            <div className="mb-4">
              <span className="text-5xl font-bold text-yellow-400">$8.88</span>
              <p className="text-sm text-gray-400 mt-1">One-time purchase • Lifetime access</p>
            </div>
          </div>

          <div className="space-y-3 bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-200 mb-3">Pro Features:</h3>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm">No Advertisements</p>
                <p className="text-xs text-gray-400">Clean, distraction-free studying</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Offline Mode</p>
                <p className="text-xs text-gray-400">Study anywhere, even without internet</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Award className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Priority Support</p>
                <p className="text-xs text-gray-400">Get help when you need it</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Sparkles className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Future Updates</p>
                <p className="text-xs text-gray-400">All new features included forever</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <p className="text-xs text-blue-200 text-center">
              🎯 <strong>Limited Time:</strong> 88 users already upgraded today!
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={upgradeToPro}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-6 text-lg"
            size="lg"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade Now - $8.88
          </Button>
          
          <Button 
            onClick={() => setIsOpen(false)}
            variant="ghost"
            className="w-full text-gray-400 hover:text-gray-300"
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-2">
          Secure payment • 30-day money-back guarantee
        </p>
      </DialogContent>
    </Dialog>
  );
}
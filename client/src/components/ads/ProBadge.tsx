import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ProBadge() {
  const isPro = localStorage.getItem('signalace-pro') === 'true';

  if (isPro) {
    return (
      <div className="flex justify-center">
        <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-500/30">
          <Crown className="h-3 w-3 mr-1" />
          Pro Member
        </Badge>
      </div>
    );
  }

  return (
    <Button
      onClick={() => {
        const event = new CustomEvent('open-pro-upgrade');
        window.dispatchEvent(event);
      }}
      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold text-xs h-7 px-4 shadow-lg border-0 rounded-full mx-auto"
      style={{ width: 'fit-content' }}
    >
      <Crown className="h-3.5 w-3.5 mr-1.5 inline" />
      Upgrade Pro
    </Button>
  );
}
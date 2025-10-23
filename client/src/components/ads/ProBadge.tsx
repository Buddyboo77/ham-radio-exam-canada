import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ProBadge() {
  const isPro = localStorage.getItem('signalace-pro') === 'true';

  if (isPro) {
    return (
      <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-500/30">
        <Crown className="h-3 w-3 mr-1" />
        Pro
      </Badge>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => {
        const event = new CustomEvent('open-pro-upgrade');
        window.dispatchEvent(event);
      }}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs h-7 px-3"
    >
      <Crown className="h-3 w-3 mr-1" />
      Upgrade to Pro
    </Button>
  );
}
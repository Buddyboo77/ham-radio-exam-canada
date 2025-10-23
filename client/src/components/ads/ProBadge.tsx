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
      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold text-xs h-8 px-4 shadow-lg border-0 flex items-center gap-1.5 whitespace-nowrap"
    >
      <Crown className="h-4 w-4 flex-shrink-0" />
      <span>Upgrade to Pro</span>
    </Button>
  );
}
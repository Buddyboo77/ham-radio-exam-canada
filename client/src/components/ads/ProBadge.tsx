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
      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold text-[10px] h-7 px-2.5 shadow-lg border-0 flex items-center gap-1 whitespace-nowrap overflow-visible"
      style={{ minWidth: 'fit-content' }}
    >
      <Crown className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="inline-block">Upgrade</span>
    </Button>
  );
}
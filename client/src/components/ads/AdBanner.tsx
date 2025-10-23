import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

export function AdBanner({ slot = '0000000000', format = 'auto', className = '' }: AdBannerProps) {
  const isPro = localStorage.getItem('signalace-pro') === 'true';
  
  if (isPro) {
    return null;
  }

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`ad-container text-center my-4 ${className}`}>
      <p className="text-xs text-gray-500 mb-1">Advertisement</p>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-0000000000000000"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

export function AdSquare({ className = '' }: { className?: string }) {
  const isPro = localStorage.getItem('signalace-pro') === 'true';
  
  if (isPro) {
    return null;
  }

  return (
    <div className={`ad-container text-center my-4 ${className}`}>
      <p className="text-xs text-gray-500 mb-1">Advertisement</p>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 flex items-center justify-center">
        <p className="text-gray-400 text-sm">
          Ad Space (300x250)
        </p>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        <button 
          onClick={() => {
            const event = new CustomEvent('open-pro-upgrade');
            window.dispatchEvent(event);
          }}
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Remove ads with Pro
        </button>
      </p>
    </div>
  );
}
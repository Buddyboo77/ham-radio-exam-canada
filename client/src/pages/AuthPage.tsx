import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Radio, RadioTower } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, login } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = () => {
    login();
    setLocation('/learning');
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="text-center w-full">
        <div className="flex justify-center mb-2">
          <Radio className="h-10 w-10 text-blue-500" />
        </div>
        <h1 className="text-lg font-bold text-blue-300 mb-1">SignalAce Canada</h1>
        <p className="text-gray-400 text-xs mb-3">Canadian Ham Radio License Exam Prep</p>
        
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-md mb-3">
          <div className="flex items-center justify-center mb-2">
            <RadioTower className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-300">Study & Practice</span>
          </div>
          <p className="text-gray-300 text-xs mb-3">
            Practice exams, Morse code training, 
            and study guides for your Canadian amateur radio license.
          </p>
          <Button 
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
          >
            Enter Application
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 mb-2">
          <p>Canadian Amateur Radio Exam Preparation</p>
        </div>

        <div className="flex justify-center gap-3 py-2 border-t border-gray-700">
          <Link href="/privacy">
            <span className="text-blue-400 hover:text-blue-300 cursor-pointer text-sm underline">Privacy</span>
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/terms">
            <span className="text-blue-400 hover:text-blue-300 cursor-pointer text-sm underline">Terms</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
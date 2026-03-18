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
    <div className="flex flex-col items-center justify-center p-2 min-h-screen">
      <div className="text-center w-full max-w-sm">
        <div className="flex justify-center mb-1">
          <Radio className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-base font-bold text-blue-300 mb-1">Ham Radio Exam Canada</h1>
        <p className="text-gray-400 text-xs mb-2">Ham Radio License Exam Prep</p>
        
        <div className="bg-gray-800 p-2 rounded border border-gray-700 mb-2">
          <p className="text-gray-300 text-xs mb-2">
            Practice exams, Morse code & study guides for Canadian amateur radio license.
          </p>
          <Button 
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
          >
            Enter Application
          </Button>
        </div>

        <div className="flex justify-center gap-3 py-2 border-t border-gray-700 mt-2">
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
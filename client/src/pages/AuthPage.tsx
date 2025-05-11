import { useEffect } from 'react';
import { useLocation } from 'wouter';
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
    setLocation('/frequencies');
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="text-center mb-4">
        <div className="flex justify-center mb-2">
          <Radio className="h-12 w-12 text-blue-500" />
        </div>
        <h1 className="text-xl font-bold text-blue-300 mb-1">Powell River Amateur Radio</h1>
        <p className="text-gray-400 text-sm mb-4">Your complete ham radio companion app</p>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md mb-4">
          <div className="flex items-center justify-center mb-3">
            <RadioTower className="h-6 w-6 text-green-500 mr-2" />
            <span className="text-lg font-medium text-green-300">VA7HAM</span>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Welcome to the Powell River Amateur Radio Companion app. 
            Click the button below to access essential resources, maps,
            frequency listings, and community information.
          </p>
          <Button 
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enter Application
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>Powell River Amateur Radio Club</p>
          <p>British Columbia, Canada</p>
        </div>
      </div>
    </div>
  );
}
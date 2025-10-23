import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import FrequenciesPage from "@/pages/FrequenciesPage";
import ScannerPage from "@/pages/ScannerPage";
import RepeatersPage from "@/pages/RepeatersPage";
import LogbookPage from "@/pages/LogbookPage";
import ReferencePage from "@/pages/ReferencePage";
import LearningPage from "@/pages/LearningPage";
import EnhancedLearningPage from "@/pages/EnhancedLearningPage";
import LocalInfoPage from "@/pages/LocalInfoPage";
import CallsignLookupPage from "@/pages/CallsignLookupPage";
import PropagationPage from "@/pages/PropagationPage";
import DXClusterPage from "@/pages/DXClusterPage";
import EnhancedMapPage from "@/pages/EnhancedMapPage";
import ARViewPage from "@/pages/ARViewPage";
import CommunicationPage from "@/pages/CommunicationPage";
import MorseCodePage from "@/pages/MorseCodePage";
import AuthPage from "@/pages/AuthPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import TestGamification from "@/pages/TestGamification";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProUpgradeModal } from "@/components/ads/ProUpgradeModal";
import { ProBadge } from "@/components/ads/ProBadge";

import { useState, useEffect } from "react";
import { 
  Radio, 
  BookOpen, 
  Layers, 
  BarChart4, 
  FileText, 
  Map, 
  Wifi, 
  BookOpenCheck,
  Battery,
  SignalHigh,
  Menu,
  Power,
  Users,
  RadioTower,
  Home as HomeIcon,
  User,
  Sun,
  Globe,
  Compass,
  MessageSquare
} from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { QuickAccessMenu } from "@/components/layout/QuickAccessMenu";

function formatTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function Router() {
  const [location, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(formatTime());
  const [batteryLevel, setBatteryLevel] = useState(80);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isOnline = useOnlineStatus();
  
  // Update the time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Routes mapping - focusing only on learning modules
  const routes = [
    { path: "/learning", label: "Learning", icon: <BookOpenCheck size={18} /> },
    { path: "/morse-code", label: "Morse Code", icon: <Radio size={18} /> },
    { path: "/reference", label: "Reference", icon: <BookOpen size={18} /> },
  ];
  
  // Auth-aware routing
  const { isAuthenticated, logout } = useAuth();
  
  // Redirect only unauthenticated users from root to auth page
  useEffect(() => {
    if (location === "/" && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [location, setLocation, isAuthenticated]);
  
  const activeRoute = routes.find(route => route.path === location) || routes[0];
  
  return (
    <div className="flex flex-col h-screen mx-auto pb-4 max-w-md relative pt-14">
      {/* Our QuickAccessMenu is now our main navigation */}
      
      <div className="radio-body relative overflow-hidden">
        {/* Antenna */}
        <div className="antenna"></div>
        
        {/* Top status bar with time and battery */}
        <div className="flex justify-between items-center mb-2 px-2 relative">
          <div className="text-gray-400 font-mono text-xs flex items-center gap-2">
            <Power size={12} className={isOnline ? "text-green-500" : "text-red-500"} />
            <span>{currentTime}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4].map(bar => (
                <div 
                  key={bar} 
                  className={`signal-bar ${isOnline && bar <= 3 ? 'active' : ''}`}
                ></div>
              ))}
            </div>
            <div className="flex items-center text-gray-400 text-xs font-mono">
              <Battery size={12} className="mr-1" />
              <span>{batteryLevel}%</span>
            </div>
          </div>
          
          {/* Pro upgrade button - floating over status bar */}
          <div className="absolute left-1/2 -translate-x-1/2 top-6 z-50 flex justify-center">
            <ProBadge />
          </div>
        </div>
        
        {/* Radio screen */}
        <div className="radio-screen relative">
          {/* Hidden display header - keeping blank space for layout consistency */}
          <div className="p-1"></div>
          
          {/* Main content area */}
          <div className="flex-1 overflow-y-auto max-h-[70vh]">
            <Switch>
              <Route path="/auth" component={AuthPage} />
              
              <ProtectedRoute path="/">
                <EnhancedLearningPage />
              </ProtectedRoute>
              
              <ProtectedRoute path="/learning">
                <EnhancedLearningPage />
              </ProtectedRoute>
              
              <ProtectedRoute path="/morse-code">
                <MorseCodePage />
              </ProtectedRoute>
              
              <ProtectedRoute path="/reference">
                <ReferencePage />
              </ProtectedRoute>
              
              <Route path="/privacy" component={PrivacyPolicyPage} />
              <Route path="/terms" component={TermsOfServicePage} />
              <Route path="/test-gamification" component={TestGamification} />
              
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
        
        {/* Radio buttons/controls at bottom */}
        <div className="mt-4">
          {/* Menu toggle button */}
          <div className="flex justify-center mb-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="radio-button-large bg-gradient-to-b from-gray-700 to-gray-800"
            >
              <Menu size={22} className="text-blue-100" />
            </button>
          </div>
          
          {/* Navigation buttons */}
          <div className={`grid grid-cols-3 gap-3 mt-1 transition-all duration-300 ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none absolute'}`}>
            {routes.map(route => (
              <Link 
                key={route.path} 
                href={route.path}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className={`radio-nav-button ${location === route.path ? 'active' : ''}`}>
                  {route.icon}
                  <span className="text-xs">{route.label}</span>
                </div>
              </Link>
            ))}
            
            {/* Logout button */}
            <div 
              onClick={() => {
                logout();
                setLocation('/auth');
                setIsMenuOpen(false);
              }}
              className="radio-nav-button bg-red-900 hover:bg-red-800"
            >
              <Power size={18} />
              <span className="text-xs">Logout</span>
            </div>
          </div>
          
          {/* No guidance message needed with simplified interface */}
          
          {/* Radio station identifier - simplified, no quick access buttons */}
          <div className={`flex justify-center items-center mt-2 transition-all duration-300 ${!isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none absolute'}`}>
            <div className="radio-frequency-display flex-1 text-center">
              Ham Radio License Exam Prep <Radio className="inline-block ml-1 mr-1" size={14} /> VA7HAM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ProUpgradeModal />
        <AuthProvider>
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

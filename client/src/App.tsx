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
import LocalInfoPage from "@/pages/LocalInfoPage";

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
  Home as HomeIcon
} from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";

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
  
  // Routes mapping
  const routes = [
    { path: "/frequencies", label: "Frequencies", icon: <Layers size={18} /> },
    { path: "/scanner", label: "Scanner", icon: <BarChart4 size={18} /> },
    { path: "/repeaters", label: "Repeaters", icon: <Map size={18} /> },
    { path: "/logbook", label: "Logbook", icon: <FileText size={18} /> },
    { path: "/reference", label: "Reference", icon: <BookOpen size={18} /> },
    { path: "/learning", label: "Learning", icon: <BookOpenCheck size={18} /> },
    { path: "/local-info", label: "Powell River", icon: <RadioTower size={18} /> },
  ];
  
  // If at root, redirect to frequencies
  useEffect(() => {
    if (location === "/") {
      setLocation("/frequencies");
    }
  }, [location, setLocation]);
  
  const activeRoute = routes.find(route => route.path === location) || routes[0];
  
  return (
    <div className="flex flex-col h-screen mx-auto pb-4 max-w-md relative pt-4">
      {/* TOP NAV BUTTONS */}
      <div className="sticky top-0 z-50 mb-2 mx-2 p-1 bg-black bg-opacity-70 rounded-md">
        <div className="flex gap-2 items-center">
          {/* HOME BUTTON */}
          <Link href="/frequencies">
            <button className="bg-green-600 hover:bg-green-500 p-3 rounded-md flex items-center gap-2 border-2 border-green-400 shadow-glow-green">
              <HomeIcon size={20} className="text-white" />
              <span className="text-white font-bold">HOME</span>
            </button>
          </Link>
          
          {/* LEARNING BUTTON */}
          <Link href="/learning" className="flex-1">
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-md flex items-center justify-center gap-3 border-2 border-blue-400 shadow-glow-blue animate-pulse">
              <BookOpenCheck size={24} className="text-blue-100" />
              <span className="text-white font-bold text-lg">LEARNING CENTER</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </button>
          </Link>
        </div>
      </div>
      
      <div className="radio-body relative overflow-hidden">
        {/* Antenna */}
        <div className="antenna"></div>
        
        {/* Top status bar with time and battery */}
        <div className="flex justify-between items-center mb-2 px-2">
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
        </div>
        
        {/* Radio screen */}
        <div className="radio-screen relative">
          {/* Display header with blue glow */}
          <div className="bg-blue-900 bg-opacity-30 rounded-t-md p-2 mb-2 border-b border-blue-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <div className="radio-led green"></div>
                <span className="text-blue-100 font-semibold text-sm uppercase tracking-wider">
                  {activeRoute.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <SignalHigh size={14} className="text-blue-400" />
                <span className="font-mono text-blue-300 text-xs">VA7HAM</span>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 overflow-y-auto max-h-[70vh]">
            <Switch>
              <Route path="/frequencies" component={() => <FrequenciesPage />} />
              <Route path="/scanner" component={() => <ScannerPage />} />
              <Route path="/repeaters" component={() => <RepeatersPage />} />
              <Route path="/logbook" component={() => <LogbookPage />} />
              <Route path="/reference" component={() => <ReferencePage />} />
              <Route path="/learning" component={() => <LearningPage />} />
              <Route path="/local-info" component={() => <LocalInfoPage />} />
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
          </div>
          
          {/* Radio title message */}
          <div className="flex justify-center mt-2 mb-2 text-center">
            <div className="text-xs text-blue-300 font-mono px-2 py-1 bg-black rounded-sm">
              Press the blue LEARNING CENTER button at top ⬆️
            </div>
          </div>
          
          {/* Quick access buttons */}
          <div className={`flex justify-between items-center gap-2 mt-2 transition-all duration-300 ${!isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none absolute'}`}>
            <div className="radio-frequency-display flex-1">
              Powell River Amateur Radio <Radio className="inline-block ml-1 mr-1" size={14} /> VA7HAM
            </div>
            
            <div className="flex items-center">
              {/* Quick local info button */}
              <Link href="/local-info" className="flex items-center gap-2 bg-purple-800 hover:bg-purple-700 px-2 py-1 rounded-md border border-purple-600">
                <RadioTower size={16} className="text-purple-100" />
                <span className="text-xs text-white">Powell River</span>
              </Link>
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

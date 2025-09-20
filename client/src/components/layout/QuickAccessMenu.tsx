import { Link, useLocation } from 'wouter';
import { Radio, BookOpen, GraduationCap, Home } from 'lucide-react';

export function QuickAccessMenu() {
  const [currentLocation] = useLocation();

  const isActive = (path: string) => currentLocation === path;

  return (
    <div className="z-50 w-full bg-gray-900 border-b border-gray-700 shadow-md">
      <div className="max-w-screen-lg mx-auto px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Radio className="h-5 w-5 text-blue-300 mr-2" />
            <h1 className="text-sm font-semibold text-white">Canadian Ham Radio Exam Prep</h1>
          </div>
          
          <div className="flex gap-1">
            <Link href="/">
              <button 
                className={`h-7 rounded-md ${isActive('/') ? 'bg-green-700' : 'bg-gray-800/70'} hover:bg-green-700 flex items-center justify-center border ${isActive('/') ? 'border-green-500' : 'border-gray-700'} shadow-sm px-2 py-1`}
                title="Home Dashboard"
              >
                <Home size={12} className="text-gray-100" />
              </button>
            </Link>
            
            <Link href="/learning">
              <button 
                className={`h-7 rounded-md ${isActive('/learning') ? 'bg-blue-700' : 'bg-gray-800/70'} hover:bg-blue-700 flex items-center justify-center border ${isActive('/learning') ? 'border-blue-500' : 'border-gray-700'} shadow-sm px-2 py-1`}
                title="Practice Exam"
              >
                <GraduationCap size={12} className="text-gray-100" />
              </button>
            </Link>
            
            <Link href="/morse-code">
              <button 
                className={`h-7 rounded-md ${isActive('/morse-code') ? 'bg-orange-700' : 'bg-gray-800/70'} hover:bg-orange-700 flex items-center justify-center border ${isActive('/morse-code') ? 'border-orange-500' : 'border-gray-700'} shadow-sm px-2 py-1`}
                title="Morse Code Training"
              >
                <Radio size={12} className="text-gray-100" />
              </button>
            </Link>
            
            <Link href="/reference">
              <button 
                className={`h-7 rounded-md ${isActive('/reference') ? 'bg-purple-700' : 'bg-gray-800/70'} hover:bg-purple-700 flex items-center justify-center border ${isActive('/reference') ? 'border-purple-500' : 'border-gray-700'} shadow-sm px-2 py-1`}
                title="Study Guide & Reference"
              >
                <BookOpen size={12} className="text-gray-100" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Award, 
  ChevronDown, 
  ChevronRight, 
  Medal, 
  Star, 
  Zap, 
  BookOpenCheck,
  Brain,
  Radio,
  Cpu,
  Calendar,
  Trophy,
  BadgeCheck,
  Clock,
  BookOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { useLearningProgress } from '@/hooks/use-learning-progress';

// Badge type
interface BadgeType {
  id: string;
  name: string;
  description: string;
  acquired: boolean;
  date?: string;
  icon: React.ReactNode;
  color: string;
  category: 'achievement' | 'mastery' | 'activity';
}

// Detail dialog for badges
const BadgeDetailDialog = ({ badge }: { badge: BadgeType }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="absolute top-0 right-0 p-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400 hover:text-gray-300"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <span className={`text-${badge.color}-400`}>
              {badge.icon}
            </span>
            {badge.name}
            {badge.acquired && (
              <CheckCircle className="ml-2 text-green-500 h-5 w-5" />
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {badge.category === 'achievement' && 'Achievement Badge'}
            {badge.category === 'mastery' && 'Mastery Badge'}
            {badge.category === 'activity' && 'Activity Badge'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-300">{badge.description}</p>
          
          {badge.acquired ? (
            <div className="bg-green-900 bg-opacity-30 p-3 rounded-md border border-green-800">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-green-300 font-medium">Acquired!</div>
                  {badge.date && (
                    <div className="text-green-400 text-xs">
                      On {new Date(badge.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-gray-400" />
                <div className="text-gray-300">Not yet acquired</div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button className="bg-gray-800 hover:bg-gray-700">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main component
interface ProgressBadgesProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export default function ProgressBadges({ collapsed = false, onToggleCollapsed }: ProgressBadgesProps) {
  const { progress } = useLearningProgress();

  // Helper function to map badge data
  const mapBadgeData = (): BadgeType[] => {
    if (!progress) return [];
    
    // Map progress badges to display badges
    return progress.badges.map(badge => {
      let icon = <Award />;
      let color = 'blue';
      let category: 'achievement' | 'mastery' | 'activity' = 'achievement';
      
      // Assign icon and color based on badge id
      switch (badge.id) {
        case 'first-quiz':
          icon = <BookOpenCheck />;
          color = 'green';
          break;
        case 'quiz-master':
          icon = <Award />;
          color = 'yellow';
          category = 'mastery';
          break;
        case 'technical-expert':
          icon = <Cpu />;
          color = 'indigo';
          category = 'mastery';
          break;
        case 'regulations-expert':
          icon = <BookOpen />;
          color = 'blue';
          category = 'mastery';
          break;
        case 'operating-expert':
          icon = <Radio />;
          color = 'green';
          category = 'mastery';
          break;
        case 'flashcard-starter':
          icon = <Brain />;
          color = 'purple';
          break;
        case 'memory-master':
          icon = <Star />;
          color = 'yellow';
          category = 'mastery';
          break;
        case 'morse-beginner':
          icon = <Radio />;
          color = 'amber';
          break;
        case 'morse-expert':
          icon = <Zap />;
          color = 'amber';
          category = 'mastery';
          break;
        case 'circuit-builder':
          icon = <Cpu />;
          color = 'blue';
          break;
        case 'ham-dedication':
          icon = <Calendar />;
          color = 'pink';
          category = 'activity';
          break;
        case 'exam-ready':
          icon = <Trophy />;
          color = 'yellow';
          category = 'achievement';
          break;
      }
      
      return {
        ...badge,
        icon,
        color,
        category
      };
    });
  };
  
  const badges = mapBadgeData();
  const acquiredBadges = badges.filter(b => b.acquired);
  
  return (
    <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden">
      <div 
        className="p-3 flex items-center justify-between cursor-pointer"
        onClick={onToggleCollapsed}
      >
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-medium text-gray-200">
            Your Progress Badges
          </h3>
          <div className="bg-blue-900 text-blue-300 text-xs px-1.5 py-0.5 rounded">
            {acquiredBadges.length}/{badges.length}
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-300">
          {collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </button>
      </div>
      
      {!collapsed && badges.length > 0 && (
        <div className="p-3 pt-0">
          <Separator className="my-3 bg-gray-700" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {badges.map((badge) => (
              <div 
                key={badge.id} 
                className={`p-4 rounded-md relative flex flex-col items-center ${
                  badge.acquired 
                    ? `bg-${badge.color}-900 bg-opacity-20 border border-${badge.color}-800` 
                    : 'bg-gray-900 opacity-60 border border-gray-800'
                }`}
              >
                <BadgeDetailDialog badge={badge} />
                
                <div className={`text-${badge.color}-400 mb-2`}>
                  {badge.icon}
                </div>
                
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-300 mb-1">{badge.name}</div>
                  <div className="text-[10px] text-gray-400 line-clamp-2">{badge.description}</div>
                </div>
                
                {badge.acquired && (
                  <div className="absolute -top-1 -right-1 bg-green-700 rounded-full p-0.5">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Statistics section */}
          <div className="mt-4 bg-gray-900 rounded-md p-3 border border-gray-800">
            <h4 className="text-xs font-medium text-gray-300 mb-2">Progress Stats</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2 bg-gray-800 rounded border border-gray-700">
                <div className="text-xs text-gray-400">Quizzes</div>
                <div className="text-xl font-bold text-blue-400">{progress.completedQuizzes}</div>
              </div>
              <div className="p-2 bg-gray-800 rounded border border-gray-700">
                <div className="text-xs text-gray-400">Flashcards</div>
                <div className="text-xl font-bold text-green-400">{progress.flashcardsReviewed}</div>
              </div>
              <div className="p-2 bg-gray-800 rounded border border-gray-700">
                <div className="text-xs text-gray-400">Streak</div>
                <div className="text-xl font-bold text-amber-400">{progress.currentStreak} days</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m18 15-6-6-6 6"/>
    </svg>
  );
}
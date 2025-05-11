import { useState } from 'react';
import { 
  Award, 
  Star, 
  Calendar, 
  Radio, 
  Clock, 
  Zap, 
  BookOpen, 
  FileText, 
  Settings, 
  Cpu, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLearningProgress } from '@/hooks/use-learning-progress';
import { format } from 'date-fns';

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

// Enhance badge data with icons and colors
const enhanceBadges = (badges: any[]): BadgeType[] => {
  return badges.map(badge => {
    let icon;
    let color;
    let category: 'achievement' | 'mastery' | 'activity' = 'achievement';
    
    // Determine icon and color based on badge ID
    switch (badge.id) {
      case 'first-quiz':
        icon = <FileText />;
        color = 'bg-blue-900 border-blue-700';
        category = 'achievement';
        break;
      case 'perfect-score':
        icon = <Award />;
        color = 'bg-purple-900 border-purple-700';
        category = 'achievement';
        break;
      case 'study-streak-7':
        icon = <Calendar />;
        color = 'bg-green-900 border-green-700';
        category = 'activity';
        break;
      case 'morse-10wpm':
        icon = <Radio />;
        color = 'bg-amber-900 border-amber-700';
        category = 'mastery';
        break;
      case 'flashcard-master':
        icon = <BookOpen />;
        color = 'bg-blue-900 border-blue-700';
        category = 'mastery';
        break;
      case 'technical-expert':
        icon = <Cpu />;
        color = 'bg-indigo-900 border-indigo-700';
        category = 'mastery';
        break;
      case 'regulations-expert':
        icon = <FileText />;
        color = 'bg-red-900 border-red-700';
        category = 'mastery';
        break;
      case 'operating-expert':
        icon = <Radio />;
        color = 'bg-blue-900 border-blue-700';
        category = 'mastery';
        break;
      case 'all-rounder':
        icon = <Settings />;
        color = 'bg-amber-900 border-amber-700';
        category = 'achievement';
        break;
      case 'exam-ready':
        icon = <Star />;
        color = 'bg-yellow-900 border-yellow-700';
        category = 'achievement';
        break;
      default:
        icon = <Info />;
        color = 'bg-gray-800 border-gray-700';
        category = 'achievement';
    }
    
    return {
      ...badge,
      icon,
      color,
      category
    };
  });
};

// Badge detail dialog
const BadgeDetailDialog = ({ badge }: { badge: BadgeType }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="p-0 h-auto">
          <div className={`relative group cursor-pointer`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${badge.acquired ? badge.color : 'bg-gray-800 border-gray-700'} border-2`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-gray-900 ${badge.acquired ? 'text-gray-200' : 'text-gray-500'}`}>
                {badge.icon}
              </div>
            </div>
            <div className="text-xs text-center mt-1 font-medium">
              <span className={badge.acquired ? 'text-gray-200' : 'text-gray-500'}>
                {badge.name}
              </span>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${badge.color}`}>
              <div className="w-6 h-6 text-white">
                {badge.icon}
              </div>
            </div>
            <span>{badge.name}</span>
            {badge.acquired && (
              <Badge variant="outline" className="ml-2 bg-green-900 text-green-100 border-none">
                Acquired
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {badge.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {badge.acquired ? (
            <div className="bg-gray-900 p-3 rounded-md">
              <div className="text-xs text-gray-400 mb-1">Acquired on</div>
              <div className="font-mono text-sm text-blue-300">
                {badge.date ? format(new Date(badge.date), 'PPP') : 'Unknown date'}
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 p-3 rounded-md">
              <div className="text-xs text-gray-400 mb-1">Status</div>
              <div className="text-sm text-amber-300">Not yet acquired</div>
              <div className="mt-2 text-xs text-gray-300">
                Keep working on your ham radio skills to earn this badge!
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ProgressBadgesProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export default function ProgressBadges({ collapsed = false, onToggleCollapsed }: ProgressBadgesProps) {
  const { progress } = useLearningProgress();
  const badges = enhanceBadges(progress.badges);
  const [filterCategory, setFilterCategory] = useState<'all' | 'achievement' | 'mastery' | 'activity'>('all');
  
  const earnedBadges = badges.filter(b => b.acquired);
  const progress_percentage = badges.length > 0 ? Math.round((earnedBadges.length / badges.length) * 100) : 0;
  
  // Filter badges by category
  const filteredBadges = filterCategory === 'all' 
    ? badges 
    : badges.filter(b => b.category === filterCategory);
  
  return (
    <Card className="rounded-md overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" />
            Your Badges
          </CardTitle>
          {onToggleCollapsed && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleCollapsed} 
              className="h-7 w-7 p-0"
            >
              {collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </Button>
          )}
        </div>
        
        {!collapsed && (
          <CardDescription className="mt-1">
            Track your learning achievements and progress
          </CardDescription>
        )}
      </CardHeader>
      
      {!collapsed && (
        <>
          <CardContent className="space-y-4">
            {/* Progress overview */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-900 p-2 rounded-md">
                <div className="text-xs text-gray-400">Badges Earned</div>
                <div className="text-lg font-mono text-yellow-300">{earnedBadges.length}/{badges.length}</div>
              </div>
              <div className="bg-gray-900 p-2 rounded-md">
                <div className="text-xs text-gray-400">Study Streak</div>
                <div className="text-lg font-mono text-green-300">{progress.currentStreak} days</div>
              </div>
              <div className="bg-gray-900 p-2 rounded-md">
                <div className="text-xs text-gray-400">Completion</div>
                <div className="text-lg font-mono text-blue-300">{progress_percentage}%</div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress toward all badges</span>
                <span>{progress_percentage}%</span>
              </div>
              <Progress value={progress_percentage} className="h-2" />
            </div>
            
            {/* Category filters */}
            <div className="flex flex-wrap gap-1">
              <Badge 
                variant="outline" 
                className={`cursor-pointer hover:bg-gray-700 ${filterCategory === 'all' ? 'bg-gray-700 text-gray-100' : 'text-gray-400'}`}
                onClick={() => setFilterCategory('all')}
              >
                All
              </Badge>
              <Badge 
                variant="outline" 
                className={`cursor-pointer hover:bg-blue-900/50 ${filterCategory === 'achievement' ? 'bg-blue-900/50 text-blue-100' : 'text-gray-400'}`}
                onClick={() => setFilterCategory('achievement')}
              >
                Achievements
              </Badge>
              <Badge 
                variant="outline" 
                className={`cursor-pointer hover:bg-purple-900/50 ${filterCategory === 'mastery' ? 'bg-purple-900/50 text-purple-100' : 'text-gray-400'}`}
                onClick={() => setFilterCategory('mastery')}
              >
                Mastery
              </Badge>
              <Badge 
                variant="outline" 
                className={`cursor-pointer hover:bg-green-900/50 ${filterCategory === 'activity' ? 'bg-green-900/50 text-green-100' : 'text-gray-400'}`}
                onClick={() => setFilterCategory('activity')}
              >
                Activity
              </Badge>
            </div>
            
            {/* Badges grid */}
            <div className="grid grid-cols-4 gap-4">
              {filteredBadges.map(badge => (
                <BadgeDetailDialog key={badge.id} badge={badge} />
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="text-xs text-gray-400 italic pt-0">
            Earn more badges by completing learning modules and practicing your skills.
          </CardFooter>
        </>
      )}
      
      {collapsed && (
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="text-sm text-gray-300">Progress</div>
              <Progress value={progress_percentage} className="h-1.5 w-32" />
            </div>
            <div className="text-sm font-mono text-yellow-300">{earnedBadges.length}/{badges.length}</div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
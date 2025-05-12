import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ChevronDown, ChevronUp, Award, Calendar, Sparkles, Zap, Lock } from "lucide-react";
import { useLearningProgress } from '@/hooks/use-learning-progress';

interface ProgressBadgesProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export default function ProgressBadges({ collapsed = true, onToggleCollapsed }: ProgressBadgesProps) {
  const { progress } = useLearningProgress();
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'acquired' | 'unacquired'>('all');
  
  // Filter badges based on filter status
  const filteredBadges = progress?.badges.filter(badge => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'acquired') return badge.acquired;
    if (filterStatus === 'unacquired') return !badge.acquired;
    return true;
  }) || [];
  
  // Format a date nicely
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get icon for badge
  const getBadgeIcon = (badgeId: string) => {
    switch (badgeId) {
      case 'first-quiz':
      case 'perfect-score':
        return <GraduationCap className="h-6 w-6 text-yellow-400" />;
      case 'flashcard-master':
        return <Award className="h-6 w-6 text-purple-400" />;
      case 'morse-beginner':
      case 'morse-expert':
        return <Zap className="h-6 w-6 text-green-400" />;
      case 'circuit-builder':
        return <Sparkles className="h-6 w-6 text-blue-400" />;
      case 'study-streak':
        return <Calendar className="h-6 w-6 text-orange-400" />;
      default:
        return <Award className="h-6 w-6 text-gray-400" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-400" />
          Achievement Badges
        </h2>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-800 border-gray-700 text-gray-300"
          >
            Filter
            {showFilters ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
          </Button>
          
          {onToggleCollapsed && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleCollapsed}
              className="bg-gray-800 border-gray-700 text-gray-300"
            >
              {collapsed ? "Expand" : "Collapse"}
              {collapsed ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
      
      {showFilters && (
        <div className="flex gap-2 bg-gray-800 p-2 rounded-md">
          <Button 
            variant={filterStatus === 'all' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilterStatus('all')}
            className={filterStatus !== 'all' ? "bg-gray-900 border-gray-700 text-gray-300" : ""}
          >
            All
          </Button>
          <Button 
            variant={filterStatus === 'acquired' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilterStatus('acquired')}
            className={filterStatus !== 'acquired' ? "bg-gray-900 border-gray-700 text-gray-300" : ""}
          >
            Acquired
          </Button>
          <Button 
            variant={filterStatus === 'unacquired' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilterStatus('unacquired')}
            className={filterStatus !== 'unacquired' ? "bg-gray-900 border-gray-700 text-gray-300" : ""}
          >
            Unacquired
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-3">
        {filteredBadges.map((badge) => (
          <Card key={badge.id} className={`bg-gray-900 border-${badge.acquired ? 'yellow-800' : 'gray-700'} overflow-hidden`}>
            <div className={`h-1 w-full ${badge.acquired ? 'bg-yellow-500' : 'bg-gray-800'}`}></div>
            <div className="flex p-4">
              <div className={`flex-shrink-0 mr-4 p-3 rounded-md ${badge.acquired ? 'bg-gray-800' : 'bg-gray-800 bg-opacity-50'}`}>
                {badge.acquired ? (
                  getBadgeIcon(badge.id)
                ) : (
                  <Lock className="h-6 w-6 text-gray-500" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className={`text-base font-medium ${badge.acquired ? 'text-yellow-300' : 'text-gray-400'}`}>
                  {badge.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {badge.description}
                </p>
                {badge.acquired && badge.date && (
                  <div className="mt-1 text-xs text-gray-500">
                    Achieved on {formatDate(badge.date)}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {filteredBadges.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <Award className="h-12 w-12 mx-auto text-gray-700 mb-3" />
            <p>No badges match the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
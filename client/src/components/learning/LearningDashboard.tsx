import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Brain,
  Cpu,
  CalendarDays,
  BarChart3,
  Radio,
  AlertCircle,
  BookOpenCheck,
  MessageSquare,
  InfoIcon,
  Lightbulb,
  Zap,
  LineChart
} from 'lucide-react';

import { useLearningProgress } from '@/hooks/use-learning-progress';
import { useSpacedRepetition } from '@/hooks/use-spaced-repetition';

// Learning resource type
interface ClassResource {
  title: string;
  type: 'video' | 'article' | 'interactive' | 'course' | 'book';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  link: string;
  source: string;
  description: string;
}

// Current learning resources for ham radio
const LEARNING_RESOURCES: ClassResource[] = [
  {
    title: "Ham Radio Basics",
    type: "video",
    level: "beginner",
    duration: "20 min",
    link: "https://www.youtube.com/watch?v=1uClHuGG_WU",
    source: "Dave Casler KE0OG",
    description: "Introduction to amateur radio terminology and basic concepts."
  },
  {
    title: "Antenna Design Guide",
    type: "article",
    level: "beginner",
    duration: "15 min",
    link: "https://www.arrl.org/building-simple-antennas",
    source: "ARRL",
    description: "Guide to modern antenna designs including compact options for limited spaces."
  },
  {
    title: "Radio Wave Propagation",
    type: "interactive",
    level: "intermediate",
    duration: "25 min",
    link: "https://www.sws.bom.gov.au/HF_Systems/7/1",
    source: "Space Weather Services",
    description: "Interactive tools for propagation prediction and forecasting."
  },
  {
    title: "Morse Code Training",
    type: "course",
    level: "beginner",
    duration: "3 hours",
    link: "https://cwops.org/cw-academy/",
    source: "CW Academy",
    description: "Complete course for learning Morse code from scratch."
  },
  {
    title: "Software Defined Radio Guide",
    type: "book",
    level: "intermediate",
    duration: "6 hours",
    link: "https://www.arrl.org/software-defined-radio",
    source: "ARRL",
    description: "Comprehensive guide to SDR technology and applications in amateur radio."
  },
  {
    title: "Digital Modes Guide",
    type: "article",
    level: "intermediate",
    duration: "25 min",
    link: "https://www.arrl.org/digital-data-modes",
    source: "ARRL",
    description: "Overview of digital modes including FT8, JS8Call, and other protocols."
  },
  {
    title: "Canadian Amateur Radio Exam Prep",
    type: "course",
    level: "beginner",
    duration: "12 hours",
    link: "https://www.ic.gc.ca/eic/site/025.nsf/eng/h_00040.html",
    source: "Innovation, Science and Economic Development Canada",
    description: "Official study materials for the Canadian amateur radio certification."
  },
  {
    title: "Ham Radio Resources",
    type: "article",
    level: "beginner",
    duration: "5 min",
    link: "https://www.arrl.org/what-is-ham-radio",
    source: "ARRL",
    description: "General resources for ham radio operators and enthusiasts."
  }
];

export default function LearningDashboard() {
  // Hooks for progress data
  const { progress } = useLearningProgress();
  const { getStats } = useSpacedRepetition();
  
  // Get flashcard stats
  const flashcardStats = getStats();
  
  // Format a date string in a human-readable format
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate overall progress percentage
  const calculateOverallProgress = (): number => {
    if (!progress) return 0;
    
    const quizWeight = 0.4;
    const flashcardWeight = 0.4;
    const morseWeight = 0.2;
    
    // Calculate quiz progress
    let quizProgress = 0;
    if (progress.totalQuestions > 0) {
      quizProgress = (progress.totalCorrect / progress.totalQuestions) * 100;
    }
    
    // Calculate flashcard progress
    let flashcardProgress = 0;
    if (flashcardStats.total > 0) {
      flashcardProgress = (flashcardStats.mastered / flashcardStats.total) * 100;
    }
    
    // Calculate morse progress
    const morseLevels = 10; // Total number of morse lessons
    const morseProgress = (progress.morseLessonsCompleted / morseLevels) * 100;
    
    // Weighted average
    return (
      quizProgress * quizWeight +
      flashcardProgress * flashcardWeight +
      morseProgress * morseWeight
    );
  };
  
  // Get a learning recommendation based on progress
  const getLearningRecommendation = (): { title: string; description: string; icon: React.ReactNode } => {
    if (!progress) {
      return {
        title: "Start Your Learning Journey",
        description: "Begin with our beginner quizzes and flashcards to build your ham radio knowledge.",
        icon: <BookOpen className="h-12 w-12 text-blue-400" />
      };
    }
    
    // No quizzes completed yet
    if (progress.completedQuizzes === 0) {
      return {
        title: "Take Your First Quiz",
        description: "Start with a beginner-friendly quiz to test your knowledge of amateur radio basics.",
        icon: <BookOpenCheck className="h-12 w-12 text-green-400" />
      };
    }
    
    // No flashcards reviewed yet
    if (progress.flashcardsReviewed === 0) {
      return {
        title: "Try Flashcards",
        description: "Flashcards are a great way to memorize radio terms, Q-codes, and concepts.",
        icon: <Brain className="h-12 w-12 text-purple-400" />
      };
    }
    
    // No morse code practice yet
    if (progress.morseLessonsCompleted === 0) {
      return {
        title: "Learn Morse Code",
        description: "Morse code is a valuable skill for amateur radio operators. Start with the basics.",
        icon: <Radio className="h-12 w-12 text-amber-400" />
      };
    }
    
    // Circuit simulation if quiz and flashcard progress is good
    if (progress.completedQuizzes > 5 && progress.flashcardsReviewed > 20 && progress.badges.find(b => b.id === 'circuit-builder' && !b.acquired)) {
      return {
        title: "Try Circuit Simulation",
        description: "Put your knowledge into practice by building virtual circuits to understand radio electronics better.",
        icon: <Cpu className="h-12 w-12 text-blue-400" />
      };
    }
    
    // General recommendation for continued learning
    return {
      title: "Continue Your Journey",
      description: "You're making great progress! Try focusing on areas where you have lower scores or explore advanced topics.",
      icon: <Zap className="h-12 w-12 text-yellow-400" />
    };
  };
  
  // Component for resource cards with reliable link handling
  const ResourceCard = ({ resource }: { resource: ClassResource }) => {
    const handleResourceClick = () => {
      try {
        // Force window.open to bypass popup blockers with user interaction
        const newWindow = window.open(resource.link, '_blank');
        // Fallback if window.open is blocked
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Create a temporary link element and click it
          const link = document.createElement('a');
          link.href = resource.link;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error('Failed to open link:', err);
        // Last resort, try changing location directly
        window.location.href = resource.link;
      }
    };

    return (
      <div 
        onClick={handleResourceClick}
        className="bg-gray-900 p-3 rounded-md border border-gray-800 flex flex-col hover:bg-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="text-sm font-medium text-gray-200">{resource.title}</div>
          <Badge variant={
            resource.level === 'beginner' ? 'outline' :
            resource.level === 'intermediate' ? 'default' : 'secondary'
          }>
            {resource.level}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{resource.description}</p>
        <div className="mt-auto pt-2 flex justify-between items-center text-[10px] text-gray-500">
          <div className="flex items-center gap-1">
            {resource.type === 'video' && <Zap className="h-3 w-3" />}
            {resource.type === 'article' && <BookOpen className="h-3 w-3" />}
            {resource.type === 'interactive' && <Cpu className="h-3 w-3" />}
            {resource.type === 'course' && <BookOpenCheck className="h-3 w-3" />}
            {resource.type === 'book' && <BookOpen className="h-3 w-3" />}
            <span>{resource.type}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">{resource.duration}</span>
            <span className="text-blue-400">↗</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Progress recommendation component
  const Recommendation = () => {
    const rec = getLearningRecommendation();
    return (
      <Card className="bg-gray-900 border-gray-800 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-200 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            Learning Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-800 rounded-md">{rec.icon}</div>
            <div>
              <h4 className="text-base font-medium text-gray-100 mb-1">{rec.title}</h4>
              <p className="text-sm text-gray-400">{rec.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <Card className="bg-blue-900 bg-opacity-15 border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-100">Learning Progress</CardTitle>
          <CardDescription className="text-blue-200">
            Track your journey through ham radio knowledge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-blue-200">Overall Progress</span>
                <span className="text-sm text-blue-200">
                  {Math.round(calculateOverallProgress())}%
                </span>
              </div>
              <Progress value={calculateOverallProgress()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-900 bg-opacity-30 p-2 rounded-md flex flex-col items-center">
                <div className="text-sm font-medium text-blue-100 mb-1">Quizzes</div>
                <div className="text-2xl font-bold text-blue-50">{progress?.completedQuizzes || 0}</div>
                <div className="text-xs text-blue-200">
                  {progress?.totalQuestions ? `${progress.totalCorrect} / ${progress.totalQuestions} correct` : 'No attempts'}
                </div>
              </div>
              
              <div className="bg-purple-900 bg-opacity-30 p-2 rounded-md flex flex-col items-center">
                <div className="text-sm font-medium text-purple-100 mb-1">Flashcards</div>
                <div className="text-2xl font-bold text-purple-50">{progress?.flashcardsReviewed || 0}</div>
                <div className="text-xs text-purple-200">
                  {flashcardStats.mastered} mastered
                </div>
              </div>
              
              <div className="bg-amber-900 bg-opacity-30 p-2 rounded-md flex flex-col items-center">
                <div className="text-sm font-medium text-amber-100 mb-1">Morse WPM</div>
                <div className="text-2xl font-bold text-amber-50">{progress?.morseHighestWPM || 0}</div>
                <div className="text-xs text-amber-200">
                  {progress?.morseAccuracy > 0 ? `${Math.round(progress.morseAccuracy)}% accuracy` : 'No practice yet'}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1 text-blue-200">
                <CalendarDays className="h-3 w-3" />
                <span>Last study: {formatDate(progress?.lastStudyDate)}</span>
              </div>
              
              {progress?.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-green-300">
                  <Zap className="h-3 w-3" />
                  <span>{progress.currentStreak} day streak</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recommendation */}
      <Recommendation />
      
      {/* Learning Resources */}
      <div className="w-full">
        <h3 className="text-base font-medium text-gray-100 mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-400" />
          Learning Resources
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LEARNING_RESOURCES.map((resource, index) => (
              <ResourceCard key={index} resource={resource} />
            ))}
          </div>
          <div className="text-center">
            <Button 
              variant="outline" 
              className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 flex items-center gap-2"
              onClick={() => window.open("https://rac.ca/amateur-radio-links/", "_blank")}
            >
              <span>View More Resources</span>
              <span className="text-blue-400 text-xs">↗</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
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
  MapPin,
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

// Club events
interface ClubEvent {
  title: string;
  date: string;
  location: string;
  description: string;
  recurring?: string;
}

// Sample learning resources (with actual links)
const LEARNING_RESOURCES: ClassResource[] = [
  {
    title: "Amateur Radio Basics",
    type: "video",
    level: "beginner",
    duration: "15 min",
    link: "https://www.youtube.com/watch?v=vwPJ3NhOPoc",
    source: "Ham Radio 2.0",
    description: "Introduction to amateur radio terminology and basic concepts."
  },
  {
    title: "Understanding Antennas",
    type: "article",
    level: "beginner",
    duration: "10 min",
    link: "https://www.arrl.org/building-simple-antennas",
    source: "ARRL",
    description: "Learn about different types of antennas and their applications."
  },
  {
    title: "Radio Wave Propagation",
    type: "interactive",
    level: "intermediate",
    duration: "25 min",
    link: "https://www.sws.bom.gov.au/HF_Systems/7/1",
    source: "Space Weather Services",
    description: "Interactive resources about radio wave propagation through various atmospheric conditions."
  },
  {
    title: "Morse Code Fundamentals",
    type: "course",
    level: "beginner",
    duration: "3 hours",
    link: "https://cwops.org/cw-academy/",
    source: "CW Academy",
    description: "Complete beginner's course for learning Morse code from scratch."
  },
  {
    title: "Radio Electronics Essentials",
    type: "book",
    level: "intermediate",
    duration: "8 hours",
    link: "https://rac.ca/study-guides/",
    source: "RAC Publications",
    description: "In-depth guide to radio electronics, components and circuit design."
  },
  {
    title: "Digital Modes Explained",
    type: "video",
    level: "intermediate",
    duration: "45 min",
    link: "https://www.youtube.com/watch?v=WOb0X4b1DfU",
    source: "Digital Ham",
    description: "Overview of popular digital communication modes including FT8, RTTY, and PSK31."
  },
  {
    title: "Canadian Amateur Radio Exam Prep",
    type: "course",
    level: "beginner",
    duration: "10 hours",
    link: "https://www.ic.gc.ca/eic/site/025.nsf/eng/h_00040.html",
    source: "Innovation, Science and Economic Development Canada",
    description: "Official study materials for Canadian amateur radio operator certification."
  },
  {
    title: "Powell River Amateur Radio Club",
    type: "article",
    level: "beginner",
    duration: "5 min",
    link: "https://powellriverarc.ca/",
    source: "PRARC",
    description: "Resources and information specific to the Powell River Amateur Radio Club."
  }
];

// Powell River club events
const CLUB_EVENTS: ClubEvent[] = [
  {
    title: "PRARC Monthly Meeting",
    date: "Second Wednesday, 7:00pm",
    location: "Powell River",
    description: "Regular monthly meeting of the Powell River Amateur Radio Club",
    recurring: "monthly"
  },
  {
    title: "Coffee Social",
    date: "Saturdays, 10:00am",
    location: "A&W Restaurant",
    description: "Weekly informal gathering to chat about radio and more",
    recurring: "weekly"
  },
  {
    title: "qRD Emergency Communications Unit Net",
    date: "Thursdays, 6:30pm",
    location: "VE7PRR repeater",
    description: "Weekly net for emergency communications training",
    recurring: "weekly"
  },
  {
    title: "PRARC Sunday Evening Net",
    date: "Sundays, 8:00pm",
    location: "VE7PRR repeater",
    description: "Weekly club net with check-ins and announcements",
    recurring: "weekly"
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
  
  // Component for resource cards
  const ResourceCard = ({ resource }: { resource: ClassResource }) => (
    <a 
      href={resource.link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="bg-gray-900 p-3 rounded-md border border-gray-800 flex flex-col hover:bg-gray-800 hover:border-gray-700 transition-colors"
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
    </a>
  );
  
  // Component for event cards
  const EventCard = ({ event }: { event: ClubEvent }) => (
    <div className="bg-gray-900 p-3 rounded-md border border-gray-800">
      <div className="text-sm font-medium text-gray-200 mb-1">{event.title}</div>
      <div className="flex flex-col space-y-1 mb-2">
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <CalendarDays className="h-3 w-3 text-blue-400" />
          <span>{event.date}</span>
          {event.recurring && (
            <Badge variant="outline" className="text-[8px] h-4 ml-1">
              {event.recurring}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <MapPin className="h-3 w-3 text-red-400" />
          <span>{event.location}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400">{event.description}</p>
    </div>
  );
  
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
      
      {/* Tabs for resources and events */}
      <Tabs defaultValue="resources" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="resources" className="text-sm">Learning Resources</TabsTrigger>
          <TabsTrigger value="events" className="text-sm">Local Club Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resources" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LEARNING_RESOURCES.map((resource, index) => (
              <ResourceCard key={index} resource={resource} />
            ))}
          </div>
          <div className="text-center">
            <a 
              href="https://rac.ca/amateur-radio-links/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline" className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 flex items-center gap-2">
                <span>View More Resources</span>
                <span className="text-blue-400 text-xs">↗</span>
              </Button>
            </a>
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CLUB_EVENTS.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </div>
          
          <div className="bg-amber-900 bg-opacity-20 p-3 rounded-md border border-amber-800">
            <div className="flex items-start gap-2">
              <InfoIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-300 mb-1">Radio Gatherings</h4>
                <p className="text-xs text-amber-200">For the most up-to-date information on club events, please call on the VE7PRR repeater or contact a club member directly at (604) 485-6916.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
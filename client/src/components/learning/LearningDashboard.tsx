import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Radio, 
  FileText, 
  GraduationCap, 
  Award, 
  Zap, 
  BarChart4, 
  Brain, 
  Cpu, 
  Calculator,
  BookOpenCheck,
  LightbulbIcon,
  Clock,
  Lightbulb,
  PlayCircle,
  ExternalLink 
} from 'lucide-react';
import ProgressBadges from './ProgressBadges';
import { useLearningProgress } from '@/hooks/use-learning-progress';

// Learning journey steps
const LEARNING_JOURNEY = [
  {
    id: 'basics',
    title: 'Ham Radio Basics',
    description: 'Essential concepts for beginners',
    progress: 100,
    icon: <Radio className="h-5 w-5 text-blue-400" />,
    modules: [
      { name: 'Radio Waves & Propagation', completed: true },
      { name: 'Basic Equipment Overview', completed: true },
      { name: 'First Transmissions', completed: true }
    ]
  },
  {
    id: 'regulations',
    title: 'Canadian Regulations',
    description: 'Licensing requirements and rules',
    progress: 75,
    icon: <FileText className="h-5 w-5 text-amber-400" />,
    modules: [
      { name: 'License Structure', completed: true },
      { name: 'Frequency Allocations', completed: true },
      { name: 'Operating Procedures', completed: true },
      { name: 'Emergency Protocols', completed: false }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Knowledge',
    description: 'Electronics and radio theory',
    progress: 40,
    icon: <Cpu className="h-5 w-5 text-green-400" />,
    modules: [
      { name: 'Basic Electronics', completed: true },
      { name: 'Antenna Theory', completed: true },
      { name: 'Radio Circuits', completed: false },
      { name: 'Digital Modes', completed: false },
      { name: 'Troubleshooting', completed: false }
    ]
  },
  {
    id: 'operating',
    title: 'Operating Skills',
    description: 'Practical on-air techniques',
    progress: 60,
    icon: <BookOpenCheck className="h-5 w-5 text-purple-400" />,
    modules: [
      { name: 'Voice Operating', completed: true },
      { name: 'Morse Code Basics', completed: true },
      { name: 'Digital Mode Operation', completed: true },
      { name: 'Contest Operation', completed: false },
      { name: 'DX Operation', completed: false }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Topics',
    description: 'Complex radio concepts and techniques',
    progress: 20,
    icon: <GraduationCap className="h-5 w-5 text-red-400" />,
    modules: [
      { name: 'Advanced Propagation', completed: true },
      { name: 'EME & Satellite Operations', completed: false },
      { name: 'SDR Development', completed: false },
      { name: 'RF Design', completed: false },
      { name: 'Advanced Antenna Systems', completed: false }
    ]
  }
];

interface ClassResource {
  title: string;
  type: 'video' | 'article' | 'interactive' | 'course' | 'book';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  link: string;
  source: string;
  description: string;
}

// Educational resources
const LEARNING_RESOURCES: ClassResource[] = [
  {
    title: 'Understanding Antenna Basics',
    type: 'video',
    level: 'beginner',
    duration: '15 min',
    link: '#',
    source: 'Ham Radio Crash Course',
    description: 'An introduction to different antenna types and their applications.'
  },
  {
    title: 'Basic Electronics for Ham Radio',
    type: 'course',
    level: 'beginner',
    duration: '5 hours',
    link: '#',
    source: 'ARRL Learning Center',
    description: 'Learn the fundamentals of electronics necessary for ham radio operation.'
  },
  {
    title: 'Digital Modes Explained',
    type: 'article',
    level: 'intermediate',
    duration: '30 min',
    link: '#',
    source: 'QST Magazine',
    description: 'Overview of popular digital modes including FT8, PSK31, and RTTY.'
  },
  {
    title: 'Morse Code Training',
    type: 'interactive',
    level: 'beginner',
    duration: 'Self-paced',
    link: '#',
    source: 'LCWO.net',
    description: 'Progressive lessons to learn Morse code from scratch to 20 WPM.'
  },
  {
    title: 'HF Propagation and the Sun',
    type: 'video',
    level: 'intermediate',
    duration: '45 min',
    link: '#',
    source: 'K6LCS',
    description: 'How solar cycles affect HF radio propagation.'
  },
  {
    title: 'EME Communication Techniques',
    type: 'article',
    level: 'advanced',
    duration: '1 hour',
    link: '#',
    source: 'VE7BQH',
    description: 'Earth-Moon-Earth communication methods and equipment setup.'
  },
  {
    title: 'Canadian Basic Qualification Handbook',
    type: 'book',
    level: 'beginner',
    duration: 'Reference',
    link: '#',
    source: 'Radio Amateurs of Canada',
    description: 'The official study guide for the Canadian Basic Qualification exam.'
  },
  {
    title: 'Antenna Modeling with EZNEC',
    type: 'interactive',
    level: 'advanced',
    duration: '3 hours',
    link: '#',
    source: 'W7EL',
    description: 'Learn to model and optimize antennas using EZNEC software.'
  }
];

export default function LearningDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { progress, getNextRecommendation } = useLearningProgress();
  const recommendation = getNextRecommendation();
  
  const totalProgress = Math.round(
    LEARNING_JOURNEY.reduce((sum, journey) => sum + journey.progress, 0) / LEARNING_JOURNEY.length
  );
  
  // Filter resources by level
  const filterResourcesByLevel = (level: 'beginner' | 'intermediate' | 'advanced') => {
    return LEARNING_RESOURCES.filter(resource => resource.level === level);
  };
  
  // Resource card
  const ResourceCard = ({ resource }: { resource: ClassResource }) => (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          <span className="truncate">{resource.title}</span>
          <Badge 
            variant="outline" 
            className={`text-[10px] ml-1 ${
              resource.level === 'beginner' ? 'bg-blue-900/30 border-blue-800 text-blue-200' :
              resource.level === 'intermediate' ? 'bg-purple-900/30 border-purple-800 text-purple-200' :
              'bg-red-900/30 border-red-800 text-red-200'
            }`}
          >
            {resource.level.charAt(0).toUpperCase() + resource.level.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-xs text-gray-400">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            {resource.type === 'video' && <PlayCircle className="h-3 w-3 mr-1 text-red-400" />}
            {resource.type === 'article' && <FileText className="h-3 w-3 mr-1 text-blue-400" />}
            {resource.type === 'interactive' && <Zap className="h-3 w-3 mr-1 text-amber-400" />}
            {resource.type === 'course' && <GraduationCap className="h-3 w-3 mr-1 text-green-400" />}
            {resource.type === 'book' && <BookOpen className="h-3 w-3 mr-1 text-purple-400" />}
            <span>{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{resource.duration}</span>
          </div>
        </div>
        <p className="line-clamp-2 text-gray-300">{resource.description}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex items-center justify-between">
        <div className="text-[10px] text-gray-500">{resource.source}</div>
        <Button variant="ghost" size="sm" className="h-7 p-0 px-2">
          <ExternalLink className="h-3 w-3 mr-1" />
          <span className="text-xs">Open</span>
        </Button>
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Learning journey progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                Your Learning Journey
              </CardTitle>
              <CardDescription>
                Track your progress through the ham radio learning path
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall progress */}
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Total Progress</span>
                  <span>{totalProgress}%</span>
                </div>
                <Progress value={totalProgress} className="h-2" />
              </div>
              
              {/* Learning paths */}
              <div className="space-y-3">
                {LEARNING_JOURNEY.map(journey => (
                  <div key={journey.id} className="bg-gray-800 rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-900 p-1.5 rounded-md">
                          {journey.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-200">{journey.title}</h3>
                          <p className="text-xs text-gray-400">{journey.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-900/30 border-blue-800">
                        {journey.progress}%
                      </Badge>
                    </div>
                    <Progress value={journey.progress} className="h-1.5 mb-2" />
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-300">{journey.modules.filter(m => m.completed).length}</span>
                      <span> of </span>
                      <span className="text-gray-300">{journey.modules.length}</span>
                      <span> modules completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Personalized recommendation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-900 p-2 rounded-md">
                    {recommendation.type === 'quiz' && <FileText className="h-8 w-8 text-blue-300" />}
                    {recommendation.type === 'flashcard' && <BookOpen className="h-8 w-8 text-blue-300" />}
                    {recommendation.type === 'morse' && <Radio className="h-8 w-8 text-blue-300" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-300 mb-1">
                      {recommendation.type === 'quiz' && `Take a ${recommendation.category || 'practice'} quiz`}
                      {recommendation.type === 'flashcard' && 'Review flashcards'}
                      {recommendation.type === 'morse' && 'Practice Morse code'}
                    </h3>
                    <p className="text-xs text-gray-300">{recommendation.reason}</p>
                    <Button className="mt-2 bg-blue-800 hover:bg-blue-700 text-xs h-7" size="sm">
                      Start Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent activity summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between py-1 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-300">Completed Quiz: Technical</span>
                </div>
                <div className="text-xs text-gray-500">Today</div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-gray-300">Flashcard Review: 15 cards</span>
                </div>
                <div className="text-xs text-gray-500">Yesterday</div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-gray-300">Badge Earned: Consistent Learner</span>
                </div>
                <div className="text-xs text-gray-500">3 days ago</div>
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-gray-300">Morse Practice: 8 WPM</span>
                </div>
                <div className="text-xs text-gray-500">5 days ago</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-400" />
                Learning Resources
              </CardTitle>
              <CardDescription>
                Curated educational materials to enhance your ham radio skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Difficulty level tabs */}
              <Tabs defaultValue="beginner" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="beginner">Beginner</TabsTrigger>
                  <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="beginner" className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filterResourcesByLevel('beginner').map((resource, idx) => (
                      <ResourceCard key={`beginner-${idx}`} resource={resource} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="intermediate" className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filterResourcesByLevel('intermediate').map((resource, idx) => (
                      <ResourceCard key={`intermediate-${idx}`} resource={resource} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filterResourcesByLevel('advanced').map((resource, idx) => (
                      <ResourceCard key={`advanced-${idx}`} resource={resource} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="text-xs text-gray-400 italic">
              Resources are updated regularly to reflect the latest educational materials.
            </CardFooter>
          </Card>
          
          {/* Local exam info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                Exam Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="text-sm text-gray-200 mb-1">Powell River Amateur Radio Club Exam Session</div>
                <div className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>Second Wednesday monthly, 7:00pm</span>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>Powell River Recreation Complex, Room 3</span>
                </div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="text-sm text-gray-200 mb-1">Vancouver Island Amateur Radio Society</div>
                <div className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>First Saturday bimonthly, 1:00pm</span>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>Nanaimo, BC (120km south of Powell River, via ferry)</span>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3">
                <div className="text-xs text-blue-300 mb-1 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Exam Preparation Tip</span>
                </div>
                <p className="text-xs text-gray-300">
                  The Basic Qualification exam consists of 100 multiple-choice questions. 
                  You'll need 70% to pass, or 80% to earn Basic with Honours privileges including HF access.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements">
          <ProgressBadges />
        </TabsContent>
      </Tabs>
    </div>
  );
}
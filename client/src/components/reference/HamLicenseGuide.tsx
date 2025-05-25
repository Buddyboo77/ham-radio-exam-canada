import React, { useState } from "react";
import { 
  BookOpen, 
  GraduationCap, 
  Radio, 
  FileText, 
  Info, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight,
  Zap,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

const HamLicenseGuide: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  
  const toggleExpanded = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 rounded-md p-3 mb-4 border border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="text-blue-300" size={18} />
          <h3 className="text-sm font-medium text-blue-100">Canadian Amateur Radio License Guide</h3>
        </div>
        <p className="text-xs text-gray-300">
          This guide is designed to help you prepare for the Basic Qualification exam. 
          The Basic exam consists of 100 multiple-choice questions, and you need at least 70% to pass,
          or 80% to earn Basic with Honours privileges.
        </p>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="topics">Exam Topics</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="bg-gray-850 rounded-md p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-100 mb-2">Canadian Amateur Radio Qualifications</h3>
            <p className="text-xs text-gray-300 mb-3">
              Amateur radio operators in Canada are licensed by Innovation, Science and Economic Development Canada (ISED). 
              The following certifications are available:
            </p>
            
            <div className="space-y-3">
              <div className="bg-gray-900 p-3 rounded-md border border-gray-800">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Badge className="bg-green-800">Entry Level</Badge>
                    <h4 className="text-sm font-medium text-gray-200">Basic Qualification</h4>
                  </div>
                  <Badge variant="outline" className="text-xs">70% to Pass</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  The foundational certification that permits operation on VHF/UHF bands (above 30 MHz).
                  Limited HF privileges available.
                </p>
              </div>
              
              <div className="bg-gray-900 p-3 rounded-md border border-gray-800">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Badge className="bg-blue-800">Enhanced</Badge>
                    <h4 className="text-sm font-medium text-gray-200">Basic with Honours</h4>
                  </div>
                  <Badge variant="outline" className="text-xs">80% to Pass</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Achieved by scoring 80% or higher on the Basic exam, granting full HF privileges
                  and all amateur frequency bands.
                </p>
              </div>
              
              <div className="bg-gray-900 p-3 rounded-md border border-gray-800">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Badge className="bg-amber-800">Advanced</Badge>
                    <h4 className="text-sm font-medium text-gray-200">Advanced Qualification</h4>
                  </div>
                  <Badge variant="outline" className="text-xs">Separate Exam</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  An additional qualification focusing on technical knowledge, allowing
                  building and operating custom transmitters, higher power, and station sponsorship.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gray-850 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-300">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Learn the question pool</li>
                  <li>Take practice exams</li>
                  <li>Study theory and regulations</li>
                  <li>Join study groups</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/learning">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Go to Learning Center
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="bg-gray-850 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  Practice Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-300">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Timed exam simulations</li>
                  <li>Detailed explanations</li>
                  <li>Progress tracking</li>
                  <li>Custom topic focus</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/learning">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Take Practice Exam
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="topics" className="pt-4">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="regulations" className="bg-gray-850 rounded-md border border-gray-700">
              <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span>Regulations & Policies (25%)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-0">
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Canadian regulatory structure</li>
                  <li>• Licensing requirements and privileges</li>
                  <li>• Callsign format and usage</li>
                  <li>• Operating restrictions and guidelines</li>
                  <li>• Station identification requirements</li>
                  <li>• Frequency allocations for amateur service</li>
                  <li>• Third-party communications</li>
                  <li>• Emergency communications protocols</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="operating" className="bg-gray-850 rounded-md border border-gray-700">
              <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-green-400" />
                  <span>Operating Procedures (25%)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-0">
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Q-signals and phonetic alphabet</li>
                  <li>• Radio protocols and etiquette</li>
                  <li>• Calling procedures (CQ, etc.)</li>
                  <li>• Signal reports (RST system)</li>
                  <li>• Repeater operations</li>
                  <li>• Logbook keeping</li>
                  <li>• Interference identification and prevention</li>
                  <li>• Emergency procedures</li>
                  <li>• Digital modes operation</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="technical" className="bg-gray-850 rounded-md border border-gray-700">
              <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Technical Knowledge (50%)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-0">
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Basic electronic theory</li>
                  <li>• Ohm's Law and power calculations</li>
                  <li>• Component identification (resistors, capacitors, etc.)</li>
                  <li>• Circuit diagrams and symbols</li>
                  <li>• Radio wave propagation</li>
                  <li>• Antenna types and designs</li>
                  <li>• Feed lines and SWR concepts</li>
                  <li>• Transmitter and receiver principles</li>
                  <li>• Modulation types (AM, FM, SSB)</li>
                  <li>• Power supplies and batteries</li>
                  <li>• RF safety and exposure limits</li>
                  <li>• Grounding and lightning protection</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-4 pt-4">
          <div className="bg-gray-850 rounded-md p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-100 mb-2">Study Resources</h3>
            
            <div className="space-y-3">
              <div className="bg-gray-900 p-3 rounded-md border border-gray-800">
                <h4 className="text-sm font-medium text-gray-200 mb-1">Official Question Bank</h4>
                <p className="text-xs text-gray-400 mb-2">
                  The official Basic Question Bank contains all possible questions that can appear on the exam.
                </p>
                <a 
                  href="https://www.ic.gc.ca/eic/site/025.nsf/eng/h_00040.html" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Info className="h-3 w-3" />
                  Access on Innovation, Science and Economic Development Canada website
                </a>
              </div>
              
              <div className="bg-gray-900 p-3 rounded-md border border-gray-800">
                <h4 className="text-sm font-medium text-gray-200 mb-1">Radio Amateurs of Canada (RAC)</h4>
                <p className="text-xs text-gray-400 mb-2">
                  The national association for amateur radio in Canada provides study guides and resources.
                </p>
                <a 
                  href="https://www.rac.ca/amateur-radio-courses/" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Info className="h-3 w-3" />
                  Find courses and study materials on RAC website
                </a>
              </div>
              
              <div className="bg-gray-900 p-3 rounded-md border border-gray-800">
                <h4 className="text-sm font-medium text-gray-200 mb-1">Local Amateur Radio Clubs</h4>
                <p className="text-xs text-gray-400 mb-2">
                  Many local clubs offer courses, study sessions, and exam opportunities.
                </p>
                <p className="text-xs text-gray-400">
                  The Powell River Amateur Radio Club can provide local resources and exam sessions.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-900 bg-opacity-20 rounded-md p-3 border border-amber-800">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h4 className="text-sm font-medium text-amber-300">Ready for the Exam?</h4>
            </div>
            <p className="text-xs text-amber-200 mb-2">
              Once you feel prepared, contact an accredited examiner to schedule your test.
              You'll need government-issued photo ID for the exam.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/learning">
                <Button className="w-full text-xs bg-amber-800 hover:bg-amber-700 text-white">
                  Practice Exams
                </Button>
              </Link>
              <Link href="/morse-code">
                <Button variant="outline" className="w-full text-xs border-amber-700 text-amber-300 hover:bg-amber-900">
                  Morse Practice
                </Button>
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HamLicenseGuide;
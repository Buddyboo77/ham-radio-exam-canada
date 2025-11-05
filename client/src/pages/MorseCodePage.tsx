import { Radio, Music, Award, CheckCircle, Headphones, Home } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MorseCodeGame } from "@/components/games/MorseCodeGame";
import MorseCodeExam from "@/components/games/MorseCodeExam";
import EnhancedMorseCode from "@/components/reference/EnhancedMorseCode";
import { Link } from "wouter";

const MorseCodePage = () => {
  return (
    <div className="p-2">
      {/* Radio display header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              Morse Code Training
            </h2>
          </div>
          <button 
            className="text-xs text-green-300 hover:text-green-100 font-mono bg-green-900 px-2 py-0.5 rounded border border-green-800 flex items-center gap-1"
            data-testid="button-home"
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm('Are you sure you want to go home? Any in-progress training or exam will be lost.')) {
                window.location.href = '/';
              }
            }}
          >
            <Home size={10} /> HOME
          </button>
        </div>
      </div>
      
      {/* Main content area with radio styling */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        <Tabs defaultValue="exam" className="space-y-2">
          <TabsList className="grid grid-cols-3 h-auto p-1 bg-gray-900">
            <TabsTrigger value="exam" className="text-xs py-1 h-auto data-[state=active]:bg-blue-900">
              <div className="flex flex-col items-center gap-0.5">
                <CheckCircle className="h-3 w-3" />
                <span>Official Exam</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="game" className="text-xs py-1 h-auto data-[state=active]:bg-green-900">
              <div className="flex flex-col items-center gap-0.5">
                <Headphones className="h-3 w-3" />
                <span>Training</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="reference" className="text-xs py-1 h-auto data-[state=active]:bg-purple-900">
              <div className="flex flex-col items-center gap-0.5">
                <Music className="h-3 w-3" />
                <span>Reference</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          {/* Exam tab */}
          <TabsContent value="exam" className="space-y-4">
            <MorseCodeExam />
          </TabsContent>
          
          {/* Game tab */}
          <TabsContent value="game" className="space-y-4">
            <MorseCodeGame />
          </TabsContent>
          
          {/* Reference tab */}
          <TabsContent value="reference" className="space-y-4">
            <EnhancedMorseCode />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MorseCodePage;
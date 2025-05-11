import { useState } from 'react';
import ChatInterface from '@/components/communication/ChatInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio, MessageSquare, Wifi } from 'lucide-react';

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState('chat');
  
  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          <Card className="bg-gray-950 border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white">Ham Radio Communication</CardTitle>
                  <CardDescription>
                    Connect with operators in real-time
                  </CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                  <Wifi className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[600px]">
              <ChatInterface />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-1/3 space-y-6">
          <Card className="bg-gray-950 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">Communication Guide</CardTitle>
              <CardDescription>
                Tips for effective radio communication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                  <Radio className="h-4 w-4 text-blue-400" />
                  Calling Procedures
                </h3>
                <p className="text-sm text-gray-300">
                  Start with "CQ CQ CQ, this is [your callsign]" and repeat 2-3 times. Listen for responses before repeating.
                </p>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  Exchange Format
                </h3>
                <p className="text-sm text-gray-300">
                  Standard exchange includes callsign, signal report (RST), and location. Use the phonetic alphabet for clarity.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-white">Prowords & Common Terms</h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-gray-900 rounded-md">
                    <span className="font-bold text-gray-200">CQ</span>
                    <p className="text-gray-400">Calling any station</p>
                  </div>
                  
                  <div className="p-2 bg-gray-900 rounded-md">
                    <span className="font-bold text-gray-200">QTH</span>
                    <p className="text-gray-400">Your location</p>
                  </div>
                  
                  <div className="p-2 bg-gray-900 rounded-md">
                    <span className="font-bold text-gray-200">QSO</span>
                    <p className="text-gray-400">A conversation</p>
                  </div>
                  
                  <div className="p-2 bg-gray-900 rounded-md">
                    <span className="font-bold text-gray-200">QSL</span>
                    <p className="text-gray-400">Acknowledgment</p>
                  </div>
                  
                  <div className="p-2 bg-gray-900 rounded-md">
                    <span className="font-bold text-gray-200">73</span>
                    <p className="text-gray-400">Best regards</p>
                  </div>
                  
                  <div className="p-2 bg-gray-900 rounded-md">
                    <span className="font-bold text-gray-200">88</span>
                    <p className="text-gray-400">Love and kisses</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-950 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">Net Schedule</CardTitle>
              <CardDescription>
                Upcoming organized communication events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium text-white">PRARC Sunday Net</h3>
                  <span className="text-sm text-blue-400">20:00 Local</span>
                </div>
                <p className="text-sm text-gray-300">
                  Weekly check-in and announcements on VE7PRR repeater (146.68MHz, -0.6MHz offset, 141.3Hz tone)
                </p>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium text-white">Emergency Comm. Net</h3>
                  <span className="text-sm text-blue-400">Thu 18:30</span>
                </div>
                <p className="text-sm text-gray-300">
                  qRD Emergency Communications Unit practice net. Check-in for training and updates.
                </p>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium text-white">Digital Mode Practice</h3>
                  <span className="text-sm text-blue-400">Sat 14:00</span>
                </div>
                <p className="text-sm text-gray-300">
                  FT8, JS8Call, and Winlink practice. Frequency announcements on the repeater.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
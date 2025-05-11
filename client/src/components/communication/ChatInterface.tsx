import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Radio, Send, User, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useToast } from '@/hooks/use-toast';

export default function ChatInterface() {
  const { connected, messages, users, dxSpots, sendChatMessage, sendDXSpot, updateUserInfo } = useWebSocket();
  const [message, setMessage] = useState('');
  const [callsign, setCallsign] = useState('');
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of message list when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update username and callsign if set locally
  useEffect(() => {
    const storedCallsign = localStorage.getItem('userCallsign');
    const storedUsername = localStorage.getItem('userName');
    
    if (storedCallsign) {
      setCallsign(storedCallsign);
    }
    
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    if (connected && (storedCallsign || storedUsername)) {
      updateUserInfo({
        callsign: storedCallsign || undefined,
        username: storedUsername || undefined
      });
    }
  }, [connected, updateUserInfo]);

  // Handle sending chat message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (!connected) {
      toast({
        title: "Not connected",
        description: "Could not send message. Please check your connection.",
        variant: "destructive"
      });
      return;
    }
    
    sendChatMessage(message);
    setMessage('');
  };

  // Handle setting user info
  const handleSetUserInfo = () => {
    if (callsign) {
      localStorage.setItem('userCallsign', callsign);
    }
    
    if (username) {
      localStorage.setItem('userName', username);
    }
    
    if (connected) {
      updateUserInfo({
        callsign: callsign || undefined,
        username: username || undefined
      });
      
      toast({
        title: "Profile updated",
        description: "Your user information has been updated."
      });
    }
  };

  // Format timestamp to local time
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="p-3 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Real-Time Communication</h3>
        <div className="flex items-center gap-2">
          <Badge variant={connected ? "success" : "destructive"} className="h-6">
            {connected ? "Connected" : "Disconnected"}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 h-6">
            <Users className="h-3 w-3 text-blue-400" />
            <span>{users.length}</span>
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-2 grid w-auto grid-cols-3">
          <TabsTrigger value="chat" onClick={() => setActiveTab('chat')}>Chat</TabsTrigger>
          <TabsTrigger value="dx" onClick={() => setActiveTab('dx')}>DX Spots</TabsTrigger>
          <TabsTrigger value="profile" onClick={() => setActiveTab('profile')}>Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
          <ScrollArea className="flex-1 p-3">
            {messages
              .filter(msg => msg.type === 'CHAT_MESSAGE')
              .map((msg, index) => {
                if (msg.type !== 'CHAT_MESSAGE') return null;
                
                return (
                  <div key={index} className="mb-3">
                    <div className="flex items-start gap-2">
                      <div className="flex items-center">
                        <Badge variant="outline" className="h-6 py-0 px-1 mr-1">
                          {formatTime(msg.timestamp)}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="font-semibold text-white">{msg.username}</span>
                          {msg.callsign && (
                            <Badge variant="secondary" className="h-5 py-0">
                              {msg.callsign}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-300">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          <div className="p-3 border-t border-gray-800">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-gray-800 border-gray-700"
              />
              <Button onClick={handleSendMessage} disabled={!connected}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="dx" className="flex-1 flex flex-col p-0 m-0">
          <ScrollArea className="flex-1 p-3">
            {dxSpots.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                  <p>No DX spots available</p>
                </div>
              </div>
            ) : (
              <>
                {dxSpots.map((spot, index) => (
                  <div key={spot.id || index} className="mb-3 p-2 bg-gray-800 rounded-md border border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {spot.frequency.toFixed(3)} MHz
                        </Badge>
                        <Badge variant="secondary" className="font-semibold">
                          {spot.callsign}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatTime(spot.timestamp)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-300">
                        {spot.comment || 'No comment provided'}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <span className="text-xs">via</span>
                        <span className="font-semibold">{spot.spotter}</span>
                      </div>
                    </div>
                    <div className="mt-1 flex gap-1">
                      <Badge variant="outline" className="text-xs bg-gray-700">
                        {spot.mode || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </>
            )}
          </ScrollArea>
          
          <div className="p-3 border-t border-gray-800">
            <Button
              className="w-full"
              onClick={() => {
                // Open modal for adding a new DX spot
                // For now, we'll just show a toast
                toast({
                  title: "Coming soon",
                  description: "Ability to add DX spots will be available soon."
                });
              }}
            >
              Add New DX Spot
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="profile" className="flex-1 flex flex-col p-3">
          <div className="space-y-4">
            <div>
              <label htmlFor="callsign" className="block text-sm font-medium text-gray-300 mb-1">
                Callsign
              </label>
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-blue-400" />
                <Input
                  id="callsign"
                  placeholder="e.g. VE7XYZ"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Display Name
              </label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" />
                <Input
                  id="username"
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
            
            <Button onClick={handleSetUserInfo} className="w-full">
              Save Profile
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h4 className="font-medium text-gray-300 mb-3">Active Users</h4>
            <div className="grid grid-cols-2 gap-2">
              {users.length === 0 ? (
                <p className="text-gray-400 col-span-2">No active users</p>
              ) : (
                users.map((user, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-800 rounded-md">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Online now</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{user.username}</p>
                      {user.callsign && <p className="text-xs text-gray-400 truncate">{user.callsign}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
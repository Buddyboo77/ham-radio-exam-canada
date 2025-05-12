import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioTower, Radio, Calendar, Users, Satellite, Share2, MapPin } from 'lucide-react';

// Local Powell River Area Information
const AREA_INFO = {
  name: "Powell River Area",
  description: "Powell River is located on British Columbia's Sunshine Coast. The area offers diverse terrain for radio operation, from coastal areas to mountain peaks, providing interesting propagation effects for amateur radio operators."
};

// Local Nets Schedule
const LOCAL_NETS = [
  {
    name: "Powell River Morning Net",
    frequency: "146.680 MHz (-600 kHz offset, tone 141.3 Hz)",
    day: "Daily",
    time: "8:00 AM",
    description: "Daily check-in and local announcements",
    netController: "Various club members"
  },
  {
    name: "PRARC Sunday Evening Net",
    frequency: "147.200 MHz (+600 kHz offset, tone 141.3 Hz)",
    day: "Sunday",
    time: "8:00 PM",
    description: "Casual net with check-ins and open chat. All amateur radio operators welcome.",
    netController: "Lucy VA7KMB"
  },
  {
    name: "qRD Emergency Communications Unit Net",
    frequency: "147.200 MHz (+600 kHz offset, tone 141.3 Hz) and 444.025 MHz (+5 MHz, tone 141.3 Hz)",
    day: "Thursday",
    time: "6:30 PM",
    description: "Emergency communications readiness. Winlink check-ins welcome to VE7RZI.",
    netController: "Bill VE7RZI and Windy VE7AAK"
  },
  {
    name: "British Columbia Emergency Net",
    frequency: "3.729 MHz LSB",
    day: "Daily",
    time: "5:30 PM",
    description: "Provincial emergency preparedness net",
    netController: "Various provincial net controllers"
  }
];

// Local Frequencies of Interest
const LOCAL_FREQUENCIES = [
  {
    name: "VE7RPR Repeater (Powell River)",
    frequency: "146.680 MHz",
    offset: "-600 kHz",
    tone: "141.3 Hz",
    type: "FM",
    notes: "Main Powell River repeater, linked to VE7RPT"
  },
  {
    name: "VE7RPT Repeater (Texada Island)",
    frequency: "146.980 MHz",
    offset: "-600 kHz",
    tone: "141.3 Hz",
    type: "FM",
    notes: "Texada Island repeater, linked to VE7RPR"
  },
  {
    name: "VE7PRR Repeater",
    frequency: "147.200 MHz",
    offset: "+600 kHz",
    tone: "141.3 Hz",
    type: "FM",
    notes: "Sunday Evening Net and qRD Emergency Net"
  },
  {
    name: "VE7TIR Repeater",
    frequency: "444.025 MHz",
    offset: "+5.000 MHz",
    tone: "141.3 Hz",
    type: "FM",
    notes: "qRD Emergency Communications Unit Net"
  },
  {
    name: "Marine VHF Ch. 16",
    frequency: "156.800 MHz",
    offset: "None",
    tone: "None",
    type: "FM",
    notes: "Marine distress, safety and calling"
  },
  {
    name: "Weather VHF",
    frequency: "162.400 MHz",
    offset: "None",
    tone: "None",
    type: "FM",
    notes: "Environment Canada weather broadcasts"
  },
  {
    name: "National Simplex Calling",
    frequency: "146.520 MHz",
    offset: "None",
    tone: "None",
    type: "FM",
    notes: "National simplex calling frequency"
  }
];

// Local Amateur Radio Operators (fictional - for reference only)
const LOCAL_OPERATORS = [
  {
    callsign: "VE7ABC",
    name: "John Smith",
    interests: "Emergency communications, digital modes",
    location: "Powell River"
  },
  {
    callsign: "VE7XYZ",
    name: "Alice Johnson",
    interests: "DX, contesting, CW",
    location: "Westview"
  }
];

// Local Special Events
const LOCAL_EVENTS = [
  {
    name: "Coffee Meetup",
    date: "Every Saturday",
    location: "Newly renovated A&W in Powell River",
    description: "Informal coffee meetings at 10:00am. Everyone's welcome to bring friends and family."
  },
  {
    name: "Field Day",
    date: "Last full weekend in June",
    location: "Willingdon Beach",
    description: "Annual ARRL Field Day operations in a public location"
  },
  {
    name: "Winter Field Day",
    date: "Last weekend in January",
    location: "Powell River Recreation Complex",
    description: "Winter version of Field Day, focusing on emergency preparedness"
  },
  {
    name: "BC QSO Party",
    date: "First weekend in July",
    location: "Individual stations",
    description: "Annual British Columbia QSO Party contest"
  },
  {
    name: "Annual Club Picnic",
    date: "Second Saturday in August",
    location: "Willingdon Beach Park",
    description: "Social gathering with food, demonstrations, and activities"
  }
];

export default function LocalInfoPage() {
  const [activeTab, setActiveTab] = useState("frequencies");
  
  return (
    <div className="p-2">
      {/* Radio display header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              Powell River Radio Information
            </h2>
          </div>
        </div>
      </div>
      
      {/* Location and time display */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-900 rounded-md px-2 py-1 text-center border border-gray-700 flex items-center justify-center gap-1">
          <MapPin className="h-3 w-3 text-red-400" />
          <div className="text-[10px] text-gray-400">Powell River, BC, Canada</div>
        </div>
        <div className="bg-gray-900 rounded-md px-2 py-1 text-center border border-gray-700 flex items-center justify-center gap-1">
          <Radio className="h-3 w-3 text-yellow-400" />
          <div className="text-[10px] text-gray-400">VE7PRR 147.200 MHz</div>
        </div>
      </div>
      
      {/* Main content area with radio styling */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        <Tabs defaultValue="frequencies" value={activeTab} onValueChange={setActiveTab} className="space-y-2">
          <TabsList className="grid grid-cols-4 h-auto p-1 bg-gray-900">
            <TabsTrigger value="frequencies" className="text-[10px] py-1 h-auto data-[state=active]:bg-blue-900">
              <div className="flex flex-col items-center gap-0.5">
                <RadioTower className="h-3 w-3" />
                <span>Frequencies</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="nets" className="text-[10px] py-1 h-auto data-[state=active]:bg-green-900">
              <div className="flex flex-col items-center gap-0.5">
                <Radio className="h-3 w-3" />
                <span>Nets</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="club" className="text-[10px] py-1 h-auto data-[state=active]:bg-purple-900">
              <div className="flex flex-col items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                <span>Area Info</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="events" className="text-[10px] py-1 h-auto data-[state=active]:bg-amber-900">
              <div className="flex flex-col items-center gap-0.5">
                <Calendar className="h-3 w-3" />
                <span>Events</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          {/* Frequencies Tab */}
          <TabsContent value="frequencies" className="space-y-2">
            <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
              <div className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                <RadioTower className="h-3.5 w-3.5 mr-1.5" />
                Local Frequencies
              </div>
              <div className="rounded-md border border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-800">
                    <TableRow>
                      <TableHead className="text-[10px] text-blue-300 font-medium">Name</TableHead>
                      <TableHead className="text-[10px] text-blue-300 font-medium">Frequency</TableHead>
                      <TableHead className="text-[10px] text-blue-300 font-medium hidden sm:table-cell">Offset/Tone</TableHead>
                      <TableHead className="text-[10px] text-blue-300 font-medium hidden sm:table-cell">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LOCAL_FREQUENCIES.map((freq, index) => (
                      <TableRow key={index} className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-850"}>
                        <TableCell className="text-[10px] py-1 font-medium text-gray-300">{freq.name}</TableCell>
                        <TableCell className="text-[10px] py-1 font-mono text-yellow-300">{freq.frequency}</TableCell>
                        <TableCell className="text-[10px] py-1 hidden sm:table-cell">
                          <div className="font-mono text-gray-400">
                            {freq.offset !== "None" && <span>Offset: {freq.offset}</span>}
                            {freq.offset !== "None" && freq.tone !== "None" && <span> | </span>}
                            {freq.tone !== "None" && <span>Tone: {freq.tone}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] py-1 text-gray-400 hidden sm:table-cell">{freq.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-[9px] text-gray-500 mt-1">
                * Monitor 146.680 MHz for local Powell River activity
              </div>
            </div>
          </TabsContent>
          
          {/* Nets Tab */}
          <TabsContent value="nets" className="space-y-2">
            <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
              <div className="text-sm font-medium text-green-300 mb-2 flex items-center">
                <Radio className="h-3.5 w-3.5 mr-1.5" />
                Local Radio Nets
              </div>
              
              <div className="space-y-2">
                {LOCAL_NETS.map((net, index) => (
                  <div key={index} className="p-2 border border-gray-800 rounded-md bg-gray-850">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-xs text-green-200">{net.name}</div>
                      <Badge className="bg-green-900 text-[9px] h-4">{net.day} {net.time}</Badge>
                    </div>
                    <div className="text-[10px] font-mono text-yellow-300 mb-1">{net.frequency}</div>
                    <div className="text-[10px] text-gray-400">{net.description}</div>
                    <div className="text-[9px] text-gray-500 mt-1">Net Control: {net.netController}</div>
                  </div>
                ))}
              </div>
              
              <div className="text-[9px] text-gray-500 mt-2">
                * All times are Pacific Time (PT)
              </div>
            </div>
          </TabsContent>
          
          {/* Area Info Tab */}
          <TabsContent value="club" className="space-y-2">
            <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
              <div className="text-sm font-medium text-purple-300 mb-2 flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                {AREA_INFO.name}
              </div>
              
              <div className="p-2 border border-gray-800 rounded-md bg-gray-850 mb-2">
                <div className="text-[10px] text-gray-300 mb-1">{AREA_INFO.description}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Radio className="h-3 w-3 text-purple-400" />
                    <div className="text-[10px] text-gray-400">VHF/UHF Coverage: Excellent coastal propagation</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-purple-400" />
                    <div className="text-[10px] text-gray-400">Terrain: Coastal and mountainous</div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm font-medium text-purple-300 mb-2 flex items-center">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Local Operators
              </div>
              
              <div className="rounded-md border border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-800">
                    <TableRow>
                      <TableHead className="text-[10px] text-purple-300 font-medium">Callsign</TableHead>
                      <TableHead className="text-[10px] text-purple-300 font-medium">Name</TableHead>
                      <TableHead className="text-[10px] text-purple-300 font-medium">Location</TableHead>
                      <TableHead className="text-[10px] text-purple-300 font-medium hidden sm:table-cell">Interests</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LOCAL_OPERATORS.map((operator, index) => (
                      <TableRow key={index} className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-850"}>
                        <TableCell className="text-[10px] py-1 font-mono font-medium text-yellow-300">{operator.callsign}</TableCell>
                        <TableCell className="text-[10px] py-1 text-gray-300">{operator.name}</TableCell>
                        <TableCell className="text-[10px] py-1 text-gray-400">{operator.location}</TableCell>
                        <TableCell className="text-[10px] py-1 text-gray-400 hidden sm:table-cell">{operator.interests}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          {/* Events Tab */}
          <TabsContent value="events" className="space-y-2">
            <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
              <div className="text-sm font-medium text-amber-300 mb-2 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Special Events
              </div>
              
              <div className="space-y-2">
                {LOCAL_EVENTS.map((event, index) => (
                  <div key={index} className="p-2 border border-gray-800 rounded-md bg-gray-850">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-xs text-amber-200">{event.name}</div>
                      <Badge className="bg-amber-900 text-[9px] h-4">{event.date}</Badge>
                    </div>
                    <div className="text-[10px] font-medium text-gray-300 mb-1">Location: {event.location}</div>
                    <div className="text-[10px] text-gray-400">{event.description}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-2 p-2 border border-amber-900 bg-amber-900 bg-opacity-20 rounded-sm">
                <div className="text-xs text-amber-300 font-medium flex items-center mb-1">
                  <Radio className="h-3 w-3 mr-1" />
                  Join us on the air!
                </div>
                <div className="text-[10px] text-gray-300">
                  All amateur radio operators are welcome to join our events. Check in on the local repeater (146.680 MHz) for the latest information and coordination.
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
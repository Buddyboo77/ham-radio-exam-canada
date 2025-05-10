import { useState } from 'react';
import EventCalendar, { CalendarEvent } from '@/components/calendar/EventCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Radio, Users, Lightbulb } from 'lucide-react';

// Generate events from the existing club information, nets and special events
const generateEvents = (): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  
  // Add coffee meetup (every Saturday)
  const today = new Date();
  // Set to the closest Saturday for starting point
  const saturdayCoffeeDate = new Date(today);
  saturdayCoffeeDate.setDate(today.getDate() + (6 - today.getDay()) % 7);
  
  events.push({
    id: 'coffee-meetup',
    title: 'Coffee Meetup',
    date: saturdayCoffeeDate,
    time: '10:00 AM',
    type: 'social',
    location: 'Newly renovated A&W in Powell River',
    description: 'Informal coffee meetings. Everyone\'s welcome to bring friends and family.',
    repeats: 'weekly'
  });
  
  // Add PRARC Sunday Evening Net (weekly on Sunday)
  const sundayNetDate = new Date(today);
  sundayNetDate.setDate(today.getDate() + (7 - today.getDay()) % 7); // Next Sunday
  
  events.push({
    id: 'prarc-sunday-net',
    title: 'PRARC Sunday Evening Net',
    date: sundayNetDate,
    time: '8:00 PM',
    type: 'net',
    description: 'Casual net with check-ins and open chat. All amateur radio operators welcome.',
    frequency: '147.200 MHz (+600 kHz offset, tone 141.3 Hz)',
    repeats: 'weekly'
  });
  
  // Add qRD Emergency Communications Unit Net (weekly on Thursday)
  const thursdayNetDate = new Date(today);
  thursdayNetDate.setDate(today.getDate() + (4 - today.getDay() + 7) % 7); // Next Thursday
  
  events.push({
    id: 'qrd-emergency-net',
    title: 'qRD Emergency Communications Unit Net',
    date: thursdayNetDate,
    time: '6:30 PM',
    type: 'emergency',
    description: 'Emergency communications readiness. Winlink check-ins welcome to VE7RZI.',
    frequency: '147.200 MHz (+600 kHz, tone 141.3) and 444.025 MHz (+5 MHz, tone 141.3)',
    repeats: 'weekly'
  });
  
  // Add Powell River Morning Net (daily)
  const morningNetDate = new Date(today);
  events.push({
    id: 'morning-net',
    title: 'Powell River Morning Net',
    date: morningNetDate,
    time: '8:00 AM',
    type: 'net',
    description: 'Daily check-in and local announcements',
    frequency: '146.680 MHz (-600 kHz offset, tone 141.3 Hz)',
    repeats: 'daily'
  });
  
  // Add British Columbia Emergency Net (daily)
  const bcEmergencyNetDate = new Date(today);
  events.push({
    id: 'bc-emergency-net',
    title: 'British Columbia Emergency Net',
    date: bcEmergencyNetDate,
    time: '5:30 PM',
    type: 'emergency',
    description: 'Provincial emergency preparedness net',
    frequency: '3.729 MHz LSB',
    repeats: 'daily'
  });
  
  // Add PRARC Club Meetings (monthly on second Wednesday, September-June)
  const clubMeetingDate = new Date(today);
  // Set to current month's second Wednesday
  const currentMonth = clubMeetingDate.getMonth();
  clubMeetingDate.setDate(1); // Start with the 1st of the month
  
  // Find the first Wednesday
  while (clubMeetingDate.getDay() !== 3) { // 3 = Wednesday
    clubMeetingDate.setDate(clubMeetingDate.getDate() + 1);
  }
  
  // Move to the second Wednesday
  clubMeetingDate.setDate(clubMeetingDate.getDate() + 7);
  
  // Only add if it's September through June
  if (currentMonth >= 8 || currentMonth <= 5) { // 8 = September, 5 = June
    events.push({
      id: 'club-meeting',
      title: 'PRARC Club Meeting',
      date: clubMeetingDate,
      time: '7:00 PM',
      type: 'club',
      location: 'Powell River Recreation Complex',
      description: 'Monthly club meeting. Call on the repeater or 604-485-6916 to gain access.',
      repeats: 'monthly'
    });
  }
  
  // Add one-time special events
  // Field Day (last full weekend in June)
  const year = today.getFullYear();
  let fieldDayDate = new Date(year, 5, 30); // June 30
  while (fieldDayDate.getDay() !== 6) { // Find last Saturday in June
    fieldDayDate.setDate(fieldDayDate.getDate() - 1);
  }
  
  events.push({
    id: 'field-day',
    title: 'Field Day',
    date: fieldDayDate,
    type: 'contest',
    location: 'Willingdon Beach',
    description: 'Annual ARRL Field Day operations in a public location',
    repeats: 'none'
  });
  
  // Winter Field Day (last weekend in January)
  let winterFieldDayDate = new Date(year, 0, 31); // January 31
  while (winterFieldDayDate.getDay() !== 6) { // Find last Saturday in January
    winterFieldDayDate.setDate(winterFieldDayDate.getDate() - 1);
  }
  
  events.push({
    id: 'winter-field-day',
    title: 'Winter Field Day',
    date: winterFieldDayDate,
    type: 'contest',
    location: 'Powell River Recreation Complex',
    description: 'Winter version of Field Day, focusing on emergency preparedness',
    repeats: 'none'
  });
  
  // BC QSO Party (first weekend in July)
  let bcQsoPartyDate = new Date(year, 6, 1); // July 1
  while (bcQsoPartyDate.getDay() !== 6) { // Find first Saturday in July
    bcQsoPartyDate.setDate(bcQsoPartyDate.getDate() + 1);
  }
  
  events.push({
    id: 'bc-qso-party',
    title: 'BC QSO Party',
    date: bcQsoPartyDate,
    type: 'contest',
    description: 'Annual British Columbia QSO Party contest',
    repeats: 'none'
  });
  
  // Annual Club Picnic (second Saturday in August)
  let clubPicnicDate = new Date(year, 7, 1); // August 1
  // Find first Saturday
  while (clubPicnicDate.getDay() !== 6) {
    clubPicnicDate.setDate(clubPicnicDate.getDate() + 1);
  }
  // Move to second Saturday
  clubPicnicDate.setDate(clubPicnicDate.getDate() + 7);
  
  events.push({
    id: 'club-picnic',
    title: 'Annual Club Picnic',
    date: clubPicnicDate,
    type: 'social',
    location: 'Willingdon Beach Park',
    description: 'Social gathering with food, demonstrations, and activities',
    repeats: 'none'
  });
  
  return events;
};

// Create the events
const COMMUNITY_EVENTS = generateEvents();

// Filter events
const NET_EVENTS = COMMUNITY_EVENTS.filter(event => event.type === 'net');
const CLUB_EVENTS = COMMUNITY_EVENTS.filter(event => event.type === 'club' || event.type === 'social');
const SPECIAL_EVENTS = COMMUNITY_EVENTS.filter(event => event.type === 'contest');
const EMERGENCY_EVENTS = COMMUNITY_EVENTS.filter(event => event.type === 'emergency');

export default function CommunityCalendarPage() {
  const [activeTab, setActiveTab] = useState("all");
  
  // Determine which events to show based on active tab
  const eventsToShow = () => {
    switch (activeTab) {
      case 'nets': return NET_EVENTS;
      case 'club': return CLUB_EVENTS;
      case 'special': return SPECIAL_EVENTS;
      case 'emergency': return EMERGENCY_EVENTS;
      default: return COMMUNITY_EVENTS;
    }
  };
  
  return (
    <div className="p-2">
      {/* Radio display header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              Community Calendar
            </h2>
          </div>
        </div>
      </div>
      
      {/* Main content area with radio styling */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-2">
          <TabsList className="grid grid-cols-5 h-auto p-1 bg-gray-900">
            <TabsTrigger value="all" className="text-[10px] py-1 h-auto data-[state=active]:bg-blue-900">
              <div className="flex flex-col items-center gap-0.5">
                <CalendarIcon className="h-3 w-3" />
                <span>All</span>
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
                <Users className="h-3 w-3" />
                <span>Club</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="special" className="text-[10px] py-1 h-auto data-[state=active]:bg-amber-900">
              <div className="flex flex-col items-center gap-0.5">
                <CalendarIcon className="h-3 w-3" />
                <span>Special</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="text-[10px] py-1 h-auto data-[state=active]:bg-red-900">
              <div className="flex flex-col items-center gap-0.5">
                <Lightbulb className="h-3 w-3" />
                <span>Emergency</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          {/* All tabs share the same content with filtered events */}
          <TabsContent value="all" className="mt-2">
            <EventCalendar events={eventsToShow()} />
          </TabsContent>
          <TabsContent value="nets" className="mt-2">
            <EventCalendar events={eventsToShow()} />
          </TabsContent>
          <TabsContent value="club" className="mt-2">
            <EventCalendar events={eventsToShow()} />
          </TabsContent>
          <TabsContent value="special" className="mt-2">
            <EventCalendar events={eventsToShow()} />
          </TabsContent>
          <TabsContent value="emergency" className="mt-2">
            <EventCalendar events={eventsToShow()} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
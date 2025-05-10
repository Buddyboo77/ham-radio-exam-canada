import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Radio, Calendar as CalendarIcon, Users, Info } from "lucide-react";
import { addDays, format, getDay, isSameDay, startOfWeek, parseISO, isValid } from "date-fns";

// Event type definition
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  time?: string;
  type: 'net' | 'club' | 'contest' | 'social' | 'emergency';
  location?: string;
  description?: string;
  frequency?: string;
  repeats?: 'daily' | 'weekly' | 'monthly' | 'none';
  endDate?: Date | string; // For recurring events
}

interface EventCalendarProps {
  events: CalendarEvent[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Process events to handle date strings and recurring events
  const processedEvents = events.map(event => {
    // Handle date string conversion
    const eventDate = typeof event.date === 'string' ? 
      (isValid(parseISO(event.date)) ? parseISO(event.date) : new Date()) : 
      event.date;
    
    return { ...event, date: eventDate };
  });
  
  // Function to get all events for a specific date
  const getEventsForDate = (date: Date) => {
    return processedEvents.filter(event => {
      // Check if this is the exact date
      if (isSameDay(event.date, date)) {
        return true;
      }
      
      // Check for recurring events
      if (event.repeats) {
        const eventDay = getDay(event.date);
        const checkDay = getDay(date);
        
        // For weekly events, check if it's the same day of week
        if (event.repeats === 'weekly' && eventDay === checkDay) {
          // Check end date if exists
          if (event.endDate) {
            const endDate = typeof event.endDate === 'string' ? 
              (isValid(parseISO(event.endDate)) ? parseISO(event.endDate) : new Date()) : 
              event.endDate;
            
            return date <= endDate;
          }
          return true;
        }
        
        // For daily events
        if (event.repeats === 'daily') {
          // Check end date if exists
          if (event.endDate) {
            const endDate = typeof event.endDate === 'string' ? 
              (isValid(parseISO(event.endDate)) ? parseISO(event.endDate) : new Date()) : 
              event.endDate;
            
            return date <= endDate;
          }
          return true;
        }
        
        // TODO: Handle monthly events if needed
      }
      
      return false;
    });
  };
  
  // Get events for the selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  
  // Generate week view if in week mode
  const weekDays = viewMode === 'week' && selectedDate ? 
    Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i)) : 
    [];
  
  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };
  
  // Get color for event type
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'net': return 'bg-green-600 hover:bg-green-700';
      case 'club': return 'bg-purple-600 hover:bg-purple-700';
      case 'contest': return 'bg-orange-600 hover:bg-orange-700';
      case 'social': return 'bg-blue-600 hover:bg-blue-700';
      case 'emergency': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };
  
  // Get icon for event type
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'net': return <Radio className="h-3 w-3 mr-1" />;
      case 'club': return <Users className="h-3 w-3 mr-1" />;
      case 'contest': case 'social': return <CalendarIcon className="h-3 w-3 mr-1" />;
      case 'emergency': return <Info className="h-3 w-3 mr-1" />;
      default: return <CalendarIcon className="h-3 w-3 mr-1" />;
    }
  };
  
  return (
    <div className="space-y-3">
      {/* View mode toggle */}
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-blue-300 flex items-center">
          <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
          Community Events Calendar
        </div>
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant={viewMode === 'month' ? 'default' : 'outline'} 
            className="h-7 text-[10px]"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'week' ? 'default' : 'outline'} 
            className="h-7 text-[10px]"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
        </div>
      </div>
      
      {/* Calendar display */}
      <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
        {viewMode === 'month' ? (
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border-none"
            modifiersStyles={{
              selected: {
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: 'bold'
              }
            }}
            modifiers={{
              hasEvent: (date) => getEventsForDate(date).length > 0
            }}
            classNames={{
              day_hasEvent: "font-bold bg-blue-100/20 rounded"
            }}
          />
        ) : (
          <div className="grid grid-cols-7 gap-1 p-2">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className={`p-1 rounded-md text-center cursor-pointer ${
                  isSameDay(day, selectedDate || new Date()) 
                    ? 'bg-blue-900 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-[10px] font-medium">{format(day, 'EEE')}</div>
                <div className="text-[12px] font-bold">{format(day, 'd')}</div>
                {getEventsForDate(day).length > 0 && (
                  <div className="mt-1 flex justify-center">
                    <Badge variant="secondary" className="h-4 px-1 text-[8px]">
                      {getEventsForDate(day).length}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Events for selected date */}
      <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
        <div className="text-sm font-medium text-blue-300 mb-2 flex items-center">
          <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
          Events for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Today'}
        </div>
        
        {selectedDateEvents.length > 0 ? (
          <div className="space-y-2">
            {selectedDateEvents.map((event, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start p-2 h-auto ${getEventTypeColor(event.type)}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="text-left">
                      <div className="flex items-center text-xs font-medium text-white">
                        {getEventTypeIcon(event.type)}
                        {event.title}
                      </div>
                      {event.time && (
                        <div className="text-[10px] text-blue-100 mt-0.5">
                          {event.time}
                        </div>
                      )}
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-blue-300">{event.title}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {format(event.date, 'MMMM d, yyyy')} {event.time && `• ${event.time}`}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 pt-2">
                    {event.location && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 text-xs w-20">Location:</span>
                        <span className="text-gray-300 text-xs">{event.location}</span>
                      </div>
                    )}
                    {event.frequency && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 text-xs w-20">Frequency:</span>
                        <span className="text-yellow-300 text-xs font-mono">{event.frequency}</span>
                      </div>
                    )}
                    {event.description && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 text-xs w-20">Details:</span>
                        <span className="text-gray-300 text-xs">{event.description}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 text-xs w-20">Recurrence:</span>
                      <span className="text-gray-300 text-xs">
                        {event.repeats === 'daily' ? 'Daily' : 
                         event.repeats === 'weekly' ? 'Weekly' : 
                         event.repeats === 'monthly' ? 'Monthly' : 'One-time'}
                      </span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500 text-sm">
            No events scheduled for this day
          </div>
        )}
      </div>
      
      {/* Event type legend */}
      <div className="flex flex-wrap gap-2 mt-2 justify-center">
        <Badge variant="secondary" className="bg-green-600">Net</Badge>
        <Badge variant="secondary" className="bg-purple-600">Club</Badge>
        <Badge variant="secondary" className="bg-orange-600">Contest</Badge>
        <Badge variant="secondary" className="bg-blue-600">Social</Badge>
        <Badge variant="secondary" className="bg-red-600">Emergency</Badge>
      </div>
    </div>
  );
}
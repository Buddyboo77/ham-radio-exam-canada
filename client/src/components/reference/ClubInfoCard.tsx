import React from 'react';
import { 
  CalendarDays,
  Coffee,
  Users,
  Radio,
  BookOpen,
  MapPin,
  PhoneCall,
  MessageSquare
} from 'lucide-react';

const ClubInfoCard = () => {
  return (
    <div className="w-full text-gray-300 text-sm">
      {/* Club header with call sign */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="radio-led green mr-2"></div>
          <h3 className="text-blue-300 font-mono text-xs">VA7HAM</h3>
        </div>
        <div className="bg-blue-900 px-2 py-0.5 rounded-sm text-xs text-blue-100">
          Since 1972
        </div>
      </div>
      
      {/* Club info sections */}
      <div className="space-y-3">
        {/* Meeting details */}
        <div className="bg-gray-900 bg-opacity-40 rounded-md p-2 border border-gray-700">
          <div className="flex items-center gap-2 mb-1 text-blue-300 border-b border-gray-700 pb-1">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs font-medium">CLUB MEETINGS</span>
          </div>
          <p className="text-xs text-gray-300">
            Sept-June on the second Wednesday at 7:00pm
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Call repeater or 604-485-6916 for access
          </p>
        </div>
        
        {/* Coffee meetup */}
        <div className="bg-gray-900 bg-opacity-40 rounded-md p-2 border border-gray-700">
          <div className="flex items-center gap-2 mb-1 text-amber-300 border-b border-gray-700 pb-1">
            <Coffee className="h-4 w-4" />
            <span className="text-xs font-medium">COFFEE MEETUPS</span>
          </div>
          <p className="text-xs text-gray-300">
            Saturday mornings at 10am at local A&W
          </p>
        </div>
        
        {/* Community events */}
        <div className="bg-blue-900 bg-opacity-20 rounded-md p-2 border border-blue-900">
          <div className="flex items-center gap-2 mb-1 text-blue-300 border-b border-gray-700 pb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">COMMUNITY EVENTS</span>
          </div>
          <p className="text-xs text-gray-300 mb-1">
            Active involvement in local events to showcase equipment and educate about amateur radio.
          </p>
          <ul className="space-y-1 text-[10px] text-gray-400 pl-4">
            <li className="list-disc">Emergency Preparedness Expo</li>
            <li className="list-disc">Field days for radio setup practice</li>
            <li className="list-disc">Public demonstrations</li>
          </ul>
        </div>
        
        {/* Educational programs */}
        <div className="bg-green-900 bg-opacity-20 rounded-md p-2 border border-green-900">
          <div className="flex items-center gap-2 mb-1 text-green-300 border-b border-gray-700 pb-1">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-medium">EDUCATIONAL PROGRAMS</span>
          </div>
          <p className="text-xs text-gray-300 mb-1">
            Regular workshops and training for beginners and experienced operators.
          </p>
          <ul className="space-y-1 text-[10px] text-gray-400 pl-4">
            <li className="list-disc">Digital modes: FT8, PSK31, RTTY</li>
            <li className="list-disc">Antenna design workshops</li>
            <li className="list-disc">Emergency comms training</li>
          </ul>
        </div>
      </div>
      
      {/* Club contact buttons */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button className="radio-channel !py-1.5">
          <MapPin className="h-3 w-3 mr-1" /> Location
        </button>
        <button className="radio-channel !py-1.5">
          <MessageSquare className="h-3 w-3 mr-1" /> Contact
        </button>
      </div>
    </div>
  );
};

export default ClubInfoCard;
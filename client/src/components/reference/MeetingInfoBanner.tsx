import { CalendarDays, Users, MapPin, PhoneCall } from 'lucide-react';

export default function MeetingInfoBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-md border border-blue-700 p-3 mb-4 shadow-md">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="h-5 w-5 text-blue-300" />
        <h3 className="text-white font-bold text-base">Club Meetings</h3>
      </div>
      
      <div className="text-blue-100 text-sm mb-2 font-medium">
        Sept-June on the second Wednesday at 7:00pm
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
        <div className="flex items-center gap-2 bg-blue-800/50 rounded-md p-2 border border-blue-700">
          <MapPin className="h-4 w-4 text-blue-300" />
          <span className="text-xs text-blue-100">Powell River Recreation Complex</span>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-800/50 rounded-md p-2 border border-blue-700">
          <PhoneCall className="h-4 w-4 text-blue-300" />
          <span className="text-xs text-blue-100">Call on repeater or 604-485-6916 to gain access</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3 bg-yellow-800/30 rounded-md p-2 border border-yellow-700">
        <Users className="h-4 w-4 text-yellow-300" />
        <span className="text-xs text-yellow-100">
          Coffee meetups every Saturday at 10am at the local A&W
        </span>
      </div>
    </div>
  );
}
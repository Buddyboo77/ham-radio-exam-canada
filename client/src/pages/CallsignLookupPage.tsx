import { Search, Database, MapPin } from 'lucide-react';
import CallsignLookup from '@/components/callsign/CallsignLookup';

export default function CallsignLookupPage() {
  return (
    <div className="p-2">
      {/* Radio display header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              Callsign Lookup
            </h2>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Search className="h-4 w-4 mr-2 text-blue-400" />
            <h3 className="text-sm font-medium text-blue-300">
              Ham Radio Callsign Database
            </h3>
          </div>
          <div className="flex items-center text-[10px] text-gray-400">
            <Database className="h-3 w-3 mr-1" />
            <span>Global Ham Database</span>
          </div>
        </div>
        
        <CallsignLookup />
        
        <div className="mt-4 bg-blue-900/20 rounded-md p-2 border border-blue-900/30">
          <div className="flex items-center text-xs text-blue-300 mb-1">
            <MapPin className="h-3 w-3 mr-1 text-blue-400" />
            <span className="font-medium">About Callsign Lookup</span>
          </div>
          <p className="text-[10px] text-gray-400">
            The callsign lookup feature provides information about amateur radio operators worldwide. 
            Search for a callsign to find operator details, license information, and location data. 
            This demonstration uses simulated data - in a full version, it would connect to official 
            amateur radio databases.
          </p>
        </div>
      </div>
    </div>
  );
}
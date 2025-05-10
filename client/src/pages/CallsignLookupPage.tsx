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
        
        <div className="mt-4 bg-gray-800 rounded-md p-3 border border-gray-700">
          <h3 className="text-sm font-medium text-white mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-blue-400" />
            About Callsign Lookup
          </h3>
          <p className="text-sm text-white mb-2">
            The callsign lookup feature provides information about amateur radio operators worldwide.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="bg-blue-900/30 rounded-md p-3 border border-blue-800">
              <h4 className="text-blue-300 font-medium mb-1">How to Use</h4>
              <p className="text-sm text-white">
                Enter a callsign above (e.g., VA7HAM) and click search. View operator details, location, and license information.
              </p>
            </div>
            <div className="bg-purple-900/30 rounded-md p-3 border border-purple-800">
              <h4 className="text-purple-300 font-medium mb-1">Available Data</h4>
              <p className="text-sm text-white">
                Operator name, license class, location, grid square coordinates, and contact information when available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
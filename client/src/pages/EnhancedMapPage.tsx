import { useState } from 'react';
import { Globe, Map as MapIcon, Radio, MapPin, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedRadioMap from '@/components/maps/EnhancedRadioMap';
import { POWELL_RIVER_LOCATION } from '@/lib/constants';

export default function EnhancedMapPage() {
  const [mapMode, setMapMode] = useState('live');
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  
  return (
    <div className="p-2 pt-8">
      {/* Radio display header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              Interactive Radio Map
            </h2>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        <Tabs defaultValue="live" value={mapMode} onValueChange={setMapMode} className="w-full">
          <div className="mb-3 flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <TabsList className="h-9 p-1 bg-gray-900">
                <TabsTrigger 
                  value="live" 
                  className="text-xs py-1.5 px-3 h-auto data-[state=active]:bg-blue-900"
                >
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    <span>Live Activity</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="coverage" 
                  className="text-xs py-1.5 px-3 h-auto data-[state=active]:bg-green-900"
                >
                  <div className="flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5" />
                    <span>Coverage</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <button 
                onClick={() => setAccessibilityEnabled(!accessibilityEnabled)}
                className={`text-xs px-2 py-0.5 rounded-sm ${
                  accessibilityEnabled 
                    ? 'bg-blue-800 text-white border border-blue-600' 
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                }`}
                aria-pressed={accessibilityEnabled}
                title="Toggle accessibility features"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div className="flex items-center mr-1">
              <MapPin className="h-3.5 w-3.5 mr-1 text-blue-300" />
              <span className="text-xs text-gray-300">Powell River, BC</span>
            </div>
          </div>
          
          <TabsContent value="live" className="mt-0">
            <div className="h-[550px]">
              <EnhancedRadioMap 
                initialCenter={[POWELL_RIVER_LOCATION.lat, POWELL_RIVER_LOCATION.lng]} 
                initialZoom={8}
                showUserLocation={true}
                highContrastMode={accessibilityEnabled}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="coverage" className="mt-0">
            <div className="h-[550px]">
              <EnhancedRadioMap 
                initialCenter={[POWELL_RIVER_LOCATION.lat, POWELL_RIVER_LOCATION.lng]} 
                initialZoom={10}
                showUserLocation={true}
                highContrastMode={accessibilityEnabled}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {/* More discrete map info bar */}
        <div className="mt-2 opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex flex-wrap gap-3 justify-start py-1.5 px-3 bg-gray-800 bg-opacity-60 rounded-md border border-gray-700 text-[10px]">
            <div className="flex items-center">
              <Globe className="h-3 w-3 mr-1 text-blue-400" />
              <span className="text-blue-300 font-medium">Live Activity:</span>
              <span className="text-gray-300 ml-1">Operators & DX spots</span>
            </div>
            
            <div className="flex items-center">
              <Radio className="h-3 w-3 mr-1 text-green-400" />
              <span className="text-green-300 font-medium">Coverage:</span>
              <span className="text-gray-300 ml-1">Repeater signal ranges</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
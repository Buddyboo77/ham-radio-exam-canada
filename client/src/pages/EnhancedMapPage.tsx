import { useState } from 'react';
import { Globe, Map as MapIcon, Radio, BarChart, Compass, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedRadioMap from '@/components/maps/EnhancedRadioMap';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
              <TabsTrigger 
                value="ar" 
                className="text-xs py-1.5 px-3 h-auto data-[state=active]:bg-purple-900"
              >
                <div className="flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5" />
                  <span>AR View</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
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
              />
            </div>
          </TabsContent>
          
          <TabsContent value="coverage" className="mt-0">
            <div className="h-[550px]">
              <EnhancedRadioMap 
                initialCenter={[POWELL_RIVER_LOCATION.lat, POWELL_RIVER_LOCATION.lng]} 
                initialZoom={8}
                showUserLocation={true}
              />
            </div>
            <Card className="mt-2 bg-green-900/20 border-green-800">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Coverage Analysis Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="py-1 px-3">
                <p className="text-xs text-gray-400">
                  In a full implementation, this view would display advanced propagation analysis,
                  including terrain-aware coverage maps, shadow zones, and predict signal strength.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ar" className="mt-0">
            <Card className="bg-purple-900/20 border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-300">Augmented Reality Mode</CardTitle>
                <CardDescription className="text-gray-400">
                  Point your device camera at the sky to visualize radio coverage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-md p-4 text-center border border-gray-800 flex flex-col items-center justify-center h-[300px]">
                  <Compass className="h-12 w-12 text-purple-300 mb-4" />
                  <p className="text-gray-300">AR visualization requires device camera access</p>
                  <p className="text-xs text-gray-500 max-w-md mt-2">
                    In a full implementation, this would use a device's camera, GPS, and compass to show an 
                    augmented reality view of nearby repeaters, their coverage zones, and signal paths. This
                    would help operators visually determine optimal antenna direction and placement.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-gray-500">
                This feature would use WebXR or a native app component in a full implementation.
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-2">
          <div className="flex flex-wrap gap-2 justify-around py-2 px-3 bg-gray-800 bg-opacity-70 rounded-md border border-gray-700">
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-1.5 text-blue-400" />
                <span className="text-xs text-blue-300 font-medium">Live Activity:</span>
                <span className="text-xs text-gray-300 ml-1">Active operators & DX spots</span>
              </div>
              
              <div className="flex items-center">
                <Radio className="h-4 w-4 mr-1.5 text-green-400" />
                <span className="text-xs text-green-300 font-medium">Coverage:</span>
                <span className="text-xs text-gray-300 ml-1">Repeater signal ranges</span>
              </div>
              
              <div className="flex items-center">
                <Compass className="h-4 w-4 mr-1.5 text-purple-400" />
                <span className="text-xs text-purple-300 font-medium">AR View:</span>
                <span className="text-xs text-gray-300 ml-1">Real-world visualization</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Globe, Map as MapIcon, Radio, MapPin, Eye, Ruler, Navigation, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import EnhancedRadioMap from '@/components/maps/EnhancedRadioMap';
import { InteractiveBandPlan } from '@/components/frequencies/InteractiveBandPlan';
import { POWELL_RIVER_LOCATION } from '@/lib/constants';

export default function EnhancedMapPage() {
  const [mapMode, setMapMode] = useState('live');
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [showBandPlan, setShowBandPlan] = useState(false);
  const [coordinateFormat, setCoordinateFormat] = useState<'dd' | 'dms' | 'grid'>('dd');
  const [showMeasuringTool, setShowMeasuringTool] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<number | undefined>(146.52); // National calling frequency
  const [coverageStyle, setCoverageStyle] = useState<'simple' | 'gradient' | 'terrain'>('simple');
  
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
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Ruler className="h-4 w-4 text-blue-300" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" className="w-56 p-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Map Tools</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="measuring" className="text-xs">Measuring Tool</Label>
                    <Switch id="measuring" checked={showMeasuringTool} onCheckedChange={setShowMeasuringTool} />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Coordinates Format</Label>
                    <div className="grid grid-cols-3 gap-1">
                      <Button 
                        variant={coordinateFormat === 'dd' ? 'default' : 'outline'} 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => setCoordinateFormat('dd')}
                      >
                        Decimal
                      </Button>
                      <Button 
                        variant={coordinateFormat === 'dms' ? 'default' : 'outline'} 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => setCoordinateFormat('dms')}
                      >
                        DMS
                      </Button>
                      <Button 
                        variant={coordinateFormat === 'grid' ? 'default' : 'outline'} 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => setCoordinateFormat('grid')}
                      >
                        Grid
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Coverage Visualization</Label>
                    <div className="grid grid-cols-3 gap-1">
                      <Button 
                        variant={coverageStyle === 'simple' ? 'default' : 'outline'} 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => setCoverageStyle('simple')}
                      >
                        Simple
                      </Button>
                      <Button 
                        variant={coverageStyle === 'gradient' ? 'default' : 'outline'} 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => setCoverageStyle('gradient')}
                      >
                        Gradient
                      </Button>
                      <Button 
                        variant={coverageStyle === 'terrain' ? 'default' : 'outline'} 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => setCoverageStyle('terrain')}
                      >
                        Terrain
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setShowBandPlan(!showBandPlan)}
              title={showBandPlan ? "Hide band plan" : "Show band plan"}
            >
              <BookOpen className="h-4 w-4 text-blue-300" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        <div className="flex gap-2">
          {/* Main map area */}
          <div className={`${showBandPlan ? 'flex-1' : 'w-full'} transition-all duration-300`}>
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
          </div>
          
          {/* Band plan panel */}
          {showBandPlan && (
            <div className="w-64 transition-all duration-300">
              <InteractiveBandPlan 
                currentFrequency={selectedFrequency}
                onFrequencySelect={(freq) => setSelectedFrequency(freq)}
              />
            </div>
          )}
        </div>
        
        {/* Ultra-minimal footer */}
        <div className="flex justify-center mt-1">
          <div className="inline-flex gap-2 opacity-60 hover:opacity-90 transition-opacity">
            <span className="text-[8px] text-gray-500">© Powell River Amateur Radio Club</span>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Compass, Radio, MapPin, Camera, Smartphone, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ARVisualization from '@/components/ar/ARVisualization';

export default function ARViewPage() {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [arMode, setARMode] = useState('repeaters');
  
  return (
    <div className="p-2">
      {/* Radio display header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              Augmented Reality View
            </h2>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        <div className="mb-3 flex justify-between items-center">
          <div className="flex">
            <button
              className={`text-xs py-1.5 px-3 h-9 rounded-l flex items-center gap-1.5 ${
                arMode === 'repeaters' ? 'bg-blue-900 text-white' : 'bg-gray-900 text-gray-300'
              }`}
              onClick={() => setARMode('repeaters')}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Repeaters</span>
            </button>
            <button
              className={`text-xs py-1.5 px-3 h-9 rounded-r flex items-center gap-1.5 ${
                arMode === 'antenna' ? 'bg-green-900 text-white' : 'bg-gray-900 text-gray-300'
              }`}
              onClick={() => setARMode('antenna')}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Antenna</span>
            </button>
          </div>
          
          <Button
            size="sm" 
            variant="outline" 
            className="h-8 text-xs bg-blue-900/50 border-blue-700"
            onClick={() => setCameraEnabled(!cameraEnabled)}
          >
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            {cameraEnabled ? "Disable Camera" : "Enable Camera"}
          </Button>
        </div>
        
        <div className="aspect-video mb-3">
          <ARVisualization enableCamera={cameraEnabled} />
        </div>
        
        {arMode === 'repeaters' ? (
          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-300 text-sm">Repeater Visualization</CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                See nearby repeater locations through augmented reality
              </CardDescription>
            </CardHeader>
            <CardContent className="py-2">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-900 p-2 rounded-md border border-gray-800 flex flex-col items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                  <span className="text-[9px] text-gray-300">Active</span>
                </div>
                <div className="bg-gray-900 p-2 rounded-md border border-gray-800 flex flex-col items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mb-1"></div>
                  <span className="text-[9px] text-gray-300">Limited</span>
                </div>
                <div className="bg-gray-900 p-2 rounded-md border border-gray-800 flex flex-col items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mb-1"></div>
                  <span className="text-[9px] text-gray-300">Inactive</span>
                </div>
              </div>
              
              <div className="mt-2 text-[10px] text-gray-400">
                <p>Point your device in different directions to discover repeater sites in your area. 
                The visualization shows their approximate location, frequency, and distance from your current position.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-green-900/20 border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-300 text-sm">Antenna Planning Mode</CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Visualize optimal antenna placements and directions
              </CardDescription>
            </CardHeader>
            <CardContent className="py-2">
              <div className="bg-gray-900 p-3 rounded-md border border-gray-800 text-center">
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-green-300" />
                <p className="text-xs text-gray-300">
                  Antenna planning mode helps you determine the optimal direction to point your antenna for maximum effectiveness.
                </p>
                <p className="mt-2 text-[10px] text-gray-400">
                  In a full implementation, this mode would analyze terrain data and propagation models to show
                  the estimated signal strength in different directions.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-3 bg-purple-900/20 rounded-md p-2 border border-purple-900/30">
          <div className="flex items-center text-xs text-purple-300 mb-1">
            <Compass className="h-3 w-3 mr-1 text-purple-400" />
            <span className="font-medium">About AR Technology</span>
          </div>
          <p className="text-[10px] text-gray-400">
            This AR view combines device orientation sensors, GPS location, and camera to overlay radio-relevant information
            onto your surroundings. For best results, ensure that your device has GPS, compass, and camera access enabled. In
            outdoor settings, this can help identify the direction of repeaters and optimize antenna placement.
          </p>
        </div>
        
        <CardFooter className="px-0 pt-2 pb-0 justify-center">
          <Button 
            size="sm" 
            variant="ghost" 
            className="flex text-xs text-purple-300"
            onClick={() => document.documentElement.requestFullscreen()}
          >
            <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
            Open in Fullscreen Mode
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { MapPin, Navigation, ArrowRightCircle, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { convertToDMS, convertToGridSquare, calculateDistance } from '@/lib/utils';

interface CoordinateDisplayProps {
  position: [number, number] | null;
  coordinateFormat: 'dd' | 'dms' | 'grid';
  onFormatChange: (format: 'dd' | 'dms' | 'grid') => void;
  measuringPoints: Array<[number, number]>;
  isMeasuring: boolean;
  onMeasuringToggle: () => void;
  onMeasuringPointsClear: () => void;
}

export function CoordinateDisplay({
  position,
  coordinateFormat,
  onFormatChange,
  measuringPoints,
  isMeasuring,
  onMeasuringToggle,
  onMeasuringPointsClear
}: CoordinateDisplayProps) {
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  if (!position) return null;
  
  const [lat, lng] = position;
  
  let formattedCoords = '';
  
  switch (coordinateFormat) {
    case 'dd':
      formattedCoords = `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`;
      break;
    case 'dms':
      formattedCoords = `${convertToDMS(lat, false)}, ${convertToDMS(lng, true)}`;
      break;
    case 'grid':
      formattedCoords = convertToGridSquare(lat, lng);
      break;
  }
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedCoords);
    setCopied(true);
  };
  
  // Calculate distance if we have 2 measuring points
  const distance = measuringPoints.length === 2 
    ? calculateDistance(
        measuringPoints[0][0], 
        measuringPoints[0][1], 
        measuringPoints[1][0], 
        measuringPoints[1][1]
      )
    : null;
  
  return (
    <Card className="absolute bottom-4 left-4 z-10 max-w-md shadow-lg bg-gray-900 border-gray-700 text-white">
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-mono">{formattedCoords}</span>
              <button
                onClick={copyToClipboard}
                className="rounded-full p-1 hover:bg-gray-700 transition-colors"
                title="Copy coordinates"
              >
                {copied ? (
                  <Badge variant="outline" className="text-xs">Copied!</Badge>
                ) : (
                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                )}
              </button>
            </div>
            
            <div className="flex gap-1">
              <Badge
                variant={coordinateFormat === 'dd' ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-blue-600"
                onClick={() => onFormatChange('dd')}
              >
                DD
              </Badge>
              <Badge
                variant={coordinateFormat === 'dms' ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-blue-600"
                onClick={() => onFormatChange('dms')}
              >
                DMS
              </Badge>
              <Badge
                variant={coordinateFormat === 'grid' ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-blue-600"
                onClick={() => onFormatChange('grid')}
              >
                Grid
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              variant={isMeasuring ? "destructive" : "outline"} 
              size="sm" 
              onClick={onMeasuringToggle}
              className="text-xs"
            >
              {isMeasuring ? "Cancel Measuring" : "Measure Distance"}
              <Navigation className="h-3 w-3 ml-1" />
            </Button>
            
            {measuringPoints.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMeasuringPointsClear}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear Points
              </Button>
            )}
          </div>
          
          {measuringPoints.length > 0 && (
            <div className="text-sm">
              <div className="grid grid-cols-2 gap-1 mt-1">
                {measuringPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs">
                    <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-mono text-gray-300">
                      {point[0].toFixed(4)}, {point[1].toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
              
              {distance && (
                <div className="mt-2 p-2 bg-gray-800 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Distance:</span>
                    <div className="flex items-center">
                      <ArrowRightCircle className="h-3 w-3 mr-1 text-green-500" />
                      <span className="font-mono text-green-400">
                        {distance.toFixed(2)} km ({(distance * 0.621371).toFixed(2)} mi)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
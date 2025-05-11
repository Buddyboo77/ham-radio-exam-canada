import { useState, useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { convertToDMS, convertToGridSquare } from '@/lib/utils';
import { Clipboard, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CoordinateDisplayProps {
  format?: 'dd' | 'dms' | 'grid';
  onFormatChange?: (format: 'dd' | 'dms' | 'grid') => void;
}

export function CoordinateDisplay({ 
  format = 'dd', 
  onFormatChange 
}: CoordinateDisplayProps) {
  const map = useMap();
  const [position, setPosition] = useState(map.getCenter());
  const [copied, setCopied] = useState(false);
  
  // Update position as the map moves
  useMapEvents({
    move: () => {
      setPosition(map.getCenter());
    },
    moveend: () => {
      setPosition(map.getCenter());
    },
  });
  
  // Format the coordinates based on the selected format
  const formatCoordinates = () => {
    const { lat, lng } = position;
    
    switch (format) {
      case 'dms':
        return `${convertToDMS(lat, false)} ${convertToDMS(lng, true)}`;
      case 'grid':
        return convertToGridSquare(lat, lng);
      case 'dd':
      default:
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };
  
  // Copy coordinates to clipboard
  const copyCoordinates = () => {
    navigator.clipboard.writeText(formatCoordinates()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Handle format change
  const handleFormatChange = (value: string) => {
    if (value === 'dd' || value === 'dms' || value === 'grid') {
      if (onFormatChange) {
        onFormatChange(value);
      }
    }
  };
  
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control mb-2 ml-2">
        <div className="bg-gray-900/85 p-2 rounded-sm shadow-md border border-gray-700 text-xs text-gray-200 flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono">{formatCoordinates()}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 p-0" 
                      onClick={copyCoordinates}
                    >
                      {copied ? (
                        <Badge variant="outline" className="px-1 py-0 h-4 bg-green-900 text-green-100">Copied!</Badge>
                      ) : (
                        <Clipboard className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy coordinates</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <Select 
                value={format} 
                onValueChange={handleFormatChange}
              >
                <SelectTrigger className="h-6 w-28 px-2 py-0 text-xs bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-xs">Coordinate Format</SelectLabel>
                    <SelectItem value="dd" className="text-xs">Decimal Degrees</SelectItem>
                    <SelectItem value="dms" className="text-xs">Deg, Min, Sec</SelectItem>
                    <SelectItem value="grid" className="text-xs">Grid Square</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0"
                      onClick={() => setPosition(map.getCenter())}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh coordinates</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Radio, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Repeater } from '@shared/schema';
import { POWELL_RIVER_LOCATION } from '@/lib/constants';
import L from 'leaflet';

// Fix the default icon issue in React-Leaflet
// This is needed because the webpack/vite loader breaks the default path to markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix missing leaflet icon issue
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Set default icon for all markers
L.Marker.prototype.options.icon = DefaultIcon;

// Create custom marker icons for repeater status
const getStatusColor = (status: string | null | undefined) => {
  if (!status) return '#888888'; // default gray for unknown status
  
  switch (status.toLowerCase()) {
    case 'operational':
      return '#10b981'; // success green
    case 'limited':
      return '#f59e0b'; // warning yellow
    case 'offline':
    case 'down':
      return '#ef4444'; // error red
    default:
      return '#888888'; // gray for unknown
  }
};

// Component to recenter the map when necessary
interface RecenterMapProps {
  position: [number, number];
  zoom: number;
}

function RecenterMap({ position, zoom }: RecenterMapProps) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, zoom);
  }, [position, zoom, map]);
  return null;
}

// Component to set bounds based on markers
interface SetBoundsProps {
  repeaters: Repeater[];
}

function SetBounds({ repeaters }: SetBoundsProps) {
  const map = useMap();
  
  useEffect(() => {
    if (repeaters.length > 0) {
      const repeatersWithCoords = repeaters.filter(r => r.latitude && r.longitude);
      
      if (repeatersWithCoords.length > 1) {
        const markerPositions = repeatersWithCoords.map(
          r => [r.latitude || 0, r.longitude || 0] as [number, number]
        );
        const bounds = L.latLngBounds(markerPositions);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [repeaters, map]);
  
  return null;
}

interface RepeaterMapProps {
  repeaters: Repeater[];
  onAddToScanner: (frequency: number) => void;
}

const RepeaterMap: React.FC<RepeaterMapProps> = ({ repeaters, onAddToScanner }) => {
  const [center] = useState<[number, number]>([POWELL_RIVER_LOCATION.lat, POWELL_RIVER_LOCATION.lng]);
  const [zoom, setZoom] = useState(11);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Function to get status badge
  const getStatusBadge = (status?: string | null) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case "operational":
        return <Badge className="bg-green-500 text-white">Operational</Badge>;
      case "limited":
        return <Badge className="bg-yellow-500 text-white">Limited</Badge>;
      case "offline":
      case "down":
        return <Badge className="bg-red-500 text-white">Offline</Badge>;
      default:
        return <Badge className="bg-gray-300 text-gray-700">Unknown</Badge>;
    }
  };

  // Function to reset view to Powell River
  const resetView = () => {
    setZoom(11);
    setResetTrigger(prev => prev + 1);
  };

  return (
    <div className="relative">
      <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-200">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <RecenterMap key={resetTrigger} position={center} zoom={zoom} />
          <SetBounds repeaters={repeaters} />
          
          {repeaters.map(repeater => {
            if (!repeater.latitude || !repeater.longitude) return null;
            
            const statusColor = getStatusColor(repeater.status);
            const customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: ${statusColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            });
            
            return (
              <Marker 
                key={repeater.id}
                position={[repeater.latitude, repeater.longitude]}
                icon={customIcon}
              >
                <Popup minWidth={200} maxWidth={300}>
                  <div className="p-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-primary">{repeater.name}</h3>
                      {getStatusBadge(repeater.status)}
                    </div>
                    
                    <p className="text-accent font-medium mb-1">{repeater.frequency.toFixed(3)} MHz</p>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      <p><strong>Offset:</strong> {repeater.offset >= 0 ? "+" : ""}{repeater.offset.toFixed(1)} MHz</p>
                      {repeater.tone && <p><strong>Tone:</strong> {repeater.tone}</p>}
                      <p><strong>Location:</strong> {repeater.location}</p>
                    </div>
                    
                    {repeater.coverage && (
                      <p className="text-xs text-gray-600 mb-2">
                        <strong>Coverage:</strong> {repeater.coverage}
                      </p>
                    )}
                    
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => onAddToScanner(repeater.frequency)}
                    >
                      <Radio className="h-3 w-3 mr-1" />
                      Add to Scanner
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      
      <div className="absolute bottom-3 right-3 z-[1000]">
        <Button 
          size="sm" 
          variant="secondary" 
          className="shadow-md bg-white"
          onClick={resetView}
        >
          <Navigation className="h-4 w-4 mr-1" />
          Reset View
        </Button>
      </div>
    </div>
  );
};

export default RepeaterMap;
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

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Create custom marker icons for repeater status
const createCustomIcon = (status: string | null | undefined, size: number = 12) => {
  let color = '#888888'; // default gray for unknown status
  
  if (status) {
    switch (status.toLowerCase()) {
      case 'operational':
        color = '#10b981'; // success green
        break;
      case 'limited':
        color = '#f59e0b'; // warning yellow
        break;
      case 'offline':
        color = '#ef4444'; // error red
        break;
    }
  }
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

// Component to recenter the map when necessary
interface RecenterMapProps {
  position: [number, number];
}

function RecenterMap({ position }: RecenterMapProps) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

interface RepeaterMapProps {
  repeaters: Repeater[];
  onAddToScanner: (frequency: number) => void;
}

const RepeaterMap: React.FC<RepeaterMapProps> = ({ repeaters, onAddToScanner }) => {
  const [center, setCenter] = useState<[number, number]>([POWELL_RIVER_LOCATION.lat, POWELL_RIVER_LOCATION.lng]);
  const [zoom, setZoom] = useState(11);
  const [map, setMap] = useState<L.Map | null>(null);

  // Function to get status badge
  const getStatusBadge = (status?: string | null) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case "operational":
        return <Badge className="bg-success text-white">Operational</Badge>;
      case "limited":
        return <Badge className="bg-warning text-white">Limited</Badge>;
      case "offline":
        return <Badge className="bg-destructive text-white">Offline</Badge>;
      default:
        return <Badge className="bg-gray-300 text-gray-700">Unknown</Badge>;
    }
  };

  // Function to reset view to Powell River
  const resetView = () => {
    setCenter([POWELL_RIVER_LOCATION.lat, POWELL_RIVER_LOCATION.lng]);
    setZoom(11);
  };

  // Calculate bounds to fit all markers
  useEffect(() => {
    if (map && repeaters.length > 0) {
      const repeatersWithCoords = repeaters.filter(r => r.latitude && r.longitude);
      
      if (repeatersWithCoords.length > 1) {
        const bounds = L.latLngBounds(repeatersWithCoords.map(r => [r.latitude || 0, r.longitude || 0]));
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (repeatersWithCoords.length === 1) {
        const r = repeatersWithCoords[0];
        setCenter([r.latitude || 0, r.longitude || 0]);
        setZoom(13);
      }
    }
  }, [repeaters, map]);

  return (
    <div className="relative">
      <div className="h-[500px] w-full rounded-lg overflow-hidden">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          whenCreated={setMap}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <RecenterMap position={center} />
          
          {repeaters.map(repeater => {
            if (!repeater.latitude || !repeater.longitude) return null;
            
            return (
              <Marker 
                key={repeater.id}
                position={[repeater.latitude, repeater.longitude]}
                icon={createCustomIcon(repeater.status)}
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
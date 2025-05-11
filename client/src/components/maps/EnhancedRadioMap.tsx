import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Radio, Wifi, Globe, Signal, Search, Target, Layers, Eye, ZoomIn, Activity, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';
import WeatherOverlay from './WeatherOverlay';

// Fix Leaflet marker icon issue in React
// This is needed because Leaflet's default marker relies on assets that aren't properly handled by bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different types of markers
const createCustomIcon = (iconUrl: string, size: [number, number] = [32, 32]) => {
  return L.icon({
    iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
  });
};

// Mock data interfaces
interface Repeater {
  id: number;
  callsign: string;
  frequency: number;
  offset: number;
  tone: number;
  latitude: number;
  longitude: number;
  name?: string;
  city?: string;
  status: 'active' | 'inactive' | 'limited';
  coverageRadius: number;
  elevation?: number;
  features?: string[];
}

interface DXSpot {
  id: string;
  callsign: string;
  frequency: number;
  mode: string;
  band: string;
  latitude: number;
  longitude: number;
  time: string;
  spotter: string;
  country?: string;
  grid?: string;
}

interface UserLocation {
  id: string;
  callsign: string;
  name?: string;
  latitude: number;
  longitude: number;
  lastUpdated: string;
  status: 'online' | 'offline' | 'mobile';
  grid?: string;
}

// Props type
interface EnhancedRadioMapProps {
  initialCenter?: [number, number]; // Default center of map
  initialZoom?: number; // Default zoom level
  showUserLocation?: boolean; // Whether to show and track the user's actual location
  highContrastMode?: boolean; // Whether to use high contrast mode for accessibility
}

// Component to get current user location and center map on it
function CurrentLocationMarker({ setUserPosition }: { setUserPosition: (position: [number, number]) => void }) {
  const map = useMap();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);

  useEffect(() => {
    map.locate({ setView: false, watch: true, enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 });

    map.on('locationfound', (e) => {
      const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      setAccuracy(e.accuracy);
      setUserPosition(newPosition);
    });

    map.on('locationerror', (e) => {
      console.error('Location error:', e.message);
    });

    return () => {
      map.stopLocate();
      map.off('locationfound');
      map.off('locationerror');
    };
  }, [map, setUserPosition]);

  if (!position) return null;

  return (
    <>
      <Circle center={position} radius={accuracy} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} />
      <Marker position={position} icon={createCustomIcon('https://cdn-icons-png.flaticon.com/512/3710/3710297.png', [24, 24])}>
        <Popup>
          <div className="text-xs">
            <strong>Your Location</strong>
            <div>Lat: {position[0].toFixed(5)}</div>
            <div>Lng: {position[1].toFixed(5)}</div>
            <div className="text-gray-500 mt-1">Accuracy: ±{accuracy.toFixed(0)}m</div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

// Component to recenter map on a specific location
function RecenterMapControl({ position }: { position: [number, number] }) {
  const map = useMap();
  
  const handleClick = () => {
    map.setView(position, 10);
  };

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button 
          className="flex items-center justify-center w-8 h-8 bg-white hover:bg-gray-100 text-gray-800 rounded-sm"
          onClick={handleClick}
          title="Center map on your location"
        >
          <Target className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Define map tile type
type MapTileType = 'standard' | 'highContrast' | 'satellite' | 'monochrome';

// Accessibility controls for the map
function AccessibilityMapControls({ 
  contrastMode, 
  setContrastMode, 
  largePrintMode, 
  setLargePrintMode,
  mapTileType,
  setMapTileType
}: { 
  contrastMode: boolean;
  setContrastMode: (value: boolean) => void;
  largePrintMode: boolean;
  setLargePrintMode: (value: boolean) => void;
  mapTileType: MapTileType;
  setMapTileType: (type: MapTileType) => void;
}) {
  const map = useMap();
  
  // Toggle high contrast mode
  const toggleContrastMode = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      const newContrastMode = !contrastMode;
      
      // First update the map tile type based on the new contrast mode
      if (newContrastMode) {
        setMapTileType('highContrast');
      } else {
        setMapTileType('standard');
      }
      
      // Then update the contrast mode state
      setContrastMode(newContrastMode);
      
      // Update button aria state
      if (e.currentTarget) {
        e.currentTarget.setAttribute('aria-pressed', String(newContrastMode));
      }
    } catch (error) {
      console.error('Error toggling contrast mode:', error);
    }
  };
  
  // Toggle large print mode
  const toggleLargePrintMode = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      const newLargePrintMode = !largePrintMode;
      setLargePrintMode(newLargePrintMode);
      
      // Apply CSS changes to make map elements larger
      const mapContainer = document.querySelector('.leaflet-container');
      if (mapContainer) {
        if (newLargePrintMode) {
          // Make icons and text larger
          mapContainer.classList.add('large-print-mode');
        } else {
          mapContainer.classList.remove('large-print-mode');
        }
      }
      
      // Update button aria state
      if (e.currentTarget) {
        e.currentTarget.setAttribute('aria-pressed', String(newLargePrintMode));
      }
    } catch (error) {
      console.error('Error toggling large print mode:', error);
    }
  };

  // Cycle through map types
  const cycleMapType = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      const types: MapTileType[] = ['standard', 'highContrast', 'satellite', 'monochrome'];
      const currentIndex = types.indexOf(mapTileType);
      const nextIndex = (currentIndex + 1) % types.length;
      const nextMapType = types[nextIndex];
      
      // First update contrast mode if needed
      if (nextMapType === 'highContrast') {
        setContrastMode(true);
      } else if (contrastMode) {
        // If contrast mode is on but we're switching to a non-high-contrast mode
        setContrastMode(false);
      }
      
      // Then set the map tile type
      setMapTileType(nextMapType);
      
      // Update button title with the new map type
      if (e.currentTarget) {
        e.currentTarget.setAttribute('title', `Current map style: ${nextMapType}. Click to change.`);
      }
    } catch (error) {
      console.error('Error cycling map type:', error);
    }
  };

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control" style={{ marginTop: "40px", marginRight: "10px" }}>
        <div className="flex flex-col gap-1 bg-gray-900/85 p-1.5 rounded-sm shadow-md border border-gray-700">          
          <button 
            type="button"
            className={`flex items-center justify-center w-6 h-6 ${contrastMode ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
            onClick={toggleContrastMode}
            title="Toggle high contrast mode"
            aria-pressed={contrastMode}
          >
            <Eye className="h-3 w-3" />
          </button>
          
          <button 
            type="button"
            className={`flex items-center justify-center w-6 h-6 ${largePrintMode ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
            onClick={toggleLargePrintMode}
            title="Toggle large print mode"
            aria-pressed={largePrintMode}
          >
            <ZoomIn className="h-3 w-3" />
          </button>
          
          <button 
            type="button"
            className="flex items-center justify-center w-6 h-6 bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm"
            onClick={cycleMapType}
            title={`Current map style: ${mapTileType}. Click to change.`}
          >
            <Layers className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Map tile providers for different accessibility modes
const MAP_TILES = {
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  highContrast: {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  monochrome: {
    url: "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png",
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

export default function EnhancedRadioMap({ 
  initialCenter = [49.8352, -124.5248], // Default to Powell River
  initialZoom = 7,
  showUserLocation = true,
  highContrastMode = false,
}: EnhancedRadioMapProps) {
  // State for layer visibility
  const [showRepeaters, setShowRepeaters] = useState(true);
  const [showDXSpots, setShowDXSpots] = useState(true);
  const [showUsers, setShowUsers] = useState(true);
  const [showWeather, setShowWeather] = useState(false);
  
  // State for accessibility
  const [contrastMode, setContrastMode] = useState(highContrastMode);
  const [largePrintMode, setLargePrintMode] = useState(false);
  const [mapTileType, setMapTileType] = useState<MapTileType>(
    highContrastMode ? 'highContrast' : 'standard'
  );
  const [showCoverage, setShowCoverage] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  
  // Animated heatmap effect for refreshing DX spots
  const [recentDXSpots, setRecentDXSpots] = useState<string[]>([]);
  
  // Query repeaters data
  const { data: repeaters, isLoading: loadingRepeaters } = useQuery({
    queryKey: ['repeaters'],
    queryFn: async () => {
      // In a real app, fetch from server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockRepeaters: Repeater[] = [
        {
          id: 1,
          callsign: 'VE7RPR',
          frequency: 146.68,
          offset: -0.6,
          tone: 141.3,
          latitude: 49.8352,
          longitude: -124.5248,
          name: 'Powell River Repeater',
          city: 'Powell River',
          status: 'active',
          coverageRadius: 50000, // Coverage in meters
          elevation: 200,
          features: ['Linked', 'EchoLink']
        },
        {
          id: 2,
          callsign: 'VE7RPT',
          frequency: 146.98,
          offset: -0.6,
          tone: 141.3,
          latitude: 49.7,
          longitude: -124.3,
          name: 'Texada Island Repeater',
          city: 'Texada Island',
          status: 'active',
          coverageRadius: 70000,
          elevation: 500,
          features: ['Linked', 'IRLP']
        },
        {
          id: 3,
          callsign: 'VE7RCH',
          frequency: 147.2,
          offset: 0.6,
          tone: 103.5,
          latitude: 50.0,
          longitude: -124.9,
          name: 'Church Mountain Repeater',
          city: 'Church Mountain',
          status: 'active',
          coverageRadius: 100000,
          elevation: 1200,
          features: ['Weather Alerts']
        },
        {
          id: 4,
          callsign: 'VE7PRR',
          frequency: 147.2,
          offset: 0.6,
          tone: 141.3,
          latitude: 49.9,
          longitude: -124.6,
          status: 'active',
          coverageRadius: 60000,
          features: ['PRARC Nets', 'EmComm']
        },
        {
          id: 5,
          callsign: 'VE7TIR',
          frequency: 444.025,
          offset: 5.0,
          tone: 141.3,
          latitude: 49.85,
          longitude: -124.45,
          status: 'active',
          coverageRadius: 40000,
          features: ['EmComm', 'DMR']
        }
      ];
      
      return mockRepeaters;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
  
  // Query DX spots data
  const { data: dxSpots, isLoading: loadingDXSpots, refetch: refetchDXSpots } = useQuery({
    queryKey: ['dxSpots'],
    queryFn: async () => {
      // In a real app, fetch from server
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create some spots semi-randomly for demo
      const bands = ['160m', '80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m'];
      const modes = ['CW', 'SSB', 'FT8', 'FT4', 'RTTY'];
      const prefixes = ['W', 'K', 'VE', 'JA', 'DL', 'G', 'F', 'EA', 'PY', 'ZL', 'VK', 'ZS', 'UA'];
      
      // Generate random locations globally
      const generateRandomSpot = (id: number): DXSpot => {
        const lat = (Math.random() * 140) - 70; // Between -70 and 70
        const lng = (Math.random() * 320) - 160; // Between -160 and 160
        const band = bands[Math.floor(Math.random() * bands.length)];
        const mode = modes[Math.floor(Math.random() * modes.length)];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        return {
          id: `spot-${id}`,
          callsign: `${prefix}${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          frequency: Math.random() * 28000 + 1800, // Between 1800 and 30000 kHz
          band,
          mode,
          latitude: lat,
          longitude: lng,
          time: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Within the last hour
          spotter: `${prefixes[Math.floor(Math.random() * prefixes.length)]}${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          grid: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`
        };
      };
      
      const mockSpots: DXSpot[] = Array.from({ length: 25 }, (_, i) => generateRandomSpot(i));
      
      // Add a specific spot for demo highlighting
      mockSpots.push({
        id: 'special-spot',
        callsign: 'DX0X',
        frequency: 14074,
        band: '20m',
        mode: 'FT8',
        latitude: 40,
        longitude: -120,
        time: new Date().toISOString(),
        spotter: 'W1AW',
        country: 'Rare DX Entity',
        grid: 'FK52'
      });
      
      // Add recent spotted tag for animation
      const recentSpotIds = mockSpots
        .slice(0, 3)
        .map(spot => spot.id);
      
      setRecentDXSpots(recentSpotIds);
      
      return mockSpots;
    },
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Query user locations
  const { data: userLocations, isLoading: loadingUsers } = useQuery({
    queryKey: ['userLocations'],
    queryFn: async () => {
      // In a real app, fetch from server
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data based on Powell River area
      const mockUsers: UserLocation[] = [
        {
          id: 'user-1',
          callsign: 'VA7KMB',
          name: 'Lucy',
          latitude: 49.82,
          longitude: -124.52,
          lastUpdated: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
          status: 'online',
          grid: 'CN89sm'
        },
        {
          id: 'user-2',
          callsign: 'VE7RZI',
          name: 'Bill',
          latitude: 49.84,
          longitude: -124.56,
          lastUpdated: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
          status: 'online',
          grid: 'CN89sm'
        },
        {
          id: 'user-3',
          callsign: 'VE7AAK',
          name: 'Windy',
          latitude: 49.83,
          longitude: -124.50,
          lastUpdated: new Date(Date.now() - 10 * 60000).toISOString(), // 10 minutes ago
          status: 'mobile',
          grid: 'CN89sm'
        }
      ];
      
      return mockUsers;
    },
    staleTime: 60000, // 1 minute
  });
  
  // Create repeater markers
  const repeaterMarkers = showRepeaters && repeaters && repeaters.map(repeater => {
    const coverageColor = 
      repeater.status === 'active' ? '#3388ff' : 
      repeater.status === 'limited' ? '#ffa500' : '#ff3333';
    
    const isVHF = repeater.frequency < 300;
    const isUHF = repeater.frequency >= 300;
    
    // Icon based on band
    const iconUrl = isVHF ? 
      'https://cdn-icons-png.flaticon.com/512/825/825572.png' : 
      'https://cdn-icons-png.flaticon.com/512/825/825560.png';
    
    return (
      <LayerGroup key={repeater.id}>
        {showCoverage && (
          <Circle 
            center={[repeater.latitude, repeater.longitude]} 
            radius={repeater.coverageRadius} 
            pathOptions={{
              color: coverageColor,
              fillColor: coverageColor,
              fillOpacity: 0.1,
              weight: 1
            }}
          />
        )}
        <Marker 
          position={[repeater.latitude, repeater.longitude]} 
          icon={createCustomIcon(iconUrl)}
        >
          <Popup className="repeater-popup">
            <div className="text-xs">
              <div className="font-bold text-sm">{repeater.callsign}</div>
              <div className="font-mono">{typeof repeater.frequency === 'number' ? repeater.frequency.toFixed(3) : repeater.frequency} MHz</div>
              <div>Offset: {repeater.offset > 0 ? '+' : ''}{typeof repeater.offset === 'number' ? repeater.offset.toFixed(3) : repeater.offset} MHz</div>
              <div>Tone: {typeof repeater.tone === 'number' ? repeater.tone.toFixed(1) : repeater.tone} Hz</div>
              {repeater.features && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {repeater.features.map(feature => (
                    <Badge 
                      variant="outline" 
                      className="text-[8px] py-0 h-3 bg-blue-900/30" 
                      key={feature}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      </LayerGroup>
    );
  });
  
  // Create DX spot markers
  const dxSpotMarkers = showDXSpots && dxSpots && dxSpots.map(spot => {
    // Different icon based on band/mode
    let iconUrl = 'https://cdn-icons-png.flaticon.com/512/6877/6877752.png';
    if (spot.band === '20m' || spot.band === '17m' || spot.band === '15m') {
      iconUrl = 'https://cdn-icons-png.flaticon.com/512/6877/6877456.png';
    } else if (spot.band === '10m' || spot.band === '6m') {
      iconUrl = 'https://cdn-icons-png.flaticon.com/512/6877/6877481.png';
    }
    
    // Animation for recent spots
    const isRecent = recentDXSpots.includes(spot.id);
    
    return (
      <Marker 
        key={spot.id} 
        position={[spot.latitude, spot.longitude]} 
        icon={createCustomIcon(iconUrl, [24, 24])}
        opacity={isRecent ? 0.9 : 0.7}
      >
        <Popup>
          <div className="text-xs">
            <div className="font-bold text-sm">{spot.callsign}</div>
            <div className="font-mono">{(spot.frequency / 1000).toFixed(3)} MHz</div>
            <div>Band: {spot.band}</div>
            <div>Mode: {spot.mode}</div>
            {spot.grid && <div>Grid: {spot.grid}</div>}
            <div className="text-gray-500 mt-1">
              Spotted by {spot.spotter}
            </div>
          </div>
        </Popup>
      </Marker>
    );
  });
  
  // Create user location markers
  const userLocationMarkers = showUsers && userLocations && userLocations.map(user => {
    // Different icon based on status
    let iconUrl = 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png';
    if (user.status === 'mobile') {
      iconUrl = 'https://cdn-icons-png.flaticon.com/512/2258/2258845.png';
    } else if (user.status === 'offline') {
      iconUrl = 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png';
    }
    
    return (
      <Marker 
        key={user.id} 
        position={[user.latitude, user.longitude]} 
        icon={createCustomIcon(iconUrl, [28, 28])}
      >
        <Popup>
          <div className="text-xs">
            <div className="font-bold text-sm">{user.callsign}</div>
            {user.name && <div>{user.name}</div>}
            {user.grid && <div>Grid: {user.grid}</div>}
            <div className="text-gray-500 mt-1">
              Status: {user.status}
            </div>
          </div>
        </Popup>
      </Marker>
    );
  });
  
  // Format time since update
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const hours = Math.floor(diffMins / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };
  
  // Determine loading state
  const isLoading = loadingRepeaters || loadingDXSpots || loadingUsers;

  return (
    <div className="radio-map-container w-full h-full flex flex-col">
      {/* Map controls */}
      <div className="bg-gray-900 p-2 rounded-md border border-gray-800 mb-2">
        <div className="flex flex-wrap gap-3 justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-repeaters"
                checked={showRepeaters}
                onCheckedChange={setShowRepeaters}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="show-repeaters" className="text-xs flex items-center gap-1">
                <Radio className="h-3 w-3 text-blue-400" /> Repeaters
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-coverage"
                checked={showCoverage}
                onCheckedChange={setShowCoverage}
                disabled={!showRepeaters}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="show-coverage" className="text-xs flex items-center gap-1">
                <Signal className="h-3 w-3 text-blue-400" /> Coverage
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-dx"
                checked={showDXSpots}
                onCheckedChange={setShowDXSpots}
                className="data-[state=checked]:bg-orange-600"
              />
              <Label htmlFor="show-dx" className="text-xs flex items-center gap-1">
                <Globe className="h-3 w-3 text-orange-400" /> DX Spots
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-users"
                checked={showUsers}
                onCheckedChange={setShowUsers}
                className="data-[state=checked]:bg-green-600"
              />
              <Label htmlFor="show-users" className="text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3 text-green-400" /> Operators
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-weather"
                checked={showWeather}
                onCheckedChange={setShowWeather}
                className="data-[state=checked]:bg-cyan-600"
              />
              <Label htmlFor="show-weather" className="text-xs flex items-center gap-1">
                <Cloud className="h-3 w-3 text-cyan-400" /> Weather
              </Label>
            </div>
          </div>
          
          <Button 
            size="sm" 
            className="h-6 py-0 bg-blue-900 hover:bg-blue-800"
            onClick={() => refetchDXSpots()}
          >
            {loadingDXSpots ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3 mr-1" />}
            <span className="text-[10px]">Refresh DX</span>
          </Button>
        </div>
        
        <div className="flex gap-2 mt-2 text-[9px] text-gray-400">
          {repeaters && <div>Repeaters: {repeaters.length}</div>}
          {dxSpots && <div>• DX Spots: {dxSpots.length}</div>}
          {userLocations && <div>• Operators: {userLocations.length}</div>}
          {dxSpots && dxSpots.length > 0 && <div className="ml-auto">Updated: {formatTime(dxSpots[0].time)}</div>}
        </div>
      </div>
      
      {/* Map instructions - compact but visible above map */}
      <div className="bg-blue-900 text-white rounded-md p-2 mb-2 border border-blue-700 shadow-lg flex items-center justify-center">
        <MapPin className="h-4 w-4 text-blue-300 mr-2" />
        <span className="text-xs font-medium">Click any marker on the map to view detailed information</span>
      </div>
    
      {/* Map display */}
      <div className="flex-1 relative h-[550px] rounded-md overflow-hidden border border-gray-700">
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-gray-900 p-3 rounded-md flex items-center gap-2 shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              <span className="text-sm">Loading map data...</span>
            </div>
          </div>
        )}
        
        <div className="relative h-full w-full rounded-md overflow-hidden">
          <MapContainer center={initialCenter} zoom={initialZoom} className="h-full w-full rounded-md" style={{ height: "100%" }}>
            <TileLayer
              attribution={MAP_TILES[mapTileType].attribution}
              url={MAP_TILES[mapTileType].url}
            />
            
            {/* Show current user location if enabled */}
            {showUserLocation && <CurrentLocationMarker setUserPosition={setUserPosition} />}
            
            {/* Layer groups */}
            {repeaterMarkers}
            {dxSpotMarkers}
            {userLocationMarkers}
            
            {/* Weather overlay */}
            {showWeather && <WeatherOverlay enabled={showWeather} />}
            
            {/* Map controls */}
            {userPosition && <RecenterMapControl position={userPosition} />}
            
            {/* Accessibility controls */}
            <AccessibilityMapControls 
              contrastMode={contrastMode} 
              setContrastMode={setContrastMode}
              largePrintMode={largePrintMode}
              setLargePrintMode={setLargePrintMode}
              mapTileType={mapTileType}
              setMapTileType={setMapTileType}
            />
          </MapContainer>
        </div>
      </div>
      
      {/* Discreet, floating marker legend */}
      <div className="absolute right-3 bottom-3 z-50 opacity-60 hover:opacity-100 transition-opacity">
        <div className="bg-gray-900/90 px-2 py-1 rounded-sm border border-gray-700 shadow-md">
          <div className="flex flex-col gap-1">
            <div className="text-[8px] text-white font-semibold mb-0.5">Map Legend</div>
            <div className="flex items-center gap-1">
              <img src="https://cdn-icons-png.flaticon.com/512/825/825572.png" className="w-3 h-3" alt="VHF repeater" />
              <span className="text-[8px] text-blue-100">VHF</span>
            </div>
            <div className="flex items-center gap-1">
              <img src="https://cdn-icons-png.flaticon.com/512/825/825560.png" className="w-3 h-3" alt="UHF repeater" />
              <span className="text-[8px] text-blue-100">UHF</span>
            </div>
            <div className="flex items-center gap-1">
              <img src="https://cdn-icons-png.flaticon.com/512/6877/6877752.png" className="w-3 h-3" alt="DX spot" />
              <span className="text-[8px] text-blue-100">DX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
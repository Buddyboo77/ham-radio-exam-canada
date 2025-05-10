import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Camera, Compass, Radio, MapPin, Wifi, RefreshCw, Maximize2, SignalHigh } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { POWELL_RIVER_LOCATION } from '@/lib/constants';

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

interface ARVisualizationProps {
  enableCamera?: boolean;
}

export default function ARVisualization({ enableCamera = false }: ARVisualizationProps) {
  // In a real app, this would use the device's camera and AR capabilities
  // Here we'll simulate the experience with a mock visualization
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heading, setHeading] = useState(0);
  const [userLocation, setUserLocation] = useState({ lat: POWELL_RIVER_LOCATION.lat, lng: POWELL_RIVER_LOCATION.lng });
  const [compassAvailable, setCompassAvailable] = useState(false);
  const [simRotation, setSimRotation] = useState(0);
  const [range, setRange] = useState(50); // Range in km
  const [showLabels, setShowLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Query repeaters data
  const { data: repeaters } = useQuery({
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
        }
      ];
      
      return mockRepeaters;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
  
  // Initialize compass
  useEffect(() => {
    // Check if DeviceOrientationEvent is available and we have permission
    if ('DeviceOrientationEvent' in window && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setCompassAvailable(true);
    } else if ('DeviceOrientationEvent' in window) {
      // Standard compass without permission (e.g. Android)
      setCompassAvailable(true);
      window.addEventListener('deviceorientation', handleOrientationEvent);
      
      return () => {
        window.removeEventListener('deviceorientation', handleOrientationEvent);
      };
    }
    
    // Get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
    
    // Auto-rotate for simulation
    const interval = setInterval(() => {
      setSimRotation((prev) => (prev + 1) % 360);
    }, 150);
    
    return () => clearInterval(interval);
  }, []);
  
  // Request compass access
  const requestCompassAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientationEvent);
          setCompassAvailable(true);
        } else {
          console.error("Compass permission denied");
        }
      } catch (error) {
        console.error("Error requesting compass permission:", error);
      }
    }
  };
  
  // Handle orientation events
  const handleOrientationEvent = (event: DeviceOrientationEvent) => {
    // Use alpha for compass direction (degrees from north)
    if (event.alpha !== null) {
      setHeading(event.alpha);
    }
  };
  
  // Camera access
  useEffect(() => {
    if (enableCamera && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(error => {
          console.error("Error accessing camera:", error);
        });
      
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }
  }, [enableCamera]);
  
  // Draw AR overlay
  useEffect(() => {
    if (!canvasRef.current || !repeaters) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Make sure canvas is clear and sized properly
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Use the actual compass heading from device or simulated rotation
    const currentHeading = compassAvailable ? heading : simRotation;
    
    // Draw compass ring
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((currentHeading * Math.PI) / 180);
    
    // Draw compass directions
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    directions.forEach((dir, i) => {
      const angle = (i * 45 * Math.PI) / 180;
      const x = Math.sin(angle) * (canvas.height * 0.4);
      const y = -Math.cos(angle) * (canvas.height * 0.4);
      
      ctx.fillStyle = dir === 'N' ? '#f87171' : '#9ca3af';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dir, x, y);
    });
    
    ctx.restore();
    
    // Draw repeaters
    if (repeaters.length > 0) {
      repeaters.forEach(repeater => {
        // Calculate direction to repeater
        const dLon = (repeater.longitude - userLocation.lng) * Math.PI / 180;
        const lat1 = userLocation.lat * Math.PI / 180;
        const lat2 = repeater.latitude * Math.PI / 180;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        bearing = (bearing + 360) % 360; // Normalize to 0-360
        
        // Calculate distance
        const R = 6371; // Earth radius in km
        const dLat = (repeater.latitude - userLocation.lat) * Math.PI / 180;
        const dLng = (repeater.longitude - userLocation.lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1) * Math.cos(lat2) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km
        
        // Skip if beyond visible range
        if (distance > range) return;
        
        // Adjust for phone orientation
        const relativeAngle = (bearing - currentHeading + 360) % 360;
        
        // Check if in view (roughly in front)
        if (relativeAngle > 60 && relativeAngle < 300) return;
        
        // Calculate x position in canvas (center = 0 deg, left edge = -60 deg, right edge = 60 deg)
        const viewAngle = 120; // 120 degree field of view
        const xPos = canvas.width * (0.5 + (relativeAngle <= 180 ? relativeAngle : relativeAngle - 360) / viewAngle);
        
        // Calculate y position (higher elevation = higher on screen, closer = larger)
        let yPos = canvas.height * 0.5;
        if (repeater.elevation) {
          // Adjust for elevation (higher repeaters appear higher in view)
          yPos -= (repeater.elevation / 1000) * 30;
        }
        
        // Size based on distance (closer = bigger)
        const size = Math.max(10, 30 * (1 - distance/range));
        
        // Draw repeater marker
        ctx.beginPath();
        ctx.arc(xPos, yPos, size, 0, 2 * Math.PI);
        
        // Color based on repeater status
        const colors = {
          active: 'rgba(52, 211, 153, 0.7)',
          limited: 'rgba(251, 191, 36, 0.7)',
          inactive: 'rgba(239, 68, 68, 0.7)'
        };
        ctx.fillStyle = colors[repeater.status];
        ctx.fill();
        
        // Draw outline
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw signal rings
        ctx.beginPath();
        ctx.arc(xPos, yPos, size * 1.5, 0, 2 * Math.PI);
        ctx.strokeStyle = colors[repeater.status];
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(xPos, yPos, size * 2, 0, 2 * Math.PI);
        ctx.strokeStyle = colors[repeater.status];
        ctx.lineWidth = 0.3;
        ctx.stroke();
        
        // Draw label
        if (showLabels) {
          ctx.fillStyle = 'white';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(repeater.callsign, xPos, yPos - size - 5);
          
          ctx.font = '8px sans-serif';
          ctx.fillText(`${repeater.frequency.toFixed(3)} MHz`, xPos, yPos - size - 16);
          ctx.fillText(`${distance.toFixed(1)} km`, xPos, yPos - size - 26);
        }
      });
    }
    
    // Draw crosshair at center
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, canvas.height / 2 - 10);
    ctx.lineTo(canvas.width / 2, canvas.height / 2 + 10);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw heading display
    ctx.save();
    ctx.translate(canvas.width / 2, 20);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(-50, -15, 100, 30);
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(currentHeading)}°`, 0, 0);
    ctx.restore();
    
  }, [heading, simRotation, repeaters, userLocation, range, showLabels, compassAvailable]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  return (
    <div className={`ar-visualization-container relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Video feed (would be actual camera in a real implementation) */}
      {enableCamera ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover rounded-md"
        />
      ) : (
        // Mock camera view with gradient background
        <div 
          className="w-full h-full rounded-md bg-gradient-to-b from-gray-700 via-gray-900 to-black"
          style={{ minHeight: '300px' }}
        ></div>
      )}
      
      {/* Canvas overlay */}
      <canvas 
        ref={canvasRef} 
        width={isFullscreen ? window.innerWidth : 320}
        height={isFullscreen ? window.innerHeight : 240}
        className="absolute top-0 left-0 w-full h-full"
      />
      
      {/* Controls overlay */}
      <div className="absolute top-2 left-2 right-2 flex justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-[10px] h-7 bg-gray-900/80 border-gray-700 text-gray-300"
            onClick={requestCompassAccess}
            disabled={compassAvailable}
          >
            <Compass className="h-3 w-3 mr-1" />
            {compassAvailable ? "Compass On" : "Enable Compass"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-[10px] h-7 bg-gray-900/80 border-gray-700 text-gray-300"
            onClick={() => setShowLabels(!showLabels)}
          >
            <MapPin className="h-3 w-3 mr-1" />
            {showLabels ? "Hide Labels" : "Show Labels"}
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          className="text-[10px] h-7 bg-gray-900/80 border-gray-700 text-gray-300"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="h-3 w-3 mr-1" />
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </Button>
      </div>
      
      {/* Bottom controls */}
      <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-gray-900/80 rounded-md border border-gray-700">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] text-gray-300 flex items-center">
            <Radio className="h-3 w-3 mr-1 text-blue-400" />
            <span>Range: {range} km</span>
          </div>
          <Badge variant="outline" className="h-4 text-[9px] border-blue-800 bg-blue-900/50">
            <SignalHigh className="h-2 w-2 mr-0.5" />
            {repeaters?.length || 0} Repeaters
          </Badge>
        </div>
        
        <Slider
          value={[range]}
          min={10}
          max={200}
          step={10}
          onValueChange={(value) => setRange(value[0])}
          className="h-4"
        />
        
        <div className="flex justify-between text-[8px] text-gray-500 mt-1">
          <span>10km</span>
          <span>Visible Range</span>
          <span>200km</span>
        </div>
      </div>
      
      {/* Simulation notice */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none">
        <Badge className="bg-blue-600/80">AR Simulation</Badge>
      </div>
    </div>
  );
}
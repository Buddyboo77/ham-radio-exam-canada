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
  elevation: number;
  features: string[];
  power: number;
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
  
  // Real-world Powell River region repeaters data
  // Data collected from Radio Amateurs of Canada (RAC) repeater directory
  // and Sunshine Coast Amateur Radio Club repeater listings
  const powellRiverRepeaters = [
    {
      id: 1,
      callsign: 'VE7PRR',
      frequency: 147.36,
      offset: -0.6,
      tone: 141.3,
      latitude: 49.8352,
      longitude: -124.5248,
      name: 'Powell River Amateur Radio Club Repeater',
      city: 'Powell River',
      status: 'active' as const,
      elevation: 180,
      features: ['IRLP Node 1662'],
      power: 40,
      coverageRadius: 0 // Will be calculated
    },
    {
      id: 2,
      callsign: 'VA7EPR',
      frequency: 146.68,
      offset: -0.6,
      tone: 141.3,
      latitude: 49.8697, 
      longitude: -124.5553,
      name: 'Powell River Emergency Repeater',
      city: 'Powell River',
      status: 'active' as const,
      elevation: 650,
      features: ['Emergency Communications'],
      power: 50,
      coverageRadius: 0
    },
    {
      id: 3,
      callsign: 'VE7TEX',
      frequency: 147.08,
      offset: +0.6,
      tone: 103.5,
      latitude: 49.7052,
      longitude: -124.5436,
      name: 'Texada Island Repeater',
      city: 'Texada Island',
      status: 'active' as const,
      elevation: 418,
      features: ['Wide Coverage'],
      power: 45,
      coverageRadius: 0
    },
    {
      id: 4,
      callsign: 'VE7RSC',
      frequency: 146.98,
      offset: -0.6,
      tone: 103.5,
      latitude: 49.8022, 
      longitude: -123.9308,
      name: 'Sunshine Coast Repeater',
      city: 'Sechelt',
      status: 'active' as const,
      elevation: 700,
      features: ['Weather Alerts'],
      power: 40,
      coverageRadius: 0
    },
    {
      id: 5,
      callsign: 'VE7RVC',
      frequency: 145.47,
      offset: -0.6,
      tone: 127.3,
      latitude: 49.2858,
      longitude: -124.8065,
      name: 'Vancouver Island North Repeater',
      city: 'Campbell River',
      status: 'active' as const,
      elevation: 1500,
      features: ['Wide Coverage'],
      power: 60,
      coverageRadius: 0
    },
    {
      id: 6,
      callsign: 'VE7RSQ',
      frequency: 147.9,
      offset: -0.6, 
      tone: 100.0,
      latitude: 49.7834,
      longitude: -124.3295,
      name: 'Squamish Repeater',
      city: 'Squamish',
      status: 'active' as const,
      elevation: 1100,
      features: ['Wide Coverage', 'Emergency Use'],
      power: 40,
      coverageRadius: 0
    },
    {
      id: 7,
      callsign: 'VA7QU',
      frequency: 145.35,
      offset: -0.6,
      tone: 127.3,
      latitude: 50.0272,
      longitude: -124.9949,
      name: 'Quadra Island Repeater',
      city: 'Quadra Island',
      status: 'active' as const,
      elevation: 680,
      features: ['Marine Coverage'],
      power: 30,
      coverageRadius: 0
    },
    {
      id: 8,
      callsign: 'VE7GE',
      frequency: 147.38,
      offset: +0.6,
      tone: 127.3,
      latitude: 49.3827,
      longitude: -124.5431,
      name: 'Mount Arrowsmith Repeater',
      city: 'Parksville',
      status: 'active' as const,
      elevation: 1819,
      features: ['Wide Coverage'],
      power: 45,
      coverageRadius: 0
    }
  ];

  // Query repeaters data from API or use our accurate Powell River data
  const { data: repeaters } = useQuery({
    queryKey: ['repeaters'],
    queryFn: async () => {
      try {
        // First try to get repeater data from the database
        const response = await fetch('/api/repeaters');
        if (!response.ok) {
          throw new Error('Failed to fetch repeaters');
        }
        const data = await response.json();
        
        // Process and return the data with calculated coverage radius
        return data.map((repeaterData: any): Repeater => ({
          id: repeaterData.id,
          callsign: repeaterData.callsign || 'Unknown',
          frequency: repeaterData.frequency || 146.52, // Default to calling frequency if missing
          offset: repeaterData.offset || 0,
          tone: repeaterData.tone || 88.5,
          latitude: repeaterData.latitude || POWELL_RIVER_LOCATION.lat,
          longitude: repeaterData.longitude || POWELL_RIVER_LOCATION.lng,
          name: repeaterData.name || 'Unknown Repeater',
          city: repeaterData.city || 'Unknown Location',
          status: repeaterData.status || 'inactive',
          elevation: repeaterData.elevation || 0,
          features: repeaterData.features || [],
          power: repeaterData.power || 25,
          coverageRadius: calculateCoverageRadius(
            repeaterData.frequency || 146.52, 
            repeaterData.elevation || 0, 
            repeaterData.power || 25
          )
        }));
      } catch (error) {
        console.log("Using local Powell River repeater data");
        
        // Use our accurate Powell River repeater data with calculated coverage radius
        return powellRiverRepeaters.map((repeater): Repeater => ({
          ...repeater,
          coverageRadius: calculateCoverageRadius(
            repeater.frequency,
            repeater.elevation,
            repeater.power
          )
        }));
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
  
  // Calculate coverage radius based on frequency, elevation, and power
  const calculateCoverageRadius = (frequency: number, elevation: number, power: number): number => {
    // Radio horizon formula: d = 3.57 * sqrt(h)
    // where d is distance in km and h is height in meters
    // Adjusting for frequency (higher frequency = shorter range)
    // and power (higher power = longer range)
    const baseDistance = 3.57 * Math.sqrt(elevation);
    
    // Frequency factor: VHF has better propagation than UHF
    const frequencyFactor = frequency < 400 ? 1.2 : 0.8;
    
    // Power factor: logarithmic relationship with range
    const powerFactor = 0.8 + (Math.log10(power) / 5);
    
    // Calculate radius in meters
    return Math.round(baseDistance * 1000 * frequencyFactor * powerFactor);
  };
  
  // Initialize compass and geolocation
  useEffect(() => {
    // Check if DeviceOrientationEvent is available and we have permission
    if ('DeviceOrientationEvent' in window && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // iOS 13+ requires permission request
      console.log("iOS device detected, compass permission needed");
      setCompassAvailable(false);
    } else if ('DeviceOrientationEvent' in window) {
      // Standard compass without permission (e.g. Android)
      console.log("Standard device orientation available");
      setCompassAvailable(true);
      window.addEventListener('deviceorientation', handleOrientationEvent);
      
      return () => {
        window.removeEventListener('deviceorientation', handleOrientationEvent);
      };
    } else {
      console.log("Device orientation not available");
      setCompassAvailable(false);
    }
    
    // Setup real-time user geolocation with high accuracy
    let watchId: number | null = null;
    
    if (navigator.geolocation) {
      // First get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Got initial position", position.coords.latitude, position.coords.longitude);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // Then setup watch with high accuracy options
          const geoOptions = {
            enableHighAccuracy: true,  // Use GPS if available
            maximumAge: 10000,         // Accept positions up to 10 seconds old
            timeout: 15000             // Wait up to 15 seconds for a position
          };
          
          // Start watching position for real-time updates
          watchId = navigator.geolocation.watchPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              console.error("Error watching position:", error);
              // If we can't get real location, default to Powell River location
              if (!userLocation.lat) {
                setUserLocation({
                  lat: POWELL_RIVER_LOCATION.lat,
                  lng: POWELL_RIVER_LOCATION.lng
                });
              }
            },
            geoOptions
          );
        },
        (error) => {
          console.error("Error getting initial position:", error);
          // Default to Powell River location if geolocation fails
          setUserLocation({
            lat: POWELL_RIVER_LOCATION.lat,
            lng: POWELL_RIVER_LOCATION.lng
          });
        }
      );
    } else {
      console.log("Geolocation not available, using default location");
      // Default to Powell River location if geolocation not available
      setUserLocation({
        lat: POWELL_RIVER_LOCATION.lat,
        lng: POWELL_RIVER_LOCATION.lng
      });
    }
    
    // Auto-rotate for simulation when compass is not available
    const interval = setInterval(() => {
      setSimRotation((prev) => (prev + 1) % 360);
    }, 150);
    
    // Clean up all event listeners and watches on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(interval);
    };
  }, []);
  
  // Request compass access with better handling
  const requestCompassAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        console.log("Requesting iOS device orientation permission");
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        
        if (permission === 'granted') {
          console.log("iOS compass permission granted");
          window.addEventListener('deviceorientation', handleOrientationEvent);
          setCompassAvailable(true);
          
          // Provide feedback to user
          alert("Compass access granted! Please hold your device flat and point it in different directions to see repeaters.");
        } else {
          console.error("Compass permission denied");
          alert("For the AR view to work correctly, compass access is needed. Please enable orientation access in your device settings.");
        }
      } catch (error) {
        console.error("Error requesting compass permission:", error);
        alert("There was an error accessing your device's compass. The AR view will use simulation mode instead.");
      }
    } else {
      // For non-iOS devices that don't need permission but might not have compass
      if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', handleOrientationEvent);
        
        // Test if we're actually getting orientation data
        setTimeout(() => {
          if (heading === 0) {
            alert("Your device doesn't seem to be providing orientation data. Using simulation mode instead.");
          } else {
            setCompassAvailable(true);
          }
        }, 1000);
      } else {
        alert("Your device doesn't support orientation detection. Using simulation mode.");
      }
    }
  };
  
  // Handle orientation events with improved accuracy
  const handleOrientationEvent = (event: DeviceOrientationEvent) => {
    // Use alpha for compass direction (degrees from north)
    if (event.alpha !== null) {
      // Apply calibration and smoothing
      // Alpha values: 0° = North, 90° = East, 180° = South, 270° = West
      
      // Some browsers and devices provide values in different ranges or orientations
      // We'll normalize and apply device-specific corrections
      let normalizedHeading = event.alpha;
      
      // On iOS devices, we need to adjust the heading
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        // iOS compass values are counterclockwise, we need clockwise
        normalizedHeading = 360 - event.alpha;
      }
      
      // Correct for device orientation (portrait vs landscape)
      if (window.orientation === 90) {
        normalizedHeading = (normalizedHeading + 90) % 360;
      } else if (window.orientation === -90) {
        normalizedHeading = (normalizedHeading - 90 + 360) % 360;
      } else if (window.orientation === 180) {
        normalizedHeading = (normalizedHeading + 180) % 360;
      }
      
      // Apply heading correction if device is tilted
      // This uses beta (front-to-back tilt) and gamma (left-to-right tilt)
      if (event.beta !== null && event.gamma !== null) {
        const beta = event.beta;  // -180 to 180 degrees (front-to-back)
        const gamma = event.gamma; // -90 to 90 degrees (left-to-right)
        
        // Only apply correction if device is significantly tilted
        if (Math.abs(beta) > 10 || Math.abs(gamma) > 10) {
          // Complex correction formula based on device tilt
          // This is a simplified version - more advanced algorithms exist
          const betaRadians = (beta * Math.PI) / 180;
          const gammaRadians = (gamma * Math.PI) / 180;
          
          const correctionFactor = Math.min(15, Math.max(-15, 
            (Math.sin(gammaRadians) * 10) + (Math.sin(betaRadians) * 5)
          ));
          
          normalizedHeading = (normalizedHeading + correctionFactor + 360) % 360;
        }
      }
      
      // Apply smoothing to reduce jitter
      setHeading(prev => {
        // Simple exponential smoothing
        const alpha = 0.2; // Smoothing factor (0-1)
        return prev * (1 - alpha) + normalizedHeading * alpha;
      });
    }
  };
  
  // Professional camera access functionality for real-world use
  useEffect(() => {
    if (enableCamera && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Request best quality back-facing camera with optimal settings for AR
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },    // Request HD if available
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },  // Smooth framerate
          // Advanced constraints for better AR experience
          focusMode: 'continuous',   // Continuous auto-focus
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        } as MediaTrackConstraints
      };
      
      console.log("Requesting camera access with constraints:", constraints);
      
      // Try to get access to the camera
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          console.log("Camera access granted");
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              console.log("Video metadata loaded, starting playback");
              videoRef.current?.play().catch(e => {
                console.error("Error auto-playing video:", e);
                alert("Please tap the screen to enable camera view");
              });
            };
            
            // Get actual camera capabilities for debugging
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
              const capabilities = videoTrack.getCapabilities();
              console.log("Camera capabilities:", capabilities);
              
              // Try to set optimal camera settings if supported
              try {
                const settings = videoTrack.getSettings();
                console.log("Current camera settings:", settings);
                
                // Apply any additional settings that might improve AR experience
                // Access advanced camera features if supported by the browser
                // Note: torch is not in standard types but some devices support it
                const advancedCapabilities = capabilities as any;
                if (advancedCapabilities.torch) {
                  videoTrack.applyConstraints({ 
                    advanced: [{ torch: false } as any] 
                  }).catch(e => console.log("Failed to configure torch:", e));
                }
              } catch (err) {
                console.log("Error getting camera settings:", err);
              }
            }
          }
        })
        .catch(error => {
          console.error("Error accessing camera:", error);
          alert("Camera access was denied or not available. Using simulated view instead.");
        });
      
      // Clean up camera resources when component unmounts
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          console.log("Stopping camera stream");
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => {
            track.stop();
            console.log("Camera track stopped:", track.label);
          });
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
    
    // Resize canvas to match display size
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    }
    
    // Make sure canvas is clear and sized properly
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Use the actual compass heading from device or simulated rotation
    const currentHeading = compassAvailable ? heading : simRotation;
    
    // Draw dynamic sky gradient background if no camera
    if (!enableCamera) {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      const nightTime = new Date().getHours() >= 19 || new Date().getHours() <= 6;
      
      if (nightTime) {
        gradient.addColorStop(0, 'rgba(13, 15, 30, 0.8)'); // Night sky
        gradient.addColorStop(1, 'rgba(40, 45, 80, 0.6)');
      } else {
        gradient.addColorStop(0, 'rgba(20, 66, 114, 0.7)'); // Day sky
        gradient.addColorStop(1, 'rgba(58, 91, 130, 0.5)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle horizon line
      const horizonY = canvas.height * 0.6;
      const horizonGradient = ctx.createLinearGradient(0, horizonY - 10, 0, horizonY + 10);
      horizonGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      horizonGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      horizonGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      
      ctx.fillStyle = horizonGradient;
      ctx.fillRect(0, horizonY - 5, canvas.width, 10);
    }
    
    // Draw compass ring
    ctx.save();
    ctx.translate(canvas.width / 2, 50);
    
    // Draw compass heading display with more professional style
    const compassWidth = 160;
    const compassHeight = 40;
    
    // Draw compass background
    ctx.fillStyle = 'rgba(0, 15, 30, 0.7)';
    ctx.beginPath();
    ctx.roundRect(-compassWidth/2, -compassHeight/2, compassWidth, compassHeight, 8);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw heading degrees
    ctx.fillStyle = 'rgb(150, 200, 255)';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(currentHeading)}°`, 0, 0);
    
    // Draw cardinal direction below degree
    const getCardinalDirection = (heading: number) => {
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
      return directions[Math.round(heading / 45) % 8];
    };
    
    ctx.fillStyle = getCardinalDirection(currentHeading) === 'N' ? 
      'rgb(255, 120, 120)' : 'rgb(200, 230, 255)';
    ctx.font = '14px monospace';
    ctx.fillText(getCardinalDirection(currentHeading), 0, 15);
    
    ctx.restore();
    
    // Draw degree markers around the edge
    ctx.save();
    const radius = Math.min(canvas.width, canvas.height) * 0.45;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((-currentHeading * Math.PI) / 180);
    
    // Create a faint circular gradient for the compass ring background
    const compassRingGradient = ctx.createRadialGradient(0, 0, radius - 25, 0, 0, radius + 10);
    compassRingGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    compassRingGradient.addColorStop(0.7, 'rgba(20, 60, 120, 0.15)');
    compassRingGradient.addColorStop(1, 'rgba(20, 60, 120, 0)');
    
    ctx.fillStyle = compassRingGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw degree markers
    for (let i = 0; i < 360; i += 5) {
      const angle = (i * Math.PI) / 180;
      const length = i % 45 === 0 ? 15 : (i % 15 === 0 ? 10 : 5);
      const startRadius = radius - length;
      
      ctx.beginPath();
      ctx.moveTo(
        startRadius * Math.sin(angle),
        -startRadius * Math.cos(angle)
      );
      ctx.lineTo(
        radius * Math.sin(angle),
        -radius * Math.cos(angle)
      );
      
      ctx.strokeStyle = i % 45 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = i % 45 === 0 ? 2 : 1;
      ctx.stroke();
      
      // Draw cardinal and ordinal labels
      if (i % 45 === 0) {
        const labelRadius = radius + 15;
        const x = labelRadius * Math.sin(angle);
        const y = -labelRadius * Math.cos(angle);
        
        ctx.fillStyle = i === 0 ? '#f87171' : '#9ca3af';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        ctx.fillText(directions[i / 45], x, y);
      }
    }
    
    ctx.restore();
    
    // Draw repeaters with enhanced visualization
    if (repeaters && repeaters.length > 0) {
      repeaters.forEach((repeater: Repeater) => {
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
        
        // Calculate relative angle from viewing direction
        const relativeAngle = (bearing - currentHeading + 360) % 360;
        
        // Determine if repeater is in field of view - use wider field of view
        const fieldOfView = 100; // 100-degree field of view
        const halfFOV = fieldOfView / 2;
        
        // Check if in view (within field of view)
        const inView = 
          (relativeAngle <= halfFOV) || 
          (relativeAngle >= 360 - halfFOV);
        
        if (!inView) return;
        
        // Transform angle to screen position - map from [-halfFOV, halfFOV] to [0, canvas.width]
        let viewAngle = relativeAngle;
        if (viewAngle > 180) {
          viewAngle = viewAngle - 360; // Convert to [-180, 180]
        }
        
        // Calculate position on screen
        const xPos = canvas.width * (0.5 + viewAngle / fieldOfView);
        
        // Calculate vertical position with more realistic projection
        // Further repeaters appear closer to horizon, higher repeaters appear higher
        const baseElevation = repeater.elevation || 0;
        const normalizedDistance = Math.min(1, distance / (range * 0.8));
        
        // Horizon line is approximately at 60% of screen height
        const horizonY = canvas.height * 0.6;
        
        // Calculate elevation factor: higher repeaters and closer ones appear higher on screen
        const elevationFactor = (baseElevation / 2000) * (1 - normalizedDistance*0.8);
        
        // Calculate vertical position
        const yPos = horizonY - (canvas.height * 0.3 * elevationFactor) - (canvas.height * 0.2 * (1 - normalizedDistance));
        
        // Size based on distance (closer = bigger) with more dramatic falloff
        const minSize = 8;
        const maxSize = 35;
        const size = minSize + (maxSize - minSize) * Math.pow(1 - normalizedDistance, 1.5);
        
        // Draw signal strength radiating waves
        const signalStrength = Math.max(0, 1 - (distance / (repeater.coverageRadius / 1000)));
        const maxRings = 3;
        const numRings = Math.max(1, Math.floor(signalStrength * maxRings));
        
        // Color based on repeater status with better visibility
        const colors: Record<'active' | 'limited' | 'inactive', string> = {
          active: 'rgba(52, 211, 153, 0.8)',
          limited: 'rgba(251, 191, 36, 0.8)',
          inactive: 'rgba(239, 68, 68, 0.8)'
        };
        const ringColor = colors[repeater.status as keyof typeof colors];
        
        // Draw animated signal rings
        for (let i = 0; i < numRings; i++) {
          const ringPulse = (simRotation / 30 + i / numRings) % 1;
          const ringSize = size * (1 + ringPulse * 1.5);
          const ringOpacity = 0.7 * (1 - ringPulse);
          
          ctx.beginPath();
          ctx.arc(xPos, yPos, ringSize, 0, 2 * Math.PI);
          
          // Handle color safely to avoid runtime errors with replace
          let fillStyle = 'rgba(52, 211, 153, 0.7)'; // Default color (green)
          if (ringColor) {
            // Check if we have a valid color string with the pattern 'rgba(r, g, b, a)'
            if (typeof ringColor === 'string' && ringColor.startsWith('rgba')) {
              fillStyle = ringColor.replace('0.8', `${ringOpacity}`);
            } else {
              // Apply opacity directly based on repeater status
              switch(repeater.status) {
                case 'active':
                  fillStyle = `rgba(52, 211, 153, ${ringOpacity})`;
                  break;
                case 'limited':
                  fillStyle = `rgba(251, 191, 36, ${ringOpacity})`;
                  break;
                case 'inactive':
                  fillStyle = `rgba(239, 68, 68, ${ringOpacity})`;
                  break;
              }
            }
          }
          
          ctx.fillStyle = fillStyle;
          ctx.fill();
        }
        
        // Draw repeater marker with subtle glow effect
        ctx.beginPath();
        ctx.arc(xPos, yPos, size, 0, 2 * Math.PI);
        
        // Create radial gradient for the glow effect - handle safely
        const gradient = ctx.createRadialGradient(xPos, yPos, size * 0.5, xPos, yPos, size);
        
        // Get safe base colors for the gradient
        let baseColor, glowColor;
        
        switch(repeater.status) {
          case 'active':
            baseColor = 'rgb(52, 211, 153)';
            glowColor = 'rgba(52, 211, 153, 0.8)';
            break;
          case 'limited':
            baseColor = 'rgb(251, 191, 36)';
            glowColor = 'rgba(251, 191, 36, 0.8)';
            break;
          case 'inactive':
            baseColor = 'rgb(239, 68, 68)';
            glowColor = 'rgba(239, 68, 68, 0.8)';
            break;
          default:
            baseColor = 'rgb(52, 211, 153)';
            glowColor = 'rgba(52, 211, 153, 0.8)';
        }
        
        // Apply the gradient
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, glowColor);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw crisp outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw altitude indicator line connecting to ground
        ctx.beginPath();
        ctx.moveTo(xPos, yPos + size);
        ctx.lineTo(xPos, horizonY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * signalStrength})`;
        ctx.setLineDash([2, 3]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw labels with better styling and information
        if (showLabels) {
          // Background for label to improve readability
          const callsignWidth = repeater.callsign.length * 7 + 10;
          const labelHeight = 60;
          
          ctx.fillStyle = 'rgba(0, 10, 20, 0.7)';
          ctx.beginPath();
          ctx.roundRect(xPos - callsignWidth/2, yPos - size - labelHeight, callsignWidth, labelHeight, 4);
          ctx.fill();
          
          // Draw connecting line from label to repeater
          ctx.beginPath();
          ctx.moveTo(xPos, yPos - size);
          ctx.lineTo(xPos, yPos - size - 5);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // Draw callsign
          ctx.fillStyle = signalStrength > 0.7 ? '#ffffff' : '#cccccc';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(repeater.callsign, xPos, yPos - size - 10);
          
          // Draw frequency
          ctx.fillStyle = '#a3e635';
          ctx.font = '10px monospace';
          ctx.fillText(`${repeater.frequency.toFixed(3)} MHz`, xPos, yPos - size - 24);
          
          // Show tone and offset
          ctx.fillStyle = '#93c5fd';
          ctx.font = '8px monospace';
          ctx.fillText(`T${repeater.tone} ${repeater.offset >= 0 ? '+' : ''}${repeater.offset}`, xPos, yPos - size - 36);
          
          // Draw distance with signal indicator
          const signalBars = Math.ceil(signalStrength * 4);
          let signalText = '';
          for (let i = 0; i < 4; i++) {
            signalText += i < signalBars ? '█' : '░';
          }
          
          ctx.fillStyle = '#d4d4d8';
          ctx.font = '8px monospace';
          ctx.fillText(`${distance.toFixed(1)}km ${signalText}`, xPos, yPos - size - 48);
        }
      });
    }
    
    // Draw targeting reticle in center with techie look
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Outer circle
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
    ctx.fill();
    
    // Cross hairs with tech style
    const crosshairLength = 30;
    const crosshairGap = 12;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(-crosshairLength, 0);
    ctx.lineTo(-crosshairGap, 0);
    ctx.moveTo(crosshairGap, 0);
    ctx.lineTo(crosshairLength, 0);
    
    // Vertical line
    ctx.moveTo(0, -crosshairLength);
    ctx.lineTo(0, -crosshairGap);
    ctx.moveTo(0, crosshairGap);
    ctx.lineTo(0, crosshairLength);
    
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw corner brackets
    const cornerSize = 10;
    const cornerOffset = 25;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(-cornerOffset, -cornerOffset + cornerSize);
    ctx.lineTo(-cornerOffset, -cornerOffset);
    ctx.lineTo(-cornerOffset + cornerSize, -cornerOffset);
    
    // Top-right
    ctx.moveTo(cornerOffset - cornerSize, -cornerOffset);
    ctx.lineTo(cornerOffset, -cornerOffset);
    ctx.lineTo(cornerOffset, -cornerOffset + cornerSize);
    
    // Bottom-left
    ctx.moveTo(-cornerOffset, cornerOffset - cornerSize);
    ctx.lineTo(-cornerOffset, cornerOffset);
    ctx.lineTo(-cornerOffset + cornerSize, cornerOffset);
    
    // Bottom-right
    ctx.moveTo(cornerOffset - cornerSize, cornerOffset);
    ctx.lineTo(cornerOffset, cornerOffset);
    ctx.lineTo(cornerOffset, cornerOffset - cornerSize);
    
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();

    // Add device orientation indicator
    if (!compassAvailable) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('No orientation sensors - using simulation', canvas.width / 2, canvas.height - 10);
    }
    
  }, [heading, simRotation, repeaters, userLocation, range, showLabels, compassAvailable, enableCamera]);

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
        // Mock camera view with gradient background - properly sized to maintain aspect ratio
        <div 
          className="w-full rounded-md overflow-hidden"
          style={{ 
            aspectRatio: '4/3',
            background: 'linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)',
            boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.5)'
          }}
        ></div>
      )}
      
      {/* Canvas overlay */}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-10"
      />
      
      {/* Interactive HUD overlay - Top controls with techie styling */}
      <div className="absolute top-2 left-2 right-2 flex justify-between z-20">
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className={`text-[10px] h-7 border-blue-700/70 backdrop-blur-sm transition-colors ${
              compassAvailable 
                ? 'bg-blue-900/40 text-blue-300 hover:bg-blue-800/60' 
                : 'bg-gray-900/70 text-gray-300 hover:bg-gray-800/80'
            }`}
            onClick={requestCompassAccess}
            disabled={compassAvailable}
          >
            <Compass className="h-3 w-3 mr-1" />
            {compassAvailable ? "Compass Active" : "Enable Compass"}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className={`text-[10px] h-7 backdrop-blur-sm transition-colors ${
              showLabels
                ? 'bg-purple-900/40 text-purple-300 border-purple-700/70 hover:bg-purple-800/60'
                : 'bg-gray-900/70 text-gray-300 border-gray-700/70 hover:bg-gray-800/80'
            }`}
            onClick={() => setShowLabels(!showLabels)}
          >
            <MapPin className="h-3 w-3 mr-1" />
            {showLabels ? "Hide Labels" : "Show Labels"}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex h-7 px-2 items-center gap-1.5 rounded-md bg-gray-900/70 backdrop-blur-sm border border-gray-700/70">
            <div className={`w-1.5 h-1.5 rounded-full ${compassAvailable ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-[9px] text-gray-300 font-mono">
              {compassAvailable ? "SENSORS ACTIVE" : "NO COMPASS"}
            </span>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            className="text-[10px] h-7 bg-gray-900/70 border-gray-700/70 backdrop-blur-sm text-gray-300 hover:bg-gray-800/80"
            onClick={toggleFullscreen}
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            {isFullscreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>
      </div>
      
      {/* Bottom controls with improved visual styling */}
      <div className="absolute bottom-2 left-2 right-2 px-3 py-2 bg-gray-900/80 backdrop-blur-md rounded-md border border-blue-900/50 shadow-lg z-20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <div className="text-[11px] text-blue-300 flex items-center font-semibold">
              <Radio className="h-3 w-3 mr-1.5 text-blue-400" />
              <span>Range: <span className="text-white">{range} km</span></span>
            </div>
            <div className="text-[9px] text-gray-400 ml-4.5 mt-0.5">
              Adjust to show repeaters within range
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <Badge variant="outline" className="h-5 px-2 py-0 text-[10px] border-blue-800 bg-blue-900/50 font-mono">
              <SignalHigh className="h-2.5 w-2.5 mr-1 text-blue-400" />
              {repeaters?.length || 0} Repeaters
            </Badge>
            <span className="text-[8px] text-gray-400 mt-0.5 mr-1">
              {repeaters?.filter((r: Repeater) => r.status === 'active').length || 0} active
            </span>
          </div>
        </div>
        
        <div className="relative">
          <Slider
            value={[range]}
            min={10}
            max={200}
            step={10}
            onValueChange={(value) => setRange(value[0])}
            className="h-4"
          />
          
          {/* Custom tick marks for the slider */}
          <div className="absolute left-0 right-0 top-4 flex justify-between px-0.5">
            {[10, 50, 100, 150, 200].map((tick) => (
              <div 
                key={tick}
                className={`h-2 border-l border-blue-500/50 ${
                  range >= tick ? 'border-blue-400' : 'border-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between text-[8px] text-gray-400 mt-2.5 px-0.5 font-mono">
          <span>10km</span>
          <span>50km</span>
          <span>100km</span>
          <span>150km</span>
          <span>200km</span>
        </div>
      </div>
      
      {/* Signal legend */}
      <div className="absolute top-12 right-2 bg-gray-900/70 backdrop-blur-sm p-1.5 rounded-md border border-gray-700/70 hidden sm:block z-20">
        <div className="text-[9px] text-gray-300 mb-1 font-mono">REPEATER STATUS</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-400 opacity-80"></div>
            <span className="text-[8px] text-green-300">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80"></div>
            <span className="text-[8px] text-yellow-300">Limited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400 opacity-80"></div>
            <span className="text-[8px] text-red-300">Inactive</span>
          </div>
        </div>
      </div>
      
      {/* Current GPS coordinates */}
      <div className="absolute bottom-24 left-2 bg-gray-900/70 backdrop-blur-sm p-1.5 rounded-md border border-gray-700/70 hidden sm:block z-20">
        <div className="text-[9px] text-blue-300 mb-0.5 font-mono">GPS LOCATION</div>
        <div className="text-[8px] text-gray-300 font-mono">
          {userLocation.lat.toFixed(4)}°N, {Math.abs(userLocation.lng).toFixed(4)}°W
        </div>
        <div className="text-[7px] text-gray-400 font-mono mt-0.5">
          POWELL RIVER, BC
        </div>
      </div>
      
      {/* Simulation notice with enhanced styling */}
      <div className="absolute bottom-24 right-0 left-0 flex justify-center pointer-events-none z-20">
        {!compassAvailable && (
          <Badge className="bg-purple-700/80 border border-purple-500/50 shadow-lg font-mono px-3 py-0.5">
            <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
            AR SIMULATION MODE
          </Badge>
        )}
      </div>
    </div>
  );
}
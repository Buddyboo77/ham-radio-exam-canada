import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Eye, Layers, ZoomIn, Target, Ruler, CloudRain, Signal, Wifi, Users, Laptop } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent } from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TooltipTrigger } from '@/components/ui/tooltip';

// Define map tile type
type MapTileType = 'standard' | 'highContrast' | 'satellite' | 'monochrome';

interface EnhancedMapControlsProps {
  contrastMode: boolean;
  setContrastMode: (value: boolean) => void;
  largePrintMode: boolean;
  setLargePrintMode: (value: boolean) => void;
  mapTileType: MapTileType;
  setMapTileType: (type: MapTileType) => void;
  showRepeaters: boolean;
  setShowRepeaters: (value: boolean) => void;
  showDXSpots: boolean;
  setShowDXSpots: (value: boolean) => void;
  showUsers: boolean;
  setShowUsers: (value: boolean) => void;
  showWeather: boolean;
  setShowWeather: (value: boolean) => void;
  showCoverage: boolean;
  setShowCoverage: (value: boolean) => void;
  coverageStyle: 'simple' | 'gradient' | 'terrain';
  setCoverageStyle: (style: 'simple' | 'gradient' | 'terrain') => void;
  isMeasuring: boolean;
  setIsMeasuring: (value: boolean) => void;
  onClearMeasurements: () => void;
}

export function EnhancedMapControls({
  contrastMode,
  setContrastMode,
  largePrintMode,
  setLargePrintMode,
  mapTileType,
  setMapTileType,
  showRepeaters,
  setShowRepeaters,
  showDXSpots,
  setShowDXSpots,
  showUsers,
  setShowUsers,
  showWeather,
  setShowWeather,
  showCoverage,
  setShowCoverage,
  coverageStyle,
  setCoverageStyle,
  isMeasuring,
  setIsMeasuring,
  onClearMeasurements,
}: EnhancedMapControlsProps) {
  const map = useMap();
  
  // Refs to track button click state
  const contrastButtonRef = useRef<HTMLButtonElement>(null);
  const layersButtonRef = useRef<HTMLButtonElement>(null);
  const largePrintButtonRef = useRef<HTMLButtonElement>(null);
  
  // Refs to track action in progress
  const contrastModeActionInProgress = useRef(false);
  const cycleMapTypeActionInProgress = useRef(false);
  const largePrintActionInProgress = useRef(false);
  
  // Toggle high contrast mode with debounce
  const toggleContrastMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple rapid clicks
    if (contrastModeActionInProgress.current) {
      return;
    }
    
    contrastModeActionInProgress.current = true;
    
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
      if (contrastButtonRef.current) {
        contrastButtonRef.current.setAttribute('aria-pressed', String(newContrastMode));
      }
    } catch (error) {
      console.error('Error toggling contrast mode:', error);
    } finally {
      // Reset action flag after a delay
      setTimeout(() => {
        contrastModeActionInProgress.current = false;
      }, 300);
    }
  };
  
  // Toggle large print mode with debounce
  const toggleLargePrintMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple rapid clicks
    if (largePrintActionInProgress.current) {
      return;
    }
    
    largePrintActionInProgress.current = true;
    
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
      if (largePrintButtonRef.current) {
        largePrintButtonRef.current.setAttribute('aria-pressed', String(newLargePrintMode));
      }
    } catch (error) {
      console.error('Error toggling large print mode:', error);
    } finally {
      // Reset action flag after a delay
      setTimeout(() => {
        largePrintActionInProgress.current = false;
      }, 300);
    }
  };

  // Cycle through map types with debounce
  const cycleMapType = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple rapid clicks
    if (cycleMapTypeActionInProgress.current) {
      return;
    }
    
    cycleMapTypeActionInProgress.current = true;
    
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
      if (layersButtonRef.current) {
        layersButtonRef.current.setAttribute('title', `Current map style: ${nextMapType}. Click to change.`);
      }
    } catch (error) {
      console.error('Error cycling map type:', error);
    } finally {
      // Reset action flag after a delay
      setTimeout(() => {
        cycleMapTypeActionInProgress.current = false;
      }, 300);
    }
  };

  // Toggle layer visibility for repeaters
  const toggleRepeaters = () => {
    setShowRepeaters(!showRepeaters);
  };

  // Toggle layer visibility for DX spots
  const toggleDXSpots = () => {
    setShowDXSpots(!showDXSpots);
  };

  // Toggle layer visibility for users
  const toggleUsers = () => {
    setShowUsers(!showUsers);
  };

  // Toggle weather overlay
  const toggleWeather = () => {
    setShowWeather(!showWeather);
  };

  // Toggle coverage visualization
  const toggleCoverage = () => {
    setShowCoverage(!showCoverage);
  };

  // Toggle measuring mode
  const toggleMeasuring = () => {
    const newMeasuringState = !isMeasuring;
    setIsMeasuring(newMeasuringState);
    
    // Clear measurements when turning off
    if (!newMeasuringState) {
      onClearMeasurements();
    }
  };

  // Cycle through coverage styles
  const cycleCoverageStyle = () => {
    const styles: ('simple' | 'gradient' | 'terrain')[] = ['simple', 'gradient', 'terrain'];
    const currentIndex = styles.indexOf(coverageStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    
    setCoverageStyle(styles[nextIndex]);
  };

  // Refresh all layers if map is ready
  useEffect(() => {
    if (map) {
      map.invalidateSize();
    }
  }, [map, mapTileType, largePrintMode]);

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control" style={{ marginTop: "40px", marginRight: "10px" }}>
        <div className="flex flex-col gap-1 bg-gray-900/85 p-1.5 rounded-sm shadow-md border border-gray-700">
          <TooltipProvider>
            {/* High contrast mode */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  ref={contrastButtonRef}
                  type="button"
                  className={`flex items-center justify-center w-6 h-6 ${contrastMode ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
                  onClick={toggleContrastMode}
                  aria-pressed={contrastMode}
                >
                  <Eye className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Toggle high contrast mode</p>
              </TooltipContent>
            </Tooltip>

            {/* Large print mode */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  ref={largePrintButtonRef}
                  type="button"
                  className={`flex items-center justify-center w-6 h-6 ${largePrintMode ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
                  onClick={toggleLargePrintMode}
                  aria-pressed={largePrintMode}
                >
                  <ZoomIn className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Toggle large print mode</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Cycle map types */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  ref={layersButtonRef}
                  type="button"
                  className="flex items-center justify-center w-6 h-6 bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm"
                  onClick={cycleMapType}
                  title={`Current map style: ${mapTileType}. Click to change.`}
                >
                  <Layers className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Cycle map styles</p>
              </TooltipContent>
            </Tooltip>

            {/* Toggle repeaters */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button"
                  className={`flex items-center justify-center w-6 h-6 ${showRepeaters ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
                  onClick={toggleRepeaters}
                  aria-pressed={showRepeaters}
                >
                  <Signal className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Toggle repeaters</p>
              </TooltipContent>
            </Tooltip>

            {/* Toggle DX spots */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button"
                  className={`flex items-center justify-center w-6 h-6 ${showDXSpots ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
                  onClick={toggleDXSpots}
                  aria-pressed={showDXSpots}
                >
                  <Wifi className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Toggle DX spots</p>
              </TooltipContent>
            </Tooltip>

            {/* Toggle users */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button"
                  className={`flex items-center justify-center w-6 h-6 ${showUsers ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
                  onClick={toggleUsers}
                  aria-pressed={showUsers}
                >
                  <Users className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Toggle user locations</p>
              </TooltipContent>
            </Tooltip>

            {/* Toggle weather */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button"
                  className={`flex items-center justify-center w-6 h-6 ${showWeather ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
                  onClick={toggleWeather}
                  aria-pressed={showWeather}
                >
                  <CloudRain className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Toggle weather overlay</p>
              </TooltipContent>
            </Tooltip>

            {/* Toggle coverage */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button"
                  className={`flex items-center justify-center w-6 h-6 ${showCoverage ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
                  onClick={toggleCoverage}
                  aria-pressed={showCoverage}
                >
                  <Target className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Toggle coverage visualization</p>
              </TooltipContent>
            </Tooltip>

            {/* Toggle measuring */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button"
                  className={`flex items-center justify-center w-6 h-6 ${isMeasuring ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
                  onClick={toggleMeasuring}
                  aria-pressed={isMeasuring}
                >
                  <Ruler className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Toggle distance measurement</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
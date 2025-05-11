import { useMap } from 'react-leaflet';
import { 
  Eye, 
  ZoomIn, 
  Layers,
  Radio,
  Signal, 
  BarChart, 
  Users, 
  Cloud,
  Navigation,
  Ruler
} from 'lucide-react';

interface EnhancedMapControlsProps {
  // Map type and accessibility
  contrastMode: boolean;
  setContrastMode: (value: boolean) => void;
  largePrintMode: boolean;
  setLargePrintMode: (value: boolean) => void;
  mapTileType: 'standard' | 'highContrast' | 'satellite' | 'monochrome';
  setMapTileType: (type: 'standard' | 'highContrast' | 'satellite' | 'monochrome') => void;
  
  // Layer visibility
  showRepeaters: boolean;
  setShowRepeaters: (value: boolean) => void;
  showDXSpots: boolean;
  setShowDXSpots: (value: boolean) => void;
  showUsers: boolean;
  setShowUsers: (value: boolean) => void;
  showWeather: boolean;
  setShowWeather: (value: boolean) => void;
  
  // Coverage options
  showCoverage: boolean;
  setShowCoverage: (value: boolean) => void;
  coverageStyle: 'simple' | 'gradient' | 'terrain';
  setCoverageStyle: (style: 'simple' | 'gradient' | 'terrain') => void;
  
  // Measuring tools
  isMeasuring: boolean;
  setIsMeasuring: (value: boolean) => void;
  onClearMeasurements: () => void;
}

export function EnhancedMapControls({
  // Map type and accessibility
  contrastMode,
  setContrastMode,
  largePrintMode,
  setLargePrintMode,
  mapTileType,
  setMapTileType,
  
  // Layer visibility
  showRepeaters,
  setShowRepeaters,
  showDXSpots,
  setShowDXSpots,
  showUsers,
  setShowUsers,
  showWeather,
  setShowWeather,
  
  // Coverage options
  showCoverage,
  setShowCoverage,
  coverageStyle,
  setCoverageStyle,
  
  // Measuring tools
  isMeasuring,
  setIsMeasuring,
  onClearMeasurements
}: EnhancedMapControlsProps) {
  const map = useMap();
  
  // Toggle high contrast mode
  const toggleContrastMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    e.preventDefault();
    e.stopPropagation();
    
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
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const types: ('standard' | 'highContrast' | 'satellite' | 'monochrome')[] = 
        ['standard', 'highContrast', 'satellite', 'monochrome'];
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
  
  // Toggle measuring mode
  const toggleMeasuring = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsMeasuring(!isMeasuring);
      
      if (isMeasuring) {
        // If we're turning off measuring, clear the measurements
        onClearMeasurements();
        
        // Reset cursor
        const mapContainer = document.querySelector('.leaflet-container');
        if (mapContainer) {
          mapContainer.classList.remove('measuring-cursor');
        }
      } else {
        // If we're turning on measuring, set a special cursor
        const mapContainer = document.querySelector('.leaflet-container');
        if (mapContainer) {
          mapContainer.classList.add('measuring-cursor');
        }
      }
    } catch (error) {
      console.error('Error toggling measuring mode:', error);
    }
  };
  
  // Toggle coverage style
  const toggleCoverageStyle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const styles: ('simple' | 'gradient' | 'terrain')[] = ['simple', 'gradient', 'terrain'];
      const currentIndex = styles.indexOf(coverageStyle);
      const nextIndex = (currentIndex + 1) % styles.length;
      
      setCoverageStyle(styles[nextIndex]);
      
      // If coverage is not shown, turn it on
      if (!showCoverage) {
        setShowCoverage(true);
      }
    } catch (error) {
      console.error('Error cycling coverage style:', error);
    }
  };
  
  return (
    <>
      {/* Accessibility controls */}
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
      
      {/* Layer controls */}
      <div className="leaflet-bottom leaflet-right">
        <div className="leaflet-control" style={{ marginBottom: "40px", marginRight: "10px" }}>
          <div className="flex flex-col gap-1 bg-gray-900/85 p-1.5 rounded-sm shadow-md border border-gray-700">
            <button 
              type="button"
              className={`flex items-center justify-center w-6 h-6 ${showRepeaters ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
              onClick={() => setShowRepeaters(!showRepeaters)}
              title="Toggle repeaters"
              aria-pressed={showRepeaters}
            >
              <Radio className="h-3 w-3" />
            </button>
            
            <button 
              type="button"
              className={`flex items-center justify-center w-6 h-6 ${showCoverage ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
              onClick={() => setShowCoverage(!showCoverage)}
              title="Toggle coverage"
              aria-pressed={showCoverage}
            >
              <Signal className="h-3 w-3" />
            </button>
            
            <button 
              type="button"
              className={`flex items-center justify-center w-6 h-6 ${showDXSpots ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
              onClick={() => setShowDXSpots(!showDXSpots)}
              title="Toggle DX spots"
              aria-pressed={showDXSpots}
            >
              <BarChart className="h-3 w-3" />
            </button>
            
            <button 
              type="button"
              className={`flex items-center justify-center w-6 h-6 ${showUsers ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
              onClick={() => setShowUsers(!showUsers)}
              title="Toggle users"
              aria-pressed={showUsers}
            >
              <Users className="h-3 w-3" />
            </button>
            
            <button 
              type="button"
              className={`flex items-center justify-center w-6 h-6 ${showWeather ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
              onClick={() => setShowWeather(!showWeather)}
              title="Toggle weather"
              aria-pressed={showWeather}
            >
              <Cloud className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Tool controls */}
      <div className="leaflet-bottom leaflet-left">
        <div className="leaflet-control" style={{ marginBottom: "40px", marginLeft: "10px" }}>
          <div className="flex flex-col gap-1 bg-gray-900/85 p-1.5 rounded-sm shadow-md border border-gray-700">
            <button 
              type="button"
              className={`flex items-center justify-center w-6 h-6 ${isMeasuring ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
              onClick={toggleMeasuring}
              title="Measure distance"
              aria-pressed={isMeasuring}
            >
              <Ruler className="h-3 w-3" />
            </button>
            
            <button 
              type="button"
              className={`flex items-center justify-center w-6 h-6 bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white border border-gray-600 rounded-sm`}
              onClick={toggleCoverageStyle}
              title={`Coverage style: ${coverageStyle}. Click to change.`}
            >
              <Navigation className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
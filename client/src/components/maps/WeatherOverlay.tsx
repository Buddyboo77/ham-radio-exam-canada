import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMap, TileLayer, Circle, Tooltip, Marker } from 'react-leaflet';
import { apiRequest } from '@/lib/queryClient';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';
import L from 'leaflet';
import { POWELL_RIVER_LOCATION } from '@/lib/constants';

interface WeatherData {
  id: number;
  location: string;
  temperature: number;
  condition: string;
  windSpeed: number;
  windDirection: string;
  lastUpdated: string;
  rawData: string;
}

interface WeatherPoint {
  lat: number;
  lng: number;
  temperature: number;
  condition: string;
  windSpeed: number;
  windDirection: string;
  isPrimary?: boolean;
}

interface WeatherOverlayProps {
  enabled: boolean;
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ enabled }) => {
  const map = useMap();
  const [weatherPoints, setWeatherPoints] = useState<WeatherPoint[]>([]);
  
  // Get current Powell River weather
  const { data: weatherData } = useQuery<WeatherData>({
    queryKey: ['/api/weather/Powell River, BC'],
    enabled: enabled,
  });

  // Get center and bounds of the current map view
  useEffect(() => {
    if (enabled && weatherData) {
      const center = map.getCenter();
      
      // Create weather points based on the current weather data
      const newWeatherPoints: WeatherPoint[] = [];
      
      // Center point is our actual weather data for Powell River
      newWeatherPoints.push({
        lat: POWELL_RIVER_LOCATION.lat,
        lng: POWELL_RIVER_LOCATION.lng,
        temperature: weatherData.temperature,
        condition: weatherData.condition,
        windSpeed: weatherData.windSpeed,
        windDirection: weatherData.windDirection,
        isPrimary: true
      });
      
      // Create some surrounding weather points with reasonable variations
      // This simulates having weather data for the surrounding areas
      const surroundingLocations = [
        { name: "Texada Island", lat: 49.6952, lng: -124.4039, tempOffset: -0.5, windOffset: 2 },
        { name: "Savary Island", lat: 49.9413, lng: -124.8233, tempOffset: -0.7, windOffset: 3 },
        { name: "Lund", lat: 49.9805, lng: -124.7633, tempOffset: -0.3, windOffset: 1 },
        { name: "Stillwater", lat: 49.7734, lng: -124.3046, tempOffset: 0.8, windOffset: -1 },
        { name: "Saltery Bay", lat: 49.7836, lng: -124.1812, tempOffset: 0.2, windOffset: 0 }
      ];
      
      surroundingLocations.forEach(location => {
        newWeatherPoints.push({
          lat: location.lat,
          lng: location.lng,
          temperature: weatherData.temperature + location.tempOffset,
          condition: weatherData.condition,
          windSpeed: weatherData.windSpeed + location.windOffset,
          windDirection: weatherData.windDirection,
          isPrimary: false
        });
      });
      
      setWeatherPoints(newWeatherPoints);
    }
  }, [enabled, weatherData, map]);

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
      return <CloudRain className="h-5 w-5 text-blue-400" />;
    } else if (conditionLower.includes('snow')) {
      return <CloudSnow className="h-5 w-5 text-white" />;
    } else if (conditionLower.includes('thunder') || conditionLower.includes('lightning')) {
      return <CloudLightning className="h-5 w-5 text-yellow-300" />;
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return <Cloud className="h-5 w-5 text-gray-400" />;
    } else if (conditionLower.includes('wind') || conditionLower.includes('gust')) {
      return <Wind className="h-5 w-5 text-teal-300" />;
    } else {
      return <Sun className="h-5 w-5 text-yellow-400" />;
    }
  };
  
  // Get color based on temperature
  const getTemperatureColor = (temp: number) => {
    if (temp <= 0) return '#93C5FD'; // blue-300
    if (temp <= 10) return '#38BDF8'; // sky-400
    if (temp <= 20) return '#4ADE80'; // green-400
    if (temp <= 30) return '#FB923C'; // orange-400
    return '#EF4444'; // red-500
  };
  
  // Get opacity based on wind speed
  const getWindOpacity = (windSpeed: number) => {
    return Math.min(0.6, Math.max(0.2, windSpeed * 0.04));
  };
  
  // Create a wind direction arrow
  const getWindArrow = (direction: string) => {
    const directions: {[key: string]: number} = {
      'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
      'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
      'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
      'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
    };
    
    // If it's a simple direction like "N", "E", etc.
    if (directions[direction]) {
      return directions[direction];
    }
    
    // Default to North if direction is not recognized
    return 0;
  };

  if (!enabled || !weatherData) return null;

  // Create custom SVG icon for simplified display
  const createWeatherIcon = (condition: string, temperature: number) => {
    // Choose the appropriate emoji based on condition
    let emoji = '☀️'; // default sunny
    if (condition.toLowerCase().includes('rain')) emoji = '🌧️';
    else if (condition.toLowerCase().includes('cloud')) emoji = '☁️';
    else if (condition.toLowerCase().includes('snow')) emoji = '❄️';
    else if (condition.toLowerCase().includes('fog')) emoji = '🌫️';
    else if (condition.toLowerCase().includes('thunder')) emoji = '⛈️';
    
    return L.divIcon({
      html: `<div class="weather-icon">${emoji}<span class="temp">${Math.round(temperature)}°</span></div>`,
      className: 'weather-div-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  return (
    <>
      {/* Weather data visualization */}
      {weatherPoints.map((point, i) => (
        <Circle
          key={i}
          center={[point.lat, point.lng]}
          radius={Math.max(5000, Math.min(20000, point.windSpeed * 800))}
          pathOptions={{
            fillColor: getTemperatureColor(point.temperature),
            fillOpacity: getWindOpacity(point.windSpeed),
            color: getTemperatureColor(point.temperature),
            weight: 1
          }}
        >
          <Tooltip direction="top" permanent={point.isPrimary}>
            <div className="flex items-center gap-1">
              {getWeatherIcon(point.condition)}
              <span className="font-bold">{point.temperature.toFixed(1)}°C</span>
            </div>
            <div className="text-xs">
              <span>{point.condition}</span>
              <div>Wind: {point.windSpeed.toFixed(1)} km/h {point.windDirection}</div>
              <div className="text-xs opacity-50">
                {new Date(weatherData.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </Tooltip>
        </Circle>
      ))}
      
      {/* Add wind direction arrows to show wind patterns */}
      {weatherPoints.map((point, i) => (
        <div key={`wind-${i}`}>
          {point.windSpeed >= 5 && (
            <div
              className="wind-arrow"
              style={{
                position: 'absolute',
                left: map.latLngToLayerPoint([point.lat, point.lng]).x,
                top: map.latLngToLayerPoint([point.lat, point.lng]).y,
                transform: `rotate(${getWindArrow(point.windDirection)}deg)`,
                width: '20px',
                height: '20px'
              }}
            >
              ↑
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default WeatherOverlay;
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMap, TileLayer, Circle, Tooltip } from 'react-leaflet';
import { apiRequest } from '@/lib/queryClient';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  conditions: string;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  pressure: number;
  visibility: number;
  precipitation: number;
  updated: string;
}

interface WeatherOverlayProps {
  enabled: boolean;
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ enabled }) => {
  const map = useMap();
  const [weatherPoints, setWeatherPoints] = useState<any[]>([]);
  
  // Get current Powell River weather
  const { data: weatherData } = useQuery<WeatherData>({
    queryKey: ['/api/weather/Powell River, BC'],
    enabled: enabled,
  });

  // Get center and bounds of the current map view
  useEffect(() => {
    if (enabled && weatherData) {
      const center = map.getCenter();
      const bounds = map.getBounds();
      
      // Create a grid of weather points based on the current weather data
      // In a full implementation, this would call a weather API for multiple locations
      const newWeatherPoints = [];
      
      // Center point is our actual weather data
      newWeatherPoints.push({
        lat: center.lat,
        lng: center.lng,
        temperature: weatherData.temperature,
        conditions: weatherData.conditions,
        windSpeed: weatherData.windSpeed,
        precipitation: weatherData.precipitation
      });
      
      // Create some surrounding weather points with slight variations
      // (for demonstration purposes - a real app would use actual data)
      for (let i = 0; i < 5; i++) {
        const offset = 0.1 + (i * 0.05);
        const tempOffset = Math.random() * 3 - 1.5;
        const precipOffset = Math.random() * 0.3;
        
        newWeatherPoints.push({
          lat: center.lat + offset,
          lng: center.lng + offset,
          temperature: weatherData.temperature + tempOffset,
          conditions: weatherData.conditions,
          windSpeed: weatherData.windSpeed + (Math.random() * 5 - 2.5),
          precipitation: Math.max(0, weatherData.precipitation + precipOffset)
        });
        
        newWeatherPoints.push({
          lat: center.lat - offset,
          lng: center.lng + offset,
          temperature: weatherData.temperature + tempOffset,
          conditions: weatherData.conditions,
          windSpeed: weatherData.windSpeed + (Math.random() * 5 - 2.5),
          precipitation: Math.max(0, weatherData.precipitation + precipOffset)
        });
      }
      
      setWeatherPoints(newWeatherPoints);
    }
  }, [enabled, weatherData, map]);

  // Get weather icon based on conditions
  const getWeatherIcon = (conditions: string) => {
    const conditionsLower = conditions.toLowerCase();
    if (conditionsLower.includes('rain') || conditionsLower.includes('shower')) {
      return <CloudRain className="h-5 w-5 text-blue-400" />;
    } else if (conditionsLower.includes('snow')) {
      return <CloudSnow className="h-5 w-5 text-white" />;
    } else if (conditionsLower.includes('thunder') || conditionsLower.includes('lightning')) {
      return <CloudLightning className="h-5 w-5 text-yellow-300" />;
    } else if (conditionsLower.includes('cloud') || conditionsLower.includes('overcast')) {
      return <Cloud className="h-5 w-5 text-gray-400" />;
    } else if (conditionsLower.includes('wind') || conditionsLower.includes('gust')) {
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
  
  // Get opacity based on precipitation
  const getPrecipitationOpacity = (precip: number) => {
    return Math.min(0.6, Math.max(0.1, precip * 0.1));
  };

  if (!enabled) return null;

  // Add precipitation overlay
  return (
    <>
      {/* Weather radar overlay - uses OpenWeatherMap's precipitation layer */}
      <TileLayer
        url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY"
        opacity={0.4}
      />
      
      {/* Weather data points */}
      {weatherPoints.map((point, i) => (
        <Circle
          key={i}
          center={[point.lat, point.lng]}
          radius={Math.max(5000, Math.min(20000, point.windSpeed * 1000))}
          pathOptions={{
            fillColor: getTemperatureColor(point.temperature),
            fillOpacity: getPrecipitationOpacity(point.precipitation),
            color: getTemperatureColor(point.temperature),
            weight: 1
          }}
        >
          <Tooltip direction="top" permanent={i === 0}>
            <div className="flex items-center gap-1">
              {getWeatherIcon(point.conditions)}
              <span className="font-bold">{point.temperature.toFixed(1)}°C</span>
            </div>
            <div className="text-xs">
              <span>{point.conditions}</span>
              <div>Wind: {point.windSpeed.toFixed(1)} km/h</div>
              {point.precipitation > 0 && (
                <div>Precip: {point.precipitation.toFixed(1)} mm</div>
              )}
            </div>
          </Tooltip>
        </Circle>
      ))}
    </>
  );
};

export default WeatherOverlay;
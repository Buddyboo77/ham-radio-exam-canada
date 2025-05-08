import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Sun, 
  CloudSnow, 
  CloudFog,
  Wind, 
  CloudOff, 
  HelpCircle 
} from "lucide-react";

interface WeatherWidgetProps {
  location?: string;
}

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

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location = "Powell River, BC" }) => {
  const { data: weather, isLoading, error } = useQuery<WeatherData>({
    queryKey: [`/api/weather/${encodeURIComponent(location)}`],
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
  });

  const formattedDate = weather?.lastUpdated 
    ? format(new Date(weather.lastUpdated), "HH:mm")
    : "--:--";

  if (isLoading) {
    return (
      <div className="rounded-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-blue-100 flex items-center h-6">
              <Skeleton className="h-3 w-16 bg-gray-700" />
            </div>
          </div>
          <Skeleton className="h-3 w-10 bg-gray-700" />
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center">
            <Skeleton className="h-8 w-8 rounded-md mr-2 bg-gray-700" />
            <Skeleton className="h-5 w-12 bg-gray-700" />
          </div>
          <Skeleton className="h-4 w-24 bg-gray-700" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md text-gray-300">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono tracking-wide text-blue-300">WEATHER CONDITIONS</h3>
          <span className="text-xs font-mono text-red-400">ERROR</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center">
            <CloudOff className="h-5 w-5 mr-2 text-gray-400" />
            <span className="text-xs">No data available</span>
          </div>
          <span className="text-[10px] font-mono text-gray-500">--:--</span>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="rounded-md text-gray-300">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono tracking-wide text-blue-300">WEATHER CONDITIONS</h3>
          <span className="text-xs font-mono text-yellow-400">NO DATA</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-gray-400" />
            <span className="text-xs">Weather data not found</span>
          </div>
          <span className="text-[10px] font-mono text-gray-500">--:--</span>
        </div>
      </div>
    );
  }

  // Map weather condition to Lucide icon
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes("rain")) 
      return <CloudRain className="h-5 w-5 text-blue-400" />;
    if (conditionLower.includes("cloud")) 
      return <Cloud className="h-5 w-5 text-gray-400" />;
    if (conditionLower.includes("sun") || conditionLower.includes("clear")) 
      return <Sun className="h-5 w-5 text-yellow-400" />;
    if (conditionLower.includes("thunder")) 
      return <CloudLightning className="h-5 w-5 text-yellow-500" />;
    if (conditionLower.includes("snow")) 
      return <CloudSnow className="h-5 w-5 text-blue-100" />;
    if (conditionLower.includes("fog") || conditionLower.includes("mist")) 
      return <CloudFog className="h-5 w-5 text-gray-400" />;
    
    return <Cloud className="h-5 w-5 text-gray-400" />; // default icon
  };

  return (
    <div className="rounded-md text-gray-300">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-mono tracking-wide text-blue-300">WEATHER CONDITIONS</h3>
        <span className="text-[10px] font-mono text-green-400">ACTIVE</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center">
          {getWeatherIcon(weather.condition)}
          <div className="ml-2">
            <div className="flex items-baseline">
              <span className="text-md font-mono font-bold text-gray-100">{weather.temperature}</span>
              <span className="text-xs ml-0.5 text-gray-400">°C</span>
            </div>
            <div className="flex items-center text-[10px] mt-0.5 text-gray-400">
              <Wind className="h-3 w-3 mr-1" />
              <span>{weather.windSpeed}km/h {weather.windDirection}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-gray-500">{formattedDate}</span>
          <span className="text-[10px] font-mono text-gray-400 mt-0.5">{weather.condition}</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface WeatherWidgetProps {
  location?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location = "Powell River, BC" }) => {
  const { data: weather, isLoading, error } = useQuery({
    queryKey: [`/api/weather/${encodeURIComponent(location)}`],
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
  });

  const formattedDate = weather?.lastUpdated 
    ? format(new Date(weather.lastUpdated), "MMM d, h:mm a")
    : "Loading...";

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-16 w-16 rounded-full mr-3" />
          <div>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Powell River Weather</h2>
          <span className="text-xs text-gray-500">Unable to load</span>
        </div>
        <div className="flex items-center text-gray-500">
          <span className="material-icons text-4xl mr-3">cloud_off</span>
          <p>Weather information unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow mb-4 p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold">Powell River Weather</h2>
        <span className="text-xs text-gray-500">Last updated: {formattedDate}</span>
      </div>
      <div className="flex items-center">
        <span className="material-icons text-4xl text-accent mr-3">
          {weather?.condition?.toLowerCase().includes("rain") ? "rainy" : 
           weather?.condition?.toLowerCase().includes("cloud") ? "cloud" : 
           weather?.condition?.toLowerCase().includes("sun") ? "wb_sunny" : "cloud"}
        </span>
        <div>
          <p className="text-2xl font-bold">{weather?.temperature}°C</p>
          <p className="text-sm">
            {weather?.condition}, Wind: {weather?.windSpeed}km/h {weather?.windDirection}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Frequency } from "@shared/schema";
import FrequencyItem from "@/components/frequencies/FrequencyItem";
import EmergencyAlert from "@/components/frequencies/EmergencyAlert";
import WeatherWidget from "@/components/weather/WeatherWidget";
import { Search, Filter } from "lucide-react";

const FrequenciesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  const { data: frequencies, isLoading } = useQuery({
    queryKey: ["/api/frequencies"],
  });

  const filterFrequencies = (frequencies: Frequency[] | undefined) => {
    if (!frequencies) return [];
    
    return frequencies.filter((freq) => {
      const matchesSearch = searchTerm === "" || 
        freq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freq.frequency.toString().includes(searchTerm);
      
      const matchesCategory = !filterCategory || freq.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredFrequencies = filterFrequencies(frequencies);
  
  // Find emergency frequency
  const emergencyFrequency = frequencies?.find(f => f.isEmergency);

  const renderSkeletons = () => {
    return Array(4).fill(0).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow mb-3 p-4">
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-40 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex flex-col items-end justify-between">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="p-4">
      {/* Emergency Alert */}
      {emergencyFrequency && (
        <EmergencyAlert 
          title="Emergency Frequency" 
          description={`${emergencyFrequency.frequency.toFixed(3)} MHz - ${emergencyFrequency.name}`} 
        />
      )}

      {/* Weather Information */}
      <WeatherWidget location="Powell River, BC" />

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search frequencies..."
              className="w-full pl-9 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            className="bg-accent text-white flex items-center"
            onClick={() => setFilterCategory(filterCategory ? null : "VHF")}
          >
            <Filter className="h-4 w-4 mr-1" />
            {filterCategory || "Filter"}
          </Button>
        </div>
      </div>

      {/* Frequency List */}
      <h2 className="font-bold text-lg mb-2">Local Frequencies</h2>
      
      {isLoading ? (
        renderSkeletons()
      ) : filteredFrequencies.length > 0 ? (
        filteredFrequencies.map((frequency) => (
          <FrequencyItem key={frequency.id} frequency={frequency} />
        ))
      ) : (
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p>No frequencies found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default FrequenciesPage;

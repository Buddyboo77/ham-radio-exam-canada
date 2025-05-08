import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Frequency } from "@shared/schema";
import { EMERGENCY_FREQUENCY } from "@/lib/constants";
import FrequencyItem from "@/components/frequencies/FrequencyItem";
import EmergencyAlert from "@/components/frequencies/EmergencyAlert";
import WeatherWidget from "@/components/weather/WeatherWidget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FrequenciesPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: frequencies = [], isLoading } = useQuery<Frequency[]>({
    queryKey: ["/api/frequencies"],
  });

  // Filter frequencies based on active tab and search query
  const filteredFrequencies = frequencies.filter(freq => {
    // First filter by tab
    const tabMatch = 
      activeTab === "all" || 
      (activeTab === "monitored" && freq.isMonitored) ||
      (activeTab === "emergency" && freq.isEmergency) ||
      activeTab === freq.category;
    
    // Then filter by search
    const searchMatch = searchQuery === "" || 
      freq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freq.frequency.toString().includes(searchQuery.toLowerCase());
    
    return tabMatch && searchMatch;
  });

  // Get unique categories for tab filters
  const categories = Array.from(new Set(frequencies.map(freq => freq.category)));

  // Find emergency frequency
  const emergencyFreq = frequencies.find(
    freq => freq.frequency === EMERGENCY_FREQUENCY
  );

  const emergencyFreqStatus = emergencyFreq ? emergencyFreq.status : 'inactive';

  return (
    <div className="p-4">
      <WeatherWidget location="Powell River, BC" />
      
      {emergencyFreq && (
        <EmergencyAlert
          title="National Calling Frequency"
          description={`The national calling frequency (${EMERGENCY_FREQUENCY} MHz) is ${
            emergencyFreqStatus === 'active' ? 'active and being monitored' : 
            emergencyFreqStatus === 'intermittent' ? 'intermittently active' : 'not currently monitored'
          } in Powell River. ${
            emergencyFreqStatus !== 'active' ? 'Switch to this frequency for emergency communications.' : ''
          }`}
        />
      )}

      <div className="mb-4">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search frequencies..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="monitored">Monitored</TabsTrigger>
            <TabsTrigger value="emergency">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Emergency
            </TabsTrigger>
            <TabsTrigger value="favorite">Favorites</TabsTrigger>
          </TabsList>

          {/* Category tabs if needed */}
          {categories.length > 0 && (
            <div className="flex overflow-x-auto gap-2 mb-4 pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${activeTab === category ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
          
          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              // Loading state
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))
            ) : filteredFrequencies.length === 0 ? (
              // Empty state
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <h3 className="font-medium text-gray-900">No frequencies found</h3>
                <p className="mt-1 text-gray-500">
                  {searchQuery ? "Try a different search term" : "No frequencies in this category"}
                </p>
              </div>
            ) : (
              // Frequencies list
              filteredFrequencies.map(frequency => (
                <FrequencyItem key={frequency.id} frequency={frequency} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FrequenciesPage;
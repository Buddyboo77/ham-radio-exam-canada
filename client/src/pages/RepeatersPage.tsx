import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Repeater, Frequency } from "@shared/schema";
import RepeaterItem from "@/components/repeaters/RepeaterItem";
import RepeaterMap from "@/components/repeaters/RepeaterMap";
import { Input } from "@/components/ui/input";
import { Search, List, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { POWELL_RIVER_LOCATION } from "@/lib/constants";

const RepeatersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const { data: repeaters = [], isLoading } = useQuery<Repeater[]>({
    queryKey: ["/api/repeaters"],
  });

  // Filter repeaters based on search query
  const filteredRepeaters = repeaters.filter(repeater =>
    searchQuery === "" ||
    repeater.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repeater.frequency.toString().includes(searchQuery) ||
    repeater.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort repeaters by status (operational first) and then by frequency
  const sortedRepeaters = [...filteredRepeaters].sort((a, b) => {
    // First prioritize operational status
    if (a.status?.toLowerCase() === "operational" && b.status?.toLowerCase() !== "operational") {
      return -1;
    }
    if (a.status?.toLowerCase() !== "operational" && b.status?.toLowerCase() === "operational") {
      return 1;
    }
    // Then sort by frequency
    return a.frequency - b.frequency;
  });

  // Mutation to add a frequency to the scanner by marking it as monitored
  const addToScannerMutation = useMutation({
    mutationFn: async (frequency: number) => {
      try {
        // Find the matching frequency in the database
        const response = await apiRequest<Frequency>(`/api/frequencies/byValue/${frequency}`);
        
        // If found, update it to be monitored
        if (response && response.id) {
          return apiRequest(`/api/frequencies/${response.id}/monitor`, {
            method: 'PATCH',
            body: JSON.stringify({ isMonitored: true })
          });
        }
      } catch (error) {
        // If not found (404), we'll create a new one
        console.log('Frequency not found in database, creating new entry');
      }
      
      // If not found or error occurred, create a new monitored frequency
      // This is important for repeaters whose frequency might not be in the frequency table yet
      return apiRequest('/api/frequencies', {
        method: 'POST',
        body: JSON.stringify({
          frequency: frequency,
          name: `Repeater ${frequency.toFixed(3)}`,
          description: 'Added from repeater map',
          category: 'VHF',
          isMonitored: true
        })
      });
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/frequencies'] });
    }
  });

  // Helper function to add repeater to scanner
  const handleAddToScanner = (frequency: number) => {
    // Find the repeater with this frequency
    const repeater = repeaters.find(r => r.frequency === frequency);
    if (!repeater) return;
    
    // Call the mutation to update the frequency in the database
    addToScannerMutation.mutate(frequency);
  };

  return (
    <div className="p-2">
      {/* Radio display header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              Powell River Repeaters
            </h2>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or frequency..."
            className="pl-8 bg-gray-900 border-gray-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="list" value={viewMode} onValueChange={setViewMode}>
          <div className="flex justify-between items-center mb-2">
            <TabsList className="h-9 p-1 bg-gray-900">
              <TabsTrigger 
                value="list" 
                className="text-xs py-1.5 px-3 h-auto data-[state=active]:bg-blue-900"
              >
                <div className="flex items-center gap-1.5">
                  <List className="h-3.5 w-3.5" />
                  <span>List</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="text-xs py-1.5 px-3 h-auto data-[state=active]:bg-green-900"
              >
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Map</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <div className="text-xs text-gray-300">
              {filteredRepeaters.length} repeaters found
            </div>
          </div>

          <TabsContent value="list" className="space-y-2">
            {isLoading ? (
              // Loading state
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-md bg-gray-700/40" />
              ))
            ) : sortedRepeaters.length === 0 ? (
              // Empty state
              <div className="text-center py-4 bg-gray-900/70 rounded-md border border-gray-700">
                <h3 className="font-medium text-gray-300">No repeaters found</h3>
                <p className="mt-1 text-xs text-gray-400">
                  {searchQuery ? "Try a different search term" : "No repeaters available in the database"}
                </p>
              </div>
            ) : (
              // Repeaters list
              sortedRepeaters.map(repeater => (
                <RepeaterItem 
                  key={repeater.id} 
                  repeater={repeater} 
                  onAddToScanner={handleAddToScanner}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="map">
            <div className="bg-gray-900/70 rounded-md border border-gray-700 p-2 mb-3">
              <div className="text-xs text-gray-300 mb-2 flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-blue-400" />
                <span>Interactive Repeater Map</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full rounded-md bg-gray-800/70" />
              ) : (
                <RepeaterMap 
                  repeaters={sortedRepeaters} 
                  onAddToScanner={handleAddToScanner} 
                />
              )}
            </div>
            
            {/* List repeaters below the map as well - more compact */}
            <div className="space-y-2">
              {isLoading ? (
                Array(2).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-md bg-gray-700/40" />
                ))
              ) : sortedRepeaters.length === 0 ? (
                <div className="text-center py-3 bg-gray-900/70 rounded-md border border-gray-700">
                  <h3 className="font-medium text-gray-300 text-sm">No repeaters found</h3>
                  <p className="text-xs text-gray-400">
                    {searchQuery ? "Try a different search term" : "No repeaters available"}
                  </p>
                </div>
              ) : (
                sortedRepeaters.map(repeater => (
                  <RepeaterItem 
                    key={repeater.id} 
                    repeater={repeater} 
                    onAddToScanner={handleAddToScanner}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RepeatersPage;
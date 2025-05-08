import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Repeater } from "@shared/schema";
import RepeaterItem from "@/components/repeaters/RepeaterItem";
import { Input } from "@/components/ui/input";
import { Search, List, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Helper function to add repeater to scanner
  const handleAddToScanner = (frequency: number) => {
    // Find the repeater with this frequency
    const repeater = repeaters.find(r => r.frequency === frequency);
    if (!repeater) return;

    // Implement the logic to add to scanner
    // This might trigger a mutation to update the frequency's monitored status
    console.log(`Adding ${repeater.name} (${frequency} MHz) to scanner`);
    
    // In a real implementation, you would use a mutation here
    // For now, we just log it
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Powell River Repeaters</h1>
        <p className="text-gray-600">
          Find and monitor active repeaters in the Powell River area
        </p>
      </div>

      <div className="mb-4">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search repeaters by name, frequency, or location..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="list" value={viewMode} onValueChange={setViewMode}>
          <TabsList className="grid grid-cols-2 mb-4 w-48">
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-1" />
              List
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapPin className="h-4 w-4 mr-1" />
              Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {isLoading ? (
              // Loading state
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))
            ) : sortedRepeaters.length === 0 ? (
              // Empty state
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <h3 className="font-medium text-gray-900">No repeaters found</h3>
                <p className="mt-1 text-gray-500">
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
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="font-bold text-lg mb-4">Repeater Map</h2>
              {/* Simple map placeholder - in a real app, this would use a mapping library */}
              <div className="relative bg-gray-100 h-96 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500">
                    Map view showing Powell River repeaters at coordinates<br />
                    {POWELL_RIVER_LOCATION.lat}, {POWELL_RIVER_LOCATION.lng}
                  </p>
                </div>
                {/* Map markers for repeaters */}
                {sortedRepeaters.map(repeater => (
                  repeater.latitude && repeater.longitude ? (
                    <div 
                      key={repeater.id}
                      className="absolute"
                      style={{ 
                        left: '50%', 
                        top: '50%', 
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={`${repeater.name} - ${repeater.frequency.toFixed(3)} MHz`}
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        repeater.status?.toLowerCase() === 'operational' ? 'bg-success' : 
                        repeater.status?.toLowerCase() === 'limited' ? 'bg-warning' : 'bg-gray-400'
                      }`} />
                    </div>
                  ) : null
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Note: This is a simplified map view. In a complete implementation, 
                this would display an interactive map with the exact repeater locations.
              </p>
            </div>
            
            {/* List repeaters below the map as well */}
            <div className="space-y-4">
              {sortedRepeaters.map(repeater => (
                <RepeaterItem 
                  key={repeater.id} 
                  repeater={repeater} 
                  onAddToScanner={handleAddToScanner}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RepeatersPage;
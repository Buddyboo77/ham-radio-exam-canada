import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import RepeaterItem from "@/components/repeaters/RepeaterItem";
import { Repeater } from "@shared/schema";

const RepeatersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: repeaters, isLoading } = useQuery({
    queryKey: ["/api/repeaters"],
  });

  const { mutate: addFrequencyToMonitor } = useMutation({
    mutationFn: async (frequency: number) => {
      // Find the frequency ID from the frequency value
      const freqResponse = await fetch("/api/frequencies");
      const frequencies = await freqResponse.json();
      const matchingFreq = frequencies.find((f: any) => f.frequency === frequency);
      
      if (!matchingFreq) {
        throw new Error("Frequency not found in the system");
      }
      
      const response = await apiRequest(
        "PATCH", 
        `/api/frequencies/${matchingFreq.id}/monitor`, 
        { isMonitored: true }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frequencies"] });
      toast({
        title: "Added to Scanner",
        description: "Frequency has been added to your scanner",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add frequency: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const filterRepeaters = (repeaters: Repeater[] | undefined) => {
    if (!repeaters) return [];
    
    return repeaters.filter((repeater) => {
      return searchTerm === "" || 
        repeater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repeater.frequency.toString().includes(searchTerm) ||
        (repeater.location && repeater.location.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  };

  const filteredRepeaters = filterRepeaters(repeaters);

  const handleAddToScanner = (frequency: number) => {
    addFrequencyToMonitor(frequency);
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <h2 className="font-bold text-lg mb-4">Powell River Area Repeaters</h2>
        
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search repeaters..."
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Map Placeholder */}
        <div className="relative h-60 bg-gray-100 rounded-lg mb-4 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="bg-white bg-opacity-80 py-2 px-4 rounded text-center">
              <p className="text-sm font-medium">An interactive map showing Powell River area with repeater locations would be displayed here.</p>
              <p className="text-xs text-gray-500 mt-1">This requires integration with a mapping service.</p>
            </div>
          </div>
        </div>

        {/* Repeater Details */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredRepeaters.length > 0 ? (
          <div className="space-y-4">
            {filteredRepeaters.map((repeater) => (
              <RepeaterItem 
                key={repeater.id} 
                repeater={repeater}
                onAddToScanner={handleAddToScanner}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No repeaters found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepeatersPage;

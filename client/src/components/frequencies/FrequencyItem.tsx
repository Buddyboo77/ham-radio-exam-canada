import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Frequency } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface FrequencyItemProps {
  frequency: Frequency;
}

const FrequencyItem: React.FC<FrequencyItemProps> = ({ frequency }) => {
  const [isMonitored, setIsMonitored] = useState(frequency.isMonitored);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const { toast } = useToast();
  
  const { mutate: updateMonitorStatus, isPending } = useMutation({
    mutationFn: async (newStatus: boolean) => {
      const response = await apiRequest(
        "PATCH", 
        `/api/frequencies/${frequency.id}/monitor`, 
        { isMonitored: newStatus }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setIsMonitored(data.isMonitored);
      queryClient.invalidateQueries({ queryKey: ["/api/frequencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/frequencies/monitored"] });
      
      toast({
        title: data.isMonitored ? "Added to Scanner" : "Removed from Scanner",
        description: data.isMonitored 
          ? `${frequency.frequency.toFixed(3)} MHz will now be monitored` 
          : `${frequency.frequency.toFixed(3)} MHz removed from monitoring`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update monitoring status: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleMonitorToggle = (checked: boolean) => {
    if (!isPending) {
      updateMonitorStatus(checked);
    }
  };

  const getStatusBadge = () => {
    switch (frequency.status) {
      case "active":
        return <Badge className="bg-success text-white">Active</Badge>;
      case "intermittent":
        return <Badge className="bg-warning text-white">Intermittent</Badge>;
      default:
        return <Badge className="bg-gray-300 text-gray-700">Inactive</Badge>;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow mb-3 p-4">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="font-bold text-primary">{frequency.frequency.toFixed(3)} MHz</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 ml-1"
                onClick={() => setIsInfoOpen(true)}
                type="button"
              >
                <Info className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
            <p className="text-sm text-gray-700">{frequency.name}</p>
            <p className="text-xs text-gray-500">Tone: {frequency.tone || "None"}</p>
          </div>
          <div className="flex flex-col items-end justify-between">
            {getStatusBadge()}
            <div className="flex items-center">
              <Switch
                checked={isMonitored}
                onCheckedChange={(value) => {
                  if (typeof value === 'boolean') {
                    handleMonitorToggle(value);
                  }
                }}
                disabled={isPending}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-600">Monitor</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{frequency.name}</DialogTitle>
            <DialogDescription>
              Frequency details and information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 py-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Frequency</p>
              <p className="text-lg font-bold text-primary">{frequency.frequency.toFixed(3)} MHz</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Tone</p>
              <p className="font-medium">{frequency.tone || "None"}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Category</p>
              <p className="font-medium">{frequency.category}</p>
            </div>
          </div>
          
          {frequency.description && (
            <div className="py-2">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="mt-1">{frequency.description}</p>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsInfoOpen(false)}
              type="button"
            >
              Close
            </Button>
            <Button 
              className="ml-2"
              type="button"
              onClick={() => {
                handleMonitorToggle(!isMonitored);
                setIsInfoOpen(false);
              }}
            >
              {isMonitored ? "Stop Monitoring" : "Start Monitoring"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FrequencyItem;
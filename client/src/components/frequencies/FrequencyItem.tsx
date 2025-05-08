import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Frequency } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface FrequencyItemProps {
  frequency: Frequency;
}

const FrequencyItem: React.FC<FrequencyItemProps> = ({ frequency }) => {
  const [isMonitored, setIsMonitored] = useState(frequency.isMonitored);
  
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
    <div className="bg-white rounded-lg shadow mb-3 p-4">
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold text-primary">{frequency.frequency.toFixed(3)} MHz</h3>
          <p className="text-sm text-gray-700">{frequency.name}</p>
          <p className="text-xs text-gray-500">Tone: {frequency.tone || "None"}</p>
        </div>
        <div className="flex flex-col items-end justify-between">
          {getStatusBadge()}
          <div className="flex items-center">
            <Switch
              checked={isMonitored}
              onCheckedChange={handleMonitorToggle}
              disabled={isPending}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-600">Monitor</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequencyItem;

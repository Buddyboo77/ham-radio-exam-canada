import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, Plus, Radio } from "lucide-react";
import { Repeater } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface RepeaterItemProps {
  repeater: Repeater;
  onAddToScanner: (frequency: number) => void;
}

const RepeaterItem: React.FC<RepeaterItemProps> = ({ repeater, onAddToScanner }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const handleAddToScanner = () => {
    onAddToScanner(repeater.frequency);
    toast({
      title: "Added to Scanner",
      description: `${repeater.frequency.toFixed(3)} MHz (${repeater.name}) added to scanner`,
    });
  };

  const getStatusBadge = () => {
    const status = repeater.status?.toLowerCase() || '';
    switch (status) {
      case "operational":
        return <Badge className="bg-success text-white">Operational</Badge>;
      case "limited":
        return <Badge className="bg-warning text-white">Limited</Badge>;
      case "offline":
        return <Badge className="bg-destructive text-white">Offline</Badge>;
      default:
        return <Badge className="bg-gray-300 text-gray-700">Unknown</Badge>;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <h3 className="font-bold text-lg text-primary">{repeater.name}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-accent font-medium">{repeater.frequency.toFixed(3)} MHz</p>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <MapPinIcon className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[250px]">{repeater.location}</span>
            </div>
          </div>
          <div className="flex flex-col justify-between items-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDetailsOpen(true)}
              className="mb-2"
              type="button"
            >
              View Details
            </Button>
            <Button
              size="sm"
              onClick={handleAddToScanner}
              type="button"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add to Scanner
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{repeater.name}</DialogTitle>
            <DialogDescription>
              Repeater details and technical information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Frequency</p>
                <p className="text-lg font-bold text-primary">{repeater.frequency.toFixed(3)} MHz</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Offset</p>
                <p className="font-medium">
                  {repeater.offset >= 0 ? "+" : ""}{repeater.offset.toFixed(1)} MHz
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Tone</p>
                <p className="font-medium">{repeater.tone || "None"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge()}</div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="mt-1">{repeater.location}</p>
              
              {repeater.latitude && repeater.longitude && (
                <div className="text-xs text-gray-500 mt-1">
                  Coordinates: {repeater.latitude.toFixed(4)}, {repeater.longitude.toFixed(4)}
                </div>
              )}
            </div>
            
            {repeater.coverage && (
              <div>
                <p className="text-sm font-medium text-gray-500">Coverage Area</p>
                <p className="mt-1">{repeater.coverage}</p>
              </div>
            )}
            
            {repeater.notes && (
              <div>
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p className="mt-1">{repeater.notes}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsOpen(false)}
              type="button"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                handleAddToScanner();
                setIsDetailsOpen(false);
              }}
              type="button"
            >
              <Radio className="h-4 w-4 mr-1" />
              Add to Scanner
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RepeaterItem;
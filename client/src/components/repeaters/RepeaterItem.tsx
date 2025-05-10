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
    
    // Format frequency safely
    const formattedFreq = typeof repeater.frequency === 'number' 
      ? repeater.frequency.toFixed(3) 
      : repeater.frequency;
    
    toast({
      title: "Added to Scanner",
      description: `${formattedFreq} MHz (${repeater.name}) added to scanner`,
    });
  };

  const getStatusBadge = () => {
    const status = repeater.status?.toLowerCase() || '';
    switch (status) {
      case "operational":
      case "active":
        return <Badge className="bg-green-700 text-white text-[10px] h-4 py-0">Active</Badge>;
      case "limited":
        return <Badge className="bg-yellow-700 text-white text-[10px] h-4 py-0">Limited</Badge>;
      case "offline":
      case "inactive":
        return <Badge className="bg-red-700 text-white text-[10px] h-4 py-0">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-700 text-white text-[10px] h-4 py-0">Unknown</Badge>;
    }
  };

  return (
    <>
      <div className="bg-gray-900 rounded-md border border-gray-700 mb-2 p-2">
        <div className="mb-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-blue-300 truncate">{repeater.name}</h3>
            {getStatusBadge()}
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <p className="text-white font-mono">
              {typeof repeater.frequency === 'number' ? repeater.frequency.toFixed(3) : repeater.frequency} MHz
            </p>
            <div className="flex items-center text-gray-400">
              <MapPinIcon className="h-2.5 w-2.5 mr-1" />
              <span className="truncate max-w-[150px]">{repeater.location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 bg-gray-800 -mx-2 -mb-2 px-2 py-1.5 mt-2 rounded-b-md border-t border-gray-700">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDetailsOpen(true)}
            className="h-6 px-2 text-xs flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            type="button"
          >
            Details
          </Button>
          <Button
            size="sm"
            onClick={handleAddToScanner}
            className="h-6 px-2 text-xs flex-1 bg-green-700 hover:bg-green-600 text-white"
            type="button"
          >
            <Plus className="h-3 w-3 mr-1" />
            Scanner
          </Button>
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
                <p className="text-lg font-bold text-primary">
                  {typeof repeater.frequency === 'number' ? repeater.frequency.toFixed(3) : repeater.frequency} MHz
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Offset</p>
                <p className="font-medium">
                  {typeof repeater.offset === 'number' ? 
                    (repeater.offset >= 0 ? "+" : "") + repeater.offset.toFixed(1) : 
                    repeater.offset} MHz
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
                  Coordinates: {typeof repeater.latitude === 'number' ? repeater.latitude.toFixed(4) : repeater.latitude}, 
                  {typeof repeater.longitude === 'number' ? repeater.longitude.toFixed(4) : repeater.longitude}
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
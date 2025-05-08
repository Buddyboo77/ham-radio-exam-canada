import { AlertTriangle, RadioTower, Radio } from "lucide-react";

interface EmergencyAlertProps {
  title: string;
  description: string;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ title, description }) => {
  return (
    <div className="bg-red-900 bg-opacity-30 rounded-md border border-red-800 p-2 relative overflow-hidden">
      {/* Flashing SOS indicator */}
      <div className="absolute top-2 right-2 flex items-center">
        <div className="radio-led red animate-pulse mr-1"></div>
        <span className="text-[10px] font-mono text-red-300">SOS</span>
      </div>
      
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-red-300 flex items-center">
            <RadioTower className="h-3.5 w-3.5 mr-1.5" />
            {title}
          </h3>
          <p className="text-xs text-gray-300 mt-1">{description}</p>
          
          <div className="flex items-center gap-1 mt-2 text-[10px] text-red-200 font-mono">
            <Radio className="h-3 w-3" />
            <span>MONITOR 146.52 MHz DURING EMERGENCIES</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlert;

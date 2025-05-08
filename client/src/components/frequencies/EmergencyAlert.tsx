import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EmergencyAlertProps {
  title: string;
  description: string;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ title, description }) => {
  return (
    <Alert className="bg-secondary text-white border-none mb-4">
      <AlertTriangle className="h-5 w-5" />
      <div>
        <AlertTitle className="font-bold text-white">{title}</AlertTitle>
        <AlertDescription className="text-white opacity-90">{description}</AlertDescription>
      </div>
    </Alert>
  );
};

export default EmergencyAlert;

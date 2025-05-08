import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BookOpen, HelpCircle } from "lucide-react";
import { ReferenceItem as ReferenceItemType } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReferenceItemProps {
  item: ReferenceItemType;
  isEmergency?: boolean;
}

const ReferenceItem: React.FC<ReferenceItemProps> = ({ 
  item, 
  isEmergency = false 
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <Card className={`mb-4 ${isEmergency ? 'border-secondary border-2' : ''}`}>
        <CardHeader className={`pb-2 ${isEmergency ? 'bg-secondary/10' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-1">
                {isEmergency && <AlertTriangle className="h-5 w-5 text-secondary" />}
                {item.title}
              </CardTitle>
              <CardDescription>{item.category}</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsDetailsOpen(true)}
              type="button"
              className="p-0 h-8 w-8 rounded-full"
              aria-label="View details"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <p className="text-sm text-gray-700 line-clamp-2">
            {item.description}
          </p>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1">
              {isEmergency && <AlertTriangle className="h-5 w-5 text-secondary" />}
              {item.title}
            </DialogTitle>
            <DialogDescription>
              {item.category}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="bg-slate-50 p-4 rounded-md whitespace-pre-line text-sm">
              {item.description}
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsOpen(false)}
              type="button"
            >
              Close
            </Button>
            <Button 
              variant="default"
              className="ml-2"
              onClick={() => navigator.clipboard.writeText(item.description)}
              type="button"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Copy Reference
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReferenceItem;
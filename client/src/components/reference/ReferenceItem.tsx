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
      <Card 
        className={`mb-4 hover:shadow-md transition-shadow cursor-pointer ${
          isEmergency ? 'border-amber-400 border-2' : 'border border-gray-200'
        }`}
        onClick={() => setIsDetailsOpen(true)}
      >
        <CardHeader className={`pb-2 ${isEmergency ? 'bg-amber-50' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                {isEmergency && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                {item.title}
              </CardTitle>
              <CardDescription className="text-sm mt-1">{item.category}</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(true);
              }}
              type="button"
              className="p-0 h-8 w-8 rounded-full"
              aria-label="View details"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-3">
          <p className="text-sm text-gray-700 line-clamp-2">
            {item.description}
          </p>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {isEmergency && <AlertTriangle className="h-6 w-6 text-amber-500" />}
              {item.title}
            </DialogTitle>
            <DialogDescription>
              Category: {item.category}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="bg-slate-50 p-5 rounded-md whitespace-pre-line text-base border border-slate-200">
              {item.description}
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsOpen(false)}
              type="button"
              className="mr-2"
            >
              Close
            </Button>
            <Button 
              variant="default"
              onClick={() => {
                navigator.clipboard.writeText(item.description);
                // Add a brief visual feedback
                const activeElement = document.activeElement;
                const originalText = activeElement?.textContent || '';
                if (activeElement instanceof HTMLButtonElement) {
                  activeElement.textContent = "Copied!";
                  setTimeout(() => {
                    if (activeElement && originalText) {
                      activeElement.textContent = originalText;
                    }
                  }, 1500);
                }
              }}
              type="button"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Copy Reference
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReferenceItem;
import { useState } from "react";
import { LogEntry as LogEntryType } from "@shared/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LogEntryForm from "@/components/logbook/LogEntryForm";

interface LogEntryProps {
  logEntry: LogEntryType;
}

const LogEntry: React.FC<LogEntryProps> = ({ logEntry }) => {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const formattedDate = format(new Date(logEntry.dateTime), "MMM d, yyyy h:mm a");

  const { mutate: deleteLogEntry, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/logbook/${logEntry.id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logbook"] });
      toast({
        title: "Log entry deleted",
        description: "The log entry has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete log entry: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleEditClick = () => {
    setIsEditFormOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditFormOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  if (isEditFormOpen) {
    return <LogEntryForm onCancel={handleEditCancel} initialData={logEntry} isEdit={true} />;
  }

  return (
    <>
      <Accordion type="single" collapsible className="mb-3">
        <AccordionItem value={`log-${logEntry.id}`} className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="p-3 hover:bg-gray-50 hover:no-underline">
            <div className="flex flex-1 justify-between items-center">
              <div className="text-left">
                <p className="font-medium">{logEntry.callSign} - {logEntry.operatorName || "Unknown"}</p>
                <p className="text-sm text-gray-500">{logEntry.frequency.toFixed(3)} MHz | {formattedDate}</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-3 border-t bg-gray-50">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {logEntry.location && (
                <div>
                  <p className="text-sm text-gray-500">Location:</p>
                  <p className="font-medium">{logEntry.location}</p>
                </div>
              )}
              
              {logEntry.signalReport && (
                <div>
                  <p className="text-sm text-gray-500">Signal Report:</p>
                  <p className="font-medium">
                    {logEntry.signalReport === "59" ? "5-9 (Excellent)" :
                     logEntry.signalReport === "58" ? "5-8 (Very Good)" :
                     logEntry.signalReport === "57" ? "5-7 (Good)" :
                     logEntry.signalReport === "56" ? "5-6 (Good with Noise)" :
                     logEntry.signalReport === "55" ? "5-5 (Fair)" :
                     logEntry.signalReport === "54" ? "5-4 (Fair with Noise)" :
                     logEntry.signalReport === "53" ? "5-3 (Readable with Difficulty)" :
                     logEntry.signalReport === "52" ? "5-2 (Barely Readable)" :
                     logEntry.signalReport === "51" ? "5-1 (Unreadable)" :
                     logEntry.signalReport}
                  </p>
                </div>
              )}
            </div>
            
            {logEntry.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes:</p>
                <p>{logEntry.notes}</p>
              </div>
            )}
            
            <div className="flex space-x-2 mt-3">
              <Button size="sm" className="bg-accent text-white" onClick={handleEditClick}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={handleDeleteClick}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Log Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this log entry for {logEntry.callSign}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                deleteLogEntry();
              }}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LogEntry;

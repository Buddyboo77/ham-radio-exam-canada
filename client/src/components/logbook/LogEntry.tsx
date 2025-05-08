import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { LogEntry as LogEntryType } from "@shared/schema";
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

interface LogEntryProps {
  logEntry: LogEntryType;
  onEdit: (entry: LogEntryType) => void;
  onDelete: (id: number) => void;
}

const LogEntry: React.FC<LogEntryProps> = ({ logEntry, onEdit, onDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const formattedDate = logEntry.dateTime 
    ? format(new Date(logEntry.dateTime), "MMM d, yyyy h:mm a")
    : "Unknown Date";

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg text-primary">{logEntry.callSign}</CardTitle>
              <p className="text-sm text-gray-500">
                {formattedDate} • {logEntry.frequency.toFixed(3)} MHz
              </p>
            </div>
            <Badge>{logEntry.signalReport}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-700">Operator: {logEntry.operatorName}</p>
            {logEntry.location && (
              <p className="text-sm text-gray-600">Location: {logEntry.location}</p>
            )}
          </div>
          
          {logEntry.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-700 whitespace-pre-line">{logEntry.notes}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-1 border-t border-gray-100 flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(logEntry)}
            type="button"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            type="button"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      </Card>

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
              onClick={() => {
                onDelete(logEntry.id);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LogEntry;
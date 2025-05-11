import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { LogEntry as LogEntryType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import LogEntry from "@/components/logbook/LogEntry";
import LogEntryForm from "@/components/logbook/LogEntryForm";
import EnhancedLogEntryForm from "@/components/logbook/EnhancedLogEntryForm";
import LogbookStats from "@/components/logbook/LogbookStats";
import LogExporter from "@/components/logbook/LogExporter";
import { PlusCircle, Search, FileDown, BarChart2, SlidersHorizontal, Star, RadioTower } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const LogbookPage = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LogEntryType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"logs" | "stats" | "export">("logs");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [useEnhancedForm, setUseEnhancedForm] = useState(true);
  const { toast } = useToast();

  const { data: logEntries = [], isLoading } = useQuery<LogEntryType[]>({
    queryKey: ["/api/logbook"],
  });

  const { mutate: deleteLogEntry } = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/logbook/${id}`, {
        method: 'DELETE'
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logbook"] });
      toast({
        title: "Log Entry Deleted",
        description: "The log entry has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete log entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddEntry = () => {
    setSelectedEntry(null);
    setIsFormVisible(true);
  };

  const handleEditEntry = (entry: LogEntryType) => {
    setSelectedEntry(entry);
    setIsFormVisible(true);
  };

  const handleDeleteEntry = (id: number) => {
    deleteLogEntry(id);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setSelectedEntry(null);
  };

  // Filter entries based on search query
  const filteredEntries = searchQuery.trim() === ""
    ? logEntries
    : logEntries.filter(entry => 
        entry.callSign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.operatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Sort entries by date (newest first)
  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">QSO Logbook</h1>
        <p className="text-gray-600">
          Keep track of your radio contacts and communications
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search logbook by call sign, operator, or location..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={handleAddEntry}
          disabled={isFormVisible}
          className="whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Entry
        </Button>
      </div>

      {isFormVisible && (
        <div className="mb-6">
          <LogEntryForm
            onCancel={handleCloseForm}
            initialData={selectedEntry}
            isEdit={!!selectedEntry}
          />
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          // Loading state
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-32 w-full mb-2" />
              <div className="flex justify-end">
                <Skeleton className="h-8 w-16 mr-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))
        ) : sortedEntries.length === 0 ? (
          // Empty state
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="font-medium text-gray-900">No log entries found</h3>
            {searchQuery ? (
              <p className="mt-1 text-gray-500">
                No entries match your search. Try a different query or clear your search.
              </p>
            ) : (
              <p className="mt-1 text-gray-500">
                Start by adding your first contact using the "Add Entry" button above.
              </p>
            )}
            {searchQuery && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          // Entries list
          sortedEntries.map(entry => (
            <LogEntry
              key={entry.id}
              logEntry={entry}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LogbookPage;
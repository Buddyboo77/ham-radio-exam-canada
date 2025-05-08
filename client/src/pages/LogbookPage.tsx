import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Plus } from "lucide-react";
import LogEntry from "@/components/logbook/LogEntry";
import LogEntryForm from "@/components/logbook/LogEntryForm";
import { LogEntry as LogEntryType } from "@shared/schema";

const LogbookPage = () => {
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logEntries, isLoading } = useQuery({
    queryKey: ["/api/logbook"],
  });

  const filterLogEntries = (entries: LogEntryType[] | undefined) => {
    if (!entries) return [];
    
    return entries.filter((entry) => {
      return searchTerm === "" || 
        entry.callSign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.operatorName && entry.operatorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.frequency.toString().includes(searchTerm) ||
        (entry.location && entry.location.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  };

  const filteredLogEntries = filterLogEntries(logEntries);

  const handleNewEntryClick = () => {
    setShowNewEntryForm(true);
  };

  const handleCancelNewEntry = () => {
    setShowNewEntryForm(false);
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Logbook</h2>
          <Button 
            className="bg-primary text-white" 
            onClick={handleNewEntryClick}
            disabled={showNewEntryForm}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Entry
          </Button>
        </div>

        {/* Log Entry Form (Hidden by default) */}
        {showNewEntryForm && (
          <LogEntryForm onCancel={handleCancelNewEntry} />
        )}

        {/* Log Entries List */}
        <div>
          <div className="flex space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search logbook..." 
                className="w-full pl-9 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="bg-accent text-white">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>

          <div className="mb-2 px-2">
            <p className="text-sm text-gray-500">
              {isLoading 
                ? "Loading log entries..." 
                : `Showing ${filteredLogEntries.length} entries`}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredLogEntries.length > 0 ? (
            filteredLogEntries.map((entry) => (
              <LogEntry key={entry.id} logEntry={entry} />
            ))
          ) : (
            <div className="text-center py-6">
              <p>No log entries found.</p>
              {!showNewEntryForm && (
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={handleNewEntryClick}
                >
                  Add your first log entry
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogbookPage;

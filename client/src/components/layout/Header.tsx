import { useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const isOnline = useOnlineStatus();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Ham Radio Study</h1>
        <div className="flex items-center space-x-2">
          <span 
            id="connection-status" 
            className={`flex items-center text-sm ${!isOnline ? "offline-indicator" : ""}`}
            title={isOnline ? "Connected to server" : "No connection to server"}
          >
            <span className="material-icons mr-1 text-sm">
              {isOnline ? "wifi" : "wifi_off"}
            </span>
            {isOnline ? "Online" : "Offline"}
          </span>
          
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <button id="settings-btn" className="p-1" aria-label="Settings">
                <span className="material-icons">settings</span>
              </button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>
                  Configure your ham radio study app preferences.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium leading-none mb-3">App Version</h3>
                    <p className="text-sm text-muted-foreground">1.0.0</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium leading-none mb-3">Data Storage</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Your progress and preferences are stored locally on this device.
                    </p>
                    <button 
                      className="text-sm text-destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all app data? This will reset all settings and logs.")) {
                          // In a real app, this would clear local storage
                          alert("Data cleared successfully");
                          setIsSettingsOpen(false);
                        }
                      }}
                    >
                      Clear all data
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium leading-none mb-3">About</h3>
                    <p className="text-sm text-muted-foreground">
                      Ham Radio Study is designed to help Canadian amateur radio operators
                      prepare for their license examinations.
                    </p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
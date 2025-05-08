import { useOnlineStatus } from "@/hooks/use-online-status";

const Header = () => {
  const isOnline = useOnlineStatus();

  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Powell River Ham Radio</h1>
        <div className="flex items-center space-x-2">
          <span id="connection-status" className={`flex items-center text-sm ${!isOnline ? "offline-indicator" : ""}`}>
            <span className="material-icons mr-1 text-sm">
              {isOnline ? "wifi" : "wifi_off"}
            </span>
            {isOnline ? "Online" : "Offline"}
          </span>
          <button id="settings-btn" className="p-1">
            <span className="material-icons">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Link, useLocation } from "wouter";
import { useEffect } from "react";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const [location, navigate] = useLocation();

  // Sync activeTab with URL on navigation or direct URL access
  useEffect(() => {
    const path = location.replace('/', '');
    const newActiveTab = path === '' ? 'frequencies' : path;
    
    if (tabs.some(tab => tab.id === newActiveTab) && activeTab !== newActiveTab) {
      setActiveTab(newActiveTab);
    }
  }, [location, activeTab, setActiveTab]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    navigate(`/${tab === 'frequencies' ? '' : tab}`);
  };

  const tabs = [
    { id: "frequencies", icon: "radio", label: "Frequencies" },
    { id: "scanner", icon: "tune", label: "Scanner" },
    { id: "repeaters", icon: "cell_tower", label: "Repeaters" },
    { id: "logbook", icon: "book", label: "Logbook" },
    { id: "reference", icon: "help", label: "Reference" }
  ];

  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="flex overflow-x-auto" id="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn flex-1 text-center py-3 px-4 font-medium border-b-2 ${
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } transition-colors duration-200`}
            onClick={() => handleTabClick(tab.id)}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            <span className="material-icons block mx-auto mb-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
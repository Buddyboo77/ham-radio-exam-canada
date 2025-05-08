import { Link, useLocation } from "wouter";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const [location, navigate] = useLocation();

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
    <div className="bg-white border-b">
      <div className="flex overflow-x-auto" id="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn flex-1 text-center py-3 px-4 font-medium border-b-2 ${
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-gray-500"
            }`}
            onClick={() => handleTabClick(tab.id)}
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

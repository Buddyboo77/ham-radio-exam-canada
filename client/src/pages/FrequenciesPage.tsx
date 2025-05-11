import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Frequency } from "@shared/schema";
import { EMERGENCY_FREQUENCY } from "@/lib/constants";
import FrequencyItem from "@/components/frequencies/FrequencyItem";
import EmergencyAlert from "@/components/frequencies/EmergencyAlert";
import WeatherWidget from "@/components/weather/WeatherWidget";
import MeetingInfoBanner from "@/components/reference/MeetingInfoBanner";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  AlertTriangle, 
  Zap, 
  Star, 
  Radio, 
  WifiOff,
  Wifi,
  Volume2,
  Shield,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FrequenciesPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTuning, setActiveTuning] = useState<Frequency | null>(null);
  const [volume, setVolume] = useState(75);

  const { data: frequencies = [], isLoading } = useQuery<Frequency[]>({
    queryKey: ["/api/frequencies"],
  });

  // Filter frequencies based on active tab and search query
  const filteredFrequencies = frequencies.filter(freq => {
    // First filter by tab
    const tabMatch = 
      activeTab === "all" || 
      (activeTab === "monitored" && freq.isMonitored) ||
      (activeTab === "emergency" && freq.isEmergency) ||
      activeTab === freq.category;
    
    // Then filter by search
    const searchMatch = searchQuery === "" || 
      freq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freq.frequency.toString().includes(searchQuery.toLowerCase());
    
    return tabMatch && searchMatch;
  });

  // Get unique categories for tab filters (filter out null values and ensure they're strings)
  const categories = Array.from(new Set(frequencies.map(freq => freq.category).filter(Boolean) as string[]));

  // Find emergency frequency
  const emergencyFreq = frequencies.find(
    freq => freq.frequency === EMERGENCY_FREQUENCY
  );

  const emergencyFreqStatus = emergencyFreq ? emergencyFreq.status : 'inactive';
  
  // Set initial tuning to emergency frequency if available
  useEffect(() => {
    if (emergencyFreq && !activeTuning) {
      setActiveTuning(emergencyFreq);
    }
  }, [emergencyFreq]);
  
  const handleTuneFrequency = (frequency: Frequency) => {
    setActiveTuning(frequency);
  };
  
  const adjustVolume = (direction: 'up' | 'down') => {
    setVolume(prev => {
      if (direction === 'up') {
        return Math.min(prev + 5, 100);
      } else {
        return Math.max(prev - 5, 0);
      }
    });
  };

  return (
    <div className="pb-4">
      {/* Meeting Info Banner - prominent display of club meetings */}
      <MeetingInfoBanner />
      
      {/* Active frequency display - styled as a radio tuner */}
      <div className="bg-black border border-gray-700 rounded-md mb-3 p-3">
        <div className="radio-frequency-display text-lg mb-2">
          {activeTuning ? (
            <span>{activeTuning.frequency.toFixed(2)} MHz</span>
          ) : (
            <span>-- . -- MHz</span>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-1">
              {activeTuning?.status === 'active' ? (
                <Wifi size={14} className="text-green-500" />
              ) : (
                <WifiOff size={14} className="text-gray-500" />
              )}
              <span className="text-xs font-mono text-gray-300">
                {activeTuning?.name || "No channel selected"}
              </span>
            </div>
            <div className="text-[10px] font-mono text-gray-500 mt-0.5">
              {activeTuning?.category || "---"}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Volume2 size={14} className="text-blue-400" />
            <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full" 
                style={{width: `${volume}%`}}
              ></div>
            </div>
            <div className="flex flex-col">
              <button className="text-gray-400 hover:text-white" onClick={() => adjustVolume('up')}>
                <ChevronUp size={14} />
              </button>
              <button className="text-gray-400 hover:text-white" onClick={() => adjustVolume('down')}>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Weather widget modified to fit radio theme */}
      <div className="mb-3 bg-gradient-to-r from-blue-900 to-gray-900 rounded border border-blue-800 p-2">
        <WeatherWidget location="Powell River, BC" />
      </div>
      
      {/* Emergency alert with radio styling */}
      {emergencyFreq && (
        <div className="mb-3">
          <EmergencyAlert
            title="National Calling Frequency"
            description={`The national calling frequency (${EMERGENCY_FREQUENCY} MHz) is ${
              emergencyFreqStatus === 'active' ? 'active and being monitored' : 
              emergencyFreqStatus === 'intermittent' ? 'intermittently active' : 'not currently monitored'
            } in Powell River.`}
          />
        </div>
      )}

      {/* Frequency filter controls */}
      <div className="mb-3">
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search frequencies..."
            className="pl-8 bg-gray-800 border-gray-700 text-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Tabs as radio buttons */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <button
            className={`radio-channel ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <Radio size={12} className="mr-1" /> All
          </button>
          <button
            className={`radio-channel ${activeTab === 'monitored' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitored')}
          >
            <Wifi size={12} className="mr-1" /> Active
          </button>
          <button
            className={`radio-channel ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            <AlertTriangle size={12} className="mr-1" /> SOS
          </button>
          <button
            className={`radio-channel ${activeTab === 'favorite' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorite')}
          >
            <Star size={12} className="mr-1" /> Favs
          </button>
        </div>

        {/* Category tabs styled as radio filters */}
        {categories.length > 0 && (
          <div className="flex overflow-x-auto gap-2 mb-3 pb-1">
            {categories.map(category => (
              <button
                key={category}
                className={`px-2 py-1 rounded text-xs font-medium border border-gray-700 
                  ${activeTab === category 
                    ? 'bg-blue-800 text-white border-blue-600' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                onClick={() => setActiveTab(category || 'all')}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        
        {/* Frequencies list */}
        <div className="space-y-2">
          {isLoading ? (
            // Loading state
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg bg-gray-800" />
            ))
          ) : filteredFrequencies.length === 0 ? (
            // Empty state
            <div className="text-center py-6 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="font-medium text-gray-300">No frequencies found</h3>
              <p className="mt-1 text-gray-500 text-sm">
                {searchQuery ? "Try a different search term" : "No frequencies in this category"}
              </p>
            </div>
          ) : (
            // Radio-styled frequency list
            <div className="space-y-2">
              {filteredFrequencies.map(frequency => (
                <div 
                  key={frequency.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all
                    ${activeTuning?.id === frequency.id 
                      ? 'bg-blue-900 border border-blue-700 shadow-lg' 
                      : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'}`}
                  onClick={() => handleTuneFrequency(frequency)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        frequency.status === 'active' 
                          ? 'bg-green-500 animate-pulse' 
                          : frequency.status === 'intermittent'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}></div>
                      <span className="font-mono text-lg text-white">
                        {frequency.frequency.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">MHz</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {frequency.isEmergency && (
                        <Shield size={14} className="text-red-500" />
                      )}
                      {frequency.isMonitored && (
                        <Wifi size={14} className="text-green-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-1 flex justify-between">
                    <span className="text-sm font-medium text-gray-200">{frequency.name}</span>
                    <span className="text-xs text-gray-400">{frequency.category}</span>
                  </div>
                  
                  {frequency.description && (
                    <div className="mt-1 text-xs text-gray-400">{frequency.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FrequenciesPage;
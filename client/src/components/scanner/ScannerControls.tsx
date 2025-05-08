import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Frequency } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const ScannerControls = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanDelay, setScanDelay] = useState(3);
  const [selectedFrequencies, setSelectedFrequencies] = useState<number[]>([]);
  const [currentScanningFrequency, setCurrentScanningFrequency] = useState<Frequency | null>(null);
  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);
  const [freqsToScan, setFreqsToScan] = useState<Frequency[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [hasActivity, setHasActivity] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const { data: frequencies = [], isLoading } = useQuery<Frequency[]>({
    queryKey: ["/api/frequencies"],
  });

  // Create audio element for scanner sounds
  useEffect(() => {
    // Create an audio element for scanner effects
    audioRef.current = new Audio();
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (scanInterval) {
        clearInterval(scanInterval);
      }
    };
  }, [scanInterval]);

  // Initialize selected frequencies from monitored ones on load
  useEffect(() => {
    if (frequencies && frequencies.length > 0) {
      const monitoredIds = frequencies
        .filter(f => f.isMonitored)
        .map(f => f.id);
        
      if (monitoredIds.length > 0) {
        setSelectedFrequencies(monitoredIds);
      }
    }
  }, [frequencies]);
  
  // Handle scan progress animation
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    
    if (isScanning) {
      progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + (100 / (scanDelay * 10));
        });
      }, 100);
      
      // Determine if there's activity on the current frequency (simulated)
      const checkForActivity = () => {
        // 25% chance of activity on a non-emergency frequency
        // 10% chance on emergency frequency for realism
        const randomChance = Math.random();
        if (currentScanningFrequency) {
          const threshold = currentScanningFrequency.isEmergency ? 0.10 : 0.25;
          const newHasActivity = randomChance < threshold;
          
          if (newHasActivity && !hasActivity) {
            // Play static/beep sound when activity detected
            if (audioRef.current && !isMuted) {
              // Simulate radio static sound
              audioRef.current.src = "data:audio/wav;base64,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";
              audioRef.current.volume = volume / 100;
              audioRef.current.play();
              
              // Show a toast notification for activity
              toast({
                title: "Activity Detected!",
                description: `Signal on ${currentScanningFrequency.frequency.toFixed(3)} MHz - ${currentScanningFrequency.name}`,
                variant: "default",
                duration: 3000,
              });
            }
          }
          
          setHasActivity(newHasActivity);
        }
      };
      
      // Check for activity on frequency change
      checkForActivity();
    }
    
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [isScanning, currentScanningFrequency, scanDelay, hasActivity, isMuted, volume]);

  const handleStartScan = () => {
    if (selectedFrequencies.length === 0) return;
    
    // Play scanner start sound
    if (audioRef.current && !isMuted) {
      audioRef.current.src = "data:audio/wav;base64,UklGRiQDAABXQVZFZm10IBAAAAABAAEAiBMAADgTAAABAAgAZGF0YQACAADpW2dY+F0AXfJdAF9BaQBqBldAWaxcAKDxlACHKFgAgICAgA==";
      audioRef.current.volume = volume / 100;
      audioRef.current.play();
    }
    
    setIsScanning(true);
    setScanProgress(0);
    setHasActivity(false);
    
    // Notify user that scanner has started
    toast({
      title: "Scanner Active",
      description: "Monitoring selected frequencies. Activity will be reported.",
      variant: "default",
    });
    
    // Get the selected frequency objects
    const selectedFreqs = frequencies.filter(f => 
      selectedFrequencies.includes(f.id)
    );
    
    setFreqsToScan(selectedFreqs);
    
    // Set initial frequency
    setCurrentScanningFrequency(selectedFreqs[0]);
    
    // Set up the interval to cycle through frequencies
    const interval = setInterval(() => {
      // Play frequency change beep sound
      if (audioRef.current && !isMuted) {
        audioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
        audioRef.current.volume = (volume / 100) * 0.3; // Lower volume for frequency change beep
        audioRef.current.play();
      }
      
      setCurrentScanningFrequency(prev => {
        if (!prev || selectedFreqs.length === 0) return selectedFreqs[0];
        const currentIndex = selectedFreqs.findIndex(f => f.id === prev.id);
        const nextIndex = (currentIndex + 1) % selectedFreqs.length;
        return selectedFreqs[nextIndex];
      });
      
      // Reset progress bar for next frequency
      setScanProgress(0);
      setHasActivity(false);
    }, scanDelay * 1000);
    
    setScanInterval(interval);
  };

  const handleStopScan = () => {
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
    
    // Play scanner stop sound
    if (audioRef.current && !isMuted) {
      audioRef.current.src = "data:audio/wav;base64,UklGRiQDAABXQVZFZm10IBAAAAABAAEAiBMAAOATAAABAAgAZGF0YQADAADYANiA2ADY";
      audioRef.current.volume = volume / 100;
      audioRef.current.play();
    }
    
    setIsScanning(false);
    setCurrentScanningFrequency(null);
    setScanProgress(0);
    setHasActivity(false);
    
    toast({
      title: "Scanner Stopped",
      description: "Frequency monitoring has been stopped.",
      variant: "default",
    });
  };
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleFrequencySelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedFrequencies(prev => [...prev, id]);
    } else {
      setSelectedFrequencies(prev => prev.filter(f => f !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-2 mb-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-8 w-full mb-1" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-6 w-40 mb-2" />
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-16 w-full mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow mb-4 p-4">
      <h2 className="font-bold text-lg mb-2">Active Scanner</h2>
      <p className="text-sm text-gray-600 mb-4">Monitor multiple frequencies at once. Select the frequencies you want to scan below.</p>
      
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={isScanning ? "outline" : "default"}
          className={isScanning ? "bg-gray-200 text-gray-700" : "bg-primary text-white"}
          disabled={isScanning || selectedFrequencies.length === 0}
          onClick={handleStartScan}
        >
          <span className="material-icons mr-1">play_arrow</span>
          Start Scan
        </Button>
        <Button 
          variant={isScanning ? "destructive" : "outline"}
          disabled={!isScanning}
          onClick={handleStopScan}
        >
          <span className="material-icons mr-1">stop</span>
          Stop
        </Button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Scan Delay (seconds)</label>
        <Slider
          value={[scanDelay]}
          min={1}
          max={10}
          step={1}
          onValueChange={(value) => setScanDelay(value[0])}
          disabled={isScanning}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1s</span>
          <span>5s</span>
          <span>10s</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">Volume</label>
          <div className="flex items-center">
            <button 
              className="p-1 focus:outline-none" 
              onClick={() => setIsMuted(!isMuted)}
            >
              <span className="material-icons text-gray-500">
                {isMuted ? 'volume_off' : volume < 30 ? 'volume_down' : 'volume_up'}
              </span>
            </button>
          </div>
        </div>
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Mute</span>
          <span>Max</span>
        </div>
      </div>

      <div className="border rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Currently Scanning</h3>
          <div className="flex">
            {hasActivity && (
              <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-300">
                <span className="material-icons text-green-500 mr-1 text-sm">
                  radio_button_checked
                </span>
                Activity
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              {isScanning ? `Scanning ${freqsToScan.length} frequencies` : "No active scan"}
            </span>
          </div>
        </div>
        
        {isScanning && (
          <div className="mb-2">
            <Progress value={scanProgress} className="h-1" />
          </div>
        )}
        
        <div className={`bg-gray-100 rounded-lg p-3 h-32 flex items-center justify-center relative ${hasActivity ? 'bg-green-50' : ''}`}>
          {isScanning && currentScanningFrequency ? (
            <div className="text-center">
              <h3 className={`text-xl font-bold ${hasActivity ? 'text-green-600' : 'text-primary'}`}>
                {currentScanningFrequency.frequency.toFixed(3)} MHz
              </h3>
              <p className={`${hasActivity ? 'text-green-700' : 'text-gray-700'}`}>
                {currentScanningFrequency.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tone: {currentScanningFrequency.tone || "None"}
              </p>
              
              {currentScanningFrequency.isEmergency && (
                <Badge className="mt-2 bg-amber-100 text-amber-800 border-amber-300">
                  Emergency Frequency
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              <span className="material-icons block mx-auto mb-2 text-3xl">radio</span>
              Start scanning to monitor frequencies
            </p>
          )}
          
          {isScanning && hasActivity && (
            <div className="absolute inset-0 pointer-events-none border-2 border-green-500 rounded-lg animate-pulse"></div>
          )}
        </div>
      </div>

      <h3 className="font-bold mb-2">Frequencies to Scan</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {frequencies.map(freq => (
          <div key={freq.id} className="flex items-center border rounded-lg p-3">
            <Checkbox 
              id={`scan-freq-${freq.id}`} 
              checked={selectedFrequencies.includes(freq.id)}
              onCheckedChange={(checked) => handleFrequencySelect(freq.id, checked === true)}
              disabled={isScanning}
            />
            <label 
              htmlFor={`scan-freq-${freq.id}`} 
              className="ml-2 block text-sm text-gray-700"
            >
              {freq.frequency.toFixed(3)} MHz - {freq.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScannerControls;
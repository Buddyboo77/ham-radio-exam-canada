import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Frequency } from "@shared/schema";

const ScannerControls = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanDelay, setScanDelay] = useState(3);
  const [selectedFrequencies, setSelectedFrequencies] = useState<number[]>([]);
  const [currentScanningFrequency, setCurrentScanningFrequency] = useState<Frequency | null>(null);
  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);
  const [freqsToScan, setFreqsToScan] = useState<Frequency[]>([]);

  const { data: frequencies = [], isLoading } = useQuery<Frequency[]>({
    queryKey: ["/api/frequencies"],
  });

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

  const handleStartScan = () => {
    if (selectedFrequencies.length === 0) return;
    
    setIsScanning(true);
    
    // Get the selected frequency objects
    const selectedFreqs = frequencies.filter(f => 
      selectedFrequencies.includes(f.id)
    );
    
    setFreqsToScan(selectedFreqs);
    
    // Set initial frequency
    setCurrentScanningFrequency(selectedFreqs[0]);
    
    // Set up the interval to cycle through frequencies
    const interval = setInterval(() => {
      setCurrentScanningFrequency(prev => {
        if (!prev || selectedFreqs.length === 0) return selectedFreqs[0];
        const currentIndex = selectedFreqs.findIndex(f => f.id === prev.id);
        const nextIndex = (currentIndex + 1) % selectedFreqs.length;
        return selectedFreqs[nextIndex];
      });
    }, scanDelay * 1000);
    
    setScanInterval(interval);
  };

  const handleStopScan = () => {
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
    setIsScanning(false);
    setCurrentScanningFrequency(null);
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

      <div className="border rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Currently Scanning</h3>
          <span className="text-sm text-gray-500">
            {isScanning ? `Scanning ${freqsToScan.length} frequencies` : "No active scan"}
          </span>
        </div>
        <div className="bg-gray-100 rounded-lg p-3 h-32 flex items-center justify-center">
          {isScanning && currentScanningFrequency ? (
            <div className="text-center">
              <h3 className="text-xl font-bold text-primary">{currentScanningFrequency.frequency.toFixed(3)} MHz</h3>
              <p className="text-gray-700">{currentScanningFrequency.name}</p>
              <p className="text-xs text-gray-500 mt-1">Tone: {currentScanningFrequency.tone || "None"}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              <span className="material-icons block mx-auto mb-2 text-3xl">radio</span>
              Start scanning to monitor frequencies
            </p>
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
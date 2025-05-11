import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Radio, Wifi, Share2, PanelRight, PanelLeft, BarChart2 } from 'lucide-react';
import { formatFrequency } from '@/lib/utils';

// Band plan data
const BAND_PLANS = {
  hf: [
    { name: '160 Meters', min: 1.8, max: 2.0, allocations: [
      { min: 1.8, max: 1.81, mode: 'CW', name: 'CW/Digital', color: 'blue' },
      { min: 1.81, max: 1.85, mode: 'CW/DIGITAL', name: 'CW/Digital', color: 'blue' },
      { min: 1.85, max: 1.91, mode: 'SSB/CW', name: 'SSB/CW', color: 'green' },
      { min: 1.91, max: 1.995, mode: 'SSB', name: 'SSB', color: 'green' },
      { min: 1.995, max: 2.0, mode: 'EXPERIMENTAL', name: 'Experimental', color: 'purple' },
    ]},
    { name: '80 Meters', min: 3.5, max: 4.0, allocations: [
      { min: 3.5, max: 3.6, mode: 'CW', name: 'CW', color: 'blue' },
      { min: 3.6, max: 3.7, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 3.7, max: 3.8, mode: 'SSB/CW', name: 'LSB/CW', color: 'green' },
      { min: 3.8, max: 4.0, mode: 'SSB', name: 'LSB', color: 'green' },
    ]},
    { name: '40 Meters', min: 7.0, max: 7.3, allocations: [
      { min: 7.0, max: 7.125, mode: 'CW', name: 'CW', color: 'blue' },
      { min: 7.125, max: 7.175, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 7.175, max: 7.3, mode: 'SSB', name: 'LSB', color: 'green' },
    ]},
    { name: '20 Meters', min: 14.0, max: 14.35, allocations: [
      { min: 14.0, max: 14.07, mode: 'CW', name: 'CW', color: 'blue' },
      { min: 14.07, max: 14.15, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 14.15, max: 14.35, mode: 'SSB', name: 'USB', color: 'green' },
    ]},
    { name: '15 Meters', min: 21.0, max: 21.45, allocations: [
      { min: 21.0, max: 21.07, mode: 'CW', name: 'CW', color: 'blue' },
      { min: 21.07, max: 21.15, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 21.15, max: 21.45, mode: 'SSB', name: 'USB', color: 'green' },
    ]},
    { name: '10 Meters', min: 28.0, max: 29.7, allocations: [
      { min: 28.0, max: 28.07, mode: 'CW', name: 'CW', color: 'blue' },
      { min: 28.07, max: 28.3, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 28.3, max: 29.3, mode: 'SSB', name: 'USB', color: 'green' },
      { min: 29.3, max: 29.51, mode: 'SATELLITE', name: 'Satellite', color: 'purple' },
      { min: 29.51, max: 29.7, mode: 'FM', name: 'FM Repeaters', color: 'red' },
    ]},
  ],
  vhf: [
    { name: '6 Meters', min: 50.0, max: 54.0, allocations: [
      { min: 50.0, max: 50.1, mode: 'CW/BEACON', name: 'CW/Beacons', color: 'blue' },
      { min: 50.1, max: 50.3, mode: 'SSB/CW', name: 'SSB/CW DX', color: 'green' },
      { min: 50.3, max: 50.6, mode: 'ALL', name: 'All Modes', color: 'green' },
      { min: 50.6, max: 50.8, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 50.8, max: 51.0, mode: 'FM', name: 'FM Simplex', color: 'red' },
      { min: 51.0, max: 54.0, mode: 'FM', name: 'FM Repeaters', color: 'red' },
    ]},
    { name: '2 Meters', min: 144.0, max: 148.0, allocations: [
      { min: 144.0, max: 144.1, mode: 'CW', name: 'CW', color: 'blue' },
      { min: 144.1, max: 144.2, mode: 'SSB', name: 'SSB', color: 'green' },
      { min: 144.2, max: 144.275, mode: 'SSB/CW', name: 'SSB/CW', color: 'green' },
      { min: 144.275, max: 144.3, mode: 'BEACON', name: 'Beacons', color: 'purple' },
      { min: 144.3, max: 144.5, mode: 'SATELLITE', name: 'Satellite', color: 'purple' },
      { min: 144.5, max: 144.9, mode: 'LINEAR', name: 'Linear Translators', color: 'purple' },
      { min: 144.9, max: 145.1, mode: 'FM', name: 'FM Simplex', color: 'red' },
      { min: 145.1, max: 145.5, mode: 'FM', name: 'FM Repeater Inputs', color: 'red' },
      { min: 145.5, max: 145.8, mode: 'FM', name: 'FM Repeater Outputs', color: 'red' },
      { min: 145.8, max: 146.0, mode: 'SATELLITE', name: 'Satellite', color: 'purple' },
      { min: 146.0, max: 146.4, mode: 'FM', name: 'FM Repeater Inputs', color: 'red' },
      { min: 146.4, max: 146.6, mode: 'FM', name: 'FM Simplex', color: 'red' },
      { min: 146.6, max: 147.0, mode: 'FM', name: 'FM Repeater Outputs', color: 'red' },
      { min: 147.0, max: 147.4, mode: 'FM', name: 'FM Repeater Outputs', color: 'red' },
      { min: 147.4, max: 147.6, mode: 'FM', name: 'FM Simplex', color: 'red' },
      { min: 147.6, max: 148.0, mode: 'FM', name: 'FM Repeater Inputs', color: 'red' },
    ]},
    { name: '1.25 Meters', min: 222.0, max: 225.0, allocations: [
      { min: 222.0, max: 222.1, mode: 'CW/DIGITAL', name: 'CW/Digital', color: 'blue' },
      { min: 222.1, max: 222.25, mode: 'SSB/CW', name: 'SSB/CW', color: 'green' },
      { min: 222.25, max: 223.38, mode: 'FM', name: 'FM Repeater Inputs', color: 'red' },
      { min: 223.38, max: 223.52, mode: 'FM', name: 'FM Simplex', color: 'red' },
      { min: 223.52, max: 223.64, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 223.64, max: 223.7, mode: 'LINK', name: 'Links', color: 'purple' },
      { min: 223.7, max: 223.85, mode: 'FM', name: 'FM Simplex', color: 'red' },
      { min: 223.85, max: 225.0, mode: 'FM', name: 'FM Repeater Outputs', color: 'red' },
    ]},
  ],
  uhf: [
    { name: '70 Centimeters', min: 420.0, max: 450.0, allocations: [
      { min: 420.0, max: 426.0, mode: 'ATV', name: 'ATV', color: 'purple' },
      { min: 426.0, max: 432.0, mode: 'ATV', name: 'ATV', color: 'purple' },
      { min: 432.0, max: 432.1, mode: 'CW', name: 'CW', color: 'blue' },
      { min: 432.1, max: 432.3, mode: 'SSB/CW', name: 'SSB/CW', color: 'green' },
      { min: 432.3, max: 432.4, mode: 'BEACON', name: 'Beacons', color: 'purple' },
      { min: 432.4, max: 433.0, mode: 'MIXED', name: 'Mixed Modes', color: 'green' },
      { min: 433.0, max: 435.0, mode: 'SATELLITE', name: 'Satellite', color: 'purple' },
      { min: 435.0, max: 438.0, mode: 'SATELLITE', name: 'Satellite', color: 'purple' },
      { min: 438.0, max: 444.0, mode: 'ATV', name: 'ATV', color: 'purple' },
      { min: 442.0, max: 445.0, mode: 'FM', name: 'FM Repeater Outputs', color: 'red' },
      { min: 445.0, max: 447.0, mode: 'FM', name: 'FM Simplex', color: 'red' },
      { min: 447.0, max: 450.0, mode: 'FM', name: 'FM Repeater Inputs', color: 'red' },
    ]},
    { name: '33 Centimeters', min: 902.0, max: 928.0, allocations: [
      { min: 902.0, max: 903.0, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 903.0, max: 903.1, mode: 'CW', name: 'CW', color: 'blue' },
      { min: 903.1, max: 903.4, mode: 'SSB/CW', name: 'SSB/CW', color: 'green' },
      { min: 903.4, max: 909.0, mode: 'MIXED', name: 'Mixed Modes/FM Repeaters', color: 'red' },
      { min: 909.0, max: 915.0, mode: 'ATV', name: 'ATV', color: 'purple' },
      { min: 915.0, max: 918.0, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 918.0, max: 928.0, mode: 'ATV', name: 'ATV', color: 'purple' },
    ]},
    { name: '23 Centimeters', min: 1240.0, max: 1300.0, allocations: [
      { min: 1240.0, max: 1246.0, mode: 'ATV', name: 'ATV', color: 'purple' },
      { min: 1246.0, max: 1248.0, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 1248.0, max: 1258.0, mode: 'ATV', name: 'ATV', color: 'purple' },
      { min: 1258.0, max: 1260.0, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 1260.0, max: 1270.0, mode: 'SATELLITE', name: 'Satellite', color: 'purple' },
      { min: 1270.0, max: 1276.0, mode: 'MIXED', name: 'Mixed Modes/FM Repeaters', color: 'red' },
      { min: 1276.0, max: 1282.0, mode: 'ATV', name: 'ATV', color: 'purple' },
      { min: 1282.0, max: 1288.0, mode: 'MIXED', name: 'Mixed Modes', color: 'green' },
      { min: 1288.0, max: 1294.0, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 1294.0, max: 1295.0, mode: 'FM', name: 'FM Simplex', color: 'red' },
      { min: 1295.0, max: 1297.0, mode: 'FM', name: 'FM Repeaters', color: 'red' },
      { min: 1297.0, max: 1300.0, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
    ]},
  ],
  shf: [
    { name: '13 Centimeters', min: 2300.0, max: 2450.0, allocations: [
      { min: 2300.0, max: 2303.0, mode: 'DIGITAL', name: 'Digital', color: 'blue' },
      { min: 2303.0, max: 2303.5, mode: 'SSB/CW', name: 'SSB/CW', color: 'green' },
      { min: 2303.5, max: 2304.0, mode: 'MIXED', name: 'Mixed Modes', color: 'green' },
      { min: 2304.0, max: 2304.1, mode: 'BEACON', name: 'Beacons', color: 'purple' },
      { min: 2304.1, max: 2304.2, mode: 'SSB/CW', name: 'SSB/CW', color: 'green' },
      { min: 2304.2, max: 2400.0, mode: 'MIXED', name: 'Mixed Modes', color: 'green' },
      { min: 2400.0, max: 2450.0, mode: 'SATELLITE', name: 'Satellite', color: 'purple' },
    ]},
    { name: '9 Centimeters', min: 3300.0, max: 3500.0, allocations: [
      { min: 3300.0, max: 3500.0, mode: 'MIXED', name: 'Mixed Modes', color: 'green' },
    ]},
    { name: '5 Centimeters', min: 5650.0, max: 5925.0, allocations: [
      { min: 5650.0, max: 5670.0, mode: 'SATELLITE', name: 'Satellite Uplink', color: 'purple' },
      { min: 5670.0, max: 5760.0, mode: 'MIXED', name: 'Mixed Modes', color: 'green' },
      { min: 5760.0, max: 5760.1, mode: 'BEACON', name: 'Beacons', color: 'purple' },
      { min: 5760.1, max: 5760.3, mode: 'SSB/CW', name: 'SSB/CW', color: 'green' },
      { min: 5760.3, max: 5925.0, mode: 'MIXED', name: 'Mixed Modes', color: 'green' },
    ]},
  ]
};

// Color to more readable class mappings
const COLOR_CLASSES = {
  blue: 'bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200',
  green: 'bg-green-100 text-green-900 border-green-300 hover:bg-green-200',
  red: 'bg-red-100 text-red-900 border-red-300 hover:bg-red-200',
  purple: 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200'
};

interface BandChartProps {
  band: {
    name: string;
    min: number;
    max: number;
    allocations: {
      min: number;
      max: number;
      mode: string;
      name: string;
      color: string;
    }[];
  };
  frequency: number | null;
  onSelectAllocation: (min: number, max: number, name: string) => void;
}

function BandChart({ band, frequency, onSelectAllocation }: BandChartProps) {
  const totalWidth = band.max - band.min;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-sm font-medium">{band.name}</h4>
        <span className="text-xs text-gray-500">
          {band.min.toFixed(3)} - {band.max.toFixed(3)} MHz
        </span>
      </div>
      
      <div className="relative h-10 border rounded-md overflow-hidden bg-gray-100">
        {/* Band allocations */}
        <div className="flex absolute inset-0">
          {band.allocations.map((allocation, i) => {
            const width = ((allocation.max - allocation.min) / totalWidth) * 100;
            const isActive = frequency !== null && 
              frequency >= allocation.min && 
              frequency <= allocation.max;
            
            return (
              <div 
                key={i}
                className={`h-full ${isActive ? 'ring-2 ring-blue-500 z-10' : ''}`}
                style={{ width: `${width}%` }}
              >
                <button
                  className={`w-full h-full text-xs font-medium truncate px-1 border-r ${COLOR_CLASSES[allocation.color as keyof typeof COLOR_CLASSES]}`}
                  onClick={() => onSelectAllocation(allocation.min, allocation.max, allocation.name)}
                  title={`${allocation.name} (${allocation.min.toFixed(3)}-${allocation.max.toFixed(3)} MHz)`}
                >
                  {width > 5 ? allocation.name : ''}
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Current frequency marker */}
        {frequency !== null && frequency >= band.min && frequency <= band.max && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-20"
            style={{ 
              left: `${((frequency - band.min) / totalWidth) * 100}%`,
              boxShadow: '0 0 10px rgba(37, 99, 235, 0.8)' 
            }}
          />
        )}
      </div>
    </div>
  );
}

interface InteractiveBandPlanProps {
  currentFrequency?: number;
  onFrequencySelect?: (frequency: number) => void;
}

export function InteractiveBandPlan({ 
  currentFrequency, 
  onFrequencySelect 
}: InteractiveBandPlanProps) {
  const [selectedTab, setSelectedTab] = useState<string>('hf');
  const [selectedBand, setSelectedBand] = useState<{
    min: number;
    max: number;
    name: string;
  } | null>(null);
  const [frequency, setFrequency] = useState<number | null>(currentFrequency || null);
  const [expanded, setExpanded] = useState(false);
  
  const handleAllocationSelect = (min: number, max: number, name: string) => {
    setSelectedBand({ min, max, name });
    
    // If a frequency isn't already selected, select the middle of the band
    if (frequency === null) {
      const newFrequency = min + ((max - min) / 2);
      setFrequency(newFrequency);
      
      if (onFrequencySelect) {
        onFrequencySelect(newFrequency);
      }
    }
  };
  
  const handleFrequencyChange = (newFrequency: number[]) => {
    setFrequency(newFrequency[0]);
    
    if (onFrequencySelect) {
      onFrequencySelect(newFrequency[0]);
    }
    
    // Find which band allocation contains this frequency
    if (selectedTab in BAND_PLANS) {
      const bands = BAND_PLANS[selectedTab as keyof typeof BAND_PLANS];
      
      for (const band of bands) {
        if (newFrequency[0] >= band.min && newFrequency[0] <= band.max) {
          for (const allocation of band.allocations) {
            if (newFrequency[0] >= allocation.min && newFrequency[0] <= allocation.max) {
              setSelectedBand({
                min: allocation.min,
                max: allocation.max,
                name: allocation.name
              });
              return;
            }
          }
        }
      }
    }
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Find the mode for the current frequency
  let currentMode = '';
  if (frequency !== null) {
    Object.entries(BAND_PLANS).forEach(([_, bands]) => {
      bands.forEach(band => {
        if (frequency >= band.min && frequency <= band.max) {
          band.allocations.forEach(allocation => {
            if (frequency >= allocation.min && frequency <= allocation.max) {
              currentMode = allocation.mode;
            }
          });
        }
      });
    });
  }
  
  return (
    <Card className={`transition-all duration-300 ${expanded ? 'w-full' : 'w-56'} bg-white shadow-md`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-1">
            <Radio size={16} className="text-blue-500" />
            <span>Band Plan</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleExpanded}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <PanelRight size={16} /> : <PanelLeft size={16} />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4 pt-0">
        {expanded ? (
          <>
            <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-4 mb-3">
                <TabsTrigger value="hf">HF</TabsTrigger>
                <TabsTrigger value="vhf">VHF</TabsTrigger>
                <TabsTrigger value="uhf">UHF</TabsTrigger>
                <TabsTrigger value="shf">SHF</TabsTrigger>
              </TabsList>
              
              {Object.entries(BAND_PLANS).map(([key, bands]) => (
                <TabsContent key={key} value={key} className="mt-0">
                  <ScrollArea className="h-[300px] pr-3">
                    {bands.map((band, i) => (
                      <BandChart 
                        key={i} 
                        band={band} 
                        frequency={frequency}
                        onSelectAllocation={handleAllocationSelect}
                      />
                    ))}
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
            
            {selectedBand && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">{selectedBand.name}</h4>
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedBand.min.toFixed(3)}-{selectedBand.max.toFixed(3)} MHz
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <Slider
                    defaultValue={[frequency || selectedBand.min + ((selectedBand.max - selectedBand.min) / 2)]}
                    min={selectedBand.min}
                    max={selectedBand.max}
                    step={0.001}
                    onValueChange={handleFrequencyChange}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <BarChart2 size={16} className="text-blue-500" />
                    <span className="text-xs font-medium">{currentMode}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {frequency !== null && (
                      <>
                        <div className="font-mono text-sm font-medium">
                          {formatFrequency(frequency)}
                        </div>
                        <Button 
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          title="Tune to frequency"
                          onClick={() => onFrequencySelect && onFrequencySelect(frequency)}
                        >
                          <Wifi size={12} />
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          title="Share frequency"
                          onClick={() => {
                            navigator.clipboard.writeText(frequency.toString());
                          }}
                        >
                          <Share2 size={12} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Collapsed view
          <div className="text-center">
            {frequency !== null ? (
              <div className="mb-2">
                <div className="font-mono text-lg font-medium">
                  {formatFrequency(frequency)}
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentMode}
                </Badge>
              </div>
            ) : (
              <div className="text-sm text-gray-500 mb-2">No frequency selected</div>
            )}
            <Button 
              size="sm" 
              className="w-full"
              onClick={toggleExpanded}
            >
              View Band Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
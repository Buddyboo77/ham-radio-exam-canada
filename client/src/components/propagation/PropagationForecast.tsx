import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sun, Sunrise, Clock, AlertTriangle, Radio, Activity, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Solar data type
interface SolarData {
  solarFlux: number;
  aIndex: number;
  kIndex: number;
  sunspotNumber: number;
  solarWindSpeed: number;
  xrayStatus: 'normal' | 'active' | 'storm';
  updatedAt: string;
  bandConditions: {
    band: string;
    condition: 'poor' | 'fair' | 'good' | 'excellent';
    comments?: string;
  }[];
  alerts?: {
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'severe';
    startTime?: string;
    endTime?: string;
  }[];
}

export default function PropagationForecast() {
  const [activeTab, setActiveTab] = useState('bands');
  const [now, setNow] = useState(new Date());
  
  // Auto-update time
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Query for solar data
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['solarData'],
    queryFn: async () => {
      // Simulate fetching from an API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data for demonstration
      const mockData: SolarData = {
        solarFlux: 110,
        aIndex: 8,
        kIndex: 2,
        sunspotNumber: 75,
        solarWindSpeed: 423,
        xrayStatus: 'normal',
        updatedAt: new Date().toISOString(),
        bandConditions: [
          { band: '160m', condition: 'poor', comments: 'Nighttime only' },
          { band: '80m', condition: 'fair', comments: 'Best at night' },
          { band: '60m', condition: 'fair', comments: 'Improving after sunset' },
          { band: '40m', condition: 'good', comments: 'Good for regional contacts' },
          { band: '30m', condition: 'good', comments: 'Open day and night' },
          { band: '20m', condition: 'excellent', comments: 'Excellent DX conditions' },
          { band: '17m', condition: 'good', comments: 'Good daytime band' },
          { band: '15m', condition: 'fair', comments: 'Open to southern paths' },
          { band: '12m', condition: 'poor', comments: 'Marginal openings' },
          { band: '10m', condition: 'poor', comments: 'Closed except for sporadic-E' },
          { band: '6m', condition: 'poor', comments: 'Check for sporadic-E' },
          { band: '2m', condition: 'fair', comments: 'Local and regional' },
          { band: '70cm', condition: 'fair', comments: 'Good for local work' }
        ],
        alerts: [
          {
            type: 'MUF Warning',
            message: 'Maximum Usable Frequency decreasing for European paths',
            severity: 'info'
          }
        ]
      };
      
      return mockData;
    },
    // Refetch every 15 minutes
    refetchInterval: 15 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  });
  
  // Get condition color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-600';
      case 'good': return 'bg-blue-600';
      case 'fair': return 'bg-yellow-600';
      case 'poor': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };
  
  // Get condition progress value
  const getConditionProgress = (condition: string) => {
    switch (condition) {
      case 'excellent': return 100;
      case 'good': return 75;
      case 'fair': return 50;
      case 'poor': return 25;
      default: return 0;
    }
  };
  
  // Format the date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Unknown';
    }
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <div className="space-y-3">
      {/* Loading state */}
      {isLoading && (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-blue-400">Loading propagation data...</span>
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <Card className="bg-red-900/20 border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 text-lg">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-300">
              Failed to retrieve propagation data. Please check your connection and try again.
            </p>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="mt-2 border-red-700 text-red-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Data display */}
      {data && !isLoading && !isError && (
        <>
          {/* Solar indices overview */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
              <div className="text-xs text-gray-500 mb-1 flex items-center">
                <Sun className="h-3 w-3 mr-1 text-yellow-500" />
                Solar Flux
              </div>
              <div className="text-lg font-mono font-semibold text-yellow-400">
                {data.solarFlux}
              </div>
            </div>
            
            <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
              <div className="text-xs text-gray-500 mb-1 flex items-center">
                <Activity className="h-3 w-3 mr-1 text-blue-500" />
                K-Index
              </div>
              <div className="text-lg font-mono font-semibold text-blue-400">
                {data.kIndex}
              </div>
            </div>
            
            <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
              <div className="text-xs text-gray-500 mb-1 flex items-center">
                <Activity className="h-3 w-3 mr-1 text-purple-500" />
                A-Index
              </div>
              <div className="text-lg font-mono font-semibold text-purple-400">
                {data.aIndex}
              </div>
            </div>
          </div>
          
          {/* Main data display */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-blue-300">Propagation Status</CardTitle>
                <div className="flex items-center">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 px-2 text-gray-400 hover:text-white"
                    onClick={handleRefresh}
                    disabled={isFetching}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                    <span className="text-[10px]">Refresh</span>
                  </Button>
                </div>
              </div>
              <CardDescription className="text-gray-500 text-xs flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Updated {formatDate(data.updatedAt)}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="bands" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-3 h-auto p-1 bg-gray-900">
                  <TabsTrigger 
                    value="bands" 
                    className="text-[10px] py-1 h-auto data-[state=active]:bg-blue-900"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <Radio className="h-3 w-3" />
                      <span>Bands</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="solar" 
                    className="text-[10px] py-1 h-auto data-[state=active]:bg-yellow-900"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <Sun className="h-3 w-3" />
                      <span>Solar</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="alerts" 
                    className="text-[10px] py-1 h-auto data-[state=active]:bg-red-900"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Alerts</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                {/* Bands Tab */}
                <TabsContent value="bands" className="space-y-2">
                  <div className="space-y-2">
                    {data.bandConditions.map((band, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-900 p-2 rounded-md border border-gray-800 flex flex-col"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-medium text-xs text-blue-300">{band.band}</div>
                          <div className={`text-[9px] px-2 py-0.5 rounded-full ${getConditionColor(band.condition)} text-white`}>
                            {band.condition.charAt(0).toUpperCase() + band.condition.slice(1)}
                          </div>
                        </div>
                        <Progress 
                          value={getConditionProgress(band.condition)} 
                          className="h-1.5 bg-gray-800" 
                        />
                        {band.comments && (
                          <div className="text-[9px] mt-1 text-gray-400">{band.comments}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Solar Tab */}
                <TabsContent value="solar" className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
                      <div className="text-gray-500 text-xs mb-1">Sunspot Number</div>
                      <div className="text-yellow-300 font-mono text-lg">{data.sunspotNumber}</div>
                    </div>
                    
                    <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
                      <div className="text-gray-500 text-xs mb-1">Solar Wind</div>
                      <div className="text-blue-300 font-mono text-lg">{data.solarWindSpeed} km/s</div>
                    </div>
                    
                    <div className="bg-gray-900 p-2 rounded-md border border-gray-800 col-span-2">
                      <div className="text-gray-500 text-xs mb-1">X-Ray Status</div>
                      <div className={`
                        ${data.xrayStatus === 'storm' ? 'text-red-400' : 
                          data.xrayStatus === 'active' ? 'text-yellow-400' : 'text-green-400'} 
                        font-medium
                      `}>
                        {data.xrayStatus.charAt(0).toUpperCase() + data.xrayStatus.slice(1)}
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 p-2 rounded-md border border-gray-800 col-span-2">
                      <div className="text-gray-500 text-xs mb-1">Interpretation</div>
                      <div className="text-gray-300 text-xs">
                        {data.solarFlux > 100 ? (
                          "High solar flux indicates good HF propagation conditions. Expect good DX possibilities on higher bands."
                        ) : data.solarFlux > 80 ? (
                          "Moderate solar flux. HF conditions are average with some DX possible on 20-30m bands."
                        ) : (
                          "Low solar flux indicates challenging HF conditions. Lower bands may perform better."
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Alerts Tab */}
                <TabsContent value="alerts" className="space-y-2">
                  {data.alerts && data.alerts.length > 0 ? (
                    <div className="space-y-2">
                      {data.alerts.map((alert, index) => (
                        <div 
                          key={index} 
                          className={`
                            p-2 rounded-md border 
                            ${alert.severity === 'severe' ? 'bg-red-900/30 border-red-800' : 
                              alert.severity === 'warning' ? 'bg-yellow-900/30 border-yellow-800' : 
                              'bg-blue-900/30 border-blue-800'}
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 
                              ${alert.severity === 'severe' ? 'text-red-400' : 
                                alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'}
                            `} />
                            <div className="font-medium text-sm text-gray-300">{alert.type}</div>
                          </div>
                          <div className="mt-1 text-xs text-gray-400">{alert.message}</div>
                          {alert.startTime && alert.endTime && (
                            <div className="mt-1 text-[10px] text-gray-500">
                              {formatDate(alert.startTime)} - {formatDate(alert.endTime)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-green-400 bg-green-900/20 border border-green-800 rounded-md">
                      <div className="flex items-center justify-center">
                        <Sun className="h-4 w-4 mr-2" />
                        <span>No active alerts at this time</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Solar conditions are stable
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Current time at bottom */}
          <div className="bg-gray-900 p-2 rounded-md border border-gray-800 flex justify-between items-center text-xs">
            <div className="flex items-center text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              {now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
              })}
            </div>
            <div className="flex items-center text-gray-400">
              <Sunrise className="h-3 w-3 mr-1" />
              <span>
                UTC: {now.toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'UTC'
                })}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
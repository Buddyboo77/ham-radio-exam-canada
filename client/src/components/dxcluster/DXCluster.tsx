import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wifi, Globe, Filter, Clock, Loader2, Radio, Flag, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// DX Spot type
interface DXSpot {
  id: string;
  frequency: number;
  dx: string;
  spotter: string;
  time: string;
  comment: string;
  band?: string;
  mode?: string;
  country?: string;
  continent?: string;
}

export default function DXCluster() {
  const [activeTab, setActiveTab] = useState('all');
  const [filterBand, setFilterBand] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Query for DX spots
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dxSpots'],
    queryFn: async () => {
      // Simulate fetching from an API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data for demonstration
      const mockSpots: DXSpot[] = [
        {
          id: '1',
          frequency: 14074.0,
          dx: 'JA1ABC',
          spotter: 'W1AW',
          time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          comment: 'TNX FT8 -10dB',
          band: '20m',
          mode: 'FT8',
          country: 'Japan',
          continent: 'AS'
        },
        {
          id: '2',
          frequency: 7074.0,
          dx: 'ZL2XYZ',
          spotter: 'VK3ABC',
          time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          comment: 'Good signal',
          band: '40m',
          mode: 'FT8',
          country: 'New Zealand',
          continent: 'OC'
        },
        {
          id: '3',
          frequency: 3573.0,
          dx: 'G0XYZ',
          spotter: 'DL2ABC',
          time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          comment: 'CQ DX',
          band: '80m',
          mode: 'FT8',
          country: 'England',
          continent: 'EU'
        },
        {
          id: '4',
          frequency: 14195.0,
          dx: 'ZS6XYZ',
          spotter: 'EA3ABC',
          time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          comment: 'LOUD',
          band: '20m',
          mode: 'SSB',
          country: 'South Africa',
          continent: 'AF'
        },
        {
          id: '5',
          frequency: 21300.0,
          dx: 'PY5XYZ',
          spotter: 'LU8ABC',
          time: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          comment: 'Working EU',
          band: '15m',
          mode: 'SSB',
          country: 'Brazil',
          continent: 'SA'
        },
        {
          id: '6',
          frequency: 50313.0,
          dx: 'EA8XYZ',
          spotter: 'F5ABC',
          time: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          comment: 'ES Opening',
          band: '6m',
          mode: 'FT8',
          country: 'Canary Islands',
          continent: 'AF'
        },
        {
          id: '7',
          frequency: 28074.0,
          dx: 'A71XYZ',
          spotter: 'SV5ABC',
          time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          comment: 'CQ DX',
          band: '10m',
          mode: 'FT8',
          country: 'Qatar',
          continent: 'AS'
        }
      ];
      
      return mockSpots;
    },
    // Refresh every minute if autoRefresh is enabled
    refetchInterval: autoRefresh ? 60 * 1000 : false,
  });
  
  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        refetch();
      }, 60 * 1000); // Refresh every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refetch]);
  
  // Filter spots based on active tab, band, mode, and search term
  const filteredSpots = data?.filter(spot => {
    // Active tab filter
    if (activeTab !== 'all' && spot.continent !== activeTab) {
      return false;
    }
    
    // Band filter
    if (filterBand !== 'all' && spot.band !== filterBand) {
      return false;
    }
    
    // Mode filter
    if (filterMode !== 'all' && spot.mode !== filterMode) {
      return false;
    }
    
    // Search term
    if (searchTerm && !spot.dx.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !spot.comment.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !spot.country?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  }) || [];
  
  // Format frequency
  const formatFrequency = (freq: number) => {
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(3)} MHz`;
    }
    return `${freq.toFixed(1)} kHz`;
  };
  
  // Format time as "x minutes ago"
  const formatTime = (timeStr: string) => {
    try {
      const spotTime = new Date(timeStr);
      const now = new Date();
      const diffMs = now.getTime() - spotTime.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins === 1) return '1 min ago';
      if (diffMins < 60) return `${diffMins} mins ago`;
      
      const hours = Math.floor(diffMins / 60);
      if (hours === 1) return '1 hour ago';
      return `${hours} hours ago`;
    } catch {
      return 'Unknown';
    }
  };
  
  // Get color for continent
  const getContinentColor = (continent?: string) => {
    switch (continent) {
      case 'NA': return 'bg-green-600';
      case 'EU': return 'bg-blue-600';
      case 'AS': return 'bg-yellow-600';
      case 'AF': return 'bg-red-600';
      case 'OC': return 'bg-purple-600';
      case 'SA': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search callsign, country or comment"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700 text-xs"
          />
          <Button 
            onClick={handleRefresh} 
            disabled={isFetching}
            size="sm"
            className="bg-blue-700 hover:bg-blue-600"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Select value={filterBand} onValueChange={setFilterBand}>
              <SelectTrigger className="w-[100px] h-8 text-xs bg-gray-800 border-gray-700">
                <SelectValue placeholder="Band" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Bands</SelectItem>
                <SelectItem value="160m">160m</SelectItem>
                <SelectItem value="80m">80m</SelectItem>
                <SelectItem value="60m">60m</SelectItem>
                <SelectItem value="40m">40m</SelectItem>
                <SelectItem value="30m">30m</SelectItem>
                <SelectItem value="20m">20m</SelectItem>
                <SelectItem value="17m">17m</SelectItem>
                <SelectItem value="15m">15m</SelectItem>
                <SelectItem value="12m">12m</SelectItem>
                <SelectItem value="10m">10m</SelectItem>
                <SelectItem value="6m">6m</SelectItem>
                <SelectItem value="2m">2m</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterMode} onValueChange={setFilterMode}>
              <SelectTrigger className="w-[100px] h-8 text-xs bg-gray-800 border-gray-700">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="CW">CW</SelectItem>
                <SelectItem value="SSB">SSB</SelectItem>
                <SelectItem value="FT8">FT8</SelectItem>
                <SelectItem value="FT4">FT4</SelectItem>
                <SelectItem value="RTTY">RTTY</SelectItem>
                <SelectItem value="PSK">PSK</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-xs text-gray-400">Auto-refresh</Label>
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-blue-400">Loading DX spots...</span>
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
              Failed to retrieve DX cluster data. Please check your connection and try again.
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
      
      {/* Spots display */}
      {data && !isLoading && !isError && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-blue-300">DX Spots</CardTitle>
              <div className="text-xs text-gray-400 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>Auto-refresh: {autoRefresh ? 'On' : 'Off'}</span>
              </div>
            </div>
            <CardDescription className="text-gray-500 text-xs flex items-center">
              <Radio className="h-3 w-3 mr-1" />
              {filteredSpots.length} spots displayed
              {searchTerm && ` (filtered by "${searchTerm}")`}
              {filterBand !== 'all' && ` on ${filterBand}`}
              {filterMode !== 'all' && ` using ${filterMode}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-7 h-auto p-1 bg-gray-900 overflow-x-auto gap-0.5">
                <TabsTrigger 
                  value="all" 
                  className="text-[10px] py-1 h-auto data-[state=active]:bg-gray-700"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Globe className="h-3 w-3" />
                    <span>All</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="NA" 
                  className="text-[10px] py-1 h-auto data-[state=active]:bg-green-900"
                >
                  <span>NA</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="EU" 
                  className="text-[10px] py-1 h-auto data-[state=active]:bg-blue-900"
                >
                  <span>EU</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="AS" 
                  className="text-[10px] py-1 h-auto data-[state=active]:bg-yellow-900"
                >
                  <span>AS</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="AF" 
                  className="text-[10px] py-1 h-auto data-[state=active]:bg-red-900"
                >
                  <span>AF</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="OC" 
                  className="text-[10px] py-1 h-auto data-[state=active]:bg-purple-900"
                >
                  <span>OC</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="SA" 
                  className="text-[10px] py-1 h-auto data-[state=active]:bg-orange-900"
                >
                  <span>SA</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="space-y-2">
                {filteredSpots.length > 0 ? (
                  filteredSpots.map((spot) => (
                    <div 
                      key={spot.id} 
                      className="bg-gray-900 p-2 rounded-md border border-gray-800"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center">
                          <span className="font-mono text-yellow-300 font-medium">{spot.dx}</span>
                          {spot.country && (
                            <Badge 
                              variant="outline" 
                              className={`ml-2 px-1 py-0 text-[8px] ${getContinentColor(spot.continent)} border-none`}
                            >
                              {spot.country}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center">
                          <Clock className="h-2 w-2 mr-1" />
                          {formatTime(spot.time)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-300">
                          <span className="font-mono text-blue-300">{formatFrequency(spot.frequency)}</span>
                          {spot.band && <span className="ml-1 text-gray-500">({spot.band})</span>}
                          {spot.mode && <span className="ml-1 text-green-400">{spot.mode}</span>}
                        </div>
                        <div className="text-[10px] text-gray-500">Spotted by {spot.spotter}</div>
                      </div>
                      
                      {spot.comment && (
                        <div className="mt-1 text-[10px] text-gray-400 italic">{spot.comment}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 bg-gray-900/50 rounded-md border border-gray-800">
                    <Search className="h-5 w-5 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No spots match your current filters</p>
                    <p className="text-gray-600 text-xs mt-1">Try changing your search criteria</p>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
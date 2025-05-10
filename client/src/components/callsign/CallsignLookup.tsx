import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, MapPin, Radio, User, Mail, Calendar, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CallsignData {
  call: string;
  name: string;
  addr1?: string;
  addr2?: string;
  state?: string;
  zip?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  grid?: string;
  county?: string;
  license_class?: string;
  expires?: string;
  status?: string;
  email?: string;
  qsl_via?: string;
  born?: string;
  aliases?: string[];
  previous_calls?: string[];
}

export default function CallsignLookup() {
  const [callsign, setCallsign] = useState('');
  const [searchCallsign, setSearchCallsign] = useState('');
  
  // Query for callsign data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['callsign', searchCallsign],
    queryFn: async () => {
      if (!searchCallsign) return null;
      try {
        // Mock API response for now - in production, replace with real API
        // const data = await apiRequest<CallsignData>(`/api/callsign/${searchCallsign}`);
        
        // Simulated response for demonstration
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        
        // For demo purposes, generate a response based on callsign
        // In a real app, this would be an API call to a callsign database
        if (searchCallsign.toUpperCase() === 'VA7HAM') {
          return {
            call: 'VA7HAM',
            name: 'Powell River Amateur Radio',
            addr1: '123 Radio Ave',
            addr2: 'Powell River',
            state: 'BC',
            country: 'Canada',
            latitude: 49.8352,
            longitude: -124.5248,
            grid: 'CN89sm',
            license_class: 'Advanced',
            expires: '2028-06-30',
            status: 'Active',
            email: 'info@powellriverarc.ca'
          } as CallsignData;
        }
        
        return {
          call: searchCallsign.toUpperCase(),
          name: 'Amateur Radio Operator',
          country: 'Unknown',
          status: 'Unknown'
        } as CallsignData;
      } catch (error) {
        console.error('Error fetching callsign data:', error);
        throw error;
      }
    },
    enabled: !!searchCallsign,
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (callsign.trim()) {
      setSearchCallsign(callsign.trim().toUpperCase());
    }
  };
  
  // Function to generate map URL
  const getMapUrl = (lat?: number, lng?: number) => {
    if (!lat || !lng) return '';
    return `https://maps.google.com/maps?q=${lat},${lng}&z=10`;
  };
  
  // Function to format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };
  
  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter callsign (e.g., VA7HAM)"
          value={callsign}
          onChange={(e) => setCallsign(e.target.value)}
          className="bg-gray-800 border-gray-700"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !callsign.trim()}
          className="bg-blue-700 hover:bg-blue-600"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-2">Lookup</span>
        </Button>
      </form>
      
      {/* Results */}
      {isLoading && (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-blue-400">Looking up callsign information...</span>
        </div>
      )}
      
      {isError && (
        <Card className="bg-red-900/20 border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 text-lg">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-300">
              Failed to retrieve callsign information. Please try again later.
            </p>
          </CardContent>
        </Card>
      )}
      
      {data && !isLoading && !isError && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-mono text-yellow-300">{data.call}</CardTitle>
                <CardDescription className="text-gray-400">{data.name}</CardDescription>
              </div>
              <div className="bg-gray-900 px-2 py-1 rounded-md border border-gray-700">
                <span className={`text-xs font-medium ${
                  data.status === 'Active' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {data.status || 'Unknown'}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid grid-cols-3 h-auto p-1 bg-gray-900">
                <TabsTrigger 
                  value="details" 
                  className="text-[10px] py-1 h-auto data-[state=active]:bg-blue-900"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <User className="h-3 w-3" />
                    <span>Details</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="location" 
                  className="text-[10px] py-1 h-auto data-[state=active]:bg-green-900"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    <span>Location</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="radio" 
                  className="text-[10px] py-1 h-auto data-[state=active]:bg-purple-900"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Radio className="h-3 w-3" />
                    <span>Radio</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
                    <div className="text-gray-500 text-xs mb-1 flex items-center">
                      <User className="h-3 w-3 mr-1" /> Operator
                    </div>
                    <div className="text-gray-300">{data.name}</div>
                  </div>
                  
                  <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
                    <div className="text-gray-500 text-xs mb-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> Expires
                    </div>
                    <div className="text-gray-300">{formatDate(data.expires)}</div>
                  </div>
                  
                  {data.email && (
                    <div className="bg-gray-900 p-2 rounded-md border border-gray-800 col-span-2">
                      <div className="text-gray-500 text-xs mb-1 flex items-center">
                        <Mail className="h-3 w-3 mr-1" /> Email
                      </div>
                      <div className="text-blue-400 text-xs overflow-hidden text-ellipsis">
                        {data.email}
                      </div>
                    </div>
                  )}
                  
                  {data.license_class && (
                    <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
                      <div className="text-gray-500 text-xs mb-1">License Class</div>
                      <div className="text-gray-300">{data.license_class}</div>
                    </div>
                  )}
                  
                  {data.country && (
                    <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
                      <div className="text-gray-500 text-xs mb-1">Country</div>
                      <div className="text-gray-300">{data.country}</div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="location" className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {data.grid && (
                    <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
                      <div className="text-gray-500 text-xs mb-1">Grid Square</div>
                      <div className="text-gray-300 font-mono">{data.grid}</div>
                    </div>
                  )}
                  
                  {data.latitude && data.longitude && (
                    <>
                      <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
                        <div className="text-gray-500 text-xs mb-1">Coordinates</div>
                        <div className="text-gray-300 font-mono text-xs">
                          {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
                        </div>
                      </div>
                      
                      <div className="col-span-2 bg-gray-900 p-2 rounded-md border border-gray-800">
                        <a
                          href={getMapUrl(data.latitude, data.longitude)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 justify-center py-1"
                        >
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs">View on Map</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </>
                  )}
                  
                  {data.addr1 && (
                    <div className="bg-gray-900 p-2 rounded-md border border-gray-800 col-span-2">
                      <div className="text-gray-500 text-xs mb-1">Address</div>
                      <div className="text-gray-300 text-xs">
                        {data.addr1}
                        {data.addr2 && <div>{data.addr2}</div>}
                        {data.state && data.zip && (
                          <div>
                            {data.state}, {data.zip}
                          </div>
                        )}
                        {data.country && <div>{data.country}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="radio" className="space-y-2">
                <div className="bg-gray-900 p-2 rounded-md border border-gray-800">
                  <div className="text-gray-500 text-xs">
                    Additional radio information will be displayed here when available.
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {/* Help text */}
      {!searchCallsign && !isLoading && (
        <div className="text-center p-3 bg-gray-800/40 rounded-md border border-gray-700 text-gray-400 text-sm">
          Enter a callsign above to look up operator details. For this demo, try using "VA7HAM".
        </div>
      )}
    </div>
  );
}
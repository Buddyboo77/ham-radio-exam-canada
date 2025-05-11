import { useMemo } from 'react';
import { LogEntry } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  GitMerge,
  Globe,
  Award,
  Radio,
  Zap,
  Layers,
  MapPin
} from 'lucide-react';

interface LogbookStatsProps {
  logEntries: LogEntry[];
}

export default function LogbookStats({ logEntries }: LogbookStatsProps) {
  // Calculate statistics based on log entries
  const stats = useMemo(() => {
    // Count by band
    const bandCounts: Record<string, number> = {};
    const modeCounts: Record<string, number> = {};
    const contactsByMonth: Record<string, number> = {};
    const locationSet = new Set<string>();
    let totalEntries = logEntries.length;
    let favoritesCount = 0;
    let highestFrequency = 0;
    let lowestFrequency = Infinity;
    let qslSentCount = 0;
    let qslReceivedCount = 0;
    
    logEntries.forEach(entry => {
      // Count bands
      if (entry.band) {
        bandCounts[entry.band] = (bandCounts[entry.band] || 0) + 1;
      }
      
      // Count modes
      if (entry.mode) {
        modeCounts[entry.mode] = (modeCounts[entry.mode] || 0) + 1;
      }
      
      // Track locations
      if (entry.location) {
        locationSet.add(entry.location);
      }
      
      // Count by month
      const month = new Date(entry.dateTime).toLocaleString('default', { month: 'short', year: 'numeric' });
      contactsByMonth[month] = (contactsByMonth[month] || 0) + 1;
      
      // Count favorites
      if (entry.favorite) {
        favoritesCount++;
      }
      
      // Track frequency range
      if (entry.frequency > highestFrequency) {
        highestFrequency = entry.frequency;
      }
      if (entry.frequency < lowestFrequency) {
        lowestFrequency = entry.frequency;
      }
      
      // QSL stats
      if (entry.qslSent) {
        qslSentCount++;
      }
      if (entry.qslReceived) {
        qslReceivedCount++;
      }
    });
    
    // Achievements calculation
    const achievements = [
      {
        name: "Early Bird",
        description: "Made a contact before 6 AM",
        earned: logEntries.some(entry => {
          const hour = new Date(entry.dateTime).getHours();
          return hour < 6;
        }),
        icon: <Zap className="h-4 w-4 text-yellow-400" />
      },
      {
        name: "Night Owl",
        description: "Made a contact after 10 PM",
        earned: logEntries.some(entry => {
          const hour = new Date(entry.dateTime).getHours();
          return hour >= 22;
        }),
        icon: <Zap className="h-4 w-4 text-purple-400" />
      },
      {
        name: "Band Hopper",
        description: "Made contacts on at least 3 different bands",
        earned: Object.keys(bandCounts).length >= 3,
        icon: <Layers className="h-4 w-4 text-blue-400" />
      },
      {
        name: "Mode Explorer",
        description: "Used at least 3 different modes",
        earned: Object.keys(modeCounts).length >= 3,
        icon: <GitMerge className="h-4 w-4 text-green-400" />
      },
      {
        name: "Avid Logger",
        description: "Logged at least 10 contacts",
        earned: totalEntries >= 10,
        progress: Math.min(100, (totalEntries / 10) * 100),
        icon: <Radio className="h-4 w-4 text-blue-400" />
      },
      {
        name: "Globe Trotter",
        description: "Contacted stations in at least 5 different locations",
        earned: locationSet.size >= 5,
        progress: Math.min(100, (locationSet.size / 5) * 100),
        icon: <Globe className="h-4 w-4 text-green-400" />
      },
      {
        name: "QSL Collector",
        description: "Received QSL cards from 5 stations",
        earned: qslReceivedCount >= 5,
        progress: Math.min(100, (qslReceivedCount / 5) * 100),
        icon: <Award className="h-4 w-4 text-yellow-400" />
      }
    ];
    
    return {
      totalEntries,
      bandCounts,
      modeCounts,
      contactsByMonth,
      locationCount: locationSet.size,
      favoritesCount,
      frequencyRange: lowestFrequency < Infinity ? `${lowestFrequency.toFixed(3)} - ${highestFrequency.toFixed(3)} MHz` : 'N/A',
      qslSentCount,
      qslReceivedCount,
      achievements
    };
  }, [logEntries]);
  
  // Top bands (up to 4)
  const topBands = useMemo(() => {
    return Object.entries(stats.bandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [stats.bandCounts]);
  
  // Top modes (up to 4)
  const topModes = useMemo(() => {
    return Object.entries(stats.modeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [stats.modeCounts]);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
            <p className="text-sm text-gray-400">Total Contacts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.locationCount}</div>
            <p className="text-sm text-gray-400">Locations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.favoritesCount}</div>
            <p className="text-sm text-gray-400">Favorites</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.qslReceivedCount}</div>
            <p className="text-sm text-gray-400">QSL Cards</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-400" />
              Band Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {topBands.length > 0 ? (
              <div className="space-y-3">
                {topBands.map(([band, count]) => (
                  <div key={band} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{band}</span>
                      <span className="text-muted-foreground">{count} contacts</span>
                    </div>
                    <Progress value={(count / stats.totalEntries) * 100} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center py-4">No band data available</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-green-400" />
              Mode Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {topModes.length > 0 ? (
              <div className="space-y-3">
                {topModes.map(([mode, count]) => (
                  <div key={mode} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{mode}</span>
                      <span className="text-muted-foreground">{count} contacts</span>
                    </div>
                    <Progress value={(count / stats.totalEntries) * 100} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center py-4">No mode data available</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-400" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.achievements.map((achievement) => (
              <div 
                key={achievement.name}
                className={`p-3 rounded-lg border ${achievement.earned ? 'border-yellow-600 bg-yellow-950/30' : 'border-gray-700 bg-gray-800/30'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {achievement.icon}
                    <span className={`font-medium text-sm ${achievement.earned ? 'text-yellow-200' : 'text-gray-400'}`}>
                      {achievement.name}
                    </span>
                  </div>
                  {achievement.earned && (
                    <Badge variant="outline" className="bg-yellow-700/30 border-yellow-600 text-yellow-200">
                      Earned
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">{achievement.description}</p>
                {achievement.progress !== undefined && (
                  <Progress value={achievement.progress} className="mt-2 h-1" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="text-xs text-center text-gray-500 mt-2">
        Statistics generated from {stats.totalEntries} logbook entries
      </div>
    </div>
  );
}
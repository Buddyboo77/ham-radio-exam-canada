import { Globe, Radio, Wifi } from 'lucide-react';
import DXCluster from '@/components/dxcluster/DXCluster';

export default function DXClusterPage() {
  return (
    <div className="p-2">
      {/* Radio display header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              DX Cluster
            </h2>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="h-4 w-4 mr-2 text-blue-400" />
            <h3 className="text-sm font-medium text-blue-300">
              Real-time DX Spots
            </h3>
          </div>
          <div className="flex items-center text-[10px] text-gray-400">
            <Wifi className="h-3 w-3 mr-1 text-green-400 animate-pulse" />
            <span>Live Feed</span>
          </div>
        </div>
        
        <DXCluster />
        
        <div className="mt-4 bg-blue-900/20 rounded-md p-2 border border-blue-900/30">
          <div className="flex items-center text-xs text-blue-300 mb-1">
            <Radio className="h-3 w-3 mr-1 text-blue-400" />
            <span className="font-medium">About DX Cluster</span>
          </div>
          <p className="text-[10px] text-gray-400">
            The DX Cluster shows real-time spots of DX stations reported by other ham radio operators worldwide.
            This information helps you find active stations and rare DX entities. In a complete implementation,
            data would be sourced from live DX cluster network connections. You can filter spots by continent,
            band, mode or search for specific callsigns or countries.
          </p>
        </div>
      </div>
    </div>
  );
}
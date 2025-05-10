import { Link } from 'wouter';
import { Map, Compass, RadioTower, Globe, Wifi } from 'lucide-react';

export function QuickAccessMenu() {
  return (
    <div className="z-50 w-full bg-gray-900 border-b border-gray-700 shadow-md">
      <div className="max-w-screen-lg mx-auto p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <RadioTower className="h-5 w-5 text-blue-300 mr-2" />
            <h1 className="text-sm font-semibold text-white">Powell River Radio Club</h1>
          </div>
          
          <div className="flex gap-2">
            <Link href="/enhanced-map">
              <button 
                className="h-8 rounded-md bg-blue-800/90 hover:bg-blue-700 flex items-center justify-center border border-blue-600 shadow-sm px-3 py-1"
                title="Enhanced Map"
              >
                <Map size={12} className="text-blue-100 mr-1.5" />
                <span className="text-xs text-blue-100">Map</span>
              </button>
            </Link>
            
            <Link href="/ar-view">
              <button 
                className="h-8 rounded-md bg-green-800/90 hover:bg-green-700 flex items-center justify-center border border-green-600 shadow-sm px-3 py-1"
                title="AR View"
              >
                <Compass size={12} className="text-green-100 mr-1.5" />
                <span className="text-xs text-green-100">AR</span>
              </button>
            </Link>
            
            <Link href="/dxcluster">
              <button 
                className="h-8 rounded-md bg-orange-800/90 hover:bg-orange-700 flex items-center justify-center border border-orange-600 shadow-sm px-3 py-1"
                title="DX Cluster"
              >
                <Globe size={12} className="text-orange-100 mr-1.5" />
                <span className="text-xs text-orange-100">DX</span>
              </button>
            </Link>
            
            <Link href="/repeaters">
              <button 
                className="h-8 rounded-md bg-purple-800/90 hover:bg-purple-700 flex items-center justify-center border border-purple-600 shadow-sm px-3 py-1"
                title="Repeaters"
              >
                <Wifi size={12} className="text-purple-100 mr-1.5" />
                <span className="text-xs text-purple-100">Repeaters</span>
              </button>
            </Link>
            
            <Link href="/local-info">
              <button 
                className="h-8 rounded-md bg-red-800/90 hover:bg-red-700 flex items-center justify-center border border-red-600 shadow-sm px-3 py-1"
                title="Local Info"
              >
                <RadioTower size={12} className="text-red-100 mr-1.5" />
                <span className="text-xs text-red-100">Info</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Link } from 'wouter';
import { Map, Compass, RadioTower, Globe, Wifi } from 'lucide-react';

export function QuickAccessMenu() {
  return (
    <div className="fixed top-2 right-2 z-50 flex flex-col gap-1">
      <div className="bg-gray-900/80 backdrop-blur-sm p-1.5 rounded-md border border-gray-700 shadow-lg">
        <div className="text-xs text-gray-300 mb-1 text-center">Quick Access</div>
        <div className="flex flex-col gap-1">
          <Link href="/enhanced-map" className="block">
            <button 
              className="w-full h-8 rounded-md bg-blue-800/90 hover:bg-blue-700 flex items-center justify-between border border-blue-600 shadow-sm px-2 py-1"
              title="Enhanced Map"
            >
              <span className="text-xs text-blue-100 mr-1.5">Map</span>
              <Map size={12} className="text-blue-100" />
            </button>
          </Link>
          
          <Link href="/ar-view" className="block">
            <button 
              className="w-full h-8 rounded-md bg-green-800/90 hover:bg-green-700 flex items-center justify-between border border-green-600 shadow-sm px-2 py-1"
              title="AR View"
            >
              <span className="text-xs text-green-100 mr-1.5">AR</span>
              <Compass size={12} className="text-green-100" />
            </button>
          </Link>
          
          <Link href="/dxcluster" className="block">
            <button 
              className="w-full h-8 rounded-md bg-orange-800/90 hover:bg-orange-700 flex items-center justify-between border border-orange-600 shadow-sm px-2 py-1"
              title="DX Cluster"
            >
              <span className="text-xs text-orange-100 mr-1.5">DX</span>
              <Globe size={12} className="text-orange-100" />
            </button>
          </Link>
          
          <Link href="/repeaters" className="block">
            <button 
              className="w-full h-8 rounded-md bg-purple-800/90 hover:bg-purple-700 flex items-center justify-between border border-purple-600 shadow-sm px-2 py-1"
              title="Repeaters"
            >
              <span className="text-xs text-purple-100 mr-1.5">Rep</span>
              <Wifi size={12} className="text-purple-100" />
            </button>
          </Link>
          
          <Link href="/local-info" className="block">
            <button 
              className="w-full h-8 rounded-md bg-red-800/90 hover:bg-red-700 flex items-center justify-between border border-red-600 shadow-sm px-2 py-1"
              title="Local Info"
            >
              <span className="text-xs text-red-100 mr-1.5">Info</span>
              <RadioTower size={12} className="text-red-100" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
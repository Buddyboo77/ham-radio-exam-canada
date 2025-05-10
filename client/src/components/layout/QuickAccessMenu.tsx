import { Link } from 'wouter';
import { Map, Compass, RadioTower, Globe, Wifi } from 'lucide-react';

export function QuickAccessMenu() {
  return (
    <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 flex flex-row gap-2 bg-gray-900/80 backdrop-blur-sm p-1.5 rounded-full border border-gray-700 shadow-lg">
      <Link href="/enhanced-map">
        <button 
          className="w-8 h-8 rounded-full bg-blue-800/90 hover:bg-blue-700 flex items-center justify-center border border-blue-600 shadow-sm hover:shadow-glow-blue transition-all duration-200"
          title="Enhanced Map"
        >
          <Map size={14} className="text-blue-100" />
        </button>
      </Link>
      
      <Link href="/ar-view">
        <button 
          className="w-8 h-8 rounded-full bg-green-800/90 hover:bg-green-700 flex items-center justify-center border border-green-600 shadow-sm hover:shadow-glow-green transition-all duration-200"
          title="AR View"
        >
          <Compass size={14} className="text-green-100" />
        </button>
      </Link>
      
      <Link href="/dxcluster">
        <button 
          className="w-8 h-8 rounded-full bg-orange-800/90 hover:bg-orange-700 flex items-center justify-center border border-orange-600 shadow-sm hover:shadow-glow-orange transition-all duration-200"
          title="DX Cluster"
        >
          <Globe size={14} className="text-orange-100" />
        </button>
      </Link>
      
      <Link href="/repeaters">
        <button 
          className="w-8 h-8 rounded-full bg-purple-800/90 hover:bg-purple-700 flex items-center justify-center border border-purple-600 shadow-sm hover:shadow-glow-purple transition-all duration-200"
          title="Repeaters"
        >
          <Wifi size={14} className="text-purple-100" />
        </button>
      </Link>
      
      <Link href="/local-info">
        <button 
          className="w-8 h-8 rounded-full bg-red-800/90 hover:bg-red-700 flex items-center justify-center border border-red-600 shadow-sm hover:shadow-glow-red transition-all duration-200"
          title="Local Info"
        >
          <RadioTower size={14} className="text-red-100" />
        </button>
      </Link>
    </div>
  );
}
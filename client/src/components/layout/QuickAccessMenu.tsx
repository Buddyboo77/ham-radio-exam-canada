import { Link } from 'wouter';
import { Map, Compass, RadioTower, Globe, Wifi } from 'lucide-react';

export function QuickAccessMenu() {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-gray-900/80 backdrop-blur-sm p-2 rounded-full border border-gray-700 shadow-lg">
      <Link href="/enhanced-map">
        <button className="w-12 h-12 rounded-full bg-blue-800 hover:bg-blue-700 flex items-center justify-center border border-blue-600 shadow-glow-blue transition-all duration-200 hover:scale-110">
          <Map size={20} className="text-blue-100" />
        </button>
      </Link>
      
      <Link href="/ar-view">
        <button className="w-12 h-12 rounded-full bg-green-800 hover:bg-green-700 flex items-center justify-center border border-green-600 shadow-glow-green transition-all duration-200 hover:scale-110">
          <Compass size={20} className="text-green-100" />
        </button>
      </Link>
      
      <Link href="/dxcluster">
        <button className="w-12 h-12 rounded-full bg-orange-800 hover:bg-orange-700 flex items-center justify-center border border-orange-600 transition-all duration-200 hover:scale-110">
          <Globe size={20} className="text-orange-100" />
        </button>
      </Link>
      
      <Link href="/repeaters">
        <button className="w-12 h-12 rounded-full bg-purple-800 hover:bg-purple-700 flex items-center justify-center border border-purple-600 transition-all duration-200 hover:scale-110">
          <Wifi size={20} className="text-purple-100" />
        </button>
      </Link>
      
      <Link href="/local-info">
        <button className="w-12 h-12 rounded-full bg-red-800 hover:bg-red-700 flex items-center justify-center border border-red-600 transition-all duration-200 hover:scale-110">
          <RadioTower size={20} className="text-red-100" />
        </button>
      </Link>
    </div>
  );
}
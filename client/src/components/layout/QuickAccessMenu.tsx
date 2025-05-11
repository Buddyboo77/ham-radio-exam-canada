import { Link, useLocation } from 'wouter';
import { Map, RadioTower, Globe, Wifi, Home, BookOpen, BarChart, Users } from 'lucide-react';

export function QuickAccessMenu() {
  const [currentLocation] = useLocation();

  const isActive = (path: string) => currentLocation === path;

  return (
    <div className="z-50 w-full bg-gray-900 border-b border-gray-700 shadow-md">
      <div className="max-w-screen-lg mx-auto px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <RadioTower className="h-5 w-5 text-blue-300 mr-2" />
            <h1 className="text-sm font-semibold text-white">Powell River Radio Club</h1>
          </div>
          
          <div className="flex gap-1">
            <Link href="/frequencies">
              <button 
                className={`h-7 rounded-md ${isActive('/frequencies') ? 'bg-green-700' : 'bg-gray-800/70'} hover:bg-green-700 flex items-center justify-center border ${isActive('/frequencies') ? 'border-green-500' : 'border-gray-700'} shadow-sm px-2 py-1`}
                title="Home"
              >
                <Home size={12} className="text-gray-100" />
              </button>
            </Link>
            
            <Link href="/learning">
              <button 
                className={`h-7 rounded-md ${isActive('/learning') ? 'bg-blue-700' : 'bg-gray-800/70'} hover:bg-blue-700 flex items-center justify-center border ${isActive('/learning') ? 'border-blue-500' : 'border-gray-700'} shadow-sm px-2 py-1`}
                title="Learning Center"
              >
                <BookOpen size={12} className="text-gray-100" />
              </button>
            </Link>
            
            <Link href="/enhanced-map">
              <button 
                className={`h-7 rounded-md ${isActive('/enhanced-map') ? 'bg-blue-700' : 'bg-gray-800/70'} hover:bg-blue-700 flex items-center justify-center border ${isActive('/enhanced-map') ? 'border-blue-500' : 'border-gray-700'} shadow-sm px-2 py-1`}
                title="Map"
              >
                <Map size={12} className="text-gray-100" />
              </button>
            </Link>
            
            <Link href="/dxcluster">
              <button 
                className={`h-7 rounded-md ${isActive('/dxcluster') ? 'bg-orange-700' : 'bg-gray-800/70'} hover:bg-orange-700 flex items-center justify-center border ${isActive('/dxcluster') ? 'border-orange-500' : 'border-gray-700'} shadow-sm px-2 py-1`}
                title="DX Cluster"
              >
                <Globe size={12} className="text-gray-100" />
              </button>
            </Link>
            
            <Link href="/repeaters">
              <button 
                className={`h-7 rounded-md ${isActive('/repeaters') ? 'bg-purple-700' : 'bg-gray-800/70'} hover:bg-purple-700 flex items-center justify-center border ${isActive('/repeaters') ? 'border-purple-500' : 'border-gray-700'} shadow-sm px-2 py-1`}
                title="Repeaters"
              >
                <Wifi size={12} className="text-gray-100" />
              </button>
            </Link>
            
            <Link href="/propagation">
              <button 
                className={`h-7 rounded-md ${isActive('/propagation') ? 'bg-cyan-700' : 'bg-gray-800/70'} hover:bg-cyan-700 flex items-center justify-center border ${isActive('/propagation') ? 'border-cyan-500' : 'border-gray-700'} shadow-sm px-2 py-1`}
                title="Propagation"
              >
                <BarChart size={12} className="text-gray-100" />
              </button>
            </Link>
            
            <Link href="/local-info">
              <button 
                className={`h-7 rounded-md ${isActive('/local-info') ? 'bg-teal-700' : 'bg-gray-800/70'} hover:bg-teal-700 flex items-center justify-center border ${isActive('/local-info') ? 'border-teal-500' : 'border-gray-700'} shadow-sm px-2 py-1`}
                title="Local Info"
              >
                <Users size={12} className="text-gray-100" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
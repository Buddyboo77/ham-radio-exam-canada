import { Sun, Globe, Radio } from 'lucide-react';
import PropagationForecast from '@/components/propagation/PropagationForecast';

export default function PropagationPage() {
  return (
    <div className="p-2">
      {/* Radio display header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              Propagation Tools
            </h2>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Sun className="h-4 w-4 mr-2 text-yellow-400" />
            <h3 className="text-sm font-medium text-blue-300">
              HF Propagation Forecast
            </h3>
          </div>
          <div className="flex items-center text-[10px] text-gray-400">
            <Globe className="h-3 w-3 mr-1" />
            <span>Band Conditions</span>
          </div>
        </div>
        
        <PropagationForecast />
        
        <div className="mt-4 bg-blue-900/20 rounded-md p-2 border border-blue-900/30">
          <div className="flex items-center text-xs text-blue-300 mb-1">
            <Radio className="h-3 w-3 mr-1 text-blue-400" />
            <span className="font-medium">About Propagation Tools</span>
          </div>
          <p className="text-[10px] text-gray-400">
            The propagation tools provide current and forecasted radio propagation conditions based on 
            solar activity data. This information helps you determine which bands are likely to provide 
            the best communication opportunities for different types of contacts. In a full implementation,
            data would be sourced from NOAA's Space Weather Prediction Center and other reliable sources.
          </p>
        </div>
      </div>
    </div>
  );
}
import { useEffect } from 'react';
import { Circle, Tooltip, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { hasLineOfSight, calculateFresnelZone } from '@/lib/utils';

interface Repeater {
  id: number;
  callsign: string;
  frequency: number;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive' | 'limited';
  coverageRadius: number;
  elevation?: number;
}

interface RepeaterCoverageProps {
  repeater: Repeater;
  coverageStyle: 'simple' | 'gradient' | 'terrain';
  userPosition: [number, number] | null;
  selected: boolean;
}

export function RepeaterCoverage({ 
  repeater, 
  coverageStyle,
  userPosition,
  selected
}: RepeaterCoverageProps) {
  const map = useMap();
  
  // Radius colors based on repeater status
  const getStatusColor = (status: string, opacity: number = 0.15) => {
    switch (status) {
      case 'active': return `rgba(0, 255, 0, ${opacity})`;
      case 'inactive': return `rgba(255, 0, 0, ${opacity})`;
      case 'limited': return `rgba(255, 165, 0, ${opacity})`;
      default: return `rgba(0, 0, 255, ${opacity})`;
    }
  };
  
  // Options for the coverage circle
  const circleOptions = {
    color: getStatusColor(repeater.status, 0.8),
    fillColor: getStatusColor(repeater.status),
    fillOpacity: selected ? 0.4 : 0.15,
    weight: selected ? 2 : 1,
  };
  
  // Options for gradient coverage when selected
  const gradientCircleOptions: L.CircleMarkerOptions[] = [
    { ...circleOptions, fillOpacity: 0.4, radius: repeater.coverageRadius },
    { ...circleOptions, fillOpacity: 0.3, radius: repeater.coverageRadius * 0.8 },
    { ...circleOptions, fillOpacity: 0.2, radius: repeater.coverageRadius * 0.6 },
    { ...circleOptions, fillOpacity: 0.1, radius: repeater.coverageRadius * 0.4 }
  ];
  
  // Create a line-of-sight line if we have user position and repeater
  const lineOfSightOptions = {
    userHasLOS: false,
    distance: 0,
    color: 'red',
    opacity: 0.7,
    dashArray: '5, 10'
  };
  
  if (userPosition && repeater.elevation) {
    // Assume user is at 2 meters height (standing person)
    const userHeight = 2; 
    // Distance in kilometers
    const distance = L.latLng(userPosition[0], userPosition[1])
      .distanceTo(L.latLng(repeater.latitude, repeater.longitude)) / 1000;
    
    lineOfSightOptions.distance = distance;
    lineOfSightOptions.userHasLOS = hasLineOfSight(userHeight, repeater.elevation, distance);
    lineOfSightOptions.color = lineOfSightOptions.userHasLOS ? 'green' : 'red';
  }
  
  // Focus the map on this repeater when selected
  useEffect(() => {
    if (selected) {
      map.setView([repeater.latitude, repeater.longitude], 10);
    }
  }, [selected, map, repeater]);
  
  // Render based on coverage style
  if (coverageStyle === 'simple' || !selected) {
    return (
      <Circle 
        center={[repeater.latitude, repeater.longitude]} 
        radius={repeater.coverageRadius}
        pathOptions={circleOptions}
      >
        <Tooltip direction="top" permanent={selected}>
          <div className="text-xs">
            <strong>{repeater.callsign}</strong> - {repeater.frequency.toFixed(3)} MHz
            <div>Coverage: {(repeater.coverageRadius / 1000).toFixed(1)} km</div>
            {repeater.elevation && <div>Elevation: {repeater.elevation}m</div>}
          </div>
        </Tooltip>
      </Circle>
    );
  }
  
  if (coverageStyle === 'gradient') {
    return (
      <>
        {gradientCircleOptions.map((options, index) => (
          <Circle 
            key={`${repeater.id}-gradient-${index}`}
            center={[repeater.latitude, repeater.longitude]} 
            radius={options.radius}
            pathOptions={options}
          />
        ))}
        
        <Tooltip 
          direction="top" 
          permanent={selected}
          position={[repeater.latitude, repeater.longitude]}
        >
          <div className="text-xs">
            <strong>{repeater.callsign}</strong> - {repeater.frequency.toFixed(3)} MHz
            <div>Coverage: {(repeater.coverageRadius / 1000).toFixed(1)} km</div>
            {repeater.elevation && <div>Elevation: {repeater.elevation}m</div>}
          </div>
        </Tooltip>
        
        {userPosition && (
          <>
            <Polyline 
              positions={[
                [repeater.latitude, repeater.longitude],
                [userPosition[0], userPosition[1]]
              ]}
              pathOptions={{
                color: lineOfSightOptions.color,
                weight: 2,
                opacity: lineOfSightOptions.opacity,
                dashArray: lineOfSightOptions.dashArray
              }}
            />
            <Tooltip 
              direction="top" 
              permanent={true}
              position={[
                (repeater.latitude + userPosition[0]) / 2,
                (repeater.longitude + userPosition[1]) / 2
              ]}
            >
              <div className="text-xs">
                <div>{lineOfSightOptions.distance.toFixed(1)} km</div>
                <div>{lineOfSightOptions.userHasLOS ? 'Line of sight' : 'No line of sight'}</div>
              </div>
            </Tooltip>
          </>
        )}
      </>
    );
  }
  
  // Terrain-based coverage would normally use a GeoJSON layer or heatmap
  // showing signal strength based on terrain, but for this example we'll use a similar approach
  return (
    <>
      <Circle 
        center={[repeater.latitude, repeater.longitude]} 
        radius={repeater.coverageRadius}
        pathOptions={{
          ...circleOptions,
          fillOpacity: 0.1,
          fillColor: getStatusColor(repeater.status, 0.3)
        }}
      />
      
      <Tooltip 
        direction="top" 
        permanent={selected}
        position={[repeater.latitude, repeater.longitude]}
      >
        <div className="text-xs">
          <strong>{repeater.callsign}</strong> - {repeater.frequency.toFixed(3)} MHz
          <div>Coverage: {(repeater.coverageRadius / 1000).toFixed(1)} km</div>
          {repeater.elevation && <div>Elevation: {repeater.elevation}m</div>}
          <div className="text-gray-500 italic mt-1">Terrain analysis would show detailed coverage</div>
        </div>
      </Tooltip>
      
      {userPosition && (
        <>
          <Polyline 
            positions={[
              [repeater.latitude, repeater.longitude],
              [userPosition[0], userPosition[1]]
            ]}
            pathOptions={{
              color: lineOfSightOptions.color,
              weight: 2,
              opacity: lineOfSightOptions.opacity,
              dashArray: lineOfSightOptions.dashArray
            }}
          />
          <Tooltip 
            direction="top" 
            permanent={true}
            position={[
              (repeater.latitude + userPosition[0]) / 2,
              (repeater.longitude + userPosition[1]) / 2
            ]}
          >
            <div className="text-xs">
              <div>{lineOfSightOptions.distance.toFixed(1)} km</div>
              <div>{lineOfSightOptions.userHasLOS ? 'Line of sight' : 'No line of sight'}</div>
            </div>
          </Tooltip>
        </>
      )}
    </>
  );
}
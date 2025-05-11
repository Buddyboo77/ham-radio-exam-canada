import { Circle, LayerGroup, Polygon, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { hasLineOfSight, calculateFresnelZone } from '@/lib/utils';

interface Repeater {
  id: number;
  callsign: string;
  frequency: number;
  offset: number;
  tone: number;
  latitude: number;
  longitude: number;
  name?: string;
  city?: string;
  status: 'active' | 'inactive' | 'limited';
  coverageRadius: number;
  elevation?: number;
  features?: string[];
  power?: number;
}

interface RepeaterCoverageProps {
  repeaters: Repeater[];
  coverageStyle: 'simple' | 'gradient' | 'terrain';
  selectedRepeater?: number | null;
}

export function RepeaterCoverage({ 
  repeaters, 
  coverageStyle,
  selectedRepeater 
}: RepeaterCoverageProps) {
  const map = useMap();
  
  // Filter for active repeaters only
  const activeRepeaters = repeaters?.filter(r => r.status === 'active') || [];
  
  // Calculate coverage opacity based on elevation and power
  const calculateOpacity = (repeater: Repeater) => {
    // Base opacity is 0.3
    let opacity = 0.3;
    
    // Adjust based on repeater elevation (if available)
    if (repeater.elevation) {
      // Higher elevation = better coverage = more opacity
      opacity += Math.min(repeater.elevation / 1000, 0.3); // Max +0.3 for elevation
    }
    
    // Adjust based on repeater power (if available)
    if (repeater.power) {
      // Higher power = better coverage = more opacity
      opacity += Math.min(repeater.power / 100, 0.2); // Max +0.2 for power
    }
    
    // Cap at 0.8 for visibility
    return Math.min(opacity, 0.8);
  };
  
  // Generate a circular coverage area
  const renderSimpleCoverage = (repeater: Repeater) => {
    const isSelected = selectedRepeater === repeater.id;
    const radius = repeater.coverageRadius * 1000; // Convert km to meters
    const fillColor = isSelected ? '#3b82f6' : '#2563eb';
    const fillOpacity = isSelected ? 0.45 : 0.25;
    const weight = isSelected ? 2 : 1;
    
    return (
      <Circle
        key={`coverage-${repeater.id}`}
        center={[repeater.latitude, repeater.longitude]}
        radius={radius}
        pathOptions={{
          fillColor,
          fillOpacity,
          color: isSelected ? '#60a5fa' : '#3b82f6',
          weight
        }}
      />
    );
  };
  
  // Generate a gradient coverage area
  const renderGradientCoverage = (repeater: Repeater) => {
    const isSelected = selectedRepeater === repeater.id;
    const baseRadius = repeater.coverageRadius * 1000; // Convert km to meters
    const opacity = calculateOpacity(repeater);
    
    // Create 3 concentric circles with decreasing opacity
    return (
      <>
        <Circle
          key={`coverage-inner-${repeater.id}`}
          center={[repeater.latitude, repeater.longitude]}
          radius={baseRadius * 0.33}
          pathOptions={{
            fillColor: isSelected ? '#3b82f6' : '#2563eb',
            fillOpacity: isSelected ? opacity * 1.2 : opacity,
            color: 'transparent',
            weight: 0
          }}
        />
        <Circle
          key={`coverage-middle-${repeater.id}`}
          center={[repeater.latitude, repeater.longitude]}
          radius={baseRadius * 0.66}
          pathOptions={{
            fillColor: isSelected ? '#3b82f6' : '#2563eb',
            fillOpacity: isSelected ? opacity * 0.8 : opacity * 0.6,
            color: 'transparent',
            weight: 0
          }}
        />
        <Circle
          key={`coverage-outer-${repeater.id}`}
          center={[repeater.latitude, repeater.longitude]}
          radius={baseRadius}
          pathOptions={{
            fillColor: isSelected ? '#3b82f6' : '#2563eb',
            fillOpacity: isSelected ? opacity * 0.5 : opacity * 0.3,
            color: isSelected ? '#60a5fa' : '#3b82f6',
            weight: isSelected ? 2 : 1
          }}
        />
      </>
    );
  };
  
  // Generate terrain-aware coverage visualization
  const renderTerrainCoverage = (repeater: Repeater) => {
    // In a real implementation, this would use terrain data
    // For now, we'll simulate it with an irregular polygon
    
    const isSelected = selectedRepeater === repeater.id;
    const center: [number, number] = [repeater.latitude, repeater.longitude];
    const opacity = calculateOpacity(repeater);
    const baseRadius = repeater.coverageRadius * 1000; // Convert km to meters
    
    // Generate irregular polygon points simulating terrain effects
    // In a real implementation, these would be calculated based on terrain data
    const generateIrregularPolygon = () => {
      const points: LatLngExpression[] = [];
      const numPoints = 24; // Number of points around the circle
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints;
        
        // Randomize radius to simulate terrain effects
        // In a real implementation, this would use actual terrain data
        let radiusFactor = 0.6 + Math.random() * 0.4;
        
        // Simulate directional coverage (e.g., if repeater is on a mountain side)
        // For demo purposes, we'll favor north-east direction
        if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) {
          radiusFactor *= 1.3; // Better coverage to the north-east
        }
        
        const distance = baseRadius * radiusFactor;
        const lat = center[0] + (Math.sin(angle) * distance) / 111000; // 111km per degree of latitude
        const lng = center[1] + (Math.cos(angle) * distance) / (111000 * Math.cos(center[0] * (Math.PI / 180)));
        
        points.push([lat, lng]);
      }
      
      return points;
    };
    
    const polygonPoints = generateIrregularPolygon();
    
    return (
      <Polygon
        key={`terrain-coverage-${repeater.id}`}
        positions={polygonPoints}
        pathOptions={{
          fillColor: isSelected ? '#3b82f6' : '#2563eb',
          fillOpacity: isSelected ? opacity * 1.2 : opacity,
          color: isSelected ? '#60a5fa' : '#3b82f6',
          weight: isSelected ? 2 : 1
        }}
      />
    );
  };
  
  // Render the appropriate coverage visualization based on style
  const renderCoverage = (repeater: Repeater) => {
    switch (coverageStyle) {
      case 'gradient':
        return renderGradientCoverage(repeater);
      case 'terrain':
        return renderTerrainCoverage(repeater);
      case 'simple':
      default:
        return renderSimpleCoverage(repeater);
    }
  };
  
  return (
    <LayerGroup>
      {activeRepeaters.map(repeater => renderCoverage(repeater))}
    </LayerGroup>
  );
}
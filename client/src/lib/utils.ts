import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert decimal degrees to degrees, minutes, seconds format
export function convertToDMS(coord: number, isLongitude: boolean): string {
  const absolute = Math.abs(coord);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  
  const direction = isLongitude 
    ? (coord >= 0 ? "E" : "W") 
    : (coord >= 0 ? "N" : "S");
  
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

// Convert lat/long to Maidenhead grid square
export function convertToGridSquare(lat: number, lon: number): string {
  if (isNaN(lat) || isNaN(lon)) {
    return '';
  }
  
  // Ensure longitude is in the range -180 to 180
  lon = (lon + 180) % 360 - 180;
  
  // Adjust longitude to be in the range 0 to 360
  const adjustedLon = lon + 180;
  // Adjust latitude to be in the range 0 to 180 (from -90 to 90)
  const adjustedLat = lat + 90;
  
  // Calculate field (first pair of letters)
  const lonField = String.fromCharCode(65 + Math.floor(adjustedLon / 20));
  const latField = String.fromCharCode(65 + Math.floor(adjustedLat / 10));
  
  // Calculate square (pair of digits)
  const lonSquare = Math.floor((adjustedLon % 20) / 2);
  const latSquare = Math.floor((adjustedLat % 10) / 1);
  
  // Calculate subsquare (second pair of letters)
  const lonSubsquare = String.fromCharCode(97 + Math.floor((adjustedLon % 2) * 12));
  const latSubsquare = String.fromCharCode(97 + Math.floor((adjustedLat % 1) * 24));
  
  // Return the grid square (e.g., "EN82pj")
  return lonField + latField + lonSquare + latSquare + lonSubsquare + latSubsquare;
}

// Calculate distance between two coordinates in kilometers using the Haversine formula
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate a fresnel zone clearance
export function calculateFresnelZone(
  distance: number, 
  frequency: number
): number {
  // First Fresnel zone radius at the midpoint
  // frequency in MHz, distance in km, result in meters
  return 17.3 * Math.sqrt(distance / (4 * frequency));
}

// Simple line-of-sight calculator based on earth curvature
// Heights in meters, distance in kilometers
export function hasLineOfSight(
  height1: number, 
  height2: number, 
  distance: number
): boolean {
  // Earth curvature approximation
  const earthCurvature = (distance * distance) / 12.74;
  // Allow 60% of first Fresnel zone
  const minClearance = Math.min(height1, height2) - earthCurvature;
  return minClearance > 0;
}

// Format frequency with proper spacing and units
export function formatFrequency(frequency: number): string {
  if (frequency < 1) {
    return `${(frequency * 1000).toFixed(1)} kHz`;
  } else if (frequency < 1000) {
    return `${frequency.toFixed(3)} MHz`;
  } else {
    return `${(frequency / 1000).toFixed(3)} GHz`;
  }
}

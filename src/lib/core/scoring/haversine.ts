export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export type Coordinates = GeoPoint;

export const EARTH_RADIUS_MILES = 3958.8;

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Computes great-circle distance between two geographic coordinates using the Haversine formula
 */
export function calculateHaversineDistance(pointA: GeoPoint, pointB: GeoPoint): number {
  const dLat = toRadians(pointB.latitude - pointA.latitude);
  const dLon = toRadians(pointB.longitude - pointA.longitude);

  const lat1 = toRadians(pointA.latitude);
  const lat2 = toRadians(pointB.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_MILES * c * 10) / 10;
}

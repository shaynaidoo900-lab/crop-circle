/**
 * Satellite Imagery Service — Microsoft Planetary Computer
 * Free Sentinel-2 L2A imagery, no API key required.
 * Uses STAC API to search and get tile URLs.
 * Docs: https://planetarycomputer.microsoft.com/docs/
 */

export interface SatelliteTile {
  id: string;
  date: string;
  cloudCover: number;
  thumbnailUrl: string;
  bounds: [number, number, number, number]; // [west, south, east, north]
}

export interface NDVIResult {
  min: number;
  max: number;
  avg: number;
  timestamp: string;
}

// Microsoft Planetary Computer STAC API
const STAC_API = 'https://planetarycomputer.microsoft.com/api/stac/v1';

// Convert lat/lng bounding box to query
function coordsToBbox(lng: number, lat: number, bufferDegrees = 0.01): [number, number, number, number] {
  return [
    lng - bufferDegrees,
    lat - bufferDegrees,
    lng + bufferDegrees,
    lat + bufferDegrees,
  ];
}

export async function searchSatelliteImages(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string,
  maxCloudCover = 30
): Promise<SatelliteTile[]> {
  const bbox = coordsToBbox(lng, lat);

  const params = new URLSearchParams({
    datetime: `${startDate}/${endDate}`,
    bbox: bbox.join(','),
    collection: 'sentinel-2-l2a',
    limit: '20',
    query: JSON.stringify({
      's2:cloud_cover': { lte: maxCloudCover },
    }),
  });

  const response = await fetch(`${STAC_API}/search?${params}`, {
    headers: {
      'pc-api-key': '', // Optional for basic requests
    },
  });

  if (!response.ok) {
    throw new Error(`STAC API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.features || []).map((feat: {
    id: string;
    properties: { datetime: string; 's2:cloud_cover': number };
    assets: { thumbnail: { href: string }; 'visual-nir': { href: string } };
    bbox: number[];
  }) => ({
    id: feat.id,
    date: feat.properties.datetime,
    cloudCover: feat.properties['s2:cloud_cover'] ?? 0,
    thumbnailUrl: feat.assets?.thumbnail?.href ?? '',
    bounds: feat.bbox as [number, number, number, number],
  }));
}

// Get a Mapbox-compatible tile URL for Sentinel-2
export function getSentinel2TileUrl(itemId: string, collection = 'sentinel-2-l2a'): string {
  // Using Microsoft Planetary Computer's STAC API for tile signing
  return `${STAC_API}/collections/${collection}/items/${itemId}/assets/visual`;
}

// Calculate NDVI from NIR and Red band values
export function calculateNDVI(nir: number, red: number): number {
  return (nir - red) / (nir + red);
}

// Get recent field image with lowest cloud cover
export async function getBestFieldImage(
  lat: number,
  lng: number,
  daysBack = 30,
  maxCloudCover = 20
): Promise<SatelliteTile | null> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const tiles = await searchSatelliteImages(
    lat,
    lng,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0],
    maxCloudCover
  );

  if (tiles.length === 0) return null;

  // Sort by cloud cover, lowest first
  tiles.sort((a, b) => a.cloudCover - b.cloudCover);
  return tiles[0];
}

// Estimate field health from NDVI
export function getNDVIHealthCategory(ndvi: number): 'healthy' | 'moderate' | 'stressed' | 'critical' {
  if (ndvi >= 0.6) return 'healthy';
  if (ndvi >= 0.3) return 'moderate';
  if (ndvi >= 0.1) return 'stressed';
  return 'critical';
}

// Calculate approximate field health score (0-100) from NDVI
export function ndviToHealthScore(ndvi: number): number {
  // NDVI ranges from -1 to 1, remap to 0-100
  const normalized = (ndvi + 1) / 2; // 0 to 1
  return Math.round(normalized * 100);
}
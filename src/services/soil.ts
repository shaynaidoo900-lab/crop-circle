/**
 * Soil Data Service
 * Sources: ISRIC World Soil (free), USDA SSURGO (US-specific)
 * Docs: https://soilgrids.org/, https://sda.usda.gov/
 */

export interface SoilData {
  ph: number;
  moisture: number;       // volumetric water content %
  nitrogen: number;       // mg/kg
  phosphorus: number;     // mg/kg
  potassium: number;      // mg/kg
  organic_matter: number; // %
  soilClass: string;
  depth: number;          // cm
}

// ISRIC World SoilGrids API — free, no key required
const SOILGRIDS_API = 'https://rest.isric.org/soilgrids/2.0';

export async function getSoilData(lat: number, lng: number): Promise<SoilData> {
  try {
    // Query multiple soil properties at 250m resolution
    const response = await fetch(
      `${SOILGRIDS_API}/properties/statistics?lon=${lng}&lat=${lat}&depths=0-5cm,5-15cm,15-30cm&properties=ph_h2o,soc,bdod,noc,cec,pv,clay,sand,silt`
    );

    if (!response.ok) {
      throw new Error(`SoilGrids API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract 0-5cm values
    const stats = data.properties?.statistics?.properties || {};

    // Get mean values from response
    const ph = extractStat(stats, 'ph_h2o') ?? 6.5;
    const soc = extractStat(stats, 'soc') ?? 2.0; // soil organic carbon %
    const nitrogen = (soc * 1.72); // approximate N from organic carbon
    const phosphorus = 25; // placeholder — requires more complex model
    const potassium = 150; // placeholder
    const organic_matter = soc * 1.724; // convert carbon to organic matter
    const moisture = 40; // approximate field capacity
    const soilClass = 'Luvisol'; // would need USDA taxonomy lookup

    return {
      ph: Math.round(ph * 10) / 10,
      moisture: Math.round(moisture),
      nitrogen: Math.round(nitrogen * 10) / 10,
      phosphorus: Math.round(phosphorus),
      potassium: Math.round(potassium),
      organic_matter: Math.round(organic_matter * 100) / 100,
      soilClass,
      depth: 30,
    };
  } catch (error) {
    // Return reasonable defaults on failure
    return {
      ph: 6.5,
      moisture: 40,
      nitrogen: 2.5,
      phosphorus: 25,
      potassium: 150,
      organic_matter: 3.2,
      soilClass: 'Unknown',
      depth: 30,
    };
  }
}

function extractStat(stats: Record<string, { layers?: Array<{ mean?: number }> }>, prop: string): number | null {
  try {
    const propStats = stats[prop];
    if (!propStats) return null;
    const layers = propStats.layers || propStats;
    return (layers as Array<{ mean?: number }>)[0]?.mean ?? null;
  } catch {
    return null;
  }
}

// USDA soil texture class calculator from sand/silt/clay fractions
export function getSoilTextureClass(
  sand: number,
  silt: number,
  clay: number
): string {
  if (clay >= 40) return 'Clay';
  if (silt >= 40 && clay >= 20) return 'Silty Clay';
  if (sand >= 40 && clay >= 20) return 'Sandy Clay';
  if (silt >= 40 && silt + clay > 80) return 'Silt';
  if (sand >= 50 && sand + clay > 70) return 'Sandy Loam';
  if (silt >= 50 && sand < 50) return 'Silt Loam';
  if (clay >= 10 && clay <= 20 && sand <= 52) return 'Loam';
  return 'Loam';
}

// Soil pH suitability for common crops
export function getCropSuitability(ph: number): Record<string, 'optimal' | 'acceptable' | 'poor'> {
  const crops = ['Wheat', 'Corn', 'Soybeans', 'Rice', 'Barley', 'Cotton'];
  return Object.fromEntries(
    crops.map((crop) => {
      const optimal = ph >= 6.0 && ph <= 7.5;
      const acceptable = ph >= 5.5 && ph <= 8.0;
      return [crop, optimal ? 'optimal' : acceptable ? 'acceptable' : 'poor'];
    })
  );
}
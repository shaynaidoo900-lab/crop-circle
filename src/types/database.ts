export interface Profile {
  id: string;
  email: string;
  name: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
}

export interface Field {
  id: string;
  user_id: string;
  name: string;
  boundary: GeoJSON.Polygon;
  area_hectares: number;
  created_at: string;
}

export interface FieldScan {
  id: string;
  field_id: string;
  scan_date: string;
  satellite_source: string;
  ndvi_avg: number;
  health_score: number;
  metadata: Record<string, unknown>;
}

export interface AIInsight {
  id: string;
  field_id: string;
  generated_at: string;
  insight_text: string;
  category: 'nutrition' | 'water' | 'pest' | 'disease' | 'general';
}

export type NDVILevel = 'healthy' | 'moderate' | 'stressed' | 'critical';

export interface WeatherData {
  date: string;
  tempHigh: number;
  tempLow: number;
  precipitation: number;
  humidity: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
}

export interface SoilData {
  ph: number;
  moisture: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organic_matter: number;
}
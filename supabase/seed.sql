-- Seed data for Crop Circle
-- This runs automatically after the init migration via Supabase DB Push

-- Note: Seed data is inserted directly without auth context since this runs
-- during initial deployment setup. In production, remove this and use the
-- Supabase dashboard to manage seed data, or use service_role with proper auth context.

-- Insert a test profile (supabase auth user) — this simulates the trigger firing
-- The trigger should auto-create this when a user signs up, but we insert it
-- directly here to have data available for UI development
insert into public.profiles (id, email, name, subscription_tier)
values (
  '00000000-0000-0000-0000-000000000001',
  'dev@sigmarlabs.com',
  'Dev Test User',
  'pro'
) on conflict (id) do nothing;

-- Insert sample fields for development
insert into public.fields (id, user_id, name, boundary, area_hectares)
values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'North Valley Farm',
  '{"type":"Polygon","coordinates":[[[-122.52,37.68],[-122.48,37.68],[-122.48,37.73],[-122.52,37.73],[-122.52,37.68]]]}',
  245.7
) on conflict (id) do nothing;

insert into public.fields (id, user_id, name, boundary, area_hectares)
values (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'South Ridge Field',
  '{"type":"Polygon","coordinates":[[[-122.45,37.60],[-122.41,37.60],[-122.41,37.64],[-122.45,37.64],[-122.45,37.60]]]}',
  87.3
) on conflict (id) do nothing;

-- Insert sample field scans
insert into public.field_scans (field_id, satellite_source, ndvi_avg, health_score, metadata, scan_date)
values
  ('00000000-0000-0000-0000-000000000010', 'Sentinel-2 L2A', 0.72, 88, '{"cloudCover":5}', '2026-05-15'),
  ('00000000-0000-0000-0000-000000000010', 'PlanetScope', 0.65, 79, '{"cloudCover":12}', '2026-05-08'),
  ('00000000-0000-0000-0000-000000000011', 'Sentinel-2 L2A', 0.38, 52, '{"cloudCover":22}', '2026-05-14'),
  ('00000000-0000-0000-0000-000000000011', 'Landsat-9', 0.41, 58, '{"cloudCover":8}', '2026-05-01')
on conflict do nothing;

-- Insert sample AI insights
insert into public.ai_insights (field_id, insight_text, category)
values
  ('00000000-0000-0000-0000-000000000010', 'NDVI analysis shows healthy crop coverage at 88%. No significant stress detected in the past 30 days. Recommend continuing current irrigation schedule.', 'general'),
  ('00000000-0000-0000-0000-000000000010', 'Nitrogen levels appear adequate based on NDVI trend. Consider soil sampling in the NW corner for precise micronutrient analysis.', 'nutrition'),
  ('00000000-0000-0000-0000-000000000011', 'Moderate stress detected in southern region. NDVI dropped from 0.55 to 0.38 over the past 14 days. Possible water deficit — verify irrigation system in that zone.', 'water'),
  ('00000000-0000-0000-0000-000000000011', 'Elevated moisture in eastern border area. Monitor for fungal infection risk if precipitation continues. Early warning: consider preventative fungicide application.', 'disease')
on conflict do nothing;
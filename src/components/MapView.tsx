import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useFieldStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Field } from '@/types/database';
import { MousePointer, X } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1Ij...demo';

interface MapViewProps {
  fields: Field[];
  onFieldSelect?: (field: Field) => void;
  onFieldCreate?: (boundary: GeoJSON.Polygon, area: number) => void;
  className?: string;
}

interface DrawingState {
  isDrawing: boolean;
  points: [number, number][];
  polygon: GeoJSON.Polygon | null;
}

export function MapView({ fields, onFieldSelect, onFieldCreate, className }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    points: [],
    polygon: null,
  });
  const { mapLayer, setMapLayer } = useUIStore();
  const { selectedField } = useFieldStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drawRef = useRef<any>(null);

  // Load mapbox-gl dynamically on first render to avoid chunk size warning
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapContainer.current || mapRef.current || !isMounted) return;

      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        const MapboxDraw = (await import('@mapbox/mapbox-gl-draw')).default;
        
        // Import CSS
        await import('mapbox-gl/dist/mapbox-gl.css');
        await import('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [-98.5795, 39.8283],
          zoom: 4,
        });

        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: false,
            trash: false,
            point: false,
            line: false,
            combine_features: false,
            uncombine_features: false,
          },
          defaultMode: 'simple_select',
          styles: [
            {
              id: 'gl-draw-polygon-fill',
              type: 'fill',
              filter: ['all', ['==', '$type', 'Polygon']],
              paint: {
                'fill-color': '#22c55e',
                'fill-opacity': 0.3,
              },
            },
            {
              id: 'gl-draw-polygon-stroke',
              type: 'line',
              filter: ['all', ['==', '$type', 'Polygon']],
              paint: {
                'line-color': '#166534',
                'line-width': 2,
              },
            },
            {
              id: 'gl-draw-polygon-and-line-vertex-active',
              type: 'circle',
              filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
              paint: {
                'circle-radius': 6,
                'circle-color': '#22c55e',
                'circle-stroke-color': '#fff',
                'circle-stroke-width': 2,
              },
            },
            {
              id: 'gl-draw-polygon-midpoint',
              type: 'circle',
              filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
              paint: {
                'circle-radius': 4,
                'circle-color': '#22c55e',
              },
            },
          ],
        });

        map.addControl(draw);
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.on('load', () => {
          if (isMounted) setMapLoaded(true);
        });

        mapRef.current = map;
        drawRef.current = draw;
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (drawRef.current) {
        drawRef.current.deleteAll();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
      mapRef.current = null;
    };
  }, []);

  // Render field polygons
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || fields.length === 0) return;

    const map = mapRef.current;
    const sourceId = 'fields-source';
    const fillId = 'fields-fill';
    const lineId = 'fields-line';

    if (map.getLayer(fillId)) map.removeLayer(fillId);
    if (map.getLayer(lineId)) map.removeLayer(lineId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: fields.map((field) => ({
        type: 'Feature',
        properties: { id: field.id, name: field.name },
        geometry: field.boundary,
      })),
    };

    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson,
    });

    map.addLayer({
      id: fillId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': [
          'case',
          ['==', ['get', 'id'], selectedField?.id || ''],
          '#22c55e',
          '#86efac',
        ],
        'fill-opacity': 0.4,
      },
    });

    map.addLayer({
      id: lineId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#166534',
        'line-width': 2,
      },
    });

    map.on('click', fillId, (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (e.features && e.features[0]) {
        const fieldId = e.features[0].properties?.id;
        const field = fields.find((f) => f.id === fieldId);
        if (field && onFieldSelect) {
          onFieldSelect(field);
        }
      }
    });

    map.on('mouseenter', fillId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', fillId, () => {
      map.getCanvas().style.cursor = '';
    });

    if (fields.length === 1) {
      const bounds = new mapboxgl.LngLatBounds();
      geojson.features.forEach((feature) => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach((coord: number[]) => {
            bounds.extend(coord as [number, number]);
          });
        }
      });
      map.fitBounds(bounds, { padding: 100, maxZoom: 15 });
    }
  }, [fields, selectedField, mapLoaded, onFieldSelect]);

  // Handle drawing mode
  useEffect(() => {
    if (!drawRef.current || !mapRef.current) return;

    if (drawingState.isDrawing) {
      drawRef.current.changeMode('draw_polygon');
      mapRef.current.getCanvas().style.cursor = 'crosshair';
    } else {
      drawRef.current.changeMode('simple_select');
      mapRef.current.getCanvas().style.cursor = '';
    }
  }, [drawingState.isDrawing]);

  // Listen for draw events
  useEffect(() => {
    if (!mapRef.current || !drawRef.current) return;

    const handleDrawCreate = (e: { features: GeoJSON.Feature[] }) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        if (feature.geometry.type === 'Polygon') {
          const polygon = feature.geometry as GeoJSON.Polygon;
          const area = calculatePolygonArea(polygon);
          
          setDrawingState({
            isDrawing: false,
            points: [],
            polygon,
          });

          if (onFieldCreate) {
            onFieldCreate(polygon, area);
          }
        }
      }
    };

    const handleDrawUpdate = (e: { features: GeoJSON.Feature[] }) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        if (feature.geometry.type === 'Polygon') {
          const polygon = feature.geometry as GeoJSON.Polygon;
          setDrawingState((prev) => ({
            ...prev,
            polygon,
          }));
        }
      }
    };

    mapRef.current.on('draw.create', handleDrawCreate);
    mapRef.current.on('draw.update', handleDrawUpdate);

    return () => {
      mapRef.current?.off('draw.create', handleDrawCreate);
      mapRef.current?.off('draw.update', handleDrawUpdate);
    };
  }, [mapLoaded, onFieldCreate]);

  const startDrawing = useCallback(() => {
    setDrawingState({
      isDrawing: true,
      points: [],
      polygon: null,
    });

    if (drawRef.current) {
      drawRef.current.deleteAll();
    }
  }, []);

  const cancelDrawing = useCallback(() => {
    setDrawingState({
      isDrawing: false,
      points: [],
      polygon: null,
    });

    if (drawRef.current) {
      drawRef.current.deleteAll();
    }
  }, []);

  const switchLayer = useCallback((layer: 'satellite' | 'ndvi' | 'weather' | 'soil') => {
    setMapLayer(layer);

    if (!mapRef.current) return;

    if (layer === 'satellite') {
      mapRef.current.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
    }
  }, [setMapLayer]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Layer Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-2 rounded-lg border shadow-lg z-10">
        <Button
          variant={mapLayer === 'satellite' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchLayer('satellite')}
        >
          Satellite
        </Button>
        <Button
          variant={mapLayer === 'ndvi' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchLayer('ndvi')}
        >
          NDVI
        </Button>
        <Button
          variant={mapLayer === 'soil' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchLayer('soil')}
        >
          Soil
        </Button>
        <Button
          variant={mapLayer === 'weather' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchLayer('weather')}
        >
          Weather
        </Button>
      </div>

      {/* Drawing Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-10">
        {!drawingState.isDrawing ? (
          <Button
            onClick={startDrawing}
            variant="secondary"
            className="bg-background/95 backdrop-blur"
          >
            <MousePointer className="w-4 h-4 mr-2" />
            Draw Field
          </Button>
        ) : (
          <>
            <Button
              onClick={cancelDrawing}
              variant="outline"
              className="bg-background/95 backdrop-blur"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <div className="bg-background/95 backdrop-blur px-4 py-2 rounded-lg border shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Click to add points, double-click to finish</span>
            </div>
          </>
        )}
      </div>

      {/* Drawing Help Overlay */}
      {drawingState.isDrawing && (
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-lg z-10 max-w-xs">
          <h4 className="font-semibold mb-2">Drawing Tips</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Click to add polygon vertices</li>
            <li>• Click the first point to close polygon</li>
            <li>• Press ESC to cancel</li>
            <li>• Use the delete key to remove last point</li>
          </ul>
        </div>
      )}

      {/* NDVI Legend */}
      {mapLayer === 'ndvi' && (
        <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur p-3 rounded-lg border shadow-lg z-10">
          <p className="text-sm font-medium mb-2">NDVI Legend</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#166534' }} />
              <span>Healthy (0.7-1.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} />
              <span>Moderate (0.5-0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }} />
              <span>Stressed (0.3-0.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
              <span>Critical (-1.0-0.3)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function calculatePolygonArea(polygon: GeoJSON.Polygon): number {
  const coordinates = polygon.coordinates[0];
  if (coordinates.length < 4) return 0;

  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n - 1; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];
    
    const x1 = lng1 * 111320 * Math.cos((lat1 * Math.PI) / 180);
    const y1 = lat1 * 110540;
    const x2 = lng2 * 111320 * Math.cos((lat2 * Math.PI) / 180);
    const y2 = lat2 * 110540;

    area += x1 * y2 - x2 * y1;
  }

  area = Math.abs(area) / 2;
  return area / 10000;
}

export { calculatePolygonArea };
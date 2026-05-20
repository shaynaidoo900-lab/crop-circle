import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useFieldStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Field } from '@/types/database';
import { MousePointer, X } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidGVzdCIsImEiOiJjbGV4YW1wbGUwIn0.demo';

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
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    points: [],
    polygon: null,
  });
  const { mapLayer, setMapLayer } = useUIStore();
  const { selectedField } = useFieldStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-98.5795, 39.8283],
      zoom: 4,
    });

    // Initialize Mapbox Draw
    draw.current = new MapboxDraw({
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
        // Polygon fill
        {
          id: 'gl-draw-polygon-fill',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': '#22c55e',
            'fill-opacity': 0.3,
          },
        },
        // Polygon stroke
        {
          id: 'gl-draw-polygon-stroke',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon']],
          paint: {
            'line-color': '#166534',
            'line-width': 2,
          },
        },
        // Vertex points
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
        // Midpoints
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

    map.current.addControl(draw.current);

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (draw.current) {
        draw.current.deleteAll();
      }
      if (map.current) {
        map.current.remove();
      }
      map.current = null;
    };
  }, []);

  // Render field polygons
  useEffect(() => {
    if (!map.current || !mapLoaded || fields.length === 0) return;

    const sourceId = 'fields-source';
    const fillId = 'fields-fill';
    const lineId = 'fields-line';

    // Remove existing layers and source
    if (map.current.getLayer(fillId)) map.current.removeLayer(fillId);
    if (map.current.getLayer(lineId)) map.current.removeLayer(lineId);
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

    // Create GeoJSON from fields
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: fields.map((field) => ({
        type: 'Feature',
        properties: { id: field.id, name: field.name },
        geometry: field.boundary,
      })),
    };

    // Add source
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: geojson,
    });

    // Add fill layer
    map.current.addLayer({
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

    // Add line layer
    map.current.addLayer({
      id: lineId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#166534',
        'line-width': 2,
      },
    });

    // Click handler for field selection
    map.current.on('click', fillId, (e) => {
      if (e.features && e.features[0]) {
        const fieldId = e.features[0].properties?.id;
        const field = fields.find((f) => f.id === fieldId);
        if (field && onFieldSelect) {
          onFieldSelect(field);
        }
      }
    });

    // Change cursor on hover
    map.current.on('mouseenter', fillId, () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', fillId, () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });

    // Fit bounds if single field
    if (fields.length === 1) {
      const bounds = new mapboxgl.LngLatBounds();
      geojson.features.forEach((feature) => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach((coord) => {
            bounds.extend(coord as [number, number]);
          });
        }
      });
      map.current.fitBounds(bounds, { padding: 100, maxZoom: 15 });
    }
  }, [fields, selectedField, mapLoaded, onFieldSelect]);

  // Handle drawing mode changes
  useEffect(() => {
    if (!draw.current || !map.current) return;

    if (drawingState.isDrawing) {
      draw.current.changeMode('draw_polygon');
      map.current.getCanvas().style.cursor = 'crosshair';
    } else {
      draw.current.changeMode('simple_select');
      map.current.getCanvas().style.cursor = '';
    }
  }, [drawingState.isDrawing]);

  // Listen for draw create event
  useEffect(() => {
    if (!map.current || !draw.current) return;

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

    map.current.on('draw.create', handleDrawCreate);
    map.current.on('draw.update', handleDrawUpdate);

    return () => {
      map.current?.off('draw.create', handleDrawCreate);
      map.current?.off('draw.update', handleDrawUpdate);
    };
  }, [mapLoaded, onFieldCreate]);

  // Start drawing new field
  const startDrawing = useCallback(() => {
    setDrawingState({
      isDrawing: true,
      points: [],
      polygon: null,
    });

    if (draw.current) {
      draw.current.deleteAll();
    }
  }, []);

  // Cancel drawing
  const cancelDrawing = useCallback(() => {
    setDrawingState({
      isDrawing: false,
      points: [],
      polygon: null,
    });

    if (draw.current) {
      draw.current.deleteAll();
    }
  }, []);


  // Switch map layer
  const switchLayer = useCallback((layer: 'satellite' | 'ndvi' | 'weather' | 'soil') => {
    setMapLayer(layer);

    if (!map.current) return;

    // Toggle layers based on selection

    // Add or remove NDVI overlay based on layer selection
    if (layer === 'ndvi') {
      // NDVI would be added as a raster overlay here
      // For now, just update the style
    } else if (layer === 'satellite') {
      map.current.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
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

      {/* Legend for selected layer */}
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

// Calculate polygon area in hectares using the Shoelace formula
function calculatePolygonArea(polygon: GeoJSON.Polygon): number {
  const coordinates = polygon.coordinates[0];
  if (coordinates.length < 4) return 0;

  // Convert to a local coordinate system (meters)
  // Using a simplified approach for small areas
  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n - 1; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];
    
    // Convert to approximate meters
    const x1 = lng1 * 111320 * Math.cos((lat1 * Math.PI) / 180);
    const y1 = lat1 * 110540;
    const x2 = lng2 * 111320 * Math.cos((lat2 * Math.PI) / 180);
    const y2 = lat2 * 110540;

    area += x1 * y2 - x2 * y1;
  }

  area = Math.abs(area) / 2;

  // Convert square meters to hectares
  return area / 10000;
}

// Export for use elsewhere
export { calculatePolygonArea };
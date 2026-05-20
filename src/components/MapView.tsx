import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useFieldStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Field } from '@/types/database';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVtby1jcm9wLWNpcmNsZSJ9.demo';

interface MapViewProps {
  fields: Field[];
  onFieldSelect?: (field: Field) => void;
  className?: string;
}

export function MapView({ fields, onFieldSelect, className }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const { mapLayer, setMapLayer } = useUIStore();
  const { selectedField } = useFieldStore();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-98.5795, 39.8283],
      zoom: 4,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || fields.length === 0) return;

    const sourceId = 'fields-source';
    const fillId = 'fields-fill';
    const lineId = 'fields-line';

    if (map.current.getLayer(fillId)) map.current.removeLayer(fillId);
    if (map.current.getLayer(lineId)) map.current.removeLayer(lineId);
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: fields.map((field) => ({
        type: 'Feature',
        properties: { id: field.id, name: field.name },
        geometry: field.boundary,
      })),
    };

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: geojson,
    });

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

    map.current.addLayer({
      id: lineId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#166534',
        'line-width': 2,
      },
    });

    map.current.on('click', fillId, (e) => {
      if (e.features && e.features[0]) {
        const fieldId = e.features[0].properties?.id;
        const field = fields.find((f) => f.id === fieldId);
        if (field && onFieldSelect) {
          onFieldSelect(field);
        }
      }
    });

    if (fields.length === 1 && map.current.getSource(sourceId)) {
      const bounds = new mapboxgl.LngLatBounds();
      geojson.features.forEach((feature) => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach((coord) => {
            bounds.extend(coord as [number, number]);
          });
        }
      });
      map.current.fitBounds(bounds, { padding: 100 });
    }
  }, [fields, selectedField, onFieldSelect]);

  const startDrawing = () => {
    setIsDrawing(true);
    setDrawingPoints([]);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !map.current) return;

    const mapE = e as unknown as mapboxgl.MapMouseEvent;
    const newPoint: [number, number] = [mapE.lngLat.lng, mapE.lngLat.lat];
    setDrawingPoints((prev) => [...prev, newPoint]);

    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat(newPoint)
      .addTo(map.current);
  };

  const finishDrawing = () => {
    if (drawingPoints.length >= 3) {
      console.log('Field polygon completed:', drawingPoints);
    }
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  return (
    <div className={cn('relative w-full h-full', className)}>
      <div ref={mapContainer} className="w-full h-full" onClick={handleMapClick} />
      
      <div className="absolute top-4 left-4 flex flex-col gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-2 rounded-lg border shadow-lg">
        <Button
          variant={mapLayer === 'satellite' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMapLayer('satellite')}
        >
          Satellite
        </Button>
        <Button
          variant={mapLayer === 'ndvi' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMapLayer('ndvi')}
        >
          NDVI
        </Button>
        <Button
          variant={mapLayer === 'weather' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMapLayer('weather')}
        >
          Weather
        </Button>
        <Button
          variant={mapLayer === 'soil' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMapLayer('soil')}
        >
          Soil
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 flex gap-2">
        <Button onClick={startDrawing} disabled={isDrawing} variant="secondary">
          Draw Field
        </Button>
        {isDrawing && drawingPoints.length >= 3 && (
          <Button onClick={finishDrawing} variant="default">
            Finish Drawing
          </Button>
        )}
      </div>

      {isDrawing && (
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur p-3 rounded-lg border shadow-lg">
          <p className="text-sm font-medium">Click to add points</p>
          <p className="text-xs text-muted-foreground">{drawingPoints.length} points added</p>
        </div>
      )}
    </div>
  );
}
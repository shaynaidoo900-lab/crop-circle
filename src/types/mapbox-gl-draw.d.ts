declare module '@mapbox/mapbox-gl-draw' {
  import type { IControl, Map } from 'mapbox-gl';

  interface DrawOptions {
    displayControlsDefault?: boolean;
    controls?: {
      polygon?: boolean;
      trash?: boolean;
      point?: boolean;
      line?: boolean;
      combine_features?: boolean;
      uncombine_features?: boolean;
    };
    defaultMode?: string;
    styles?: object[];
  }

  interface DrawFeature {
    id: string;
    type: string;
    properties?: Record<string, unknown>;
    geometry: GeoJSON.Geometry;
  }

  interface DrawFeatureCollection {
    type: 'FeatureCollection';
    features: DrawFeature[];
  }

  export default class MapboxDraw implements IControl {
    constructor(options?: DrawOptions);
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
    add(geojson: GeoJSON.Feature | GeoJSON.FeatureCollection): string[];
    getAll(): DrawFeatureCollection;
    get(id: string): DrawFeature | undefined;
    delete(ids: string | string[]): this;
    deleteAll(): this;
    set(featureCollection: GeoJSON.FeatureCollection): string[];
    trash(): this;
    combineFeatures(): this;
    uncombineFeatures(): this;
    changeMode(mode: string, options?: object): this;
    getMode(): string;
    setFeatureProperty(featureId: string, property: string, value: unknown): this;
  }
}

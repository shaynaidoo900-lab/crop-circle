import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapView } from '@/components/MapView';
import { NDVIViewer } from '@/components/NDVIViewer';
import { WeatherPanel } from '@/components/WeatherPanel';
import { SoilChart } from '@/components/SoilChart';
import { AIChatWidget } from '@/components/AIChatWidget';
import { ReportGenerator } from '@/components/ReportGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFieldStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { formatDate, formatHectares, getHealthScoreColor } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Activity,
  BarChart3,
  Settings,
} from 'lucide-react';
import type { Field, FieldScan, SoilData, WeatherData } from '@/types/database';

export function FieldDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fields, setFields, setSelectedField } = useFieldStore();
  const [field, setField] = useState<Field | null>(null);
  const [scans, setScans] = useState<FieldScan[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const [soilData] = useState<SoilData>({
    ph: 6.8,
    moisture: 45,
    nitrogen: 48,
    phosphorus: 32,
    potassium: 185,
    organic_matter: 3.2,
  });

  const [weather] = useState<WeatherData[]>([
    { date: '2024-01-20', tempHigh: 18, tempLow: 8, precipitation: 2, humidity: 65, condition: 'sunny' },
    { date: '2024-01-21', tempHigh: 16, tempLow: 6, precipitation: 5, humidity: 72, condition: 'cloudy' },
    { date: '2024-01-22', tempHigh: 14, tempLow: 5, precipitation: 8, humidity: 80, condition: 'rainy' },
    { date: '2024-01-23', tempHigh: 15, tempLow: 7, precipitation: 3, humidity: 68, condition: 'cloudy' },
    { date: '2024-01-24', tempHigh: 19, tempLow: 9, precipitation: 0, humidity: 55, condition: 'sunny' },
    { date: '2024-01-25', tempHigh: 21, tempLow: 11, precipitation: 0, humidity: 50, condition: 'sunny' },
    { date: '2024-01-26', tempHigh: 20, tempLow: 10, precipitation: 1, humidity: 58, condition: 'cloudy' },
  ]);

  useEffect(() => {
    const loadFieldData = async () => {
      if (!id) return;

      // Find field in store first
      const existingField = fields.find((f) => f.id === id);
      if (existingField) {
        setField(existingField);
        setSelectedField(existingField);
        
        // Load scans for this field
        try {
          const { data: scansData, error: scansError } = await supabase
            .from('field_scans')
            .select('*')
            .eq('field_id', id)
            .order('scan_date', { ascending: false });

          if (scansError) throw scansError;
          setScans(scansData || []);
        } catch (error) {
          console.error('Error loading scans:', error);
          // Use mock data if no real data
          setScans([
            {
              id: '1',
              field_id: id,
              scan_date: '2024-01-15',
              satellite_source: 'Sentinel-2',
              ndvi_avg: 0.72,
              health_score: 85,
              metadata: {},
            },
            {
              id: '2',
              field_id: id,
              scan_date: '2024-01-08',
              satellite_source: 'Sentinel-2',
              ndvi_avg: 0.68,
              health_score: 78,
              metadata: {},
            },
            {
              id: '3',
              field_id: id,
              scan_date: '2024-01-01',
              satellite_source: 'Landsat-8',
              ndvi_avg: 0.65,
              health_score: 72,
              metadata: {},
            },
          ]);
        }
        
        setLoading(false);
        return;
      }

      // Try fetching from Supabase
      try {
        const { data, error } = await supabase
          .from('fields')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setField(data);
        setSelectedField(data);
        setFields([...fields, data]);
      } catch (error) {
        console.error('Error loading field:', error);
        // Use mock field data for demo
        const mockField: Field = {
          id: id || 'demo',
          user_id: 'demo-user',
          name: 'North Field',
          boundary: {
            type: 'Polygon',
            coordinates: [[
              [-98.5, 39.8],
              [-98.4, 39.8],
              [-98.4, 39.9],
              [-98.5, 39.9],
              [-98.5, 39.8],
            ]],
          },
          area_hectares: 125.5,
          created_at: '2024-01-01',
        };
        setField(mockField);
        setSelectedField(mockField);
        setFields([...fields, mockField]);

        setScans([
          {
            id: '1',
            field_id: id || 'demo',
            scan_date: '2024-01-15',
            satellite_source: 'Sentinel-2',
            ndvi_avg: 0.72,
            health_score: 85,
            metadata: {},
          },
          {
            id: '2',
            field_id: id || 'demo',
            scan_date: '2024-01-08',
            satellite_source: 'Sentinel-2',
            ndvi_avg: 0.68,
            health_score: 78,
            metadata: {},
          },
        ]);
      }

      setLoading(false);
    };

    loadFieldData();
  }, [id, fields, setFields, setSelectedField]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!field) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Field not found</h2>
          <p className="text-muted-foreground mb-4">The field you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/fields')}>Back to Fields</Button>
        </Card>
      </div>
    );
  }

  const latestScan = scans[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/fields')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{field.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {formatHectares(field.area_hectares)} • Last scanned {latestScan ? formatDate(latestScan.scan_date) : 'Never'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {latestScan && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${getHealthScoreColor(latestScan.health_score)}20`,
                    color: getHealthScoreColor(latestScan.health_score),
                  }}
                >
                  <Activity className="w-4 h-4" />
                  {latestScan.health_score}% Health
                </div>
              )}
              <Button variant="outline" onClick={() => navigate(`/fields/${id}/edit`)}>
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Map Area */}
        <div className="flex-1 relative">
          <MapView fields={[field]} className="h-full" />
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-background overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="report">Report</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-4 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <MapPin className="w-5 h-5 mx-auto text-green-600 mb-1" />
                    <p className="text-lg font-bold">{formatHectares(field.area_hectares)}</p>
                    <p className="text-xs text-muted-foreground">Area</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <Calendar className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                    <p className="text-lg font-bold">
                      {latestScan ? formatDate(latestScan.scan_date).split(',')[0] : 'Never'}
                    </p>
                    <p className="text-xs text-muted-foreground">Last Scan</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <Activity className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                    <p className="text-lg font-bold">
                      {latestScan ? latestScan.ndvi_avg.toFixed(3) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">NDVI</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <BarChart3 className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                    <p className="text-lg font-bold">
                      {latestScan ? `${latestScan.health_score}%` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Health</p>
                  </CardContent>
                </Card>
              </div>

              {/* Satellite Source */}
              {latestScan && (
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">Latest Scan</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Source</span>
                      <span className="font-medium">{latestScan.satellite_source}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{formatDate(latestScan.scan_date)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">NDVI Avg</span>
                      <span className="font-medium">{latestScan.ndvi_avg.toFixed(4)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weather Summary */}
              <WeatherPanel weather={weather} currentWeather={weather[0]} />
            </TabsContent>

            <TabsContent value="analysis" className="p-4 space-y-4">
              <NDVIViewer scans={scans} currentScan={latestScan} />
              <SoilChart soilData={soilData} />
            </TabsContent>

            <TabsContent value="ai" className="p-4 h-full">
              <AIChatWidget fieldId={field.id} fieldName={field.name} className="h-full" />
            </TabsContent>

            <TabsContent value="report" className="p-4">
              <ReportGenerator
                field={field}
                scan={latestScan}
                soilData={soilData}
                weather={weather}
              />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
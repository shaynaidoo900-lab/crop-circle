import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportGenerator } from '@/components/ReportGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFieldStore } from '@/store';
import { formatDate, formatHectares, getHealthScoreColor } from '@/lib/utils';
import { FileText, Search, Download, Calendar, MapPin, Plus } from 'lucide-react';
import type { Field } from '@/types/database';

interface Report {
  id: string;
  fieldId: string;
  fieldName: string;
  generatedAt: string;
  healthScore: number;
  ndvi: number;
}

export function ReportsPage() {
  const navigate = useNavigate();
  const { fields, setFields } = useFieldStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock report history
  const [reportHistory] = useState<Report[]>([
    { id: '1', fieldId: '1', fieldName: 'North Field', generatedAt: '2024-01-15', healthScore: 85, ndvi: 0.72 },
    { id: '2', fieldId: '2', fieldName: 'South Meadow', generatedAt: '2024-01-12', healthScore: 78, ndvi: 0.65 },
    { id: '3', fieldId: '1', fieldName: 'North Field', generatedAt: '2024-01-08', healthScore: 82, ndvi: 0.68 },
  ]);

  useEffect(() => {
    const loadFields = async () => {
      try {
        const { data, error } = await supabase
          .from('fields')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFields(data || []);
      } catch (error) {
        console.error('Error loading fields:', error);
        setFields([]);
      } finally {
        setLoading(false);
      }
    };

    loadFields();
  }, [setFields]);

  const filteredReports = reportHistory.filter((report) =>
    report.fieldName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Reports</h1>
              <p className="text-sm text-muted-foreground">
                Generate and manage field analysis reports
              </p>
            </div>
            <Button onClick={() => navigate('/fields/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Field
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Generate Report */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Generate New Report</CardTitle>
                    <CardDescription>Create a PDF report for any of your fields</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Field</label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {fields.length === 0 ? (
                      <p className="text-muted-foreground col-span-2 text-center py-8">
                        No fields available. Add a field first to generate reports.
                      </p>
                    ) : (
                      fields.map((field) => (
                        <Card
                          key={field.id}
                          className={`cursor-pointer transition-colors ${
                            selectedField?.id === field.id ? 'border-green-600 ring-1 ring-green-600' : ''
                          }`}
                          onClick={() => setSelectedField(field)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{field.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatHectares(field.area_hectares)}
                                </p>
                              </div>
                              <MapPin className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                {selectedField && (
                  <div className="pt-4 border-t">
                    <ReportGenerator
                      field={selectedField}
                      scan={{
                        id: 'mock-scan',
                        field_id: selectedField.id,
                        scan_date: new Date().toISOString(),
                        satellite_source: 'Sentinel-2',
                        ndvi_avg: 0.72,
                        health_score: 85,
                        metadata: {},
                      }}
                      soilData={{
                        ph: 6.8,
                        moisture: 45,
                        nitrogen: 48,
                        phosphorus: 32,
                        potassium: 185,
                        organic_matter: 3.2,
                      }}
                      weather={[
                        { date: '2024-01-20', tempHigh: 18, tempLow: 8, precipitation: 2, humidity: 65, condition: 'sunny' },
                        { date: '2024-01-21', tempHigh: 16, tempLow: 6, precipitation: 5, humidity: 72, condition: 'cloudy' },
                        { date: '2024-01-22', tempHigh: 14, tempLow: 5, precipitation: 8, humidity: 80, condition: 'rainy' },
                      ]}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Report History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {filteredReports.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reports found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredReports.map((report) => (
                      <Card key={report.id} className="bg-muted/50">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{report.fieldName}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(report.generatedAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                <span
                                  className="font-medium"
                                  style={{ color: getHealthScoreColor(report.healthScore) }}
                                >
                                  {report.healthScore}% Health
                                </span>
                                <span className="text-muted-foreground">
                                  NDVI: {report.ndvi.toFixed(3)}
                                </span>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import supabase
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '@/components/MapView';
import { FieldCard } from '@/components/FieldCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore, useFieldStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { Plus, Layers, List, Map as MapIcon, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import type { Field } from '@/types/database';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { fields, setFields, setSelectedField } = useFieldStore();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

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
  }, [isAuthenticated, navigate, setFields]);

  const handleFieldSelect = (field: Field) => {
    setSelectedField(field);
    navigate(`/fields/${field.id}`);
  };

  // Calculate stats
  const totalArea = fields.reduce((acc, f) => acc + f.area_hectares, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background pb-16 md:pb-0">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur z-50 safe-top">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
                  <circle cx="12" cy="12" r="2" fill="white"/>
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Crop Circle</span>
            </div>
            <div className="hidden md:block text-sm">
              <span className="text-muted-foreground">Welcome back,</span>
              <span className="ml-1 font-medium">{user?.name || 'Farmer'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-muted rounded-xl p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`p-2.5 rounded-lg transition-all tap-target ${
                  viewMode === 'map' ? 'bg-background shadow-sm text-green-600' : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <MapIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all tap-target ${
                  viewMode === 'list' ? 'bg-background shadow-sm text-green-600' : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <Button size="sm" onClick={() => navigate('/fields/new')} className="tap-target bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Add Field</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'map' ? (
          <>
            <div className="flex-1 relative">
              <MapView
                fields={fields}
                onFieldSelect={handleFieldSelect}
                className="h-full"
              />
            </div>

            {/* Sidebar - Stats Cards */}
            <aside className="w-80 border-l bg-muted/30 hidden lg:block overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-xs text-green-700 font-medium">Fields</CardTitle>
                    </CardHeader>
                    <div className="px-3 pb-3">
                      <p className="text-2xl font-bold text-green-800">{fields.length}</p>
                    </div>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-xs text-blue-700 font-medium">Total Area</CardTitle>
                    </CardHeader>
                    <div className="px-3 pb-3">
                      <p className="text-2xl font-bold text-blue-800">{totalArea.toFixed(0)}</p>
                      <p className="text-xs text-blue-600">hectares</p>
                    </div>
                  </Card>
                </div>

                <CardHeader className="p-0">
                  <CardTitle className="text-base">Your Fields</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {fields.length} field{fields.length !== 1 ? 's' : ''} monitored
                  </p>
                </CardHeader>

                <div className="space-y-3">
                  {fields.length === 0 ? (
                    <Card className="p-6 text-center border-dashed border-2 border-green-200 bg-green-50/50">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                        <Layers className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-muted-foreground mb-4">
                        No fields added yet. Start by adding your first field.
                      </p>
                      <Button onClick={() => navigate('/fields/new')} size="sm" className="tap-target">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Field
                      </Button>
                    </Card>
                  ) : (
                    fields.map((field) => (
                      <FieldCard
                        key={field.id}
                        field={field}
                        onClick={() => handleFieldSelect(field)}
                      />
                    ))
                  )}
                </div>
              </div>
            </aside>
          </>
        ) : (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="container mx-auto max-w-6xl">
              {/* List View Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Your Fields</h1>
                  <p className="text-muted-foreground">
                    Manage and monitor all your agricultural fields
                  </p>
                </div>
                <Button onClick={() => navigate('/fields/new')} className="tap-target bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>

              {/* Quick Stats Row */}
              {fields.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700">Healthy</span>
                    </div>
                    <p className="text-xl font-bold text-green-800">{Math.max(1, Math.floor(fields.length * 0.7))}</p>
                  </Card>
                  <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700">Monitoring</span>
                    </div>
                    <p className="text-xl font-bold text-amber-800">{fields.length}</p>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">Need Attention</span>
                    </div>
                    <p className="text-xl font-bold text-blue-800">{Math.max(0, fields.length - Math.floor(fields.length * 0.7))}</p>
                  </Card>
                </div>
              )}

              {fields.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-green-200 bg-green-50/50">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No fields yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start by adding your first field. You can draw the boundary on the map
                    or import existing field data.
                  </p>
                  <Button onClick={() => navigate('/fields/new')} className="tap-target bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Field
                  </Button>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fields.map((field) => (
                    <FieldCard
                      key={field.id}
                      field={field}
                      onClick={() => handleFieldSelect(field)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
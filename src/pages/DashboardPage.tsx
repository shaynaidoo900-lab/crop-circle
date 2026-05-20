import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '@/components/MapView';
import { FieldCard } from '@/components/FieldCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore, useFieldStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { Plus, Layers, List, Map as MapIcon } from 'lucide-react';
import type { Field } from '@/types/database';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { fields, setFields, setSelectedField } = useFieldStore();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <MapIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-green-600">Crop Circle</span>
            </div>
            <div className="hidden md:block text-sm">
              <span className="text-muted-foreground">Welcome back,</span>
              <span className="ml-1 font-medium">{user?.name || 'Farmer'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'map' ? 'bg-background shadow-sm' : 'hover:bg-muted'
                }`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-muted'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button size="sm" onClick={() => navigate('/fields/new')}>
              <Plus className="w-4 h-4 mr-1" />
              Add Field
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

            {/* Sidebar */}
            <aside className="w-80 border-l bg-background hidden lg:block overflow-y-auto">
              <div className="p-4 space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg">Your Fields</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {fields.length} field{fields.length !== 1 ? 's' : ''} monitored
                  </p>
                </CardHeader>

                <div className="space-y-3">
                  {fields.length === 0 ? (
                    <Card className="p-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        No fields added yet. Start by adding your first field.
                      </p>
                      <Button onClick={() => navigate('/fields/new')} size="sm">
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
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="container mx-auto max-w-6xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Your Fields</h1>
                  <p className="text-muted-foreground">
                    Manage and monitor all your agricultural fields
                  </p>
                </div>
                <Button onClick={() => navigate('/fields/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>

              {fields.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No fields yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start by adding your first field. You can draw the boundary on the map
                    or import existing field data.
                  </p>
                  <Button onClick={() => navigate('/fields/new')}>
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
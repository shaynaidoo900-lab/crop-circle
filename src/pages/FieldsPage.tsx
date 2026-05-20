import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FieldCard } from '@/components/FieldCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFieldStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Grid, List, SlidersHorizontal } from 'lucide-react';

export function FieldsPage() {
  const navigate = useNavigate();
  const { fields, setFields } = useFieldStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const filteredFields = fields.filter((field) =>
    field.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalArea = fields.reduce((sum, field) => sum + field.area_hectares, 0);

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
              <h1 className="text-2xl font-bold">Fields</h1>
              <p className="text-sm text-muted-foreground">
                Manage your agricultural fields
              </p>
            </div>
            <Button onClick={() => navigate('/fields/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{fields.length}</p>
                <p className="text-sm text-muted-foreground">Total Fields</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{totalArea.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Total Hectares</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">
                  {fields.filter((f) => f.area_hectares > 50).length}
                </p>
                <p className="text-sm text-muted-foreground">Large Fields</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {Math.round(fields.reduce((sum, f) => sum + f.area_hectares, 0) / (fields.length || 1))}
                </p>
                <p className="text-sm text-muted-foreground">Avg. Size (ha)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-r-none ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-l-none ${viewMode === 'list' ? 'bg-muted' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Fields Grid/List */}
      <div className="container mx-auto px-4 pb-12">
        {filteredFields.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No fields found' : 'No fields yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No fields match "${searchQuery}". Try a different search term.`
                : 'Start by adding your first field to monitor its health and performance.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/fields/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Field
              </Button>
            )}
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                onClick={() => navigate(`/fields/${field.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFields.map((field) => (
              <Card
                key={field.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/fields/${field.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <span className="text-xl font-bold text-green-600">
                      {field.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{field.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {field.area_hectares.toFixed(2)} hectares
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    Added {new Date(field.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
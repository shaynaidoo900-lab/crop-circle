import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIChatWidget } from '@/components/AIChatWidget';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFieldStore } from '@/store';
import { Sparkles, TrendingUp, Droplets, Bug, Leaf } from 'lucide-react';
import type { Field } from '@/types/database';

interface InsightCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const CATEGORIES: InsightCategory[] = [
  {
    id: 'nutrition',
    name: 'Nutrition',
    icon: Leaf,
    description: 'Soil nutrients and fertilizer recommendations',
    color: 'text-green-600 bg-green-100',
  },
  {
    id: 'water',
    name: 'Water Management',
    icon: Droplets,
    description: 'Irrigation scheduling and moisture analysis',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    id: 'pest',
    name: 'Pest Detection',
    icon: Bug,
    description: 'Identify and manage pest threats',
    color: 'text-amber-600 bg-amber-100',
  },
  {
    id: 'general',
    name: 'General Analysis',
    icon: TrendingUp,
    description: 'Overall field health and recommendations',
    color: 'text-purple-600 bg-purple-100',
  },
];

export function AIInsightsPage() {
  const navigate = useNavigate();
  const { fields, selectedField, setSelectedField } = useFieldStore();
  const [activeField, setActiveField] = useState<Field | null>(selectedField);

  useEffect(() => {
    if (fields.length > 0 && !activeField) {
      setActiveField(fields[0]);
      setSelectedField(fields[0]);
    }
  }, [fields, activeField, setSelectedField]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Insights</h1>
              <p className="text-sm text-muted-foreground">
                Get personalized recommendations for your fields
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Sidebar - Categories */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r bg-background p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">SELECT CATEGORY</h2>
          <div className="space-y-2">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:border-green-600 transition-colors"
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">YOUR FIELDS</h2>
            <div className="space-y-2">
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No fields added yet.</p>
              ) : (
                fields.map((field) => (
                  <button
                    key={field.id}
                    onClick={() => {
                      setActiveField(field);
                      setSelectedField(field);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeField?.id === field.id ? 'bg-green-50 border-green-600' : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <p className="font-medium text-sm">{field.name}</p>
                    <p className="text-xs text-muted-foreground">{field.area_hectares.toFixed(1)} ha</p>
                  </button>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/fields/new')}>
              Add New Field
            </Button>
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 p-4">
          <div className="h-full max-w-3xl mx-auto">
            <AIChatWidget
              fieldId={activeField?.id}
              fieldName={activeField?.name}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
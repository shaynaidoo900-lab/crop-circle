import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SoilData } from '@/types/database';

interface SoilChartProps {
  soilData: SoilData;
}

function getPhColor(ph: number): string {
  if (ph >= 6.0 && ph <= 7.5) return '#22c55e';
  if (ph >= 5.5 && ph < 6.0) return '#eab308';
  if (ph > 7.5 && ph <= 8.0) return '#f97316';
  return '#ef4444';
}

function getNutrientLevel(value: number, optimal: { min: number; max: number }): string {
  if (value >= optimal.min && value <= optimal.max) return '#22c55e';
  if (value < optimal.min) return '#f97316';
  return '#eab308';
}

const NUTRIENTS = [
  { key: 'nitrogen', label: 'Nitrogen', unit: 'ppm', optimal: { min: 40, max: 60 }, color: '#3b82f6' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'ppm', optimal: { min: 25, max: 50 }, color: '#f59e0b' },
  { key: 'potassium', label: 'Potassium', unit: 'ppm', optimal: { min: 150, max: 300 }, color: '#8b5cf6' },
];

export function SoilChart({ soilData }: SoilChartProps) {
  const phColor = getPhColor(soilData.ph);
  
  const nutrientData = NUTRIENTS.map((n) => ({
    name: n.label,
    value: soilData[n.key as keyof SoilData] as number,
    color: n.color,
    level: getNutrientLevel(soilData[n.key as keyof SoilData] as number, n.optimal),
  }));

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Soil Analysis</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">pH Level</p>
            <p className="text-3xl font-bold" style={{ color: phColor }}>
              {soilData.ph.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {soilData.ph >= 6.0 && soilData.ph <= 7.5
                ? 'Optimal'
                : soilData.ph < 6.0
                ? 'Acidic'
                : 'Alkaline'}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Moisture</p>
            <p className="text-3xl font-bold text-blue-500">
              {soilData.moisture}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {soilData.moisture >= 40 && soilData.moisture <= 60
                ? 'Optimal'
                : soilData.moisture < 40
                ? 'Dry'
                : 'Wet'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Nutrients (ppm)</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nutrientData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value} ppm`, 'Level']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {nutrientData.map((entry, index) => (
                    <Cell key={index} fill={entry.level} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Organic Matter</span>
            <span className="text-sm font-semibold">{soilData.organic_matter}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div
              className="h-2 rounded-full bg-amber-600"
              style={{ width: `${Math.min(soilData.organic_matter * 10, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
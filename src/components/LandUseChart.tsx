import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { LandUseData } from '@/services/landUse';
import { TreePine, Wheat, Home, Droplets, Mountain, Snowflake, Shrub, Waves, Construction } from 'lucide-react';

interface LandUseChartProps {
  landUseData: LandUseData;
  className?: string;
}

const ICON_MAP: Record<string, typeof TreePine> = {
  'Trees': TreePine,
  'Forest': TreePine,
  'Cropland': Wheat,
  'Grassland': Mountain,
  'Shrubland': Shrub,
  'Bare / built-up': Construction,
  'Built-up': Home,
  'Water': Waves,
  'Ice / Snow': Snowflake,
  'Wetland': Droplets,
  'Mangrove': TreePine,
  'Moss / Lichen': Shrub,
};

export function LandUseChart({ landUseData, className }: LandUseChartProps) {
  const chartData = landUseData.classes
    .filter((c) => c.percent > 0)
    .sort((a, b) => b.percent - a.percent)
    .map((c) => ({
      name: c.name,
      value: c.percent,
      color: c.color,
    }));

  const totalArea = landUseData.classes.reduce((sum, c) => sum + c.percent, 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Land Use Classification</CardTitle>
          <span className="text-xs text-muted-foreground">{landUseData.classification}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dominant Land Use */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Dominant Land Use</p>
          <div className="flex items-center gap-3">
            {(() => {
              const IconComponent = ICON_MAP[landUseData.dominantClass] || Construction;
              return <IconComponent className="w-8 h-8 text-amber-500" />;
            })()}
            <div>
              <p className="text-lg font-semibold">{landUseData.dominantClass}</p>
              <p className="text-xs text-muted-foreground">
                {landUseData.classes.find((c) => c.name === landUseData.dominantClass)?.percent.toFixed(1)}% coverage
              </p>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Coverage']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Land Use Legend */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Land Cover Breakdown</p>
          <div className="grid grid-cols-2 gap-1">
            {landUseData.classes
              .filter((c) => c.percent > 0)
              .sort((a, b) => b.percent - a.percent)
              .map((landClass) => {
                const IconComponent = ICON_MAP[landClass.name] || Construction;
                return (
                  <div key={landClass.name} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: landClass.color }}
                    />
                    <span className="text-xs flex-1 truncate">{landClass.name}</span>
                    <span className="text-xs font-medium">{landClass.percent.toFixed(0)}%</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Data Source */}
        <p className="text-xs text-muted-foreground text-center">
          Data: {landUseData.classification} • {landUseData.timestamp}
        </p>
      </CardContent>
    </Card>
  );
}

// Compact version for dashboard
interface LandUseBadgeProps {
  landUseData: LandUseData;
  className?: string;
}

export function LandUseBadge({ landUseData, className }: LandUseBadgeProps) {
  const topClass = landUseData.classes.reduce((max, c) =>
    c.percent > max.percent ? c : max, landUseData.classes[0]);

  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50', className)}>
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: topClass?.color || '#888' }}
      />
      <span className="text-sm font-medium">{landUseData.dominantClass}</span>
      <span className="text-xs text-muted-foreground">
        {topClass?.percent.toFixed(0)}%
      </span>
    </div>
  );
}

import { cn } from '@/lib/utils';
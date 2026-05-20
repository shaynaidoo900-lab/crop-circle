import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getNDVIColor, getNDVILevel } from '@/lib/utils';
import type { FieldScan } from '@/types/database';

interface NDVIViewerProps {
  scans: FieldScan[];
  currentScan?: FieldScan;
}

const NDVI_LEGEND = [
  { range: '0.7 - 1.0', label: 'Healthy', color: '#166534' },
  { range: '0.5 - 0.7', label: 'Moderate', color: '#22c55e' },
  { range: '0.3 - 0.5', label: 'Stressed', color: '#eab308' },
  { range: '-1.0 - 0.3', label: 'Critical', color: '#ef4444' },
];

export function NDVIViewer({ scans, currentScan }: NDVIViewerProps) {
  const chartData = scans.map((scan) => ({
    date: new Date(scan.scan_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    ndvi: scan.ndvi_avg,
    score: scan.health_score,
  }));

  const currentNdvi = currentScan?.ndvi_avg ?? scans[scans.length - 1]?.ndvi_avg ?? 0;
  const ndviColor = getNDVIColor(currentNdvi);
  const ndviLevel = getNDVILevel(currentNdvi);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">NDVI Analysis</CardTitle>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border-2"
              style={{ backgroundColor: ndviColor }}
            />
            <span className="text-sm font-medium">{ndviLevel}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Current NDVI</p>
            <p className="text-2xl font-bold" style={{ color: ndviColor }}>
              {currentNdvi.toFixed(3)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Health Score</p>
            <p className="text-2xl font-bold" style={{ color: ndviColor }}>
              {currentScan?.health_score ?? scans[scans.length - 1]?.health_score ?? 0}%
            </p>
          </div>
        </div>

        <div className="h-48">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  domain={[-0.1, 1]}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <ReferenceLine y={0.3} stroke="#eab308" strokeDasharray="5 5" label="Stressed" />
                <ReferenceLine y={0.5} stroke="#22c55e" strokeDasharray="5 5" label="Moderate" />
                <Line
                  type="monotone"
                  dataKey="ndvi"
                  stroke={ndviColor}
                  strokeWidth={2}
                  dot={{ fill: ndviColor, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: ndviColor }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No scan data available
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">NDVI Legend</p>
          <div className="flex flex-wrap gap-2">
            {NDVI_LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">
                  {item.label}: {item.range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
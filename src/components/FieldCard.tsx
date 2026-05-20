import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatHectares, getHealthScoreColor } from '@/lib/utils';
import { MapPin, Calendar, Activity } from 'lucide-react';
import type { Field, FieldScan } from '@/types/database';

interface FieldCardProps {
  field: Field;
  scan?: FieldScan;
  onClick?: () => void;
}

export function FieldCard({ field, scan, onClick }: FieldCardProps) {
  const healthScore = scan?.health_score ?? Math.floor(Math.random() * 40) + 60;
  const healthColor = getHealthScoreColor(healthScore);

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-video w-full bg-gradient-to-br from-green-100 to-green-200 relative overflow-hidden rounded-t-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="w-12 h-12 text-green-600/30" />
        </div>
        <Badge
          className="absolute top-2 right-2"
          style={{ backgroundColor: healthColor }}
        >
          {healthScore}%
        </Badge>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">{field.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {formatHectares(field.area_hectares)}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {scan ? formatDate(scan.scan_date) : 'Not scanned'}
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Activity className="w-4 h-4 text-green-600" />
              NDVI Average
            </span>
            <span className="font-medium">
              {scan?.ndvi_avg?.toFixed(3) ?? '—'}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${scan ? (scan.ndvi_avg / 1) * 100 : 0}%`,
                backgroundColor: healthColor,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
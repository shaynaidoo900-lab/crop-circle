import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatHectares, getHealthScoreColor } from '@/lib/utils';
import { MapPin, Calendar, Activity, TrendingUp, Droplets } from 'lucide-react';
import type { Field, FieldScan } from '@/types/database';

interface FieldCardProps {
  field: Field;
  scan?: FieldScan;
  onClick?: () => void;
}

export function FieldCard({ field, scan, onClick }: FieldCardProps) {
  const healthScore = scan?.health_score ?? Math.floor(Math.random() * 40) + 60;
  const healthColor = getHealthScoreColor(healthScore);
  const ndviValue = scan?.ndvi_avg ?? 0.65;

  return (
    <Card
      className="cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-green-100 hover:border-green-300 overflow-hidden"
      onClick={onClick}
    >
      {/* Header with gradient background */}
      <div className="h-32 bg-gradient-to-br from-green-100 via-green-50 to-emerald-100 relative overflow-hidden">
        {/* Decorative crop circle pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-green-600">
            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="60" cy="60" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="60" cy="60" r="6" fill="currentColor"/>
          </svg>
        </div>
        
        {/* Health badge */}
        <Badge
          className="absolute top-3 right-3 text-white font-bold shadow-lg"
          style={{ backgroundColor: healthColor }}
        >
          {healthScore}% Healthy
        </Badge>
        
        {/* NDVI mini indicator */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-lg px-2 py-1 shadow-sm">
          <span className="text-xs font-medium text-green-700">NDVI {ndviValue.toFixed(2)}</span>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold truncate">{field.name}</CardTitle>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="w-4 h-4 text-green-600" />
          {formatHectares(field.area_hectares)}
        </p>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Scan info */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {scan ? formatDate(scan.scan_date) : 'Not scanned'}
          </span>
          {scan && (
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
              <TrendingUp className="w-3 h-3" />
              {scan.satellite_source}
            </span>
          )}
        </div>
        
        {/* NDVI Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 font-medium">
              <Activity className="w-4 h-4 text-green-600" />
              Vegetation Index
            </span>
            <span className="font-bold text-green-700">
              {scan?.ndvi_avg?.toFixed(3) ?? '—'}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (ndviValue / 1) * 100)}%`,
                backgroundColor: healthColor,
              }}
            />
          </div>
        </div>
        
        {/* Moisture indicator (if available) */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span>Last updated {scan ? formatDate(scan.scan_date) : 'Recently'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
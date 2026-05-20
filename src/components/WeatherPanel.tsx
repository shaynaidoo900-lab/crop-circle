import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, Zap, Wind, Droplets } from 'lucide-react';
import type { WeatherData } from '@/types/database';

interface WeatherPanelProps {
  weather: WeatherData[];
  currentWeather?: WeatherData;
}

const WEATHER_ICONS = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: Zap,
};

function getWeatherIcon(condition: WeatherData['condition']) {
  return WEATHER_ICONS[condition] || Sun;
}

export function WeatherPanel({ weather, currentWeather }: WeatherPanelProps) {
  const today = currentWeather || weather[0];
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Weather Forecast</CardTitle>
          {today && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Droplets className="w-4 h-4" />
              {today.humidity}%
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {today && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = getWeatherIcon(today.condition);
                return <Icon className="w-12 h-12 text-amber-500" />;
              })()}
              <div>
                <p className="text-4xl font-bold">{Math.round(today.tempHigh)}°</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(today.tempLow)}° low
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium capitalize">{today.condition}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <Wind className="w-3 h-3" />
                {today.precipitation}mm
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">7-Day Forecast</p>
          <div className="grid grid-cols-7 gap-1">
            {weather.slice(0, 7).map((day, index) => {
              const Icon = getWeatherIcon(day.condition);
              return (
                <div
                  key={index}
                  className="flex flex-col items-center p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <Icon className="w-5 h-5 my-2 text-amber-500" />
                  <span className="text-xs font-medium">
                    {Math.round(day.tempHigh)}°
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(day.tempLow)}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Precipitation</p>
            <p className="text-lg font-semibold">{today?.precipitation ?? 0}mm</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="text-lg font-semibold">{today?.humidity ?? 0}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
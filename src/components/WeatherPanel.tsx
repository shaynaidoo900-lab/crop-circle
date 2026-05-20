import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, Zap, Wind, Droplets, CloudDrizzle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeatherData } from '@/types/database';
import type { AirQualityData } from '@/services/airQuality';
import { getAQIColor, getAQICategoryLabel } from '@/services/airQuality';

interface WeatherPanelProps {
  weather: WeatherData[];
  currentWeather?: WeatherData;
  airQuality?: AirQualityData;
  onAirQualityClick?: () => void;
  className?: string;
}

const WEATHER_ICONS = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: Zap,
  snowy: CloudDrizzle,
};

function getWeatherIcon(condition: WeatherData['condition']) {
  return WEATHER_ICONS[condition] || Cloud;
}

export function WeatherPanel({ weather, currentWeather, airQuality, onAirQualityClick, className }: WeatherPanelProps) {
  const today = currentWeather || weather[0];
  
  return (
    <Card className={cn('w-full', className)}>
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

        {/* Air Quality Section */}
        {airQuality && (
          <button
            onClick={onAirQualityClick}
            className="w-full bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Air Quality</p>
              <span className="text-xs text-muted-foreground">Tap for details →</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: getAQIColor(airQuality.aqi) }}
              >
                {airQuality.aqi}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {getAQICategoryLabel(airQuality.category)}
                </p>
                <p className="text-xs text-muted-foreground">
                  PM2.5: {airQuality.pm25.toFixed(1)} μg/m³
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Compact Pollutant Details */}
        {airQuality && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/50 rounded p-2 text-center">
              <p className="text-xs text-muted-foreground">PM2.5</p>
              <p className="text-sm font-semibold">{airQuality.pm25.toFixed(0)}</p>
            </div>
            <div className="bg-muted/50 rounded p-2 text-center">
              <p className="text-xs text-muted-foreground">PM10</p>
              <p className="text-sm font-semibold">{airQuality.pm10.toFixed(0)}</p>
            </div>
            <div className="bg-muted/50 rounded p-2 text-center">
              <p className="text-xs text-muted-foreground">O₃</p>
              <p className="text-sm font-semibold">{airQuality.o3.toFixed(0)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Air Quality Detail Modal/Card Component
interface AirQualityDetailProps {
  airQuality: AirQualityData;
  className?: string;
}

export function AirQualityDetail({ airQuality, className }: AirQualityDetailProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Air Quality Details</CardTitle>
          <div
            className="px-3 py-1 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: getAQIColor(airQuality.aqi) }}
          >
            AQI: {airQuality.aqi}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{airQuality.station}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main AQI Display */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: getAQIColor(airQuality.aqi) }}
          >
            {airQuality.aqi}
          </div>
          <div>
            <p className="text-xl font-semibold">
              {getAQICategoryLabel(airQuality.category)}
            </p>
            <p className="text-sm text-muted-foreground">
              Dominant pollutant: {airQuality.dominantPollutant.toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(airQuality.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Pollutant Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">PM2.5</p>
            <p className="text-xl font-semibold">{airQuality.pm25.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">μg/m³</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">PM10</p>
            <p className="text-xl font-semibold">{airQuality.pm10.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">μg/m³</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">O₃</p>
            <p className="text-xl font-semibold">{airQuality.o3.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">μg/m³</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">NO₂</p>
            <p className="text-xl font-semibold">{airQuality.no2.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">μg/m³</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">SO₂</p>
            <p className="text-xl font-semibold">{airQuality.so2.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">μg/m³</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">CO</p>
            <p className="text-xl font-semibold">{airQuality.co.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">mg/m³</p>
          </div>
        </div>

        {/* Health Advisory */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm font-medium mb-1">Health Advisory</p>
          <p className="text-sm text-muted-foreground">
            {airQuality.category === 'good' && 'Air quality is satisfactory. Outdoor activities are safe.'}
            {airQuality.category === 'moderate' && 'Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion.'}
            {airQuality.category === 'unhealthy-sensitive' && 'Members of sensitive groups may experience health effects. General public is less likely to be affected.'}
            {airQuality.category === 'unhealthy' && 'Everyone may begin to experience health effects. Sensitive groups may experience more serious effects.'}
            {airQuality.category === 'very-unhealthy' && 'Health alert: everyone may experience more serious health effects.'}
            {airQuality.category === 'hazardous' && 'Health warnings of emergency conditions. The entire population is more likely to be affected.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
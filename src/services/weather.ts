/**
 * Open-Meteo Weather API Integration
 * Free, no API key required. Global coverage.
 * Docs: https://open-meteo.com/en/docs
 */

export interface WeatherForecast {
  date: string;
  tempHigh: number;
  tempLow: number;
  precipitation: number;
  humidity: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  windSpeed: number;
  uvIndex: number;
}

export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    condition: string;
  };
  forecast: WeatherForecast[];
}

function mapWeathercode(code: number): WeatherForecast['condition'] {
  // WMO Weather interpretation codes
  if (code === 0) return 'sunny';
  if (code <= 3) return 'cloudy';
  if (code <= 67) return 'rainy';
  if (code <= 77) return 'snowy';
  if (code <= 82) return 'rainy';
  if (code <= 86) return 'snowy';
  if (code >= 95) return 'stormy';
  return 'cloudy';
}

export async function getWeatherForecast(
  lat: number,
  lng: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,weather_code,wind_speed_10m_max,uv_index_max',
    timezone: 'auto',
    forecast_days: '7',
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`
  );

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }

  const data = await response.json();
  const daily = data.daily;

  const forecast: WeatherForecast[] = daily.time.map(
    (date: string, i: number) => ({
      date,
      tempHigh: Math.round(daily.temperature_2m_max[i]),
      tempLow: Math.round(daily.temperature_2m_min[i]),
      precipitation: daily.precipitation_sum[i] || 0,
      humidity: Math.round(daily.relative_humidity_2m_mean[i]),
      condition: mapWeathercode(daily.weather_code[i]),
      windSpeed: Math.round(daily.wind_speed_10m_max[i]),
      uvIndex: Math.round(daily.uv_index_max[i] || 0),
    })
  );

  return {
    current: {
      temp: Math.round(data.current?.temperature_2m ?? 0),
      humidity: Math.round(data.current?.relative_humidity_2m ?? 0),
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 0),
      condition: mapWeathercode(data.current?.weather_code ?? 0),
    },
    forecast,
  };
}

export async function getHistoricalWeather(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string
): Promise<{ date: string; temp: number; precipitation: number }[]> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    start_date: startDate,
    end_date: endDate,
    daily: 'temperature_2m_mean,precipitation_sum',
    timezone: 'auto',
  });

  const response = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?${params}`
  );

  if (!response.ok) {
    throw new Error(`Open-Meteo Archive API error: ${response.status}`);
  }

  const data = await response.json();
  const daily = data.daily;

  return daily.time.map((date: string, i: number) => ({
    date,
    temp: Math.round(daily.temperature_2m_mean[i]),
    precipitation: daily.precipitation_sum[i] || 0,
  }));
}
import { useEffect, useState } from 'react';
import { getWeatherData } from '../services/meteomatics';
import type { WeatherCondition } from '../types/game';

interface WeatherWidgetProps {
  lat: number;
  lon: number;
}

export function WeatherWidget({ lat, lon }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeatherData(lat, lon);
        setWeather({
          temperature: data.temperature,
          precipitation: data.precipitation,
          humidity: data.humidity,
          windSpeed: data.windSpeed,
          soilMoisture: data.soilMoisture,
          forecast: [],
        });
      } catch (error) {
        console.error('Erreur météo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [lat, lon]);

  if (loading) {
    return <div className="weather-widget">Chargement de la météo...</div>;
  }

  if (!weather) {
    return <div className="weather-widget">Météo indisponible</div>;
  }

  const getWeatherIcon = () => {
    if (weather.precipitation > 5) return '🌧️';
    if (weather.precipitation > 0) return '☁️';
    return '☀️';
  };

  return (
    <div className="weather-widget">
      <h3>Météo actuelle</h3>
      <div className="weather-current">
        <div className="weather-icon">{getWeatherIcon()}</div>
        <div className="weather-temp">{Math.round(weather.temperature)}°C</div>
      </div>
      <div className="weather-details">
        <div>💧 Humidité: {Math.round(weather.humidity)}%</div>
        <div>🌊 Sol: {Math.round(weather.soilMoisture * 100)}%</div>
        <div>🌧️ Pluie: {weather.precipitation.toFixed(1)}mm</div>
        <div>💨 Vent: {weather.windSpeed.toFixed(1)}m/s</div>
      </div>
    </div>
  );
}

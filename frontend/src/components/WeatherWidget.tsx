import { useEffect, useState } from 'react';
import { getWeatherData, getSatelliteImage } from '../services/meteomatics';
import type { WeatherCondition } from '../types/game';

interface WeatherWidgetProps {
  lat: number;
  lon: number;
  locationName?: string;
}

export function WeatherWidget({ lat, lon, locationName }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [satelliteImage, setSatelliteImage] = useState<string | null>(null);
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
        console.error('Weather error:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSatellite = async () => {
      try {
        const imageUrl = await getSatelliteImage({ lat, lon });
        setSatelliteImage(imageUrl);
      } catch (error) {
        console.error('Satellite image error:', error);
      }
    };

    fetchWeather();
    fetchSatellite();
    const interval = setInterval(fetchWeather, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [lat, lon]);

  if (loading) {
    return <div className="weather-widget">Loading weather...</div>;
  }

  if (!weather) {
    return <div className="weather-widget">Weather unavailable</div>;
  }

  const getWeatherIcon = () => {
    if (weather.precipitation > 5) return '🌧️';
    if (weather.precipitation > 0) return '☁️';
    return '☀️';
  };

  return (
    <div className="weather-widget">
      <h3>🛰️ {locationName || 'Current Weather'}</h3>

      {/* Mini satellite map */}
      {satelliteImage && (
        <div className="satellite-mini-map">
          <img src={satelliteImage} alt="Satellite view" />
          <div className="map-overlay">
            <span className="map-label">Live Satellite View</span>
          </div>
        </div>
      )}

      <div className="weather-current">
        <div className="weather-icon">{getWeatherIcon()}</div>
        <div className="weather-temp">{Math.round(weather.temperature)}°C</div>
      </div>
      <div className="weather-details">
        <div>💧 Humidity: {Math.round(weather.humidity)}%</div>
        <div>🌊 Soil: {Math.round(weather.soilMoisture * 100)}%</div>
        <div>🌧️ Rain: {weather.precipitation.toFixed(1)}mm</div>
        <div>💨 Wind: {weather.windSpeed.toFixed(1)}m/s</div>
      </div>
    </div>
  );
}

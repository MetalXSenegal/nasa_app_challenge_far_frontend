import { useState, useEffect } from 'react';
import type { Location } from '../types/game';
import { AVAILABLE_LOCATIONS } from '../data/locations';
import { getSatelliteImage, getWeatherData } from '../services/meteomatics';
import '../styles/LocationSelector.css';

interface LocationSelectorProps {
  onSelect: (location: Location) => void;
}

export function LocationSelector({ onSelect }: LocationSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [satelliteImages, setSatelliteImages] = useState<Record<string, string>>({});
  const [weatherData, setWeatherData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load satellite images and weather data for all locations
    const loadLocationData = async () => {
      const images: Record<string, string> = {};
      const weather: Record<string, any> = {};

      for (const location of AVAILABLE_LOCATIONS) {
        try {
          // Load satellite image
          const imageUrl = await getSatelliteImage({
            lat: location.lat,
            lon: location.lon
          });
          images[location.id] = imageUrl;

          // Load weather data
          const weatherInfo = await getWeatherData(
            location.lat,
            location.lon
          );
          weather[location.id] = weatherInfo;
        } catch (error) {
          console.error(`Error loading data for ${location.name}:`, error);
        }
      }

      setSatelliteImages(images);
      setWeatherData(weather);
      setLoading(false);
    };

    loadLocationData();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#43e97b';
      case 'medium':
        return '#ffd700';
      case 'hard':
        return '#ff9500';
      case 'extreme':
        return '#ff0000';
      default:
        return '#ffffff';
    }
  };

  const getClimateIcon = (climate: string) => {
    switch (climate) {
      case 'arid':
        return '🏜️';
      case 'tropical':
        return '🌴';
      case 'cold':
        return '❄️';
      case 'temperate':
        return '🌳';
      case 'mediterranean':
        return '🌊';
      default:
        return '🌍';
    }
  };

  return (
    <div className="location-selector-overlay">
      <div className="location-selector-container">
        <div className="selector-header">
          <h1>🌍 Choose Your Location</h1>
          <p>Select a location to start your environmental restoration mission</p>
        </div>

        {loading ? (
          <div className="loading-locations">
            <div className="spinner"></div>
            <p>Loading satellite data from NASA...</p>
          </div>
        ) : (
          <div className="locations-grid">
            {AVAILABLE_LOCATIONS.map((location) => (
              <div
                key={location.id}
                className={`location-card ${
                  selectedLocation?.id === location.id ? 'selected' : ''
                }`}
                onClick={() => setSelectedLocation(location)}
              >
                {/* Satellite image */}
                <div className="location-image">
                  {satelliteImages[location.id] ? (
                    <img
                      src={satelliteImages[location.id]}
                      alt={location.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="no-image">🛰️</div>
                  )}
                  <div className="climate-badge">
                    {getClimateIcon(location.climate)}
                  </div>
                </div>

                {/* Information */}
                <div className="location-info">
                  <h3>{location.name}</h3>
                  <p className="country">📍 {location.country}</p>

                  <div className="location-stats">
                    <div className="stat">
                      <span className="label">Climate:</span>
                      <span className="value">{location.climate}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Difficulty:</span>
                      <span
                        className="value"
                        style={{ color: getDifficultyColor(location.difficulty) }}
                      >
                        {location.difficulty.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Real-time weather data */}
                  {weatherData[location.id] && (
                    <div className="weather-preview">
                      <div className="weather-item">
                        🌡️ {Math.round(weatherData[location.id].temperature)}°C
                      </div>
                      <div className="weather-item">
                        💧 {Math.round(weatherData[location.id].humidity)}%
                      </div>
                    </div>
                  )}

                  <p className="description">{location.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedLocation && (
          <div className="selector-footer">
            <button
              className="btn-start-mission"
              onClick={() => onSelect(selectedLocation)}
            >
              🚀 Start Mission in {selectedLocation.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

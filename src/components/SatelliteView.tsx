import { useEffect, useState } from 'react';
import axios from 'axios';

interface SatelliteViewProps {
  lat: number;
  lon: number;
}

const METEOMATICS_USERNAME = 'cisse_mouhamadoudiouf';
const METEOMATICS_PASSWORD = 'NwA5649eqTKWWdlFBlyd';

export function SatelliteView({ lat, lon }: SatelliteViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSatelliteImage = async () => {
      try {
        setError(null);
        const now = new Date().toISOString();

        // Pour Meteomatics: upper-left (lat max, lon min) vers lower-right (lat min, lon max)
        const latMin = lat - 0.5;
        const latMax = lat + 0.5;
        const lonMin = lon - 0.5;
        const lonMax = lon + 0.5;

        // Format correct: latMax,lonMin_latMin,lonMax (haut-gauche vers bas-droite)
        const url = `https://api.meteomatics.com/${now}/t_2m:C/${latMax},${lonMin}_${latMin},${lonMax}:600x400/png`;

        // Faire la requête avec authentification
        const response = await axios.get(url, {
          auth: {
            username: METEOMATICS_USERNAME,
            password: METEOMATICS_PASSWORD,
          },
          responseType: 'blob',
        });

        // Créer une URL objet depuis le blob
        const blobUrl = URL.createObjectURL(response.data);
        setImageUrl(blobUrl);
      } catch (error) {
        console.error('Erreur image satellite:', error);
        setError('Impossible de charger la carte météo');
      } finally {
        setLoading(false);
      }
    };

    fetchSatelliteImage();

    // Cleanup: révoquer l'URL objet quand le composant se démonte
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [lat, lon]);

  return (
    <div className="satellite-view">
      {loading ? (
        <div className="loading">📡 Chargement de la vue satellite...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
          <div>{error}</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
            Zone: {lat.toFixed(2)}°N, {lon.toFixed(2)}°W
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(0,0,0,0.7)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            zIndex: 10,
            fontSize: '0.85rem'
          }}>
            🌡️ Carte de température
          </div>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Carte météo satellite"
              className="satellite-image"
              style={{ filter: 'brightness(1.1) contrast(1.05)' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
              <div>Carte météorologique</div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                Zone: {lat.toFixed(2)}°N, {lon.toFixed(2)}°W
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

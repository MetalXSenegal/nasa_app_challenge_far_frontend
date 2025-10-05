import axios from 'axios';

const METEOMATICS_USERNAME = 'cisse_mouhamadoudiouf';
const METEOMATICS_PASSWORD = 'NwA5649eqTKWWdlFBlyd';

const meteomaticsClient = axios.create({
  baseURL: 'https://api.meteomatics.com',
  auth: {
    username: METEOMATICS_USERNAME,
    password: METEOMATICS_PASSWORD,
  },
});

export interface WeatherData {
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  soilMoisture: number;
}

export interface SatelliteImageParams {
  lat: number;
  lon: number;
  date?: Date;
  parameter: string;
}

/**
 * Récupère les données météo pour une position donnée
 */
export const getWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const now = new Date().toISOString();
  const parameters = [
    't_2m:C',           // Température à 2m
    'precip_1h:mm',     // Précipitation
    'relative_humidity_2m:p', // Humidité
    'wind_speed_10m:ms', // Vitesse du vent
    'soil_moisture_index_-5cm:idx' // Humidité du sol
  ].join(',');

  try {
    const response = await meteomaticsClient.get(
      `/${now}/${parameters}/${lat},${lon}/json`
    );

    const data = response.data.data[0].coordinates[0];
    return {
      temperature: data.dates[0].value,
      precipitation: data.dates[1]?.value || 0,
      humidity: data.dates[2]?.value || 0,
      windSpeed: data.dates[3]?.value || 0,
      soilMoisture: data.dates[4]?.value || 0,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données météo:', error);
    throw error;
  }
};

/**
 * Récupère une image satellite pour visualisation
 * Format grille requis: latMax,lonMin_latMin,lonMax:widthxheight
 * Avec fallback sur plusieurs tentatives et image par défaut
 */
export const getSatelliteImage = async (params: SatelliteImageParams): Promise<string> => {
  const { lat, lon, parameter = 'sat_rgb:idx' } = params;

  // Créer une grille autour du point (environ 2° de chaque côté)
  const gridSize = 2.0;
  const latMax = lat + gridSize;
  const latMin = lat - gridSize;
  const lonMin = lon - gridSize;
  const lonMax = lon + gridSize;

  // Format: latMax,lonMin_latMin,lonMax:widthxheight
  const gridCoordinates = `${latMax},${lonMin}_${latMin},${lonMax}:600x400`;

  // Essayer plusieurs dates dans le passé (1h, 3h, 6h, 12h, 24h)
  const timeOffsets = [
    60 * 60 * 1000,      // -1 heure
    3 * 60 * 60 * 1000,  // -3 heures
    6 * 60 * 60 * 1000,  // -6 heures
    12 * 60 * 60 * 1000, // -12 heures
    24 * 60 * 60 * 1000, // -24 heures
  ];

  const now = new Date();

  // Essayer avec différentes dates
  for (const offset of timeOffsets) {
    try {
      const pastDate = new Date(now.getTime() - offset);
      const dateStr = pastDate.toISOString();

      const response = await meteomaticsClient.get(
        `/${dateStr}/${parameter}/${gridCoordinates}/png`,
        { responseType: 'blob' }
      );

      return URL.createObjectURL(response.data);
    } catch (error) {
      // Continue vers la prochaine tentative
      continue;
    }
  }

  // Fallback: retourner une image générée (gradient basé sur les coordonnées)
  console.log('Toutes les tentatives ont échoué, utilisation du fallback');
  return generateFallbackImage(lat, lon);
};

/**
 * Génère une image de fallback avec un gradient basé sur les coordonnées
 */
const generateFallbackImage = (lat: number, lon: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Gradient basé sur la latitude (bleu pour pôles, vert/jaune pour équateur)
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);

  if (Math.abs(lat) > 60) {
    // Zones polaires - bleu/blanc
    gradient.addColorStop(0, '#e0f2ff');
    gradient.addColorStop(0.5, '#7dd3fc');
    gradient.addColorStop(1, '#0369a1');
  } else if (Math.abs(lat) < 23) {
    // Zones tropicales - vert/brun
    gradient.addColorStop(0, '#fef3c7');
    gradient.addColorStop(0.5, '#86efac');
    gradient.addColorStop(1, '#166534');
  } else {
    // Zones tempérées - vert/bleu
    gradient.addColorStop(0, '#bae6fd');
    gradient.addColorStop(0.5, '#4ade80');
    gradient.addColorStop(1, '#0f766e');
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 400);

  // Ajouter du texte
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Satellite View', 300, 200);
  ctx.font = '16px Arial';
  ctx.fillText(`${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, 300, 230);

  return canvas.toDataURL();
};

/**
 * Récupère les prévisions pour plusieurs jours
 */
export const getWeatherForecast = async (
  lat: number,
  lon: number,
  days: number = 7
): Promise<any[]> => {
  const now = new Date();
  const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const startStr = now.toISOString();
  const endStr = endDate.toISOString();

  const parameters = 't_2m:C,precip_24h:mm,relative_humidity_2m:p';

  try {
    const response = await meteomaticsClient.get(
      `/${startStr}--${endStr}:P1D/${parameters}/${lat},${lon}/json`
    );
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des prévisions:', error);
    throw error;
  }
};

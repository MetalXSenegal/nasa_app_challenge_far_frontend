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
 */
export const getSatelliteImage = async (params: SatelliteImageParams): Promise<string> => {
  const { lat, lon, parameter = 'satellite_image:idx' } = params;
  const date = params.date || new Date();
  const dateStr = date.toISOString();

  try {
    const response = await meteomaticsClient.get(
      `/${dateStr}/${parameter}/${lat},${lon}/png`,
      { responseType: 'blob' }
    );

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image satellite:', error);
    throw error;
  }
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

export interface Location {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  climate: 'temperate' | 'arid' | 'tropical' | 'cold' | 'mediterranean';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  description: string;
}

export interface Farm {
  id: string;
  name: string;
  location: Location;
  crops: Crop[];
  livestock: Livestock[];
  resources: Resources;
  score: number;
  environmentalScore: number; // 0-100% amélioration de l'environnement
  maxSlots: number; // Nombre max d'emplacements (commence à 6, achetable jusqu'à 24)
}

export interface CropCharacteristics {
  name: string;
  emoji: string;
  environmentalContribution: number; // Contribution au score environnemental (1-10)
  climateResistance: {
    arid: number; // 0-1 (résistance à la sécheresse)
    cold: number; // 0-1 (résistance au froid)
    heat: number; // 0-1 (résistance à la chaleur)
    humidity: number; // 0-1 (résistance à l'humidité)
  };
  baseValue: number;
  growthSpeed: number; // 1-3 (vitesse de croissance)
}

export interface Crop {
  id: string;
  type: CropType;
  planted: Date;
  health: number;
  waterLevel: number;
  fertilizationLevel: number;
  growthStage: number;
  expectedYield: number;
}

export type CropType = 'wheat' | 'corn' | 'soybean' | 'rice' | 'tomato' | 'potato' | 'cactus' | 'palm' | 'bamboo';

export interface Livestock {
  id: string;
  type: LivestockType;
  count: number;
  health: number;
  feedLevel: number;
  production: number;
}

export type LivestockType = 'cattle' | 'chicken' | 'pig' | 'sheep';

export interface Resources {
  water: number;
  fertilizer: number;
  seeds: number;
  feed: number;
  money: number;
}

export interface FarmAction {
  type: 'irrigate' | 'fertilize' | 'plant' | 'harvest' | 'feed' | 'buy' | 'sell';
  target?: string;
  amount?: number;
  cropType?: CropType;
  livestockType?: LivestockType;
}

export interface GameState {
  currentFarm: Farm;
  day: number;
  season: Season;
  weather: WeatherCondition;
  tutorial: boolean;
  achievements: Achievement[];
}

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface WeatherCondition {
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  soilMoisture: number;
  forecast: DailyWeather[];
}

export interface DailyWeather {
  day: number;
  temperature: number;
  precipitation: number;
  conditions: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

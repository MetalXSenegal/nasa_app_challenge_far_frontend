export interface Farm {
  id: string;
  name: string;
  location: {
    lat: number;
    lon: number;
  };
  crops: Crop[];
  livestock: Livestock[];
  resources: Resources;
  score: number;
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

export type CropType = 'wheat' | 'corn' | 'soybean' | 'rice' | 'tomato' | 'potato';

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

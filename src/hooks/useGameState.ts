import { useState, useEffect } from 'react';
import type { GameState, Farm, Crop, FarmAction, CropType } from '../types/game';

const INITIAL_FARM: Farm = {
  id: '1',
  name: 'Ma Ferme NASA',
  location: {
    lat: 40.7128,
    lon: -74.0060,
  },
  crops: [],
  livestock: [],
  resources: {
    water: 1000,
    fertilizer: 50,
    seeds: 10,
    feed: 100,
    money: 5000,
  },
  score: 0,
};

// Coûts et prix
const COSTS = {
  seed: 100,
  water: 0, // Gratuit mais limité
  fertilizer: 50,
  waterRefill: 200, // Acheter 500L d'eau
  fertilizerBag: 300, // Acheter 50kg d'engrais
};

const CROP_VALUES = {
  wheat: 150,
  corn: 200,
  soybean: 180,
  rice: 220,
  tomato: 250,
  potato: 170,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    currentFarm: INITIAL_FARM,
    day: 1,
    season: 'spring',
    weather: {
      temperature: 20,
      precipitation: 0,
      humidity: 60,
      windSpeed: 5,
      soilMoisture: 0.5,
      forecast: [],
    },
    tutorial: true,
    achievements: [],
  });

  // Progression automatique du jeu - toutes les 3 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prev) => {
        const newCrops = prev.currentFarm.crops.map((crop) => {
          let newHealth = crop.health;
          let newWaterLevel = crop.waterLevel - 8; // Consommation d'eau plus rapide
          let newFertilization = crop.fertilizationLevel - 2;
          let newGrowthStage = crop.growthStage;
          let pointsEarned = 0;

          // Perte de santé si manque d'eau
          if (newWaterLevel < 30) {
            newHealth -= 5;
            pointsEarned -= 2;
          }

          // Perte de santé si manque d'engrais
          if (newFertilization < 20) {
            newHealth -= 3;
          }

          // Croissance optimale si bonnes conditions
          if (crop.waterLevel > 50 && crop.fertilizationLevel > 40 && crop.health > 70) {
            newGrowthStage = Math.min(100, newGrowthStage + 3);
            pointsEarned += 1;
          } else if (crop.waterLevel > 30 && crop.fertilizationLevel > 20) {
            newGrowthStage = Math.min(100, newGrowthStage + 1);
          }

          // Impact de la météo
          if (prev.weather.precipitation > 0) {
            newWaterLevel = Math.min(100, newWaterLevel + prev.weather.precipitation * 2);
            pointsEarned += 1;
          }

          // Impact de la température
          if (prev.weather.temperature > 30 || prev.weather.temperature < 10) {
            newHealth -= 2; // Températures extrêmes
          }

          return {
            ...crop,
            health: Math.max(0, Math.min(100, newHealth)),
            waterLevel: Math.max(0, newWaterLevel),
            fertilizationLevel: Math.max(0, newFertilization),
            growthStage: newGrowthStage,
          };
        });

        // Calculer les points gagnés ce tour
        const pointsThisTurn = newCrops.reduce((acc, crop) => {
          if (crop.health > 80 && crop.growthStage > 50) return acc + 2;
          if (crop.health > 50) return acc + 1;
          return acc;
        }, 0);

        return {
          ...prev,
          day: prev.day + 1,
          currentFarm: {
            ...prev.currentFarm,
            crops: newCrops,
            score: prev.currentFarm.score + pointsThisTurn,
          },
        };
      });
    }, 3000); // Update toutes les 3 secondes

    return () => clearInterval(interval);
  }, []);

  const performAction = (action: FarmAction) => {
    setGameState((prev) => {
      const newFarm = { ...prev.currentFarm };
      const newResources = { ...newFarm.resources };

      switch (action.type) {
        case 'irrigate':
          if (newResources.water >= 50) {
            newResources.water -= 50;
            if (action.target) {
              const cropIndex = newFarm.crops.findIndex((c) => c.id === action.target);
              if (cropIndex !== -1) {
                newFarm.crops[cropIndex] = {
                  ...newFarm.crops[cropIndex],
                  waterLevel: Math.min(100, newFarm.crops[cropIndex].waterLevel + 30),
                };
              }
            }
          }
          break;

        case 'fertilize':
          if (newResources.fertilizer >= 10) {
            newResources.fertilizer -= 10;
            if (action.target) {
              const cropIndex = newFarm.crops.findIndex((c) => c.id === action.target);
              if (cropIndex !== -1) {
                newFarm.crops[cropIndex] = {
                  ...newFarm.crops[cropIndex],
                  fertilizationLevel: Math.min(
                    100,
                    newFarm.crops[cropIndex].fertilizationLevel + 20
                  ),
                };
              }
            }
          }
          break;

        case 'plant':
          if (newResources.seeds >= 1 && newResources.money >= COSTS.seed && action.cropType) {
            newResources.seeds -= 1;
            newResources.money -= COSTS.seed;
            const newCrop: Crop = {
              id: `crop-${Date.now()}`,
              type: action.cropType,
              planted: new Date(),
              health: 100,
              waterLevel: 50,
              fertilizationLevel: 30,
              growthStage: 0,
              expectedYield: CROP_VALUES[action.cropType] || 150,
            };
            newFarm.crops.push(newCrop);
          }
          break;

        case 'harvest':
          if (action.target) {
            const cropIndex = newFarm.crops.findIndex((c) => c.id === action.target);
            if (cropIndex !== -1 && newFarm.crops[cropIndex].growthStage >= 90) {
              const crop = newFarm.crops[cropIndex];
              // Le profit dépend de la santé de la culture
              const healthMultiplier = crop.health / 100;
              const profit = Math.round(crop.expectedYield * healthMultiplier);
              const bonus = Math.round(profit * 0.2); // 20% bonus au score

              newResources.money += profit;
              newFarm.score += profit + bonus;

              // Récupérer une graine après récolte
              newResources.seeds += 2;

              newFarm.crops.splice(cropIndex, 1);
            }
          }
          break;

        case 'buy':
          if (action.amount && action.target === 'water' && newResources.money >= COSTS.waterRefill) {
            newResources.money -= COSTS.waterRefill;
            newResources.water += 500;
          } else if (action.amount && action.target === 'fertilizer' && newResources.money >= COSTS.fertilizerBag) {
            newResources.money -= COSTS.fertilizerBag;
            newResources.fertilizer += 50;
          } else if (action.amount && action.target === 'seeds' && newResources.money >= 200) {
            newResources.money -= 200;
            newResources.seeds += 5;
          }
          break;
      }

      return {
        ...prev,
        currentFarm: {
          ...newFarm,
          resources: newResources,
        },
      };
    });
  };

  const plantCrop = (cropType: CropType) => {
    performAction({ type: 'plant', cropType });
  };

  const irrigateCrop = (cropId: string) => {
    performAction({ type: 'irrigate', target: cropId });
  };

  const fertilizeCrop = (cropId: string) => {
    performAction({ type: 'fertilize', target: cropId });
  };

  const harvestCrop = (cropId: string) => {
    performAction({ type: 'harvest', target: cropId });
  };

  const buyResource = (resource: string) => {
    performAction({ type: 'buy', target: resource, amount: 1 });
  };

  return {
    gameState,
    setGameState,
    plantCrop,
    irrigateCrop,
    fertilizeCrop,
    harvestCrop,
    buyResource,
    performAction,
    costs: COSTS,
    cropValues: CROP_VALUES,
  };
}

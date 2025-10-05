import { useState, useEffect } from 'react';
import type { GameState, Farm, Crop, FarmAction, CropType, Location } from '../types/game';
import { CROP_DATA } from '../data/crops';

const createInitialFarm = (location: Location): Farm => ({
  id: '1',
  name: `${location.name} Restoration Project`,
  location,
  crops: [],
  livestock: [],
  resources: {
    water: 1000,
    fertilizer: 50,
    seeds: 5,
    feed: 100,
    money: 500, // Démarrage avec peu d'argent
  },
  score: 0,
  environmentalScore: 0,
  maxSlots: 6, // Commencer avec 6 emplacements seulement
});

// Coûts et prix
const COSTS = {
  seed: 50,
  water: 0, // Gratuit mais limité
  fertilizer: 25,
  waterRefill: 150, // Acheter 500L d'eau
  fertilizerBag: 200, // Acheter 50kg d'engrais
  slotExpansion: 300, // Acheter un emplacement supplémentaire
};

const CROP_VALUES = {
  wheat: 150,
  corn: 200,
  soybean: 180,
  rice: 220,
  tomato: 250,
  potato: 170,
  cactus: 300,
  palm: 400,
  bamboo: 350,
};

export function useGameState(initialLocation?: Location) {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (!initialLocation) {
      // Fallback temporaire
      return {
        currentFarm: createInitialFarm({
          id: 'temp',
          name: 'Default Location',
          country: 'USA',
          lat: 40.7128,
          lon: -74.0060,
          climate: 'temperate',
          difficulty: 'easy',
          description: 'Temporary location',
        }),
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
      };
    }

    return {
      currentFarm: createInitialFarm(initialLocation),
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
      gameStatus: 'playing',
    };
  });

  const initializeGame = (location: Location) => {
    setGameState({
      currentFarm: createInitialFarm(location),
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
      gameStatus: 'playing',
    });
  };

  // Progression automatique du jeu - toutes les 30 secondes (1 jour de jeu)
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prev) => {
        const newCrops = prev.currentFarm.crops.map((crop) => {
          const cropData = CROP_DATA[crop.type];
          const climate = prev.currentFarm.location.climate;

          let newHealth = crop.health;
          let newWaterLevel = crop.waterLevel - 2; // Consommation lente
          let newFertilization = crop.fertilizationLevel - 0.5;
          let newGrowthStage = crop.growthStage;
          let pointsEarned = 0;

          // Perte de santé GRADUELLE si manque d'eau
          if (newWaterLevel < 20) {
            newHealth -= 3;
            pointsEarned -= 2;
          } else if (newWaterLevel < 40) {
            newHealth -= 1;
          }

          // Perte de santé GRADUELLE si manque d'engrais
          if (newFertilization < 10) {
            newHealth -= 2;
          } else if (newFertilization < 30) {
            newHealth -= 0.5;
          }

          // Impact du climat sur la santé selon résistance de la plante
          let climateHealthImpact = 0;
          if (climate === 'arid' && prev.weather.temperature > 30) {
            climateHealthImpact = -(1 - cropData.climateResistance.arid) * 5;
          } else if (climate === 'cold' && prev.weather.temperature < 10) {
            climateHealthImpact = -(1 - cropData.climateResistance.cold) * 4;
          } else if (climate === 'tropical' && prev.weather.humidity > 80) {
            climateHealthImpact = -(1 - cropData.climateResistance.humidity) * 2;
          }

          newHealth += climateHealthImpact;

          // Croissance optimale si bonnes conditions
          const growthMultiplier = cropData.growthSpeed * 0.5;
          if (crop.waterLevel > 50 && crop.fertilizationLevel > 40 && crop.health > 70) {
            newGrowthStage = Math.min(100, newGrowthStage + 2 * growthMultiplier);
            pointsEarned += 1;
          } else if (crop.waterLevel > 30 && crop.fertilizationLevel > 20 && crop.health > 50) {
            newGrowthStage = Math.min(100, newGrowthStage + 1 * growthMultiplier);
          } else if (crop.health > 30) {
            newGrowthStage = Math.min(100, newGrowthStage + 0.5 * growthMultiplier);
          }

          // Impact de la météo
          if (prev.weather.precipitation > 0) {
            newWaterLevel = Math.min(100, newWaterLevel + prev.weather.precipitation * 3);
            pointsEarned += 1;
          }

          // Impact de la température (moins sévère)
          if (prev.weather.temperature > 35 || prev.weather.temperature < 5) {
            const heatResistance = prev.weather.temperature > 35 ? cropData.climateResistance.heat : cropData.climateResistance.cold;
            newHealth -= (1 - heatResistance) * 2;
          }

          return {
            ...crop,
            health: Math.max(0, Math.min(100, newHealth)),
            waterLevel: Math.max(0, newWaterLevel),
            fertilizationLevel: Math.max(0, newFertilization),
            growthStage: newGrowthStage,
          };
        }).filter(crop => crop.health > 0); // MORT DES PLANTES: Retirer les plantes avec santé = 0

        // Calculer les points et revenus passifs
        const pointsThisTurn = newCrops.reduce((acc, crop) => {
          if (crop.health > 80 && crop.growthStage > 50) return acc + 3;
          if (crop.health > 50) return acc + 1;
          return acc;
        }, 0);

        // Revenu passif: +$5 par plante en bonne santé (réduit)
        const passiveIncome = newCrops.filter(c => c.health > 60).length * 5;

        // Revenu quotidien fixe basé sur le jour (plus on avance, plus on gagne)
        const dailyIncome = Math.floor(prev.day / 5) * 10; // +$10 tous les 5 jours

        // SCORE ENVIRONNEMENTAL: Contribution de chaque plante
        const environmentalContribution = newCrops.reduce((acc, crop) => {
          const cropData = CROP_DATA[crop.type];
          const healthFactor = crop.health / 100; // 0-1
          const growthFactor = crop.growthStage / 100; // 0-1
          const contribution = cropData.environmentalContribution * healthFactor * growthFactor;
          return acc + contribution;
        }, 0);

        // Score environnemental plafonné à 100%
        const maxEnvironmentalScore = 12 * 10; // 12 slots * contribution max de 10
        const newEnvironmentalScore = Math.min(
          100,
          (environmentalContribution / maxEnvironmentalScore) * 100
        );

        // Bonus argent basé sur le score environnemental (réduit)
        const environmentalBonus = Math.floor(newEnvironmentalScore * 0.5);

        const newMoney = prev.currentFarm.resources.money + passiveIncome + dailyIncome + environmentalBonus;

        // CONDITIONS DE JEU
        let newGameStatus: 'playing' | 'won' | 'lost' = prev.gameStatus;

        // VICTOIRE: Score environnemental à 100%
        if (newEnvironmentalScore >= 100 && prev.gameStatus === 'playing') {
          newGameStatus = 'won';
        }

        // DÉFAITE: Argent négatif ET pas de plantes vivantes
        if (newMoney < 0 && newCrops.length === 0 && prev.gameStatus === 'playing') {
          newGameStatus = 'lost';
        }

        // DÉFAITE: Aucune plante pendant 10 jours ET argent < 100
        if (newCrops.length === 0 && newMoney < 100 && prev.day > 10 && prev.gameStatus === 'playing') {
          newGameStatus = 'lost';
        }

        return {
          ...prev,
          day: prev.day + 1,
          gameStatus: newGameStatus,
          currentFarm: {
            ...prev.currentFarm,
            crops: newCrops,
            score: prev.currentFarm.score + pointsThisTurn,
            environmentalScore: newEnvironmentalScore,
            resources: {
              ...prev.currentFarm.resources,
              money: newMoney,
            },
          },
        };
      });
    }, 30000); // Update toutes les 30 secondes = 1 jour de jeu

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
            // Find the next available slot (0-11)
            const usedSlots = newFarm.crops.map(c => parseInt(c.id.split('-')[1]));
            let slotId = 0;
            for (let i = 0; i < 12; i++) {
              if (!usedSlots.includes(i)) {
                slotId = i;
                break;
              }
            }

            newResources.seeds -= 1;
            newResources.money -= COSTS.seed;
            const newCrop: Crop = {
              id: `slot-${slotId}`,
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
          } else if (action.target === 'slot' && newResources.money >= COSTS.slotExpansion && newFarm.maxSlots < 24) {
            newResources.money -= COSTS.slotExpansion;
            newFarm.maxSlots += 2; // Ajouter 2 emplacements à la fois
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
    initializeGame,
    plantCrop,
    irrigateCrop,
    fertilizeCrop,
    harvestCrop,
    buyResource,
    performAction,
    costs: COSTS,
    cropValues: CROP_VALUES,
    cropData: CROP_DATA,
  };
}

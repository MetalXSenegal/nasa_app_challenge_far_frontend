import { useState, useEffect } from 'react';
import './App.css';
import { useGameState } from './hooks/useGameState';
import { WeatherWidget } from './components/WeatherWidget';
import { FarmGrid } from './components/FarmGrid';
import { LocationSelector } from './components/LocationSelector';
import { DayClock } from './components/DayClock';
import { GameOver } from './components/GameOver';
import { ResourcesPanel } from './components/ResourcesPanel';
import { AuthModal } from './components/AuthModal';
import { Leaderboard } from './components/Leaderboard';
import { LandingPage } from './components/LandingPage';
import { authAPI, gameAPI } from './services/api';
import type { CropType, Location } from './types/game';

function App() {
  const { gameState, initializeGame, plantCrop, irrigateCrop, fertilizeCrop, harvestCrop, buyResource, costs, cropValues, cropData, setGameState } = useGameState();
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showGame, setShowGame] = useState(false);

  const cropTypes: CropType[] = ['wheat', 'corn', 'soybean', 'rice', 'tomato', 'potato', 'cactus', 'palm', 'bamboo'];

  // Check authentication on load
  useEffect(() => {
    const user = authAPI.getCurrentUser();
    const authenticated = authAPI.isAuthenticated();
    setIsAuthenticated(authenticated);
    setCurrentUser(user);

    // If already logged in, go directly to game
    if (authenticated) {
      setShowGame(true);
      loadGame();
    }
  }, []);

  // Auto-save every 30 seconds if connected
  useEffect(() => {
    if (!isAuthenticated) return;

    const autoSaveInterval = setInterval(() => {
      saveGame(true);
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [isAuthenticated, gameState]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const saveGame = async (isAutoSave = false) => {
    if (!isAuthenticated) {
      showNotification('⚠️ Log in to save!');
      return;
    }

    try {
      await gameAPI.save(gameState);
      if (!isAutoSave) {
        showNotification('💾 Game saved!');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('❌ Save error');
    }
  };

  const loadGame = async () => {
    try {
      const { gameState: loadedState } = await gameAPI.load();
      setGameState(loadedState);
      showNotification('📂 Game loaded!');
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Load error:', error);
      }
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setIsAuthenticated(true);
    setCurrentUser(authAPI.getCurrentUser());
    setShowGame(true);
    showNotification('✅ Login successful!');
    loadGame();
  };

  const handleStartGame = () => {
    setShowLocationSelector(true);
  };

  const handleLocationSelect = (location: Location) => {
    initializeGame(location);
    setShowLocationSelector(false);
    setShowGame(true);
    showNotification(`🌍 Mission started in ${location.name}!`);
  };

  const handleRestart = () => {
    setShowLocationSelector(true);
    setShowGame(false);
    setSelectedCrop(null);
  };

  const handleMainMenu = () => {
    setShowGame(false);
    setShowLocationSelector(false);
    setSelectedCrop(null);
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    showNotification('👋 Logged out');
  };

  const handlePlantSlot = (position: number) => {
    setSelectedSlot(position);
    setShowPlantModal(true);
  };

  const handlePlantCrop = (cropType: CropType) => {
    if (gameState.currentFarm.resources.money >= costs.seed && gameState.currentFarm.resources.seeds >= 1) {
      plantCrop(cropType);
      setShowPlantModal(false);
      setSelectedSlot(null);
      showNotification(`✅ ${cropType} planted! -$${costs.seed}`);
    } else {
      showNotification('❌ Not enough money or seeds!');
    }
  };

  const handleIrrigate = () => {
    if (selectedCrop && gameState.currentFarm.resources.water >= 50) {
      irrigateCrop(selectedCrop);
      showNotification('💧 Crop irrigated! -50L');
    } else {
      showNotification('❌ Not enough water!');
    }
  };

  const handleFertilize = () => {
    if (selectedCrop && gameState.currentFarm.resources.fertilizer >= 10) {
      fertilizeCrop(selectedCrop);
      showNotification('🧪 Crop fertilized! -10kg');
    } else {
      showNotification('❌ Not enough fertilizer!');
    }
  };

  const handleHarvest = async () => {
    const crop = gameState.currentFarm.crops.find((c) => c.id === selectedCrop);
    if (selectedCrop && crop && crop.growthStage >= 90) {
      const profit = Math.round((crop.expectedYield * crop.health) / 100);
      harvestCrop(selectedCrop);
      showNotification(`🎉 Harvested! +$${profit}`);
      setSelectedCrop(null);

      // Record harvest in backend
      if (isAuthenticated) {
        try {
          await gameAPI.recordHarvest();
        } catch (error) {
          console.error('Harvest record error:', error);
        }
      }
    } else {
      showNotification('❌ Crop not ready yet!');
    }
  };

  // Display location selector
  if (showLocationSelector) {
    return <LocationSelector onSelect={handleLocationSelect} />;
  }

  // Display landing page if not started yet
  if (!showGame) {
    return <LandingPage onStart={handleStartGame} />;
  }

  // Display Game Over screen if victory or defeat
  if (gameState.gameStatus !== 'playing' && showGame) {
    return (
      <GameOver
        isVictory={gameState.gameStatus === 'won'}
        stats={{
          day: gameState.day,
          score: gameState.currentFarm.score,
          environmentalScore: gameState.currentFarm.environmentalScore,
          money: gameState.currentFarm.resources.money,
          cropsHarvested: 0, // TODO: track harvests
        }}
        onRestart={handleRestart}
        onMainMenu={handleMainMenu}
      />
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>🌍 NASA Farm Simulator</h1>
        <div className="header-stats">
          {isAuthenticated && (
            <div className="stat-item" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#1a1a1a' }}>
              <span className="stat-icon">👤</span>
              <span>{currentUser?.username}</span>
            </div>
          )}
          <div className="stat-item" style={{ background: 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)', color: '#1a1a1a' }}>
            <span className="stat-icon">💰</span>
            <span>${gameState.currentFarm.resources.money.toLocaleString()}</span>
          </div>
          <div className="stat-item" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#1a1a1a' }}>
            <span className="stat-icon">🌱</span>
            <span>{Math.round(gameState.currentFarm.environmentalScore)}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📅</span>
            <span>Day {gameState.day}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span>Score: {gameState.currentFarm.score}</span>
          </div>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => saveGame()}
                className="stat-item"
                style={{ cursor: 'pointer', border: 'none' }}
              >
                <span className="stat-icon">💾</span>
                <span>Save</span>
              </button>
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="stat-item"
                style={{ cursor: 'pointer', border: 'none' }}
              >
                <span className="stat-icon">🏆</span>
                <span>Leaderboard</span>
              </button>
              <button
                onClick={handleLogout}
                className="stat-item"
                style={{ cursor: 'pointer', border: 'none', background: 'rgba(255, 100, 100, 0.3)' }}
              >
                <span className="stat-icon">🚪</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="stat-item"
              style={{ cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)', color: '#1a1a1a' }}
            >
              <span className="stat-icon">🔐</span>
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left sidebar - Actions */}
        <aside className="sidebar">
          <h2>Actions</h2>
          <div className="action-buttons">
            <button
              className="action-btn"
              disabled={!selectedCrop || gameState.currentFarm.resources.water < 50}
              onClick={handleIrrigate}
            >
              <span>💧</span>
              Irrigate (-50L)
            </button>

            <button
              className="action-btn"
              disabled={!selectedCrop || gameState.currentFarm.resources.fertilizer < 10}
              onClick={handleFertilize}
            >
              <span>🧪</span>
              Fertilize (-10kg)
            </button>

            <button
              className="action-btn"
              disabled={
                !selectedCrop ||
                !gameState.currentFarm.crops.find(
                  (c) => c.id === selectedCrop && c.growthStage >= 90
                )
              }
              onClick={handleHarvest}
            >
              <span>✂️</span>
              Harvest
            </button>

            <button
              className="action-btn"
              onClick={() => setShowShopModal(true)}
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
            >
              <span>🛒</span>
              Buy
            </button>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#ffd700' }}>💡 How to Play</h3>
            <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', paddingLeft: '1.2rem', margin: 0 }}>
              <li>Click on an empty slot 🌱 to plant</li>
              <li>Select a plant to water/fertilize it</li>
              <li>Harvest when growth reaches 90%+</li>
              <li>Monitor NASA weather in real-time!</li>
            </ul>
          </div>
        </aside>

        {/* Central game area */}
        <main className="game-area">
          <FarmGrid
            crops={gameState.currentFarm.crops}
            onSelectCrop={setSelectedCrop}
            onPlantSlot={handlePlantSlot}
            selectedCropId={selectedCrop}
            maxSlots={gameState.currentFarm.maxSlots}
          />
        </main>

        {/* Right information panel */}
        <aside className="info-panel">
          {/* Day clock */}
          <DayClock gameDay={gameState.day} />

          <WeatherWidget
            lat={gameState.currentFarm.location.lat}
            lon={gameState.currentFarm.location.lon}
            locationName={gameState.currentFarm.location.name}
          />

          <ResourcesPanel resources={gameState.currentFarm.resources} />

          {selectedCrop && (
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '10px' }}>
              <h3 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>Selected Crop</h3>
              {(() => {
                const crop = gameState.currentFarm.crops.find((c) => c.id === selectedCrop);
                if (!crop) return null;
                return (
                  <div style={{ fontSize: '0.9rem' }}>
                    <div>Type: {crop.type}</div>
                    <div>Health: {Math.round(crop.health)}%</div>
                    <div>Growth: {crop.growthStage}%</div>
                    <div>Water: {Math.round(crop.waterLevel)}%</div>
                    <div>Fertilizer: {crop.fertilizationLevel}%</div>
                  </div>
                );
              })()}
            </div>
          )}

          {showLeaderboard && isAuthenticated ? (
            <div style={{ marginTop: '1.5rem' }}>
              <Leaderboard />
            </div>
          ) : (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(67, 233, 123, 0.2)', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#43e97b' }}>🎯 Objectives</h3>
              <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', paddingLeft: '1.2rem' }}>
                <li>Successfully grow 10 crops</li>
                <li>Reach a score of 10,000</li>
                <li>Optimize water usage</li>
                <li>Log in to save and compete</li>
              </ul>
            </div>
          )}
        </aside>
      </div>

      {/* Notifications */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '10px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease',
          fontSize: '1rem',
          fontWeight: 600,
        }}>
          {notification}
        </div>
      )}

      {/* Plant modal */}
      {showPlantModal && (
        <div className="modal-overlay" onClick={() => setShowPlantModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🌱 Choose a Crop</h2>
            <p style={{ marginBottom: '0.5rem', opacity: 0.9 }}>
              Seeds: {gameState.currentFarm.resources.seeds} | Money: ${gameState.currentFarm.resources.money}
            </p>
            <p style={{ marginBottom: '1rem', fontSize: '0.85rem', opacity: 0.7 }}>
              Cost: ${costs.seed} per seed
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {cropTypes.map((type) => {
                const data = cropData[type];
                return (
                  <button
                    key={type}
                    className="btn btn-primary"
                    onClick={() => handlePlantCrop(type)}
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '2rem', textAlign: 'center' }}>{data.emoji}</div>
                    <div style={{ fontWeight: 'bold' }}>{data.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                      💰 ${cropValues[type]} | 🌱 +{data.environmentalContribution}
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                      Speed: {'⚡'.repeat(data.growthSpeed)}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={() => setShowPlantModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shop Modal */}
      {showShopModal && (
        <div className="modal-overlay" onClick={() => setShowShopModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🛒 Shop</h2>
            <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
              Available money: ${gameState.currentFarm.resources.money}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '1rem',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>💧 Water (500L)</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>${costs.waterRefill}</div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.currentTarget.disabled = true;
                    if (gameState.currentFarm.resources.money >= costs.waterRefill) {
                      buyResource('water');
                      showNotification('💧 Water purchased! +500L');
                      setTimeout(() => { e.currentTarget.disabled = false; }, 500);
                    }
                  }}
                  disabled={gameState.currentFarm.resources.money < costs.waterRefill}
                >
                  Buy
                </button>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '1rem',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>🧪 Fertilizer (50kg)</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>${costs.fertilizerBag}</div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.currentTarget.disabled = true;
                    if (gameState.currentFarm.resources.money >= costs.fertilizerBag) {
                      buyResource('fertilizer');
                      showNotification('🧪 Fertilizer purchased! +50kg');
                      setTimeout(() => { e.currentTarget.disabled = false; }, 500);
                    }
                  }}
                  disabled={gameState.currentFarm.resources.money < costs.fertilizerBag}
                >
                  Buy
                </button>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '1rem',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>🌱 Seeds (x5)</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>$200</div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.currentTarget.disabled = true;
                    if (gameState.currentFarm.resources.money >= 200) {
                      buyResource('seeds');
                      showNotification('🌱 Seeds purchased! +5');
                      setTimeout(() => { e.currentTarget.disabled = false; }, 500);
                    }
                  }}
                  disabled={gameState.currentFarm.resources.money < 200}
                >
                  Buy
                </button>
              </div>

              {/* Slot purchase */}
              {gameState.currentFarm.maxSlots < 24 && (
                <div style={{
                  background: 'rgba(255,215,0,0.2)',
                  padding: '1rem',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '2px solid rgba(255,215,0,0.4)'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>🏗️ Expansion (+2 slots)</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                      ${costs.slotExpansion} | {gameState.currentFarm.maxSlots}/24 slots
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.currentTarget.disabled = true;
                      if (gameState.currentFarm.resources.money >= costs.slotExpansion && gameState.currentFarm.maxSlots < 24) {
                        buyResource('slot');
                        showNotification('🏗️ +2 slots! Total: ' + (gameState.currentFarm.maxSlots + 2));
                        setTimeout(() => { e.currentTarget.disabled = false; }, 500);
                      }
                    }}
                    disabled={gameState.currentFarm.resources.money < costs.slotExpansion}
                  >
                    Buy
                  </button>
                </div>
              )}
            </div>

            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={() => setShowShopModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

export default App;

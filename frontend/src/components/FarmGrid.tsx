import { useState } from 'react';
import type { Crop, CropType } from '../types/game';
import { CROP_DATA } from '../data/crops';
import '../styles/FarmGrid.css';

interface FarmGridProps {
  crops: Crop[];
  onSelectCrop: (cropId: string) => void;
  onPlantSlot: (position: number) => void;
  selectedCropId: string | null;
  maxSlots?: number;
}

export function FarmGrid({ crops, onSelectCrop, onPlantSlot, selectedCropId, maxSlots = 12 }: FarmGridProps) {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // Create slots array with crops
  const slots = Array.from({ length: maxSlots }, (_, index) => {
    const crop = crops.find(c => c.id === `slot-${index}`);
    return { position: index, crop };
  });

  const getHealthColor = (health: number) => {
    if (health > 75) return 'health-excellent';
    if (health > 50) return 'health-good';
    if (health > 25) return 'health-warning';
    return 'health-critical';
  };

  const getGrowthStage = (stage: number) => {
    if (stage < 25) return 'seedling';
    if (stage < 50) return 'growing';
    if (stage < 75) return 'maturing';
    return 'ready';
  };

  return (
    <div className="farm-grid-container">
      <div className="farm-grid-header">
        <h3>🚜 Your Farm</h3>
        <p className="farm-stats">
          {crops.length}/{maxSlots} plots planted
        </p>
      </div>

      <div className="farm-grid">
        {slots.map(({ position, crop }) => (
          <div
            key={position}
            className={`farm-slot ${crop ? 'planted' : 'empty'} ${
              selectedCropId === crop?.id ? 'selected' : ''
            } ${hoveredSlot === position ? 'hovered' : ''}`}
            onClick={() => crop ? onSelectCrop(crop.id) : onPlantSlot(position)}
            onMouseEnter={() => setHoveredSlot(position)}
            onMouseLeave={() => setHoveredSlot(null)}
          >
            {crop ? (
              <>
                {/* Crop Icon */}
                <div className={`crop-icon ${getGrowthStage(crop.growthStage)}`}>
                  {CROP_DATA[crop.type].emoji}
                </div>

                {/* Health Bar */}
                <div className={`health-bar ${getHealthColor(crop.health)}`}>
                  <div className="health-fill" style={{ width: `${crop.health}%` }} />
                </div>

                {/* Growth Progress */}
                <div className="growth-indicator">
                  <span className="growth-text">{Math.round(crop.growthStage)}%</span>
                  {crop.growthStage >= 90 && (
                    <span className="ready-badge">✓ Ready!</span>
                  )}
                </div>

                {/* Status Indicators */}
                <div className="status-indicators">
                  {crop.waterLevel < 30 && <span className="alert water-low">💧</span>}
                  {crop.fertilizationLevel < 20 && <span className="alert fertilizer-low">🧪</span>}
                  {crop.health < 40 && <span className="alert health-low">⚠️</span>}
                </div>

                {/* Tooltip with detailed info */}
                <div className="crop-tooltip">
                  <div className="tooltip-header">{CROP_DATA[crop.type].name}</div>
                  <div className="tooltip-stats">
                    <div>❤️ Health: {Math.round(crop.health)}%</div>
                    <div>🌱 Growth: {Math.round(crop.growthStage)}%</div>
                    <div>💧 Water: {Math.round(crop.waterLevel)}%</div>
                    <div>🧪 Fertilizer: {Math.round(crop.fertilizationLevel)}%</div>
                    <div>🌍 Contribution: +{CROP_DATA[crop.type].environmentalContribution}</div>
                    <div>💰 Value: ${crop.expectedYield}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-slot-content">
                <span className="plant-icon">🌱</span>
                <span className="plant-text">Plant Here</span>
              </div>
            )}

            {/* Slot Number */}
            <div className="slot-number">#{position + 1}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="farm-legend">
        <div className="legend-item">
          <span className="legend-icon health-excellent">●</span>
          <span>Excellent (75%+)</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon health-good">●</span>
          <span>Good (50-75%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon health-warning">●</span>
          <span>Warning (25-50%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon health-critical">●</span>
          <span>Critical (&lt;25%)</span>
        </div>
      </div>
    </div>
  );
}

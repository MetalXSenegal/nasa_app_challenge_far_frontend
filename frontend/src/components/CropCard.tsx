import type { Crop } from '../types/game';

interface CropCardProps {
  crop: Crop;
  onClick: () => void;
}

const cropEmojis: Record<string, string> = {
  wheat: '🌾',
  corn: '🌽',
  soybean: '🫘',
  rice: '🌾',
  tomato: '🍅',
  potato: '🥔',
};

export function CropCard({ crop, onClick }: CropCardProps) {
  const getHealthColor = (health: number) => {
    if (health > 75) return '#43e97b';
    if (health > 50) return '#f5af19';
    if (health > 25) return '#f5576c';
    return '#c94b4b';
  };

  const getGrowthStage = (stage: number) => {
    if (stage < 25) return 'Seedling';
    if (stage < 50) return 'Growing';
    if (stage < 75) return 'Maturing';
    return 'Ready to Harvest';
  };

  return (
    <div
      className="crop-card"
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${getHealthColor(crop.health)} 0%, #38f9d7 100%)`,
      }}
    >
      <div className="crop-type">{cropEmojis[crop.type] || '🌱'}</div>
      <div className="crop-info">
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {crop.type.charAt(0).toUpperCase() + crop.type.slice(1)}
        </div>
        <div style={{ fontSize: '0.85rem' }}>
          <div>{getGrowthStage(crop.growthStage)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${crop.growthStage}%` }}
            >
              {crop.growthStage}%
            </div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            Health: {Math.round(crop.health)}%
          </div>
          <div>💧 Water: {Math.round(crop.waterLevel)}%</div>
        </div>
      </div>
    </div>
  );
}

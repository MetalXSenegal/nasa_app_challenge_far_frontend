import type { Resources } from '../types/game';

interface ResourcesPanelProps {
  resources: Resources;
}

export function ResourcesPanel({ resources }: ResourcesPanelProps) {
  return (
    <div className="resources-panel">
      <h3 style={{ marginBottom: '1rem', color: '#ffd700' }}>Resources</h3>

      <div className="resource-item">
        <div className="resource-label">
          <span>💰</span>
          <span>Money</span>
        </div>
        <strong>${resources.money.toLocaleString()}</strong>
      </div>

      <div className="resource-item">
        <div className="resource-label">
          <span>💧</span>
          <span>Water</span>
        </div>
        <div style={{ flex: 1, marginLeft: '1rem' }}>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, (resources.water / 1000) * 100)}%` }}
            >
              {resources.water}L
            </div>
          </div>
        </div>
      </div>

      <div className="resource-item">
        <div className="resource-label">
          <span>🧪</span>
          <span>Fertilizer</span>
        </div>
        <strong>{resources.fertilizer} kg</strong>
      </div>

      <div className="resource-item">
        <div className="resource-label">
          <span>🌱</span>
          <span>Seeds</span>
        </div>
        <strong>{resources.seeds}</strong>
      </div>

      <div className="resource-item">
        <div className="resource-label">
          <span>🌾</span>
          <span>Food</span>
        </div>
        <strong>{resources.feed} kg</strong>
      </div>
    </div>
  );
}

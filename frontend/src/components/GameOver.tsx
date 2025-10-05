import '../styles/GameOver.css';

interface GameOverProps {
  isVictory: boolean;
  stats: {
    day: number;
    score: number;
    environmentalScore: number;
    money: number;
    cropsHarvested: number;
  };
  onRestart: () => void;
  onMainMenu: () => void;
}

export function GameOver({ isVictory, stats, onRestart, onMainMenu }: GameOverProps) {
  return (
    <div className="gameover-overlay">
      <div className="gameover-container">
        {isVictory ? (
          <>
            <div className="victory-icon">🎉</div>
            <h1 className="gameover-title victory">MISSION ACCOMPLISHED!</h1>
            <p className="gameover-subtitle">
              You have transformed {stats.environmentalScore}% of the area into a green environment!
            </p>

            <div className="victory-message">
              <p>🌍 The area is now a thriving ecosystem!</p>
              <p>Thanks to your sustainable management, biodiversity is restored.</p>
            </div>
          </>
        ) : (
          <>
            <div className="defeat-icon">💀</div>
            <h1 className="gameover-title defeat">MISSION FAILED</h1>
            <p className="gameover-subtitle">
              Your environmental restoration project could not be sustained...
            </p>

            <div className="defeat-message">
              <p>⚠️ Without resources or plants, the project collapses.</p>
              <p>The area remains barren and inhospitable.</p>
            </div>
          </>
        )}

        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-value">{stats.day}</div>
            <div className="stat-label">Days Survived</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{Math.round(stats.environmentalScore)}%</div>
            <div className="stat-label">Environmental Score</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{stats.score}</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">${stats.money}</div>
            <div className="stat-label">Final Money</div>
          </div>
        </div>

        <div className="gameover-actions">
          <button className="btn-restart" onClick={onRestart}>
            🔄 New Mission
          </button>
          <button className="btn-menu" onClick={onMainMenu}>
            🏠 Main Menu
          </button>
        </div>

        {isVictory && (
          <div className="achievement-badge">
            <div className="badge-icon">🏆</div>
            <div className="badge-text">Expert Terraformer</div>
          </div>
        )}
      </div>
    </div>
  );
}

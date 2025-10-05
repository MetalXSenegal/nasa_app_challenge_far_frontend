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
            <h1 className="gameover-title victory">MISSION ACCOMPLIE!</h1>
            <p className="gameover-subtitle">
              Vous avez transformé {stats.environmentalScore}% de la zone en environnement vert!
            </p>

            <div className="victory-message">
              <p>🌍 La zone est maintenant un écosystème florissant!</p>
              <p>Grâce à votre gestion durable, la biodiversité est restaurée.</p>
            </div>
          </>
        ) : (
          <>
            <div className="defeat-icon">💀</div>
            <h1 className="gameover-title defeat">MISSION ÉCHOUÉE</h1>
            <p className="gameover-subtitle">
              Votre projet de restauration environnementale n'a pas pu être maintenu...
            </p>

            <div className="defeat-message">
              <p>⚠️ Sans ressources ni plantes, le projet s'effondre.</p>
              <p>La zone reste désertique et inhospitalière.</p>
            </div>
          </>
        )}

        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-value">{stats.day}</div>
            <div className="stat-label">Jours survécus</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{Math.round(stats.environmentalScore)}%</div>
            <div className="stat-label">Score Environnemental</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{stats.score}</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">${stats.money}</div>
            <div className="stat-label">Argent final</div>
          </div>
        </div>

        <div className="gameover-actions">
          <button className="btn-restart" onClick={onRestart}>
            🔄 Nouvelle Mission
          </button>
          <button className="btn-menu" onClick={onMainMenu}>
            🏠 Menu Principal
          </button>
        </div>

        {isVictory && (
          <div className="achievement-badge">
            <div className="badge-icon">🏆</div>
            <div className="badge-text">Terraformeur Expert</div>
          </div>
        )}
      </div>
    </div>
  );
}

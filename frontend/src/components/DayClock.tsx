import { useEffect, useState } from 'react';
import '../styles/DayClock.css';

interface DayClockProps {
  gameDay: number;
}

export function DayClock({ gameDay }: DayClockProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset à 0 au début de chaque jour
    setProgress(0);

    // Animer sur 30 secondes (1 jour de jeu)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / 30); // 100% en 30 secondes
      });
    }, 1000); // Update chaque seconde

    return () => clearInterval(interval);
  }, [gameDay]);

  // Calculer l'heure de la journée (0-24h)
  const currentHour = Math.floor((progress / 100) * 24);
  const isNight = currentHour < 6 || currentHour >= 18;

  return (
    <div className="day-clock-container">
      <div className="day-clock">
        {/* Cercle de progression */}
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Fond */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          {/* Progression */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={isNight ? '#667eea' : '#ffd700'}
            strokeWidth="8"
            strokeDasharray={`${(progress / 100) * 314} 314`}
            strokeDashoffset="0"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 1s linear' }}
          />
        </svg>

        {/* Contenu central */}
        <div className="clock-content">
          <div className="clock-icon">{isNight ? '🌙' : '☀️'}</div>
          <div className="clock-hour">{currentHour}:00</div>
          <div className="clock-label">Day {gameDay}</div>
        </div>
      </div>
    </div>
  );
}

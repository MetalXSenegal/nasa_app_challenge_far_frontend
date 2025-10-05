import { useEffect, useState } from 'react';
import { leaderboardAPI, type LeaderboardEntry, type RankData } from '../services/api';
import { authAPI } from '../services/api';

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<RankData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topPlayers, rank] = await Promise.all([
          leaderboardAPI.getTop(10),
          authAPI.isAuthenticated() ? leaderboardAPI.getMyRank() : Promise.resolve(null),
        ]);

        setLeaderboard(topPlayers);
        setMyRank(rank);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1rem', color: '#ffd700' }}>🏆 Leaderboard</h3>

      {myRank && (
        <div
          style={{
            background: 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1rem',
            color: '#1a1a1a',
            fontWeight: 'bold',
          }}
        >
          <div>Your rank: #{myRank.rank}</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Score: {myRank.high_score} | Harvests: {myRank.total_harvests}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {leaderboard.map((entry, index) => (
          <div
            key={index}
            style={{
              background:
                index === 0
                  ? 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)'
                  : index === 1
                  ? 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)'
                  : index === 2
                  ? 'linear-gradient(135deg, #cd7f32 0%, #b8732d 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
              padding: '0.75rem',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: index < 3 ? '#1a1a1a' : 'white',
              fontWeight: index < 3 ? 'bold' : 'normal',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.2rem', minWidth: '1.5rem' }}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <span>{entry.username}</span>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
              <div>{entry.high_score.toLocaleString()} pts</div>
              <div style={{ opacity: 0.8 }}>🌾 {entry.total_harvests} harvests</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

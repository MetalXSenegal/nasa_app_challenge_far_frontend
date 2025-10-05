import { useState } from 'react';
import { authAPI, type RegisterData, type LoginData } from '../services/api';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const data: LoginData = { username, password };
        await authAPI.login(data);
      } else {
        const data: RegisterData = { username, email, password };
        await authAPI.register(data);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isLogin ? '🔐 Login' : '📝 Sign Up'}</h2>

        {error && (
          <div
            style={{
              background: 'rgba(255, 100, 100, 0.2)',
              border: '1px solid rgba(255, 100, 100, 0.5)',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              color: '#ffcccc',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
              }}
            />

            {!isLogin && (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem',
                }}
              />
            )}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
              }}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : "Sign Up"}
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            opacity: 0.8,
          }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffd700',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.9rem',
            }}
          >
            {isLogin ? "Sign Up" : 'Login'}
          </button>
        </div>

        <div className="modal-buttons">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { AuthModal } from './AuthModal';
import '../styles/LandingPage.css';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    onStart();
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="nasa-logo">
          <div className="nasa-text">NASA</div>
          <div className="nasa-subtitle">Space Apps Challenge 2024</div>
        </div>

        <h1 className="hero-title">
          <span className="gradient-text">Farm Simulator</span>
        </h1>

        <p className="hero-description">
          Master sustainable agriculture using real NASA satellite data and climate insights.
          <br />
          Learn how space technology helps farmers optimize their crops.
        </p>

        <button className="cta-button" onClick={() => setShowAuthModal(true)}>
          <span>🚀</span>
          Start Your Farm Journey
        </button>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="stat-number">24h</div>
            <div className="stat-label">Hackathon</div>
          </div>
          <div className="hero-stat">
            <div className="stat-number">Real</div>
            <div className="stat-label">NASA Data</div>
          </div>
          <div className="hero-stat">
            <div className="stat-number">Learn</div>
            <div className="stat-label">& Play</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">How It Works</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Plant Crops</h3>
            <p>
              Choose from wheat, corn, soybeans, rice, tomatoes, and potatoes.
              Each crop has different requirements and yields.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛰️</div>
            <h3>NASA Satellite Data</h3>
            <p>
              Use real-time weather data, temperature maps, and soil moisture
              from NASA's Meteomatics API to optimize your farming decisions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💧</div>
            <h3>Manage Resources</h3>
            <p>
              Balance water, fertilizer, and budget. Weather conditions impact
              your crops - adapt your strategy for maximum yield.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track & Optimize</h3>
            <p>
              Monitor crop health, growth stages, and soil conditions.
              Make data-driven decisions to maximize your harvest.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Compete</h3>
            <p>
              Climb the leaderboard by achieving the highest score.
              Save your progress and compare with other farmers.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Learn Sustainability</h3>
            <p>
              Discover how satellite technology and climate data enable
              sustainable farming practices for our planet's future.
            </p>
          </div>
        </div>
      </section>

      {/* Game Mechanics */}
      <section className="mechanics">
        <h2 className="section-title">Game Mechanics</h2>

        <div className="mechanics-content">
          <div className="mechanic-item">
            <div className="mechanic-number">1</div>
            <div className="mechanic-text">
              <h4>Plant Seeds</h4>
              <p>Start with $5,000. Each seed costs $100. Choose wisely based on weather forecasts.</p>
            </div>
          </div>

          <div className="mechanic-item">
            <div className="mechanic-number">2</div>
            <div className="mechanic-text">
              <h4>Monitor Conditions</h4>
              <p>Watch the NASA satellite view for temperature and precipitation. Check soil moisture levels.</p>
            </div>
          </div>

          <div className="mechanic-item">
            <div className="mechanic-number">3</div>
            <div className="mechanic-text">
              <h4>Water & Fertilize</h4>
              <p>Crops consume water (-8%/turn) and fertilizer (-2%/turn). Irrigate before levels drop below 30%.</p>
            </div>
          </div>

          <div className="mechanic-item">
            <div className="mechanic-number">4</div>
            <div className="mechanic-text">
              <h4>Harvest & Profit</h4>
              <p>Harvest at 90%+ growth. Higher health = better yield. Earn $150-$250 per crop based on type and health.</p>
            </div>
          </div>
        </div>

        <div className="tips-box">
          <h4>💡 Pro Tips</h4>
          <ul>
            <li>Rain automatically waters crops - save your water budget!</li>
            <li>Extreme temperatures (&gt;30°C or &lt;10°C) damage crops</li>
            <li>Healthy crops (80%+ health, 50%+ growth) earn bonus points</li>
            <li>Buy resources in the shop when you're running low</li>
            <li>Auto-save happens every 30 seconds when logged in</li>
          </ul>
        </div>
      </section>

      {/* NASA Theme Section */}
      <section className="nasa-impact">
        <h2 className="section-title">Powered by NASA Technology</h2>
        <div className="impact-grid">
          <div className="impact-card">
            <h4>🛰️ Meteomatics API</h4>
            <p>Real-time weather data including temperature, precipitation, humidity, wind speed, and soil moisture.</p>
          </div>
          <div className="impact-card">
            <h4>🌡️ Climate Monitoring</h4>
            <p>Satellite imagery helps farmers predict weather patterns and optimize irrigation schedules.</p>
          </div>
          <div className="impact-card">
            <h4>🌾 Sustainable Farming</h4>
            <p>Learn how data-driven agriculture reduces water waste and maximizes crop yields.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <h2>Ready to Become a Data-Driven Farmer?</h2>
        <p>Join the challenge and see how NASA technology revolutionizes agriculture!</p>
        <button className="cta-button large" onClick={() => setShowAuthModal(true)}>
          <span>🚀</span>
          Get Started Now
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Created for NASA Space Apps Challenge 2024 | 24-Hour Hackathon</p>
        <p>Using real NASA satellite data from Meteomatics API</p>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

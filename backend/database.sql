-- Création de la base de données
CREATE DATABASE nasa_farm;

-- Se connecter à la base de données
\c nasa_farm;

-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Table des parties sauvegardées
CREATE TABLE game_saves (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_state JSONB NOT NULL,
    score INTEGER DEFAULT 0,
    day INTEGER DEFAULT 1,
    money INTEGER DEFAULT 5000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table du leaderboard
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    high_score INTEGER DEFAULT 0,
    total_harvests INTEGER DEFAULT 0,
    best_day INTEGER DEFAULT 1,
    achievements JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_game_saves_user_id ON game_saves(user_id);
CREATE INDEX idx_leaderboard_score ON leaderboard(high_score DESC);
CREATE INDEX idx_users_username ON users(username);

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour auto-update des timestamps
CREATE TRIGGER update_game_saves_updated_at BEFORE UPDATE ON game_saves
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données de test (optionnel)
INSERT INTO users (username, email, password_hash) VALUES
    ('demo_user', 'demo@nasa-farm.com', '$2b$10$demo_hash_here');

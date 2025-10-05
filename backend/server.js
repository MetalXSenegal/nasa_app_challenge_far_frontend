const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// ==================== ROUTES AUTH ====================

// Inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Vérifier si l'utilisateur existe
    const userExists = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Utilisateur ou email déjà existant' });
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, passwordHash]
    );

    // Créer une entrée leaderboard
    await pool.query(
      'INSERT INTO leaderboard (user_id, username, high_score) VALUES ($1, $2, 0)',
      [newUser.rows[0].id, username]
    );

    // Générer token
    const token = jwt.sign(
      { id: newUser.rows[0].id, username: newUser.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username et password requis' });
    }

    // Trouver l'utilisateur
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Mettre à jour last_login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [
      user.rows[0].id,
    ]);

    // Générer token
    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==================== ROUTES GAME ====================

// Sauvegarder la partie
app.post('/api/game/save', authenticateToken, async (req, res) => {
  try {
    const { gameState } = req.body;
    const userId = req.user.id;

    // Extraire les stats importantes
    const score = gameState.currentFarm.score || 0;
    const day = gameState.day || 1;
    const money = gameState.currentFarm.resources.money || 0;

    // Vérifier si une sauvegarde existe
    const existingSave = await pool.query(
      'SELECT id FROM game_saves WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );

    let result;
    if (existingSave.rows.length > 0) {
      // Update
      result = await pool.query(
        'UPDATE game_saves SET game_state = $1, score = $2, day = $3, money = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
        [JSON.stringify(gameState), score, day, money, existingSave.rows[0].id]
      );
    } else {
      // Insert
      result = await pool.query(
        'INSERT INTO game_saves (user_id, game_state, score, day, money) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, JSON.stringify(gameState), score, day, money]
      );
    }

    // Mettre à jour le leaderboard
    await pool.query(
      `INSERT INTO leaderboard (user_id, username, high_score, best_day)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         high_score = GREATEST(leaderboard.high_score, $3),
         best_day = GREATEST(leaderboard.best_day, $4),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, req.user.username, score, day]
    );

    res.json({
      message: 'Partie sauvegardée',
      save: result.rows[0],
    });
  } catch (error) {
    console.error('Error in save:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

// Charger la partie
app.get('/api/game/load', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM game_saves WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune sauvegarde trouvée' });
    }

    res.json({
      message: 'Partie chargée',
      gameState: result.rows[0].game_state,
      savedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error('Error in load:', error);
    res.status(500).json({ error: 'Erreur lors du chargement' });
  }
});

// Incrémenter le compteur de récoltes
app.post('/api/game/harvest', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `UPDATE leaderboard
       SET total_harvests = total_harvests + 1
       WHERE user_id = $1`,
      [userId]
    );

    res.json({ message: 'Récolte enregistrée' });
  } catch (error) {
    console.error('Error in harvest:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==================== ROUTES LEADERBOARD ====================

// Obtenir le leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const result = await pool.query(
      `SELECT
         username,
         high_score,
         total_harvests,
         best_day,
         updated_at
       FROM leaderboard
       ORDER BY high_score DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      leaderboard: result.rows,
    });
  } catch (error) {
    console.error('Error in leaderboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir le rang de l'utilisateur
app.get('/api/leaderboard/rank', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         rank,
         username,
         high_score,
         total_harvests,
         best_day
       FROM (
         SELECT
           user_id,
           username,
           high_score,
           total_harvests,
           best_day,
           ROW_NUMBER() OVER (ORDER BY high_score DESC) as rank
         FROM leaderboard
       ) ranked
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé dans le leaderboard' });
    }

    res.json({
      rank: result.rows[0],
    });
  } catch (error) {
    console.error('Error in rank:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'NASA Farm API is running' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

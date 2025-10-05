# NASA Farm Simulator - Backend API

Backend Node.js avec PostgreSQL pour le jeu NASA Farm Simulator.

## 🚀 Installation

### Option 1 : Avec Docker (Recommandé) 🐳

1. **Installer Docker Desktop**:
   - https://docs.docker.com/desktop/

2. **Démarrer PostgreSQL**:
   ```bash
   docker-compose up -d
   ```

   C'est tout ! La base de données est automatiquement créée.

   Voir le guide complet: **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)**

### Option 2 : Installation locale

1. **Installer PostgreSQL**:
   - https://www.postgresql.org/download/
   - User: `postgres`, Password: `postgres`

2. **Créer la base de données**:
   ```bash
   psql -U postgres
   CREATE DATABASE nasa_farm;
   \c nasa_farm
   # Copier-coller database.sql
   ```

   Voir le guide complet: **[START_GUIDE.md](./START_GUIDE.md)**

---

3. **Installer les dépendances**:
   ```bash
   npm install
   ```

4. **Configurer les variables d'environnement**:
   - Le fichier `.env` est déjà créé avec les valeurs par défaut
   - Modifier si nécessaire

5. **Démarrer le serveur**:
   ```bash
   # Mode développement (avec auto-reload)
   npm run dev

   # Mode production
   npm start
   ```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Game
- `POST /api/game/save` - Sauvegarder la partie (auth requis)
- `GET /api/game/load` - Charger la partie (auth requis)
- `POST /api/game/harvest` - Enregistrer une récolte (auth requis)

### Leaderboard
- `GET /api/leaderboard?limit=10` - Obtenir le classement
- `GET /api/leaderboard/rank` - Obtenir son rang (auth requis)

### Health
- `GET /health` - Vérifier l'état du serveur

## 🗄️ Structure de la base de données

- **users** : Utilisateurs du jeu
- **game_saves** : Sauvegardes des parties
- **leaderboard** : Classement des joueurs

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

Header à inclure pour les routes protégées:
```
Authorization: Bearer <token>
```

## 🎮 Exemple d'utilisation

```javascript
// Inscription
const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'player1',
    email: 'player1@example.com',
    password: 'password123'
  })
});

const { token } = await response.json();

// Sauvegarder la partie
await fetch('http://localhost:3001/api/game/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ gameState: {...} })
});
```

## 🛠️ Technologies

- **Node.js** + **Express** - Server
- **PostgreSQL** - Base de données
- **bcrypt** - Hash des mots de passe
- **jsonwebtoken** - Authentification JWT
- **pg** - Client PostgreSQL

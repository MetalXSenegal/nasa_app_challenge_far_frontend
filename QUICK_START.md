# 🚀 Quick Start Guide

## 🎯 Installation Rapide (2 minutes avec Docker)

### Méthode 1: Avec Docker (Recommandé - Le plus rapide)

```bash
# 1. Installer les dépendances
npm run install:all

# 2. Lancer PostgreSQL avec Docker
docker-compose up -d

# 3. Configurer les variables d'environnement
# Créer/modifier backend/.env avec les valeurs ci-dessous

# 4. Lancer l'application
npm run dev
```

**Configurer `backend/.env` pour Docker:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_farm
DB_USER=postgres
DB_PASSWORD=postgres

PORT=5000
JWT_SECRET=votre_secret_jwt

METEOMATICS_USERNAME=cisse_mouhamadoudiouf
METEOMATICS_PASSWORD=NwA5649eqTKWWdlFBlyd
```

✅ **Services disponibles:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- pgAdmin: http://localhost:5050 (admin@nasa-farm.com / admin)

---

### Méthode 2: Sans Docker (Installation manuelle)

```bash
# 1. Installer les dépendances
npm run install:all

# 2. Créer la base de données PostgreSQL
psql -U postgres -c "CREATE DATABASE nasa_farm;"

# 3. Exécuter la migration
psql -U postgres -d nasa_farm -f backend/database.sql

# 4. Configurer backend/.env avec vos credentials PostgreSQL

# 5. Lancer l'application
npm run dev
```

**Configurer `backend/.env` (installation manuelle):**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_farm
DB_USER=votre_user_postgres
DB_PASSWORD=votre_mot_de_passe

PORT=5000
JWT_SECRET=votre_secret_jwt

METEOMATICS_USERNAME=cisse_mouhamadoudiouf
METEOMATICS_PASSWORD=NwA5649eqTKWWdlFBlyd
```

✅ Frontend: http://localhost:5173
✅ Backend: http://localhost:5000

---

## Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run install:all` | Installe toutes les dépendances |
| `npm run dev` | Lance frontend + backend |
| `npm run dev:frontend` | Lance uniquement le frontend |
| `npm run dev:backend` | Lance uniquement le backend |
| `npm run build` | Build le frontend pour production |
| `npm start` | Lance en mode production |

---

## Problèmes Courants

### Port déjà utilisé
```bash
npx kill-port 5000  # Backend
npx kill-port 5173  # Frontend
```

### Erreur de connexion DB
```bash
# Vérifier que PostgreSQL tourne
pg_ctl status

# Redémarrer PostgreSQL
pg_ctl restart
```

### Module manquant
```bash
npm run install:all
```

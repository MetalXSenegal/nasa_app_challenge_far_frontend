# 🌍 NASA Environmental Restoration Game

> **NASA Space Apps Challenge 2024** - Interactive environmental restoration game using real-time satellite data from Meteomatics API

## 🎯 Project Description

**NASA Environmental Restoration Game** is an innovative educational game that combines real-time satellite data with interactive gameplay to raise awareness about environmental restoration. Players take on the role of environmental managers tasked with restoring degraded lands across different global locations.

The game leverages **real NASA satellite data** through the Meteomatics API to provide authentic weather conditions, soil moisture levels, and environmental parameters. This creates a realistic simulation where players must adapt their strategies based on actual climate patterns and environmental challenges.

### Key Objectives:
- 🌱 **Restore Degraded Ecosystems**: Plant crops and vegetation adapted to local climates
- 📊 **Monitor Real Data**: Use live satellite imagery and weather data for decision-making
- 🎓 **Learn Through Play**: Understand the complexity of environmental restoration
- 🌍 **Global Perspective**: Experience diverse climates from arid deserts to tropical regions
- 🏆 **Compete & Collaborate**: Share achievements and compete on global leaderboards

Experience the challenge of environmental restoration through gamification! Monitor real-time weather conditions, manage resources, and restore degraded lands using actual NASA satellite data.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

## ✨ Features

- 🛰️ **Real-time Satellite Data**: Live weather and environmental data from Meteomatics API
- 🌱 **Interactive Farming Simulation**: Plant crops, manage resources, and watch your farm grow
- 🗺️ **Multiple Locations**: Choose from various global locations with different climates
- 📊 **Real-time Weather**: Temperature, humidity, precipitation, soil moisture tracking
- 🏆 **Leaderboard System**: Compete with other players
- 💾 **Save/Load Game**: Persistent game states with PostgreSQL
- 🔐 **User Authentication**: Secure login and registration system

## 🛠 Tech Stack

### Frontend
- React 19 with TypeScript
- Vite (Rolldown) for ultra-fast builds
- Axios for API calls
- Framer Motion for animations
- Recharts for data visualization
- Leaflet for interactive maps

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing
- CORS enabled

### External APIs
- Meteomatics API (weather & satellite data)
- NASA Earth Observation data

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/MetalXSenegal/nasa_app_challenge_far_frontend.git
cd nasa_app
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm run install:all
```

Or manually install each:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

## 🗄️ Database Setup

You have **two options** to set up the PostgreSQL database:

### Option 1: Using Docker Compose (Recommended - Easiest) 🐳

This method automatically sets up PostgreSQL with all required configurations:

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Verify database is running
docker-compose ps
```

This will:
- ✅ Create PostgreSQL database automatically
- ✅ Run migration scripts on startup
- ✅ Set up pgAdmin (optional) at http://localhost:5050
- ✅ Persist data in Docker volumes

**pgAdmin Access** (optional):
- URL: http://localhost:5050
- Email: admin@nasa-farm.com
- Password: admin

To connect to the database in pgAdmin:
- Host: postgres
- Port: 5432
- Database: nasa_farm
- Username: postgres
- Password: postgres

**Update your `backend/.env`** for Docker:
```env
DB_HOST=localhost  # or 'postgres' if running backend in Docker
DB_PORT=5432
DB_NAME=nasa_farm
DB_USER=postgres
DB_PASSWORD=postgres

PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

METEOMATICS_USERNAME=your_meteomatics_username
METEOMATICS_PASSWORD=your_meteomatics_password
```

### Option 2: Manual PostgreSQL Installation

If you prefer installing PostgreSQL directly on your machine:

#### 1. Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE nasa_farm;

# Exit psql
\q
```

#### 2. Configure Database Connection

Edit `backend/.env` file with your PostgreSQL credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_farm
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (change this in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# API Keys
METEOMATICS_USERNAME=your_meteomatics_username
METEOMATICS_PASSWORD=your_meteomatics_password
```

#### 3. Run Database Migration

Execute the SQL migration script to create all necessary tables:

```bash
# Using psql directly
psql -U your_postgres_username -d nasa_farm -f backend/database.sql
```

The migration will create:
- `users` table - User accounts
- `game_saves` table - Game state persistence
- `leaderboard` table - High scores and achievements
- Necessary indexes and triggers

#### 4. Verify Database Setup

```bash
# Check if tables were created
psql -U your_postgres_username -d nasa_farm -c "\dt"
```

You should see: `users`, `game_saves`, and `leaderboard` tables.

## ▶️ Running the Application

### 🚀 Complete Launch Guide

#### Method 1: Quick Start (All-in-One) - Recommended

This method launches everything you need with a single command:

```bash
# 1. Start database (if using Docker)
docker-compose up -d

# 2. Launch frontend + backend concurrently
npm run dev
```

This will start:
- **PostgreSQL Database**: localhost:5432
- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:5173
- **pgAdmin** (optional): http://localhost:5050

#### Method 2: Run Services Separately

If you prefer more control over each service:

```bash
# Terminal 1 - Database (Docker)
docker-compose up -d

# Terminal 2 - Backend API
npm run dev:backend
# or: cd backend && npm run dev

# Terminal 3 - Frontend
npm run dev:frontend
# or: cd frontend && npm run dev
```

#### Method 3: Production Build

For production deployment:

```bash
# Build frontend for production
npm run build

# Start both services in production mode
npm start
```

### 📊 Service URLs

Once running, access the application at:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main game interface |
| **Backend API** | http://localhost:5000 | REST API server |
| **PostgreSQL** | localhost:5432 | Database (use pgAdmin or psql) |
| **pgAdmin** | http://localhost:5050 | Database management UI |

### 🎮 First Time Setup Checklist

- [ ] Clone repository
- [ ] Run `npm run install:all`
- [ ] Start database: `docker-compose up -d`
- [ ] Configure `backend/.env` with credentials
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Create account and start playing!

## 📁 Project Structure

```
nasa_app/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── AuthModal.tsx   # Login/Register modal
│   │   │   ├── FarmGrid.tsx    # Interactive farm grid
│   │   │   ├── LandingPage.tsx # Game landing page
│   │   │   ├── LocationSelector.tsx # Location chooser
│   │   │   └── WeatherWidget.tsx # Real-time weather display
│   │   ├── data/               # Static data files
│   │   │   └── locations.ts    # Available farm locations
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── useGameState.ts # Game state management
│   │   ├── services/           # API services
│   │   │   └── meteomatics.ts  # Meteomatics API client
│   │   ├── styles/             # CSS stylesheets
│   │   ├── types/              # TypeScript type definitions
│   │   │   └── game.ts         # Game-related types
│   │   ├── App.tsx             # Main application component
│   │   └── main.tsx            # Application entry point
│   ├── public/                 # Static assets
│   ├── index.html              # HTML template
│   ├── package.json            # Frontend dependencies
│   └── vite.config.ts          # Vite configuration
│
├── backend/                     # Node.js backend server
│   ├── server.js               # Express server & API routes
│   ├── db.js                   # PostgreSQL connection pool
│   ├── database.sql            # Database migration script
│   ├── package.json            # Backend dependencies
│   ├── .env                    # Environment variables (create this!)
│   └── README.md               # Backend documentation
│
├── .gitignore                  # Git ignore rules
├── package.json                # Root package.json (monorepo scripts)
└── README.md                   # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires auth)

### Game
- `POST /api/game/save` - Save game state
- `GET /api/game/load/:userId` - Load game state
- `GET /api/game/saves/:userId` - Get all saves

### Leaderboard
- `GET /api/leaderboard` - Get top players
- `POST /api/leaderboard/update` - Update player score

### Weather (Meteomatics)
- Real-time weather data
- Satellite imagery
- Soil moisture levels
- 7-day forecasts

## 🌍 Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_farm
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret_key

# External APIs
METEOMATICS_USERNAME=your_username
METEOMATICS_PASSWORD=your_password
```

### Frontend (optional)

Create `frontend/.env` if you need to override API URLs:

```env
VITE_API_URL=http://localhost:5000
```

## 🎮 How to Play

1. **Register/Login**: Create an account or login
2. **Choose Location**: Select a location with your preferred climate and difficulty
3. **Monitor Weather**: Check real-time satellite data and weather conditions
4. **Plant Crops**: Use your resources to plant and grow crops
5. **Manage Resources**: Balance water, nutrients, and budget
6. **Harvest**: Collect your harvest and earn points
7. **Compete**: Climb the leaderboard!

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_ctl status

# Restart PostgreSQL if needed
pg_ctl restart
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

## 📝 Contributing

This project was created for the NASA Space Apps Challenge 2024. Contributions are welcome!

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- **NASA** for inspiring this project
- **Meteomatics** for providing satellite and weather data API
- **Space Apps Challenge** community

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Built with ❤️ for NASA Space Apps Challenge 2024**

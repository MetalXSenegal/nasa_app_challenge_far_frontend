import axios from 'axios';
import type { GameState } from '../types/game';

const API_URL = 'http://localhost:3001/api';

// Instance axios avec config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== AUTH ====================

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// ==================== GAME ====================

export const gameAPI = {
  save: async (gameState: GameState) => {
    const response = await api.post('/game/save', { gameState });
    return response.data;
  },

  load: async (): Promise<{ gameState: GameState; savedAt: string }> => {
    const response = await api.get('/game/load');
    return response.data;
  },

  recordHarvest: async () => {
    const response = await api.post('/game/harvest');
    return response.data;
  },
};

// ==================== LEADERBOARD ====================

export interface LeaderboardEntry {
  username: string;
  high_score: number;
  total_harvests: number;
  best_day: number;
  updated_at: string;
}

export interface RankData {
  rank: number;
  username: string;
  high_score: number;
  total_harvests: number;
  best_day: number;
}

export const leaderboardAPI = {
  getTop: async (limit: number = 10): Promise<LeaderboardEntry[]> => {
    const response = await api.get(`/leaderboard?limit=${limit}`);
    return response.data.leaderboard;
  },

  getMyRank: async (): Promise<RankData> => {
    const response = await api.get('/leaderboard/rank');
    return response.data.rank;
  },
};

export default api;

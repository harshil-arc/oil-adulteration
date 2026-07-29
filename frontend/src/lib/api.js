import axios from 'axios';
import { getBackendUrl } from './utils';
import { supabase } from './supabase';

const BASE_URL = getBackendUrl();

const api = axios.create({ 
  baseURL: BASE_URL,
  headers: {
    'x-device-api-key': 'dev_secret_key_123'
  }
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const postSensorData = (payload) => api.post('/api/ingest-reading', payload);
export const getHistory = (params) => api.get('/api/history', { params });
export const getAlerts = (params) => api.get('/api/alerts', { params });
export const getDevices = () => api.get('/api/devices');
export const analyzeOil = (payload) => api.post('/api/data/analyze', payload);
export const getNetworkInfo = () => api.get('/api/network');
export const getShops = () => api.get('/api/shops');
export const getComplaints = () => api.get('/api/complaints');
export const submitComplaint = (payload) => api.post('/api/complaints', payload);
export const verifyComplaint = (id) => api.patch(`/api/complaints/${id}/verify`);
export const rejectComplaint = (id) => api.patch(`/api/complaints/${id}/reject`);

// ── AI Meal Planner & Recipe Recommendation Engine Endpoints ──
export const suggestRecipesApi = (payload) => api.post('/api/recipes/suggest', payload);
export const getMealRecommendations = (payload) => api.post('/api/meal-planner/recommend', payload);
export const getDishesCatalog = (params) => api.get('/api/meal-planner/dishes', { params });
export const generateMealPlan = (payload) => api.post('/api/meal-planner/generate-plan', payload);
export const scanPantryVision = (formData) => api.post('/api/meal-planner/pantry-scan', formData);
export const generateShoppingList = (payload) => api.post('/api/meal-planner/shopping-list', payload);
export const getMealPlannerStats = () => api.get('/api/meal-planner/stats');

// ── Master Ingredient Database Endpoints ──
export const getMasterIngredients = () => api.get('/api/meal-planner/master-ingredients');
export const searchIngredients = (params) => api.get('/api/meal-planner/search-ingredients', { params });
export const validateIngredient = (payload) => api.post('/api/meal-planner/validate-ingredient', payload);
export const getIngredientPairings = (params) => api.get('/api/meal-planner/pairings', { params });

export default api;

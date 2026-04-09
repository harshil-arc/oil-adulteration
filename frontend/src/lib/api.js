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

export default api;

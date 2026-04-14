import { getConfig } from './config';

/**
 * Detects if the app is running in a production environment (like Vercel)
 * where it is served over HTTPS and not on localhost.
 */
export const isProductionEnvironment = () => {
  return typeof window !== 'undefined' && 
         window.location.protocol === 'https:' && 
         window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
};

/**
 * A safe wrapper around fetch for local network devices to prevent 
 * ugly mixed-content browser errors and provide helpful UI feedback.
 */
export const safeLocalFetch = async (url, options = {}) => {
  // 1. Detect Environment & Block Mixed Content Early
  if (isProductionEnvironment() && url.startsWith('http://')) {
    throw new Error('Mixed content blocked: Local device access only works on same network. Please run app locally.');
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (error.message.includes('Mixed content blocked')) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw new Error(`Timeout connecting to ${url}`);
    }
    // "Failed to fetch" usually means it can't reach the local IP
    if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      throw new Error('Device not reachable. Use local mode for ESP connection.');
    }
    throw error;
  }
};

/**
 * Standard function to get data based on current config (Simulator or ESP)
 */
export const getSensorData = async (customUrl = null, signal = null) => {
  const config = getConfig();
  let url = customUrl || (config.USE_SIMULATOR ? config.SIMULATOR_URL : config.ESP_URL);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout
    const fetchSignal = signal || controller.signal;

    // Use our safe fetch wrapper
    const response = await safeLocalFetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: fetchSignal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    // Validate expected structure based on simulation requirements
    if (typeof data.temperature === 'undefined' || typeof data.density === 'undefined' || typeof data.wavelength === 'undefined') {
      console.warn("Sensor JSON might be missing keys, received:", data);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

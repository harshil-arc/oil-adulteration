import { getConfig } from './config';

export const getSensorData = async () => {
  const config = getConfig();
  const url = config.USE_SIMULATOR ? config.SIMULATOR_URL : config.ESP_URL;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate expected structure based on simulation requirements
    if (typeof data.temperature === 'undefined' || typeof data.density === 'undefined' || typeof data.wavelength === 'undefined') {
      throw new Error("Invalid JSON structure from sensor.");
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Timeout connecting to ${url}`);
    }
    throw new Error(error.message || "Network request failed");
  }
};

export const getConfig = () => ({
  USE_SIMULATOR: localStorage.getItem('USE_SIMULATOR') === 'true',
  SIMULATOR_URL: localStorage.getItem('SIMULATOR_URL') || 'http://192.168.1.100:3000/data',
  ESP_URL: localStorage.getItem('ESP_URL') || 'http://192.168.4.1/data',
});

export const updateConfig = (key, value) => {
  localStorage.setItem(key, value);
};

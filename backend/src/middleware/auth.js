const validateDeviceApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // Use env key or default fallback for simulated testing
  const validKey = process.env.DEVICE_API_KEY || 'dev_secret_key_123';

  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  
  next();
};

module.exports = { validateDeviceApiKey };

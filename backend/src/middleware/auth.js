const supabase = require('../supabaseClient');

const validateDeviceApiKey = (req, res, next) => {
  const apiKey = req.headers['x-device-api-key'];
  
  // Use env key or default fallback for simulated testing
  const validKey = process.env.DEVICE_API_KEY || 'dev_secret_key_123';

  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing Device API key' });
  }
  
  next();
};

const validateUserSession = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Session validation error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

module.exports = { validateDeviceApiKey, validateUserSession };

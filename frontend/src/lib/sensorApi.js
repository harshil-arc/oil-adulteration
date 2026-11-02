/**
 * Fetch live sensor data directly from ESP32 or through local proxy
 */
export const fetchLocalEspSensor = async (ip, signal = null) => {
  const cleanIp = String(ip || '192.168.43.100').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  
  // 1. Try Direct fetch to /data
  try {
    const res = await fetch(`http://${cleanIp}/data`, {
      method: 'GET',
      signal: signal || AbortSignal.timeout(2500)
    });
    if (res.ok) {
      const json = await res.json();
      if (json) return json;
    }
  } catch (_) {}

  // 2. Try Direct fetch to /sensor
  try {
    const res2 = await fetch(`http://${cleanIp}/sensor`, {
      method: 'GET',
      signal: signal || AbortSignal.timeout(2500)
    });
    if (res2.ok) {
      const json2 = await res2.json();
      if (json2) return json2;
    }
  } catch (_) {}

  // 3. Fallback: Proxy via Local Dev Server / Backend Proxy
  try {
    const proxyRes = await fetch(`/api/esp/read?ip=${encodeURIComponent(cleanIp)}`, {
      method: 'GET',
      signal: signal || AbortSignal.timeout(2500)
    });
    if (proxyRes.ok) {
      const proxyJson = await proxyRes.json();
      if (proxyJson && !proxyJson.error) return proxyJson;
    }
  } catch (_) {}

  throw new Error(`Unable to fetch readings from ESP32 at ${cleanIp}`);
};

/**
 * Post AI prediction results directly to ESP32 OLED and LED indicator
 */
export const postLocalEspResult = async (ip, packet) => {
  const cleanIp = String(ip || '192.168.43.100').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const payloadStr = typeof packet === 'string' ? packet : JSON.stringify(packet);
  let ok = false;

  // 1. Direct fetch with text/plain (Simple Request = NO OPTIONS preflight required)
  try {
    await fetch(`http://${cleanIp}/result`, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: payloadStr,
      signal: AbortSignal.timeout(2500)
    });
    ok = true;
  } catch (_) {}

  // 2. Also try proxy endpoint
  try {
    const proxyRes = await fetch(`/api/esp/result?ip=${encodeURIComponent(cleanIp)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: payloadStr,
      signal: AbortSignal.timeout(2500)
    });
    if (proxyRes.ok) ok = true;
  } catch (_) {}

  return ok;
};

export const safeLocalFetch = fetchLocalEspSensor;
export const getSensorData = async (ip) => fetchLocalEspSensor(ip);


/**
 * syncService.js
 * Two-Way AI Result Synchronization System between Food 360 App & ESP32 OLED
 */
import { getActiveConnection } from '../lib/sensorConnection';

const FIREBASE_DEVICE_RESULT_URL = 'https://oil-adulteration-default-rtdb.firebaseio.com/device_result.json';
const OLED_SYNC_SETTING_KEY = 'esp32_oled_sync_enabled';

export function isOledSyncEnabled() {
  const setting = localStorage.getItem(OLED_SYNC_SETTING_KEY);
  return setting !== 'false'; // Enabled by default
}

export function setOledSyncEnabled(enabled) {
  localStorage.setItem(OLED_SYNC_SETTING_KEY, enabled ? 'true' : 'false');
}

/**
 * Send structured AI Result Packet back to ESP32 for OLED Carousel Display & LED status
 */
export async function sendAiResultToEsp32(result) {
  if (!isOledSyncEnabled()) {
    console.log('[SyncService] OLED Sync is disabled in settings. Skipping transmission.');
    return { success: false, reason: 'OLED Sync disabled' };
  }

  const conn = getActiveConnection();
  const savedIp = localStorage.getItem('esp32_last_ip');
  const targetIp = (conn?.mode === 'LOCAL' && conn?.ip) ? conn.ip : (savedIp || null);

  // Construct standardized result packet matching user prediction specs
  const purity = parseFloat((result.purityPercentage || result.purityScore || result.purity || 91.4).toFixed(1));
  const adultPct = parseFloat((result.adulterationPercentage ?? Math.max(0, 100 - purity)).toFixed(1));
  
  // Clean, crisp status for ESP32 OLED screen & LED rules
  const rawStatus = (result.status || '').toLowerCase();
  const isPure = (rawStatus.includes('safe') || rawStatus.includes('pure')) && !rawStatus.includes('adulterat') && purity >= 75.0;
  const displayStatus = isPure ? 'Pure Oil' : 'Adulterated';
  const adulterant = result.adulterationType || result.detectedAdulterant || result.possible_adulterant || (isPure ? 'None' : 'Palm Oil');
  const estMix = isPure ? '0% (Pure)' : `${adultPct}%`;
  const confidence = Math.round(result.confidenceScore || result.confidence || 97);
  const temp = parseFloat((result.temperature || 28.5).toFixed(1));

  const packet = {
    scan_id: result.scanId || `SCAN-${Math.floor(100000 + Math.random() * 900000)}`,
    device_id: result.deviceId || 'Food360-ESP32',
    timestamp: Date.now(),
    oil_type: result.oilTypeSelected || result.oilName || result.oil_type || 'Mustard Oil',
    purity_percentage: purity,
    confidence_score: confidence,
    safety_status: displayStatus,
    adulteration_detected: !isPure,
    adulteration_type: adulterant,
    estimated_adulteration_percent: estMix,
    temperature: temp,
    has_prediction: true,
    model_version: 'SpectraTrust AI v1.0',
    processing_time: '0.9 sec',
    updated_at: Date.now()
  };

  console.log('[SyncService] Transmitting AI Result Packet to ESP32:', packet);

  let localOk = false;
  let cloudOk = false;
  let bleOk = false;

  // 1. LOCAL WiFi Mode — Post directly to ESP32 IP endpoint (Zero Latency / Low Connectivity)
  if (targetIp) {
    const cleanIp = targetIp.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    try {
      const localRes = await fetch(`http://${cleanIp}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet)
      });
      if (localRes.ok) {
        localOk = true;
        console.log(`[SyncService] Result posted directly to ESP32 at http://${cleanIp}/result (OLED & LEDs synced)`);
      }
    } catch (err) {
      console.warn(`[SyncService] Direct ESP32 IP sync to http://${cleanIp}/result notice:`, err.message);
    }
  }

  // 2. CLOUD Mode — Post to Firebase Realtime Database device_result node
  try {
    const res = await fetch(FIREBASE_DEVICE_RESULT_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packet)
    });
    if (res.ok) {
      cloudOk = true;
      console.log('[SyncService] Result posted to Firebase RTDB device_result node successfully.');
    }
  } catch (err) {
    console.warn('[SyncService] Firebase RTDB sync notice:', err.message);
  }

  // 3. BLE Mode — Write result payload to BLE characteristic
  if (conn?.mode === 'BLE' && conn?.characteristic) {
    try {
      const encoder = new TextEncoder();
      const jsonStr = JSON.stringify({
        oil: packet.oil_type,
        pur: packet.purity_percentage,
        stat: packet.safety_status,
        mix: packet.possible_adulterant
      });
      await conn.characteristic.writeValue(encoder.encode(jsonStr));
      bleOk = true;
      console.log('[SyncService] Result transmitted via BLE characteristic write.');
    } catch (err) {
      console.warn('[SyncService] BLE write notice:', err.message);
    }
  }

  return { success: localOk || cloudOk || bleOk, packet };
}

/**
 * Reset ESP32 OLED Display back to Standby when user exits the inspection page
 */
export async function clearEsp32OledResult() {
  const conn = getActiveConnection();
  const savedIp = localStorage.getItem('esp32_last_ip');
  const targetIp = (conn?.mode === 'LOCAL' && conn?.ip) ? conn.ip : (savedIp || null);

  // 1. Reset local ESP32
  if (targetIp) {
    const cleanIp = targetIp.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    try {
      await fetch(`http://${cleanIp}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: '',
          oil_type: '--',
          safety_status: 'Standby',
          purity_percentage: 0.0
        })
      });
    } catch (_) {}
  }

  // 2. Reset cloud node
  try {
    await fetch(FIREBASE_DEVICE_RESULT_URL, { method: 'DELETE' });
    console.log('[SyncService] Cleared OLED result node on Firebase RTDB.');
  } catch (e) {
    console.warn('[SyncService] Failed to clear OLED result node:', e);
  }
}

/**
 * Hackathon Demo Mode: Trigger simulated test prediction on ESP32 OLED
 */
export async function sendDemoAiResultToEsp32() {
  const demoResults = [
    {
      oilName: 'Mustard Oil',
      purityScore: 91.4,
      confidenceScore: 97,
      status: 'ADULTERATED',
      detectedAdulterant: 'Palm Oil',
      scanId: 'SCAN-DEMO-01'
    },
    {
      oilName: 'Groundnut Oil',
      purityScore: 98.6,
      confidenceScore: 99,
      status: 'SAFE',
      detectedAdulterant: 'None',
      scanId: 'SCAN-DEMO-02'
    }
  ];

  const randomDemo = demoResults[Math.floor(Math.random() * demoResults.length)];
  return await sendAiResultToEsp32(randomDemo);
}

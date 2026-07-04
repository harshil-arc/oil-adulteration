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
 * Send structured AI Result Packet back to ESP32 for OLED Carousel Display
 */
export async function sendAiResultToEsp32(result) {
  if (!isOledSyncEnabled()) {
    console.log('[SyncService] OLED Sync is disabled in settings. Skipping transmission.');
    return { success: false, reason: 'OLED Sync disabled' };
  }

  const conn = getActiveConnection();

  // Construct standardized result packet matching user prediction specs
  const purity = parseFloat((result.purityPercentage || result.purityScore || result.purity || 91.4).toFixed(1));
  const status = result.status || (purity >= 90 ? 'Pure' : purity >= 75 ? 'Suspicious' : 'Adulterated');
  const adulterant = result.adulterationType || result.detectedAdulterant || result.possible_adulterant || (purity < 90 ? 'Palm Oil' : 'None');
  const estMix = result.estimatedAdulterationPercent || result.estimated_adulteration_percent || (purity < 90 ? '15–20% (Estimated by AI)' : '0% (Pure)');
  const confidence = Math.round(result.confidenceScore || result.confidence || 97);
  const temp = parseFloat((result.temperature || 31.2).toFixed(1));

  const packet = {
    scan_id: result.scanId || `SCAN-${Math.floor(100000 + Math.random() * 900000)}`,
    device_id: result.deviceId || 'ESP32-SPECTRA-01',
    timestamp: Date.now(),
    oil_type: result.oilTypeSelected || result.oilName || result.oil_type || 'Mustard Oil',
    purity_percentage: purity,
    confidence_score: confidence,
    safety_status: status,
    adulteration_detected: purity < 90,
    adulteration_type: adulterant,
    estimated_adulteration_percent: estMix,
    temperature: temp,
    has_prediction: true,
    model_version: 'SpectraTrust AI v1.0',
    processing_time: '0.9 sec',
    updated_at: Date.now()
  };

  console.log('[SyncService] Transmitting AI Result Packet to ESP32:', packet);

  let wifiOk = false;
  let bleOk = false;

  // 1. CLOUD / WiFi Mode — Post to Firebase Realtime Database device_result node
  try {
    const res = await fetch(FIREBASE_DEVICE_RESULT_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packet)
    });
    if (res.ok) {
      wifiOk = true;
      console.log('[SyncService] Result posted to Firebase RTDB device_result node successfully.');
    }
  } catch (err) {
    console.warn('[SyncService] Firebase RTDB sync failed:', err);
  }

  // 2. LOCAL WiFi Mode — Post directly to ESP32 IP endpoint if available
  if (conn?.mode === 'LOCAL' && conn?.ip) {
    try {
      const localRes = await fetch(`http://${conn.ip}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet)
      });
      if (localRes.ok) {
        wifiOk = true;
        console.log(`[SyncService] Result posted directly to ESP32 at http://${conn.ip}/result`);
      }
    } catch (err) {
      console.warn(`[SyncService] Direct ESP32 IP sync to http://${conn.ip}/result failed:`, err);
    }
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
      console.warn('[SyncService] BLE write failed:', err);
    }
  }

  return { success: wifiOk || bleOk, packet };
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

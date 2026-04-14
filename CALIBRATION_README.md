# Oil Calibration Datasheet — Pure Catalyst
## File: `oil_calibration_datasheet.csv`

This file defines the **pure oil reference ranges** used by the app to calculate adulteration %.
Edit values here, then mirror them in `frontend/src/lib/oilReferenceData.js` to take effect in the app.

---

## How the Comparison Works

```
ESP32 sends live readings:
  { temperature, wavelength, density, adulteration_index }
              ↓
App compares each reading against the pure oil reference range
              ↓
Deviation outside range → weighted adulteration score
              ↓
Final adulteration % = light_dev×60% + temp_dev×15% + density_dev×15% + index×10%
```

---

## Column Guide

| Column | Unit | Description |
|---|---|---|
| `oil_name` | — | Must exactly match the name in `oilReferenceData.js` |
| `temperature_min / max` | °C | Acceptable ambient temperature during testing |
| `wavelength_min / max` | nm | Light absorption range (PRIMARY sensor — 60% weight) |
| `density_min / max` | g/cm³ | Density of pure oil at room temperature |
| `adulteration_index_max` | 0–1 | Maximum acceptable raw ESP adulteration index for "pure" classification |
| `common_adulterants` | — | Pipe-separated list; used for AI adulterant suggestions |
| `notes` | — | Calibration notes; not used by the app logic |

---

## How to Calibrate

1. **Get a certified pure sample** of the oil you want to calibrate.
2. **Run the ESP32 sensor** on the pure sample at room temperature (~25°C).
3. **Record the readings**: temperature, wavelength, density.
4. **Update the CSV row** for that oil: set `wavelength_min` slightly below the reading,
   and `wavelength_max` slightly above (to create a ±10–20 nm tolerance band).
5. **Mirror the updated values** in `frontend/src/lib/oilReferenceData.js`
   in the matching oil entry's `lightAbsorptionRange` field.
6. Rebuild and redeploy the app.

---

## Quick Reference: Which Sensor Matters Most?

| Sensor | Weight | Notes |
|---|---|---|
| `wavelength` (light absorption) | **60%** | Most important. Changes most with adulteration |
| `temperature` | 15% | Affects viscosity and light readings |
| `density` | 15% | Heavy adulterants (mineral oil) change density significantly |
| `adulteration_index` (raw ESP) | 10% | Direct reading from ESP if available |

---

## Tier Classification

| Adulteration % | Tier | Meaning |
|---|---|---|
| 0 – 20% | **PURE** | Within acceptable natural variation |
| 21 – 60% | **MODERATE** | Significant adulteration detected |
| 61 – 100% | **HEAVY** | Unsafe — stop consuming |

---

## App Source File to Edit

```
frontend/src/lib/oilReferenceData.js
```

Each oil entry looks like this — update min/max values to match your calibration:

```js
{
  oilName: 'Mustard Oil',
  color: '#D4A017',              // UI display color only
  descriptor: '...',             // UI display text only
  temperatureRange: { min: 22, max: 35 },
  densityRange:     { min: 0.910, max: 0.925 },
  lightAbsorptionRange: { min: 180, max: 320 },  // ← CALIBRATE THIS
  commonAdulterants: ['Argemone oil', 'Mineral oil', 'Kesari dal oil'],
},
```

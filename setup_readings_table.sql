-- ==========================================
-- READINGS TABLE for ESP32 Cloud Mode
-- ==========================================
-- ESP32 sends: spectral_data (JSONB), temperature (float), weight (float)
-- Run this in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.readings (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Exact fields the ESP32 firmware sends
    temperature  DOUBLE PRECISION,    -- MLX90614 object temp °C
    weight       DOUBLE PRECISION,    -- HX711 raw weight in grams
    spectral_data JSONB               -- AS7343 all 13 channel values as JSON object
);

-- Required: allow ESP32 anon key to INSERT
ALTER TABLE public.readings DISABLE ROW LEVEL SECURITY;

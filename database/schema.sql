-- ============================================================
-- Pure Catalyst: Oil Adulteration Detection System
-- Supabase Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. DEVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.devices (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id    TEXT UNIQUE NOT NULL,
  shop_id      UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  name         TEXT NOT NULL DEFAULT 'ESP32 Sensor',
  status       TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online','offline','calibrating')),
  firmware     TEXT DEFAULT '1.4.2',
  last_seen    TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on devices" ON public.devices FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 2. OIL_READINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.oil_readings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id    TEXT NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
  oil_type     TEXT NOT NULL,
  ir_value     NUMERIC NOT NULL,
  uv_value     NUMERIC NOT NULL,
  density      NUMERIC NOT NULL,
  temperature  NUMERIC NOT NULL,
  timestamp    TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.oil_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on oil_readings" ON public.oil_readings FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_oil_readings_device ON public.oil_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_oil_readings_timestamp ON public.oil_readings(timestamp DESC);

-- ============================================================
-- 3. ANALYSIS_RESULTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analysis_results (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reading_id        UUID REFERENCES public.oil_readings(id) ON DELETE CASCADE,
  device_id         TEXT NOT NULL,
  oil_type          TEXT NOT NULL,
  purity            NUMERIC NOT NULL CHECK (purity >= 0 AND purity <= 100),
  adulteration      NUMERIC NOT NULL CHECK (adulteration >= 0 AND adulteration <= 100),
  quality           TEXT NOT NULL CHECK (quality IN ('Safe','Moderate','Unsafe')),
  likely_adulterants JSONB DEFAULT '[]',
  contaminants      JSONB DEFAULT '[]',
  health_advisory   TEXT,
  sensor_snapshot   JSONB,
  timestamp         TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on analysis_results" ON public.analysis_results FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_analysis_device ON public.analysis_results(device_id);
CREATE INDEX IF NOT EXISTS idx_analysis_timestamp ON public.analysis_results(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_quality ON public.analysis_results(quality);

-- ============================================================
-- 4. ALERTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reading_id  UUID REFERENCES public.oil_readings(id) ON DELETE CASCADE,
  device_id   TEXT NOT NULL,
  oil_type    TEXT,
  severity    TEXT NOT NULL CHECK (severity IN ('warning','critical')),
  message     TEXT NOT NULL,
  adulteration NUMERIC,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_alerts_device ON public.alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_ack ON public.alerts(acknowledged);

-- ============================================================
-- REALTIME: Enable realtime on all tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.oil_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analysis_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- ============================================================
-- SEED: Insert default device
-- ============================================================
INSERT INTO public.devices (device_id, name, status, firmware)
VALUES ('ESP32_01', 'Catalyst-Probe v2.0', 'online', '1.4.2')
ON CONFLICT (device_id) DO NOTHING;

-- ============================================================
-- 5. SHOPS TABLE (MAP MONITORING)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shops (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  latitude     NUMERIC NOT NULL,
  longitude    NUMERIC NOT NULL,
  oil_type     TEXT NOT NULL,
  last_purity  NUMERIC,
  status       TEXT DEFAULT 'safe' CHECK (status IN ('safe','moderate','adulterated')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on shops" ON public.shops FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 6. COMPLAINTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id      UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  image_url    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  -- Fallback if user picks location not currently tied to a shop
  lat          NUMERIC,
  lng          NUMERIC,
  contact_info TEXT
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on complaints" ON public.complaints FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- REALTIME: Enable realtime on new tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.shops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;

-- ============================================================
-- SEED: Insert Mock Indian Shops
-- ============================================================
INSERT INTO public.shops (id, name, latitude, longitude, oil_type, last_purity, status) VALUES
  (uuid_generate_v4(), 'Delhi Pure Oils Traders', 28.6139, 77.2090, 'Mustard Oil', 98, 'safe'),
  (uuid_generate_v4(), 'Mumbai Mill Foods', 19.0760, 72.8777, 'Sunflower Oil', 85, 'moderate'),
  (uuid_generate_v4(), 'Bangalore Fresh Edibles', 12.9716, 77.5946, 'Coconut Oil', 60, 'adulterated'),
  (uuid_generate_v4(), 'Kolkata Engine & Lube', 22.5726, 88.3639, 'Engine Oil (SAE 10W-30)', 92, 'safe'),
  (uuid_generate_v4(), 'Chennai Spice Oils', 13.0827, 80.2707, 'Groundnut Oil', 78, 'moderate'),
  (uuid_generate_v4(), 'Ahmedabad Gold Refineries', 23.0225, 72.5714, 'Olive Oil', 45, 'adulterated'),
  (uuid_generate_v4(), 'Hyderabad Deep Fry Oils', 17.3850, 78.4867, 'Mustard Oil', 96, 'safe')
ON CONFLICT DO NOTHING;

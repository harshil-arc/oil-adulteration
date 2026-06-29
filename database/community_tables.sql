-- ============================================================
-- FoodGuard Community Intelligence Module Schema Extension
-- Supabase Schema
-- ============================================================

-- 1. CONSUMER COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.consumer_complaints (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id       TEXT UNIQUE NOT NULL, -- Format: COMP-YYYYMMDD-XXXX
    product_name       TEXT NOT NULL,
    oil_type           TEXT NOT NULL,
    brand_name         TEXT,
    vendor_name        TEXT,
    category           TEXT NOT NULL,
    description        TEXT NOT NULL,
    purchase_date      DATE DEFAULT CURRENT_DATE,
    city               TEXT NOT NULL,
    district           TEXT NOT NULL,
    location           TEXT,
    product_photo      TEXT,
    bill_upload        TEXT,
    status             TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Evidence Verified', 'Resolved', 'Rejected')),
    timeline           JSONB DEFAULT '[]', -- JSON array tracking history events
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.consumer_complaints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on consumer_complaints" ON public.consumer_complaints;
CREATE POLICY "Allow all on consumer_complaints" ON public.consumer_complaints FOR ALL USING (true) WITH CHECK (true);

-- 2. FOOD TESTING CENTRES TABLE
CREATE TABLE IF NOT EXISTS public.testing_centres (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name               TEXT NOT NULL,
    address            TEXT NOT NULL,
    latitude           NUMERIC,
    longitude          NUMERIC,
    working_hours      TEXT DEFAULT '09:00 AM - 06:00 PM',
    phone              TEXT,
    email              TEXT,
    available_tests    JSONB DEFAULT '[]',
    status             TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
    rating             NUMERIC DEFAULT 4.0,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.testing_centres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on testing_centres" ON public.testing_centres;
CREATE POLICY "Allow all on testing_centres" ON public.testing_centres FOR ALL USING (true) WITH CHECK (true);

-- Seed Testing Centres
INSERT INTO public.testing_centres (name, address, latitude, longitude, phone, email, available_tests, rating) VALUES
  ('Gujarat Food & Drug Laboratory (FDA)', 'Sector-10A, Gandhinagar, Gujarat 382010', 23.2201, 72.6468, '+91 79 2325 3482', 'contact@gujfda.gov.in', '["Purity", "Chemical Adulteration", "Heavy Metals", "Pesticide Residue"]', 4.8),
  ('FSSAI National Food Laboratory (NFL)', 'Sector 14, Ghaziabad, Uttar Pradesh 201002', 28.6738, 77.4402, '+91 120 270 2165', 'director.nflgzb@fssai.gov.in', '["Full Spectral Purity", "Toxicity", "Micro-biological", "Foreign Fats"]', 4.9),
  ('Eurofins Food Testing Lab India', 'A-3, Industrial Area, Phase-I, New Delhi 110020', 28.5355, 77.2711, '+91 11 6625 2100', 'enquiryindia@eurofins.com', '["Mineral Oil Adulteration", "Fatty Acid Profile", "Heavy Metals"]', 4.5),
  ('TÜV SÜD South Asia Testing Centre', 'Industrial Estate, Sanathnagar, Hyderabad 500018', 17.4580, 78.4310, '+91 40 6001 3333', 'info.in@tuvsud.com', '["Purity", "Acid Value", "Peroxide Value", "Argemone Oil check"]', 4.6),
  ('National Test House Food Lab', 'Block CP, Sector V, Salt Lake, Kolkata 700091', 22.5735, 88.4330, '+91 33 2367 3426', 'nth-kolkata@gov.in', '["Rancidity", "FSSAI Standard Verification", "Coloring Agents"]', 4.4)
ON CONFLICT DO NOTHING;

-- 3. GOVERNMENT FOOD SAFETY ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.government_alerts (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name       TEXT NOT NULL,
    brand_name         TEXT,
    category           TEXT NOT NULL CHECK (category IN ('Product Recall', 'Government Ban', 'Health Advisory', 'Safety Warning', 'Quality Alert')),
    reason             TEXT NOT NULL,
    issued_by          TEXT DEFAULT 'FSSAI HQ',
    issue_date         DATE DEFAULT CURRENT_DATE,
    affected_states    JSONB DEFAULT '["All States"]',
    severity           TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    recommended_action TEXT DEFAULT 'Avoid Consumption',
    notice_url         TEXT,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.government_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on government_alerts" ON public.government_alerts;
CREATE POLICY "Allow all on government_alerts" ON public.government_alerts FOR ALL USING (true) WITH CHECK (true);

-- Seed Alerts
INSERT INTO public.government_alerts (product_name, brand_name, category, reason, issued_by, severity, recommended_action) VALUES
  ('Kacchi Ghani Mustard Oil', 'Brand X Foods', 'Product Recall', 'Excessive argemone oil presence detected via spectral signature scan.', 'FSSAI Central Command', 'Critical', 'Avoid Consumption & Return Product'),
  ('Standard Refined Sunflower Oil', 'Swastik Edibles', 'Government Ban', 'Unpermitted color additives (Metanil Yellow) detected exceeding legal limits.', 'Ministry of Health & Welfare', 'High', 'Dispose Safely & Report Retailer'),
  ('Virgin Extra Olive Oil', 'Tuscany Imports', 'Safety Warning', 'Sub-standard density indicating artificial adulterant mask.', 'FSSAI Western Division', 'Medium', 'Return Product to Merchant'),
  ('Double Filtered Groundnut Oil', 'Kisan Organics Ltd', 'Quality Alert', 'Aflatoxin residues detected exceeding safe human ingestion threshold of 15 ppb.', 'National Health Council', 'High', 'Avoid Consumption & Dispose Safely')
ON CONFLICT DO NOTHING;

-- 4. COMMUNITY NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.community_notifications (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title              TEXT NOT NULL,
    message            TEXT NOT NULL,
    type               TEXT DEFAULT 'alert' CHECK (type IN ('alert', 'complaint', 'system')),
    related_id         UUID,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on community_notifications" ON public.community_notifications;
CREATE POLICY "Allow all on community_notifications" ON public.community_notifications FOR ALL USING (true) WITH CHECK (true);

-- 5. VERIFIED NGOS TABLE
CREATE TABLE IF NOT EXISTS public.ngos (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name               TEXT NOT NULL,
    address            TEXT NOT NULL,
    phone              TEXT,
    operating_hours    TEXT DEFAULT '09:00 AM - 09:00 PM',
    food_types         JSONB DEFAULT '["Veg", "Cooked Food"]',
    capacity           TEXT,
    urgency            TEXT DEFAULT 'Medium',
    pickup_available   BOOLEAN DEFAULT TRUE,
    rating             NUMERIC DEFAULT 4.0,
    verified           BOOLEAN DEFAULT TRUE,
    reg_number         TEXT UNIQUE,
    description        TEXT,
    latitude           NUMERIC,
    longitude          NUMERIC,
    status             TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Busy', 'Offline')),
    past_donations     INTEGER DEFAULT 0,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on ngos" ON public.ngos;
CREATE POLICY "Allow all on ngos" ON public.ngos FOR ALL USING (true) WITH CHECK (true);

-- Seed NGOs
INSERT INTO public.ngos (name, address, phone, capacity, urgency, reg_number, description, latitude, longitude, status, past_donations) VALUES
  ('Robin Hood Army - Ahmedabad', 'Vastrapur Community Kitchen, Ahmedabad, Gujarat 380015', '+91 98980 12345', '500 meals/day', 'High', 'RHA-IND-2014-9821', 'Zero-funds volunteer organization routing surplus food from restaurants directly to communities.', 23.0338, 72.5250, 'Available', 4200),
  ('Zomato Feeding India - Mumbai Hub', 'Bandra Reclamation Center, Mumbai, Maharashtra 400050', '+91 91234 56789', '1200 meals/day', 'Medium', 'FIP-NGO-1029', 'Non-profit combating hunger and malnutrition in India via systemic redistribution networks.', 19.0522, 72.8258, 'Busy', 9800),
  ('Roti Bank Delhi', 'Daryaganj Central Depot, New Delhi 110002', '+91 88882 12121', '800 meals/day', 'High', 'RBD-NGO-4982', 'Community-driven kitchen collecting wheat rotis and vegetables for low-income settlements.', 28.6448, 77.2400, 'Available', 7100),
  ('No Food Waste - Bengaluru Division', 'Indiranagar Rescue Depot, Bengaluru, Karnataka 560038', '+91 90909 88888', '1000 meals/day', 'Low', 'NFW-NGO-3341', 'Helpline mapping excess wedding food directly to hunger spots in cities.', 12.9784, 77.6408, 'Offline', 5500)
ON CONFLICT (reg_number) DO NOTHING;

-- 6. NGO DONATIONS TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.ngo_donations (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ngo_id             UUID REFERENCES public.ngos(id) ON DELETE CASCADE,
    food_type          TEXT NOT NULL,
    quantity_kg        NUMERIC NOT NULL,
    meals_count        INTEGER NOT NULL,
    prep_time          TIMESTAMPTZ DEFAULT NOW(),
    expiry_time        TIMESTAMPTZ NOT NULL,
    pickup_address     TEXT NOT NULL,
    contact_person     TEXT NOT NULL,
    phone              TEXT NOT NULL,
    special_notes      TEXT,
    food_images        JSONB DEFAULT '[]',
    status             TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'NGO Accepted', 'Volunteer Assigned', 'Pickup In Progress', 'Delivered', 'Completed')),
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ngo_donations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on ngo_donations" ON public.ngo_donations;
CREATE POLICY "Allow all on ngo_donations" ON public.ngo_donations FOR ALL USING (true) WITH CHECK (true);

-- REALTIME: Enable realtime on all tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'consumer_complaints') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.consumer_complaints;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'testing_centres') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.testing_centres;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'government_alerts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.government_alerts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'community_notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_notifications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'ngos') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ngos;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'ngo_donations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ngo_donations;
  END IF;
END $$;

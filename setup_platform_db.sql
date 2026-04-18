-- ==========================================
-- LARGE-SCALE FOOD PLATFORM SCHEMA INITIALIZATION
-- ==========================================

-- 1. Users (Organizers, NGOs, Volunteers)
CREATE TABLE IF NOT EXISTS public.platform_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('organizer', 'ngo', 'volunteer')),
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Events (Catering & Large Gatherings)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES public.platform_users(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'wedding', 'corporate', 'festival'
    guest_count INTEGER NOT NULL,
    location TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    weather_context TEXT,
    food_menu JSONB, -- Array of objects: [{item: "Paneer", base_qty: 20}, ...]
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Predictions (AI Outputs)
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    predicted_food_kg DOUBLE PRECISION NOT NULL,
    waste_risk_score INTEGER CHECK (waste_risk_score BETWEEN 0 AND 100),
    confidence DOUBLE PRECISION,
    ai_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Surplus Inventory
CREATE TABLE IF NOT EXISTS public.surplus_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id),
    food_quantity_kg DOUBLE PRECISION NOT NULL,
    location TEXT NOT NULL,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'matched', 'claimed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Donations & Volunteer Assignments
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    surplus_id UUID REFERENCES public.surplus_inventory(id),
    ngo_id UUID REFERENCES public.platform_users(id),
    volunteer_id UUID REFERENCES public.platform_users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_transit', 'delivered')),
    eta TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Analytics Logging
CREATE TABLE IF NOT EXISTS public.analytics_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id),
    actual_consumption_kg DOUBLE PRECISION,
    prediction_accuracy DOUBLE PRECISION,
    meals_saved INTEGER, -- Derived metric
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Disaster & Emergency Zones
CREATE TABLE IF NOT EXISTS public.disaster_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    active BOOLEAN DEFAULT TRUE,
    affected_radius_km DOUBLE PRECISION,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

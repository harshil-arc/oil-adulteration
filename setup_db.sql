-- ==========================================
-- PUREOIL - SUPABASE SCHEMA INITIALIZATION
-- ==========================================
-- Run this script in your Supabase SQL Editor
-- (https://app.supabase.com/project/_/sql/new)
-- to initialize all tables required for the dashboard and app.

-- 1. Analysis Results (History)
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    oil_type TEXT NOT NULL,
    purity NUMERIC,
    quality TEXT NOT NULL,
    adulteration_percentage NUMERIC,
    confidence_score NUMERIC,
    sensor_readings JSONB,
    connection_type TEXT,
    timestamp TIMESTAMP WITH TIME ZONE,
    vendor TEXT
);

-- 2. Shops (For Reporting Feature)
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    oil_type TEXT,
    status TEXT DEFAUlT 'adulterated',
    trust_score NUMERIC DEFAULT 100
);

-- 3. Complaints/Reports
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    description TEXT,
    status TEXT DEFAULT 'pending',
    lat NUMERIC,
    lng NUMERIC,
    image_url TEXT
);

-- Note: Ensure Row Level Security (RLS) is configured appropriately if testing.
-- If you are having issues saving data, you can temporarily disable RLS like so:
-- ALTER TABLE public.analysis_results DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.shops DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;

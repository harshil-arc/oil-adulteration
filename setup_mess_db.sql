-- ==========================================
-- MESS ENVIRONMENT SCHEMA INITIALIZATION
-- ==========================================

-- 1. Daily Attendance & Demand Prediction Logs
CREATE TABLE IF NOT EXISTS public.mess_attendance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    day_of_week TEXT NOT NULL,
    is_holiday BOOLEAN DEFAULT false,
    event_name TEXT,
    active_students_enrolled INTEGER NOT NULL,
    actual_students_eaten INTEGER,
    predicted_students_eating INTEGER,
    confidence_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Food Waste Logs
CREATE TABLE IF NOT EXISTS public.mess_food_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL REFERENCES public.mess_attendance_logs(date) ON DELETE CASCADE,
    food_prepared_kg NUMERIC NOT NULL,
    food_consumed_kg NUMERIC,
    food_leftover_kg NUMERIC,
    waste_percentage NUMERIC,
    status TEXT, -- 'optimal', 'overproduced', 'shortage'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. NGO Donations
CREATE TABLE IF NOT EXISTS public.ngo_donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_log_id UUID REFERENCES public.mess_food_logs(id) ON DELETE CASCADE,
    food_type_details TEXT,
    quantity_kg NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'claimed', 'picked_up'
    claimed_by_ngo_name TEXT,
    pickup_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS temporarily or setup policies
-- ALTER TABLE public.mess_attendance_logs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.mess_food_logs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.ngo_donations DISABLE ROW LEVEL SECURITY;

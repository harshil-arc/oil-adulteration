const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://vntaprmahmjeyuzhwqsc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudGFwcm1haG1qZXl1emh3cXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjY3NDMsImV4cCI6MjA5MTA0Mjc0M30.K3NE7-bRaYRRRhV9Up2Y7f4mVoRvM3B0_dNMitJT_S8'
);

async function migrate() {
  console.log('Step 1: Testing insert with new columns to trigger error detection...');

  // Test insert to confirm columns are missing
  const { error: testError } = await sb
    .from('readings')
    .select('wavelength, density, oil_type')
    .limit(1);

  if (!testError) {
    console.log('Columns already exist — skipping migration.');
    process.exit(0);
  }

  console.log('Columns missing. Inserting a test row with old columns first to check table works...');

  // Use REST API to run SQL via Supabase Management API is not available with anon key.
  // Instead we insert with all required fields so the DB will auto-add if RLS allows.
  // The correct approach: use the SQL editor in Supabase dashboard, OR use service_key.
  // Since we only have anon key, print the SQL to run manually.

  const migrationSQL = `
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/vntaprmahmjeyuzhwqsc/sql
ALTER TABLE public.readings
  ADD COLUMN IF NOT EXISTS wavelength NUMERIC,
  ADD COLUMN IF NOT EXISTS density    NUMERIC,
  ADD COLUMN IF NOT EXISTS oil_type   TEXT;

-- Optionally remove old unused columns (only if you want to clean up)
-- ALTER TABLE public.readings DROP COLUMN IF EXISTS humidity;
-- ALTER TABLE public.readings DROP COLUMN IF EXISTS pressure;
-- ALTER TABLE public.readings DROP COLUMN IF EXISTS light;
-- ALTER TABLE public.readings DROP COLUMN IF EXISTS uptime;
`.trim();

  console.log('\n========== COPY THIS SQL TO SUPABASE DASHBOARD ==========\n');
  console.log(migrationSQL);
  console.log('\n==========================================================\n');
  console.log('Go to: https://app.supabase.com/project/vntaprmahmjeyuzhwqsc/sql/new');
  console.log('Paste and run the SQL above.');
}

migrate().catch(console.error);

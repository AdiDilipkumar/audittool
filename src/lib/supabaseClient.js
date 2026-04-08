import { createClient } from '@supabase/supabase-js';

// Credentials injected at build time via GitHub Actions secrets (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
// For local dev, create a .env file with these two variables.
// Never hardcode credentials in source — this file is committed to a public repo.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase env vars missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

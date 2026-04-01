import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://quvdlzgtdlfskqwtugvg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dmRsemd0ZGxmc2txd3R1Z3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDg5MDAsImV4cCI6MjA5MDYyNDkwMH0.LNOqhQAtkRBV9cK-4tpcfBNuRZQKz671uRfbJ2ggrH8';

export const supabase = createClient(supabaseUrl, supabaseKey);

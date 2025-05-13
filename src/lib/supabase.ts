
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Use fallback empty strings if environment variables are not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a mock client when credentials aren't available
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};

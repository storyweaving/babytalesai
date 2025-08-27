import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = 'https://roowithyfhocgebtyqxr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvb3dpdGh5ZmhvY2dlYnR5cXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNzg5NzYsImV4cCI6MjA3MDk1NDk3Nn0.Be4g6iYOjXxJ5jgjMn6yaotz45RUJYFCTfkT4K-3rL4';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Key are missing. Please provide them in services/supabaseClient.ts');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Explicitly setting these options ensures the session is persisted in localStorage,
    // which is the most common fix for "Refresh Token Not Found" errors.
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});


import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to execute SQL queries with parameters
export const runQuery = async (query: string, params: any[] = []) => {
  try {
    const { data, error } = await supabase.rpc('run_query', {
      query_text: query,
      query_params: params
    });
    
    if (error) {
      console.error('Error running query:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in runQuery:', error);
    return { data: null, error };
  }
};

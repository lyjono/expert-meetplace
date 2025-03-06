
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Create a mock Supabase client if env vars are missing
const createMockClient = () => {
  console.log('Using mock Supabase client. Set environment variables for full functionality.');
  
  // Return a mock client with empty implementations of common methods
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signIn: async () => ({ data: null, error: new Error('Mock Supabase client') }),
      signUp: async () => ({ data: null, error: new Error('Mock Supabase client') }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null }) }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
  };
};

// Create the Supabase client with fallback to mock
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any;

// Helper functions
export const getCurrentUser = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }
    
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getUserProfile = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    if (!supabaseUrl || !supabaseAnonKey) {
      return { id: 'mock-id', name: 'Mock User', email: user.email };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

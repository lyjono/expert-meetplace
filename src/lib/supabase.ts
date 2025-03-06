
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper to determine user type from Supabase metadata
export const getUserType = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  // First check user_metadata
  if (user.user_metadata && user.user_metadata.user_type) {
    return user.user_metadata.user_type;
  }
  
  // If not in metadata, check our database tables
  // Check if user exists in provider_profiles
  const { data: providerData } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();
    
  if (providerData) {
    return 'provider';
  }
  
  // Check if user exists in client_profiles
  const { data: clientData } = await supabase
    .from('client_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();
    
  if (clientData) {
    return 'client';
  }
  
  // Default to client if we can't determine
  return 'client';
};

// Helper to get user profile based on type
export const getUserProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const userType = await getUserType();
  
  if (userType === 'provider') {
    const { data } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    return data;
  } else {
    const { data } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    return data;
  }
};

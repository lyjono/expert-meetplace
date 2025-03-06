
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iquwxwsmkhsneqsdaurh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdXd4d3Nta2hzbmVxc2RhdXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyOTc2MjcsImV4cCI6MjA1Njg3MzYyN30.oxh6d4xZv0sqmJYnqRzdPRM-BW3FHd0nMxxahk8yK70';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions
export const getCurrentUser = async () => {
  try {
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

// Get user type (client or provider) from localStorage or user metadata
export const getUserType = async (): Promise<string> => {
  try {
    // First check localStorage (this is set during login)
    const localUserType = localStorage.getItem("userType");
    if (localUserType) {
      return localUserType;
    }
    
    // If not in localStorage, try to get from user metadata
    const user = await getCurrentUser();
    if (user && user.user_metadata && user.user_metadata.user_type) {
      return user.user_metadata.user_type;
    }
    
    // Default to client if not found
    return 'client';
  } catch (error) {
    console.error('Error getting user type:', error);
    return 'client';
  }
};

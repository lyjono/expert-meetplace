
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iquwxwsmkhsneqsdaurh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdXd4d3Nta2hzbmVxc2RhdXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyOTc2MjcsImV4cCI6MjA1Njg3MzYyN30.oxh6d4xZv0sqmJYnqRzdPRM-BW3FHd0nMxxahk8yK70';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Enable real-time for messages table
supabase.channel('schema-db-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'messages' },
    (payload) => console.log('Real-time update:', payload)
  )
  .subscribe();

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
    
    // Try to get client profile first
    let { data: clientProfile, error: clientError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (!clientError && clientProfile) {
      return { ...clientProfile, type: 'client' };
    }
    
    // If not a client, try provider profile
    let { data: providerProfile, error: providerError } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (!providerError && providerProfile) {
      return { ...providerProfile, type: 'provider' };
    }
    
    // If neither found, return error
    throw new Error('No profile found');
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

// Get client settings from database
export const getClientSettings = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    // Try to get client settings
    let { data: clientSettings, error } = await supabase
      .from('client_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (error) {
      // If settings don't exist yet, create default settings
      if (error.code === 'PGRST116') {
        const { data: newSettings, error: insertError } = await supabase
          .from('client_settings')
          .insert({
            user_id: user.id,
            email_notifications: true,
            sms_notifications: true,
            marketing_emails: false,
            profile_visibility: true,
            activity_tracking: true,
            two_factor_auth: false,
            timezone: 'America/New_York'
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newSettings;
      }
      throw error;
    }
    
    return clientSettings;
  } catch (error) {
    console.error('Error getting client settings:', error);
    return null;
  }
};

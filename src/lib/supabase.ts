
import { createClient } from '@supabase/supabase-js';

// These would come from environment variables in a real app
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

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
  
  // We'll store the user type in Supabase user metadata
  return user.user_metadata.user_type || 'client';
};


import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';

export interface ClientSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  profile_visibility: boolean;
  activity_tracking: boolean;
  two_factor_auth: boolean;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export const getClientSettings = async (): Promise<ClientSettings | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const { data, error } = await supabase
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
    
    return data;
  } catch (error) {
    console.error('Error getting client settings:', error);
    return null;
  }
};

export const updateClientSettings = async (settings: Partial<ClientSettings>): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    const { error } = await supabase
      .from('client_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating client settings:', error);
    return false;
  }
};

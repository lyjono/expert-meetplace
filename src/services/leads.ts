
import { supabase } from '@/lib/supabase';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  status: "new" | "contacted" | "qualified" | "converted";
  date: string;
  message: string;
  image?: string;
}

export const getLeadsByStatus = async (status: string): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('status', status);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${status} leads:`, error);
    return [];
  }
};

export const updateLeadStatus = async (leadId: string, newStatus: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating lead status:', error);
    return false;
  }
};


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
  provider_id?: string;
  created_at?: string;
  updated_at?: string;
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
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating lead status:', error);
    return false;
  }
};

export const getLeadCounts = async (): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('status');
    
    if (error) throw error;

    const counts: Record<string, number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0
    };

    data?.forEach(lead => {
      if (counts[lead.status] !== undefined) {
        counts[lead.status]++;
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error fetching lead counts:', error);
    return { new: 0, contacted: 0, qualified: 0, converted: 0 };
  }
};

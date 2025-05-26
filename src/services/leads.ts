import { supabase } from '@/lib/supabase';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string;
  status: "new" | "contacted" | "qualified" | "converted" | "archived";
  date: string;
  message: string | null;
  provider_id: string;
  created_at: string;
  updated_at: string;
  notes?: string | null; // Add notes field
}

export const getLeadsByStatus = async (status: string, providerId: string): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*, notes') // Include notes in the select
      .eq('status', status)
      .eq('provider_id', providerId);
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

export const updateLeadNotes = async (leadId: string, notes: string | null): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', leadId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating lead notes:', error);
    return false;
  }
};

export const getLeadCounts = async (providerId: string): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('status')
      .eq('provider_id', providerId);
    if (error) throw error;

    const counts: Record<string, number> = { new: 0, contacted: 0, qualified: 0, converted: 0 };
    data?.forEach(lead => {
      if (counts[lead.status] !== undefined) counts[lead.status]++;
    });
    return counts;
  } catch (error) {
    console.error('Error fetching lead counts:', error);
    return { new: 0, contacted: 0, qualified: 0, converted: 0 };
  }
};

export const createLeadFromMessage = async (message: any, providerId: string): Promise<boolean> => {
  try {
    const { data: sender, error: senderError } = await supabase
      .from('users_view')
      .select('name, email')
      .eq('user_id', message.sender_id)
      .single();
    if (senderError) throw senderError;

    const { data: existingLead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('email', sender.email)
      .eq('provider_id', providerId)
      .single();
    if (leadError && leadError.code !== 'PGRST116') throw leadError;
    if (existingLead) return true;

    const { data: priorAppointments, error: apptError } = await supabase
      .from('appointments')
      .select('id')
      .eq('client_id', message.sender_id)
      .eq('provider_id', providerId);
    if (apptError) throw apptError;
    if (priorAppointments?.length > 0) return true;

    const { error } = await supabase
      .from('leads')
      .insert({
        name: sender.name || 'Unknown',
        email: sender.email || 'unknown@example.com',
        phone: null,
        service: message.topic || 'Chat Inquiry',
        status: 'new',
        date: new Date().toISOString().split('T')[0],
        message: message.content,
        provider_id: providerId,
        created_at: new Date().toISOString(),
        notes: null, // Initialize notes as null
      });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating lead from message:', error);
    return false;
  }
};

export const createLeadFromAppointment = async (appointment: any, providerId: string): Promise<boolean> => {
  try {
    const { data: clientProfile, error: profileError } = await supabase
      .from('client_profiles')
      .select('user_id')
      .eq('id', appointment.client_id)
      .single();
    if (profileError) throw profileError;

    const { data: client, error: clientError } = await supabase
      .from('users_view')
      .select('name, email')
      .eq('user_id', clientProfile.user_id)
      .single();
    if (clientError) throw clientError;

    const { data: existingLead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('email', client.email)
      .eq('provider_id', providerId)
      .single();
    if (leadError && leadError.code !== 'PGRST116') throw leadError;
    if (existingLead) return true;

    const { data: priorMessages, error: msgError } = await supabase
      .from('messages')
      .select('id')
      .eq('sender_id', clientProfile.user_id)
      .eq('receiver_id', providerId);
    if (msgError) throw msgError;
    if (priorMessages?.length > 0) return true;

    const { error } = await supabase
      .from('leads')
      .insert({
        name: client.name || 'Unknown',
        email: client.email || 'unknown@example.com',
        phone: null,
        service: appointment.service,
        status: 'new',
        date: appointment.date,
        message: `Appointment scheduled for ${appointment.time}`,
        provider_id: providerId,
        created_at: new Date().toISOString(),
        notes: null, // Initialize notes as null
      });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating lead from appointment:', error);
    return false;
  }
};

export const archiveLead = async (leadId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', leadId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error archiving lead:', error);
    return false;
  }
};

import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/supabase';

export interface Appointment {
  id: string;
  expert: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'canceled' | 'completed';
  method: 'video' | 'in-person';
  client?: string;
}

export const getClientAppointments = async (status?: string): Promise<Appointment[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get the client profile ID
    const { data: clientProfile, error: profileError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (profileError) throw profileError;
    if (!clientProfile) throw new Error('Client profile not found');

    // Query for appointments
    let query = supabase
      .from('appointments')
      .select(`
        id,
        service,
        date,
        time,
        status,
        method,
        provider_profiles(name)
      `)
      .eq('client_id', clientProfile.id);

    // Add status filter if provided
    if (status) {
      if (status.includes(',')) {
        // If multiple statuses (e.g., "confirmed,pending")
        const statusArray = status.split(',');
        query = query.in('status', statusArray);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to match the component's expected format
    return data.map(item => ({
      id: item.id,
      expert: item.provider_profiles?.name || 'Unknown Expert',
      service: item.service,
      date: item.date,
      time: item.time,
      status: item.status,
      method: item.method
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

export const getProviderAppointments = async (status?: string): Promise<Appointment[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get the provider profile ID
    const { data: providerProfile, error: profileError } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (profileError) throw profileError;
    if (!providerProfile) throw new Error('Provider profile not found');

    // Query for appointments
    let query = supabase
      .from('appointments')
      .select(`
        id,
        service,
        date,
        time,
        status,
        method,
        client_profiles(name)
      `)
      .eq('provider_id', providerProfile.id);

    // Add status filter if provided
    if (status) {
      if (status.includes(',')) {
        // If multiple statuses (e.g., "confirmed,pending")
        const statusArray = status.split(',');
        query = query.in('status', statusArray);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to match the component's expected format
    return data.map(item => ({
      id: item.id,
      expert: 'You', // Since this is the provider's view
      client: item.client_profiles?.name || 'Unknown Client',
      service: item.service,
      date: item.date,
      time: item.time,
      status: item.status,
      method: item.method
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

export const createAppointment = async (
  providerId: string,
  service: string,
  date: string,
  time: string,
  method: 'video' | 'in-person'
): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get the client profile ID
    const { data: clientProfile, error: profileError } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (profileError) throw profileError;
    if (!clientProfile) throw new Error('Client profile not found');

    // Create appointment
    const { error } = await supabase
      .from('appointments')
      .insert({
        client_id: clientProfile.id,
        provider_id: providerId,
        service,
        date,
        time,
        status: 'pending',
        method
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating appointment:', error);
    return false;
  }
};

export const cancelAppointment = async (appointmentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('id', appointmentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error canceling appointment:', error);
    return false;
  }
};


import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';

export interface Appointment {
  id: string;
  expert: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'canceled';
  method: 'video' | 'in-person';
}

export const getClientAppointments = async (status?: string): Promise<Appointment[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get the client profile ID
    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

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
        provider_profiles!inner(name)
      `)
      .eq('client_id', clientProfile.id);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to match the component's expected format
    return data.map(item => ({
      id: item.id,
      expert: item.provider_profiles?.name || 'Unknown Expert', // Fixed: Access name property properly
      service: item.service,
      date: item.date,
      time: item.time,
      status: item.status as 'confirmed' | 'pending' | 'canceled',
      method: item.method as 'video' | 'in-person'
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
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

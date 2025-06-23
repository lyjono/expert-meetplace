import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';
import { createLeadFromAppointment } from '@/services/leads'; // Import the lead creation function
import { startVideoCall } from '@/services/realTimeMessages'; // Import startVideoCall

export interface Appointment {
  id: string;
  expert: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'canceled' | 'completed';
  method: 'video' | 'in-person';
  client?: string;
  video_call_room_id?: string;
}

export const getClientAppointments = async (status?: string): Promise<Appointment[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: clientProfile, error: profileError } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!clientProfile) throw new Error('Client profile not found');

    let query = supabase
      .from('appointments')
      .select('id, service, date, time, status, method, video_call_room_id, provider_profiles(name)') // Simplified
      .eq('client_id', clientProfile.id);

    if (status) {
      if (status.includes(',')) {
        const statusArray = status.split(',');
        query = query.in('status', statusArray);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      expert: item.provider_profiles?.[0]?.name || 'Unknown Expert',
      service: item.service,
      date: item.date,
      time: item.time,
      status: item.status,
      method: item.method,
      video_call_room_id: item.video_call_room_id
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

    const { data: providerProfile, error: profileError } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!providerProfile) throw new Error('Provider profile not found');

    let query = supabase
      .from('appointments')
      .select('id, service, date, time, status, method, video_call_room_id, client_profiles(name)') // Simplified
      .eq('provider_id', providerProfile.id);

    if (status) {
      if (status.includes(',')) {
        const statusArray = status.split(',');
        query = query.in('status', statusArray);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      expert: 'You',
      client: item.client_profiles?.[0]?.name || 'Unknown Client',
      service: item.service,
      date: item.date,
      time: item.time,
      status: item.status,
      method: item.method,
      video_call_room_id: item.video_call_room_id
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
  method: 'video' | 'in-person',
  requiresPayment: boolean = false,
  amount?: number
): Promise<{ success: boolean; appointmentId?: string; requiresPayment?: boolean; amount?: number }> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Fetch client profile
    const { data: clientProfile, error: clientProfileError } = await supabase
      .from('client_profiles')
      .select('id, user_id') // Include user_id
      .eq('user_id', user.id)
      .single();

    if (clientProfileError) {
      console.error('Error getting client profile:', clientProfileError);
      throw clientProfileError;
    }
    if (!clientProfile) {
      console.error('Client profile not found');
      throw new Error('Client profile not found');
    }

    // Fetch provider profile to get user_id
    const { data: providerProfile, error: providerProfileError } = await supabase
      .from('provider_profiles')
      .select('user_id')
      .eq('id', providerId)
      .single();

    if (providerProfileError) {
      console.error('Error getting provider profile:', providerProfileError);
      throw providerProfileError;
    }
    if (!providerProfile) {
      console.error('Provider profile not found');
      throw new Error('Provider profile not found');
    }

    let videoCallRoomId: string | null = null;
    if (method === 'video') {
      // Use user_id values for client and provider
      videoCallRoomId = await startVideoCall(clientProfile.user_id, providerProfile.user_id);
      if (!videoCallRoomId) {
        throw new Error('Failed to create video call room');
      }
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_id: clientProfile.id,
        provider_id: providerId,
        service,
        date,
        time,
        status: 'pending',
        method,
        video_call_room_id: videoCallRoomId
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating appointment:', error);
      throw error;
    }

    console.log('Appointment created successfully:', data);

    // Create a lead for this appointment
    const leadCreated = await createLeadFromAppointment(data, providerId);
    console.log('Lead created:', leadCreated);

    return { 
      success: true, 
      appointmentId: data.id, 
      requiresPayment, 
      amount 
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false };
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




// Optional: Real-time subscription for appointments (if needed elsewhere)
export const subscribeToAppointments = (providerId: string, callback: (appointment: any) => void) => {
  const channel = supabase
    .channel('appointments-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'appointments', filter: `provider_id=eq.${providerId}` },
      async (payload) => {
        const newAppointment = payload.new;
        callback(newAppointment);
        await createLeadFromAppointment(newAppointment, providerId);
      }
    )
    .subscribe((status) => {
      console.log('Appointment subscription status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
};
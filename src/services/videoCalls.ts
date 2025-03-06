import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile, getUserType } from '@/lib/supabase';

export interface VideoCallSession {
  roomId: string;
  appointmentId: string;
  status: 'waiting' | 'active' | 'ended';
}

export const createVideoCallSession = async (appointmentId: string): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Generate a unique room ID
    const roomId = `room_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    
    // Update the appointment with the room ID
    const { error } = await supabase
      .from('appointments')
      .update({ room_id: roomId })
      .eq('id', appointmentId);
      
    if (error) throw error;
    
    return roomId;
  } catch (error) {
    console.error('Error creating video call session:', error);
    return null;
  }
};

export const joinVideoCall = async (appointmentId: string): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Get the appointment to check permission and get the room ID
    const userProfile = await getUserProfile();
    if (!userProfile) throw new Error('User profile not found');
    
    const userType = await getUserType();
    
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId);
      
    if (userType === 'client') {
      query = query.eq('client_id', userProfile.id);
    } else {
      query = query.eq('provider_id', userProfile.id);
    }
    
    const { data, error } = await query.single();
    
    if (error) throw error;
    if (!data) throw new Error('Appointment not found or you don\'t have permission');
    if (!data.room_id) throw new Error('Video call not initialized');
    
    return data.room_id;
  } catch (error) {
    console.error('Error joining video call:', error);
    return null;
  }
};

export const endVideoCall = async (appointmentId: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Update appointment status to completed
    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'completed',
        room_id: null  // Clear the room ID
      })
      .eq('id', appointmentId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error ending video call:', error);
    return false;
  }
};

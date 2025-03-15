import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile, getUserType } from '@/lib/supabase';

// Define an interface for better type safety (optional)
export interface VideoCallSession {
  roomId: string;
  appointmentId: string;
  status: 'waiting' | 'active' | 'ended';
}

/**
 * Creates a new video call session by generating a unique room ID and updating the appointment.
 * @param appointmentId - The ID of the appointment to associate with the video call.
 * @returns The generated roomId or null if an error occurs.
 */
export const createVideoCallSession = async (appointmentId: string): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Generate a unique room ID
    const roomId = `room_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    console.log('Generating roomId:', roomId);

    // Update the appointment with the room ID
    const { error } = await supabase
      .from('appointments')
      .update({ room_id: roomId })
      .eq('id', appointmentId);

    if (error) {
      console.error('Error updating appointment with roomId:', error);
      throw error;
    }

    console.log('Successfully created video call session with roomId:', roomId);
    return roomId;
  } catch (error) {
    console.error('Error creating video call session:', error);
    return null;
  }
};

/**
 * Joins an existing video call by retrieving the room ID, with retries for timing issues.
 * @param appointmentId - The ID of the appointment tied to the video call.
 * @returns The roomId or null if an error occurs.
 */
export const joinVideoCall = async (appointmentId: string): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

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

    let attempts = 0;
    const maxAttempts = 3;
    let data;

    while (attempts < maxAttempts) {
      const { data: appointmentData, error } = await query.single();

      if (error) {
        console.error('Error fetching appointment:', error);
        throw error;
      }

      if (!appointmentData) {
        throw new Error('Appointment not found or you don\'t have permission');
      }

      if (appointmentData.room_id) {
        data = appointmentData;
        break;
      }

      console.log('Room ID not set yet, retrying...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;
    }

    if (!data || !data.room_id) {
      throw new Error('Video call not initialized after retries');
    }

    console.log('Joining video call with roomId:', data.room_id);
    return data.room_id;
  } catch (error) {
    console.error('Error joining video call:', error);
    return null;
  }
};

/**
 * Ends a video call by updating the appointment status and clearing the room ID.
 * @param appointmentId - The ID of the appointment to end.
 * @returns True if successful, false if an error occurs.
 */
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

    if (error) {
      console.error('Error updating appointment to end video call:', error);
      throw error;
    }

    console.log('Successfully ended video call for appointment:', appointmentId);
    return true;
  } catch (error) {
    console.error('Error ending video call:', error);
    return false;
  }
};
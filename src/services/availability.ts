
import { supabase } from '@/lib/supabase';

export interface AvailabilitySlot {
  id: string;
  provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export const getProviderAvailability = async (providerId: string): Promise<AvailabilitySlot[]> => {
  try {
    const { data, error } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_id', providerId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching provider availability:', error);
    return [];
  }
};

export const addAvailabilitySlot = async (slot: Omit<AvailabilitySlot, 'id'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('provider_availability')
      .insert(slot);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding availability slot:', error);
    return false;
  }
};

export const deleteAvailabilitySlot = async (slotId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('provider_availability')
      .delete()
      .eq('id', slotId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting availability slot:', error);
    return false;
  }
};

export const getAvailableTimesForDate = async (providerId: string, dateString: string): Promise<string[]> => {
  try {
    // Convert date string to day of week (0 = Sunday, 1 = Monday, etc.)
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    
    const { data, error } = await supabase
      .from('provider_availability')
      .select('start_time, end_time')
      .eq('provider_id', providerId)
      .eq('day_of_week', dayOfWeek);
    
    if (error) throw error;
    
    // If no availability found for this day
    if (!data || data.length === 0) {
      return [];
    }
    
    // Generate time slots in 30-minute increments
    const availableTimes: string[] = [];
    
    data.forEach(slot => {
      // Parse start and end times
      const startParts = slot.start_time.split(':');
      const endParts = slot.end_time.split(':');
      
      let startHour = parseInt(startParts[0]);
      let startMinute = parseInt(startParts[1]);
      
      const endHour = parseInt(endParts[0]);
      const endMinute = parseInt(endParts[1]);
      
      // Generate 30-minute increments
      while (
        startHour < endHour || 
        (startHour === endHour && startMinute < endMinute)
      ) {
        const formattedHour = startHour.toString().padStart(2, '0');
        const formattedMinute = startMinute.toString().padStart(2, '0');
        availableTimes.push(`${formattedHour}:${formattedMinute}`);
        
        // Increment by 30 minutes
        startMinute += 30;
        if (startMinute >= 60) {
          startHour += 1;
          startMinute = 0;
        }
      }
    });
    
    return availableTimes;
  } catch (error) {
    console.error('Error fetching available times:', error);
    return [];
  }
};

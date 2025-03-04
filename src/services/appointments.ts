
import { query, getCurrentUser } from '@/lib/database';

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
    const clientResult = await query(
      'SELECT id FROM client_profiles WHERE user_id = $1',
      [user.id]
    );

    if (clientResult.rows.length === 0) throw new Error('Client profile not found');
    const clientId = clientResult.rows[0].id;

    // Build the SQL query
    let sql = `
      SELECT a.id, a.service, a.date, a.time, a.status, a.method, p.name as expert_name
      FROM appointments a
      JOIN provider_profiles p ON a.provider_id = p.id
      WHERE a.client_id = $1
    `;
    
    const params = [clientId];
    
    // Add status filter if provided
    if (status) {
      sql += ' AND a.status = $2';
      params.push(status);
    }
    
    const { rows } = await query(sql, params);

    // Transform data to match the component's expected format
    return rows.map(item => ({
      id: item.id,
      expert: item.expert_name || 'Unknown Expert',
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
    const result = await query(
      'UPDATE appointments SET status = $1 WHERE id = $2',
      ['canceled', appointmentId]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error canceling appointment:', error);
    return false;
  }
};

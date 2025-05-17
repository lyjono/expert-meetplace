
import { supabase } from '@/lib/supabase';

export interface ClientNote {
  id: string;
  provider_id: string;
  client_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const getClientNotes = async (clientId: string): Promise<ClientNote[]> => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching client notes:', error);
    return [];
  }
};

export const addClientNote = async (note: Omit<ClientNote, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('client_notes')
      .insert(note);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding client note:', error);
    return false;
  }
};

export const updateClientNote = async (id: string, content: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('client_notes')
      .update({ 
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating client note:', error);
    return false;
  }
};

export const deleteClientNote = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('client_notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting client note:', error);
    return false;
  }
};

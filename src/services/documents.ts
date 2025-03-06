
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  created_at: string;
  updated_at: string;
  shared_with?: string[];
}

export const getDocuments = async (): Promise<Document[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get all documents owned by the user
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

export const getSharedDocuments = async (): Promise<Document[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get all documents shared with the user
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .filter('shared_with', 'cs', `{${user.id}}`); // Using containedBy for array fields

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching shared documents:', error);
    return [];
  }
};

export const uploadDocument = async (file: File, name?: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Upload file to storage
    const fileName = name || file.name;
    const filePath = `documents/${user.id}/${Date.now()}_${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
      
    const publicUrl = urlData.publicUrl;
    
    // Add record to database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: fileName,
        file_path: publicUrl,
        file_type: file.type,
        shared_with: []
      });
      
    if (dbError) throw dbError;
    
    return true;
  } catch (error) {
    console.error('Error uploading document:', error);
    return false;
  }
};

export const shareDocument = async (documentId: string, userIds: string[]): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // First get the current document to ensure user owns it
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();
      
    if (fetchError) throw fetchError;
    if (!doc) throw new Error('Document not found or you don\'t have permission');
    
    // Update the shared_with array
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        shared_with: [...new Set([...(doc.shared_with || []), ...userIds])] // Ensure unique values
      })
      .eq('id', documentId);
      
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error sharing document:', error);
    return false;
  }
};

export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get the document to delete the file from storage too
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id) // Ensure user owns it
      .single();
      
    if (fetchError) throw fetchError;
    if (!doc) throw new Error('Document not found or you don\'t have permission');
    
    // Extract the storage path from the URL
    const storagePath = doc.file_path.split('/').slice(-3).join('/');
    
    // Delete from storage
    await supabase.storage
      .from('documents')
      .remove([storagePath]);
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
      
    if (deleteError) throw deleteError;
    
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
};

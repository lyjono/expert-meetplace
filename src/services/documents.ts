// src/lib/documents.ts
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase'; // Ensure this path is correct for your project
import { User } from '@supabase/supabase-js'; // Optional: For type safety with user object

/**
 * Represents a document record in the database and storage.
 */
export interface Document {
  id: string;           // Unique identifier for the document record
  user_id: string;      // UUID of the user who owns/uploaded the document
  name: string;         // Display name of the document file
  file_path: string;    // Public URL to access the file in Supabase Storage
  file_type: string;    // MIME type of the file (e.g., 'application/pdf')
  created_at: string;   // Timestamp when the record was created
  updated_at: string;   // Timestamp when the record was last updated
  shared_with?: string[]; // Optional array of user UUIDs the document is shared with
}

/**
 * Fetches all documents owned by the currently authenticated user.
 * @returns {Promise<Document[]>} A promise that resolves to an array of documents.
 */
export const getDocuments = async (): Promise<Document[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }); // Optional: order by most recently updated

    if (error) throw error;

    return data || []; // Return data or empty array if null
  } catch (error) {
    console.error('Error fetching documents:', error);
    return []; // Return empty array on error
  }
};

/**
 * Fetches all documents that have been shared with the currently authenticated user.
 * @returns {Promise<Document[]>} A promise that resolves to an array of shared documents.
 */
export const getSharedDocuments = async (): Promise<Document[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get all documents where the user's ID is present in the 'shared_with' array
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      // 'cs' checks if the array *contains* the specified element(s)
      // The format `{uuid}` is used for matching a single UUID in an array literal string.
      .filter('shared_with', 'cs', `{${user.id}}`)
      .order('updated_at', { ascending: false }); // Optional: order by most recently updated


    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching shared documents:', error);
    return [];
  }
};

/**
 * Fetches documents owned by the current user that have been shared with at least one other user.
 * @returns {Promise<Document[]>} A promise that resolves to an array of documents shared by the user.
 */
export const getDocumentsSharedByMe = async (): Promise<Document[]> => {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        // Filter where shared_with is not null (basic check)
        .not('shared_with', 'is', null)
        .order('updated_at', { ascending: false }); // Optional: order by most recently updated

      if (error) throw error;

      // Further filter client-side to ensure the array is not empty
      // Supabase/PostgREST filtering for empty arrays can be tricky,
      // so a client-side check is often simpler.
      const trulyShared = data?.filter(doc => doc.shared_with && doc.shared_with.length > 0) || [];

      return trulyShared;
    } catch (error) {
      console.error('Error fetching documents shared by me:', error);
      return [];
    }
  };

/**
 * Uploads a file to Supabase Storage and creates a corresponding record in the 'documents' table.
 * @param {File} file - The file object to upload.
 * @param {string} [name] - Optional custom name for the file. Defaults to file.name.
 * @returns {Promise<boolean>} A promise that resolves to true if successful, false otherwise.
 */
export const uploadDocument = async (file: File, name?: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Use provided name or default to the file's original name
    const fileName = name || file.name;
    // Construct a unique file path in storage
    const filePath = `documents/${user.id}/${Date.now()}_${fileName}`;

    // 1. Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('documents') // Make sure 'documents' is your bucket name
      .upload(filePath, file, {
          cacheControl: '3600', // Optional: Cache control settings
          upsert: false          // Optional: Set to true to overwrite if path exists
      });

    if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
    }

    // 2. Get the public URL of the uploaded file
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Note: Supabase getPublicUrl doesn't throw an error if the file doesn't exist,
    // but since we just uploaded it, it should be there.
    if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file.');
    }
    const publicUrl = urlData.publicUrl;

    // 3. Add record to the database table 'documents'
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,       // Owner of the document
        name: fileName,         // Name of the file
        file_path: publicUrl,   // Public URL from storage
        file_type: file.type,   // MIME type
        shared_with: []         // Initialize shared_with as empty array
      });

    if (dbError) {
        console.error('Database insert error:', dbError);
        // Optional: Attempt to clean up storage if DB insert fails
        await supabase.storage.from('documents').remove([filePath]);
        throw dbError;
    }

    return true; // Success
  } catch (error) {
    console.error('Error uploading document:', error);
    return false; // Failure
  }
};

/**
 * Shares a document owned by the current user with a list of other users.
 * @param {string} documentId - The ID of the document record to share.
 * @param {string[]} userIds - An array of user UUIDs to share the document with.
 * @returns {Promise<boolean>} A promise that resolves to true if successful, false otherwise.
 */
export const shareDocument = async (documentId: string, userIds: string[]): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Verify ownership: Get the document only if owned by the current user
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('shared_with') // Only select necessary field
      .eq('id', documentId)
      .eq('user_id', user.id) // Crucial ownership check
      .single(); // Expect exactly one result or null

    if (fetchError) {
        // Differentiate between 'not found' and other errors if needed
        if (fetchError.code === 'PGRST116') { // PostgREST code for 'Exactly one row expected'
             throw new Error('Document not found or you don\'t have permission to share it.');
        }
        throw fetchError;
    }
    // No need to check `!doc` explicitly because `.single()` throws if not found

    // 2. Update the shared_with array
    // Merge existing shared users with new ones, ensuring uniqueness
    const existingShared = doc.shared_with || [];
    const updatedSharedWith = [...new Set([...existingShared, ...userIds])];

    const { error: updateError } = await supabase
      .from('documents')
      .update({
        shared_with: updatedSharedWith,
        updated_at: new Date().toISOString() // Explicitly update timestamp
      })
      .eq('id', documentId); // Target the specific document

    if (updateError) throw updateError;

    return true; // Success
  } catch (error) {
    console.error('Error sharing document:', error);
    return false; // Failure
  }
};

/**
 * Deletes a document record from the database and the corresponding file from storage.
 * Only the owner of the document can delete it.
 * @param {string} documentId - The ID of the document record to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if successful, false otherwise.
 */
export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Verify ownership and get file path
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('file_path') // Only select needed field
      .eq('id', documentId)
      .eq('user_id', user.id) // Crucial ownership check
      .single();

    if (fetchError) {
        if (fetchError.code === 'PGRST116') {
             throw new Error('Document not found or you don\'t have permission to delete it.');
        }
        throw fetchError;
    }

    // 2. Extract storage path from the public URL
    // Example URL: https://<project_ref>.supabase.co/storage/v1/object/public/documents/documents/user-id/file-name
    // We need the part after the bucket name: 'documents/user-id/file-name'
    const bucketName = 'documents'; // Your bucket name
    const urlParts = doc.file_path.split(`/storage/v1/object/public/${bucketName}/`);
    if (urlParts.length < 2 || !urlParts[1]) {
        console.warn(`Could not extract storage path from URL: ${doc.file_path}. Skipping storage deletion.`);
        // Proceed to delete DB record even if storage path extraction fails
    } else {
        const storagePath = urlParts[1];
        // 3. Delete file from storage
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([storagePath]);

        if (storageError) {
            // Log storage error but proceed to delete DB record
            console.error(`Error deleting file from storage (${storagePath}):`, storageError);
            // Depending on requirements, you might want to throw here and prevent DB deletion
            // throw storageError;
        }
    }


    // 4. Delete record from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId); // Target the specific document

    if (deleteError) throw deleteError;

    return true; // Success
  } catch (error) {
    console.error('Error deleting document:', error);
    return false; // Failure
  }
};


// --- Optional Helper: Get User Profiles ---
// Assumes you have a 'profiles' table linked to auth.users via 'id'
// with columns like 'full_name' and 'avatar_url'.

/**
 * Represents a user profile structure.
 */
export interface UserProfile {
    id: string;
    full_name?: string;
    avatar_url?: string;
    // Add other profile fields as needed (e.g., email, role)
  }

/**
 * Fetches profile information for a given list of user IDs.
 * @param {string[]} userIds - An array of user UUIDs to fetch profiles for.
 * @returns {Promise<Map<string, UserProfile>>} A promise resolving to a Map where keys are user IDs and values are UserProfile objects.
 */
export const getUserProfiles = async (userIds: string[]): Promise<Map<string, UserProfile>> => {
    const profileMap = new Map<string, UserProfile>();
    if (!userIds || userIds.length === 0) {
      return profileMap; // Return empty map if no IDs provided
    }

    // Remove duplicates just in case
    const uniqueUserIds = [...new Set(userIds)];

    try {
      const { data, error } = await supabase
        .from('profiles') // Replace 'profiles' with your actual profiles table name
        .select('id, full_name, avatar_url') // Select desired profile fields
        .in('id', uniqueUserIds); // Fetch profiles matching the IDs

      if (error) throw error;

      // Populate the map for easy lookup
      data?.forEach(profile => {
        if (profile.id) { // Ensure profile and id exist
            profileMap.set(profile.id, profile as UserProfile);
        }
      });

      return profileMap;

    } catch (error) {
      console.error('Error fetching user profiles:', error);
      return profileMap; // Return empty map on error
    }
  };
// src/services/documents.ts
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase'; // Ensure this path is correct for your project
import { User } from '@supabase/supabase-js'; // Optional: For type safety with user object
import { checkProviderLimit, updateProviderUsage } from './providerSubscriptions';

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
isChatDocument?: boolean; // Optional flag to identify chat documents
  message_id?: string; // Optional: Store message ID for reference
 file_size_mb?: number;
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
 * Fetches documents shared via chat messages where the current user is either sender or receiver.
 * @returns {Promise<Document[]>} A promise that resolves to an array of chat documents.
 */
export const getChatDocuments = async (): Promise<Document[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, attachment_url, attachment_name, attachment_type, created_at')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .not('attachment_url', 'is', null)
      .not('attachment_name', 'is', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const chatDocuments: Document[] = (data || []).map((message) => {
      // Determine the sender ID (the other user in the conversation)
      const senderId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
      return {
        id: message.id,
        user_id: senderId, // Use senderId to reflect the actual sender
        name: message.attachment_name || 'Unnamed Attachment',
        file_path: message.attachment_url,
        file_type: message.attachment_type || 'application/octet-stream',
        created_at: message.created_at || new Date().toISOString(),
        updated_at: message.created_at || new Date().toISOString(),
        shared_with: [message.sender_id, message.receiver_id],
        isChatDocument: true,
        message_id: message.id,
        sender_id: senderId, // Explicitly include sender_id
      };
    });

    return chatDocuments;
  } catch (error) {
    console.error('Error fetching chat documents:', error);
    return [];
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

    // Check if user is a provider
    const { data: provider, error: providerError } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (providerError && providerError.code !== 'PGRST116') {
      console.error('Error checking provider profile:', providerError);
      throw providerError;
    }

    // Calculate file size in MB
    const fileSizeMb = file.size / (1024 * 1024); // Convert bytes to MB
    console.log(`Uploading document for user ${user.id}, size: ${fileSizeMb.toFixed(2)} MB`);

    if (provider) {
      // Check storage limit
      console.log(`Checking storage for provider ${provider.id}`);
      await checkProviderLimit(provider.id, 'storage', { storageSizeMb: fileSizeMb });
    }

    // Use provided name or default to file's
    const fileName = name || file.name;
    const filePath = `documents/${user.id}/${Date.now()}_${fileName}`;

    // Upload file to storage
    console.log(`Uploading file to storage: ${filePath}`);
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      console.error('Failed to get public URL for file:', filePath);
      throw new Error('Failed to get public URL');
    }

    // Insert into documents table
    console.log(`Inserting document: '${fileName}', size: ${Math.ceil(fileSizeMb)} MB`);
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: fileName,
        file_path: urlData.publicUrl,
        file_type: file.type,
        shared_with: [],
        file_size_mb: Math.ceil(fileSizeMb),
      });

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up storage
      await supabase.storage.from('documents').remove([filePath]);
      throw dbError;
    }

    // Update provider usage if applicable
    if (provider) {
      console.log(`Updating provider ${provider.id} usage`);
      const usageUpdated = await updateProviderUsage(provider.id, 'storage', { storageSizeMb: fileSizeMb });
      if (!usageUpdated) {
        console.error(`Failed to update usage for ${provider.id}`);
        // Log warning, but don't fail the upload
      }
    }

    console.log(`File uploaded: '${fileName}' successfully`);
    return true;
  } catch (err) {
    console.error('Upload error:', err);
    return false;
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

  // Remove duplicates
  const uniqueUserIds = [...new Set(userIds)];

  try {
    // Fetch from client_profiles
    const { data: clientData, error: clientError } = await supabase
      .from('client_profiles')
      .select('user_id, name, avatar_url')
      .in('user_id', uniqueUserIds);

    if (clientError) throw clientError;

    // Fetch from provider_profiles
    const { data: providerData, error: providerError } = await supabase
      .from('provider_profiles')
      .select('user_id, name, image_url')
      .in('user_id', uniqueUserIds);

    if (providerError) throw providerError;

    // Map client profiles
    clientData?.forEach((profile) => {
      if (profile.user_id) {
        profileMap.set(profile.user_id, {
          id: profile.user_id,
          full_name: profile.name || `User ${profile.user_id.slice(0, 8)}`,
          avatar_url: profile.avatar_url,
        });
      }
    });

    // Map provider profiles, overwriting client profiles if user_id exists in both (unlikely)
    providerData?.forEach((profile) => {
      if (profile.user_id) {
        profileMap.set(profile.user_id, {
          id: profile.user_id,
          full_name: profile.name || `User ${profile.user_id.slice(0, 8)}`,
          avatar_url: profile.image_url, // Map image_url to avatar_url
        });
      }
    });

    // Fallback for any user_ids not found in either table
    uniqueUserIds.forEach((id) => {
      if (!profileMap.has(id)) {
        profileMap.set(id, {
          id,
          full_name: `Anonymous User`, // Changed for privacy
          avatar_url: undefined,
        });
      }
    });

    return profileMap;
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    // Fallback to prevent UI crashes
    uniqueUserIds.forEach((id) => {
      profileMap.set(id, {
        id,
        full_name: `Anonymous User`,
        avatar_url: undefined,
      });
    });
    return profileMap;
  }
};
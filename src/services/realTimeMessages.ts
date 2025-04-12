import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';
import { createLeadFromMessage } from '@/services/leads';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_name?: string;
  receiver_name?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  is_video_call?: boolean;
}

export const sendMessage = async (
  senderId: string, 
  receiverId: string, 
  content: string, 
  attachment?: File
): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let attachmentUrl = null;
    let attachmentName = null;
    let attachmentType = null;

    if (attachment) {
      const fileName = `${Date.now()}_${attachment.name}`;
      const { data, error } = await supabase.storage
        .from('chat_attachments')
        .upload(`${senderId}/${fileName}`, attachment, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      
      const { data: publicUrl } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(`${senderId}/${fileName}`);
      
      attachmentUrl = publicUrl.publicUrl;
      attachmentName = attachment.name;
      attachmentType = attachment.type;
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

export const startVideoCall = async (senderId: string, receiverId: string): Promise<string | null> => {
  try {
    const roomId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: 'Video call invitation',
        is_video_call: true,
        attachment_url: roomId
      });

    if (error) throw error;
    return roomId;
  } catch (error) {
    console.error('Error starting video call:', error);
    return null;
  }
};

export const joinVideoCall = async (roomId: string): Promise<boolean> => {
  try {
    if (!navigator.mediaDevices || !window.RTCPeerConnection) {
      console.error('WebRTC is not supported in this browser');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error joining video call:', error);
    return false;
  }
};

export const getConversations = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    const conversations = new Map();
    for (const message of data) {
      const otherUserId = message.sender_id === userId 
        ? message.receiver_id 
        : message.sender_id;
      
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, message);
      }
    }

    return Array.from(conversations.values());
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

export const getConversation = async (userId: string, otherUserId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Supabase error: ${error.message}`);
    await markMessagesAsRead(otherUserId, userId);
    return data || [];
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error; // Optionally rethrow to handle in UI
  }
};

export const markMessagesAsRead = async (senderId: string, receiverId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('read', false);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

export const subscribeToMessages = (
  callback: (message: any) => void,
  errorCallback?: (error: any) => void
) => {
  const channel = supabase
    .channel('messages-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      async (payload) => {
        const newMessage = payload.new;
        callback(newMessage);

        const { data: receiver } = await supabase
          .from('users_view')
          .select('user_type')
          .eq('user_id', newMessage.receiver_id)
          .single();
        if (receiver?.user_type === 'provider') {
    const leadCreated = await createLeadFromMessage(newMessage, newMessage.receiver_id);
          console.log('Lead created from message:', leadCreated);
        }
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
      if (status === 'SUBSCRIBED') console.log('Successfully subscribed to messages!');
      if (status === 'CLOSED') console.log('Subscription closed');
    });

  return () => {
    console.log('Unsubscribing from messages channel');
    supabase.removeChannel(channel);
  };
  };

export const getProviderUserId = async (providerId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('user_id')
      .eq('id', providerId)
      .single();
      
    if (error) throw error;
    return data?.user_id || null;
  } catch (error) {
    console.error('Error getting provider user ID:', error);
    return null;
  }
};

export const getClientUserId = async (clientId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('user_id')
      .eq('id', clientId)
      .single();
      
    if (error) throw error;
    return data?.user_id || null;
  } catch (error) {
    console.error('Error getting client user ID:', error);
    return null;
  }
};

export const getUserFullName = async (userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('users_view')
      .select('name')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    return data?.name || 'Unknown User';
  } catch (error) {
    console.error('Error getting user name:', error);
    return 'Unknown User';
  }
};

export { getCurrentUser };

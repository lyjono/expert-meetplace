
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_name?: string;
  receiver_name?: string;
}

export const sendMessage = async (senderId: string, receiverId: string, content: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
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

    if (error) throw error;
    
    await markMessagesAsRead(otherUserId, userId);

    return data || [];
  } catch (error) {
    console.error('Error getting conversation:', error);
    return [];
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
  callback: (message: Message) => void,
  errorCallback?: (error: any) => void
) => {
  try {
    // Enable realtime subscription for the messages table
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        },
        (payload) => {
          console.log('New message received in subscription:', payload);
          callback(payload.new as Message);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to messages!');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('Subscription closed or error:', status);
          errorCallback && errorCallback(new Error(`Subscription status: ${status}`));
        }
      });
      
    // Return unsubscribe function
    return () => {
      console.log('Unsubscribing from messages channel');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error setting up subscription:', error);
    errorCallback && errorCallback(error);
    return () => {};
  }
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

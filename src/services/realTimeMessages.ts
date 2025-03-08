
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

export const sendMessage = async (receiverId: string, content: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
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

export const getConversation = async (otherUserId: string): Promise<Message[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .and(`sender_id.eq.${otherUserId},receiver_id.eq.${user.id}`)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${otherUserId}`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Mark received messages as read
    const messagesToUpdate = data
      .filter(msg => msg.receiver_id === user.id && !msg.read)
      .map(msg => msg.id);
      
    if (messagesToUpdate.length > 0) {
      await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messagesToUpdate);
    }

    return data || [];
  } catch (error) {
    console.error('Error getting conversation:', error);
    return [];
  }
};

export const subscribeToMessages = (
  callback: (message: Message) => void,
  errorCallback?: (error: any) => void
) => {
  try {
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          errorCallback && errorCallback(new Error(`Failed to subscribe: ${status}`));
        }
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
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

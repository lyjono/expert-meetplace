
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

export const getConversations = async (): Promise<any[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get all messages where current user is either sender or receiver
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        created_at,
        read
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by conversation partner
    const conversations = {};
    
    for (const message of data) {
      // Determine conversation partner (the other person)
      const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
      
      if (!conversations[partnerId]) {
        // Get partner name
        const { data: userData } = await supabase
          .from('users_view') // Assuming a view that combines both client and provider profiles
          .select('id, name, user_type')
          .eq('user_id', partnerId)
          .single();
          
        conversations[partnerId] = {
          id: partnerId,
          name: userData?.name || 'Unknown User',
          user_type: userData?.user_type || 'unknown',
          last_message: message.content,
          last_message_time: message.created_at,
          unread: message.sender_id !== user.id && !message.read ? 1 : 0
        };
      } else if (message.sender_id !== user.id && !message.read) {
        conversations[partnerId].unread += 1;
      }
    }
    
    return Object.values(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

export const getMessages = async (partnerId: string): Promise<Message[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get all messages between current user and partner
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark messages as read
    const messagesToUpdate = data
      .filter(msg => msg.sender_id === partnerId && !msg.read)
      .map(msg => msg.id);
      
    if (messagesToUpdate.length > 0) {
      await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messagesToUpdate);
    }

    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const sendMessage = async (receiverId: string, content: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        read: false
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

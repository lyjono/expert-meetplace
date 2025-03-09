
import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser, supabase } from '@/lib/supabase';
import { getConversations, getConversation, sendMessage, markMessagesAsRead } from '@/services/realTimeMessages';
import { toast } from 'sonner';

type Contact = {
  id: string;
  name: string;
  lastMessage?: string;
  avatar?: string;
  unreadCount: number;
  user_id: string;
};

type Message = {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
  isMine?: boolean;
};

const MessagesPage = () => {
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // Get contacts/conversations
  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const conversations = await getConversations(currentUser.id);
        
        const contactsData: Contact[] = [];
        
        for (const convo of conversations) {
          // Get the other user ID
          const otherUserId = convo.sender_id === currentUser.id ? convo.receiver_id : convo.sender_id;
          
          // Get the other user's profile (either client or provider)
          const { data: providerData } = await supabase
            .from('provider_profiles')
            .select('id, name, image_url, user_id')
            .eq('user_id', otherUserId)
            .single();
            
          const { data: clientData } = await supabase
            .from('client_profiles')
            .select('id, name, avatar_url, user_id')
            .eq('user_id', otherUserId)
            .single();
            
          const profile = providerData || clientData;
          
          if (profile) {
            // Count unread messages
            const { data: unreadMessages } = await supabase
              .from('messages')
              .select('id')
              .eq('sender_id', otherUserId)
              .eq('receiver_id', currentUser.id)
              .eq('read', false);
              
            // Create contact
            contactsData.push({
              id: profile.id,
              name: profile.name,
              lastMessage: convo.content,
              avatar: 'image_url' in profile ? profile.image_url : profile.avatar_url,
              unreadCount: unreadMessages?.length || 0,
              user_id: otherUserId
            });
          }
        }
        
        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContacts();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Only update if the message is related to the current user
          if (currentUser && 
             (payload.new.sender_id === currentUser.id || 
              payload.new.receiver_id === currentUser.id)) {
            
            // Refresh contacts list to update unread counts and last messages
            const conversations = await getConversations(currentUser.id);
            fetchContacts();
            
            // If currently viewing this conversation, add the message to the chat
            if (activeContact && 
               ((payload.new.sender_id === activeContact.user_id && payload.new.receiver_id === currentUser.id) || 
                (payload.new.receiver_id === activeContact.user_id && payload.new.sender_id === currentUser.id))) {
              
              setMessages(prev => [
                ...prev, 
                {
                  ...payload.new as Message,
                  isMine: payload.new.sender_id === currentUser.id
                }
              ]);
              
              // Mark message as read if it's for the current user
              if (payload.new.receiver_id === currentUser.id) {
                markMessagesAsRead(activeContact.user_id, currentUser.id);
              }
            }
          }
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser, activeContact]);

  // Load messages when active contact changes
  useEffect(() => {
    const loadMessages = async () => {
      if (currentUser && activeContact) {
        try {
          const messagesData = await getConversation(currentUser.id, activeContact.user_id);
          setMessages(messagesData.map(msg => ({
            ...msg,
            isMine: msg.sender_id === currentUser.id
          })));
          
          // Mark messages as read
          markMessagesAsRead(activeContact.user_id, currentUser.id);
          
          // Update the unread count for this contact
          setContacts(prev => prev.map(contact => 
            contact.id === activeContact.id 
              ? { ...contact, unreadCount: 0 } 
              : contact
          ));
        } catch (error) {
          console.error('Error loading messages:', error);
          toast.error('Failed to load messages');
        }
      }
    };
    
    loadMessages();
  }, [currentUser, activeContact]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !activeContact) return;
    
    try {
      const success = await sendMessage(currentUser.id, activeContact.user_id, newMessage);
      
      if (success) {
        setNewMessage("");
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout userType="user">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with experts in real-time
        </p>
      </div>

      <div className="grid gap-6 mt-6">
        <Card className="border-0 shadow-md">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="all">All Messages</TabsTrigger>
                <TabsTrigger value="unread" className="flex items-center gap-2">
                  Unread
                  {contacts.reduce((acc, contact) => acc + contact.unreadCount, 0) > 0 && (
                    <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {contacts.reduce((acc, contact) => acc + contact.unreadCount, 0)}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="grid md:grid-cols-12 h-[calc(100vh-14rem)]">
              <TabsContent value="all" className="m-0 col-span-4 border-r h-full">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search contacts..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="h-[calc(100vh-18rem)]">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <p className="text-muted-foreground">Loading conversations...</p>
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="flex justify-center items-center h-24">
                      <p className="text-muted-foreground">No conversations found</p>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-muted transition-colors ${
                          activeContact?.id === contact.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setActiveContact(contact)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-medium truncate">{contact.name}</h4>
                            {contact.unreadCount > 0 && (
                              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {contact.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {contact.lastMessage || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="unread" className="m-0 col-span-4 border-r h-full">
                <ScrollArea className="h-[calc(100vh-18rem)]">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <p className="text-muted-foreground">Loading conversations...</p>
                    </div>
                  ) : contacts.filter(c => c.unreadCount > 0).length === 0 ? (
                    <div className="flex justify-center items-center h-24">
                      <p className="text-muted-foreground">No unread messages</p>
                    </div>
                  ) : (
                    contacts
                      .filter(c => c.unreadCount > 0)
                      .map((contact) => (
                        <div
                          key={contact.id}
                          className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-muted transition-colors ${
                            activeContact?.id === contact.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setActiveContact(contact)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-sm font-medium truncate">{contact.name}</h4>
                              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {contact.unreadCount}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {contact.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </ScrollArea>
              </TabsContent>
              
              <div className="col-span-8 flex flex-col h-full">
                {activeContact ? (
                  <>
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={activeContact.avatar || "/placeholder.svg"} alt={activeContact.name} />
                          <AvatarFallback>{activeContact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{activeContact.name}</h3>
                          <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                      {messages.length === 0 ? (
                        <div className="flex justify-center items-center h-24">
                          <p className="text-muted-foreground">No messages yet. Send a message to start the conversation.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                  message.isMine
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <span className={`text-xs ${message.isMine ? "text-primary-foreground/80" : "text-muted-foreground"} block mt-1`}>
                                  {new Date(message.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                    
                    <div className="p-4 border-t mt-auto">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                        className="flex gap-2"
                      >
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button type="submit" size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="max-w-md space-y-2">
                      <h3 className="text-lg font-medium">Select a conversation</h3>
                      <p className="text-muted-foreground">
                        Choose a contact from the list to view your conversation history
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;


import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, supabase } from '@/lib/supabase';
import { 
  getConversations, 
  getConversation, 
  sendMessage, 
  markMessagesAsRead, 
  subscribeToMessages,
  getUserFullName 
} from '@/services/realTimeMessages';
import { toast } from 'sonner';

type Contact = {
  id: string;
  name: string;
  lastMessage?: string;
  avatar?: string;
  unreadCount: number;
  user_id: string;
  lastMessageTime: string;
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
  const location = useLocation();
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contactId = params.get('contactId');
    if (contactId && contacts.length > 0) {
      const contact = contacts.find(c => c.user_id === contactId);
      if (contact) {
        setActiveContact(contact);
      }
    }
  }, [location, contacts]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const conversations = await getConversations(currentUser.id);
        
        const contactsData: Contact[] = [];
        
        for (const convo of conversations) {
          const otherUserId = convo.sender_id === currentUser.id ? convo.receiver_id : convo.sender_id;
          
          const userName = await getUserFullName(otherUserId);
          
          const { data: unreadMessages } = await supabase
            .from('messages')
            .select('id')
            .eq('sender_id', otherUserId)
            .eq('receiver_id', currentUser.id)
            .eq('read', false);
            
          contactsData.push({
            id: convo.id,
            name: userName,
            lastMessage: convo.content,
            avatar: '/placeholder.svg',
            unreadCount: unreadMessages?.length || 0,
            user_id: otherUserId,
            lastMessageTime: formatMessageTime(convo.created_at)
          });
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
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = subscribeToMessages(
      async (newMessage) => {
        console.log('New message received:', newMessage);
        
        if (newMessage.sender_id === currentUser.id || newMessage.receiver_id === currentUser.id) {
          if (activeContact && 
             (newMessage.sender_id === activeContact.user_id || newMessage.receiver_id === activeContact.user_id)) {
            setMessages(prev => [
              ...prev, 
              {
                ...newMessage,
                isMine: newMessage.sender_id === currentUser.id
              }
            ]);
            
            if (newMessage.receiver_id === currentUser.id) {
              await markMessagesAsRead(activeContact.user_id, currentUser.id);
            }
          }
          
          const otherUserId = newMessage.sender_id === currentUser.id 
            ? newMessage.receiver_id 
            : newMessage.sender_id;
          
          const existingContact = contacts.find(c => c.user_id === otherUserId);
          
          if (existingContact) {
            setContacts(prev => prev.map(contact => 
              contact.user_id === otherUserId 
                ? { 
                    ...contact, 
                    lastMessage: newMessage.content,
                    lastMessageTime: "Just now",
                    unreadCount: newMessage.sender_id === contact.user_id && newMessage.receiver_id === currentUser.id 
                      ? contact.unreadCount + 1 
                      : contact.unreadCount
                  } 
                : contact
            ));
          } else {
            const userName = await getUserFullName(otherUserId);
            setContacts(prev => [
              {
                id: newMessage.id,
                name: userName,
                lastMessage: newMessage.content,
                avatar: '/placeholder.svg',
                unreadCount: newMessage.sender_id === otherUserId ? 1 : 0,
                user_id: otherUserId,
                lastMessageTime: "Just now"
              },
              ...prev
            ]);
          }
        }
      },
      (error) => {
        console.error('Subscription error:', error);
        toast.error('Lost connection to message service');
      }
    );
    
    return unsubscribe;
  }, [currentUser, activeContact, contacts]);

  useEffect(() => {
    const loadMessages = async () => {
      if (currentUser && activeContact) {
        try {
          const messagesData = await getConversation(currentUser.id, activeContact.user_id);
          setMessages(messagesData.map(msg => ({
            ...msg,
            isMine: msg.sender_id === currentUser.id
          })));
          
          await markMessagesAsRead(activeContact.user_id, currentUser.id);
          
          setContacts(prev => prev.map(contact => 
            contact.user_id === activeContact.user_id 
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

  const formatMessageTime = (timeString: string) => {
    if (!timeString) return '';
    
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
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
                          activeContact?.user_id === contact.user_id ? "bg-muted" : ""
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
                            <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground truncate">
                              {contact.lastMessage || "No messages yet"}
                            </p>
                            {contact.unreadCount > 0 && (
                              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ml-2">
                                {contact.unreadCount}
                              </Badge>
                            )}
                          </div>
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
                            activeContact?.user_id === contact.user_id ? "bg-muted" : ""
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
                              <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-muted-foreground truncate">
                                {contact.lastMessage || "No messages yet"}
                              </p>
                              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ml-2">
                                {contact.unreadCount}
                              </Badge>
                            </div>
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
                        </div>
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4 h-full overflow-auto">
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
                                  {formatMessageTime(message.created_at)}
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
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
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

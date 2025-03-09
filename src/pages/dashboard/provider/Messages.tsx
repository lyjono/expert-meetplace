import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send } from "lucide-react";
import { toast } from "sonner";
import { 
  getConversation, 
  sendMessage, 
  subscribeToMessages, 
  Message as MessageType,
  getUserFullName
} from "@/services/realTimeMessages";
import { getCurrentUser } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  status: string;
}

const Messages = () => {
  const location = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageText, setMessageText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contactId = params.get('contactId');
    if (contactId) {
      setSelectedContactId(contactId);
    }
  }, [location]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoadingContacts(true);
      try {
        const user = await getCurrentUser();
        if (!user) return;

        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;

        const contactIds = new Set<string>();
        messagesData.forEach(msg => {
          if (msg.sender_id !== user.id) contactIds.add(msg.sender_id);
          if (msg.receiver_id !== user.id) contactIds.add(msg.receiver_id);
        });

        const contactsData: Contact[] = [];
        for (const contactId of contactIds) {
          const userName = await getUserFullName(contactId);

          const latestMessage = messagesData.find(msg => 
            (msg.sender_id === contactId && msg.receiver_id === user.id) || 
            (msg.sender_id === user.id && msg.receiver_id === contactId)
          );

          if (!latestMessage) continue;

          const unreadCount = messagesData.filter(msg => 
            msg.sender_id === contactId && 
            msg.receiver_id === user.id && 
            !msg.read
          ).length;

          contactsData.push({
            id: contactId,
            name: userName,
            lastMessage: latestMessage.content,
            lastMessageTime: formatMessageTime(latestMessage.created_at),
            unread: unreadCount,
            status: 'User'
          });
        }

        setContacts(contactsData);
        setIsLoadingContacts(false);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setIsLoadingContacts(false);
        toast.error("Failed to load contacts");
      }
    };
    
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContactId && currentUserId) {
      setIsLoadingMessages(true);
      getConversation(currentUserId, selectedContactId)
        .then(result => {
          setMessages(result);
          setIsLoadingMessages(false);
        })
        .catch(error => {
          console.error("Error fetching messages:", error);
          setIsLoadingMessages(false);
          toast.error("Failed to load messages");
        });
    }
  }, [selectedContactId, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    
    const unsubscribe = subscribeToMessages(
      async (newMessage) => {
        console.log("New message received:", newMessage);
        
        if (newMessage.sender_id === currentUserId || newMessage.receiver_id === currentUserId) {
          if (selectedContactId && 
             (newMessage.sender_id === selectedContactId || newMessage.receiver_id === selectedContactId)) {
            setMessages(prev => [...prev, newMessage]);
          }
          
          const otherUserId = newMessage.sender_id === currentUserId 
            ? newMessage.receiver_id 
            : newMessage.sender_id;
          
          const existingContact = contacts.find(c => c.id === otherUserId);
          
          if (existingContact) {
            setContacts(prev => 
              prev.map(contact => {
                if (contact.id === otherUserId) {
                  return {
                    ...contact,
                    lastMessage: newMessage.content,
                    lastMessageTime: "Just now",
                    unread: newMessage.sender_id === otherUserId ? contact.unread + 1 : contact.unread
                  };
                }
                return contact;
              })
            );
          } else {
            const userName = await getUserFullName(otherUserId);
            setContacts(prev => [
              {
                id: otherUserId,
                name: userName,
                lastMessage: newMessage.content,
                lastMessageTime: "Just now",
                unread: newMessage.sender_id === otherUserId ? 1 : 0,
                status: 'New Contact',
                avatar: '/placeholder.svg'
              },
              ...prev
            ]);
          }
        }
      },
      (error) => {
        console.error("Subscription error:", error);
        toast.error("Lost connection to message service");
      }
    );
    
    return unsubscribe;
  }, [currentUserId, selectedContactId, contacts]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, unread: 0 } 
          : contact
      )
    );
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedContactId || !currentUserId) return;
    
    try {
      const success = await sendMessage(
        currentUserId,
        selectedContactId,
        messageText
      );
      
      if (success) {
        setMessageText("");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
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
    <DashboardLayout userType="provider">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with your clients and manage conversations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-3">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search contacts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-1 mt-3">
              {isLoadingContacts ? (
                <div className="text-center py-4">Loading contacts...</div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No conversations yet</div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                      selectedContactId === contact.id
                        ? "bg-accent"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleContactSelect(contact.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={contact.avatar || "/placeholder.svg"}
                        alt={contact.name}
                      />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {contact.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {contact.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {contact.lastMessage}
                      </p>
                    </div>
                    {contact.unread > 0 && (
                      <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {contact.unread}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedContactId ? (
            <CardContent className="p-0 flex flex-col h-[600px]">
              <div className="p-3 border-b flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={contacts.find(c => c.id === selectedContactId)?.avatar || "/placeholder.svg"}
                    alt={contacts.find(c => c.id === selectedContactId)?.name || "Contact"}
                  />
                  <AvatarFallback>
                    {contacts.find(c => c.id === selectedContactId)?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {contacts.find(c => c.id === selectedContactId)?.name || "Contact"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contacts.find(c => c.id === selectedContactId)?.status || "User"}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <p className="text-center text-muted-foreground">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((message, i) => (
                    <div
                      key={message.id || i}
                      className={`flex ${
                        message.sender_id === currentUserId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender_id === currentUserId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block text-right">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || !selectedContactId}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Select a conversation to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;


import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { getConversation, sendMessage, subscribeToMessages, Message } from "@/services/realTimeMessages";
import { getCurrentUser } from "@/lib/supabase";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check if we were directed here with a contactId
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contactId = params.get('contactId');
    if (contactId) {
      setSelectedContactId(contactId);
    }
  }, [location]);

  // Get current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Load contacts
  useEffect(() => {
    // This would fetch actual contacts from the backend
    // For now, we're using sample data
    setContacts([
      {
        id: "1",
        name: "Sarah Williams",
        lastMessage: "I'll send you the documents tomorrow.",
        lastMessageTime: "10:45 AM",
        unread: 2,
        status: "Financial Planning Client",
      },
      {
        id: "2",
        name: "Alex Johnson",
        lastMessage: "Thank you for the tax advice.",
        lastMessageTime: "Yesterday",
        unread: 0,
        status: "Tax Consultation Client",
      },
    ]);
  }, []);

  // Load messages when a contact is selected
  useEffect(() => {
    if (selectedContactId) {
      setIsLoadingMessages(true);
      getConversation(selectedContactId)
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
  }, [selectedContactId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!currentUserId) return;
    
    const unsubscribe = subscribeToMessages(
      (newMessage) => {
        // Only update if the message is part of the current conversation
        if (
          selectedContactId && 
          (newMessage.sender_id === selectedContactId || newMessage.receiver_id === selectedContactId)
        ) {
          setMessages(prev => [...prev, newMessage]);
        }
        
        // Update contacts with new message info
        setContacts(prev => 
          prev.map(contact => {
            if (contact.id === newMessage.sender_id || contact.id === newMessage.receiver_id) {
              return {
                ...contact,
                lastMessage: newMessage.content,
                lastMessageTime: "Just now",
                unread: contact.id === newMessage.sender_id ? contact.unread + 1 : contact.unread
              };
            }
            return contact;
          })
        );
      },
      (error) => {
        console.error("Subscription error:", error);
        toast.error("Lost connection to message service");
      }
    );
    
    return unsubscribe;
  }, [currentUserId, selectedContactId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    // Reset unread count when selecting a contact
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, unread: 0 } 
          : contact
      )
    );
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedContactId) return;
    
    try {
      const success = await sendMessage(selectedContactId, messageText);
      
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
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout userType="user">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with providers and manage conversations.
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
              />
            </div>
            <div className="space-y-1 mt-3">
              {contacts.map((contact) => (
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
              ))}
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
                    {contacts.find(c => c.id === selectedContactId)?.name.charAt(0) || "?"}
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
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    type="button"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
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

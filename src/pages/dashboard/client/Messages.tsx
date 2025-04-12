import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Paperclip, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCurrentUser, supabase } from '@/lib/supabase';
import { 
  getConversations, 
  getConversation, 
  sendMessage, 
  markMessagesAsRead, 
  subscribeToMessages,
  getUserFullName,
  startVideoCall,
  joinVideoCall
} from '@/services/realTimeMessages';
import { toast } from 'sonner';
import VideoCall from '@/components/VideoCall';

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
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  is_video_call?: boolean;
  isMine?: boolean;
};

const MessagesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);
  const [videoCallRoom, setVideoCallRoom] = useState<string | null>(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const activeContactRef = useRef(activeContact);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

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
      if (contact) setActiveContact(contact);
    }
  }, [location, contacts]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
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
            lastMessageTime: formatMessageTime(convo.created_at),
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
        if (newMessage.sender_id === currentUser.id || newMessage.receiver_id === currentUser.id) {
          if (newMessage.is_video_call && newMessage.receiver_id === currentUser.id) {
            toast.success(`Incoming video call`, {
              action: {
                label: "Join",
                onClick: () => {
                  setVideoCallRoom(newMessage.attachment_url || null);
                  setIsVideoCallActive(true);
                },
              },
              duration: 10000,
            });
          }
          setMessages(prev => {
            if (activeContactRef.current && 
                (newMessage.sender_id === activeContactRef.current.user_id || newMessage.receiver_id === activeContactRef.current.user_id)) {
              return [
                ...prev,
                { ...newMessage, isMine: newMessage.sender_id === currentUser.id },
              ];
            }
            return prev;
          });
          if (newMessage.receiver_id === currentUser.id && activeContactRef.current?.user_id === newMessage.sender_id) {
            await markMessagesAsRead(newMessage.sender_id, currentUser.id);
          }
          const otherUserId = newMessage.sender_id === currentUser.id ? newMessage.receiver_id : newMessage.sender_id;
          setContacts(prev => {
            const existingContact = prev.find(c => c.user_id === otherUserId);
            if (existingContact) {
              return prev.map(contact =>
                contact.user_id === otherUserId
                  ? {
                      ...contact,
                      lastMessage: newMessage.is_video_call ? "Video call" : newMessage.content,
                      lastMessageTime: "Just now",
                      unreadCount: newMessage.sender_id === contact.user_id && 
                                  newMessage.receiver_id === currentUser.id && 
                                  contact.user_id !== activeContactRef.current?.user_id
                        ? contact.unreadCount + 1
                        : contact.unreadCount,
                    }
                  : contact
              );
            } else {
              getUserFullName(otherUserId).then(userName => {
                setContacts(prevContacts => [
                  {
                    id: newMessage.id,
                    name: userName,
                    lastMessage: newMessage.is_video_call ? "Video call" : newMessage.content,
                    avatar: '/placeholder.svg',
                    unreadCount: newMessage.sender_id === otherUserId ? 1 : 0,
                    user_id: otherUserId,
                    lastMessageTime: "Just now",
                  },
                  ...prevContacts,
                ]);
              });
              return prev;
            }
          });
        }
      },
      (error) => {
        console.error('Subscription error:', error);
        toast.error('Lost connection to message service');
      }
    );
    return () => {
      console.log('Cleaning up subscription');
      unsubscribe();
    };
  }, [currentUser]);

  useEffect(() => {
    const loadMessages = async () => {
      if (currentUser && activeContact) {
        try {
          const messagesData = await getConversation(currentUser.id, activeContact.user_id);
          setMessages(messagesData.map(msg => ({
            ...msg,
            isMine: msg.sender_id === currentUser.id,
          })));
          await markMessagesAsRead(activeContact.user_id, currentUser.id);
          setContacts(prev => prev.map(contact =>
            contact.user_id === activeContact.user_id ? { ...contact, unreadCount: 0 } : contact
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileAttachment(e.target.files[0]);
      toast.success(`File attached: ${e.target.files[0].name}`);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !fileAttachment) || !currentUser || !activeContact) return;
    try {
      const success = await sendMessage(
        currentUser.id,
        activeContact.user_id,
        newMessage.trim() || (fileAttachment ? `Sent a file: ${fileAttachment.name}` : ""),
        fileAttachment
      );
      if (success) {
        setNewMessage("");
        setFileAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleStartVideoCall = async () => {
    if (!currentUser || !activeContact) return;
    try {
      const roomId = await startVideoCall(currentUser.id, activeContact.user_id);
      if (roomId) {
        setVideoCallRoom(roomId);
        setIsVideoCallActive(true);
        toast.success(`Starting video call with ${activeContact.name}`);
      } else {
        toast.error('Failed to start video call');
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call');
    }
  };

  const handleJoinVideoCall = async (roomId: string) => {
    try {
      await joinVideoCall(roomId);
      setVideoCallRoom(roomId);
      setIsVideoCallActive(true);
    } catch (error) {
      console.error('Error joining video call:', error);
      toast.error('Failed to join video call');
    }
  };

  const handleEndVideoCall = () => {
    setIsVideoCallActive(false);
    setVideoCallRoom(null);
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
            <ScrollArea className="h-[600px]">
              <div className="space-y-1 mt-3">
                {isLoading ? (
                  <div className="text-center py-4">Loading contacts...</div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No conversations yet</div>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                        activeContact?.user_id === contact.user_id ? "bg-accent" : "hover:bg-muted"
                      }`}
                      onClick={() => setActiveContact(contact)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{contact.name}</span>
                          <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                      </div>
                      {contact.unreadCount > 0 && (
                        <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {activeContact ? (
            <CardContent className="p-0 flex flex-col h-[600px]">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activeContact.avatar || "/placeholder.svg"} alt={activeContact.name} />
                    <AvatarFallback>{activeContact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{activeContact.name}</div>
                    <div className="text-xs text-muted-foreground">Expert</div>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={handleStartVideoCall}>
                  <Video className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {message.is_video_call ? (
                            <div className="flex flex-col space-y-2">
                              <p className="text-sm font-medium">Video Call</p>
                              <Button
                                variant={message.isMine ? "outline" : "secondary"}
                                size="sm"
                                onClick={() => {
                                  setVideoCallRoom(message.attachment_url || null);
                                  setIsVideoCallActive(true);
                                }}
                              >
                                Join Call
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm">{message.content}</p>
                              {message.attachment_url && (
                                <div className="mt-2">
                                  {message.attachment_type?.startsWith('image/') ? (
                                    <img
                                      src={message.attachment_url}
                                      alt={message.attachment_name || "Attachment"}
                                      className="max-w-full rounded-md max-h-[200px]"
                                    />
                                  ) : message.attachment_type?.startsWith('video/') ? (
                                    <video
                                      src={message.attachment_url}
                                      controls
                                      className="max-w-full rounded-md max-h-[200px]"
                                    />
                                  ) : (
                                    <Button
                                      variant={message.isMine ? "outline" : "secondary"}
                                      size="sm"
                                      onClick={() => window.open(message.attachment_url, '_blank')}
                                    >
                                      Download {message.attachment_name || "File"}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                          <span className="text-xs opacity-70 mt-1 block text-right">
                            {formatMessageTime(message.created_at)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-3 border-t">
                {fileAttachment && (
                  <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-2">
                    <span className="text-sm truncate flex-1">{fileAttachment.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFileAttachment(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                    />
                  </Button>
                  <Button
                    size="icon"
                    type="button"
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && !fileAttachment) || !activeContact}
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

      <Dialog open={isVideoCallActive} onOpenChange={setIsVideoCallActive}>
        <DialogContent className="sm:max-w-[800px] h-[600px]">
          <DialogHeader>
            <DialogTitle>
              Video Call {activeContact && `with ${activeContact.name}`}
            </DialogTitle>
          </DialogHeader>
          {videoCallRoom ? (
            <VideoCall
              roomId={videoCallRoom}
              userName={currentUser?.email || 'User'}
              onEndCall={handleEndVideoCall}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Video call connection failed. Please try again.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MessagesPage;
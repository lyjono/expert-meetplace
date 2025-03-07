
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Search, Send, Paperclip } from "lucide-react";

const Messages = () => {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [messageText, setMessageText] = useState("");

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // This would actually send the message in a real app
      setMessageText("");
    }
  };

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
              />
            </div>
            <div className="space-y-1 mt-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                    selectedContact?.id === contact.id
                      ? "bg-accent"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleContactSelect(contact)}
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
          {selectedContact ? (
            <CardContent className="p-0 flex flex-col h-[600px]">
              <div className="p-3 border-b flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedContact.avatar || "/placeholder.svg"}
                    alt={selectedContact.name}
                  />
                  <AvatarFallback>
                    {selectedContact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedContact.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedContact.status}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedContact.messages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      message.sent ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs opacity-70 mt-1 block text-right">
                        {message.time}
                      </span>
                    </div>
                  </div>
                ))}
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
                    disabled={!messageText.trim()}
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

interface Message {
  text: string;
  time: string;
  sent: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  status: string;
  messages: Message[];
}

// Sample data
const contacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Williams",
    lastMessage: "I'll send you the documents tomorrow.",
    lastMessageTime: "10:45 AM",
    unread: 2,
    status: "Financial Planning Client",
    messages: [
      {
        text: "Hello, I wanted to discuss our next meeting.",
        time: "10:30 AM",
        sent: false,
      },
      {
        text: "Of course, I'm available tomorrow at 2pm. Does that work for you?",
        time: "10:35 AM",
        sent: true,
      },
      {
        text: "That works perfectly. Could you also prepare the financial projections we discussed?",
        time: "10:40 AM",
        sent: false,
      },
      {
        text: "I'll send you the documents tomorrow.",
        time: "10:45 AM",
        sent: false,
      },
    ],
  },
  {
    id: "2",
    name: "Alex Johnson",
    lastMessage: "Thank you for the tax advice.",
    lastMessageTime: "Yesterday",
    unread: 0,
    status: "Tax Consultation Client",
    messages: [
      {
        text: "I reviewed your tax situation and have some recommendations.",
        time: "Yesterday, 3:30 PM",
        sent: true,
      },
      {
        text: "Thank you for the tax advice.",
        time: "Yesterday, 4:15 PM",
        sent: false,
      },
    ],
  },
  {
    id: "3",
    name: "Michael Brown",
    lastMessage: "When can we schedule our next meeting?",
    lastMessageTime: "2 days ago",
    unread: 1,
    status: "Estate Planning Client",
    messages: [
      {
        text: "I've prepared the estate planning documents for your review.",
        time: "2 days ago, 1:15 PM",
        sent: true,
      },
      {
        text: "Thank you, I'll review them.",
        time: "2 days ago, 2:20 PM",
        sent: false,
      },
      {
        text: "When can we schedule our next meeting?",
        time: "2 days ago, 5:45 PM",
        sent: false,
      },
    ],
  },
  {
    id: "4",
    name: "Emily Davis",
    lastMessage: "The business formation is complete.",
    lastMessageTime: "3 days ago",
    unread: 0,
    status: "Business Formation Client",
    messages: [
      {
        text: "Do you have an update on my LLC formation?",
        time: "3 days ago, 9:30 AM",
        sent: false,
      },
      {
        text: "Yes, we're in the final stages of filing.",
        time: "3 days ago, 10:15 AM",
        sent: true,
      },
      {
        text: "The business formation is complete.",
        time: "3 days ago, 4:30 PM",
        sent: true,
      },
    ],
  },
];

export default Messages;


import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Phone, Video } from "lucide-react";

const ClientMessages = () => {
  return (
    <DashboardLayout userType="user">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with your service providers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10" placeholder="Search conversations" />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {[
                {
                  name: "Dr. Jane Smith",
                  role: "Tax Advisor",
                  lastMessage: "Let me know if you have any questions about the documents I sent.",
                  time: "10:32 AM",
                  unread: 2,
                  image: "/placeholder.svg",
                  active: true,
                },
                {
                  name: "Mark Johnson",
                  role: "Corporate Lawyer",
                  lastMessage: "I'll prepare the contract draft by tomorrow.",
                  time: "Yesterday",
                  unread: 0,
                  image: "/placeholder.svg",
                  active: false,
                },
                {
                  name: "Sarah Williams",
                  role: "Financial Advisor",
                  lastMessage: "Your investment strategy looks good. We should meet to discuss.",
                  time: "May 12",
                  unread: 0,
                  image: "/placeholder.svg",
                  active: false,
                },
              ].map((chat, i) => (
                <div 
                  key={i} 
                  className={`p-4 border-b flex gap-3 cursor-pointer transition-colors ${
                    chat.active ? "bg-accent/50" : "hover:bg-accent/30"
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={chat.image} alt={chat.name} />
                    <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{chat.role}</p>
                    <p className="text-sm truncate mt-1">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <Badge className="h-5 w-5 flex items-center justify-center p-0 self-start mt-1">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" alt="Dr. Jane Smith" />
                  <AvatarFallback>J</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Dr. Jane Smith</h3>
                  <p className="text-xs text-muted-foreground">Tax Advisor • Online</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div className="flex justify-start">
                <div className="bg-accent p-3 rounded-lg rounded-tl-none max-w-[80%]">
                  <p className="text-sm">Hello! I've reviewed your tax documents and have a few recommendations.</p>
                  <span className="text-xs text-muted-foreground block mt-1">10:15 AM</span>
                </div>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-accent p-3 rounded-lg rounded-tl-none max-w-[80%]">
                  <p className="text-sm">I've attached a PDF with detailed notes. Please take a look when you have a chance.</p>
                  <div className="mt-2 bg-background p-2 rounded flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 14L1 14L1 2L7 2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M10 11L13 8L10 5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M13 8L4 8" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span className="text-xs">Tax_Recommendations.pdf</span>
                  </div>
                  <span className="text-xs text-muted-foreground block mt-1">10:16 AM</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none max-w-[80%]">
                  <p className="text-sm">Thank you, I'll review it right away!</p>
                  <span className="text-xs text-primary-foreground/70 block mt-1">10:30 AM</span>
                </div>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-accent p-3 rounded-lg rounded-tl-none max-w-[80%]">
                  <p className="text-sm">Great. Let me know if you have any questions about the recommendations.</p>
                  <span className="text-xs text-muted-foreground block mt-1">10:32 AM</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input placeholder="Type a message..." className="flex-1" />
                <Button size="icon" type="submit">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientMessages;

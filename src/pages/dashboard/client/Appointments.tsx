
import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Video, MessageSquare, Clock } from "lucide-react";

const ClientAppointments = () => {
  return (
    <DashboardLayout userType="user">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground">
          Manage your upcoming and past meetings with experts
        </p>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="canceled">Canceled</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <TabsContent value="upcoming" className="space-y-4">
              {[
                {
                  expert: "Dr. Jane Smith",
                  service: "Tax Planning Consultation",
                  date: "May 15, 2023",
                  time: "10:30 AM",
                  status: "confirmed",
                  method: "video",
                },
                {
                  expert: "Mark Johnson",
                  service: "Corporate Law Advice",
                  date: "May 18, 2023",
                  time: "2:00 PM",
                  status: "pending",
                  method: "in-person",
                },
              ].map((appointment, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-lg">{appointment.service}</h3>
                        <p className="text-sm text-muted-foreground">with {appointment.expert}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          {appointment.date} at {appointment.time}
                          {appointment.method === "video" && (
                            <Badge variant="outline" className="ml-2 flex items-center gap-1">
                              <Video className="h-3 w-3" /> Video Call
                            </Badge>
                          )}
                          {appointment.method === "in-person" && (
                            <Badge variant="outline" className="ml-2">In Person</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          className={
                            appointment.status === "confirmed" 
                              ? "bg-green-500" 
                              : appointment.status === "pending" 
                                ? "bg-yellow-500" 
                                : "bg-red-500"
                          }
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        {appointment.method === "video" && (
                          <Button variant="outline" className="gap-2">
                            <Video className="h-4 w-4" /> Join Call
                          </Button>
                        )}
                        <Button variant="outline" className="gap-2">
                          <MessageSquare className="h-4 w-4" /> Message
                        </Button>
                        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="past">
              <div className="space-y-4">
                {[
                  {
                    expert: "Sarah Williams",
                    service: "Investment Planning Session",
                    date: "April 28, 2023",
                    time: "1:15 PM",
                    method: "video",
                  },
                ].map((appointment, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-medium text-lg">{appointment.service}</h3>
                          <p className="text-sm text-muted-foreground">with {appointment.expert}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            {appointment.date} at {appointment.time}
                            {appointment.method === "video" && (
                              <Badge variant="outline" className="ml-2 flex items-center gap-1">
                                <Video className="h-3 w-3" /> Video Call
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" className="gap-2">
                            <MessageSquare className="h-4 w-4" /> Message
                          </Button>
                          <Button variant="default">Book Again</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="canceled">
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center py-10">
                  <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">You have no canceled appointments</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientAppointments;

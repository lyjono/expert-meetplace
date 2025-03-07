
import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, Video, MessageSquare } from "lucide-react";

const Appointments = () => {
  return (
    <DashboardLayout userType="provider">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          Manage your schedule and client appointments.
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="mt-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="canceled">Canceled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <div className="grid gap-4">
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <div className="grid gap-4">
            {pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="canceled" className="mt-4">
          <div className="grid gap-4">
            {canceledAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  status: "upcoming" | "past" | "canceled";
  type: "video" | "in-person" | "phone";
  notes?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base">{appointment.clientName}</CardTitle>
          <CardDescription>{appointment.service}</CardDescription>
        </div>
        <Badge
          variant={
            appointment.status === "upcoming"
              ? "default"
              : appointment.status === "past"
              ? "secondary"
              : "destructive"
          }
        >
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {appointment.time} ({appointment.duration})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {appointment.type === "video" ? (
              <Video className="h-4 w-4 text-muted-foreground" />
            ) : appointment.type === "in-person" ? (
              <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">📍</span>
            ) : (
              <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">📞</span>
            )}
            <span>
              {appointment.type.charAt(0).toUpperCase() +
                appointment.type.slice(1)}{" "}
              Meeting
            </span>
          </div>
        </div>
        {appointment.notes && (
          <div className="text-sm text-muted-foreground mb-4">
            <p>
              <strong>Notes:</strong> {appointment.notes}
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {appointment.status === "upcoming" && (
            <>
              {appointment.type === "video" && (
                <Button size="sm">
                  <Video className="mr-2 h-4 w-4" />
                  Join Meeting
                </Button>
              )}
              <Button size="sm" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Client
              </Button>
              <Button size="sm" variant="destructive">
                Cancel
              </Button>
            </>
          )}
          {appointment.status === "past" && (
            <Button size="sm">Send Follow-up</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Sample data
const upcomingAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "Sarah Williams",
    service: "Financial Planning",
    date: "July 21, 2023",
    time: "10:30 AM",
    duration: "60 minutes",
    status: "upcoming",
    type: "video",
    notes: "Initial consultation to discuss retirement planning options.",
  },
  {
    id: "2",
    clientName: "Alex Johnson",
    service: "Tax Consultation",
    date: "July 22, 2023",
    time: "2:00 PM",
    duration: "45 minutes",
    status: "upcoming",
    type: "in-person",
    notes: "Client needs to bring last year's tax returns and current financial statements.",
  },
];

const pastAppointments: Appointment[] = [
  {
    id: "3",
    clientName: "Michael Brown",
    service: "Estate Planning",
    date: "July 15, 2023",
    time: "1:00 PM",
    duration: "90 minutes",
    status: "past",
    type: "in-person",
  },
  {
    id: "4",
    clientName: "Emily Davis",
    service: "Business Formation",
    date: "July 10, 2023",
    time: "11:00 AM",
    duration: "60 minutes",
    status: "past",
    type: "video",
  },
];

const canceledAppointments: Appointment[] = [
  {
    id: "5",
    clientName: "David Wilson",
    service: "Tax Planning",
    date: "July 18, 2023",
    time: "3:30 PM",
    duration: "45 minutes",
    status: "canceled",
    type: "phone",
    notes: "Client requested to reschedule due to personal emergency.",
  },
];

export default Appointments;

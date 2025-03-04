
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Video, MessageSquare, Clock } from "lucide-react";
import { Appointment, getClientAppointments, cancelAppointment } from "@/services/appointments";
import { toast } from "sonner";

const ClientAppointments = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = async (status?: string) => {
    setIsLoading(true);
    try {
      // Map UI tab value to database status values
      let statusFilter;
      if (status === "upcoming") statusFilter = "confirmed,pending";
      else if (status === "past") statusFilter = "completed";
      else if (status === "canceled") statusFilter = "canceled";
      
      const data = await getClientAppointments(statusFilter);
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  // Load appointments when tab changes
  useEffect(() => {
    loadAppointments(activeTab);
  }, [activeTab]);

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const success = await cancelAppointment(appointmentId);
        if (success) {
          toast.success("Appointment canceled successfully");
          // Refresh the appointments list
          loadAppointments(activeTab);
        } else {
          toast.error("Failed to cancel appointment");
        }
      } catch (error) {
        console.error("Error canceling appointment:", error);
        toast.error("An error occurred while canceling the appointment");
      }
    }
  };

  return (
    <DashboardLayout userType="user">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground">
          Manage your upcoming and past meetings with experts
        </p>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Tabs 
          defaultValue="upcoming" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="canceled">Canceled</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <TabsContent value="upcoming" className="space-y-4">
              {isLoading ? (
                <p>Loading appointments...</p>
              ) : appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onCancel={() => handleCancelAppointment(appointment.id)}
                  />
                ))
              ) : (
                <EmptyState message="You have no upcoming appointments" />
              )}
            </TabsContent>
            <TabsContent value="past">
              {isLoading ? (
                <p>Loading appointments...</p>
              ) : appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <PastAppointmentCard key={appointment.id} appointment={appointment} />
                ))
              ) : (
                <EmptyState message="You have no past appointments" />
              )}
            </TabsContent>
            <TabsContent value="canceled">
              {isLoading ? (
                <p>Loading appointments...</p>
              ) : appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <CanceledAppointmentCard key={appointment.id} appointment={appointment} />
                ))
              ) : (
                <EmptyState message="You have no canceled appointments" />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Appointment card components
const AppointmentCard = ({ 
  appointment, 
  onCancel 
}: { 
  appointment: Appointment, 
  onCancel: () => void 
}) => (
  <Card>
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
          <Button 
            variant="outline" 
            className="gap-2 text-destructive hover:text-destructive"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const PastAppointmentCard = ({ appointment }: { appointment: Appointment }) => (
  <Card>
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
);

const CanceledAppointmentCard = ({ appointment }: { appointment: Appointment }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-medium text-lg">{appointment.service}</h3>
          <p className="text-sm text-muted-foreground">with {appointment.expert}</p>
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {appointment.date} at {appointment.time}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">Canceled</Badge>
          <Button variant="default">Book Again</Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const EmptyState = ({ message }: { message: string }) => (
  <Card>
    <CardContent className="p-6 flex flex-col items-center justify-center py-10">
      <Clock className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-center">{message}</p>
    </CardContent>
  </Card>
);

export default ClientAppointments;

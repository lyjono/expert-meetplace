import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, Video, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProviderAppointments, Appointment, cancelAppointment } from "@/services/appointments";
import AvailabilityManager from "@/components/provider/AvailabilityManager";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VideoCall from "@/components/VideoCall";
import { joinVideoCall } from "@/services/realTimeMessages";
import { getCurrentUser } from "@/lib/supabase";
import { Share, Copy, CheckIcon } from "lucide-react";

const Appointments = () => {
  const [providerId, setProviderId] = useState<string | null>(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [videoCallRoom, setVideoCallRoom] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [bookingLinkCopied, setBookingLinkCopied] = useState(false);

  useEffect(() => {
    const fetchProviderId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        const { data, error } = await supabase
          .from('provider_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setProviderId(data?.id || null);
      } catch (error) {
        console.error('Error fetching provider ID:', error);
      }
    };

    fetchProviderId();
  }, []);

  const { data: upcomingAppointments = [], isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['providerAppointments', 'upcoming'],
    queryFn: () => getProviderAppointments('pending,confirmed'),
    enabled: true,
  });

  const { data: pastAppointments = [], isLoading: isLoadingPast } = useQuery({
    queryKey: ['providerAppointments', 'past'],
    queryFn: () => getProviderAppointments('completed'),
    enabled: true,
  });

  const { data: canceledAppointments = [], isLoading: isLoadingCanceled } = useQuery({
    queryKey: ['providerAppointments', 'canceled'],
    queryFn: () => getProviderAppointments('canceled'),
    enabled: true,
  });

  const handleCancelAppointment = async (id: string) => {
    const result = await cancelAppointment(id);
    if (result) {
      toast.success("Appointment canceled successfully");
      window.location.reload();
    } else {
      toast.error("Failed to cancel appointment");
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

  const handleCopyBookingLink = async () => {
    if (!providerId) return;

    const bookingUrl = `${window.location.origin}/book/${providerId}`;

    try {
      await navigator.clipboard.writeText(bookingUrl);
      setBookingLinkCopied(true);
      toast.success("Booking link copied to clipboard!");

      setTimeout(() => {
        setBookingLinkCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  // Combine all appointments for searching
  const allAppointments = [
    ...upcomingAppointments,
    ...pastAppointments,
    ...canceledAppointments
  ];

  return (
    <DashboardLayout userType="provider">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          Manage your schedule and client appointments.
        </p>
      </div>

      {/* Shareable Booking Link */}
      {providerId && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Share Your Booking Link
            </CardTitle>
            <CardDescription>
              Share this link with potential clients so they can book appointments directly with you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input 
                readOnly 
                value={`${window.location.origin}/book/${providerId}`}
                className="flex-1"
              />
              <Button onClick={handleCopyBookingLink} variant="outline" size="icon">
                {bookingLinkCopied ? (
                  <CheckIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {providerId && (
        <div className="mt-6 mb-8">
          <AvailabilityManager providerId={providerId} />
        </div>
      )}

      <Tabs defaultValue="upcoming" className="mt-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="canceled">Canceled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <div className="grid gap-4">
            {isLoadingUpcoming ? (
              <p>Loading appointments...</p>
            ) : upcomingAppointments.length === 0 ? (
              <p>No upcoming appointments found.</p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                  onCancel={() => handleCancelAppointment(appointment.id)}
                  onJoinVideoCall={() => handleJoinVideoCall(appointment.video_call_room_id!)}
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <div className="grid gap-4">
            {isLoadingPast ? (
              <p>Loading appointments...</p>
            ) : pastAppointments.length === 0 ? (
              <p>No past appointments found.</p>
            ) : (
              pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="canceled" className="mt-4">
          <div className="grid gap-4">
            {isLoadingCanceled ? (
              <p>Loading appointments...</p>
            ) : canceledAppointments.length === 0 ? (
              <p>No canceled appointments found.</p>
            ) : (
              canceledAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isVideoCallActive} onOpenChange={setIsVideoCallActive}>
        <DialogContent className="sm:max-w-[800px] h-[600px]">
          <DialogHeader>
            <DialogTitle>
              Video Call with {allAppointments.find(a => a.video_call_room_id === videoCallRoom)?.client || 'Client'}
            </DialogTitle>
          </DialogHeader>
          {videoCallRoom && currentUserId ? (
            <VideoCall 
              roomId={videoCallRoom} 
              userName={currentUserId}
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

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: () => void;
  onJoinVideoCall?: () => void;
}

const AppointmentCard = ({ appointment, onCancel, onJoinVideoCall }: AppointmentCardProps) => {
  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'canceled': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base">{appointment.client}</CardTitle>
          <CardDescription>{appointment.service}</CardDescription>
        </div>
        <Badge variant={getStatusVariant(appointment.status)}>
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
            <span>{appointment.time} (60 minutes)</span>
          </div>
          <div className="flex items-center gap-2">
            {appointment.method === "video" ? (
              <Video className="h-4 w-4 text-muted-foreground" />
            ) : (
              <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">📍</span>
            )}
            <span>
              {appointment.method.charAt(0).toUpperCase() +
                appointment.method.slice(1)}{" "}
              Meeting
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(appointment.status === "confirmed" || appointment.status === "pending") && (
            <>
              {appointment.method === "video" && appointment.video_call_room_id && (
                <Button size="sm" onClick={onJoinVideoCall}>
                  <Video className="mr-2 h-4 w-4" />
                  Join Meeting
                </Button>
              )}
              <Button size="sm" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Client
              </Button>
              {onCancel && (
                <Button size="sm" variant="destructive" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </>
          )}
          {appointment.status === "completed" && (
            <Button size="sm">Send Follow-up</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Appointments;
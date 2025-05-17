import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getSharedDocuments } from "@/services/documents"; // From Documents.tsx
import { getConversation } from "@/services/realTimeMessages"; // From Messages.tsx
import { toast } from "sonner";

interface Appointment {
  id: string;
  date: string;
  status: string;
  client_id?: string;
  provider_id?: string;
}

const ClientDashboard = () => {
  const [clientId, setClientId] = useState<string | null>(null);

  // Fetch current client ID
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setClientId(user.id);
        }
      } catch (error) {
        console.error("Error fetching client ID:", error);
        toast.error("Failed to load user data");
      }
    };
    fetchClientId();
  }, []);

  // Fetch upcoming appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["clientAppointments", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("client_id", clientId)
        .in("status", ["pending", "confirmed"])
        .order("date", { ascending: true });
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!clientId,
  });

  // Fetch unread messages
  const { data: unreadMessagesCount = 0, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["unreadMessages", clientId],
    queryFn: async () => {
      if (!clientId) return 0;
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("receiver_id", clientId)
        .eq("read", false);
      if (error) throw error;
      return data.length;
    },
    enabled: !!clientId,
  });

  // Fetch recent experts (derived from appointments)
  const { data: recentExpertsCount = 0, isLoading: isLoadingExperts } = useQuery({
    queryKey: ["recentExperts", clientId],
    queryFn: async () => {
      if (!clientId) return 0;
      const { data, error } = await supabase
        .from("appointments")
        .select("provider_id")
        .eq("client_id", clientId)
        .in("status", ["completed", "confirmed", "pending"])
        .order("date", { ascending: false })
        .limit(10);
      if (error) throw error;
      const uniqueProviders = new Set(data.map((appt: any) => appt.provider_id));
      return uniqueProviders.size;
    },
    enabled: !!clientId,
  });

  // Fetch shared documents
  const { data: sharedDocuments = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["sharedDocuments", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      return await getSharedDocuments();
    },
    enabled: !!clientId,
  });

  // Calculate documents requiring review (example logic)
  const documentsToReview = sharedDocuments.filter(
    (doc: any) => doc.status === "pending_review" // Adjust based on your schema
  ).length;

  // Determine next appointment date
  const nextAppointment = appointments[0]?.date
    ? new Date(appointments[0].date)
    : null;
  const daysToNextAppointment = nextAppointment
    ? Math.ceil(
        (nextAppointment.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <DashboardLayout userType="user">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your Client Dashboard</h1>
        <p className="text-muted-foreground">
          Here's an overview of your account activity and upcoming appointments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAppointments ? "..." : appointments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingAppointments
                ? "Loading..."
                : daysToNextAppointment
                ? `Next appointment in ${daysToNextAppointment} days`
                : "No upcoming appointments"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMessages ? "..." : unreadMessagesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingMessages ? "Loading..." : "Check your inbox"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Experts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingExperts ? "..." : recentExpertsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingExperts ? "Loading..." : "From your recent consultations"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingDocuments ? "..." : sharedDocuments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingDocuments
                ? "Loading..."
                : documentsToReview > 0
                ? `${documentsToReview} documents require review`
                : "No documents pending review"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your activity over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Activity chart will appear here</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dashboard/appointments">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule an Appointment
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dashboard/find-experts">
                  <Users className="mr-2 h-4 w-4" />
                  Find an Expert
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dashboard/messages">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Messages
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dashboard/documents">
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Document
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
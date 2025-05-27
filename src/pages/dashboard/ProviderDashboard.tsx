import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Users, User, MessageSquare, FileText, Calendar, DollarSign } from 'lucide-react';
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getLeadCounts } from "@/services/leads";
import { getSharedDocuments } from "@/services/documents"; // From Documents.tsx
import { toast } from "sonner";

// Fetch authenticated provider's details
const getAuthenticatedProvider = async () => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("provider_profiles")
    .select("id, user_id, name")
    .eq("user_id", authData.user.id)
    .single();

  if (error) throw error;
  const { data: userTypeData, error: userTypeError } = await supabase
    .from("users_view")
    .select("user_type")
    .eq("user_id", authData.user.id)
    .single();
  if (userTypeError) throw userTypeError;
  if (userTypeData.user_type !== "provider") throw new Error("User is not a provider");

  return { providerId: data.id, providerName: data.name, userId: authData.user.id };
};

const ProviderDashboard = () => {
  // Query authenticated provider
  const { data: providerData, isLoading: isLoadingProvider, error: providerError } = useQuery({
    queryKey: ["authenticatedProvider"],
    queryFn: getAuthenticatedProvider,
  });

  const providerId = providerData?.providerId;
  const userId = providerData?.userId;

  // Query for today's appointments with client names
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments", "today", providerId],
    queryFn: async () => {
      if (!providerId) return [];
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const { data, error } = await supabase
        .from("appointments")
        .select("*, client:client_id (name)")
        .eq("provider_id", providerId)
        .eq("date", today)
        .order("time", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });

  // Query for unread messages (fixed to use userId)
  const { data: unreadMessages = [], isLoading: isLoadingUnread } = useQuery({
    queryKey: ["unreadMessages", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("id")
        .eq("receiver_id", userId)
        .eq("read", false);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
  const unreadCount = unreadMessages.length;

  // Query for lead counts
  const { data: leadCounts = { new: 0, contacted: 0, qualified: 0, converted: 0 }, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["leadCounts", providerId],
    queryFn: () => getLeadCounts(providerId),
    enabled: !!providerId,
  });
  const totalLeads = Object.values(leadCounts).reduce((sum, count) => sum + count, 0);

  // Query for shared documents
  const { data: sharedDocuments = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["sharedDocuments", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getSharedDocuments();
    },
    enabled: !!userId,
  });

  // Calculate documents requiring review (placeholder logic)
  const documentsToReview = sharedDocuments.filter(
    (doc: any) => doc.status === "pending_review" // Adjust based on schema
  ).length;

  // Calculate next appointment time
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const upcomingAppointments = appointments.filter((appt) => {
    const [hours, minutes] = appt.time.split(":").map(Number);
    const apptTime = hours * 60 + minutes;
    return apptTime > currentTime;
  });
  const nextAppointment = upcomingAppointments[0];
  const timeUntilNext = nextAppointment ? calculateTimeUntil(nextAppointment.time) : null;

  function calculateTimeUntil(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const apptDate = new Date(now);
    apptDate.setHours(hours, minutes, 0, 0);
    const diff = apptDate.getTime() - now.getTime();
    return diff > 0 ? `${Math.floor(diff / 60000)} minutes` : "Now";
  }

  if (isLoadingProvider) return <div>Loading provider data...</div>;
  if (providerError) return <div>Error: {providerError.message}</div>;

  return (
    <DashboardLayout userType="provider">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your Provider Dashboard</h1>
        <p className="text-muted-foreground">Here's an overview of your practice and upcoming appointments.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingAppointments ? "..." : appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoadingAppointments
                ? "Loading..."
                : nextAppointment
                ? `Next appointment in ${timeUntilNext}`
                : "No more appointments today"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingLeads ? "..." : leadCounts.new}</div>
            <p className="text-xs text-muted-foreground">
              {isLoadingLeads ? "Loading..." : `${totalLeads} total leads`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingUnread ? "..." : unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              {isLoadingUnread ? "Loading..." : unreadCount > 0 ? `${unreadCount} requiring attention` : "All messages read"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingDocuments ? "..." : sharedDocuments.length}</div>
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

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your schedule for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingAppointments ? (
              <p>Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <p>No appointments today</p>
            ) : (
              appointments.slice(0, 3).map((appt: any) => (
                <div key={appt.id} className="flex justify-between items-center p-3 bg-accent/50 rounded-md">
                  <div>
                    <div className="font-medium">{appt.client?.name || "Unknown Client"}</div>
                    <div className="text-sm text-muted-foreground">{appt.service || "Service"}</div>
                  </div>
                  <div className="text-sm font-medium">{appt.time}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dashboard/provider/appointments">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Appointments
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dashboard/provider/pricing">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pricing & Payments
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dashboard/provider/leads">
                  <Users className="mr-2 h-4 w-4" />
                  View New Leads
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dashboard/provider/messages">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Check Messages
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dashboard/provider/documents">
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Documents
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Your service metrics and client interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Performance chart will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MessageSquare, FileText, Calendar as CalendarIcon, Clock, Star } from "lucide-react";
import { getExpertById } from "@/services/experts";
import { createAppointment } from "@/services/appointments";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ExpertProfile = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const navigate = useNavigate();
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState({
    service: "",
    date: "",
    time: "",
    method: "video" as "video" | "in-person"
  });
  
  const { data: expert, isLoading, error } = useQuery({
    queryKey: ['expert', expertId],
    queryFn: () => expertId ? getExpertById(expertId) : null,
    enabled: !!expertId
  });

  const handleSchedule = () => {
    setShowScheduleDialog(true);
  };

  const handleBookAppointment = async () => {
    if (!expertId || !appointmentDetails.service || !appointmentDetails.date || !appointmentDetails.time) {
      toast.error("Please fill out all required fields");
      return;
    }

    const result = await createAppointment(
      expertId,
      appointmentDetails.service,
      appointmentDetails.date,
      appointmentDetails.time,
      appointmentDetails.method
    );

    if (result) {
      toast.success("Appointment scheduled successfully");
      setShowScheduleDialog(false);
      navigate("/dashboard/appointments");
    } else {
      toast.error("Failed to schedule appointment");
    }
  };

  const handleMessage = async () => {
    if (!expertId) return;
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You need to be logged in to send messages");
        return;
      }
      
      // Get the profile IDs for both users
      const { data: providerProfile } = await supabase
        .from('provider_profiles')
        .select('user_id')
        .eq('id', expertId)
        .single();
        
      if (!providerProfile) {
        toast.error("Provider not found");
        return;
      }
      
      // Create a new message to start the thread
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: providerProfile.user_id,
          content: `Hello, I'd like to discuss your services.`
        });
        
      if (error) {
        console.error("Error creating message:", error);
        toast.error("Failed to create message thread");
        return;
      }
      
      toast.success("Message thread created");
      navigate("/dashboard/messages");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to create message thread");
    }
  };

  const handleShareFiles = () => {
    navigate("/dashboard/documents", { state: { expertId } });
    toast.success("Navigate to documents to share files");
  };

  if (isLoading) return (
    <DashboardLayout userType="user">
      <div className="flex items-center justify-center h-96">
        <p>Loading expert profile...</p>
      </div>
    </DashboardLayout>
  );

  if (error || !expert) return (
    <DashboardLayout userType="user">
      <div className="flex items-center justify-center h-96">
        <p>Error loading expert profile. Please try again.</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout userType="user">
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={expert.image} alt={expert.name} />
                  <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="mt-4 text-center md:text-left">
                  <h1 className="text-2xl font-bold">{expert.name}</h1>
                  <p className="text-lg text-muted-foreground">{expert.specialty || 'Specialist'}</p>
                  <div className="flex mt-2 gap-2 flex-wrap justify-center md:justify-start">
                    <Badge>{expert.category}</Badge>
                  </div>
                  <div className="flex items-center mt-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(expert.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">({expert.rating})</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col md:items-end justify-between gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
                  <Button className="flex gap-2" onClick={handleSchedule}>
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </Button>
                  <Button variant="outline" className="flex gap-2" onClick={handleMessage}>
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline" className="flex gap-2" onClick={handleShareFiles}>
                    <FileText className="h-4 w-4" />
                    Share Files
                  </Button>
                </div>
                <div className="bg-accent/50 p-4 rounded-lg w-full md:w-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="font-medium">Available for booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Typically responds within 24 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="about">
          <TabsList className="mb-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About {expert.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Bio</h3>
                    <p>
                      {expert.name} is a professional in {expert.category.toLowerCase()} services
                      {expert.specialty ? ` specializing in ${expert.specialty}` : ''}.
                      {expert.years_experience ? ` With ${expert.years_experience} years of experience.` : ''}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Experience</h3>
                    <p>Professional in {expert.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>
                  Professional services available for booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">Initial Consultation</h3>
                        <p className="text-muted-foreground">60 minutes • Virtual or In-person</p>
                        <p className="mt-2">Discuss your needs and goals to establish a personalized plan.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">$150</p>
                        <Button className="mt-2" onClick={handleSchedule}>Book Now</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{expert.category} Service</h3>
                        <p className="text-muted-foreground">90 minutes • Virtual</p>
                        <p className="mt-2">Comprehensive service tailored to your specific needs.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">$250</p>
                        <Button className="mt-2" onClick={handleSchedule}>Book Now</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule an Appointment</DialogTitle>
            <DialogDescription>
              Fill out the details below to schedule an appointment with {expert.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="service">Service</Label>
              <Select 
                onValueChange={(value) => setAppointmentDetails({...appointmentDetails, service: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Initial Consultation">Initial Consultation</SelectItem>
                  <SelectItem value={`${expert.category} Service`}>{expert.category} Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                onChange={(e) => setAppointmentDetails({...appointmentDetails, date: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input 
                id="time" 
                type="time"
                onChange={(e) => setAppointmentDetails({...appointmentDetails, time: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="method">Method</Label>
              <Select 
                defaultValue="video"
                onValueChange={(value) => setAppointmentDetails({...appointmentDetails, method: value as "video" | "in-person"})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleBookAppointment}>Book Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ExpertProfile;


import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Clock, Video, MapPin, User, Mail, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getAvailableTimesForDate } from "@/services/availability";
import { createAppointment } from "@/services/appointments";
import { toast } from "sonner";

const PublicBooking = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<"video" | "in-person">("video");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  
  // Registration form state
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        setIsRegistered(true);
      }
    };
    checkUser();
  }, []);

  // Fetch provider details
  const { data: provider, isLoading: isLoadingProvider } = useQuery({
    queryKey: ["provider", providerId],
    queryFn: async () => {
      if (!providerId) throw new Error("Provider ID is required");
      
      const { data, error } = await supabase
        .from("provider_profiles")
        .select("*")
        .eq("id", providerId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });

  // Fetch available times when date is selected
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (selectedDate && providerId) {
        const dateString = selectedDate.toISOString().split('T')[0];
        const times = await getAvailableTimesForDate(providerId, dateString);
        setAvailableTimes(times);
        setSelectedTime(""); // Reset selected time
      }
    };
    
    fetchAvailableTimes();
  }, [selectedDate, providerId]);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Register the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
      });

      if (authError) throw authError;
      
      if (authData.user) {
        // Create client profile
        const { error: profileError } = await supabase
          .from("client_profiles")
          .insert({
            user_id: authData.user.id,
            name: registrationData.name,
            email: registrationData.email,
          });

        if (profileError) throw profileError;

        setCurrentUser(authData.user);
        setIsRegistered(true);
        toast.success("Registration successful! You can now book an appointment.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !providerId) {
      toast.error("Please select a date and time");
      return;
    }

    setIsBooking(true);
    
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const success = await createAppointment(
        providerId,
        provider?.specialty || "Consultation",
        dateString,
        selectedTime,
        selectedMethod
      );

      if (success) {
        toast.success("Appointment booked successfully!");
        navigate("/dashboard/client/appointments");
      } else {
        toast.error("Failed to book appointment");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  if (isLoadingProvider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading provider information...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Provider Not Found</CardTitle>
            <CardDescription>The provider you're looking for doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Provider Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                {provider.image_url && (
                  <img
                    src={provider.image_url}
                    alt={provider.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <CardTitle className="text-2xl">{provider.name}</CardTitle>
                  <CardDescription className="text-lg">
                    {provider.specialty} • {provider.category}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {provider.years_experience} years experience
                  </Badge>
                  {provider.rating && (
                    <Badge variant="outline">
                      ⭐ {provider.rating}/5
                    </Badge>
                  )}
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Meeting Options:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Video Call Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">In-Person Meeting Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {!isRegistered ? "Register & Book Appointment" : "Book Appointment"}
              </CardTitle>
              <CardDescription>
                {!isRegistered 
                  ? "Create an account to book your appointment" 
                  : `Schedule your meeting with ${provider.name}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isRegistered ? (
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={registrationData.name}
                      onChange={(e) => setRegistrationData({ 
                        ...registrationData, 
                        name: e.target.value 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={registrationData.email}
                      onChange={(e) => setRegistrationData({ 
                        ...registrationData, 
                        email: e.target.value 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={registrationData.password}
                      onChange={(e) => setRegistrationData({ 
                        ...registrationData, 
                        password: e.target.value 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={registrationData.phone}
                      onChange={(e) => setRegistrationData({ 
                        ...registrationData, 
                        phone: e.target.value 
                      })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Account & Continue
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Meeting Method Selection */}
                  <div className="space-y-3">
                    <Label>Meeting Method</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={selectedMethod === "video" ? "default" : "outline"}
                        onClick={() => setSelectedMethod("video")}
                        className="justify-start"
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Video Call
                      </Button>
                      <Button
                        variant={selectedMethod === "in-person" ? "default" : "outline"}
                        onClick={() => setSelectedMethod("in-person")}
                        className="justify-start"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        In-Person
                      </Button>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-3">
                    <Label>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                      className="rounded-md border"
                    />
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div className="space-y-3">
                      <Label>Available Times</Label>
                      {availableTimes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {availableTimes.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              onClick={() => setSelectedTime(time)}
                              className="justify-center"
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {formatTime(time)}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No available times for this date.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Booking Summary */}
                  {selectedDate && selectedTime && (
                    <div className="space-y-3 p-4 bg-accent/50 rounded-md">
                      <h3 className="font-semibold">Booking Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Provider:</span>
                          <span>{provider.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span>{provider.specialty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{selectedDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span>{formatTime(selectedTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Method:</span>
                          <span className="capitalize">{selectedMethod}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime || isBooking}
                    className="w-full"
                  >
                    {isBooking ? "Booking..." : "Book Appointment"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;

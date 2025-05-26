import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { createAppointment } from '@/services/appointments';
import { getAvailableTimesForDate } from '@/services/availability';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const PublicBooking = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [method, setMethod] = useState<'video' | 'in-person'>('video');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationEmailCount, setVerificationEmailCount] = useState(0);
  const [lastEmailSent, setLastEmailSent] = useState<number | null>(null);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    // Load email rate limiting data from localStorage
    const savedCount = localStorage.getItem('verificationEmailCount');
    const savedTimestamp = localStorage.getItem('lastVerificationEmail');
    const savedHourTimestamp = localStorage.getItem('verificationHourStart');
    
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    if (savedHourTimestamp && (now - parseInt(savedHourTimestamp)) > oneHour) {
      // Reset count if more than an hour has passed
      localStorage.removeItem('verificationEmailCount');
      localStorage.removeItem('verificationHourStart');
      setVerificationEmailCount(0);
    } else if (savedCount) {
      setVerificationEmailCount(parseInt(savedCount));
    }
    
    if (savedTimestamp) {
      setLastEmailSent(parseInt(savedTimestamp));
      const timeSinceLastEmail = now - parseInt(savedTimestamp);
      const oneMinute = 60 * 1000; // 1 minute in milliseconds
      
      if (timeSinceLastEmail < oneMinute) {
        setEmailCooldown(Math.ceil((oneMinute - timeSinceLastEmail) / 1000));
      }
    }

    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
        
        // Check if user exists but email is not confirmed
        if (user && !user.email_confirmed_at) {
          setAuthError('Please check your email and click the verification link to complete your account setup.');
        }
      } catch (error: any) {
        console.error('Auth check error:', error);
        if (error.message?.includes('Auth session missing')) {
          setAuthError('Your session has expired. Please sign in again.');
        }
        setIsAuthenticated(false);
      }
    };

    const fetchProvider = async () => {
      if (!providerId) {
        toast.error('Provider not found');
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('id', providerId)
          .single();

        if (error) throw error;
        setProvider(data);
      } catch (error) {
        console.error('Error fetching provider:', error);
        toast.error('Provider not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchProvider();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setAuthError(null);
        setShowAuthDialog(false);
        toast.success('Successfully signed in!');
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setAuthError('Your session has expired. Please sign in again.');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [providerId, navigate]);

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (emailCooldown > 0) {
      interval = setInterval(() => {
        setEmailCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [emailCooldown]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              user_type: 'client'
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Create client profile
          const { error: profileError } = await supabase
            .from('client_profiles')
            .insert({
              user_id: data.user.id,
              name,
              email
            });

          if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
            throw profileError;
          }

          if (data.user.email_confirmed_at) {
            toast.success('Account created and verified! You can now book appointments.');
            setIsAuthenticated(true);
            setShowAuthDialog(false);
          } else {
            toast.success('Account created! Please check your email and click the verification link before booking.');
            setAuthError('Please check your email and click the verification link to complete your account setup.');
            setShowAuthDialog(false);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setAuthError('Please check your email and click the verification link to complete your account setup.');
            toast.error('Please verify your email address before signing in.');
          } else if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please check your credentials and try again.');
          } else {
            toast.error(error.message);
          }
          throw error;
        }

        if (data.user && !data.user.email_confirmed_at) {
          setAuthError('Please check your email and click the verification link to complete your account setup.');
          toast.error('Please verify your email address before booking appointments.');
          return;
        }

        toast.success('Signed in successfully!');
        setIsAuthenticated(true);
        setShowAuthDialog(false);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      // Error handling is done above for specific cases
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const now = Date.now();
    const oneMinute = 60 * 1000; // 1 minute in milliseconds
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    // Check rate limits
    if (verificationEmailCount >= 5) {
      toast.error('You have reached the maximum of 5 verification emails per hour. Please wait before requesting another.');
      return;
    }
    
    if (lastEmailSent && (now - lastEmailSent) < oneMinute) {
      toast.error(`Please wait ${Math.ceil((oneMinute - (now - lastEmailSent)) / 1000)} seconds before requesting another email.`);
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;
      
      // Update rate limiting data
      const newCount = verificationEmailCount + 1;
      setVerificationEmailCount(newCount);
      setLastEmailSent(now);
      setEmailCooldown(60); // 60 seconds cooldown
      
      // Save to localStorage
      localStorage.setItem('verificationEmailCount', newCount.toString());
      localStorage.setItem('lastVerificationEmail', now.toString());
      
      if (!localStorage.getItem('verificationHourStart')) {
        localStorage.setItem('verificationHourStart', now.toString());
      }
      
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error('Failed to resend verification email. Please try again.');
    }
  };

  const handleCheckEmailVerification = async () => {
    try {
      // Refresh the user session to get updated email verification status
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.user && data.user.email_confirmed_at) {
        setIsAuthenticated(true);
        setAuthError(null);
        toast.success('Email verified successfully! You can now book appointments.');
      } else {
        toast.error('Email not yet verified. Please check your email and click the verification link.');
      }
    } catch (error: any) {
      console.error('Email verification check error:', error);
      toast.error('Failed to check email verification status. Please try again.');
    }
  };

  const fetchAvailableTimes = async (selectedDate: Date) => {
    if (!providerId) return;
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const times = await getAvailableTimesForDate(providerId, dateString);
    setAvailableTimes(times);
    
    // Reset selected time if it's no longer available
    if (selectedTime && !times.includes(selectedTime)) {
      setSelectedTime('');
    }
  };

  // Fetch available times when date changes
  useEffect(() => {
    if (date) {
      fetchAvailableTimes(date);
    } else {
      setAvailableTimes([]);
    }
  }, [date, providerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    // Check for auth error (like unverified email)
    if (authError) {
      toast.error('Please complete account verification before booking appointments.');
      return;
    }

    if (!date || !selectedTime || !selectedService || !providerId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await createAppointment(
        providerId,
        selectedService,
        format(date, 'yyyy-MM-dd'),
        selectedTime,
        method
      );

      if (success) {
        toast.success('Appointment booked successfully!');
        navigate('/dashboard');
      } else {
        toast.error('Failed to book appointment. Please try again.');
      }
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      
      if (error.message?.includes('User not authenticated')) {
        setAuthError('Your session has expired. Please sign in again.');
        setIsAuthenticated(false);
        toast.error('Please sign in again to book your appointment.');
      } else {
        toast.error('Failed to book appointment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Appointment</CardTitle>
        <CardDescription>Schedule your appointment with ease</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service">Select Service</Label>
            <Select onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Select Time</Label>
            <Select onValueChange={setSelectedTime} value={selectedTime}>
              <SelectTrigger>
                <SelectValue placeholder={date ? "Select a time" : "Please select a date first"} />
              </SelectTrigger>
              <SelectContent>
                {!date ? (
                  <SelectItem value="__placeholder_date__" disabled>Please select a date first</SelectItem>
                ) : availableTimes.length === 0 ? (
                  <SelectItem value="__placeholder_no_times__" disabled>No available times for this date</SelectItem>
                ) : (
                  availableTimes.map((time) => {
                    // Convert 24-hour format to 12-hour format for display
                    const [hours, minutes] = time.split(':');
                    const hour = parseInt(hours);
                    const displayTime = hour > 12 
                      ? `${hour - 12}:${minutes} PM`
                      : hour === 12 
                        ? `12:${minutes} PM`
                        : hour === 0
                          ? `12:${minutes} AM`
                          : `${hour}:${minutes} AM`;
                    
                    return (
                      <SelectItem key={time} value={time}>
                        {displayTime}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Meeting Method</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant={method === 'video' ? 'default' : 'outline'}
                onClick={() => setMethod('video')}
              >
                Video Call
              </Button>
              <Button
                variant={method === 'in-person' ? 'default' : 'outline'}
                onClick={() => setMethod('in-person')}
              >
                In-Person
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !!authError}>
            {isSubmitting ? 'Booking...' : isAuthenticated && !authError ? 'Book Appointment' : 'Continue to Book'}
          </Button>

          {authError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-800 mb-3">{authError}</p>
              {authError.includes('verification') && email && (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleResendVerification}
                      disabled={emailCooldown > 0 || verificationEmailCount >= 5}
                      className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                    >
                      {emailCooldown > 0 
                        ? `Resend in ${emailCooldown}s` 
                        : verificationEmailCount >= 5 
                          ? 'Limit reached' 
                          : 'Resend Verification Email'
                      }
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={handleCheckEmailVerification}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Already verified? Click here
                    </Button>
                  </div>
                  {verificationEmailCount > 0 && (
                    <p className="text-xs text-yellow-700">
                      Emails sent: {verificationEmailCount}/5 this hour
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {!isAuthenticated && !authError && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              <User className="inline h-4 w-4 mr-1" />
              You'll need to sign in or create an account to book this appointment
            </p>
          )}
        </form>
      </CardContent>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </DialogTitle>
            <DialogDescription>
              {authMode === 'login' 
                ? 'Sign in to your account to book this appointment' 
                : 'Create an account to book this appointment'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            {authError && authMode === 'login' && authError.includes('verification') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 mb-3">Account not verified yet?</p>
                <div className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={handleResendVerification}
                      disabled={emailCooldown > 0 || verificationEmailCount >= 5}
                      className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                    >
                      {emailCooldown > 0 
                        ? `Resend in ${emailCooldown}s` 
                        : verificationEmailCount >= 5 
                          ? 'Limit reached' 
                          : 'Resend Verification Email'
                      }
                    </Button>
                    <Button 
                      type="button"
                      variant="default" 
                      size="sm" 
                      onClick={handleCheckEmailVerification}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Already verified? Click here
                    </Button>
                  </div>
                  {verificationEmailCount > 0 && (
                    <p className="text-xs text-yellow-700">
                      Emails sent: {verificationEmailCount}/5 this hour
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError(null);
                }}
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PublicBooking;
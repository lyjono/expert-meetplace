
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getUserProfile, supabase } from "@/lib/supabase";

interface ClientSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  profile_visibility: boolean;
  activity_tracking: boolean;
  two_factor_auth: boolean;
  timezone: string;
}

const defaultSettings: ClientSettings = {
  id: '',
  user_id: '',
  email_notifications: true,
  sms_notifications: true,
  marketing_emails: false,
  profile_visibility: true,
  activity_tracking: true,
  two_factor_auth: false,
  timezone: 'America/New_York'
};

const ClientSettings = () => {
  const [settings, setSettings] = useState<ClientSettings>(defaultSettings);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const profile = await getUserProfile();
        if (!profile) {
          toast.error("Could not load user profile");
          return;
        }

        // Get client settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('client_settings')
          .select('*')
          .eq('user_id', profile.user_id)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error
          console.error("Error fetching settings:", settingsError);
          toast.error("Failed to load settings");
          return;
        }

        if (settingsData) {
          setSettings(settingsData);
        } else {
          // Create default settings if none exist
          const { data: newSettings, error: createError } = await supabase
            .from('client_settings')
            .insert({
              user_id: profile.user_id,
              ...defaultSettings
            })
            .select('*')
            .single();

          if (createError) {
            console.error("Error creating settings:", createError);
            toast.error("Failed to create settings");
            return;
          }

          if (newSettings) {
            setSettings(newSettings);
          }
        }
        
        // Set email and phone from profile
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
      } catch (error) {
        console.error("Error in settings initialization:", error);
        toast.error("Failed to initialize settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update client profile
      const { error: profileError } = await supabase
        .from('client_profiles')
        .update({
          email: email,
          phone: phone
        })
        .eq('user_id', settings.user_id);

      if (profileError) throw profileError;

      // Update settings
      const { error: settingsError } = await supabase
        .from('client_settings')
        .update({
          timezone: settings.timezone
        })
        .eq('id', settings.id);

      if (settingsError) throw settingsError;

      toast.success("General settings saved successfully");
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast.error("Failed to save settings");
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('client_settings')
        .update({
          email_notifications: settings.email_notifications,
          sms_notifications: settings.sms_notifications,
          marketing_emails: settings.marketing_emails
        })
        .eq('id', settings.id);

      if (error) throw error;
      
      toast.success("Notification preferences saved successfully");
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Failed to save notification preferences");
    }
  };

  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('client_settings')
        .update({
          profile_visibility: settings.profile_visibility,
          activity_tracking: settings.activity_tracking,
          two_factor_auth: settings.two_factor_auth
        })
        .eq('id', settings.id);

      if (error) throw error;
      
      toast.success("Privacy settings saved successfully");
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast.error("Failed to save privacy settings");
    }
  };

  const handleSettingToggle = (setting: keyof ClientSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="user">
        <div className="grid gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="user">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage your basic account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGeneral} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={settings.timezone}
                      onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                    >
                      <option value="America/New_York">Eastern Time (US & Canada)</option>
                      <option value="America/Chicago">Central Time (US & Canada)</option>
                      <option value="America/Denver">Mountain Time (US & Canada)</option>
                      <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                    </select>
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveNotifications} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your appointments
                      </p>
                    </div>
                    <Switch 
                      checked={settings.email_notifications}
                      onCheckedChange={() => handleSettingToggle('email_notifications')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get text message reminders for upcoming appointments
                      </p>
                    </div>
                    <Switch 
                      checked={settings.sms_notifications}
                      onCheckedChange={() => handleSettingToggle('sms_notifications')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional emails and special offers
                      </p>
                    </div>
                    <Switch 
                      checked={settings.marketing_emails}
                      onCheckedChange={() => handleSettingToggle('marketing_emails')}
                    />
                  </div>
                  <Button type="submit">Save Preferences</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePrivacy} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow experts to view your profile information
                      </p>
                    </div>
                    <Switch 
                      checked={settings.profile_visibility}
                      onCheckedChange={() => handleSettingToggle('profile_visibility')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Activity Tracking</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to collect usage data to improve the service
                      </p>
                    </div>
                    <Switch 
                      checked={settings.activity_tracking}
                      onCheckedChange={() => handleSettingToggle('activity_tracking')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch 
                      checked={settings.two_factor_auth}
                      onCheckedChange={() => handleSettingToggle('two_factor_auth')}
                    />
                  </div>
                  <Button type="submit">Save Settings</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientSettings;

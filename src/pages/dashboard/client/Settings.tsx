
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getClientSettings, updateClientSettings, ClientSettings } from "@/services/clientSettings";

const Settings = () => {
  const [settings, setSettings] = useState<ClientSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const data = await getClientSettings();
        if (data) {
          setSettings(data);
        } else {
          toast.error("Could not load settings");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleToggleSetting = (field: keyof ClientSettings) => {
    if (!settings) return;
    
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: !prev[field as keyof ClientSettings]
      };
    });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const success = await updateClientSettings(settings);
      if (success) {
        toast.success("Settings updated successfully");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimezoneChange = (value: string) => {
    if (!settings) return;
    
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        timezone: value
      };
    });
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

  if (!settings) {
    return (
      <DashboardLayout userType="user">
        <div className="grid gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Could not load settings. Please try again later.
          </p>
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

      <div className="grid gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you would like to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="grid gap-1">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={settings.email_notifications} 
                onCheckedChange={() => handleToggleSetting('email_notifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="grid gap-1">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text message alerts for appointments
                </p>
              </div>
              <Switch 
                id="sms-notifications" 
                checked={settings.sms_notifications} 
                onCheckedChange={() => handleToggleSetting('sms_notifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="grid gap-1">
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about new features and special offers
                </p>
              </div>
              <Switch 
                id="marketing-emails" 
                checked={settings.marketing_emails} 
                onCheckedChange={() => handleToggleSetting('marketing_emails')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
            <CardDescription>
              Manage your privacy and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="grid gap-1">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Allow experts to view your profile information
                </p>
              </div>
              <Switch 
                id="profile-visibility" 
                checked={settings.profile_visibility} 
                onCheckedChange={() => handleToggleSetting('profile_visibility')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="grid gap-1">
                <Label htmlFor="activity-tracking">Activity Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Allow us to collect usage data to improve your experience
                </p>
              </div>
              <Switch 
                id="activity-tracking" 
                checked={settings.activity_tracking} 
                onCheckedChange={() => handleToggleSetting('activity_tracking')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="grid gap-1">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch 
                id="two-factor" 
                checked={settings.two_factor_auth} 
                onCheckedChange={() => handleToggleSetting('two_factor_auth')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional Settings</CardTitle>
            <CardDescription>
              Configure your time zone and regional preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select value={settings.timezone} onValueChange={handleTimezoneChange}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">GMT / UTC</SelectItem>
                  <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australian Eastern Time (AET)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

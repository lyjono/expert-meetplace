
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getUserProfile, supabase } from "@/lib/supabase";

interface ClientProfileData {
  id: string;
  name: string;
  email: string;
  user_id: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  bio?: string;
  avatar_url?: string;
}

const ClientProfile = () => {
  const [profile, setProfile] = useState<ClientProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<ClientProfileData>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const profileData = await getUserProfile();
        if (profileData && profileData.type === 'client') {
          setProfile(profileData as ClientProfileData);
          setFormData(profileData as ClientProfileData);
        } else {
          toast.error("Could not load profile data");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('profile-', '')]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('client_profiles')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          bio: formData.bio
        })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      setProfile(prev => ({ ...prev!, ...formData } as ClientProfileData));
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="user">
        <div className="grid gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">Loading profile data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout userType="user">
        <div className="grid gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">
            Profile not found. Please contact support.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="user">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Update your profile photo
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Change Photo</Button>
                <Button variant="outline" size="sm">Remove</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input 
                      id="profile-name" 
                      value={formData.name || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input 
                      id="profile-email" 
                      type="email" 
                      value={formData.email || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile-phone">Phone</Label>
                  <Input 
                    id="profile-phone" 
                    type="tel" 
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile-address">Address</Label>
                  <Input 
                    id="profile-address" 
                    value={formData.address || ''}
                    onChange={handleChange}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="profile-city">City</Label>
                    <Input 
                      id="profile-city" 
                      value={formData.city || ''}
                      onChange={handleChange}
                      placeholder="New York"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profile-state">State</Label>
                    <Input 
                      id="profile-state" 
                      value={formData.state || ''}
                      onChange={handleChange}
                      placeholder="NY"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profile-zip">ZIP Code</Label>
                    <Input 
                      id="profile-zip" 
                      value={formData.zip || ''}
                      onChange={handleChange}
                      placeholder="10001"
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label htmlFor="profile-bio">About Me</Label>
                  <Textarea 
                    id="profile-bio" 
                    rows={4}
                    value={formData.bio || ''}
                    onChange={handleChange}
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;

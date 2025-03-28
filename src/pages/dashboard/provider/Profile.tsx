import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom"; // Add useLocation to detect navigation
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/supabase";

interface ProviderProfileData {
  name: string;
  email: string;
  phone: string;
  category: string;
  specialty: string;
  years_experience: number;
  image_url?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  bio?: string;
  education?: string;
  expertise?: string[];
}

const ProviderProfile = () => {
  const location = useLocation(); // Track navigation changes
  const [profile, setProfile] = useState<ProviderProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");

  // Define fetchProfile as a reusable function
  const fetchProfile = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("No user logged in");

      const { data, error } = await supabase
        .from("provider_profiles")
        .select("name, email, phone, category, specialty, years_experience, image_url, address, city, state, zip, bio, education, expertise")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Profile not found");

      const [first, ...last] = data.name.split(" ");
      setFirstName(first || "");
      setLastName(last.join(" ") || "");
      setTitle(data.specialty || data.category || "");
      setCompany(""); // Update if company is added to schema
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setExpertise(data.expertise || [data.category, data.specialty].filter(Boolean));
      setBio(data.bio || "");
      setEducation(data.education || "");
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch profile data on mount and when location changes
  useEffect(() => {
    setLoading(true); // Reset loading state
    fetchProfile();
  }, [fetchProfile, location.pathname]); // Re-run when pathname changes

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("No user logged in");

      const updatedProfile = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        specialty: title,
        bio,
        education,
        expertise,
      };

      const { error } = await supabase
        .from("provider_profiles")
        .update(updatedProfile)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      // Optionally re-fetch to ensure UI reflects the latest DB state
      await fetchProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleAddExpertise = () => {
    const newExpertise = prompt("Enter a new area of expertise:");
    if (newExpertise) setExpertise(prev => [...prev, newExpertise]);
  };

  if (loading) {
    return (
      <DashboardLayout userType="provider">
        <div className="grid gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Provider Profile</h1>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="provider">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Provider Profile</h1>
        <p className="text-muted-foreground">
          Manage your professional profile information
        </p>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your professional photo</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile?.image_url || "/placeholder.svg"} alt={profile?.name} />
                <AvatarFallback>{(firstName[0] + lastName[0]).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Change Photo</Button>
                <Button variant="outline" size="sm">Remove</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
              <CardDescription>How clients see your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.image_url || "/placeholder.svg"} alt={profile?.name} />
                  <AvatarFallback>{(firstName[0] + lastName[0]).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="mt-4 font-semibold text-lg">{profile?.name}</h3>
                <p className="text-sm text-muted-foreground">{title}</p>
                <div className="flex mt-2 gap-1">
                  {expertise.map((item, index) => (
                    <Badge key={index}>{item}</Badge>
                  ))}
                </div>
                <div className="mt-3 text-sm">
                  ★★★★★ <span className="text-muted-foreground">({profile?.rating || "N/A"})</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" size="sm">View Public Profile</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Update your professional details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="expertise">Areas of Expertise</Label>
                  <div className="flex flex-wrap gap-2">
                    {expertise.map((item, index) => (
                      <Badge key={index}>{item}</Badge>
                    ))}
                    <Button variant="outline" size="sm" className="h-6" onClick={handleAddExpertise}>
                      + Add
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself and your expertise..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="education">Education & Certifications</Label>
                  <Textarea
                    id="education"
                    rows={3}
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="List your education and certifications..."
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

export default ProviderProfile;
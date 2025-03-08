
import React from "react";
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

const ProviderProfile = () => {
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully");
  };

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
              <CardDescription>
                Update your professional photo
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src="/placeholder.svg" alt="Dr. Jane Smith" />
                <AvatarFallback>JS</AvatarFallback>
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
              <CardDescription>
                How clients see your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg" alt="Dr. Jane Smith" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <h3 className="mt-4 font-semibold text-lg">Dr. Jane Smith</h3>
                <p className="text-sm text-muted-foreground">Tax Advisor</p>
                <div className="flex mt-2 gap-1">
                  <Badge>Tax Planning</Badge>
                  <Badge>Financial Advice</Badge>
                </div>
                <div className="mt-3 text-sm">
                  ★★★★★ <span className="text-muted-foreground">(4.9)</span>
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
              <CardDescription>
                Update your professional details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" defaultValue="Jane" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" defaultValue="Smith" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <Input id="title" defaultValue="Tax Advisor" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input id="company" defaultValue="Smith Financial Services" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="dr.janesmith@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" defaultValue="(555) 987-6543" />
                </div>
                
                <Separator />
                
                <div className="grid gap-2">
                  <Label htmlFor="expertise">Areas of Expertise</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Tax Planning</Badge>
                    <Badge>Financial Advice</Badge>
                    <Badge>Small Business</Badge>
                    <Button variant="outline" size="sm" className="h-6">+ Add</Button>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea 
                    id="bio" 
                    rows={4}
                    defaultValue="I'm a certified tax advisor with over 15 years of experience helping individuals and small businesses optimize their tax strategies and financial planning."
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="education">Education & Certifications</Label>
                  <Textarea 
                    id="education" 
                    rows={3}
                    defaultValue="MBA, Financial Planning, Stanford University (2005)
CPA, Certified Public Accountant (2007)
CFP, Certified Financial Planner (2010)"
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

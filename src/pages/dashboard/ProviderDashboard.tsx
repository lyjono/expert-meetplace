
import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Users, FileText, TrendingUp, DollarSign, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const ProviderDashboard = () => {
  return (
    <DashboardLayout userType="provider">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your Provider Dashboard</h1>
        <p className="text-muted-foreground">
          Here's an overview of your practice and upcoming appointments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Next appointment in 45 minutes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              4 new leads today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              3 requiring urgent attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Your schedule for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-accent/50 rounded-md">
              <div>
                <div className="font-medium">Alex Johnson</div>
                <div className="text-sm text-muted-foreground">Tax Consultation</div>
              </div>
              <div className="text-sm font-medium">10:30 AM</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-accent/50 rounded-md">
              <div>
                <div className="font-medium">Sarah Williams</div>
                <div className="text-sm text-muted-foreground">Financial Planning</div>
              </div>
              <div className="text-sm font-medium">1:15 PM</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-accent/50 rounded-md">
              <div>
                <div className="font-medium">Michael Brown</div>
                <div className="text-sm text-muted-foreground">Legal Advice</div>
              </div>
              <div className="text-sm font-medium">3:45 PM</div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for providers
            </CardDescription>
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
            <CardDescription>
              Your service metrics and client interactions
            </CardDescription>
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


import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Leads = () => {
  return (
    <DashboardLayout userType="provider">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Manage your potential clients and convert leads into appointments.
        </p>
      </div>

      <Tabs defaultValue="new" className="mt-6">
        <TabsList>
          <TabsTrigger value="new">New Leads</TabsTrigger>
          <TabsTrigger value="contacted">Contacted</TabsTrigger>
          <TabsTrigger value="qualified">Qualified</TabsTrigger>
          <TabsTrigger value="converted">Converted</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-4">
          <div className="grid gap-4">
            {newLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="contacted" className="mt-4">
          <div className="grid gap-4">
            {contactedLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="qualified" className="mt-4">
          <div className="grid gap-4">
            {qualifiedLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="converted" className="mt-4">
          <div className="grid gap-4">
            {convertedLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  status: "new" | "contacted" | "qualified" | "converted";
  date: string;
  message: string;
  image?: string;
}

interface LeadCardProps {
  lead: Lead;
}

const LeadCard = ({ lead }: LeadCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={lead.image || "/placeholder.svg"} alt={lead.name} />
              <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{lead.name}</CardTitle>
              <CardDescription>{lead.email}</CardDescription>
            </div>
          </div>
          <Badge
            variant={
              lead.status === "new"
                ? "default"
                : lead.status === "contacted"
                ? "secondary"
                : lead.status === "qualified"
                ? "outline"
                : "success"
            }
          >
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-2">
          <p>
            <strong>Service:</strong> {lead.service}
          </p>
          <p>
            <strong>Date:</strong> {lead.date}
          </p>
        </div>
        <p className="text-sm mb-4">{lead.message}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Message</Button>
          <Button size="sm" variant="outline">
            Schedule Call
          </Button>
          {lead.status === "new" && (
            <Button size="sm" variant="secondary">
              Mark as Contacted
            </Button>
          )}
          {lead.status === "contacted" && (
            <Button size="sm" variant="secondary">
              Mark as Qualified
            </Button>
          )}
          {lead.status === "qualified" && (
            <Button size="sm" variant="secondary">
              Convert to Client
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Sample data for the different lead categories
const newLeads: Lead[] = [
  {
    id: "1",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "(555) 123-4567",
    service: "Tax Planning",
    status: "new",
    date: "July 15, 2023",
    message: "I'm looking for help with tax planning for my small business. I'd like to schedule a consultation to discuss strategies for the upcoming tax year.",
  },
  {
    id: "2",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "(555) 234-5678",
    service: "Business Formation",
    status: "new",
    date: "July 16, 2023",
    message: "I'm planning to start a new LLC and need guidance on the legal requirements and tax implications. Would appreciate your expert advice.",
  },
];

const contactedLeads: Lead[] = [
  {
    id: "3",
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "(555) 345-6789",
    service: "Estate Planning",
    status: "contacted",
    date: "July 10, 2023",
    message: "I need to update my will and create a trust for my children. I'm looking for comprehensive estate planning services.",
  },
];

const qualifiedLeads: Lead[] = [
  {
    id: "4",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "(555) 456-7890",
    service: "Financial Planning",
    status: "qualified",
    date: "July 5, 2023",
    message: "I'm looking for a complete financial review and retirement planning. I have a portfolio that needs evaluation and recommendations.",
  },
];

const convertedLeads: Lead[] = [
  {
    id: "5",
    name: "Robert Martinez",
    email: "robert.martinez@example.com",
    phone: "(555) 567-8901",
    service: "Tax Preparation",
    status: "converted",
    date: "June 28, 2023",
    message: "I need assistance with tax preparation for my business. I have complex requirements including multiple income streams and deductions.",
  },
];

export default Leads;

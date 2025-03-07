
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead, getLeadsByStatus, updateLeadStatus } from "@/services/leads";
import { toast } from "sonner";

const Leads = () => {
  const [activeTab, setActiveTab] = useState("new");
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads', activeTab],
    queryFn: () => getLeadsByStatus(activeTab),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ leadId, newStatus }: { leadId: string; newStatus: string }) => 
      updateLeadStatus(leadId, newStatus),
    onSuccess: () => {
      toast.success("Lead status updated successfully");
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      toast.error("Failed to update lead status");
    }
  });

  const handleUpdateStatus = (leadId: string, newStatus: string) => {
    updateStatusMutation.mutate({ leadId, newStatus });
  };

  return (
    <DashboardLayout userType="provider">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Manage your potential clients and convert leads into appointments.
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="new">New Leads</TabsTrigger>
          <TabsTrigger value="contacted">Contacted</TabsTrigger>
          <TabsTrigger value="qualified">Qualified</TabsTrigger>
          <TabsTrigger value="converted">Converted</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-4">
          {isLoading ? (
            <p>Loading leads...</p>
          ) : leads.length > 0 ? (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No new leads found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="contacted" className="mt-4">
          {isLoading ? (
            <p>Loading leads...</p>
          ) : leads.length > 0 ? (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No contacted leads found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="qualified" className="mt-4">
          {isLoading ? (
            <p>Loading leads...</p>
          ) : leads.length > 0 ? (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No qualified leads found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="converted" className="mt-4">
          {isLoading ? (
            <p>Loading leads...</p>
          ) : leads.length > 0 ? (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No converted leads found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

interface LeadCardProps {
  lead: Lead;
  onUpdateStatus: (leadId: string, newStatus: string) => void;
}

const LeadCard = ({ lead, onUpdateStatus }: LeadCardProps) => {
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
                : "destructive"
            }
            className={lead.status === "converted" ? "bg-green-500 hover:bg-green-600 text-white border-transparent" : ""}
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
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => onUpdateStatus(lead.id, "contacted")}
            >
              Mark as Contacted
            </Button>
          )}
          {lead.status === "contacted" && (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => onUpdateStatus(lead.id, "qualified")}
            >
              Mark as Qualified
            </Button>
          )}
          {lead.status === "qualified" && (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => onUpdateStatus(lead.id, "converted")}
            >
              Convert to Client
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leads;

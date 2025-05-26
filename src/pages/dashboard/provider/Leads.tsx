import React, { useState } from "react";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { DashboardLayout } from "@/components/layout/dashboard-layout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label"; // Add Label import
 import { Lead, getLeadsByStatus, updateLeadStatus, updateLeadNotes, archiveLead } from "@/services/leads";
 import { toast } from "sonner";
 import { supabase } from "@/lib/supabase";

 // Fetch authenticated provider's details
 const getAuthenticatedProvider = async () => {
   const { data: authData, error: authError } = await supabase.auth.getUser();
   if (authError || !authData?.user) throw new Error("User not authenticated");

   const { data, error } = await supabase
     .from("provider_profiles")
     .select("id, user_id, name")
     .eq("user_id", authData.user.id)
     .single();

   if (error) throw error;
   const { data: userTypeData, error: userTypeError } = await supabase
     .from("users_view")
     .select("user_type")
     .eq("user_id", authData.user.id)
     .single();
   if (userTypeError) throw userTypeError;
   if (userTypeData.user_type !== "provider") throw new Error("User is not a provider");

   console.log('Authenticated Provider ID:', data.id);
   return { providerId: data.id, providerName: data.name };
 };

 const Leads = () => {
   const [activeTab, setActiveTab] = useState("new");
   const queryClient = useQueryClient();

   // Fetch providerId
   const { data: providerData, isLoading: isLoadingProvider, error: providerError } = useQuery({
     queryKey: ["authenticatedProvider"],
     queryFn: getAuthenticatedProvider,
   });

   const providerId = providerData?.providerId;

   // Fetch leads with providerId
   const { data: leads = [], isLoading: isLoadingLeads } = useQuery({
     queryKey: ['leads', activeTab, providerId],
     queryFn: () => getLeadsByStatus(activeTab, providerId!),
     enabled: !!providerId,
   });

   const updateStatusMutation = useMutation({
     mutationFn: ({ leadId, newStatus }: { leadId: string; newStatus: string }) => 
       updateLeadStatus(leadId, newStatus),
     onSuccess: () => {
       toast.success("Lead status updated successfully");
       queryClient.invalidateQueries({ queryKey: ['leads'] });
     },
     onError: () => {
       toast.error("Failed to update lead status");
     }
   });

   const updateNotesMutation = useMutation({
     mutationFn: ({ leadId, notes }: { leadId: string; notes: string | null }) => 
       updateLeadNotes(leadId, notes),
     onSuccess: () => {
       toast.success("Lead notes updated successfully");
       queryClient.invalidateQueries({ queryKey: ['leads'] });
     },
     onError: () => {
       toast.error("Failed to update lead notes");
     }
   });

   const archiveLeadMutation = useMutation({
     mutationFn: (leadId: string) => archiveLead(leadId),
     onSuccess: () => {
       toast.success("Lead archived successfully");
       queryClient.invalidateQueries({ queryKey: ['leads'] });
     },
     onError: () => {
       toast.error("Failed to archive lead");
     }
   });

   const handleUpdateStatus = (leadId: string, newStatus: string) => {
     updateStatusMutation.mutate({ leadId, newStatus });
   };

   const handleUpdateNotes = (leadId: string, notes: string | null) => {
     updateNotesMutation.mutate({ leadId, notes });
   };

   const handleArchiveLead = (leadId: string) => {
     archiveLeadMutation.mutate(leadId);
   };

   if (isLoadingProvider) return <div>Loading provider data...</div>;
   if (providerError) return <div>Error: {providerError.message}</div>;

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
           <TabsTrigger value="archived">Archived</TabsTrigger>
         </TabsList>
         <TabsContent value="new" className="mt-4">
           {isLoadingLeads ? (
             <p>Loading leads...</p>
           ) : leads.length > 0 ? (
             <div className="grid gap-4">
               {leads.map((lead) => (
                 <LeadCard 
                   key={lead.id} 
                   lead={lead} 
                   onUpdateStatus={handleUpdateStatus}
                   onUpdateNotes={handleUpdateNotes}
                   onArchiveLead={handleArchiveLead}
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
           {isLoadingLeads ? (
             <p>Loading leads...</p>
           ) : leads.length > 0 ? (
             <div className="grid gap-4">
               {leads.map((lead) => (
                 <LeadCard 
                   key={lead.id} 
                   lead={lead}
                   onUpdateStatus={handleUpdateStatus}
                   onUpdateNotes={handleUpdateNotes}
                   onArchiveLead={handleArchiveLead}
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
           {isLoadingLeads ? (
             <p>Loading leads...</p>
           ) : leads.length > 0 ? (
             <div className="grid gap-4">
               {leads.map((lead) => (
                 <LeadCard 
                   key={lead.id} 
                   lead={lead}
                   onUpdateStatus={handleUpdateStatus}
                   onUpdateNotes={handleUpdateNotes}
                   onArchiveLead={handleArchiveLead}
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
           {isLoadingLeads ? (
             <p>Loading leads...</p>
           ) : leads.length > 0 ? (
             <div className="grid gap-4">
               {leads.map((lead) => (
                 <LeadCard 
                   key={lead.id} 
                   lead={lead}
                   onUpdateStatus={handleUpdateStatus}
                   onUpdateNotes={handleUpdateNotes}
                   onArchiveLead={handleArchiveLead}
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

         <TabsContent value="archived" className="mt-4">
           {isLoadingLeads ? (
             <p>Loading leads...</p>
           ) : leads.length > 0 ? (
             <div className="grid gap-4">
               {leads.map((lead) => (
                 <LeadCard 
                   key={lead.id} 
                   lead={lead}
                   onUpdateStatus={handleUpdateStatus}
                   onUpdateNotes={handleUpdateNotes}
                   onArchiveLead={handleArchiveLead}
                 />
               ))}
             </div>
           ) : (
             <Card>
               <CardContent className="pt-6 text-center">
                 <p className="text-muted-foreground">No archived leads found</p>
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
   onUpdateNotes: (leadId: string, notes: string | null) => void;
   onArchiveLead: (leadId: string) => void;
 }

 const LeadCard = ({ lead, onUpdateStatus, onUpdateNotes, onArchiveLead }: LeadCardProps) => {
   const [notes, setNotes] = useState(lead.notes || '');
   const [isEditingNotes, setIsEditingNotes] = useState(false);

   const handleSaveNotes = () => {
     onUpdateNotes(lead.id, notes || null);
     setIsEditingNotes(false);
   };

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
                 : lead.status === "converted"
                 ? "destructive"
                 : "secondary" // For archived
             }
             className={lead.status === "converted" ? "bg-green-500 hover:bg-green-600 text-white border-transparent" : lead.status === "archived" ? "bg-gray-500 hover:bg-gray-600 text-white border-transparent" : ""}
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
           {lead.phone && (
             <p>
               <strong>Phone:</strong> {lead.phone}
             </p>
           )}
         </div>
         <p className="text-sm mb-4">{lead.message}</p>
         <div className="mb-4">
           <div className="flex justify-between items-center mb-2">
             <Label className="font-bold">Notes:</Label>
             {isEditingNotes ? (
               <Button size="sm" onClick={handleSaveNotes}>
                 Save Notes
               </Button>
             ) : (
               <Button size="sm" variant="outline" onClick={() => setIsEditingNotes(true)}>
                 {lead.notes ? 'Edit Notes' : 'Add Notes'}
               </Button>
             )}
           </div>
           {isEditingNotes ? (
             <Textarea
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               placeholder="Add your notes here..."
               rows={4}
             />
           ) : (
             <p className="text-sm text-muted-foreground">
               {lead.notes || 'No notes added yet.'}
             </p>
           )}
         </div>
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
           {lead.status !== "archived" && (
             <Button 
               size="sm" 
               variant="outline"
               onClick={() => onArchiveLead(lead.id)}
             >
               Archive
             </Button>
           )}
           {lead.status === "archived" && (
             <Button 
               size="sm" 
               variant="outline"
               onClick={() => onUpdateStatus(lead.id, "new")}
             >
               Restore to New
             </Button>
           )}
         </div>
       </CardContent>
     </Card>
   );
 };

 export default Leads;

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, Share2, Calendar, Clock, Upload } from "lucide-react";

const ClientDocuments = () => {
  return (
    <DashboardLayout userType="user">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Manage your documents and files
        </p>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="shared">Shared with Me</TabsTrigger>
              <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
            </TabsList>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Documents</CardTitle>
                <CardDescription>View and manage all your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Tax_Planning_Guide.pdf",
                      size: "2.4 MB",
                      sharedBy: "Dr. Jane Smith",
                      date: "May 10, 2023",
                      type: "shared",
                      image: "/placeholder.svg",
                    },
                    {
                      name: "Investment_Strategy_2023.xlsx",
                      size: "1.8 MB",
                      sharedBy: "Sarah Williams",
                      date: "May 5, 2023",
                      type: "shared",
                      image: "/placeholder.svg",
                    },
                    {
                      name: "Personal_ID_Documents.zip",
                      size: "5.2 MB",
                      uploadedBy: "You",
                      date: "April 28, 2023",
                      type: "uploaded",
                      image: null,
                    },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{doc.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" /> {doc.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      {doc.type === "shared" && (
                        <div className="hidden md:flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Shared by</span>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={doc.image || ""} alt={doc.sharedBy} />
                              <AvatarFallback>{doc.sharedBy?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{doc.sharedBy}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        {doc.type === "uploaded" && (
                          <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        )}
                        {doc.type === "uploaded" && (
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shared">
            <Card>
              <CardHeader>
                <CardTitle>Shared Documents</CardTitle>
                <CardDescription>Documents shared with you by experts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Tax_Planning_Guide.pdf",
                      size: "2.4 MB",
                      sharedBy: "Dr. Jane Smith",
                      date: "May 10, 2023",
                      image: "/placeholder.svg",
                    },
                    {
                      name: "Investment_Strategy_2023.xlsx",
                      size: "1.8 MB",
                      sharedBy: "Sarah Williams",
                      date: "May 5, 2023",
                      image: "/placeholder.svg",
                    },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{doc.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" /> {doc.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Shared by</span>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={doc.image} alt={doc.sharedBy} />
                            <AvatarFallback>{doc.sharedBy.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{doc.sharedBy}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="uploaded">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>Documents you've uploaded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Personal_ID_Documents.zip",
                      size: "5.2 MB",
                      date: "April 28, 2023",
                    },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{doc.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" /> {doc.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientDocuments;

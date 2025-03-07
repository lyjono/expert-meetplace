
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Folder,
  Upload,
  Download,
  Search,
  Eye,
  Share2,
  Trash2,
  File,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const Documents = () => {
  return (
    <DashboardLayout userType="provider">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Manage your documents and share files with clients.
        </p>
      </div>

      <div className="flex justify-between flex-wrap gap-4 mt-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8 w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button variant="outline">
            <Folder className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="my-documents" className="mt-6">
        <TabsList>
          <TabsTrigger value="my-documents">My Documents</TabsTrigger>
          <TabsTrigger value="shared-with-clients">
            Shared with Clients
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="my-documents" className="mt-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Files</CardTitle>
                <CardDescription>
                  Access files you've recently worked on
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {myDocuments.map((doc) => (
                      <DocumentRow key={doc.id} document={doc} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Folders</CardTitle>
                <CardDescription>
                  Organize your documents in folders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {folders.map((folder) => (
                    <Card key={folder.id} className="cursor-pointer hover:bg-accent transition-colors">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Folder className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{folder.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {folder.files} files
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="shared-with-clients" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Documents Shared with Clients
              </CardTitle>
              <CardDescription>
                Files you've shared with your clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {sharedDocuments.map((doc) => (
                    <SharedDocumentRow key={doc.id} document={doc} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Document Templates</CardTitle>
              <CardDescription>
                Reusable templates for common document types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
}

interface SharedDocument extends Document {
  sharedWith: {
    name: string;
    avatar?: string;
  }[];
}

interface Folder {
  id: string;
  name: string;
  files: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
}

interface DocumentRowProps {
  document: Document;
}

const DocumentRow = ({ document }: DocumentRowProps) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">
          {document.type === "pdf" ? (
            <FileText className="h-5 w-5" />
          ) : document.type === "doc" ? (
            <File className="h-5 w-5" />
          ) : (
            <File className="h-5 w-5" />
          )}
        </div>
        <div>
          <div className="font-medium text-sm">{document.name}</div>
          <div className="text-xs text-muted-foreground">
            {document.modified} · {document.size}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Download className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Move</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

interface SharedDocumentRowProps {
  document: SharedDocument;
}

const SharedDocumentRow = ({ document }: SharedDocumentRowProps) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">
          {document.type === "pdf" ? (
            <FileText className="h-5 w-5" />
          ) : document.type === "doc" ? (
            <File className="h-5 w-5" />
          ) : (
            <File className="h-5 w-5" />
          )}
        </div>
        <div>
          <div className="font-medium text-sm">{document.name}</div>
          <div className="text-xs text-muted-foreground">
            {document.modified} · {document.size}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {document.sharedWith.slice(0, 3).map((person, i) => (
            <Avatar key={i} className="h-6 w-6 border-2 border-background">
              <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
              <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {document.sharedWith.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
              +{document.sharedWith.length - 3}
            </div>
          )}
        </div>
        <Button size="sm" variant="ghost">
          <Users className="h-4 w-4 mr-1" />
          Manage
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Sample data
const myDocuments: Document[] = [
  {
    id: "1",
    name: "Tax_Planning_Guide_2023.pdf",
    type: "pdf",
    size: "2.3 MB",
    modified: "Today, 10:30 AM",
  },
  {
    id: "2",
    name: "Client_Agreement_Template.doc",
    type: "doc",
    size: "542 KB",
    modified: "Yesterday, 2:15 PM",
  },
  {
    id: "3",
    name: "Financial_Projections_Q3.xlsx",
    type: "xlsx",
    size: "1.8 MB",
    modified: "Jul 15, 2023",
  },
  {
    id: "4",
    name: "Estate_Planning_Worksheet.pdf",
    type: "pdf",
    size: "3.1 MB",
    modified: "Jul 10, 2023",
  },
  {
    id: "5",
    name: "Business_Formation_Checklist.pdf",
    type: "pdf",
    size: "890 KB",
    modified: "Jul 5, 2023",
  },
  {
    id: "6",
    name: "Investment_Strategy_Presentation.pptx",
    type: "pptx",
    size: "4.2 MB",
    modified: "Jun 28, 2023",
  },
];

const sharedDocuments: SharedDocument[] = [
  {
    id: "1",
    name: "Tax_Strategy_Williams.pdf",
    type: "pdf",
    size: "1.7 MB",
    modified: "Today, 9:45 AM",
    sharedWith: [
      { name: "Sarah Williams" },
    ],
  },
  {
    id: "2",
    name: "Financial_Plan_Johnson.pdf",
    type: "pdf",
    size: "3.2 MB",
    modified: "Yesterday, 4:30 PM",
    sharedWith: [
      { name: "Alex Johnson" },
      { name: "Jennifer Johnson" },
    ],
  },
  {
    id: "3",
    name: "Estate_Documents_Brown.zip",
    type: "zip",
    size: "8.5 MB",
    modified: "Jul 16, 2023",
    sharedWith: [
      { name: "Michael Brown" },
      { name: "Emily Brown" },
      { name: "David Brown" },
      { name: "Sarah Brown" },
    ],
  },
  {
    id: "4",
    name: "LLC_Formation_Davis.pdf",
    type: "pdf",
    size: "1.3 MB",
    modified: "Jul 12, 2023",
    sharedWith: [
      { name: "Emily Davis" },
    ],
  },
];

const folders: Folder[] = [
  {
    id: "1",
    name: "Tax Planning",
    files: 12,
  },
  {
    id: "2",
    name: "Estate Planning",
    files: 8,
  },
  {
    id: "3",
    name: "Business Formation",
    files: 15,
  },
  {
    id: "4",
    name: "Financial Planning",
    files: 10,
  },
  {
    id: "5",
    name: "Client Templates",
    files: 6,
  },
  {
    id: "6",
    name: "Marketing Materials",
    files: 9,
  },
];

const templates: Template[] = [
  {
    id: "1",
    name: "Client Agreement",
    description: "Standard service agreement for new clients",
  },
  {
    id: "2",
    name: "Tax Planning Worksheet",
    description: "Form for collecting tax planning information",
  },
  {
    id: "3",
    name: "Estate Planning Questionnaire",
    description: "Comprehensive estate planning questions",
  },
  {
    id: "4",
    name: "Business Formation Checklist",
    description: "Steps for forming a new business entity",
  },
  {
    id: "5",
    name: "Financial Planning Intake Form",
    description: "Initial assessment for financial planning clients",
  },
  {
    id: "6",
    name: "Investment Policy Statement",
    description: "Template for client investment strategies",
  },
];

export default Documents;

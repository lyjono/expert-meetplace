// src/pages/client/documents.tsx (or similar path)
import React, { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Download, Trash2, Share2, Calendar, Upload, Loader2, MoreVertical, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


// Import your Supabase helper functions and interfaces
import {
    Document,
    getDocuments, // Fetches documents owned by the current user (Uploaded)
    getSharedDocuments, // Fetches documents shared with the current user
    uploadDocument,
    deleteDocument, // Only allow deleting OWN documents
    getUserProfiles, // Needed to show who shared the document
    shareDocument, // Client might share their OWN uploaded docs
} from '@/services/documents'; // Adjust path as needed
import { getCurrentUser } from "@/lib/supabase"; // To get current user ID if needed

// Define Profile Map type
type ProfileMap = Awaited<ReturnType<typeof getUserProfiles>>;

// --- Helper function to get file icon (reuse from provider component or define here) ---
const getFileIcon = (fileType: string): React.ReactNode => {
  if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />;
  if (fileType.includes('word') || fileType.includes('doc')) return <FileText className="h-5 w-5 text-blue-600" />; // Use FileText or File consistently
  if (fileType.includes('excel') || fileType.includes('sheet')) return <FileText className="h-5 w-5 text-green-600" />;
  if (fileType.includes('presentation') || fileType.includes('ppt')) return <FileText className="h-5 w-5 text-orange-600" />;
  if (fileType.includes('zip') || fileType.includes('archive')) return <FileText className="h-5 w-5 text-yellow-600" />;
  if (fileType.includes('image')) return <FileText className="h-5 w-5 text-purple-600" />;
  return <FileText className="h-5 w-5" />;
};

// --- Formatted Date Helper (reuse from provider component or define here) ---
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Unknown date';
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
        return 'Invalid date';
    }
};


const ClientDocuments = () => {
  const { toast } = useToast();
  const [uploadedDocs, setUploadedDocs] = useState<Document[]>([]);
  const [sharedWithMeDocs, setSharedWithMeDocs] = useState<Document[]>([]);
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sharerProfiles, setSharerProfiles] = useState<ProfileMap>(new Map());
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const user = await getCurrentUser();
    setCurrentUserId(user?.id ?? null);

    const [uploadedResult, sharedResult] = await Promise.all([
      getDocuments(),
      getSharedDocuments(),
    ]);

    setUploadedDocs(uploadedResult);
    setSharedWithMeDocs(sharedResult);

    // Combine and deduplicate for "All" tab
    const combined = new Map<string, Document>();
    uploadedResult.forEach(doc => combined.set(doc.id, doc));
    sharedResult.forEach(doc => combined.set(doc.id, doc)); // Overwrites if owned AND shared, which is fine
    setAllDocs(Array.from(combined.values()).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime() )); // Sort by most recent

    setIsLoading(false);

    // Fetch profiles of users who shared documents
    const sharerIds = new Set<string>();
    sharedResult.forEach(doc => {
        // The owner (`user_id`) is the one who shared it with the current client
        if (doc.user_id) {
            sharerIds.add(doc.user_id);
        }
    });

    if (sharerIds.size > 0) {
        setIsLoadingProfiles(true);
        const profiles = await getUserProfiles(Array.from(sharerIds));
        setSharerProfiles(profiles);
        setIsLoadingProfiles(false);
    }

  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

     // Reset file input value
     if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }

    const success = await uploadDocument(file); // Uploads as the current user
    if (success) {
      toast({ title: "Success", description: `${file.name} uploaded successfully.` });
      fetchData(); // Refresh lists
    } else {
      toast({ title: "Error", description: `Failed to upload ${file.name}.`, variant: "destructive" });
    }
  };

  const handleDelete = async (doc: Document) => {
      // IMPORTANT: Only allow deleting documents owned by the current user
    if (doc.user_id !== currentUserId) {
         toast({ title: "Permission Denied", description: "You can only delete documents you uploaded.", variant: "destructive" });
         return;
    }
     if (!window.confirm(`Are you sure you want to delete "${doc.name}"? This cannot be undone.`)) {
        return;
    }
    const success = await deleteDocument(doc.id);
    if (success) {
      toast({ title: "Success", description: `${doc.name} deleted.` });
      fetchData(); // Refresh lists
    } else {
      toast({ title: "Error", description: `Failed to delete ${doc.name}.`, variant: "destructive" });
    }
  };

  const handleShare = async (doc: Document) => {
      // IMPORTANT: Only allow sharing documents owned by the current user
      if (doc.user_id !== currentUserId) {
         toast({ title: "Permission Denied", description: "You can only share documents you uploaded.", variant: "destructive" });
         return;
      }
    // Placeholder for Sharing UI (similar to provider, maybe share with specific providers/contacts)
    const userIdsToShareWith = prompt(`Enter comma-separated user IDs to share "${doc.name}" with:`);
     if (userIdsToShareWith) {
      const ids = userIdsToShareWith.split(',').map(id => id.trim()).filter(id => id);
      if (ids.length > 0) {
        // Use the existing shareDocument function
        const success = await shareDocument(doc.id, ids);
        if (success) {
          toast({ title: "Success", description: `${doc.name} shared.` });
          // No need to fetchData() here unless you want to see the updated shared_with array immediately
        } else {
          toast({ title: "Error", description: `Failed to share ${doc.name}.`, variant: "destructive" });
        }
      }
    }
     // --- End Placeholder ---
  };

  const handleDownload = (filePath: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.target = "_blank";
    // link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

   const handleView = (filePath: string) => {
    window.open(filePath, '_blank');
  };


  const renderDocumentList = (docs: Document[]) => {
      if (isLoading) {
           return (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            );
      }
      if (docs.length === 0) {
          return <p className="text-center text-muted-foreground py-4">No documents found.</p>;
      }
      return (
        <ScrollArea className="h-[calc(100vh-300px)] pr-4"> {/* Adjust height as needed */}
            <div className="space-y-4">
            {docs.map((doc) => (
                <ClientDocumentRow
                    key={doc.id}
                    document={doc}
                    sharerProfile={sharerProfiles.get(doc.user_id)} // Pass the profile of the owner/sharer
                    isOwner={doc.user_id === currentUserId}
                    onDownload={() => handleDownload(doc.file_path, doc.name)}
                    onView={() => handleView(doc.file_path)}
                    onShare={() => handleShare(doc)}
                    onDelete={() => handleDelete(doc)}
                />
            ))}
            </div>
        </ScrollArea>
      );
  }

  return (
    <DashboardLayout userType="user">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          View documents shared with you and manage your uploads.
        </p>
      </div>

      {/* Hidden file input */}
      <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png" // Match provider component
      />

      <div className="mt-6">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="shared">Shared with Me</TabsTrigger>
              <TabsTrigger value="uploaded">My Uploads</TabsTrigger>
            </TabsList>
            <Button onClick={handleUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Documents</CardTitle>
                <CardDescription>View all documents available to you</CardDescription>
              </CardHeader>
              <CardContent>
                  {renderDocumentList(allDocs)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shared">
            <Card>
              <CardHeader>
                <CardTitle>Shared With Me</CardTitle>
                <CardDescription>Documents shared with you by your providers</CardDescription>
              </CardHeader>
              <CardContent>
                 {renderDocumentList(sharedWithMeDocs)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uploaded">
            <Card>
              <CardHeader>
                <CardTitle>My Uploads</CardTitle>
                <CardDescription>Documents you have uploaded</CardDescription>
              </CardHeader>
              <CardContent>
                 {renderDocumentList(uploadedDocs)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};


// --- ClientDocumentRow Component ---
interface ClientDocumentRowProps {
  document: Document;
  sharerProfile?: { full_name?: string; avatar_url?: string };
  isOwner: boolean;
  onDownload: () => void;
  onView: () => void;
  onShare: () => void;
  onDelete: () => void;
}

const ClientDocumentRow = ({ document, sharerProfile, isOwner, onDownload, onView, onShare, onDelete }: ClientDocumentRowProps) => {
  const sharerName = sharerProfile?.full_name || 'Unknown User';
  const sharerInitial = sharerName?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors gap-2">
      <div className="flex items-center gap-3 flex-grow min-w-0">
        <div className="bg-primary/10 p-2 rounded flex-shrink-0">
          {/* Use consistent file icon logic */}
           {getFileIcon(document.file_type)}
        </div>
        <div className="truncate">
          <h3 className="font-medium text-sm truncate">{document.name}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {/* Omit size for now */}
             {!isOwner && sharerProfile && (
                <>
                <div className="flex items-center gap-1">
                    <Avatar className="h-4 w-4">
                        <AvatarImage src={sharerProfile.avatar_url || undefined} alt={sharerName} />
                        <AvatarFallback className="text-[8px]">{sharerInitial}</AvatarFallback>
                    </Avatar>
                    <span>{sharerName}</span>
                </div>
                <span>•</span>
                </>
            )}
             {isOwner && (
                <>
                 <span>Uploaded by You</span>
                 <span>•</span>
                </>
             )}
            <span className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" /> {formatDate(document.updated_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onView} title="View">
             <Eye className="h-4 w-4" />
         </Button>
         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDownload} title="Download">
             <Download className="h-4 w-4" />
         </Button>
         {/* Only show Share/Delete for owned documents */}
         {isOwner && (
            <>
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShare} title="Share">
                    <Share2 className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete} title="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                 </Button>
            </>
         )}
         {/* Add More options dropdown if needed for other actions */}
      </div>
    </div>
  );
};

export default ClientDocuments;
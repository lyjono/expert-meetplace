          // src/pages/dashboard/provider/Documents.tsx
          import React, { useState, useEffect, useCallback, useRef } from "react";
          import { DashboardLayout } from "@/components/layout/dashboard-layout";
          import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
          import { Button } from "@/components/ui/button";
          import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
          import { Input } from "@/components/ui/input";
          // Removed unused Badge import
          import {
            FileText,
            // Folder, // Can remove if not using folders
            Upload,
            Download,
            Search,
            Eye,
            Share2,
            Trash2,
            File, // Keep File for icon helper
            Users,
            MoreVertical,
            Loader2,
            Calendar, // Added for ClientDocumentRow adaptation
          } from "lucide-react";
          import {
            DropdownMenu,
            DropdownMenuContent,
            DropdownMenuItem,
            DropdownMenuTrigger,
          } from "@/components/ui/dropdown-menu";
          import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
          import { ScrollArea } from "@/components/ui/scroll-area";
          import { useToast } from "@/components/ui/use-toast";
          import { formatDistanceToNow } from 'date-fns';

          // Import your Supabase helper functions and interfaces
          import {
              Document, // Use existing Document interface
              getDocuments,
              getDocumentsSharedByMe,
              getSharedDocuments, // <-- Import this function
              uploadDocument,
              shareDocument,
              deleteDocument,
              getUserProfiles,
          } from '@/services/documents'; // Adjust path as needed
          import { getCurrentUser } from "@/lib/supabase"; // Added import

          // Define Profile Map type
          type ProfileMap = Awaited<ReturnType<typeof getUserProfiles>>;

          // --- Reusable Helper Functions (getFileIcon, formatDate - ensure they exist or copy from previous versions) ---
          const getFileIcon = (fileType: string): React.ReactNode => {
              if (!fileType) return <File className="h-5 w-5" />; // Handle null/undefined type
              if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />;
              if (fileType.includes('word') || fileType.includes('doc')) return <File className="h-5 w-5 text-blue-600" />;
              if (fileType.includes('excel') || fileType.includes('sheet')) return <File className="h-5 w-5 text-green-600" />;
              if (fileType.includes('presentation') || fileType.includes('ppt')) return <File className="h-5 w-5 text-orange-600" />;
              if (fileType.includes('zip') || fileType.includes('archive')) return <File className="h-5 w-5 text-yellow-600" />;
              if (fileType.includes('image')) return <File className="h-5 w-5 text-purple-600" />;
              return <File className="h-5 w-5" />;
          };

          const formatDate = (dateString: string | null | undefined): string => {
              if (!dateString) return 'Unknown date';
              try {
                  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
              } catch (e) {
                  return 'Invalid date';
              }
          };
          // --- End Helper Functions ---

          const Documents = () => {
            const { toast } = useToast();
            const [myDocs, setMyDocs] = useState<Document[]>([]);
            const [sharedByMeDocs, setSharedByMeDocs] = useState<Document[]>([]);
            const [sharedWithMeDocs, setSharedWithMeDocs] = useState<Document[]>([]); // <-- New state
            const [isLoadingMyDocs, setIsLoadingMyDocs] = useState(true);
            const [isLoadingSharedByMe, setIsLoadingSharedByMe] = useState(true); // Renamed for clarity
            const [isLoadingSharedWithMe, setIsLoadingSharedWithMe] = useState(true); // <-- New loading state
            const [searchTerm, setSearchTerm] = useState('');
            const fileInputRef = useRef<HTMLInputElement>(null);
            const [currentUserId, setCurrentUserId] = useState<string | null>(null); // <-- State for current user ID

            // Combined state for profiles for simplicity, keys are user IDs
            const [userProfiles, setUserProfiles] = useState<ProfileMap>(new Map());
            const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

            const fetchData = useCallback(async () => {
              setIsLoadingMyDocs(true);
              setIsLoadingSharedByMe(true);
              setIsLoadingSharedWithMe(true); // Set loading true for the new tab
              setIsLoadingProfiles(true); // Start loading profiles

              const user = await getCurrentUser();
              setCurrentUserId(user?.id ?? null);

              const [myDocsResult, sharedByMeResult, sharedWithMeResult] = await Promise.all([
                getDocuments(),
                getDocumentsSharedByMe(),
                getSharedDocuments(), // <-- Fetch documents shared with the provider
              ]);

              setMyDocs(myDocsResult);
              setSharedByMeDocs(sharedByMeResult);
              setSharedWithMeDocs(sharedWithMeResult); // <-- Set the new state

              setIsLoadingMyDocs(false);
              setIsLoadingSharedByMe(false);
              setIsLoadingSharedWithMe(false); // Set loading false

              // --- Fetch profiles for ALL relevant users ---
              const allUserIds = new Set<string>();
              // Users shared *with* in "Shared by Me" tab
              sharedByMeResult.forEach(doc => {
                  doc.shared_with?.forEach(id => allUserIds.add(id));
              });
              // Users who *own/shared* documents in "Shared With Me" tab
              sharedWithMeResult.forEach(doc => {
                  if (doc.user_id) {
                      allUserIds.add(doc.user_id);
                  }
              });

              if (allUserIds.size > 0) {
                  const profiles = await getUserProfiles(Array.from(allUserIds));
                  setUserProfiles(profiles);
              }
              setIsLoadingProfiles(false);

            }, []);

            useEffect(() => {
              fetchData();
            }, [fetchData]);

            // --- Action Handlers (handleUploadClick, handleFileSelected, handleDelete, handleShare, handleDownload, handleView) ---
            // Keep these largely the same as before.
            // Ensure handleDelete checks ownership (currentUserId === doc.user_id)
            // Ensure handleShare checks ownership if called from My Docs / Shared By Me
            const handleUploadClick = () => { fileInputRef.current?.click(); };

            const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if(fileInputRef.current) { fileInputRef.current.value = ""; } // Reset input

              const success = await uploadDocument(file);
              if (success) {
                toast({ title: "Success", description: `${file.name} uploaded successfully.` });
                fetchData();
              } else {
                toast({ title: "Error", description: `Failed to upload ${file.name}.`, variant: "destructive" });
              }
            };

            const handleDelete = async (doc: Document) => { // Pass the whole doc
               if (doc.user_id !== currentUserId) {
                   toast({ title: "Permission Denied", description: "You can only delete documents you own.", variant: "destructive" });
                   return;
               }
              if (!window.confirm(`Are you sure you want to delete "${doc.name}"? This cannot be undone.`)) {
                  return;
              }
              const success = await deleteDocument(doc.id);
              if (success) {
                toast({ title: "Success", description: `${doc.name} deleted.` });
                fetchData();
              } else {
                toast({ title: "Error", description: `Failed to delete ${doc.name}.`, variant: "destructive" });
              }
            };

            const handleShare = async (doc: Document) => { // Pass the whole doc
                if (doc.user_id !== currentUserId) {
                   toast({ title: "Permission Denied", description: "You can only manage sharing for documents you own.", variant: "destructive" });
                   return;
               }
              // Placeholder for Sharing UI
              const userIdsToShareWith = prompt(`Enter comma-separated user IDs to share/update sharing for "${doc.name}":\nCurrently shared with: ${doc.shared_with?.join(', ') || 'nobody'}`);
              if (userIdsToShareWith !== null) { // Check for cancel
                const ids = userIdsToShareWith.split(',').map(id => id.trim()).filter(id => id);
                // Note: shareDocument currently only *adds* users. You might need an 'updateSharing' function
                // that replaces the `shared_with` array entirely for a real "manage" feature.
                // For now, we'll use the existing add logic.
                const success = await shareDocument(doc.id, ids);
                if (success) {
                  toast({ title: "Success", description: `Sharing updated for ${doc.name}.` });
                  fetchData();
                } else {
                  toast({ title: "Error", description: `Failed to update sharing for ${doc.name}.`, variant: "destructive" });
                }
              }
            };

            const handleDownload = (filePath: string, fileName: string) => {
              const link = document.createElement('a');
              link.href = filePath;
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

             const handleView = (filePath: string) => {
              window.open(filePath, '_blank');
            };

            // --- Filtering Logic ---
            const filterDocs = (docs: Document[]) =>
              docs.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));

            const filteredMyDocs = filterDocs(myDocs);
            const filteredSharedByMeDocs = filterDocs(sharedByMeDocs);
            const filteredSharedWithMeDocs = filterDocs(sharedWithMeDocs); // <-- Filter the new list


            // --- Render Loading/Empty states ---
            const renderLoading = () => (
              <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            );
            const renderEmpty = (message: string) => (
               <p className="text-center text-muted-foreground py-4">{message}</p>
            );

            return (
              <DashboardLayout userType="provider">
                {/* Header */}
                <div className="grid gap-4">
                  <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                  <p className="text-muted-foreground">
                    Manage documents you own and view documents shared with you.
                  </p>
                </div>

                 {/* Hidden file input */}
                 <input
                    type="file" ref={fileInputRef} onChange={handleFileSelected}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png"
                />

                {/* Search and Actions */}
                <div className="flex justify-between flex-wrap gap-4 mt-6">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search" placeholder="Search documents..." className="pl-8 w-full"
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUploadClick}>
                      <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="my-documents" className="mt-6">
                  <TabsList>
                    <TabsTrigger value="my-documents">My Documents</TabsTrigger>
                    <TabsTrigger value="shared-by-me">Shared by Me</TabsTrigger>
                    <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger> {/* <-- New Tab Trigger */}
                  </TabsList>

                  {/* My Documents Tab */}
                  <TabsContent value="my-documents" className="mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">My Files</CardTitle>
                        <CardDescription>Documents you have uploaded</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                          {isLoadingMyDocs ? renderLoading() : filteredMyDocs.length > 0 ? (
                            <div className="space-y-2">
                              {filteredMyDocs.map((doc) => (
                                <DocumentRow // Use the row for owned documents
                                  key={doc.id}
                                  document={doc}
                                  onDelete={() => handleDelete(doc)}
                                  onShare={() => handleShare(doc)}
                                  onDownload={() => handleDownload(doc.file_path, doc.name)}
                                  onView={() => handleView(doc.file_path)}
                                />
                              ))}
                            </div>
                          ) : (
                             renderEmpty("You haven't uploaded any documents yet.")
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Shared By Me Tab */}
                  <TabsContent value="shared-by-me" className="mt-4"> {/* Updated value */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Documents Shared by Me</CardTitle>
                        <CardDescription>Files you own and have shared with others</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                           {isLoadingSharedByMe ? renderLoading() : filteredSharedByMeDocs.length > 0 ? (
                            <div className="space-y-2">
                              {filteredSharedByMeDocs.map((doc) => (
                                <SharedDocumentRow // Use the row showing who it's shared with
                                  key={doc.id}
                                  document={doc}
                                  profiles={userProfiles} // Pass combined profiles
                                  isLoadingProfiles={isLoadingProfiles}
                                  onManageShare={() => handleShare(doc)} // Pass whole doc
                                  onDownload={() => handleDownload(doc.file_path, doc.name)}
                                  onView={() => handleView(doc.file_path)} // Added view action
                                />
                              ))}
                            </div>
                          ) : (
                              renderEmpty("You haven't shared any of your documents yet.")
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Shared With Me Tab (NEW) */}
                  <TabsContent value="shared-with-me" className="mt-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Documents Shared With Me</CardTitle>
                          <CardDescription>Files shared with you by clients or others</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px] pr-4">
                             {isLoadingSharedWithMe ? renderLoading() : filteredSharedWithMeDocs.length > 0 ? (
                              <div className="space-y-2">
                                {filteredSharedWithMeDocs.map((doc) => (
                                  // Reuse/Adapt ClientDocumentRow logic here
                                  <ReceivedDocumentRow
                                    key={doc.id}
                                    document={doc}
                                    // Pass the profile of the owner (doc.user_id)
                                    sharerProfile={userProfiles.get(doc.user_id)}
                                    isLoadingProfiles={isLoadingProfiles}
                                    onDownload={() => handleDownload(doc.file_path, doc.name)}
                                    onView={() => handleView(doc.file_path)}
                                  />
                                ))}
                              </div>
                            ) : (
                                renderEmpty("No documents have been shared with you yet.")
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                   </TabsContent>

                </Tabs>
              </DashboardLayout>
            );
          };


          // --- Component: DocumentRow (For owned documents) ---
          interface DocumentRowProps {
            document: Document;
            onDelete: () => void;
            onShare: () => void;
            onDownload: () => void;
            onView: () => void;
          }
          const DocumentRow = ({ document, onDelete, onShare, onDownload, onView }: DocumentRowProps) => {
            // (Keep implementation from previous versions - displays doc info and actions: view, share, download, delete)
             return (
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <div className="text-muted-foreground flex-shrink-0">
                    {getFileIcon(document.file_type)}
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-sm truncate">{document.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Updated {formatDate(document.updated_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onView} title="View"> <Eye className="h-4 w-4" /> </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onShare} title="Manage Sharing"> <Share2 className="h-4 w-4" /> </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDownload} title="Download"> <Download className="h-4 w-4" /> </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="More options"> <MoreVertical className="h-4 w-4" /> </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          };

          // --- Component: SharedDocumentRow (For documents owned by provider, shared BY provider) ---
          interface SharedDocumentRowProps {
            document: Document;
            profiles: ProfileMap;
            isLoadingProfiles: boolean;
            onManageShare: () => void;
            onDownload: () => void;
            onView: () => void; // Added onView
          }
          const SharedDocumentRow = ({ document, profiles, isLoadingProfiles, onManageShare, onDownload, onView }: SharedDocumentRowProps) => {
            // (Keep implementation from previous versions - displays doc info, avatars of shared_with, and actions: view, manage share, download)
            const sharedWithCount = document.shared_with?.length || 0;
            const displayLimit = 3;
            const displayedUserIds = document.shared_with?.slice(0, displayLimit) || [];

            return (
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                {/* File Info */}
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <div className="text-muted-foreground flex-shrink-0">{getFileIcon(document.file_type)}</div>
                  <div className="truncate">
                    <div className="font-medium text-sm truncate">{document.name}</div>
                    <div className="text-xs text-muted-foreground">Shared {formatDate(document.updated_at)}</div>
                  </div>
                </div>
                {/* Shared With Avatars & Actions */}
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                   {sharedWithCount > 0 && !isLoadingProfiles && (
                       <div className="flex -space-x-2" title={`Shared with ${sharedWithCount} user(s)`}>
                          {displayedUserIds.map((userId) => {
                              const profile = profiles.get(userId);
                              return (
                                  <Avatar key={userId} className="h-6 w-6 border-2 border-background">
                                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || userId} />
                                      <AvatarFallback>{profile?.full_name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                                  </Avatar>
                              );
                          })}
                          {sharedWithCount > displayLimit && ( <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background"> +{sharedWithCount - displayLimit} </div> )}
                      </div>
                   )}
                   {isLoadingProfiles && sharedWithCount > 0 && <Loader2 className="h-4 w-4 animate-spin"/>}
                   {sharedWithCount === 0 && !isLoadingProfiles && <span className="text-xs text-muted-foreground">Not shared</span>}

                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onView} title="View"> <Eye className="h-4 w-4" /> </Button>
                  <Button size="sm" variant="ghost" onClick={onManageShare} title="Manage Sharing"> <Users className="h-4 w-4 mr-1" /> Manage </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDownload} title="Download"> <Download className="h-4 w-4" /> </Button>
                </div>
              </div>
            );
          };


          // --- Component: ReceivedDocumentRow (For documents shared WITH provider) ---
          // Adapted from ClientDocumentRow
          interface ReceivedDocumentRowProps {
            document: Document;
            sharerProfile?: UserProfile; // Profile of the owner/sharer
            isLoadingProfiles: boolean;
            onDownload: () => void;
            onView: () => void;
          }
          const ReceivedDocumentRow = ({ document, sharerProfile, isLoadingProfiles, onDownload, onView }: ReceivedDocumentRowProps) => {
            const sharerName = sharerProfile?.full_name || 'Unknown User';
            const sharerInitial = sharerName?.charAt(0)?.toUpperCase() || '?';

            return (
              <div className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors gap-2">
                {/* File Info */}
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <div className="bg-primary/10 p-2 rounded flex-shrink-0">
                     {getFileIcon(document.file_type)}
                  </div>
                  <div className="truncate">
                    <h3 className="font-medium text-sm truncate">{document.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      {/* Show Sharer Info */}
                      {!isLoadingProfiles && sharerProfile && (
                          <>
                          <div className="flex items-center gap-1" title={`Shared by ${sharerName}`}>
                              <Avatar className="h-4 w-4">
                                  <AvatarImage src={sharerProfile.avatar_url || undefined} alt={sharerName} />
                                  <AvatarFallback className="text-[8px]">{sharerInitial}</AvatarFallback>
                              </Avatar>
                              <span className="hidden sm:inline">{sharerName}</span> {/* Hide name on small screens */}
                          </div>
                          <span>•</span>
                          </>
                      )}
                       {isLoadingProfiles && <Loader2 className="h-3 w-3 animate-spin"/>}
                       {!isLoadingProfiles && !sharerProfile && <span>Shared by Unknown •</span>}
                      {/* Date */}
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" /> {formatDate(document.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions (Limited for received documents) */}
                <div className="flex items-center gap-1 flex-shrink-0">
                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onView} title="View">
                       <Eye className="h-4 w-4" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDownload} title="Download">
                       <Download className="h-4 w-4" />
                   </Button>
                   {/* No Delete or Share actions for documents not owned */}
                </div>
              </div>
            );
          };


          export default Documents;
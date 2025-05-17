
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Edit, Trash, Plus } from 'lucide-react';
import { ClientNote, getClientNotes, addClientNote, updateClientNote, deleteClientNote } from '@/services/notes';

interface ClientNotesProps {
  clientId: string;
  providerId: string;
}

export const ClientNotes = ({ clientId, providerId }: ClientNotesProps) => {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [clientId]);

  const fetchNotes = async () => {
    const fetchedNotes = await getClientNotes(clientId);
    setNotes(fetchedNotes);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    const success = await addClientNote({
      provider_id: providerId,
      client_id: clientId,
      content: newNote.trim()
    });

    if (success) {
      toast.success('Note added successfully');
      setNewNote('');
      fetchNotes();
    } else {
      toast.error('Failed to add note');
    }
  };

  const handleUpdateNote = async (id: string) => {
    if (!editContent.trim()) return;
    
    const success = await updateClientNote(id, editContent.trim());
    if (success) {
      toast.success('Note updated successfully');
      setEditingNote(null);
      fetchNotes();
    } else {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    const success = await deleteClientNote(id);
    if (success) {
      toast.success('Note deleted successfully');
      fetchNotes();
    } else {
      toast.error('Failed to delete note');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Client Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Add a new note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={handleAddNote} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
          
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id} className="p-4">
                  {editingNote === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdateNote(note.id)} size="sm">
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingNote(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingNote(note.id);
                              setEditContent(note.content);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

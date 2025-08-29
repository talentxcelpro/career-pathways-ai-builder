import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Plus, Edit2, Trash2, 
  Lock, Unlock 
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface CandidateNotesPanelProps {
  candidateId: string;
}

export const CandidateNotesPanel: React.FC<CandidateNotesPanelProps> = ({
  candidateId
}) => {
  const [newNote, setNewNote] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['candidate-notes', candidateId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('candidate_notes')
        .select('*')
        .eq('candidate_id', candidateId)
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ content, isPrivate: noteIsPrivate }: { content: string; isPrivate: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('candidate_notes')
        .insert({
          candidate_id: candidateId,
          employer_id: user.id,
          note_content: content,
          is_private: noteIsPrivate
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note added successfully');
      setNewNote('');
      queryClient.invalidateQueries({ queryKey: ['candidate-notes', candidateId] });
    },
    onError: (error: any) => {
      toast.error('Failed to add note: ' + error.message);
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      const { error } = await supabase
        .from('candidate_notes')
        .update({ note_content: content })
        .eq('id', noteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note updated successfully');
      setEditingNote(null);
      setEditContent('');
      queryClient.invalidateQueries({ queryKey: ['candidate-notes', candidateId] });
    },
    onError: (error: any) => {
      toast.error('Failed to update note: ' + error.message);
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('candidate_notes')
        .delete()
        .eq('id', noteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['candidate-notes', candidateId] });
    },
    onError: (error: any) => {
      toast.error('Failed to delete note: ' + error.message);
    }
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    addNoteMutation.mutate({
      content: newNote.trim(),
      isPrivate
    });
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note.id);
    setEditContent(note.note_content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    
    updateNoteMutation.mutate({
      noteId: editingNote!,
      content: editContent.trim()
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Notes & Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Note */}
        <div className="space-y-3">
          <Textarea
            placeholder="Add a note about this candidate..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrivate(!isPrivate)}
              className="flex items-center gap-1"
            >
              {isPrivate ? (
                <>
                  <Lock className="h-4 w-4" />
                  Private
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Shared
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleAddNote}
              disabled={!newNote.trim() || addNoteMutation.isPending}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading notes...</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet. Add one above to get started.</p>
            ) : (
              notes.map((note) => (
                <div 
                  key={note.id} 
                  className="p-3 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={note.is_private ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {note.is_private ? 'Private' : 'Shared'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {editingNote === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
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
                    <p className="text-sm">{note.note_content}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
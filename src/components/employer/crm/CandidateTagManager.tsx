import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Tag, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CandidateTagManagerProps {
  candidateId: string;
  existingTags?: Array<{ id: string; tag_name: string; tag_color: string }>;
}

const TAG_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

export const CandidateTagManager: React.FC<CandidateTagManagerProps> = ({
  candidateId,
  existingTags = []
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const addTagMutation = useMutation({
    mutationFn: async ({ tagName, color }: { tagName: string; color: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('candidate_tags')
        .insert({
          candidate_id: candidateId,
          employer_id: user.id,
          tag_name: tagName,
          tag_color: color
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tag added successfully');
      setNewTagName('');
      setSelectedColor(TAG_COLORS[0]);
      queryClient.invalidateQueries({ queryKey: ['candidate-tags', candidateId] });
    },
    onError: (error: any) => {
      toast.error('Failed to add tag: ' + error.message);
    }
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('candidate_tags')
        .delete()
        .eq('id', tagId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tag removed successfully');
      queryClient.invalidateQueries({ queryKey: ['candidate-tags', candidateId] });
    },
    onError: (error: any) => {
      toast.error('Failed to remove tag: ' + error.message);
    }
  });

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    
    addTagMutation.mutate({
      tagName: newTagName.trim(),
      color: selectedColor
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Tag className="h-4 w-4" />
          Manage Tags
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Candidate Tags</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Existing Tags */}
          <div>
            <h4 className="text-sm font-medium mb-2">Current Tags</h4>
            <div className="flex flex-wrap gap-2">
              {existingTags.map((tag) => (
                <Badge 
                  key={tag.id}
                  className="flex items-center gap-1 pr-1"
                  style={{ backgroundColor: tag.tag_color + '20', color: tag.tag_color }}
                >
                  {tag.tag_name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTagMutation.mutate(tag.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {existingTags.length === 0 && (
                <p className="text-sm text-muted-foreground">No tags assigned</p>
              )}
            </div>
          </div>

          {/* Add New Tag */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Add New Tag</h4>
            
            <Input
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            
            <div>
              <p className="text-xs text-muted-foreground mb-2">Select color:</p>
              <div className="flex gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleAddTag}
              disabled={!newTagName.trim() || addTagMutation.isPending}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Tag
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

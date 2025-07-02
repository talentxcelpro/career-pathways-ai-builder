import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EmojiConfig {
  id: string;
  emoji_code: string;
  emoji_name: string;
  is_active: boolean;
  display_order: number;
}

export const EmojiConfigManagement: React.FC = () => {
  const [newEmoji, setNewEmoji] = useState({ code: '', name: '' });
  const queryClient = useQueryClient();

  // Get all emoji configs (including inactive for admin view)
  const { data: emojiConfigs, isLoading } = useQuery({
    queryKey: ['adminEmojiConfigs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emoji_configs')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as EmojiConfig[];
    }
  });

  // Add new emoji
  const addEmojiMutation = useMutation({
    mutationFn: async () => {
      if (!newEmoji.code || !newEmoji.name) {
        throw new Error('Both emoji and name are required');
      }

      const maxOrder = Math.max(0, ...(emojiConfigs?.map(e => e.display_order) || []));
      
      const { error } = await supabase
        .from('emoji_configs')
        .insert({
          emoji_code: newEmoji.code,
          emoji_name: newEmoji.name.toLowerCase().replace(/\s+/g, '_'),
          display_order: maxOrder + 1
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmojiConfigs'] });
      queryClient.invalidateQueries({ queryKey: ['emojiConfigs'] });
      setNewEmoji({ code: '', name: '' });
      toast.success('Emoji added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add emoji');
    }
  });

  // Update emoji
  const updateEmojiMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmojiConfig> }) => {
      const { error } = await supabase
        .from('emoji_configs')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmojiConfigs'] });
      queryClient.invalidateQueries({ queryKey: ['emojiConfigs'] });
      toast.success('Emoji updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update emoji');
    }
  });

  // Delete emoji
  const deleteEmojiMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('emoji_configs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmojiConfigs'] });
      queryClient.invalidateQueries({ queryKey: ['emojiConfigs'] });
      toast.success('Emoji deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete emoji');
    }
  });

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateEmojiMutation.mutate({ id, updates: { is_active: isActive } });
  };

  const handleDeleteEmoji = (id: string) => {
    if (confirm('Are you sure you want to delete this emoji reaction?')) {
      deleteEmojiMutation.mutate(id);
    }
  };

  const handleAddEmoji = () => {
    addEmojiMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emoji Reaction Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new emoji */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-4">Add New Emoji Reaction</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="emojiCode">Emoji</Label>
              <Input
                id="emojiCode"
                placeholder="😀"
                value={newEmoji.code}
                onChange={(e) => setNewEmoji({ ...newEmoji, code: e.target.value })}
                className="text-center text-lg"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="emojiName">Name</Label>
              <Input
                id="emojiName"
                placeholder="happy"
                value={newEmoji.name}
                onChange={(e) => setNewEmoji({ ...newEmoji, name: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddEmoji}
                disabled={addEmojiMutation.isPending || !newEmoji.code || !newEmoji.name}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Emoji
              </Button>
            </div>
          </div>
        </div>

        {/* Existing emojis */}
        <div className="space-y-3">
          <h3 className="font-medium">Current Emoji Reactions</h3>
          {emojiConfigs?.map((emoji) => (
            <div
              key={emoji.id}
              className="flex items-center gap-4 p-3 border rounded-lg bg-white"
            >
              <div className="cursor-move">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              
              <div className="text-2xl">{emoji.emoji_code}</div>
              
              <div className="flex-1">
                <div className="font-medium">{emoji.emoji_name}</div>
                <div className="text-sm text-gray-500">Order: {emoji.display_order}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor={`active-${emoji.id}`} className="text-sm">
                  Active
                </Label>
                <Switch
                  id={`active-${emoji.id}`}
                  checked={emoji.is_active}
                  onCheckedChange={(checked) => handleToggleActive(emoji.id, checked)}
                  disabled={updateEmojiMutation.isPending}
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteEmoji(emoji.id)}
                disabled={deleteEmojiMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {emojiConfigs?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No emoji reactions configured. Add some above to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

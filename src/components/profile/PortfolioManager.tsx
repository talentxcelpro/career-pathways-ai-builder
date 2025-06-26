
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ExternalLink, Star, Upload, X } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  type: 'project' | 'certification' | 'award' | 'publication';
  url?: string;
  image_url?: string;
  tags: string[];
  is_featured: boolean;
  display_order: number;
}

interface PortfolioManagerProps {
  userId: string;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({ userId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    type: 'project' as 'project' | 'certification' | 'award' | 'publication',
    url: '',
    tags: [] as string[],
    is_featured: false
  });
  const [newTag, setNewTag] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadFile, isUploading } = useFileUpload();

  // Fetch portfolio items
  const { data: portfolioItems = [], isLoading } = useQuery({
    queryKey: ['portfolio-items', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as PortfolioItem[];
    }
  });

  // Add/Update portfolio item mutation
  const saveItemMutation = useMutation({
    mutationFn: async (item: Partial<PortfolioItem>) => {
      if (editingItem) {
        const { data, error } = await supabase
          .from('portfolio_items')
          .update(item)
          .eq('id', editingItem.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('portfolio_items')
          .insert({
            ...item,
            user_id: userId,
            title: item.title || '', // Ensure title is never undefined
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-items', userId] });
      resetForm();
      toast({
        title: editingItem ? "Item updated" : "Item added",
        description: "Portfolio item saved successfully."
      });
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your portfolio item.",
        variant: "destructive"
      });
    }
  });

  // Delete portfolio item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-items', userId] });
      toast({
        title: "Item deleted",
        description: "Portfolio item removed successfully."
      });
    }
  });

  const resetForm = () => {
    setNewItem({
      title: '',
      description: '',
      type: 'project',
      url: '',
      tags: [],
      is_featured: false
    });
    setNewTag('');
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    if (!newItem.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your portfolio item.",
        variant: "destructive"
      });
      return;
    }

    saveItemMutation.mutate({
      title: newItem.title,
      description: newItem.description,
      type: newItem.type,
      url: newItem.url,
      tags: newItem.tags,
      is_featured: newItem.is_featured,
      display_order: portfolioItems.length
    });
  };

  const startEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setNewItem({
      title: item.title,
      description: item.description || '',
      type: item.type,
      url: item.url || '',
      tags: item.tags,
      is_featured: item.is_featured
    });
    setShowAddForm(true);
  };

  const addTag = () => {
    if (newTag.trim() && !newItem.tags.includes(newTag.trim())) {
      setNewItem(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewItem(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (isLoading) {
    return <div>Loading portfolio...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio & Projects</CardTitle>
          <Button 
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
            <h4 className="font-medium">
              {editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Title *"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
              />
              <select
                value={newItem.type}
                onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as typeof newItem.type }))}
                className="px-3 py-2 border rounded-md"
              >
                <option value="project">Project</option>
                <option value="certification">Certification</option>
                <option value="award">Award</option>
                <option value="publication">Publication</option>
              </select>
            </div>

            <Textarea
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px]"
            />

            <Input
              placeholder="URL (optional)"
              value={newItem.url}
              onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
            />

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {newItem.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="relative group">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm">Add</Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={newItem.is_featured}
                onChange={(e) => setNewItem(prev => ({ ...prev, is_featured: e.target.checked }))}
              />
              <label htmlFor="featured" className="text-sm">Featured item</label>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={saveItemMutation.isPending}>
                {saveItemMutation.isPending ? 'Saving...' : (editingItem ? 'Update' : 'Add')}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Portfolio Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolioItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <Badge variant="outline" className="mb-2 capitalize">
                {item.type}
              </Badge>

              {item.description && (
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              )}

              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {item.url && (
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  View Project <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
            </div>
          ))}
        </div>

        {portfolioItems.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-gray-500">
            <p>No portfolio items yet. Add your first project to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGroups } from '@/hooks/useGroups';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { createGroup, isCreating } = useGroups();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'public' as 'public' | 'private' | 'secret',
    category: '',
    rules: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createGroup({
      ...formData,
      created_by: '' // Will be set by the hook
    });
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      group_type: 'public',
      category: '',
      rules: ''
    });
    
    onOpenChange(false);
  };

  const categories = [
    'Technology',
    'Business',
    'Marketing',
    'Design',
    'Healthcare',
    'Education',
    'Finance',
    'Startups',
    'Remote Work',
    'Career Development',
    'AI & Machine Learning',
    'Data Science',
    'Other'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What is this group about?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group_type">Privacy</Label>
              <Select 
                value={formData.group_type} 
                onValueChange={(value: 'public' | 'private' | 'secret') => 
                  setFormData(prev => ({ ...prev, group_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="secret">Secret</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rules">Group Rules</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
              placeholder="Set guidelines for your group members"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
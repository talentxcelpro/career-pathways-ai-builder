import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface UpdateSEODialogProps {
  onSEOUpdated: () => void;
}

export const UpdateSEODialog: React.FC<UpdateSEODialogProps> = ({ onSEOUpdated }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    pageTitle: 'TalentXcel Pro - Find Your Dream Job',
    metaDescription: 'Discover your next career opportunity with TalentXcel Pro. Connect with top employers, build your professional network, and advance your career.',
    keywords: 'jobs, careers, recruitment, hiring, talent, professional network',
    ogTitle: 'TalentXcel Pro - Career Platform',
    ogDescription: 'Your gateway to career success'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pageTitle || !formData.metaDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Mock implementation - in real app would save to database
      console.log('Updating SEO settings:', formData);
      
      toast.success('SEO settings updated successfully');
      setOpen(false);
      onSEOUpdated();
    } catch (error) {
      toast.error('Failed to update SEO settings');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Update SEO Settings</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update SEO Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pageTitle">Page Title *</Label>
            <Input
              id="pageTitle"
              value={formData.pageTitle}
              onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
              placeholder="Enter page title"
            />
          </div>
          
          <div>
            <Label htmlFor="metaDescription">Meta Description *</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              placeholder="Enter meta description"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="Enter keywords (comma-separated)"
            />
          </div>
          
          <div>
            <Label htmlFor="ogTitle">Open Graph Title</Label>
            <Input
              id="ogTitle"
              value={formData.ogTitle}
              onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
              placeholder="Enter Open Graph title"
            />
          </div>
          
          <div>
            <Label htmlFor="ogDescription">Open Graph Description</Label>
            <Textarea
              id="ogDescription"
              value={formData.ogDescription}
              onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
              placeholder="Enter Open Graph description"
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update SEO Settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface UpdateHeroSectionDialogProps {
  onHeroUpdated: () => void;
}

export const UpdateHeroSectionDialog: React.FC<UpdateHeroSectionDialogProps> = ({ onHeroUpdated }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    headline: 'Find Your Dream Job Today',
    subheadline: 'Connect with top employers and discover opportunities that match your skills and aspirations.',
    ctaText: 'Get Started',
    ctaLink: '/jobs'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.headline || !formData.subheadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Mock implementation - in real app would save to database
      console.log('Updating hero section:', formData);
      
      toast.success('Hero section updated successfully');
      setOpen(false);
      onHeroUpdated();
    } catch (error) {
      toast.error('Failed to update hero section');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Update Hero Section</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Hero Section</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="headline">Main Headline *</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Enter main headline"
            />
          </div>
          
          <div>
            <Label htmlFor="subheadline">Subheadline *</Label>
            <Textarea
              id="subheadline"
              value={formData.subheadline}
              onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
              placeholder="Enter subheadline"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="ctaText">Call-to-Action Text</Label>
            <Input
              id="ctaText"
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              placeholder="Enter CTA button text"
            />
          </div>
          
          <div>
            <Label htmlFor="ctaLink">Call-to-Action Link</Label>
            <Input
              id="ctaLink"
              value={formData.ctaLink}
              onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              placeholder="Enter CTA link URL"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Hero Section
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
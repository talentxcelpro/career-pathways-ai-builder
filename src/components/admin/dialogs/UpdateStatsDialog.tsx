import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UpdateStatsDialogProps {
  onStatsUpdated: () => void;
}

export const UpdateStatsDialog: React.FC<UpdateStatsDialogProps> = ({ onStatsUpdated }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobsPosted: '10,000+',
    companies: '500+',
    successStories: '5,000+',
    activeUsers: '25,000+'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Mock implementation - in real app would save to database
      console.log('Updating homepage stats:', formData);
      
      toast.success('Homepage stats updated successfully');
      setOpen(false);
      onStatsUpdated();
    } catch (error) {
      toast.error('Failed to update stats');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Update Stats</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Homepage Stats</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobsPosted">Jobs Posted</Label>
              <Input
                id="jobsPosted"
                value={formData.jobsPosted}
                onChange={(e) => setFormData({ ...formData, jobsPosted: e.target.value })}
                placeholder="e.g., 10,000+"
              />
            </div>
            
            <div>
              <Label htmlFor="companies">Companies</Label>
              <Input
                id="companies"
                value={formData.companies}
                onChange={(e) => setFormData({ ...formData, companies: e.target.value })}
                placeholder="e.g., 500+"
              />
            </div>
            
            <div>
              <Label htmlFor="successStories">Success Stories</Label>
              <Input
                id="successStories"
                value={formData.successStories}
                onChange={(e) => setFormData({ ...formData, successStories: e.target.value })}
                placeholder="e.g., 5,000+"
              />
            </div>
            
            <div>
              <Label htmlFor="activeUsers">Active Users</Label>
              <Input
                id="activeUsers"
                value={formData.activeUsers}
                onChange={(e) => setFormData({ ...formData, activeUsers: e.target.value })}
                placeholder="e.g., 25,000+"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Stats
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
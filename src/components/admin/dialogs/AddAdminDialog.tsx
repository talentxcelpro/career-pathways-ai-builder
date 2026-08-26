import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface AddAdminDialogProps {
  onAdminAdded: () => void;
}

export const AddAdminDialog: React.FC<AddAdminDialogProps> = ({ onAdminAdded }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: '',
    permissions: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.fullName || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      // Mock implementation - in real app would:
      // 1. Create user account via Supabase Auth
      // 2. Update user role in profiles table
      // 3. Set appropriate permissions
      console.log('Adding new admin:', formData);
      
      toast.success('Admin user created successfully');
      setOpen(false);
      setFormData({ email: '', fullName: '', role: '', permissions: [] });
      onAdminAdded();
    } catch (error) {
      toast.error('Failed to create admin user');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add New Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Admin User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter admin email"
            />
          </div>
          
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <Label htmlFor="role">Admin Operational Scope *</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select admin scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job_admin">Employer & Job Admin (jobs.*, employers.*)</SelectItem>
                <SelectItem value="content_admin">Content & Editorial Admin (content.*, news.*)</SelectItem>
                <SelectItem value="seo_admin">SEO & Distribution Admin (seo.*, sitemaps.*)</SelectItem>
                <SelectItem value="finance_admin">Finance & TXC Admin (billing.*, txc.award)</SelectItem>
                <SelectItem value="moderator">Community Moderator (moderation.*, network.*)</SelectItem>
                <SelectItem value="support_admin">Support & Operations Admin (users.read, tickets.*)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              🔒 <strong>Super Admin Hard-Lock Invariant:</strong> Root platform authority is strictly frozen to the 2 hardware credentials (9910678611 / 9717845477). New administrators are created with least-privilege operational scopes.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              Appoint Scoped Admin
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
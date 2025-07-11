import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

interface UserFormData {
  fullName: string;
  email: string;
  role: string;
  status: string;
  password: string;
  sendWelcomeEmail: boolean;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    email: '',
    role: 'job_seeker',
    status: 'active',
    password: '',
    sendWelcomeEmail: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Valid email is required');
      return false;
    }
    if (!formData.password.trim()) {
      toast.error('Password is required');
      return false;
    }
    return true;
  };

  const callAdminFunction = async (body: any, retries = 3): Promise<any> => {
    // Validate session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Failed to get session');
    }
    
    if (!session) {
      console.error('No session found');
      throw new Error('No session found - please log in again');
    }

    console.log('Calling admin function with session for user:', session.user?.email);

    // First test if the function is accessible with a health check
    const functionUrl = `https://dthlgsnakhofinssokm.supabase.co/functions/v1/admin-create-user`;
    
    try {
      console.log('Testing function health...');
      const healthResponse = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
        },
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('Function health check passed:', healthData);
      } else {
        console.error('Function health check failed:', healthResponse.status);
        throw new Error(`Function not accessible (health check failed: ${healthResponse.status})`);
      }
    } catch (healthError) {
      console.error('Function health check error:', healthError);
      if (healthError instanceof TypeError && healthError.message === 'Failed to fetch') {
        throw new Error('Edge Function is not deployed or accessible. Please check your Supabase project configuration.');
      }
      throw healthError;
    }

    // Now try the actual user creation
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Creating user via Edge Function`);
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP error:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Function call successful:', result);

        if (result.error) {
          throw new Error(result.error);
        }

        return result;

      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          // Provide more helpful error messages
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Unable to connect to the user creation service. The Edge Function may not be deployed or there may be a network issue.');
          }
          throw error;
        }
        
        // Exponential backoff for retries
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const data = await callAdminFunction({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        status: formData.status,
        sendWelcomeEmail: formData.sendWelcomeEmail
      });

      setShowSuccess(true);
      toast.success('User created successfully!');
      
      // Reset form after short delay
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onUserAdded();
      }, 2000);

    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error.message || 'Failed to create user';
      toast.error(`Failed to create user: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      role: 'job_seeker',
      status: 'active',
      password: '',
      sendWelcomeEmail: true
    });
  };

  const handleAddAnother = () => {
    setShowSuccess(false);
    resetForm();
  };

  const handleViewUser = () => {
    onClose();
    // Navigate to user profile (implement based on your routing)
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">User Created Successfully!</h3>
            <p className="text-muted-foreground mb-6">
              {formData.fullName} has been added to the platform.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleViewUser} variant="outline">
                View User
              </Button>
              <Button onClick={handleAddAnother}>
                Add Another
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candidate">Candidate</SelectItem>
                <SelectItem value="job_seeker">Job Seeker</SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={generatePassword}
              >
                Generate
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="sendWelcomeEmail"
              checked={formData.sendWelcomeEmail}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendWelcomeEmail: checked }))}
            />
            <Label htmlFor="sendWelcomeEmail">Send Welcome Email</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
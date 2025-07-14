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

  const testEdgeFunction = async () => {
    console.log('=== COMPREHENSIVE EDGE FUNCTION TESTING ===');
    
    // Step 1: Test Supabase client configuration
    console.log('Step 1: Verifying Supabase configuration...');
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Session exists:', !!session);
    console.log('User authenticated:', !!user);
    console.log('User email:', user?.email);
    
    // Step 2: Test direct function URL access
    console.log('Step 2: Testing direct function URL access...');
    const functionUrl = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/test-function';
    console.log('Function URL:', functionUrl);
    
    try {
      const directResponse = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Direct fetch response status:', directResponse.status);
      console.log('Direct fetch response ok:', directResponse.ok);
      
      if (directResponse.ok) {
        const directData = await directResponse.text();
        console.log('Direct fetch response data:', directData);
        console.log('✅ Direct function access successful');
      } else {
        console.log('❌ Direct function access failed:', directResponse.statusText);
      }
    } catch (directError) {
      console.error('❌ Direct fetch failed:', directError);
    }
    
    // Step 3: Test Supabase client function invoke
    console.log('Step 3: Testing Supabase client function invoke...');
    try {
      const { data, error } = await supabase.functions.invoke('test-function', {
        body: { test: 'connection' },
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Supabase invoke result:', { data, error });
      
      if (error) {
        console.error('❌ Supabase invoke failed:', JSON.stringify(error, null, 2));
        return { success: false, error: error.message || 'Supabase invoke failed' };
      }
      
      console.log('✅ Supabase invoke successful');
      return { success: true, data, error };
      
    } catch (invokeError) {
      console.error('❌ Supabase invoke exception:', invokeError);
      
      // Step 4: Test admin function with direct fetch as fallback
      console.log('Step 4: Testing admin function with direct fetch...');
      return await testDirectAdminFunctionAccess(session?.access_token);
    }
  };

  const testDirectAdminFunctionAccess = async (accessToken?: string) => {
    const adminFunctionUrl = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/admin-create-user';
    
    try {
      console.log('Testing admin function health check...');
      const healthResponse = await fetch(adminFunctionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Admin function health response:', healthResponse.status);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.text();
        console.log('✅ Admin function accessible:', healthData);
        return { success: true, fallbackAvailable: true };
      } else {
        console.log('❌ Admin function not accessible:', healthResponse.statusText);
        return { success: false, error: 'Edge Functions not accessible' };
      }
    } catch (error) {
      console.error('❌ Admin function test failed:', error);
      return { success: false, error: 'Complete Edge Function failure' };
    }
  };

  const callAdminFunction = async (body: any): Promise<any> => {
    console.log('=== ADMIN FUNCTION CALL START ===');
    console.log('Creating user via admin function...');
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // First test if Edge Functions work at all
    console.log('Testing Edge Function connectivity...');
    const testResult = await testEdgeFunction();
    console.log('Test result:', testResult);
    
    // If Edge Functions work, try the normal approach
    if (testResult.success && !('fallbackAvailable' in testResult)) {
      try {
        console.log('Using Supabase function invoke...');
        const { data, error } = await supabase.functions.invoke('admin-create-user', {
          body,
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (error) {
          console.error('Function invoke error:', error);
          throw new Error(error.message || 'Function call failed');
        }

        if (data?.error) {
          console.error('Function returned error:', data.error);
          throw new Error(data.error);
        }

        console.log('✅ User creation successful via function invoke:', data);
        return data;

      } catch (error) {
        console.error('Function invoke failed, trying direct fetch fallback:', error);
        return await callAdminFunctionDirect(body);
      }
    }
    
    // If Edge Functions don't work or we need fallback, use direct approach
    console.log('Using direct fetch approach...');
    return await callAdminFunctionDirect(body);
  };

  const callAdminFunctionDirect = async (body: any): Promise<any> => {
    console.log('=== DIRECT ADMIN FUNCTION CALL ===');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication session found');
    }

    const adminFunctionUrl = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/admin-create-user';
    
    try {
      const response = await fetch(adminFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      console.log('Direct fetch response status:', response.status);
      console.log('Direct fetch response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Direct fetch failed:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Direct fetch successful:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      return result;

    } catch (error) {
      console.error('❌ Direct admin function call failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create user';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Permission denied. You need admin privileges to create users.';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'Admin function not found. Please contact support.';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
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

      if (data?.success) {
        setShowSuccess(true);
        onUserAdded();
        toast.success('User created successfully!');
      } else {
        throw new Error(data?.error || 'User creation failed');
      }

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
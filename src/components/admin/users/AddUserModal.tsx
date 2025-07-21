
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, TestTube } from 'lucide-react';
import { useUserCreation } from '@/hooks/useUserCreation';
import { toast } from 'sonner';
import { checkEdgeFunctionHealth, testEdgeFunctionDebug } from '@/utils/edgeFunction';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'job_seeker',
    temporaryPassword: ''
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const { createUser, isCreating } = useUserCreation();

  const testEdgeFunction = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      console.log('Starting comprehensive Edge Function test...');
      
      // Test 1: Health check
      const isHealthy = await checkEdgeFunctionHealth();
      console.log('Health check result:', isHealthy);
      
      // Test 2: Debug endpoint
      let debugInfo = null;
      try {
        debugInfo = await testEdgeFunctionDebug();
        console.log('Debug endpoint result:', debugInfo);
      } catch (debugError) {
        console.error('Debug test failed:', debugError);
        debugInfo = { error: debugError.message };
      }
      
      setTestResults({
        healthCheck: isHealthy,
        debugInfo: debugInfo,
        timestamp: new Date().toISOString()
      });
      
      if (isHealthy) {
        toast.success('Edge Function tests passed!');
      } else {
        toast.error('Edge Function tests failed - check the results below');
      }
    } catch (error) {
      console.error('Edge Function test suite failed:', error);
      toast.error('Test suite failed: ' + error.message);
      setTestResults({
        healthCheck: false,
        debugInfo: { error: error.message },
        testError: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      console.log('Creating user with data:', formData);
      await createUser({
        email: formData.email,
        name: formData.name,
        role: formData.role,
        temporaryPassword: formData.temporaryPassword || 'TempPass123!'
      });
      
      onUserAdded();
      onClose();
      
      // Reset form
      setFormData({
        email: '',
        name: '',
        role: 'job_seeker',
        temporaryPassword: ''
      });
      setTestResults(null);
    } catch (error) {
      console.error('User creation failed:', error);
      // Error handling is done in the useUserCreation hook
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      name: '',
      role: 'job_seeker',
      temporaryPassword: ''
    });
    setTestResults(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Edge Function Test Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Edge Function Test</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={testEdgeFunction}
                disabled={isTesting}
                className="flex items-center gap-2"
              >
                {isTesting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <TestTube className="h-3 w-3" />
                )}
                Test Function
              </Button>
            </div>

            {testResults && (
              <Alert variant={testResults.healthCheck ? "default" : "destructive"}>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-xs">
                      <strong>Health Check:</strong> {testResults.healthCheck ? '✓ Pass' : '✗ Fail'}
                    </p>
                    <p className="text-xs">
                      <strong>Timestamp:</strong> {testResults.timestamp}
                    </p>
                    {testResults.debugInfo && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium">Debug Info</summary>
                        <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(testResults.debugInfo, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="role">User Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job_seeker">Job Seeker</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="password">Temporary Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.temporaryPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, temporaryPassword: e.target.value }))}
                placeholder="Leave empty for auto-generated password"
              />
              <p className="text-xs text-gray-500 mt-1">
                If empty, will use: TempPass123!
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Create User
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

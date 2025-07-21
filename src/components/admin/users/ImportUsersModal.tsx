
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsersImported: () => void;
}

interface UserRecord {
  email: string;
  name: string;
  role?: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  details?: string;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  open,
  onOpenChange,
  onUsersImported
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    console.log('[ImportUsers Debug]:', message);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const parseCsvFile = (file: File): Promise<UserRecord[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
          }

          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          console.log('CSV Headers:', headers);
          
          // Find column indices
          const emailIndex = headers.findIndex(h => h.includes('email'));
          const nameIndex = headers.findIndex(h => h.includes('name'));
          const roleIndex = headers.findIndex(h => h.includes('role'));

          if (emailIndex === -1 || nameIndex === -1) {
            throw new Error('CSV must contain email and name columns');
          }

          const parsedUsers: UserRecord[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            
            if (values.length > emailIndex && values.length > nameIndex && values[emailIndex] && values[nameIndex]) {
              parsedUsers.push({
                email: values[emailIndex],
                name: values[nameIndex],
                role: roleIndex >= 0 ? values[roleIndex] || 'job_seeker' : 'job_seeker',
                status: 'pending'
              });
            }
          }

          addDebugInfo(`Parsed ${parsedUsers.length} users from CSV`);
          resolve(parsedUsers);
        } catch (error) {
          addDebugInfo(`CSV parsing error: ${error.message}`);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      setCsvFile(file);
      const parsedUsers = await parseCsvFile(file);
      setUsers(parsedUsers);
      addDebugInfo(`File selected: ${file.name}, size: ${file.size} bytes`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse CSV file');
      addDebugInfo(`File parsing failed: ${error.message}`);
    }
  };

  const testEdgeFunction = async (): Promise<void> => {
    addDebugInfo('Testing Edge Function connectivity...');
    
    try {
      // Check session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addDebugInfo(`Session error: ${sessionError.message}`);
        throw new Error(`Authentication error: ${sessionError.message}`);
      }

      if (!session) {
        addDebugInfo('No active session found');
        throw new Error('No active session. Please log in again.');
      }

      addDebugInfo(`Session valid. User: ${session.user.email}, Token length: ${session.access_token.length}`);

      // Test function with a simple health check
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { 
          healthCheck: true,
          userEmail: 'test@example.com',
          userName: 'Test User'
        }
      });

      if (error) {
        addDebugInfo(`Function invocation error: ${JSON.stringify(error)}`);
        throw error;
      }

      addDebugInfo(`Function test response: ${JSON.stringify(data)}`);
    } catch (error: any) {
      addDebugInfo(`Function test failed: ${error.message}`);
      throw error;
    }
  };

  const createUser = async (user: UserRecord): Promise<void> => {
    try {
      addDebugInfo(`Creating user: ${user.email}`);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No valid session found');
      }

      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          userEmail: user.email,
          userName: user.name,
          userRole: user.role || 'job_seeker',
          temporaryPassword: Math.random().toString(36).slice(-8)
        }
      });

      if (error) {
        addDebugInfo(`User creation error for ${user.email}: ${JSON.stringify(error)}`);
        throw error;
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || 'Unknown error occurred';
        addDebugInfo(`User creation failed for ${user.email}: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      addDebugInfo(`User created successfully: ${user.email} (ID: ${data.userId})`);
    } catch (error: any) {
      addDebugInfo(`Failed to create user ${user.email}: ${error.message}`);
      throw error;
    }
  };

  const handleImport = async () => {
    if (users.length === 0) {
      toast.error('No users to import');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setDebugInfo([]);
    
    try {
      // Test function first
      addDebugInfo('Starting import process...');
      await testEdgeFunction();
      addDebugInfo('Edge Function test passed');

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        // Update user status to processing
        setUsers(prev => prev.map(u => 
          u.email === user.email ? { ...u, status: 'processing' } : u
        ));

        try {
          await createUser(user);
          
          // Update user status to success
          setUsers(prev => prev.map(u => 
            u.email === user.email 
              ? { ...u, status: 'success', details: 'User created successfully' } 
              : u
          ));
          
          successCount++;
        } catch (error: any) {
          // Update user status to error
          setUsers(prev => prev.map(u => 
            u.email === user.email 
              ? { 
                  ...u, 
                  status: 'error', 
                  error: error.message,
                  details: `Failed: ${error.message}`
                } 
              : u
          ));
          
          failCount++;
        }

        // Update progress
        setProgress(((i + 1) / users.length) * 100);
        
        // Small delay between requests
        if (i < users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      addDebugInfo(`Import completed. Success: ${successCount}, Failed: ${failCount}`);
      
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} users${failCount > 0 ? ` (${failCount} failed)` : ''}`);
        onUsersImported();
      } else {
        toast.error('No users were imported successfully');
      }

    } catch (error: any) {
      addDebugInfo(`Import process failed: ${error.message}`);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setCsvFile(null);
    setUsers([]);
    setProgress(0);
    setDebugInfo([]);
  };

  const getStatusIcon = (status: UserRecord['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isProcessing}
                className="flex-1"
              />
              {csvFile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600">
              CSV should have columns: email, name, role (optional)
            </p>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Import Progress</span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Users List */}
          {users.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Users to Import ({users.length})</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {users.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    {getStatusIcon(user.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-gray-600">({user.email})</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {user.role}
                        </span>
                      </div>
                      {user.details && (
                        <p className={`text-xs mt-1 ${
                          user.status === 'error' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {user.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debug Information */}
          {debugInfo.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Debug Information</span>
              </div>
              <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded text-xs font-mono">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-gray-700">
                    {info}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={users.length === 0 || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isProcessing ? 'Importing...' : `Import ${users.length} Users`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

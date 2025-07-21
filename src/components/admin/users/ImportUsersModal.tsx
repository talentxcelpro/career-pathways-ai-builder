
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Download, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { checkEdgeFunctionHealth } from '@/utils/edgeFunction';

interface ImportUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsersImported: () => void;
}

interface UserData {
  name: string;
  email: string;
  role: string;
  status?: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

interface ImportResult {
  success: boolean;
  email: string;
  error?: string;
  userId?: string;
}

const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}`;
  console.log(logMessage, data || '');
};

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  open,
  onOpenChange,
  onUsersImported
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string, data?: any) => {
    debugLog(message, data);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`]);
  };

  const validateCsvData = (data: any[]): UserData[] => {
    return data
      .filter(row => row.name && row.email)
      .map(row => ({
        name: row.name?.trim(),
        email: row.email?.trim().toLowerCase(),
        role: row.role?.trim() || 'job_seeker',
        status: 'pending' as const
      }))
      .filter(user => user.name && user.email && user.email.includes('@'));
  };

  const parseCsv = (content: string): UserData[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIndex = headers.findIndex(h => ['name', 'full_name', 'fullname'].includes(h));
    const emailIndex = headers.findIndex(h => ['email', 'email_address'].includes(h));
    const roleIndex = headers.findIndex(h => ['role', 'user_role', 'type'].includes(h));

    if (nameIndex === -1 || emailIndex === -1) {
      throw new Error('CSV must contain name and email columns');
    }

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      return {
        name: values[nameIndex] || '',
        email: values[emailIndex] || '',
        role: values[roleIndex] || 'job_seeker',
        status: 'pending' as const
      };
    }).filter(user => user.name && user.email);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setUsers([]);
    setImportResults([]);
    setDebugInfo([]);

    try {
      const content = await file.text();
      const parsedUsers = parseCsv(content);
      setUsers(parsedUsers);
      addDebugInfo(`Parsed ${parsedUsers.length} users from CSV`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse CSV';
      addDebugInfo(`CSV parsing error: ${message}`);
      toast.error(message);
    }
  };

  const createUserWithRetry = async (user: UserData, maxRetries = 3): Promise<ImportResult> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        addDebugInfo(`Creating user ${user.email}, attempt ${attempt}/${maxRetries}`);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No valid session found');
        }

        // Try Supabase client first
        const { data, error } = await supabase.functions.invoke('admin-create-user', {
          body: {
            userEmail: user.email,
            userName: user.name,
            userRole: user.role,
            temporaryPassword: Math.random().toString(36).slice(-8)
          }
        });

        if (error) {
          addDebugInfo(`Supabase client error for ${user.email}:`, error);
          throw error;
        }

        if (data?.success) {
          addDebugInfo(`User ${user.email} created successfully via Supabase client`);
          return {
            success: true,
            email: user.email,
            userId: data.userId
          };
        } else {
          throw new Error(data?.error || 'Unknown error from edge function');
        }

      } catch (error: any) {
        addDebugInfo(`Attempt ${attempt} failed for ${user.email}:`, error.message);
        
        if (attempt === maxRetries) {
          return {
            success: false,
            email: user.email,
            error: error.message || 'Failed to create user after multiple attempts'
          };
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return {
      success: false,
      email: user.email,
      error: 'Max retries exceeded'
    };
  };

  const handleImport = async () => {
    if (!users.length) {
      toast.error('No users to import');
      return;
    }

    setIsImporting(true);
    setImportResults([]);
    addDebugInfo('Starting import process...');

    try {
      // Test Edge Function connectivity first
      addDebugInfo('Testing Edge Function connectivity...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No valid session found');
      }

      addDebugInfo(`Session valid. User: ${session.user?.email}, Token length: ${session.access_token?.length}`);

      const isHealthy = await checkEdgeFunctionHealth();
      if (!isHealthy) {
        const errorMsg = 'Edge Function health check failed';
        addDebugInfo(errorMsg);
        throw new Error(errorMsg);
      }

      addDebugInfo('Edge Function health check passed, proceeding with import...');

      // Process users in batches of 5 to avoid overwhelming the function
      const batchSize = 5;
      const results: ImportResult[] = [];
      
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        addDebugInfo(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(users.length/batchSize)}`);
        
        // Update status for current batch
        setUsers(prev => prev.map((user, index) => 
          batch.find(batchUser => batchUser.email === user.email) && index >= i && index < i + batchSize
            ? { ...user, status: 'processing' }
            : user
        ));

        // Process batch in parallel
        const batchPromises = batch.map(user => createUserWithRetry(user));
        const batchResults = await Promise.all(batchPromises);
        
        results.push(...batchResults);
        setImportResults(results);

        // Update user status based on results
        setUsers(prev => prev.map(user => {
          const result = batchResults.find(r => r.email === user.email);
          if (result) {
            return {
              ...user,
              status: result.success ? 'success' : 'error',
              error: result.error
            };
          }
          return user;
        }));

        // Small delay between batches
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      addDebugInfo(`Import completed: ${successful} successful, ${failed} failed`);
      
      if (successful > 0) {
        toast.success(`Successfully imported ${successful} users${failed > 0 ? ` (${failed} failed)` : ''}`);
        onUsersImported();
      } else {
        toast.error('No users were successfully imported');
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Import process failed';
      addDebugInfo(`Import process failed: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'name,email,role\nJohn Doe,john@example.com,job_seeker\nJane Smith,jane@example.com,employer';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setCsvFile(null);
    setUsers([]);
    setImportResults([]);
    setDebugInfo([]);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!csvFile && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>

              <div>
                <Label htmlFor="csvFile">Upload CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  CSV should contain: name, email, and optionally role columns
                </p>
              </div>
            </div>
          )}

          {csvFile && users.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Users to Import ({users.length})
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={reset}>
                    Reset
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={isImporting}
                    className="flex items-center gap-2"
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isImporting ? 'Importing...' : 'Import Users'}
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 font-medium text-sm">
                  <div>Status</div>
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                </div>
                {users.map((user, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 border-t text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status)}
                    </div>
                    <div>{user.name}</div>
                    <div className="text-blue-600">{user.email}</div>
                    <div className="capitalize">{user.role.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>

              {users.some(user => user.status === 'error') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Import Errors:</h4>
                  <div className="space-y-1">
                    {users.filter(user => user.status === 'error').map((user, index) => (
                      <div key={index} className="text-sm text-red-700">
                        <strong>{user.email}:</strong> {user.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {debugInfo.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <h4 className="font-semibold text-gray-800">Debug Information:</h4>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {debugInfo.join('\n')}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

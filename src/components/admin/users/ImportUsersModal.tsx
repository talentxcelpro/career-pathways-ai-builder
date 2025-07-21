
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, AlertCircle, CheckCircle, X, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { checkEdgeFunctionHealth } from '@/utils/edgeFunction';

interface ImportUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsersImported: () => void;
}

interface UserToImport {
  name: string;
  email: string;
  role: string;
  status: string;
  sendWelcomeEmail: boolean;
}

interface ImportResult {
  email: string;
  success: boolean;
  error?: string;
  userId?: string;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  open,
  onOpenChange,
  onUsersImported
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [parsedUsers, setParsedUsers] = useState<UserToImport[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResults([]);
      setShowResults(false);
      setParsedUsers([]);
      setDebugInfo(null);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const parseCSV = async (content: string): Promise<UserToImport[]> => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const nameIndex = headers.findIndex(h => ['name', 'full_name', 'fullname'].includes(h));
    const emailIndex = headers.findIndex(h => ['email', 'email_address'].includes(h));
    const roleIndex = headers.findIndex(h => ['role', 'user_role', 'type'].includes(h));
    const statusIndex = headers.findIndex(h => ['status', 'user_status'].includes(h));
    const welcomeEmailIndex = headers.findIndex(h => ['send_welcome_email', 'welcome_email', 'notify'].includes(h));

    const missingColumns = [];
    if (nameIndex === -1) missingColumns.push('name (or full_name, fullname)');
    if (emailIndex === -1) missingColumns.push('email');

    if (missingColumns.length > 0) {
      const foundHeaders = headers.join(', ');
      throw new Error(`CSV missing required columns: ${missingColumns.join(', ')}. Found headers: "${foundHeaders}"`);
    }

    const users: UserToImport[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      const name = values[nameIndex]?.trim();
      const email = values[emailIndex]?.trim();
      
      if (!name || !email) continue;

      users.push({
        name,
        email,
        role: values[roleIndex]?.trim() || 'job_seeker',
        status: values[statusIndex]?.trim() || 'active',
        sendWelcomeEmail: ['true', '1', 'yes'].includes(values[welcomeEmailIndex]?.toLowerCase() || 'true')
      });
    }

    return users;
  };

  const testDebugEndpoint = async () => {
    try {
      console.log('Testing debug endpoint...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { debug: true },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (error) {
        console.error('Debug endpoint error:', error);
        setDebugInfo({ error: error.message, type: 'supabase_error' });
      } else {
        console.log('Debug endpoint response:', data);
        setDebugInfo(data);
      }
    } catch (error: any) {
      console.error('Debug endpoint exception:', error);
      setDebugInfo({ error: error.message, type: 'exception' });
    }
  };

  const createUserWithRetry = async (user: UserToImport, maxAttempts = 3): Promise<ImportResult> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Creating user ${user.email}, attempt ${attempt}/${maxAttempts}`);
        setCurrentUser(`${user.email} (attempt ${attempt}/${maxAttempts})`);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication session not found');
        }

        console.log(`Session valid. User: ${session.user?.email}, Token length: ${session.access_token?.length}`);

        // Create controller for this request with 30 second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const { data, error } = await supabase.functions.invoke('admin-create-user', {
            body: {
              userEmail: user.email,
              userName: user.name,
              userRole: user.role,
              temporaryPassword: Math.random().toString(36).slice(-8)
            },
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            }
          });

          clearTimeout(timeoutId);

          if (error) {
            console.error(`Supabase client error for ${user.email}:`, error);
            throw new Error(error.message || 'Failed to send a request to the Edge Function');
          }

          if (data?.success) {
            console.log(`User ${user.email} created successfully:`, data.userId);
            return {
              email: user.email,
              success: true,
              userId: data.userId
            };
          } else {
            throw new Error(data?.error || 'Unknown error from Edge Function');
          }
        } catch (invokeError: any) {
          clearTimeout(timeoutId);
          
          if (invokeError.name === 'AbortError') {
            throw new Error('Request timeout (30 seconds)');
          }
          
          console.error(`Attempt ${attempt} failed for ${user.email}:`, invokeError.message);
          
          if (attempt === maxAttempts) {
            throw invokeError;
          }
          
          // Exponential backoff: 2^attempt seconds
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed for ${user.email}:`, error.message);
        
        if (attempt === maxAttempts) {
          return {
            email: user.email,
            success: false,
            error: error.message
          };
        }
      }
    }

    return {
      email: user.email,
      success: false,
      error: 'All attempts failed'
    };
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setIsImporting(true);
      setProgress(0);
      setResults([]);
      setShowResults(false);

      const content = await file.text();
      const users = await parseCSV(content);
      console.log(`Parsed ${users.length} users from CSV`);
      setParsedUsers(users);

      if (users.length === 0) {
        toast.error('No valid users found in CSV file');
        return;
      }

      console.log('Starting import process...');

      // Test Edge Function connectivity first
      console.log('Testing Edge Function connectivity...');
      const isHealthy = await checkEdgeFunctionHealth();
      if (!isHealthy) {
        throw new Error('Edge Function is not responding. Please check the function status.');
      }

      console.log('Edge Function health check passed, proceeding with import...');

      // Create abort controller for the entire import process
      const controller = new AbortController();
      setAbortController(controller);

      const importResults: ImportResult[] = [];
      
      // Process users sequentially (one at a time)
      for (let i = 0; i < users.length; i++) {
        if (controller.signal.aborted) {
          console.log('Import process aborted by user');
          break;
        }

        const user = users[i];
        console.log(`Processing user ${i + 1}/${users.length}: ${user.email}`);
        
        const result = await createUserWithRetry(user);
        importResults.push(result);

        // Update progress
        const progressPercent = ((i + 1) / users.length) * 100;
        setProgress(progressPercent);
        
        // Update results in real-time
        setResults([...importResults]);
        
        // Small delay between requests to avoid overwhelming the system
        if (i < users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setResults(importResults);
      setShowResults(true);

      const successful = importResults.filter(r => r.success).length;
      const failed = importResults.filter(r => !r.success).length;

      console.log(`Import completed: ${successful} successful, ${failed} failed`);

      if (successful > 0) {
        toast.success(`Successfully imported ${successful} users`);
        onUsersImported();
      }

      if (failed > 0) {
        toast.error(`Failed to import ${failed} users. Check the results for details.`);
      }

    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import users');
    } finally {
      setIsImporting(false);
      setCurrentUser('');
      setAbortController(null);
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      toast.info('Import process cancelled');
    }
  };

  const handleClose = () => {
    if (isImporting) {
      handleCancel();
    }
    setFile(null);
    setResults([]);
    setShowResults(false);
    setParsedUsers([]);
    setProgress(0);
    setDebugInfo(null);
    setCurrentUser('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const successfulImports = results.filter(r => r.success).length;
  const failedImports = results.filter(r => !r.success).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
        </DialogHeader>

        {/* Debug Mode Toggle */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
            className="flex items-center gap-2"
          >
            <Bug className="h-4 w-4" />
            {debugMode ? 'Hide Debug' : 'Show Debug'}
          </Button>
          {debugMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={testDebugEndpoint}
              disabled={isImporting}
            >
              Test Edge Function
            </Button>
          )}
        </div>

        {/* Debug Information */}
        {debugMode && debugInfo && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Debug Information</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {!showResults ? (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                CSV file should contain columns: <strong>full_name, email</strong>. 
                Optional columns: <strong>role, status, send_welcome_email</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isImporting}
              />
            </div>

            {file && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        Size: {(file.size / 1024).toFixed(1)} KB
                      </p>
                      {parsedUsers.length > 0 && (
                        <p className="text-sm text-green-600">
                          {parsedUsers.length} users parsed and ready to import
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setParsedUsers([]);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isImporting && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Import Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
                
                {currentUser && (
                  <p className="text-sm text-gray-600">
                    Processing: {currentUser}
                  </p>
                )}

                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full"
                >
                  Cancel Import
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={!file || isImporting}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Users'}
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Successful</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{successfulImports}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{failedImports}</p>
                </CardContent>
              </Card>
            </div>

            {failedImports > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Import Errors:</h4>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {results
                    .filter(r => !r.success)
                    .map((result, index) => (
                      <div key={index} className="text-sm bg-red-50 p-2 rounded">
                        <strong>{result.email}:</strong> {result.error}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

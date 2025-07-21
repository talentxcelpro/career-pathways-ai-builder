
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { checkEdgeFunctionHealth, testEdgeFunctionDebug } from '@/utils/edgeFunction';

interface ImportUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsersImported: () => void;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  open,
  onOpenChange,
  onUsersImported
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [edgeFunctionStatus, setEdgeFunctionStatus] = useState<{
    isHealthy: boolean;
    debugInfo: any;
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setCsvFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const testEdgeFunction = async () => {
    setIsTesting(true);
    try {
      console.log('Testing Edge Function health and debug...');
      
      // Test health check
      const isHealthy = await checkEdgeFunctionHealth();
      console.log('Edge Function health check result:', isHealthy);
      
      // Test debug endpoint
      let debugInfo = null;
      try {
        debugInfo = await testEdgeFunctionDebug();
        console.log('Debug info received:', debugInfo);
      } catch (debugError) {
        console.error('Debug test failed:', debugError);
        debugInfo = { error: debugError.message };
      }
      
      setEdgeFunctionStatus({
        isHealthy,
        debugInfo
      });
      
      if (isHealthy) {
        toast.success('Edge Function is working correctly!');
      } else {
        toast.error('Edge Function health check failed');
      }
    } catch (error) {
      console.error('Edge Function test failed:', error);
      toast.error('Edge Function test failed: ' + error.message);
      setEdgeFunctionStatus({
        isHealthy: false,
        debugInfo: { error: error.message }
      });
    } finally {
      setIsTesting(false);
    }
  };

  const parseCsvFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error('CSV file must have at least a header row and one data row'));
            return;
          }
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const users = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            if (values.length === headers.length) {
              const user: any = {};
              headers.forEach((header, index) => {
                user[header] = values[index];
              });
              
              // Validate required fields
              if (user.email && user.name) {
                users.push({
                  email: user.email,
                  name: user.name,
                  role: user.role || 'job_seeker',
                  temporaryPassword: user.password || 'TempPass123!'
                });
              }
            }
          }
          
          resolve(users);
        } catch (error) {
          reject(new Error('Failed to parse CSV file: ' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const importUsers = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);

    try {
      // Parse CSV file
      const users = await parseCsvFile(csvFile);
      console.log('Parsed users from CSV:', users);
      
      if (users.length === 0) {
        toast.error('No valid users found in CSV file');
        return;
      }

      // Import users one by one to track progress
      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process users sequentially with better error handling
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const progress = Math.round(((i + 1) / users.length) * 100);
        setImportProgress(progress);

        console.log(`Processing user ${i + 1}/${users.length}:`, {
          email: user.email,
          name: user.name,
          role: user.role,
          userEmailPresent: !!user.email,
          userNamePresent: !!user.name
        });

        try {
          // Get fresh session for each request
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !session) {
            throw new Error('Authentication session invalid');
          }

          // Create user with direct Edge Function call
          const requestBody = {
            userEmail: user.email,
            userName: user.name,
            userRole: user.role || 'job_seeker',
            temporaryPassword: user.temporaryPassword || 'TempPass123!'
          };

          console.log(`Sending request for ${user.email}:`, requestBody);
          const { data, error } = await supabase.functions.invoke('admin-create-user', {
            body: {
              userEmail: user.email,
              userName: user.name,
              userRole: user.role || 'job_seeker',
              temporaryPassword: user.temporaryPassword || 'TempPass123!'
            },
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          if (error) {
            throw new Error(`Network error: ${error.message}`);
          }

          if (!data?.success) {
            throw new Error(data?.error || 'User creation failed');
          }

          // Success
          results.successful++;
          console.log(`✓ Successfully created: ${user.email}`);
          
        } catch (error: any) {
          results.failed++;
          const errorMsg = error.message || 'Unknown error';
          results.errors.push(`${user.email}: ${errorMsg}`);
          console.error(`✗ Failed to create ${user.email}:`, error);
        }

        // Small delay between requests
        if (i < users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setImportResults(results);
      
      if (results.successful > 0) {
        toast.success(`Successfully imported ${results.successful} users`);
        onUsersImported();
      }
      
      if (results.failed > 0) {
        toast.error(`Failed to import ${results.failed} users`);
      }
    } catch (error) {
      console.error('Import process failed:', error);
      toast.error('Import failed: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'email,name,role,password\njohn.doe@example.com,John Doe,job_seeker,TempPass123!\njane.smith@example.com,Jane Smith,employer,SecurePass456!';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setCsvFile(null);
    setImportResults(null);
    setImportProgress(0);
    setEdgeFunctionStatus(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Edge Function Status Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Edge Function Status</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={testEdgeFunction}
                disabled={isTesting}
                className="flex items-center gap-2"
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Test Edge Function
              </Button>
            </div>

            {edgeFunctionStatus && (
              <Alert variant={edgeFunctionStatus.isHealthy ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>Status:</strong> {edgeFunctionStatus.isHealthy ? 'Healthy' : 'Unhealthy'}
                    </p>
                    {edgeFunctionStatus.debugInfo && (
                      <div>
                        <strong>Debug Info:</strong>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(edgeFunctionStatus.debugInfo, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">CSV Template</Label>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Select CSV File</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              {csvFile ? (
                <p className="text-sm font-medium text-green-600">
                  Selected: {csvFile.name}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? 'Drop the CSV file here...'
                    : 'Drag and drop a CSV file here, or click to select'}
                </p>
              )}
            </div>
          </div>

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Import Progress</Label>
                <span className="text-sm text-gray-600">{importProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>Import Complete:</strong> {importResults.successful} successful, {importResults.failed} failed
                  </p>
                  {importResults.errors.length > 0 && (
                    <div>
                      <strong>Errors:</strong>
                      <ul className="mt-1 text-xs space-y-1">
                        {importResults.errors.slice(0, 5).map((error, index) => (
                          <li key={index} className="text-red-600">• {error}</li>
                        ))}
                        {importResults.errors.length > 5 && (
                          <li className="text-gray-600">... and {importResults.errors.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={importUsers}
              disabled={!csvFile || isImporting}
              className="flex items-center gap-2"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Import Users
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Upload, AlertCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsersImported: () => void;
}

interface ImportResult {
  email: string;
  name: string;
  success: boolean;
  error?: string;
  userId?: string;
}

interface ParsedUser {
  email: string;
  name: string;
  role?: string;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  open,
  onOpenChange,
  onUsersImported
}) => {
  const [csvData, setCsvData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const parseCsvData = (data: string): ParsedUser[] => {
    const lines = data.trim().split('\n');
    const users: ParsedUser[] = [];

    // Check if first line is a header
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('email') || firstLine.includes('name') || firstLine.includes('role');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    for (const line of dataLines) {
      if (!line.trim()) continue;
      
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length >= 2) {
        const email = columns[0];
        const name = columns[1];
        const role = columns[2] || 'job_seeker';
        
        // Basic email validation
        if (email && email.includes('@') && name) {
          users.push({ email, name, role });
        }
      }
    }

    return users;
  };

  const createUser = async (user: ParsedUser): Promise<ImportResult> => {
    try {
      // Generate a temporary password
      const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      console.log('Creating user via Edge Function:', user.email);

      // Call the admin-create-user Edge Function
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          userEmail: user.email,
          userName: user.name,
          userRole: user.role || 'job_seeker',
          temporaryPassword
        }
      });

      if (error) {
        console.error('Edge Function error:', error);
        return {
          email: user.email,
          name: user.name,
          success: false,
          error: error.message || 'Unknown error from Edge Function'
        };
      }

      if (!data?.success) {
        console.error('Edge Function returned failure:', data);
        return {
          email: user.email,
          name: user.name,
          success: false,
          error: data?.error || 'User creation failed'
        };
      }

      console.log('User created successfully:', user.email);

      return {
        email: user.email,
        name: user.name,
        success: true,
        userId: data.userId
      };

    } catch (error: any) {
      console.error('Error creating user:', user.email, error);
      return {
        email: user.email,
        name: user.name,
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast.error('Please enter CSV data to import');
      return;
    }

    const users = parseCsvData(csvData);
    
    if (users.length === 0) {
      toast.error('No valid users found in CSV data');
      return;
    }

    if (users.length > 100) {
      toast.error('Maximum 100 users can be imported at once');
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setImportResults([]);
    setShowResults(true);

    const results: ImportResult[] = [];

    // Process users in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchPromises = batch.map(user => createUser(user));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      setImportResults([...results]);
      setProgress((results.length / users.length) * 100);

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsImporting(false);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} users`);
      if (successCount === users.length) {
        onUsersImported();
      }
    }

    if (failCount > 0) {
      toast.error(`${failCount} users failed to import. Check the results for details.`);
    }
  };

  const downloadResults = () => {
    const csvContent = [
      'Email,Name,Status,Error',
      ...importResults.map(result => 
        `"${result.email}","${result.name}","${result.success ? 'Success' : 'Failed'}","${result.error || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setCsvData('');
    setImportResults([]);
    setShowResults(false);
    setProgress(0);
    onOpenChange(false);
  };

  const successCount = importResults.filter(r => r.success).length;
  const failCount = importResults.filter(r => !r.success).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Users
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!showResults && (
            <>
              <div className="space-y-2">
                <Label>CSV Format Instructions</Label>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Use the following CSV format (with or without headers):
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      email,name,role<br />
                      john@example.com,John Doe,job_seeker<br />
                      jane@example.com,Jane Smith,employer
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Role is optional and defaults to 'job_seeker'. Available roles: job_seeker, employer, candidate
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csvData">CSV Data</Label>
                <Textarea
                  id="csvData"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Paste your CSV data here..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            </>
          )}

          {showResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Import Results</h3>
                {importResults.length > 0 && (
                  <Button variant="outline" size="sm" onClick={downloadResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Results
                  </Button>
                )}
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing users...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {!isImporting && importResults.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{successCount}</p>
                          <p className="text-sm text-muted-foreground">Successful</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">{failCount}</p>
                          <p className="text-sm text-muted-foreground">Failed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{importResults.length}</p>
                          <p className="text-sm text-muted-foreground">Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="max-h-60 overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Email</th>
                      <th className="text-left p-2 font-medium">Name</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResults.map((result, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{result.email}</td>
                        <td className="p-2">{result.name}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            {result.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                              {result.success ? 'Success' : 'Failed'}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">
                          {result.error || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              {showResults ? 'Close' : 'Cancel'}
            </Button>
            {!showResults && (
              <Button onClick={handleImport} disabled={!csvData.trim() || isImporting}>
                {isImporting ? 'Importing...' : 'Import Users'}
              </Button>
            )}
            {showResults && !isImporting && failCount === 0 && (
              <Button onClick={() => { handleClose(); onUsersImported(); }}>
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

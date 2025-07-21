
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, Download, Check, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';

interface ImportUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsersImported: () => void;
}

interface ParsedUser {
  email: string;
  name: string;
  role: string;
  temporaryPassword?: string;
  isValid: boolean;
  issues: string[];
}

interface ImportResult {
  success: boolean;
  email: string;
  error?: string;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  open,
  onOpenChange,
  onUsersImported
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  const downloadTemplate = () => {
    const template = [
      ['email', 'name', 'role', 'password'],
      ['john.doe@example.com', 'John Doe', 'job_seeker', 'TempPass123!'],
      ['jane.smith@company.com', 'Jane Smith', 'employer', 'SecurePass456!'],
      ['admin@platform.com', 'Admin User', 'admin', 'AdminPass789!']
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const detectColumnMapping = (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {};
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());

    // Email detection
    const emailVariants = ['email', 'email_address', 'emailaddress', 'e-mail', 'mail'];
    const emailIndex = lowerHeaders.findIndex(h => emailVariants.includes(h));
    if (emailIndex >= 0) mapping.email = headers[emailIndex];

    // Name detection
    const nameVariants = ['name', 'full_name', 'fullname', 'user_name', 'username', 'display_name'];
    const nameIndex = lowerHeaders.findIndex(h => nameVariants.includes(h));
    if (nameIndex >= 0) mapping.name = headers[nameIndex];

    // Role detection
    const roleVariants = ['role', 'user_role', 'userrole', 'type', 'user_type', 'account_type'];
    const roleIndex = lowerHeaders.findIndex(h => roleVariants.includes(h));
    if (roleIndex >= 0) mapping.role = headers[roleIndex];

    // Password detection
    const passwordVariants = ['password', 'pwd', 'pass', 'temporary_password', 'temp_password', 'temp_pass'];
    const passwordIndex = lowerHeaders.findIndex(h => passwordVariants.includes(h));
    if (passwordIndex >= 0) mapping.temporaryPassword = headers[passwordIndex];

    return mapping;
  };

  const validateUser = (user: any): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];

    if (!user.email || typeof user.email !== 'string' || user.email.trim() === '') {
      issues.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim())) {
      issues.push('Invalid email format');
    }

    if (!user.name || typeof user.name !== 'string' || user.name.trim() === '') {
      issues.push('Name is required');
    }

    if (user.role && !['job_seeker', 'employer', 'admin'].includes(user.role)) {
      issues.push('Invalid role (must be: job_seeker, employer, or admin)');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      parseCsv(file);
    }
  };

  const parseCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        console.log('CSV Parse Results:', results);
        
        if (results.errors.length > 0) {
          console.error('CSV Parse Errors:', results.errors);
          toast.error('Error parsing CSV file');
          return;
        }

        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        console.log('CSV Headers:', headers);

        const columnMapping = detectColumnMapping(headers);
        console.log('Column Mapping:', columnMapping);

        if (!columnMapping.email || !columnMapping.name) {
          toast.error('CSV must contain email and name columns');
          return;
        }

        const users: ParsedUser[] = results.data.map((row: any) => {
          const user = {
            email: row[columnMapping.email]?.toString().trim() || '',
            name: row[columnMapping.name]?.toString().trim() || '',
            role: row[columnMapping.role]?.toString().trim().toLowerCase() || 'job_seeker',
            temporaryPassword: row[columnMapping.temporaryPassword]?.toString().trim() || ''
          };

          const validation = validateUser(user);
          
          return {
            ...user,
            isValid: validation.isValid,
            issues: validation.issues
          };
        }).filter(user => user.email || user.name); // Filter out completely empty rows

        console.log('Parsed Users:', users);
        setParsedUsers(users);
        setShowPreview(true);
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
        toast.error('Failed to parse CSV file');
      }
    });
  };

  const importUser = async (user: ParsedUser): Promise<ImportResult> => {
    try {
      console.log('Importing user:', user);
      
      const requestBody = {
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        temporaryPassword: user.temporaryPassword || 'TempPass123!'
      };

      console.log('Request body:', requestBody);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authentication session found');
      }

      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: requestBody,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Edge Function Response:', { data, error });

      if (error) {
        console.error('Edge Function Error:', error);
        throw new Error(`Network error: ${error.message}`);
      }

      if (!data?.success) {
        console.error('Edge Function returned error:', data);
        throw new Error(data?.error || 'Unknown error from Edge Function');
      }

      return {
        success: true,
        email: user.email
      };

    } catch (error) {
      console.error('Import error for user:', user.email, error);
      return {
        success: false,
        email: user.email,
        error: error.message
      };
    }
  };

  const handleImport = async () => {
    if (!parsedUsers.length) return;

    const validUsers = parsedUsers.filter(user => user.isValid);
    if (validUsers.length === 0) {
      toast.error('No valid users to import');
      return;
    }

    setIsImporting(true);
    setImportResults([]);
    setImportProgress(0);

    const results: ImportResult[] = [];

    for (let i = 0; i < validUsers.length; i++) {
      const user = validUsers[i];
      console.log(`Importing user ${i + 1}/${validUsers.length}:`, user.email);
      
      const result = await importUser(user);
      results.push(result);
      
      setImportProgress(((i + 1) / validUsers.length) * 100);
      
      // Add small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setImportResults(results);
    setIsImporting(false);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    if (successful > 0) {
      toast.success(`Import complete: ${successful} successful, ${failed} failed`);
      if (successful === results.length) {
        onUsersImported();
      }
    } else {
      toast.error(`Import failed: ${failed} users could not be imported`);
    }
  };

  const resetModal = () => {
    setCsvFile(null);
    setParsedUsers([]);
    setImportResults([]);
    setImportProgress(0);
    setShowPreview(false);
    setCsvHeaders([]);
  };

  const handleClose = () => {
    if (!isImporting) {
      resetModal();
      onOpenChange(false);
    }
  };

  const validUsers = parsedUsers.filter(user => user.isValid);
  const invalidUsers = parsedUsers.filter(user => !user.isValid);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">CSV Template</h3>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
            
            <Alert>
              <AlertDescription>
                Your CSV must include columns for: <strong>email</strong> and <strong>name</strong> (required). 
                Optional columns: <strong>role</strong> (job_seeker/employer/admin), <strong>temporary_password</strong>. 
                Column names are case-insensitive and flexible (e.g., "Email", "email", "email_address" all work).
              </AlertDescription>
            </Alert>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Select CSV File</h3>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isImporting}
              />
            </div>
            {csvFile && (
              <p className="text-sm text-gray-600">
                Selected: {csvFile.name}
              </p>
            )}
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">CSV Preview & Validation</h3>
                <div className="flex space-x-4 text-sm">
                  <span>Total Rows: <strong>{parsedUsers.length}</strong></span>
                  <span className="text-green-600">Valid Users: <strong>{validUsers.length}</strong></span>
                  <span className="text-red-600">Invalid Users: <strong>{invalidUsers.length}</strong></span>
                </div>
              </div>

              {csvHeaders.length > 0 && (
                <div className="text-sm">
                  <strong>CSV Headers Detected:</strong> {csvHeaders.join(', ')}
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Role</th>
                        <th className="px-3 py-2 text-left">Issues</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parsedUsers.map((user, index) => (
                        <tr key={index} className={user.isValid ? '' : 'bg-red-50'}>
                          <td className="px-3 py-2">
                            {user.isValid ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                          </td>
                          <td className="px-3 py-2">{user.email}</td>
                          <td className="px-3 py-2">{user.name}</td>
                          <td className="px-3 py-2">{user.role}</td>
                          <td className="px-3 py-2 text-red-600 text-xs">
                            {user.issues.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {validUsers.length > 0 && (
                <div className="flex justify-end">
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
                    Import {validUsers.length} Valid Users
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Progress Section */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing users...</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} />
            </div>
          )}

          {/* Results Section */}
          {importResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Import Results</h3>
              
              <div className="text-sm">
                Import Complete: {importResults.filter(r => r.success).length} successful, {importResults.filter(r => !r.success).length} failed
              </div>

              {importResults.some(r => !r.success) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-600">Errors:</h4>
                  <div className="bg-red-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                    {importResults
                      .filter(r => !r.success)
                      .slice(0, 10) // Show only first 10 errors
                      .map((result, index) => (
                        <div key={index} className="text-sm text-red-700">
                          • {result.email}: {result.error}
                        </div>
                      ))}
                    {importResults.filter(r => !r.success).length > 10 && (
                      <div className="text-sm text-red-600 mt-2">
                        ... and {importResults.filter(r => !r.success).length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

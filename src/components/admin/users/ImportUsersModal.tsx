
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  rowIndex: number;
  isValid: boolean;
  errors: string[];
}

interface ColumnMapping {
  email: string | null;
  name: string | null;
  role: string | null;
  password: string | null;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  open,
  onOpenChange,
  onUsersImported
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  } | null>(null);
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Enhanced CSV column detection
  const detectColumnMapping = (headers: string[]): ColumnMapping => {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    
    const emailPatterns = ['email', 'email_address', 'emailaddress', 'mail', 'e-mail'];
    const namePatterns = ['name', 'full_name', 'fullname', 'full name', 'username', 'user_name'];
    const rolePatterns = ['role', 'user_role', 'userrole', 'type', 'account_type'];
    const passwordPatterns = ['password', 'temp_password', 'temporary_password', 'pwd'];

    return {
      email: findMatchingHeader(normalizedHeaders, headers, emailPatterns),
      name: findMatchingHeader(normalizedHeaders, headers, namePatterns),
      role: findMatchingHeader(normalizedHeaders, headers, rolePatterns),
      password: findMatchingHeader(normalizedHeaders, headers, passwordPatterns)
    };
  };

  const findMatchingHeader = (normalized: string[], original: string[], patterns: string[]): string | null => {
    for (const pattern of patterns) {
      const index = normalized.findIndex(h => h.includes(pattern));
      if (index !== -1) return original[index];
    }
    return null;
  };

  const validateUserData = (user: any, rowIndex: number): ParsedUser => {
    const errors: string[] = [];
    
    // Validate email
    const email = String(user.email || '').trim();
    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }

    // Validate name
    const name = String(user.name || '').trim();
    if (!name) {
      errors.push('Name is required');
    } else if (name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    // Validate role
    const role = String(user.role || 'job_seeker').toLowerCase().trim();
    const validRoles = ['job_seeker', 'employer', 'admin'];
    const normalizedRole = validRoles.includes(role) ? role : 'job_seeker';

    return {
      email,
      name,
      role: normalizedRole,
      temporaryPassword: user.temporaryPassword || 'TempPass123!',
      rowIndex,
      isValid: errors.length === 0,
      errors
    };
  };

  const parseCSV = (text: string): ParsedUser[] => {
    console.log('Starting CSV parsing...');
    
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      toast.error('CSV file is empty');
      return [];
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    setCsvHeaders(headers);
    console.log('CSV Headers found:', headers);

    // Detect column mapping
    const columnMapping = detectColumnMapping(headers);
    console.log('Column mapping detected:', columnMapping);

    // Validate required columns are found
    if (!columnMapping.email || !columnMapping.name) {
      const missingColumns = [];
      if (!columnMapping.email) missingColumns.push('email');
      if (!columnMapping.name) missingColumns.push('name');
      
      toast.error(`Required columns not found: ${missingColumns.join(', ')}. Please check your CSV headers.`);
      return [];
    }

    const users: ParsedUser[] = [];
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
      
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1} has ${values.length} values but expected ${headers.length}`);
        continue;
      }

      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      // Map to standard fields
      const userData = {
        email: rowData[columnMapping.email!],
        name: rowData[columnMapping.name!],
        role: columnMapping.role ? rowData[columnMapping.role] : 'job_seeker',
        temporaryPassword: columnMapping.password ? rowData[columnMapping.password] : undefined
      };

      console.log(`Row ${i + 1} data:`, userData);
      
      const validatedUser = validateUserData(userData, i + 1);
      users.push(validatedUser);
    }

    console.log(`Parsed ${users.length} users from CSV`);
    return users;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setResults(null);
    setShowPreview(false);
    
    // Parse and preview the file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setParsedUsers(parsed);
      if (parsed.length > 0) {
        setShowPreview(true);
      }
    };
    reader.readAsText(selectedFile);
  };

  const downloadTemplate = () => {
    const csvContent = 'email,name,role,temporary_password\nuser@example.com,John Doe,job_seeker,TempPass123!\nemployer@company.com,Jane Smith,employer,SecurePass456!';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importUsers = async () => {
    if (!file || parsedUsers.length === 0) return;

    // Check if there are any valid users to import
    const validUsers = parsedUsers.filter(user => user.isValid);
    if (validUsers.length === 0) {
      toast.error('No valid users found to import. Please fix the validation errors first.');
      return;
    }

    setImporting(true);
    setProgress(0);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>
    };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Authentication session not found');
      setImporting(false);
      return;
    }

    // Import only valid users
    for (let i = 0; i < validUsers.length; i++) {
      const user = validUsers[i];
      
      try {
        const requestBody = {
          userEmail: user.email,
          userName: user.name,
          userRole: user.role,
          temporaryPassword: user.temporaryPassword
        };

        console.log(`Importing user ${i + 1}/${validUsers.length}:`, requestBody);

        const { data, error } = await supabase.functions.invoke('admin-create-user', {
          body: requestBody,
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (error) {
          console.error(`Import failed for ${user.email}:`, error);
          results.failed++;
          results.errors.push({
            email: user.email,
            error: error.message || 'Unknown error occurred'
          });
        } else if (data?.success) {
          console.log(`Successfully imported ${user.email}`);
          results.successful++;
        } else {
          console.error(`Import failed for ${user.email}:`, data);
          results.failed++;
          results.errors.push({
            email: user.email,
            error: data?.error || 'Edge Function returned failure'
          });
        }
      } catch (error: any) {
        console.error(`Exception during import for ${user.email}:`, error);
        results.failed++;
        results.errors.push({
          email: user.email,
          error: error.message || 'Network error occurred'
        });
      }

      setProgress(((i + 1) / validUsers.length) * 100);
    }

    setResults(results);
    setImporting(false);

    if (results.successful > 0) {
      toast.success(`Successfully imported ${results.successful} users`);
      if (results.failed === 0) {
        onUsersImported();
        onOpenChange(false);
      }
    }

    if (results.failed > 0) {
      toast.error(`Failed to import ${results.failed} users`);
    }
  };

  const resetModal = () => {
    setFile(null);
    setParsedUsers([]);
    setCsvHeaders([]);
    setShowPreview(false);
    setResults(null);
    setProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetModal();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* CSV Template Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">CSV Template</h3>
              <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Your CSV must include columns for: <strong>email</strong> and <strong>name</strong> (required). 
                Optional columns: <strong>role</strong> (job_seeker/employer/admin), <strong>temporary_password</strong>.
                Column names are case-insensitive and flexible (e.g., "Email", "email", "email_address" all work).
              </AlertDescription>
            </Alert>
          </div>

          {/* File Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select CSV File</h3>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="text-sm text-gray-600">Selected: {file.name}</p>
            )}
          </div>

          {/* CSV Preview and Validation */}
          {showPreview && parsedUsers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">CSV Preview & Validation</h3>
              
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600">Total Rows</div>
                  <div className="text-xl font-semibold text-blue-800">{parsedUsers.length}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-600">Valid Users</div>
                  <div className="text-xl font-semibold text-green-800">
                    {parsedUsers.filter(u => u.isValid).length}
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm text-red-600">Invalid Users</div>
                  <div className="text-xl font-semibold text-red-800">
                    {parsedUsers.filter(u => !u.isValid).length}
                  </div>
                </div>
              </div>

              {/* Headers Found */}
              <div>
                <h4 className="font-medium mb-2">CSV Headers Detected:</h4>
                <div className="flex flex-wrap gap-2">
                  {csvHeaders.map((header, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {header}
                    </span>
                  ))}
                </div>
              </div>

              {/* Validation Results */}
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Role</th>
                      <th className="p-2 text-left">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedUsers.map((user, index) => (
                      <tr key={index} className={user.isValid ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="p-2">
                          {user.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.role}</td>
                        <td className="p-2">
                          {user.errors.length > 0 && (
                            <div className="text-red-600 text-xs">
                              {user.errors.join(', ')}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Progress */}
          {importing && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Importing Users...</h3>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600">Progress: {Math.round(progress)}%</p>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Import Results</h3>
              <Alert variant={results.failed > 0 ? "destructive" : "default"}>
                <AlertDescription>
                  <strong>Import Complete:</strong> {results.successful} successful, {results.failed} failed
                </AlertDescription>
              </Alert>
              
              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Errors:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {results.errors.map((error, index) => (
                      <div key={index} className="text-sm bg-red-50 p-2 rounded">
                        <strong>{error.email}:</strong> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
              Cancel
            </Button>
            <Button
              onClick={importUsers}
              disabled={!file || importing || parsedUsers.filter(u => u.isValid).length === 0}
              className="flex items-center gap-2"
            >
              {importing ? (
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

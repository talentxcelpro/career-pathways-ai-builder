
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, AlertTriangle, Type } from 'lucide-react';
import { useUserImport } from '@/hooks/useUserImport';
import { ImportProgress } from './ImportProgress';
import { ImportResults } from './ImportResults';
import Papa from 'papaparse';

interface ImportUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsersImported: () => void;
}

interface ImportUser {
  email: string;
  name: string;
  role: string;
  temporaryPassword?: string;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  open,
  onOpenChange,
  onUsersImported
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState('');
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('slow');
  const [maxRetries, setMaxRetries] = useState(3);
  const [users, setUsers] = useState<ImportUser[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const { progress, results, isPaused, importUsers, pauseImport, resumeImport, cancelImport } = useUserImport();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setParseErrors(['Please select a CSV file']);
      return;
    }

    setFile(selectedFile);
    setParseErrors([]);
    setUsers([]);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        console.log('CSV Parse Result:', result);
        
        if (result.errors && result.errors.length > 0) {
          const errors = result.errors.map(error => `Row ${error.row}: ${error.message}`);
          setParseErrors(errors);
          return;
        }

        const parsedUsers: ImportUser[] = [];
        const errors: string[] = [];

        result.data.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // +2 because of header row and 0-based index
          
          // Check for required columns
          if (!row.email && !row.Email && !row.EMAIL) {
            errors.push(`Row ${rowNumber}: Missing email column (use 'email', 'Email', or 'EMAIL')`);
            return;
          }
          
          if (!row.name && !row.Name && !row.NAME && !row['Full Name'] && !row['full_name']) {
            errors.push(`Row ${rowNumber}: Missing name column (use 'name', 'Name', 'NAME', 'Full Name', or 'full_name')`);
            return;
          }

          const email = (row.email || row.Email || row.EMAIL || '').toString().trim();
          const name = (row.name || row.Name || row.NAME || row['Full Name'] || row['full_name'] || '').toString().trim();
          const role = (row.role || row.Role || row.ROLE || row.user_role || '').toString().trim().toLowerCase();
          const temporaryPassword = (row.password || row.Password || row.temporary_password || '').toString().trim();

          if (!email) {
            errors.push(`Row ${rowNumber}: Email is empty`);
            return;
          }

          if (!name) {
            errors.push(`Row ${rowNumber}: Name is empty`);
            return;
          }

          // Validate role if provided
          const validRoles = ['job_seeker', 'employer', 'admin'];
          const roleToUse = role || 'job_seeker';
          
          if (role && !validRoles.includes(roleToUse)) {
            errors.push(`Row ${rowNumber}: Invalid role '${role}'. Use: ${validRoles.join(', ')}`);
            return;
          }

          parsedUsers.push({
            email,
            name,
            role: roleToUse,
            ...(temporaryPassword && { temporaryPassword })
          });
        });

        if (errors.length > 0) {
          setParseErrors(errors);
        } else {
          setUsers(parsedUsers);
          console.log(`Parsed ${parsedUsers.length} users successfully`);
        }
      },
      error: (error) => {
        setParseErrors([`Failed to parse CSV: ${error.message}`]);
      }
    });
  };

  const handleTextParse = () => {
    if (!csvText.trim()) {
      setParseErrors(['Please enter CSV data']);
      return;
    }

    setParseErrors([]);
    setUsers([]);

    Papa.parse(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        console.log('CSV Parse Result:', result);
        
        if (result.errors && result.errors.length > 0) {
          const errors = result.errors.map(error => `Row ${error.row}: ${error.message}`);
          setParseErrors(errors);
          return;
        }

        const parsedUsers: ImportUser[] = [];
        const errors: string[] = [];

        result.data.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // +2 because of header row and 0-based index
          
          // Check for required columns
          if (!row.email && !row.Email && !row.EMAIL) {
            errors.push(`Row ${rowNumber}: Missing email column (use 'email', 'Email', or 'EMAIL')`);
            return;
          }
          
          if (!row.name && !row.Name && !row.NAME && !row['Full Name'] && !row['full_name']) {
            errors.push(`Row ${rowNumber}: Missing name column (use 'name', 'Name', 'NAME', 'Full Name', or 'full_name')`);
            return;
          }

          const email = (row.email || row.Email || row.EMAIL || '').toString().trim();
          const name = (row.name || row.Name || row.NAME || row['Full Name'] || row['full_name'] || '').toString().trim();
          const role = (row.role || row.Role || row.ROLE || row.user_role || '').toString().trim().toLowerCase();
          const temporaryPassword = (row.password || row.Password || row.temporary_password || '').toString().trim();

          if (!email) {
            errors.push(`Row ${rowNumber}: Email is empty`);
            return;
          }

          if (!name) {
            errors.push(`Row ${rowNumber}: Name is empty`);
            return;
          }

          // Validate role if provided
          const validRoles = ['job_seeker', 'employer', 'admin'];
          const roleToUse = role || 'job_seeker';
          
          if (role && !validRoles.includes(roleToUse)) {
            errors.push(`Row ${rowNumber}: Invalid role '${role}'. Use: ${validRoles.join(', ')}`);
            return;
          }

          parsedUsers.push({
            email,
            name,
            role: roleToUse,
            ...(temporaryPassword && { temporaryPassword })
          });
        });

        if (errors.length > 0) {
          setParseErrors(errors);
        } else {
          setUsers(parsedUsers);
          console.log(`Parsed ${parsedUsers.length} users successfully`);
        }
      },
      error: (error) => {
        setParseErrors([`Failed to parse CSV: ${error.message}`]);
      }
    });
  };

  const handleImport = async () => {
    if (users.length === 0) return;

    await importUsers(users, { speed, maxRetries });
    
    if (!progress.isRunning) {
      onUsersImported();
    }
  };

  const handleRetryFailed = (failedUsers: any[]) => {
    const retryUsers: ImportUser[] = failedUsers.map(result => ({
      email: result.email,
      name: result.email, // We don't have the original name, so use email
      role: 'job_seeker' // Default role for retry
    }));
    
    importUsers(retryUsers, { speed, maxRetries });
  };

  const getSpeedDescription = (speedOption: string) => {
    switch (speedOption) {
      case 'slow':
        return '8 seconds between requests - Recommended for large imports (100+ users)';
      case 'normal':
        return '5 seconds between requests - Good for medium imports (20-100 users)';
      case 'fast':
        return '3 seconds between requests - Only for small imports (<20 users)';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* CSV Format Guide */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Required CSV columns:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>email</strong> - User's email address (required)</li>
                  <li><strong>name</strong> - User's full name (required)</li>
                  <li><strong>role</strong> - One of: job_seeker, employer, admin (optional, defaults to job_seeker)</li>
                  <li><strong>password</strong> - Temporary password (optional, defaults to TempPass123!)</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  Column names are flexible: use 'Email', 'Full Name', 'user_role', etc.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Input Methods */}
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Paste CSV Text
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload CSV File
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-text">Paste CSV Data</Label>
                <Textarea
                  id="csv-text"
                  placeholder="email,name,role,password
rahuldhi74@gmail.com,Rahul Dheeman,job_seeker,TempPass123!
kumar.aug09@gmail.com,Kumar Raja,job_seeker,TempPass123!"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                />
                <Button onClick={handleTextParse} className="w-full">
                  Parse CSV Data
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">CSV parsing errors:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {parseErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {users.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({users.length} users found)</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-gray-50">
                {users.slice(0, 5).map((user, index) => (
                  <div key={index} className="text-sm py-1">
                    {user.email} - {user.name} ({user.role})
                  </div>
                ))}
                {users.length > 5 && (
                  <div className="text-sm text-gray-500">
                    ... and {users.length - 5} more users
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Settings */}
          {users.length > 0 && !progress.isRunning && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-3">
                <Label>Import Speed</Label>
                <RadioGroup value={speed} onValueChange={(value: any) => setSpeed(value)}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slow" id="slow" />
                      <Label htmlFor="slow" className="flex-1">
                        <div>
                          <div className="font-medium">Slow (Recommended)</div>
                          <div className="text-sm text-gray-600">
                            {getSpeedDescription('slow')}
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="normal" />
                      <Label htmlFor="normal" className="flex-1">
                        <div>
                          <div className="font-medium">Normal</div>
                          <div className="text-sm text-gray-600">
                            {getSpeedDescription('normal')}
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fast" id="fast" />
                      <Label htmlFor="fast" className="flex-1">
                        <div>
                          <div className="font-medium">Fast</div>
                          <div className="text-sm text-gray-600">
                            {getSpeedDescription('fast')}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retries">Max Retries per User</Label>
                <Input
                  id="retries"
                  type="number"
                  min="1"
                  max="5"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(parseInt(e.target.value) || 3)}
                  className="w-24"
                />
                <p className="text-sm text-gray-600">
                  Number of retry attempts for failed imports (recommended: 3)
                </p>
              </div>
            </div>
          )}

          {/* Import Progress */}
          <ImportProgress
            progress={{
              total: progress.total,
              completed: progress.completed,
              successful: progress.successful,
              failed: progress.failed,
              currentUser: progress.currentUserEmail,
              isRunning: progress.isRunning,
              connectionStatus: progress.connectionStatus === 'healthy' ? 'healthy' : 
                              progress.connectionStatus === 'unhealthy' ? 'unhealthy' : 'testing'
            }}
            isPaused={isPaused}
            onPause={pauseImport}
            onResume={resumeImport}
            onCancel={cancelImport}
          />

          {/* Import Results */}
          <ImportResults 
            results={results.map(r => ({
              ...r,
              errorType: r.errorType === 'auth' ? 'server' : r.errorType
            }))} 
            onRetryFailed={handleRetryFailed}
          />

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {progress.isRunning ? 'Minimize' : 'Close'}
            </Button>
            
            {users.length > 0 && !progress.isRunning && (
              <Button onClick={handleImport} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import {users.length} Users
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

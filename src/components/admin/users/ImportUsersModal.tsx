import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, FileText, AlertCircle, Settings } from 'lucide-react';
import Papa from 'papaparse';
import { useUserImport } from '@/hooks/useUserImport';
import { ImportProgress } from './ImportProgress';
import { ImportResults } from './ImportResults';

interface ImportUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsersImported: () => void;
}

interface ImportUser {
  email: string;
  name: string;
  role?: string;
  temporaryPassword?: string;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  open,
  onOpenChange,
  onUsersImported
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedUsers, setParsedUsers] = useState<ImportUser[]>([]);
  const [parseError, setParseError] = useState<string>('');
  const [importSpeed, setImportSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [maxRetries, setMaxRetries] = useState(3);

  const {
    progress,
    results,
    isPaused,
    importUsers,
    pauseImport,
    resumeImport,
    cancelImport
  } = useUserImport();

  const downloadTemplate = () => {
    const template = [
      ['email', 'name', 'role', 'temporaryPassword'],
      ['john.doe@company.com', 'John Doe', 'job_seeker', 'TempPass123!'],
      ['jane.smith@company.com', 'Jane Smith', 'employer', ''],
      ['admin@company.com', 'Admin User', 'admin', 'AdminPass456!']
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'user-import-template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setParseError('');
    setParsedUsers([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }

        const users = results.data as any[];
        const validUsers: ImportUser[] = [];
        const errors: string[] = [];

        users.forEach((row, index) => {
          if (!row.email || !row.name) {
            errors.push(`Row ${index + 2}: Missing email or name`);
            return;
          }

          validUsers.push({
            email: row.email.toString().trim(),
            name: row.name.toString().trim(),
            role: row.role?.toString().trim() || 'job_seeker',
            temporaryPassword: row.temporaryPassword?.toString().trim() || undefined
          });
        });

        if (errors.length > 0) {
          setParseError(`Validation errors:\n${errors.join('\n')}`);
          return;
        }

        if (validUsers.length === 0) {
          setParseError('No valid users found in CSV file');
          return;
        }

        setParsedUsers(validUsers);
        console.log(`✅ Parsed ${validUsers.length} valid users from CSV`);
      },
      error: (error) => {
        setParseError(`Failed to parse CSV: ${error.message}`);
      }
    });
  }, []);

  const handleImport = async () => {
    if (parsedUsers.length === 0) {
      setParseError('No users to import');
      return;
    }

    await importUsers(parsedUsers, {
      speed: importSpeed,
      maxRetries
    });
  };

  const handleRetryFailed = async (failedUsers: any[]) => {
    const usersToRetry = failedUsers.map(result => 
      parsedUsers.find(user => user.email === result.email)
    ).filter(Boolean) as ImportUser[];

    if (usersToRetry.length > 0) {
      await importUsers(usersToRetry, {
        speed: importSpeed,
        maxRetries
      });
    }
  };

  const handleClose = () => {
    if (progress.isRunning) {
      cancelImport();
    }
    setCsvFile(null);
    setParsedUsers([]);
    setParseError('');
    onOpenChange(false);
  };

  const handleSuccess = () => {
    onUsersImported();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Need a template?</p>
                <p className="text-sm text-blue-700">Download our CSV template to get started</p>
              </div>
            </div>
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Import Settings */}
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label>Import Speed</Label>
              <Select value={importSpeed} onValueChange={(value: 'slow' | 'medium' | 'fast') => setImportSpeed(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow (3s delay) - Most reliable</SelectItem>
                  <SelectItem value="medium">Medium (1.5s delay) - Balanced</SelectItem>
                  <SelectItem value="fast">Fast (0.8s delay) - May cause timeouts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Retries</Label>
              <Select value={maxRetries.toString()} onValueChange={(value) => setMaxRetries(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 retry</SelectItem>
                  <SelectItem value="2">2 retries</SelectItem>
                  <SelectItem value="3">3 retries</SelectItem>
                  <SelectItem value="5">5 retries</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Select CSV File</Label>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {parseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-line">
                  {parseError}
                </AlertDescription>
              </Alert>
            )}

            {parsedUsers.length > 0 && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Successfully parsed {parsedUsers.length} users from CSV file.
                  {parsedUsers.length > 20 && (
                    <span className="block mt-1 text-amber-600">
                      ⚠️ Large import detected. Consider using "Slow" speed to avoid timeouts.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Progress */}
          <ImportProgress
            progress={progress}
            isPaused={isPaused}
            onPause={pauseImport}
            onResume={resumeImport}
            onCancel={cancelImport}
          />

          {/* Results */}
          <ImportResults
            results={results}
            onRetryFailed={handleRetryFailed}
          />

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={progress.isRunning}>
              {progress.isRunning ? 'Close' : 'Cancel'}
            </Button>
            {!progress.isRunning && results.length > 0 && results.some(r => r.success) && (
              <Button onClick={handleSuccess}>
                Complete Import
              </Button>
            )}
            <Button
              onClick={handleImport}
              disabled={parsedUsers.length === 0 || progress.isRunning}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {progress.isRunning ? 'Importing...' : `Import ${parsedUsers.length} Users`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

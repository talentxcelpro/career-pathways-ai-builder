import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

interface ImportUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsersImported: () => void;
}

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; email: string; error: string }>;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  isOpen,
  onClose,
  onUsersImported
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const csvTemplate = `full_name,email,role,status,send_welcome_email
John Doe,john@example.com,job_seeker,active,true
Jane Smith,jane@example.com,employer,active,false
Mike Johnson,mike@example.com,candidate,inactive,true`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setImportResult(null);
    } else {
      toast.error('Please select a valid CSV file');
      e.target.value = '';
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push({ ...row, rowNumber: i + 1 });
    }
    
    return rows;
  };

  const validateUserData = (userData: any) => {
    const errors = [];
    
    if (!userData.full_name?.trim()) {
      errors.push('Full name is required');
    }
    
    if (!userData.email?.trim() || !/\S+@\S+\.\S+/.test(userData.email)) {
      errors.push('Valid email is required');
    }
    
    const validRoles = ['candidate', 'job_seeker', 'employer', 'admin'];
    if (!validRoles.includes(userData.role)) {
      errors.push('Invalid role. Must be: candidate, job_seeker, employer, or admin');
    }
    
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(userData.status)) {
      errors.push('Invalid status. Must be: active or inactive');
    }
    
    return errors;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const callAdminFunction = async (body: any): Promise<any> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Not authenticated');
    }

    const functionUrl = `https://dthlgsnakhofinssokm.supabase.co/functions/v1/admin-create-user`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  };

  const createUser = async (userData: any) => {
    const password = generatePassword();
    
    const data = await callAdminFunction({
      email: userData.email,
      password: password,
      fullName: userData.full_name,
      role: userData.role,
      status: userData.status,
      sendWelcomeEmail: userData.send_welcome_email === 'true'
    });

    return { success: true, password, user: data.user };
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const csvText = await file.text();
      const users = parseCSV(csvText);
      
      const result: ImportResult = {
        total: users.length,
        successful: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        setProgress(((i + 1) / users.length) * 100);

        try {
          const validationErrors = validateUserData(user);
          if (validationErrors.length > 0) {
            throw new Error(validationErrors.join(', '));
          }

          await createUser(user);
          result.successful++;
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            row: user.rowNumber,
            email: user.email || 'Unknown',
            error: error.message
          });
        }
      }

      setImportResult(result);
      
      if (result.successful > 0) {
        toast.success(`Successfully imported ${result.successful} users!`);
        onUsersImported();
      }
      
      if (result.failed > 0) {
        toast.warning(`${result.failed} users failed to import. Check the results for details.`);
      }

    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Failed to process CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setImportResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Users from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Download the CSV template to format your data correctly</span>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div>
            <Label htmlFor="csvFile">Select CSV File</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing users...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                  <div className="text-sm text-blue-600">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.successful}</div>
                  <div className="text-sm text-green-600">Successful</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Import Errors:
                  </h4>
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded mb-1">
                      Row {error.row} ({error.email}): {error.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {importResult ? (
              <Button onClick={resetImport} className="flex-1">
                Import Another File
              </Button>
            ) : (
              <Button
                onClick={handleImport}
                disabled={!file || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Importing...' : 'Import Users'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
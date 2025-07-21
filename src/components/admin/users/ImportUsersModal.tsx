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
  const [showMapping, setShowMapping] = useState(false);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setImportResult(null);
      
      // Parse file to detect headers and show preview
      try {
        const csvText = await selectedFile.text();
        const { headers, rows } = parseCSV(csvText);
        
        setDetectedHeaders(headers);
        setPreviewData(rows.slice(0, 5)); // Show first 5 rows as preview
        
        // Auto-map common column variations
        const autoMapping: Record<string, string> = {};
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('name') || lowerHeader === 'full_name') {
            autoMapping[header] = 'full_name';
          } else if (lowerHeader.includes('email')) {
            autoMapping[header] = 'email';
          } else if (lowerHeader.includes('role')) {
            autoMapping[header] = 'role';
          } else if (lowerHeader.includes('status')) {
            autoMapping[header] = 'status';
          } else if (lowerHeader.includes('welcome')) {
            autoMapping[header] = 'send_welcome_email';
          }
        });
        
        setColumnMapping(autoMapping);
        setShowMapping(true);
        
      } catch (error) {
        toast.error('Failed to parse CSV file');
        console.error('CSV parsing error:', error);
      }
    } else {
      toast.error('Please select a valid CSV file');
      e.target.value = '';
    }
  };

  const detectSeparator = (csvText: string) => {
    const firstLine = csvText.split('\n')[0];
    const separators = [',', '\t', ';', '|'];
    
    let bestSeparator = ',';
    let maxColumns = 0;
    
    separators.forEach(sep => {
      const columns = firstLine.split(sep).length;
      if (columns > maxColumns) {
        maxColumns = columns;
        bestSeparator = sep;
      }
    });
    
    return bestSeparator;
  };

  const parseCSV = (csvText: string): { headers: string[]; rows: any[]; } => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const separator = detectSeparator(csvText);
    const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push({ ...row, rowNumber: i + 1 });
    }
    
    return { headers, rows };
  };

  const mapRowData = (row: any) => {
    const mappedData: any = {};
    
    Object.entries(columnMapping).forEach(([sourceCol, targetCol]) => {
      if (row[sourceCol] !== undefined) {
        mappedData[targetCol] = row[sourceCol];
      }
    });
    
    // Normalize values
    if (mappedData.status) {
      mappedData.status = mappedData.status.toLowerCase();
    }
    if (mappedData.role) {
      mappedData.role = mappedData.role.toLowerCase();
    }
    if (mappedData.send_welcome_email) {
      const value = mappedData.send_welcome_email.toLowerCase();
      mappedData.send_welcome_email = value === 'true' || value === '1' || value === 'yes';
    } else {
      mappedData.send_welcome_email = true; // Default to true
    }
    
    return mappedData;
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
    if (!userData.role || !validRoles.includes(userData.role)) {
      errors.push('Invalid role. Must be: candidate, job_seeker, employer, or admin');
    }
    
    const validStatuses = ['active', 'inactive'];
    if (!userData.status || !validStatuses.includes(userData.status)) {
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
      sendWelcomeEmail: userData.send_welcome_email === true
    });

    return { success: true, password, user: data.user };
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    // Validate that all required fields are mapped
    const requiredFields = ['full_name', 'email', 'role', 'status'];
    const missingMappings = requiredFields.filter(field => 
      !Object.values(columnMapping).includes(field)
    );
    
    if (missingMappings.length > 0) {
      toast.error(`Please map the following required fields: ${missingMappings.join(', ')}`);
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setShowMapping(false);

    try {
      const csvText = await file.text();
      const { rows } = parseCSV(csvText);
      
      const result: ImportResult = {
        total: rows.length,
        successful: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        setProgress(((i + 1) / rows.length) * 100);

        try {
          const mappedUser = mapRowData(row);
          const validationErrors = validateUserData(mappedUser);
          
          if (validationErrors.length > 0) {
            throw new Error(validationErrors.join(', '));
          }

          await createUser(mappedUser);
          result.successful++;
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            row: row.rowNumber,
            email: row[Object.keys(columnMapping).find(k => columnMapping[k] === 'email') || 'email'] || 'Unknown',
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
    setShowMapping(false);
    setDetectedHeaders([]);
    setColumnMapping({});
    setPreviewData([]);
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

          {/* Column Mapping */}
          {showMapping && detectedHeaders.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Map Your Columns</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detectedHeaders.map((header, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1/2">
                      <Label className="text-sm text-muted-foreground">
                        Your Column: <span className="font-medium text-foreground">{header}</span>
                      </Label>
                    </div>
                    <div className="w-1/2">
                      <select
                        value={columnMapping[header] || ''}
                        onChange={(e) => setColumnMapping(prev => ({
                          ...prev,
                          [header]: e.target.value
                        }))}
                        className="w-full p-2 border border-input rounded-md bg-background"
                      >
                        <option value="">-- Skip Column --</option>
                        <option value="full_name">Full Name *</option>
                        <option value="email">Email *</option>
                        <option value="role">Role *</option>
                        <option value="status">Status *</option>
                        <option value="send_welcome_email">Send Welcome Email</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {previewData.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Data Preview (first 5 rows):</h4>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          {detectedHeaders.map((header, index) => (
                            <th key={index} className="p-2 text-left border-r">
                              {header}
                              {columnMapping[header] && (
                                <div className="text-xs text-primary font-normal">
                                  → {columnMapping[header]}
                                </div>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t">
                            {detectedHeaders.map((header, colIndex) => (
                              <td key={colIndex} className="p-2 border-r max-w-32 truncate">
                                {row[header] || ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Required fields:</strong> Full Name, Email, Role, Status
                  <br />
                  <strong>Optional:</strong> Send Welcome Email (defaults to true)
                </AlertDescription>
              </Alert>
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
            ) : showMapping ? (
              <>
                <Button variant="outline" onClick={() => setShowMapping(false)} className="flex-1">
                  Back to Upload
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isProcessing || Object.values(columnMapping).filter(v => ['full_name', 'email', 'role', 'status'].includes(v)).length < 4}
                  className="flex-1"
                >
                  {isProcessing ? 'Importing...' : 'Import Users'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowMapping(true)}
                disabled={!file}
                className="flex-1"
              >
                Next: Map Columns
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
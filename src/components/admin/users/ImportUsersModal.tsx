import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Check, AlertTriangle } from 'lucide-react';

interface ImportUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsersImported: () => void;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  isOpen,
  onClose,
  onUsersImported
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mappingErrors, setMappingErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetFields = [
    { value: 'full_name', label: 'Full Name' },
    { value: 'email', label: 'Email' },
    { value: 'user_role', label: 'User Role' },
    { value: 'status', label: 'Status' },
    { value: 'send_welcome_email', label: 'Send Welcome Email' }
  ];

  const autoMapColumns = (csvHeaders: string[]) => {
    const mapping: Record<string, string> = {};
    const usedTargets = new Set<string>();
    
    csvHeaders.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      let targetField = '';
      
      // Improved auto-mapping logic
      if (normalizedHeader.includes('name') || normalizedHeader === 'full_name') {
        targetField = 'full_name';
      } else if (normalizedHeader === 'email' || normalizedHeader.includes('email_address')) {
        targetField = 'email';
      } else if (normalizedHeader.includes('role') || normalizedHeader === 'user_role') {
        targetField = 'user_role';
      } else if (normalizedHeader === 'status' || normalizedHeader.includes('account_status')) {
        targetField = 'status';
      } else if (normalizedHeader === 'send_welcome_email' || normalizedHeader.includes('welcome_email') || normalizedHeader.includes('send_email')) {
        targetField = 'send_welcome_email';
      }
      
      // Only map if target field is found and not already used
      if (targetField && !usedTargets.has(targetField)) {
        mapping[header] = targetField;
        usedTargets.add(targetField);
      }
    });
    
    return mapping;
  };

  const validateColumnMapping = (mapping: Record<string, string>) => {
    const errors: string[] = [];
    const usedTargets: Record<string, string[]> = {};
    
    // Check for duplicate target mappings
    Object.entries(mapping).forEach(([sourceCol, targetCol]) => {
      if (targetCol && targetCol !== '') {
        if (!usedTargets[targetCol]) {
          usedTargets[targetCol] = [];
        }
        usedTargets[targetCol].push(sourceCol);
      }
    });
    
    // Report duplicate mappings
    Object.entries(usedTargets).forEach(([targetCol, sourceCols]) => {
      if (sourceCols.length > 1) {
        errors.push(`Multiple columns mapped to "${targetCol}": ${sourceCols.join(', ')}`);
      }
    });
    
    // Check for required fields
    if (!usedTargets['email']) {
      errors.push('Email column mapping is required');
    }
    
    if (!usedTargets['full_name']) {
      errors.push('Full Name column mapping is required');
    }
    
    return errors;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file must contain at least a header row and one data row');
        return;
      }

      const csvHeaders = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
        const row: any = {};
        csvHeaders.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setHeaders(csvHeaders);
      setCsvData(data);
      
      // Auto-map columns and validate
      const autoMapping = autoMapColumns(csvHeaders);
      setColumnMapping(autoMapping);
      
      const errors = validateColumnMapping(autoMapping);
      setMappingErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (sourceColumn: string, targetField: string) => {
    const newMapping = { ...columnMapping };
    
    // Remove any existing mapping to this target field
    Object.keys(newMapping).forEach(key => {
      if (newMapping[key] === targetField && key !== sourceColumn) {
        newMapping[key] = '';
      }
    });
    
    newMapping[sourceColumn] = targetField;
    setColumnMapping(newMapping);
    
    // Validate new mapping
    const errors = validateColumnMapping(newMapping);
    setMappingErrors(errors);
  };

  const mapRowData = (row: any) => {
    const mappedData: any = {};
    
    Object.entries(columnMapping).forEach(([sourceCol, targetCol]) => {
      if (targetCol && row[sourceCol] !== undefined && row[sourceCol] !== null) {
        let value = row[sourceCol];
        
        // Handle string values
        if (typeof value === 'string') {
          value = value.trim();
          
          // Special handling for send_welcome_email field
          if (targetCol === 'send_welcome_email') {
            // Convert string boolean values to actual boolean
            if (value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes') {
              value = true;
            } else if (value.toLowerCase() === 'false' || value === '0' || value.toLowerCase() === 'no') {
              value = false;
            } else {
              value = Boolean(value); // Default fallback
            }
          }
        }
        
        mappedData[targetCol] = value;
      }
    });
    
    // Normalize values
    if (mappedData.status) {
      const status = mappedData.status.toString().toLowerCase();
      if (['active', 'true', '1', 'yes'].includes(status)) {
        mappedData.profile_completed = true;
      } else if (['inactive', 'false', '0', 'no'].includes(status)) {
        mappedData.profile_completed = false;
      }
    }
    
    // Set default values
    if (!mappedData.user_role) {
      mappedData.user_role = 'job_seeker';
    }
    
    if (mappedData.send_welcome_email === undefined) {
      mappedData.send_welcome_email = true;
    }

    return mappedData;
  };

  const validateUserData = (userData: any) => {
    const errors = [];
    
    if (!userData.full_name?.trim()) {
      errors.push('Full name is required');
    }
    
    if (!userData.email?.trim()) {
      errors.push('Valid email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email.toString())) {
        errors.push('Valid email is required');
      }
    }
    
    const validRoles = ['job_seeker', 'employer', 'admin', 'candidate'];
    if (userData.user_role && !validRoles.includes(userData.user_role)) {
      errors.push(`Invalid user role: ${userData.user_role}`);
    }
    
    return errors;
  };

  const handleImport = async () => {
    if (mappingErrors.length > 0) {
      toast.error('Please fix column mapping errors before importing');
      return;
    }

    setIsLoading(true);
    const results = { success: 0, errors: [] as string[] };

    try {
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];

        try {
          const mappedUser = mapRowData(row);
          const validationErrors = validateUserData(mappedUser);
          
          if (validationErrors.length > 0) {
            results.errors.push(`Row ${i + 2} (${mappedUser.email || 'No email'}): ${validationErrors.join(', ')}`);
            continue;
          }

          // Create user account
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: mappedUser.email,
            password: Math.random().toString(36).substring(2, 15),
            email_confirm: true,
          });

          if (authError) {
            results.errors.push(`Row ${i + 2} (${mappedUser.email}): ${authError.message}`);
            continue;
          }

          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: mappedUser.email,
              full_name: mappedUser.full_name,
              user_role: mappedUser.user_role,
              profile_completed: mappedUser.profile_completed ?? true,
            });

          if (profileError) {
            results.errors.push(`Row ${i + 2} (${mappedUser.email}): Failed to create profile - ${profileError.message}`);
            continue;
          }

          // Send welcome email if requested
          if (mappedUser.send_welcome_email) {
            await supabase.from('email_queue').insert({
              recipient_email: mappedUser.email,
              recipient_name: mappedUser.full_name,
              template_name: 'welcome_email',
              template_data: {
                name: mappedUser.full_name,
                login_url: `${window.location.origin}/login`
              }
            });
          }

          results.success++;
        } catch (error: any) {
          results.errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      // Show results
      if (results.success > 0) {
        toast.success(`${results.success} users imported successfully`);
      }

      if (results.errors.length > 0) {
        const errorMessage = `${results.errors.length} users failed to import. Check the results for details.`;
        toast.error(errorMessage);
        console.error('Import Errors:', results.errors);
      }

      if (results.success > 0) {
        onUsersImported();
        onClose();
      }

    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setColumnMapping({});
    setMappingErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="flex-1"
              />
              {file && (
                <Button variant="outline" size="sm" onClick={resetImport}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {file && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">File: {file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {csvData.length} rows to import
                </p>
              </div>
            )}
          </div>

          {/* Column Mapping Section */}
          {headers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Column Mapping</h3>
                {mappingErrors.length > 0 && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Mapping errors detected</span>
                  </div>
                )}
              </div>

              {mappingErrors.length > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">Mapping Errors:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                    {mappingErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {headers.map((header) => (
                  <div key={header} className="space-y-2">
                    <Label>CSV Column: <span className="font-mono">{header}</span></Label>
                    <Select
                      value={columnMapping[header] || ''}
                      onValueChange={(value) => handleMappingChange(header, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Don't import</SelectItem>
                        {targetFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Section */}
          {csvData.length > 0 && mappingErrors.length === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preview (First 3 rows)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-border rounded-lg">
                  <thead className="bg-muted">
                    <tr>
                      {targetFields.map((field) => {
                        const isMapped = Object.values(columnMapping).includes(field.value);
                        return (
                          <th key={field.value} className="px-4 py-2 text-left text-sm font-medium">
                            {field.label}
                            {isMapped && <Check className="inline h-4 w-4 ml-2 text-green-600" />}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 3).map((row, index) => {
                      const mappedRow = mapRowData(row);
                      return (
                        <tr key={index} className="border-t">
                          {targetFields.map((field) => (
                            <td key={field.value} className="px-4 py-2 text-sm">
                              {mappedRow[field.value] !== undefined ? 
                                String(mappedRow[field.value]) : 
                                '-'
                              }
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleImport} 
              disabled={isLoading || csvData.length === 0 || mappingErrors.length > 0}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isLoading ? 'Importing...' : 'Import Users'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

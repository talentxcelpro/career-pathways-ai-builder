
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { useBulkCSVImport } from '@/hooks/useBulkCSVImport';
import { ImportProgress } from './ImportProgress';

interface BulkCSVImportProps {
  onImportComplete: () => void;
}

export const BulkCSVImport: React.FC<BulkCSVImportProps> = ({ onImportComplete }) => {
  const [csvData, setCsvData] = useState('');
  const [batchSize, setBatchSize] = useState('100');
  const [importSpeed, setImportSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  
  const {
    isImporting,
    isPaused,
    progress,
    connectionStatus,
    testConnection,
    importFromCSV,
    pauseImport,
    resumeImport,
    cancelImport
  } = useBulkCSVImport();

  // Test direct function access
  const testDirectFunction = async () => {
    console.log('=== DIRECT FUNCTION TEST ===');
    try {
      const SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";
      const functionUrl = `${SUPABASE_URL}/functions/v1/bulk-csv-import`;
      console.log('Testing direct function access at:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ isTest: true })
      });
      
      console.log('Direct test response status:', response.status);
      console.log('Direct test response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Direct test successful:', result);
        toast.success('Direct function test successful! Check console for details.');
      } else {
        const errorText = await response.text();
        console.error('Direct test failed:', errorText);
        toast.error(`Direct test failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Direct test error:', error);
      toast.error(`Direct test error: ${error}`);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        setCsvData(csv);
        toast.success('CSV file loaded successfully');
      };
      reader.readAsText(file);
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

  const downloadTemplate = () => {
    const template = 'full_name,email,user_role,phone,company_name,location\nJohn Doe,john@example.com,job_seeker,+1234567890,Example Corp,New York\nJane Smith,jane@example.com,employer,+1987654321,Tech Solutions,San Francisco';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateCSV = (csvText: string): { isValid: boolean; errors: string[]; userCount: number } => {
    try {
      const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      const errors: string[] = [];
      
      if (result.errors.length > 0) {
        errors.push(...result.errors.map(e => e.message));
      }

      const requiredFields = ['full_name', 'email'];
      const headers = result.meta.fields || [];
      
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      }

      if (result.data.length === 0) {
        errors.push('CSV file contains no data rows');
      }

      return {
        isValid: errors.length === 0,
        errors,
        userCount: result.data.length
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Failed to parse CSV: ${error}`],
        userCount: 0
      };
    }
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast.error('Please provide CSV data first');
      return;
    }

    const validation = validateCSV(csvData);
    if (!validation.isValid) {
      toast.error(`CSV validation failed: ${validation.errors[0]}`);
      return;
    }

    if (validation.userCount > 10000) {
      toast.error('Maximum 10,000 users per import. Please split your data into smaller files.');
      return;
    }

    try {
      await importFromCSV(csvData, {
        batchSize: parseInt(batchSize),
        speed: importSpeed
      });
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const handleConnectionTest = async () => {
    const success = await testConnection();
    if (success) {
      toast.success('Connection test successful! Import service is ready.');
    } else {
      toast.error('Import service is unavailable. Please check the Edge Function deployment or try the direct test.');
    }
  };

  const validation = csvData ? validateCSV(csvData) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enhanced Bulk CSV Import (100-10,000 users)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Test Section */}
          <div className="flex gap-4">
            <Button onClick={handleConnectionTest} variant="outline" size="sm">
              Test Connection
            </Button>
            <Button onClick={testDirectFunction} variant="outline" size="sm">
              Direct Test
            </Button>
            <div className="flex items-center gap-2">
              {connectionStatus === 'testing' && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Testing...</span>
                </div>
              )}
              {connectionStatus === 'healthy' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Service Ready</span>
                </div>
              )}
              {connectionStatus === 'unhealthy' && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Service Unavailable</span>
                </div>
              )}
            </div>
          </div>

          {/* Template Download */}
          <div className="flex items-center gap-4">
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <span className="text-sm text-muted-foreground">
              Required fields: full_name, email. Optional: user_role, phone, company_name, location
            </span>
          </div>

          {/* File Upload */}
          <div>
            <Label>Upload CSV File</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <FileText className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p>Drop the CSV file here...</p>
              ) : (
                <div>
                  <p>Drag & drop a CSV file here, or click to select</p>
                  <p className="text-sm text-muted-foreground mt-2">Maximum 10,000 users per file</p>
                </div>
              )}
            </div>
          </div>

          {/* Manual CSV Input */}
          <div>
            <Label htmlFor="csv-data">Or Paste CSV Data</Label>
            <Textarea
              id="csv-data"
              placeholder="Paste your CSV data here..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {/* CSV Validation Results */}
          {validation && (
            <div className={`p-3 rounded ${validation.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {validation.isValid ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>CSV is valid. Found {validation.userCount} users to import.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <div>
                    <div>CSV validation errors:</div>
                    <ul className="list-disc list-inside mt-2">
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batch-size">Batch Size</Label>
              <Select value={batchSize} onValueChange={setBatchSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 users per batch</SelectItem>
                  <SelectItem value="100">100 users per batch</SelectItem>
                  <SelectItem value="200">200 users per batch</SelectItem>
                  <SelectItem value="500">500 users per batch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="import-speed">Import Speed</Label>
              <Select value={importSpeed} onValueChange={(value: 'slow' | 'medium' | 'fast') => setImportSpeed(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow (Most Reliable)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="fast">Fast (High Volume)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Import Button */}
          <Button 
            onClick={handleImport} 
            disabled={isImporting || !csvData.trim() || connectionStatus === 'unhealthy'}
            className="w-full"
          >
            {isImporting ? 'Importing...' : 'Start Enhanced Bulk Import'}
          </Button>

          {/* Debug Information */}
          <div className="text-xs text-muted-foreground space-y-1 bg-gray-50 p-3 rounded">
            <div><strong>Debug Info:</strong></div>
            <div>Supabase URL: https://dthlgsnakhoftinssokm.supabase.co</div>
            <div>Function URL: https://dthlgsnakhoftinssokm.supabase.co/functions/v1/bulk-csv-import</div>
            <div>Connection Status: {connectionStatus}</div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Display */}
      {(isImporting || progress.processed > 0) && (
        <ImportProgress
          progress={{
            ...progress,
            completed: progress.processed,
            isRunning: isImporting,
            connectionStatus: connectionStatus === 'testing' ? 'testing' : 
                           connectionStatus === 'healthy' ? 'healthy' : 
                           'unhealthy'
          }}
          isPaused={isPaused}
          onPause={pauseImport}
          onResume={resumeImport}
          onCancel={cancelImport}
        />
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBulkCSVImport } from '@/hooks/useBulkCSVImport';
import { ImportProgress } from './ImportProgress';
import { Download, Upload, AlertCircle, CheckCircle, Wifi } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BulkCSVImportProps {
  onImportComplete?: () => void;
}

export const BulkCSVImport: React.FC<BulkCSVImportProps> = ({ onImportComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importSpeed, setImportSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'healthy' | 'unhealthy'>('idle');
  
  const { isImporting, progress, importFromCSV, generateCSVTemplate, testConnection } = useBulkCSVImport();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    const isHealthy = await testConnection();
    setConnectionStatus(isHealthy ? 'healthy' : 'unhealthy');
  };

  const handleDirectFunctionTest = async () => {
    console.log('=== DIRECT FUNCTION TEST ===');
    try {
      // Test if we can reach the function directly
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
        body: JSON.stringify({ test: true })
      });
      
      console.log('Direct fetch response status:', response.status);
      console.log('Direct fetch response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Direct fetch response data:', data);
        alert('Direct function test successful! Check console for details.');
      } else {
        const errorText = await response.text();
        console.error('Direct fetch error:', errorText);
        alert(`Direct function test failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Direct function test exception:', error);
      alert(`Direct function test exception: ${error.message}`);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const batchSizes = { slow: 50, medium: 100, fast: 200 };
      const concurrency = { slow: 2, medium: 5, fast: 10 };

      await importFromCSV(selectedFile, {
        batchSize: batchSizes[importSpeed],
        maxConcurrent: concurrency[importSpeed]
      });

      onImportComplete?.();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return <Wifi className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enhanced Bulk CSV Import
          </CardTitle>
          <CardDescription>
            Import 100-10,000 users efficiently with enhanced batch processing and real-time monitoring.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Connection Status Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Service Status</Label>
            <div className="flex gap-3">
              <Button 
                onClick={handleTestConnection} 
                variant="outline" 
                size="sm"
                disabled={connectionStatus === 'testing'}
                className="flex items-center gap-2"
              >
                {getConnectionStatusIcon()}
                Test Connection
              </Button>
              <Button 
                onClick={handleDirectFunctionTest} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Wifi className="h-4 w-4" />
                Direct Test
              </Button>
            </div>
            
            {connectionStatus === 'healthy' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Import service is healthy and ready for bulk operations.
                </AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'unhealthy' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Import service is unavailable. Please check the Edge Function deployment or try the direct test.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* File Selection */}
          <div className="space-y-3">
            <Label htmlFor="csv-file" className="text-base font-medium">
              Select CSV File
            </Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Import Speed Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Import Speed</Label>
            <Select value={importSpeed} onValueChange={(value: 'slow' | 'medium' | 'fast') => setImportSpeed(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">
                  <div className="flex flex-col items-start">
                    <span>Slow (50 users/batch)</span>
                    <span className="text-xs text-muted-foreground">Most reliable, lowest server load</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex flex-col items-start">
                    <span>Medium (100 users/batch)</span>
                    <span className="text-xs text-muted-foreground">Balanced speed and reliability</span>
                  </div>
                </SelectItem>
                <SelectItem value="fast">
                  <div className="flex flex-col items-start">
                    <span>Fast (200 users/batch)</span>
                    <span className="text-xs text-muted-foreground">Fastest processing, higher server load</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={generateCSVTemplate}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            
            <Button
              onClick={handleImport}
              disabled={!selectedFile || isImporting || connectionStatus === 'unhealthy'}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Start Import'}
            </Button>
          </div>

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
      {progress && (
        <ImportProgress
          progress={{
            ...progress,
            completed: progress.processed,
            isRunning: isImporting,
            connectionStatus: connectionStatus === 'testing' ? 'testing' : 
                           connectionStatus === 'healthy' ? 'healthy' : 
                           connectionStatus === 'unhealthy' ? 'unhealthy' : undefined
          }}
          isPaused={false}
          onPause={() => {}}
          onResume={() => {}}
          onCancel={() => {}}
        />
      )}

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>CSV Format Requirements:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Required column: email</li>
            <li>• Optional columns: full_name, user_role, phone, title, location, company</li>
            <li>• First row must contain column headers</li>
            <li>• Each user must have a valid email address</li>
            <li>• Recommended batch size: 100-10,000 users for optimal performance</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

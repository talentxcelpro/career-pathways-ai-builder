
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, TestTube, Zap, Database, Users } from 'lucide-react';
import { useBulkCSVImport } from '@/hooks/useBulkCSVImport';
import { ImportProgress } from './ImportProgress';
import { useDropzone } from 'react-dropzone';

interface BulkCSVImportProps {
  onImportComplete?: () => void;
}

export const BulkCSVImport: React.FC<BulkCSVImportProps> = ({ onImportComplete }) => {
  const [csvData, setCsvData] = useState('');
  const [importSpeed, setImportSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [batchSize, setBatchSize] = useState(50);
  
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setCsvData(text);
        };
        reader.readAsText(file);
      }
    }
  });

  const handleImport = async () => {
    if (!csvData.trim()) {
      alert('Please provide CSV data or upload a file');
      return;
    }

    try {
      await importFromCSV(csvData, {
        batchSize,
        speed: importSpeed
      });
      onImportComplete?.();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const downloadTemplate = () => {
    const template = `email,full_name,user_role,password
john.doe@example.com,John Doe,job_seeker,
jane.smith@company.com,Jane Smith,employer,
alice.wilson@example.com,Alice Wilson,job_seeker,`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-500" />
            Enhanced Bulk CSV Import (100-10,000 users)
          </h2>
          <p className="text-muted-foreground mt-1">
            Efficiently import large numbers of users with advanced batch processing
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testConnection} variant="outline" size="sm">
            <TestTube className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
        </div>
      </div>

      {/* CSV Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CSV Data Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p>Drop the CSV file here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop a CSV file here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV, XLS, and XLSX files
                </p>
              </div>
            )}
          </div>

          {/* Manual CSV Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Or paste your CSV data directly:
            </label>
            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="email,full_name,user_role&#10;john@example.com,John Doe,job_seeker&#10;jane@company.com,Jane Smith,employer"
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* CSV Info */}
          {csvData && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Users className="h-4 w-4" />
                <span className="font-medium">
                  CSV Data Ready ({csvData.split('\n').filter(line => line.trim()).length - 1} rows detected)
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                First row will be treated as headers. Make sure your CSV includes: email (required), full_name, user_role
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Import Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Import Speed</label>
              <Select value={importSpeed} onValueChange={(value: any) => setImportSpeed(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow (Most Reliable)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="fast">Fast (High Performance)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {importSpeed === 'slow' && 'Conservative approach, best for critical imports'}
                {importSpeed === 'medium' && 'Balanced speed and reliability'}
                {importSpeed === 'fast' && 'Optimized for high volume imports (1K+ users)'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Batch Size</label>
              <Select value={batchSize.toString()} onValueChange={(value) => setBatchSize(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 users per batch</SelectItem>
                  <SelectItem value="50">50 users per batch</SelectItem>
                  <SelectItem value="100">100 users per batch</SelectItem>
                  <SelectItem value="200">200 users per batch</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Larger batches = faster imports, but higher memory usage
              </p>
            </div>
          </div>

          <Button 
            onClick={handleImport} 
            disabled={!csvData.trim() || isImporting}
            className="w-full"
            size="lg"
          >
            {isImporting ? 'Importing...' : 'Start Enhanced Bulk Import'}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Display */}
      <ImportProgress
        progress={{
          total: progress.total,
          completed: progress.processed,
          successful: progress.successful,
          failed: progress.failed,
          currentUser: undefined,
          isRunning: isImporting,
          connectionStatus: connectionStatus,
          processingTimeMs: progress.totalTime,
          usersPerSecond: progress.usersPerSecond
        }}
        isPaused={isPaused}
        onPause={pauseImport}
        onResume={resumeImport}
        onCancel={cancelImport}
      />

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines & Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ CSV Format Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>email</strong> - Required, must be unique</li>
                <li>• <strong>full_name</strong> - User's display name</li>
                <li>• <strong>user_role</strong> - 'job_seeker' or 'employer'</li>
                <li>• <strong>password</strong> - Optional, auto-generated if blank</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">🚀 Performance Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use 'Fast' speed for 1K+ users</li>
                <li>• Increase batch size for better throughput</li>
                <li>• Monitor system resources during large imports</li>
                <li>• Split extremely large files (50K+) into sessions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

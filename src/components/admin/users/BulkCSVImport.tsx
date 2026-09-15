
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useBulkCSVImport } from '@/hooks/useBulkCSVImport';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { ImportProgress } from '@/components/admin/users/ImportProgress';
import { 
  Upload, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Zap,
  Clock,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkCSVImportProps {
  onImportComplete: () => void;
}

export const BulkCSVImport: React.FC<BulkCSVImportProps> = ({ onImportComplete }) => {
  const [csvData, setCsvData] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [batchSize, setBatchSize] = useState(50);
  const [importSpeed, setImportSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [parsedRowCount, setParsedRowCount] = useState(0);

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

  const handleFileDrop = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!['csv', 'xls', 'xlsx'].includes(fileExtension || '')) {
        toast.error('Please select a CSV, XLS, or XLSX file');
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
        
        // Count rows (excluding header)
        const lines = content.split('\n').filter(line => line.trim());
        setParsedRowCount(Math.max(0, lines.length - 1));
      };
      reader.readAsText(file);
    }
  }, []);

  const { dragActive, handleDrag, handleDrop } = useDragAndDrop(handleFileDrop);

  const handleTextareaChange = (value: string) => {
    setCsvData(value);
    setSelectedFile(null);
    
    // Count rows for pasted data
    const lines = value.split('\n').filter(line => line.trim());
    setParsedRowCount(Math.max(0, lines.length - 1));
  };

  const validateCsvData = (): boolean => {
    if (!csvData.trim()) {
      toast.error('Please provide CSV data or select a file');
      return false;
    }

    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      toast.error('CSV must contain at least a header row and one data row');
      return false;
    }

    const header = lines[0].toLowerCase();
    if (!header.includes('email')) {
      toast.error('CSV must contain an "email" column');
      return false;
    }

    return true;
  };

  const handleImport = async () => {
    if (!validateCsvData()) return;

    try {
      await importFromCSV(csvData, {
        batchSize,
        maxConcurrent: importSpeed === 'fast' ? 5 : importSpeed === 'medium' ? 3 : 2,
        speed: importSpeed
      });
      
      onImportComplete();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleTestConnection = async () => {
    try {
      const success = await testConnection();
      if (success) {
        toast.success('Connection test successful!');
      } else {
        toast.error('Connection test failed. Please check the Edge Function deployment.');
      }
    } catch (error) {
      toast.error('Connection test failed');
    }
  };

  const downloadTemplate = () => {
    const template = 'email,full_name,user_role,password\njohn.doe@example.com,John Doe,job_seeker,TempPass123!\njane.smith@example.com,Jane Smith,employer,SecurePass456!';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Bulk CSV Import (100-10,000 users)</h2>
          <p className="text-muted-foreground">Efficiently import large numbers of users with advanced batch processing</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleTestConnection}
            variant="outline"
            disabled={connectionStatus === 'testing'}
          >
            {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus !== 'unhealthy' && (
        <Alert className={connectionStatus === 'healthy' ? 'border-green-500' : 'border-blue-500'}>
          <CheckCircle className={`h-4 w-4 ${connectionStatus === 'healthy' ? 'text-green-500' : 'text-blue-500'}`} />
          <AlertDescription>
            {connectionStatus === 'healthy' ? 'Connection healthy' : 'Testing connection...'}
          </AlertDescription>
        </Alert>
      )}

      {/* CSV Data Input */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Data Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={(e) => handleFileDrop(e.target.files)}
              className="hidden"
            />
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              {selectedFile ? selectedFile.name : 'Drag & drop a CSV file here, or click to select'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports CSV, XLS, and XLSX files</p>
          </div>

          {/* Text Input */}
          <div>
            <p className="text-sm font-medium mb-2">Or paste your CSV data directly:</p>
            <Textarea
              value={csvData}
              onChange={(e) => handleTextareaChange(e.target.value)}
              placeholder="email,full_name,user_role,password&#10;john.doe@example.com,John Doe,job_seeker,TempPass123!"
              className="min-h-[120px] font-mono text-sm"
            />
          </div>

          {/* Data Status */}
          {parsedRowCount > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>CSV Data Ready ({parsedRowCount} rows detected)</strong>
                <br />
                First row will be treated as headers. Make sure your CSV includes: email (required), full_name, user_role
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Import Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Import Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Speed Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Import Speed</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'slow', icon: Shield, label: 'Slow (Conservative)', desc: 'Maximum reliability, slower processing' },
                { value: 'medium', icon: Clock, label: 'Medium (Balanced)', desc: 'Balanced speed and reliability' },
                { value: 'fast', icon: Zap, label: 'Fast (Optimized)', desc: 'Maximum speed for large imports' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setImportSpeed(option.value as typeof importSpeed)}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    importSpeed === option.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <option.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Batch Size */}
          <div>
            <label className="text-sm font-medium mb-2 block">Batch Size</label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={25}>25 users per batch</option>
              <option value={50}>50 users per batch</option>
              <option value={100}>100 users per batch</option>
              <option value={200}>200 users per batch</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Larger batches = faster imports, but higher memory usage
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Import Button */}
      <Button
        onClick={handleImport}
        disabled={!csvData.trim() || isImporting || parsedRowCount === 0}
        className="w-full"
        size="lg"
      >
        {isImporting ? 'Importing...' : 'Start Enhanced Bulk Import'}
      </Button>

      {/* Import Progress */}
      <ImportProgress
        progress={{
          ...progress,
          isRunning: isImporting,
          connectionStatus,
          completed: progress.processed,
          processedBatches: progress.batchNumber,
          totalBatches: Math.ceil(progress.total / batchSize),
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
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-green-600 mb-2">✅ CSV Format Requirements</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>email</strong> - Required, must be unique</li>
              <li>• <strong>full_name</strong> - User's display name</li>
              <li>• <strong>user_role</strong> - 'job_seeker' or 'employer'</li>
              <li>• <strong>password</strong> - Optional, auto-generated if blank</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-600 mb-2">🚀 Performance Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use 'Fast' speed for 1K+ users</li>
              <li>• Increase batch size for better throughput</li>
              <li>• Monitor system resources during large imports</li>
              <li>• Split extremely large files (50K+) into sessions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

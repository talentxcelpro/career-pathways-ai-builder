import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Users } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ImportUploader() {
  const [uploading, setUploading] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      if (!batchName) {
        setBatchName(`Import ${new Date().toLocaleDateString()}`);
      }
    }
  }, [batchName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file || !batchName.trim()) {
      toast.error('Please provide a batch name and select a file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      const fileName = `bulk-imports/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bulk-imports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Create import batch record
      const { data: batch, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          batch_name: batchName,
          file_url: fileName,
          status: 'pending',
          total_records: 0,
          processed_records: 0
        })
        .select()
        .single();

      if (batchError) throw batchError;

      setUploadProgress(75);

      // Trigger processing edge function
      const { error: functionError } = await supabase.functions.invoke('bulk-import-handler', {
        body: { batch_id: batch.id, file_url: fileName }
      });

      if (functionError) throw functionError;

      setUploadProgress(100);
      toast.success('Import batch created successfully! Processing has started.');
      
      // Reset form
      setFile(null);
      setBatchName('');
      setUploadProgress(0);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'name,email,designation,current_company,linkedin_url\n' +
      'John Doe,john@example.com,Software Engineer,TechCorp,https://linkedin.com/in/johndoe\n' +
      'Jane Smith,jane@example.com,Marketing Manager,MarketCo,\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Required columns:</strong> name, email<br />
          <strong>Optional columns:</strong> designation, current_company, linkedin_url
        </AlertDescription>
      </Alert>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Upload a CSV file with user data for bulk import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Batch Name */}
          <div className="space-y-2">
            <Label htmlFor="batchName">Batch Name</Label>
            <Input
              id="batchName"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g., Q1 2025 Leads"
            />
          </div>

          {/* File Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {file ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mt-2" />
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium mb-1">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a CSV file here'}
                </p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
              </div>
            )}
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!file || !batchName.trim() || uploading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Start Import'}
            </Button>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground">Batches Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground">Records Imported</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X,
  Download,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useBulkUpload } from '@/hooks/useBulkUpload';

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedData?: any;
  error?: string;
}

export const BulkUploadManager = () => {
  const [batchName, setBatchName] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { uploadBatch, processCVFile, getBatchStatus } = useBulkUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`${acceptedFiles.length} files added to upload queue`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const startProcessing = async () => {
    if (!batchName.trim()) {
      toast.error('Please enter a batch name');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please add some files to upload');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create batch record
      const batchId = await uploadBatch.mutateAsync({
        batchName,
        totalFiles: uploadedFiles.length
      });

      // Process files one by one
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'processing', progress: 0 }
              : f
          )
        );

        try {
          const result = await processCVFile.mutateAsync({
            file: file.file,
            batchId
          });

          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { 
                    ...f, 
                    status: 'completed', 
                    progress: 100,
                    extractedData: result.extractedData
                  }
                : f
            )
          );

        } catch (error: any) {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { 
                    ...f, 
                    status: 'error', 
                    progress: 0,
                    error: error.message || 'Processing failed'
                  }
                : f
            )
          );
        }

        // Update progress
        const progressPercent = ((i + 1) / uploadedFiles.length) * 100;
      }

      toast.success('Batch processing completed!');
      
    } catch (error: any) {
      toast.error('Failed to process batch: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'processing':
        return <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: UploadedFile['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      processing: 'default',
      completed: 'secondary',
      error: 'destructive'
    };
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const completedFiles = uploadedFiles.filter(f => f.status === 'completed').length;
  const errorFiles = uploadedFiles.filter(f => f.status === 'error').length;
  const overallProgress = uploadedFiles.length > 0 ? (completedFiles / uploadedFiles.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Batch Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="batchName">Batch Name</Label>
          <Input
            id="batchName"
            placeholder="e.g., Software Developers Q1 2024"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-2">
          <Label>Processing Status</Label>
          <div className="flex items-center space-x-2">
            <Progress value={overallProgress} className="flex-1" />
            <span className="text-sm text-muted-foreground">
              {completedFiles}/{uploadedFiles.length}
            </span>
          </div>
        </div>
      </div>

      {/* File Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the CV files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  Drag & drop CV files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX (max 10MB each)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upload Queue ({uploadedFiles.length} files)</CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={startProcessing}
                disabled={isProcessing || uploadedFiles.length === 0}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Start Processing
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setUploadedFiles([])}
                disabled={isProcessing}
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(file.status)}
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {getStatusBadge(file.status)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'completed' && file.extractedData && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {file.status === 'error' && file.error && (
                      <span className="text-xs text-red-600" title={file.error}>
                        Error
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                      disabled={isProcessing}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{completedFiles}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{errorFiles}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {uploadedFiles.length - completedFiles - errorFiles}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Upload CVs</h3>
              <p className="text-sm text-muted-foreground">
                Drag & drop multiple CV files in PDF or Word format
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. AI Processing</h3>
              <p className="text-sm text-muted-foreground">
                Extract data and create structured profiles automatically
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Generate Profiles</h3>
              <p className="text-sm text-muted-foreground">
                Create SEO-optimized public profiles for each candidate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
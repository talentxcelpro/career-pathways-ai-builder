import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, 
  FolderOpen, 
  Settings, 
  Database,
  Zap,
  Shield,
  Target,
  Clock
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UploadConfig {
  batchName: string;
  batchSize: number;
  concurrentProcessing: number;
  priority: 'low' | 'medium' | 'high';
  enableValidation: boolean;
  enableDeduplication: boolean;
  autoGenerateProfiles: boolean;
  enableSeoOptimization: boolean;
  notificationEmail: string;
}

export const ScalableUploadInterface = () => {
  const [uploadConfig, setUploadConfig] = useState<UploadConfig>({
    batchName: '',
    batchSize: 2000,
    concurrentProcessing: 5,
    priority: 'medium',
    enableValidation: true,
    enableDeduplication: true,
    autoGenerateProfiles: true,
    enableSeoOptimization: true,
    notificationEmail: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  // Calculate processing estimates
  const calculateEstimates = useCallback(() => {
    const filesPerMinute = uploadConfig.concurrentProcessing * 12; // ~5s per file
    const totalMinutes = uploadedFiles.length / filesPerMinute;
    setEstimatedTime(totalMinutes);
  }, [uploadedFiles.length, uploadConfig.concurrentProcessing]);

  React.useEffect(() => {
    calculateEstimates();
  }, [calculateEstimates]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file types and sizes
    const validFiles = acceptedFiles.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Unsupported file type`);
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error(`${file.name}: File too large (max 10MB)`);
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} files added to queue`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    }
  });

  // Start scalable upload process
  const startUpload = useMutation({
    mutationFn: async () => {
      if (!uploadConfig.batchName.trim()) {
        throw new Error('Please enter a batch name');
      }
      
      if (uploadedFiles.length === 0) {
        throw new Error('Please add files to upload');
      }

      // Validate configuration
      if (uploadedFiles.length > 50000 && uploadConfig.concurrentProcessing > 3) {
        throw new Error('For large uploads (>50k files), use max 3 concurrent processes');
      }

      const { data, error } = await supabase.functions.invoke('start-scalable-upload', {
        body: {
          config: uploadConfig,
          totalFiles: uploadedFiles.length,
          estimatedDuration: estimatedTime
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Upload started! Session ID: ${data.sessionId}`);
      // Start file upload process
      uploadFiles(data.sessionId);
    },
    onError: (error: any) => {
      toast.error(`Failed to start upload: ${error.message}`);
    }
  });

  const uploadFiles = async (sessionId: string) => {
    const batches = [];
    for (let i = 0; i < uploadedFiles.length; i += uploadConfig.batchSize) {
      batches.push(uploadedFiles.slice(i, i + uploadConfig.batchSize));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      try {
        const formData = new FormData();
        formData.append('sessionId', sessionId);
        formData.append('batchIndex', batchIndex.toString());
        formData.append('config', JSON.stringify(uploadConfig));
        
        batch.forEach((file, index) => {
          formData.append(`files`, file);
        });

        const { data, error } = await supabase.functions.invoke('upload-file-batch', {
          body: formData
        });

        if (error) throw error;
        
        toast.success(`Batch ${batchIndex + 1}/${batches.length} uploaded successfully`);
        
      } catch (error: any) {
        toast.error(`Batch ${batchIndex + 1} failed: ${error.message}`);
      }
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getRecommendedSettings = () => {
    const fileCount = uploadedFiles.length;
    
    if (fileCount < 1000) {
      return {
        batchSize: Math.min(500, fileCount),
        concurrentProcessing: 5,
        priority: 'high' as const
      };
    } else if (fileCount < 10000) {
      return {
        batchSize: 1000,
        concurrentProcessing: 4,
        priority: 'medium' as const
      };
    } else if (fileCount < 50000) {
      return {
        batchSize: 2000,
        concurrentProcessing: 3,
        priority: 'medium' as const
      };
    } else {
      return {
        batchSize: 5000,
        concurrentProcessing: 2,
        priority: 'low' as const
      };
    }
  };

  const applyRecommendedSettings = () => {
    const recommended = getRecommendedSettings();
    setUploadConfig(prev => ({
      ...prev,
      ...recommended
    }));
    toast.success('Applied recommended settings for optimal performance');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">File Upload</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Scalable CV Upload (Optimized for 200k+ files)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Batch Name */}
              <div className="space-y-2">
                <Label htmlFor="batchName">Batch Name *</Label>
                <Input
                  id="batchName"
                  placeholder="e.g., Q1_2024_Software_Engineers"
                  value={uploadConfig.batchName}
                  onChange={(e) => setUploadConfig(prev => ({ ...prev, batchName: e.target.value }))}
                />
              </div>

              {/* File Drop Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-lg">Drop the CV files here...</p>
                ) : (
                  <div>
                    <p className="text-lg mb-2">
                      Drag & drop CV files here, or click to select
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports: PDF, DOC, DOCX, TXT • Max 10MB each • Optimized for bulk processing
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Summary */}
              {uploadedFiles.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{uploadedFiles.length}</p>
                        <p className="text-xs text-blue-700">Files Ready</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{formatTime(estimatedTime)}</p>
                        <p className="text-xs text-blue-700">Est. Time</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.ceil(uploadedFiles.length / uploadConfig.batchSize)}
                        </p>
                        <p className="text-xs text-blue-700">Batches</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{uploadConfig.concurrentProcessing}</p>
                        <p className="text-xs text-blue-700">Parallel Jobs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setUploadedFiles([])}
                    disabled={uploadedFiles.length === 0}
                  >
                    Clear All
                  </Button>
                  {uploadedFiles.length > 1000 && (
                    <Button
                      variant="ghost"
                      onClick={applyRecommendedSettings}
                      className="gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Apply Recommended Settings
                    </Button>
                  )}
                </div>
                
                <Button
                  onClick={() => startUpload.mutate()}
                  disabled={startUpload.isPending || uploadedFiles.length === 0 || !uploadConfig.batchName.trim()}
                  className="gap-2"
                  size="lg"
                >
                  {startUpload.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Starting Upload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Start Scalable Upload
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Processing Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Select 
                    value={uploadConfig.batchSize.toString()} 
                    onValueChange={(value) => setUploadConfig(prev => ({ ...prev, batchSize: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">500 (Small batches)</SelectItem>
                      <SelectItem value="1000">1,000 (Balanced)</SelectItem>
                      <SelectItem value="2000">2,000 (Standard)</SelectItem>
                      <SelectItem value="5000">5,000 (Large batches)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concurrent">Concurrent Processing</Label>
                  <Select 
                    value={uploadConfig.concurrentProcessing.toString()} 
                    onValueChange={(value) => setUploadConfig(prev => ({ ...prev, concurrentProcessing: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (Conservative)</SelectItem>
                      <SelectItem value="2">2 (Safe)</SelectItem>
                      <SelectItem value="3">3 (Balanced)</SelectItem>
                      <SelectItem value="5">5 (Aggressive)</SelectItem>
                      <SelectItem value="8">8 (Maximum)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Processing Priority</Label>
                  <Select 
                    value={uploadConfig.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => setUploadConfig(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Background)</SelectItem>
                      <SelectItem value="medium">Medium (Standard)</SelectItem>
                      <SelectItem value="high">High (Urgent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Notification Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@company.com"
                    value={uploadConfig.notificationEmail}
                    onChange={(e) => setUploadConfig(prev => ({ ...prev, notificationEmail: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Processing Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validation"
                    checked={uploadConfig.enableValidation}
                    onCheckedChange={(checked) => setUploadConfig(prev => ({ ...prev, enableValidation: !!checked }))}
                  />
                  <Label htmlFor="validation">Enable Data Validation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deduplication"
                    checked={uploadConfig.enableDeduplication}
                    onCheckedChange={(checked) => setUploadConfig(prev => ({ ...prev, enableDeduplication: !!checked }))}
                  />
                  <Label htmlFor="deduplication">Enable Duplicate Detection</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="profiles"
                    checked={uploadConfig.autoGenerateProfiles}
                    onCheckedChange={(checked) => setUploadConfig(prev => ({ ...prev, autoGenerateProfiles: !!checked }))}
                  />
                  <Label htmlFor="profiles">Auto-Generate Profiles</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="seo"
                    checked={uploadConfig.enableSeoOptimization}
                    onCheckedChange={(checked) => setUploadConfig(prev => ({ ...prev, enableSeoOptimization: !!checked }))}
                  />
                  <Label htmlFor="seo">SEO-Optimized Public Pages</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <h3 className="font-semibold mb-2">Storage Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic file compression and intelligent storage allocation for optimal performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="font-semibold mb-2">AI Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced ML models for accurate data extraction and profile generation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                <h3 className="font-semibold mb-2">Queue Management</h3>
                <p className="text-sm text-muted-foreground">
                  Intelligent job scheduling and resource allocation for maximum throughput
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">For 1-10k files:</h4>
                  <p className="text-sm text-blue-700">Use batch size 500-1000, concurrent processing 5, high priority</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">For 10-50k files:</h4>
                  <p className="text-sm text-green-700">Use batch size 1000-2000, concurrent processing 3-4, medium priority</p>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800">For 50-200k files:</h4>
                  <p className="text-sm text-orange-700">Use batch size 2000-5000, concurrent processing 2-3, low priority</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
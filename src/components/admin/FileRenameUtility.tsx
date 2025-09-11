import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileItem {
  name: string;
  bucket: string;
  oldPath: string;
  newPath?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export const FileRenameUtility: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const scanForOldFiles = async () => {
    setLoading(true);
    try {
      const buckets = ['avatars', 'post-media', 'documents', 'resumes', 'media', 'portfolio'];
      const oldFiles: FileItem[] = [];

      for (const bucket of buckets) {
        const { data: fileList, error } = await supabase.storage
          .from(bucket)
          .list('', { limit: 1000 });

        if (error) {
          console.error(`Error listing files in ${bucket}:`, error);
          continue;
        }

        if (fileList) {
          // Recursively scan folders
          for (const item of fileList) {
            if (item.name.includes('/')) {
              const { data: subFiles } = await supabase.storage
                .from(bucket)
                .list(item.name, { limit: 1000 });
              
              if (subFiles) {
                subFiles.forEach(file => {
                  const fullPath = `${item.name}/${file.name}`;
                  // Check if file doesn't follow TalentXcel convention
                  if (!file.name.startsWith('talentxcel_')) {
                    oldFiles.push({
                      name: file.name,
                      bucket,
                      oldPath: fullPath,
                      status: 'pending'
                    });
                  }
                });
              }
            } else {
              // Check root level files
              if (!item.name.startsWith('talentxcel_')) {
                oldFiles.push({
                  name: item.name,
                  bucket,
                  oldPath: item.name,
                  status: 'pending'
                });
              }
            }
          }
        }
      }

      setFiles(oldFiles);
      toast.success(`Found ${oldFiles.length} files that need renaming`);
    } catch (error: any) {
      console.error('Error scanning files:', error);
      toast.error('Failed to scan files: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateNewFileName = (oldPath: string, bucket: string): string => {
    const pathParts = oldPath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const fileExt = fileName.split('.').pop();
    const userId = pathParts[0]; // Assuming user ID is the first part of the path
    const timestamp = Date.now();
    
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const typeMap: Record<string, string> = {
      'avatars': 'avatar',
      'post-media': 'postmedia',
      'documents': 'document',
      'resumes': 'resume',
      'media': 'media',
      'portfolio': 'portfolio'
    };
    
    const fileType = typeMap[bucket] || 'file';
    return `${userId}/talentxcel_${fileType}_${userId}_${timestamp}_${sanitizedFileName}`;
  };

  const renameFiles = async () => {
    setRenaming(true);
    setProgress({ current: 0, total: files.length });
    
    const updatedFiles = [...files];
    
    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];
      file.status = 'processing';
      setFiles([...updatedFiles]);
      
      try {
        // Generate new file name
        const newPath = generateNewFileName(file.oldPath, file.bucket);
        file.newPath = newPath;
        
        // Copy file to new location with new name
        const { data: copyData, error: copyError } = await supabase.storage
          .from(file.bucket)
          .copy(file.oldPath, newPath);
          
        if (copyError) throw copyError;
        
        // Delete old file
        const { error: deleteError } = await supabase.storage
          .from(file.bucket)
          .remove([file.oldPath]);
          
        if (deleteError) {
          console.warn('Failed to delete old file:', deleteError);
        }
        
        file.status = 'completed';
        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        
      } catch (error: any) {
        console.error(`Error renaming file ${file.oldPath}:`, error);
        file.status = 'error';
        file.error = error.message;
      }
      
      setFiles([...updatedFiles]);
    }
    
    setRenaming(false);
    toast.success('File renaming process completed');
  };

  const getStatusBadge = (status: FileItem['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, color: 'text-gray-600', icon: null },
      processing: { variant: 'default' as const, color: 'text-blue-600', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      completed: { variant: 'default' as const, color: 'text-green-600', icon: <CheckCircle className="h-3 w-3" /> },
      error: { variant: 'destructive' as const, color: 'text-red-600', icon: <AlertTriangle className="h-3 w-3" /> }
    };
    
    const config = variants[status];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          File Rename Utility - TalentXcel Convention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This utility will rename existing files to follow the TalentXcel naming convention: 
            <code className="mx-1 px-1 py-0.5 bg-muted rounded">talentxcel_[type]_[userId]_[timestamp]_[filename]</code>
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button 
            onClick={scanForOldFiles} 
            disabled={loading || renaming}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <RefreshCw className="h-4 w-4" />
            Scan for Old Files
          </Button>
          
          {files.length > 0 && (
            <Button 
              onClick={renameFiles} 
              disabled={renaming || files.every(f => f.status === 'completed')}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {renaming && <Loader2 className="h-4 w-4 animate-spin" />}
              Rename {files.filter(f => f.status === 'pending').length} Files
            </Button>
          )}
        </div>

        {renaming && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h3 className="font-medium text-sm text-muted-foreground">
              Files to Rename ({files.length})
            </h3>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{file.bucket}</Badge>
                    {getStatusBadge(file.status)}
                  </div>
                  <p className="text-sm font-mono truncate text-muted-foreground">
                    {file.oldPath}
                  </p>
                  {file.newPath && (
                    <p className="text-xs font-mono truncate text-green-600 mt-1">
                      → {file.newPath}
                    </p>
                  )}
                  {file.error && (
                    <p className="text-xs text-red-600 mt-1">
                      Error: {file.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Click "Scan for Old Files" to find files that need renaming</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
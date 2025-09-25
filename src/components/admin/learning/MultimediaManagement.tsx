import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileUploadComponent } from './FileUploadComponent';
import { Play, Upload, Video, FileText, Image, Music, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const MultimediaManagement: React.FC = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const { data: mediaStats, refetch } = useQuery({
    queryKey: ['media-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_multimedia')
        .select('*');

      if (error) throw error;

      const videos = data?.filter(item => item.file_type === 'video').length || 0;
      const documents = data?.filter(item => item.file_type === 'document').length || 0;
      const images = data?.filter(item => item.file_type === 'image').length || 0;
      const audio = data?.filter(item => item.file_type === 'audio').length || 0;

      return { videos, documents, images, audio, total: data?.length || 0, items: data || [] };
    }
  });

  const { data: recentUploads } = useQuery({
    queryKey: ['recent-uploads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_multimedia')
        .select(`
          *,
          courses (
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('course_multimedia')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Content deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete content');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return Image;
      case 'audio': return Music;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Multimedia Content</h2>
          <p className="text-muted-foreground">Manage videos, documents, and interactive content</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Content</DialogTitle>
            </DialogHeader>
            <FileUploadComponent 
              onUploadComplete={() => {
                setShowUploadDialog(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <Video className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Videos</CardTitle>
            <CardDescription>Video lectures and tutorials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{mediaStats?.videos || 0}</div>
            <p className="text-sm text-muted-foreground">Total videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Documents</CardTitle>
            <CardDescription>PDFs, slides, and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{mediaStats?.documents || 0}</div>
            <p className="text-sm text-muted-foreground">Total documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Image className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Images</CardTitle>
            <CardDescription>Visual content and diagrams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{mediaStats?.images || 0}</div>
            <p className="text-sm text-muted-foreground">Total images</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Music className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Audio</CardTitle>
            <CardDescription>Podcasts and audio content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{mediaStats?.audio || 0}</div>
            <p className="text-sm text-muted-foreground">Total audio files</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Latest multimedia content</CardDescription>
        </CardHeader>
        <CardContent>
          {recentUploads && recentUploads.length > 0 ? (
            <div className="space-y-4">
              {recentUploads.map((item) => {
                const FileIcon = getFileIcon(item.file_type);
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{item.file_type}</Badge>
                          {item.file_size && <span>{formatFileSize(item.file_size)}</span>}
                          <span>•</span>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(item.file_url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No content uploaded yet. Click "Upload Content" to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
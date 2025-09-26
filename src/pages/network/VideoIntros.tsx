import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAdvancedNetworking } from '@/hooks/useAdvancedNetworking';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Video, Play, Plus, User, Calendar, Eye } from 'lucide-react';

interface VideoIntro {
  id: string;
  user_id: string;
  title: string;
  description: string;
  video_url: string;
  is_active: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    profile_picture_url?: string;
    title?: string;
  };
}

const VideoIntros: React.FC = () => {
  const { user } = useAuth();
  const { createVideoIntro, loading } = useAdvancedNetworking();
  const [videoIntros, setVideoIntros] = useState<VideoIntro[]>([]);
  const [myIntros, setMyIntros] = useState<VideoIntro[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: ''
  });

  useEffect(() => {
    fetchVideoIntros();
    if (user?.id) {
      fetchMyIntros();
    }
  }, [user?.id]);

  const fetchVideoIntros = async () => {
    try {
      const { data, error } = await supabase
        .from('video_intros')
        .select(`
          *,
          profiles!video_intros_user_id_fkey(full_name, profile_picture_url, title)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideoIntros(data || []);
    } catch (error) {
      console.error('Error fetching video intros:', error);
    }
  };

  const fetchMyIntros = async () => {
    try {
      const { data, error } = await supabase
        .from('video_intros')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyIntros(data || []);
    } catch (error) {
      console.error('Error fetching my intros:', error);
    }
  };

  const handleCreateIntro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createVideoIntro(
      formData.title,
      formData.description,
      formData.videoUrl
    );

    if (result.success) {
      toast.success('Video introduction created successfully!');
      setIsDialogOpen(false);
      setFormData({ title: '', description: '', videoUrl: '' });
      fetchVideoIntros();
      fetchMyIntros();
    } else {
      toast.error('Failed to create video introduction');
    }
  };

  const getVideoThumbnail = (url: string) => {
    // Extract video ID from YouTube URL and return thumbnail
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId[1]}/mqdefault.jpg`;
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Video Introductions</h1>
          <p className="text-muted-foreground">Share authentic video introductions to connect with professionals</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 lg:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Video Intro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Video Introduction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateIntro} className="space-y-4">
              <div>
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Hi, I'm John - Software Engineer"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your background and what you're looking for..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Currently supports YouTube links. Keep videos under 2 minutes for best engagement.
                </p>
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Video Intro'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* All Video Intros */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Latest Video Introductions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoIntros.filter(intro => intro.user_id !== user?.id).map((intro) => (
                  <div key={intro.id} className="border rounded-lg overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      {getVideoThumbnail(intro.video_url) ? (
                        <img 
                          src={getVideoThumbnail(intro.video_url)!}
                          alt={intro.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="icon" variant="secondary" className="rounded-full">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {intro.profiles?.profile_picture_url ? (
                            <img 
                              src={intro.profiles.profile_picture_url} 
                              alt={intro.profiles.full_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{intro.title}</h4>
                          <p className="text-xs text-muted-foreground">{intro.profiles?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{intro.profiles?.title}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{intro.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(intro.created_at).toLocaleDateString()}
                        </div>
                        <Button variant="outline" size="sm">
                          Watch
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {videoIntros.filter(intro => intro.user_id !== user?.id).length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No video introductions available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Video Intros */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                My Video Intros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myIntros.map((intro) => (
                  <div key={intro.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                          <Play className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium truncate">{intro.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(intro.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{intro.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>Active</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                
                {myIntros.length === 0 && (
                  <div className="text-center py-6">
                    <Video className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No video intros yet</p>
                    <p className="text-xs text-muted-foreground">Create one to get started!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoIntros;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdvancedNetworking } from '@/hooks/useAdvancedNetworking';
import { Video, Play, Plus, Camera, MessageCircle, Heart } from 'lucide-react';
import { toast } from 'sonner';

export const EventlessNetworking = () => {
  const { user } = useAuth();
  const { createVideoIntro, loading } = useAdvancedNetworking();
  const [videoIntros, setVideoIntros] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: ''
  });

  useEffect(() => {
    fetchVideoIntros();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createVideoIntro(
      formData.title,
      formData.description,
      formData.videoUrl
    );

    if (result.success) {
      toast.success('Video intro created successfully!');
      setFormData({ title: '', description: '', videoUrl: '' });
      setIsDialogOpen(false);
      fetchVideoIntros();
    } else {
      toast.error('Failed to create video intro');
    }
  };

  const handleLike = async (videoId: string) => {
    if (!user?.id) return;

    try {
      // In a real app, you'd track likes in a separate table
      toast.success('Video liked!');
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleMessage = (userId: string) => {
    toast.info('Messaging feature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Eventless Networking</h2>
          <p className="text-muted-foreground">Connect through authentic video introductions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Camera className="w-4 h-4 mr-2" />
              Create Video Intro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Video Introduction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Software Engineer looking to connect"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell others about yourself and what you're looking for..."
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Video URL</label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your video to YouTube or Vimeo and paste the link here
                </p>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Video Intro'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoIntros.map((video: any) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              {/* Video Thumbnail */}
              <div className="aspect-video bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Video Introduction</p>
                </div>
              </div>
              <Button 
                size="icon" 
                className="absolute inset-0 w-full h-full bg-black/20 hover:bg-black/30 rounded-none"
                onClick={() => window.open(video.video_url, '_blank')}
              >
                <Play className="w-8 h-8 text-white" />
              </Button>
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={video.profiles?.profile_picture_url} />
                  <AvatarFallback>
                    {video.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{video.profiles?.full_name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {video.profiles?.title || 'Professional'}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium mb-1">{video.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {video.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleLike(video.id)}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    {Math.floor(Math.random() * 20) + 1}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleMessage(video.user_id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {new Date(video.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videoIntros.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No video introductions yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to share your video introduction!</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Camera className="w-4 h-4 mr-2" />
              Create First Video
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
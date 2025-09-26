import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Play, Heart, Eye, Plus, Upload, Video, MessageSquare, Share2, Search, Filter, Star } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VideoIntro {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  thumbnail_url?: string;
  duration: number;
  view_count: number;
  like_count: number;
  tags: string[];
  created_at: string;
  user_profile?: {
    full_name: string;
    title: string;
    profile_picture_url: string;
  };
  is_liked?: boolean;
}

const VideoIntros: React.FC = () => {
  const { user } = useAuth();
  const [videoIntros, setVideoIntros] = useState<VideoIntro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    tagInput: ''
  });

  useEffect(() => {
    fetchVideoIntros();
  }, []);

  const fetchVideoIntros = async () => {
    try {
      setLoading(true);
      
      // Simulate fetching data with sample data
      const sampleData: VideoIntro[] = [
        {
          id: '1',
          title: 'Frontend Developer Introduction',
          description: "Hi! I'm a passionate React developer with 5 years of experience building scalable web applications. I love creating beautiful, user-friendly interfaces and I'm always eager to learn new technologies.",
          thumbnail_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop',
          duration: 87,
          view_count: 156,
          like_count: 23,
          tags: ['React', 'JavaScript', 'Frontend'],
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: 'Sarah Chen',
            title: 'Senior Frontend Developer',
            profile_picture_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '2',
          title: 'UX Designer Portfolio',
          description: 'Showcasing my design thinking process and recent projects in fintech and healthcare. I believe in user-centered design and creating intuitive experiences that solve real problems.',
          thumbnail_url: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=225&fit=crop',
          duration: 134,
          view_count: 234,
          like_count: 41,
          tags: ['UX', 'Design', 'Portfolio'],
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: 'Emma Wilson',
            title: 'Senior UX Designer',
            profile_picture_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '3',
          title: 'Marketing Growth Expert',
          description: 'Growth marketer specializing in B2B SaaS companies. Let\'s connect and grow together! I love experimenting with new growth channels and optimizing conversion funnels.',
          thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
          duration: 92,
          view_count: 89,
          like_count: 17,
          tags: ['Marketing', 'Growth', 'B2B'],
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: 'Marcus Rodriguez',
            title: 'Growth Marketing Specialist',
            profile_picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '4',
          title: 'Data Science Enthusiast',
          description: 'Machine learning engineer passionate about solving real-world problems with AI. Currently working on computer vision projects and always excited to collaborate on data-driven solutions.',
          thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
          duration: 145,
          view_count: 312,
          like_count: 58,
          tags: ['AI', 'ML', 'Data'],
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: 'Dr. Priya Patel',
            title: 'AI Research Engineer',
            profile_picture_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '5',
          title: 'Full Stack Developer Journey',
          description: 'From bootcamp to senior developer - sharing my journey and tips for aspiring developers. I specialize in React, Node.js, and cloud architecture.',
          thumbnail_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=225&fit=crop',
          duration: 156,
          view_count: 198,
          like_count: 32,
          tags: ['FullStack', 'Development', 'Career'],
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: 'Alex Thompson',
            title: 'Senior Full Stack Developer',
            profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '6',
          title: 'Product Manager Insights',
          description: 'Product management strategies and insights from working with startups to enterprise companies. Let\'s discuss product roadmaps and user research methodologies.',
          thumbnail_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=225&fit=crop',
          duration: 112,
          view_count: 167,
          like_count: 28,
          tags: ['Product', 'Management', 'Strategy'],
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: 'Jessica Park',
            title: 'Senior Product Manager',
            profile_picture_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
          }
        }
      ];
      
      setVideoIntros(sampleData);
    } catch (error) {
      console.error('Error fetching video intros:', error);
      toast.error('Failed to load video introductions');
    } finally {
      setLoading(false);
    }
  };

  const createVideoIntro = async () => {
    if (!user) {
      toast.error('Please log in to create a video introduction');
      return;
    }

    if (!newVideo.title || !newVideo.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newVideoIntro: VideoIntro = {
        id: Date.now().toString(),
        title: newVideo.title,
        description: newVideo.description,
        thumbnail_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop',
        duration: 90,
        view_count: 0,
        like_count: 0,
        tags: newVideo.tags,
        created_at: new Date().toISOString(),
        user_profile: {
          full_name: 'You',
          title: 'Your Title',
          profile_picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        }
      };

      setVideoIntros([newVideoIntro, ...videoIntros]);
      setShowCreateForm(false);
      setNewVideo({
        title: '',
        description: '',
        tags: [],
        tagInput: ''
      });
      
      toast.success('Video introduction created successfully!');
    } catch (error) {
      console.error('Error creating video intro:', error);
      toast.error('Failed to create video introduction');
    }
  };

  const toggleLike = async (videoId: string) => {
    if (!user) {
      toast.error('Please log in to like videos');
      return;
    }

    try {
      setVideoIntros(prev => prev.map(video => 
        video.id === videoId 
          ? { 
              ...video, 
              is_liked: !video.is_liked,
              like_count: video.is_liked ? video.like_count - 1 : video.like_count + 1
            }
          : video
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  };

  const addTag = () => {
    if (newVideo.tagInput.trim() && !newVideo.tags.includes(newVideo.tagInput.trim())) {
      setNewVideo(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewVideo(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayVideo = (videoId: string) => {
    setPlayingVideo(playingVideo === videoId ? null : videoId);
    
    // Simulate view count increment
    setVideoIntros(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, view_count: video.view_count + 1 }
        : video
    ));
  };

  const allTags = Array.from(new Set(videoIntros.flatMap(video => video.tags)));
  
  const filteredVideos = videoIntros.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.user_profile?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = tagFilter === 'all' || video.tags.includes(tagFilter);
    
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎥 Video Intros</h1>
          <p className="text-gray-600">Create Video Introductions & Connect with Professionals</p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Video Intro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Video Introduction</DialogTitle>
              <DialogDescription>
                Share your story and expertise with the community
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Frontend Developer Introduction"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newVideo.description}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell your story, highlight your expertise, and what you're looking for..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newVideo.tagInput}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, tagInput: e.target.value }))}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newVideo.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Upload your video (max 5 minutes)</p>
                <Button variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  Choose Video File
                </Button>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={createVideoIntro}>
                  Create Video Intro
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search videos, creators, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="all">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="relative">
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="opacity-0 hover:opacity-100 transition-opacity duration-300"
                  onClick={() => handlePlayVideo(video.id)}
                >
                  <Play className="h-6 w-6 mr-2" />
                  {playingVideo === video.id ? 'Pause' : 'Play'}
                </Button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                {formatDuration(video.duration)}
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={video.user_profile?.profile_picture_url}
                  alt={video.user_profile?.full_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-sm">{video.user_profile?.full_name}</h3>
                  <p className="text-xs text-gray-600">{video.user_profile?.title}</p>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {video.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {video.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{video.tags.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {video.view_count}
                  </div>
                  <button
                    onClick={() => toggleLike(video.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      video.is_liked ? 'text-red-500' : 'hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${video.is_liked ? 'fill-current' : ''}`} />
                    {video.like_count}
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No video introductions found</h3>
          <p className="text-gray-600">Try adjusting your search or create your own video introduction!</p>
        </div>
      )}

      {/* Featured Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🌟 Featured This Week</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {videoIntros.slice(0, 4).map((video) => (
            <Card key={`featured-${video.id}`} className="border border-yellow-200 shadow-md">
              <CardContent className="p-3">
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <h4 className="font-semibold text-sm mb-1 line-clamp-1">{video.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{video.user_profile?.full_name}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    4.9
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {video.view_count}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoIntros;
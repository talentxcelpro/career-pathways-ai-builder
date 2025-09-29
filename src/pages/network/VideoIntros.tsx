import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { VideoRecorder } from '@/components/video/VideoRecorder';
import { VideoUploader } from '@/components/video/VideoUploader';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { useAdvancedNetworking } from '@/hooks/useAdvancedNetworking';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Video, 
  Play, 
  Search, 
  User, 
  Eye, 
  Heart, 
  Star,
  Building,
  MapPin,
  Calendar,
  TrendingUp,
  Plus,
  Filter,
  SortDesc,
  Grid,
  List
} from 'lucide-react';

interface VideoIntro {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration: number;
  views_count: number;
  likes_count: number;
  is_featured: boolean;
  created_at: string;
  user_name: string;
  user_avatar?: string;
  user_title: string;
  user_company?: string;
  tags?: string[];
}

const VideoIntros: React.FC = () => {
  const { user } = useAuth();
  const { createVideoIntro, loading } = useAdvancedNetworking();
  const { toast } = useToast();
  const [videoIntros, setVideoIntros] = useState<VideoIntro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoIntro | null>(null);

  useEffect(() => {
    fetchVideoIntros();

    // Set up real-time subscription
    const channel = supabase
      .channel('video-intros-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_intros'
        },
        () => {
          fetchVideoIntros();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVideoIntros = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('video_intros')
        .select(`
          *,
          profiles!video_intros_user_id_fkey (
            full_name,
            profile_picture_url,
            title
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedData = data?.map(intro => ({
        ...intro,
        user_name: intro.profiles?.full_name || 'Anonymous User',
        user_avatar: intro.profiles?.profile_picture_url,
        user_title: intro.profiles?.title || 'Professional'
      })) || [];
      
      setVideoIntros(formattedData);
    } catch (error) {
      console.error('Error fetching video intros:', error);
      toast({
        title: "Error",
        description: "Failed to load video introductions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoRecorded = (blob: Blob, duration: number) => {
    setRecordedVideo(blob);
    setShowUploader(true);
  };

  const handleUploadComplete = (videoData: any) => {
    setShowCreateDialog(false);
    setShowUploader(false);
    setRecordedVideo(null);
    fetchVideoIntros();
    toast({
      title: "Success!",
      description: "Your video introduction has been uploaded successfully",
    });
  };

  const handleUploadCancel = () => {
    setShowUploader(false);
    setRecordedVideo(null);
  };

  const handleLike = async (videoId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('video_intro_likes')
        .insert({ video_id: videoId, user_id: user.id });
      
      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      // Update local state
      setVideoIntros(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, likes_count: video.likes_count + 1 }
          : video
      ));
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleShare = async (videoId: string) => {
    // Track share event
    try {
      await supabase
        .from('video_intro_shares')
        .insert({ video_id: videoId, user_id: user?.id });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const filteredAndSortedVideoIntros = React.useMemo(() => {
    let filtered = videoIntros.filter(intro => {
      const matchesSearch = 
        intro.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intro.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intro.user_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = !selectedTags || intro.tags?.some(tag => 
        tag.toLowerCase().includes(selectedTags.toLowerCase())
      );
      
      return matchesSearch && matchesTags;
    });

    // Sort the filtered results
    switch (sortBy) {
      case 'popular':
        return filtered.sort((a, b) => (b.likes_count + b.views_count) - (a.likes_count + a.views_count));
      case 'trending':
        return filtered.sort((a, b) => {
          const aScore = b.likes_count + (b.views_count / 10);
          const bScore = a.likes_count + (a.views_count / 10);
          return bScore - aScore;
        });
      case 'recent':
      default:
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [videoIntros, searchTerm, selectedTags, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video introductions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in-up">
          <div className="inline-flex items-center justify-center p-2 bg-purple-100 rounded-full mb-6">
            <Video className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-5xl font-apple-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Video Introductions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 font-apple-medium">
            Connect through authentic video introductions and build meaningful professional relationships
          </p>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button 
                className="apple-button text-lg px-8 py-4 smooth-bounce bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 font-apple-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Video Intro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {!showUploader ? (
                <VideoRecorder
                  onVideoRecorded={handleVideoRecorded}
                  maxDuration={120}
                />
              ) : (
                <VideoUploader
                  videoBlob={recordedVideo || undefined}
                  onUploadComplete={handleUploadComplete}
                  onCancel={handleUploadCancel}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-8">
          {/* Enhanced Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search video introductions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="apple-input pl-12 text-lg"
                />
              </div>
              
              <select
                value={selectedTags}
                onChange={(e) => setSelectedTags(e.target.value)}
                className="apple-input min-w-[150px]"
              >
                <option value="">All Skills</option>
                <option value="React">React</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Product">Product</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            {/* Sort and View Controls */}
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="apple-input"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>

              <div className="flex border border-gray-200 rounded-lg">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          {filteredAndSortedVideoIntros.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedVideoIntros.length} video introduction{filteredAndSortedVideoIntros.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Video Grid or List */}
          {filteredAndSortedVideoIntros.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Videos Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || selectedTags ? 'Try adjusting your search filters' : 'Be the first to share your video introduction!'}
              </p>
              {!searchTerm && !selectedTags && (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Video
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-6"
            }>
              {filteredAndSortedVideoIntros.map((intro, index) => (
                <Dialog key={intro.id}>
                  <DialogTrigger asChild>
                    <div 
                      className={`
                        cursor-pointer transition-all duration-300 hover:scale-[1.02]
                        ${viewMode === 'grid' 
                          ? 'apple-card overflow-hidden group' 
                          : 'apple-card flex gap-6 items-center'
                        }
                      `}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className={`
                        relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden
                        ${viewMode === 'grid' ? 'aspect-video rounded-xl' : 'w-48 h-32 rounded-lg flex-shrink-0'}
                      `}>
                        {intro.thumbnail_url ? (
                          <img 
                            src={intro.thumbnail_url} 
                            alt={intro.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                            <Play className={viewMode === 'grid' ? "h-16 w-16 text-purple-600" : "h-8 w-8 text-purple-600"} />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <Button className={`
                            opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 
                            transition-all duration-300 rounded-full bg-white/90 hover:bg-white text-purple-600 shadow-lg
                            ${viewMode === 'grid' ? 'w-16 h-16' : 'w-12 h-12'}
                          `}>
                            <Play className={viewMode === 'grid' ? "h-6 w-6 ml-1" : "h-4 w-4 ml-1"} />
                          </Button>
                        </div>
                        
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {Math.floor(intro.duration / 60)}:{(intro.duration % 60).toString().padStart(2, '0')}
                        </div>
                        
                        {intro.is_featured && (
                          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Featured
                          </div>
                        )}
                      </div>
                      
                      <div className={viewMode === 'grid' ? 'pt-6' : 'flex-1 min-w-0'}>
                        <div className={`flex items-start gap-4 ${viewMode === 'grid' ? 'mb-4' : 'mb-2'}`}>
                          <div className={`
                            rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center overflow-hidden shadow-lg
                            ${viewMode === 'grid' ? 'w-12 h-12' : 'w-10 h-10'}
                          `}>
                            {intro.user_avatar ? (
                              <img 
                                src={intro.user_avatar} 
                                alt={intro.user_name}
                                className={`object-cover ${viewMode === 'grid' ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10 rounded-2xl'}`}
                              />
                            ) : (
                              <User className={`text-white ${viewMode === 'grid' ? 'h-6 w-6' : 'h-5 w-5'}`} />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-gray-900 line-clamp-2 mb-1 ${viewMode === 'grid' ? 'text-lg' : 'text-base'}`}>
                              {intro.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-medium">{intro.user_name}</span>
                              <span>•</span>
                              <span>{intro.user_title}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className={`text-gray-600 mb-4 line-clamp-2 leading-relaxed ${viewMode === 'grid' ? '' : 'text-sm'}`}>
                          {intro.description}
                        </p>
                        
                        {intro.tags && intro.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {intro.tags.slice(0, viewMode === 'grid' ? 3 : 5).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-500">
                              <Eye className="h-4 w-4" />
                              <span className="text-sm font-medium">{intro.views_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-red-500">
                              <Heart className="h-4 w-4" />
                              <span className="text-sm font-medium">{intro.likes_count}</span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-400 font-medium">
                            {new Date(intro.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                    <VideoPlayer
                      videoIntro={intro}
                      autoplay={true}
                      onLike={handleLike}
                      onShare={handleShare}
                      className="border-0 shadow-none"
                    />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VideoIntros;
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  TrendingUp
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
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const handleCreateVideoIntro = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a video introduction",
        variant: "destructive"
      });
      return;
    }

    const result = await createVideoIntro(
      "Sample Video Introduction",
      "This is a sample video introduction for networking",
      "https://example.com/sample-video.mp4"
    );

    if (result.success) {
      setShowCreateForm(false);
      fetchVideoIntros();
    }
  };

  const filteredVideoIntros = videoIntros.filter(intro => {
    const matchesSearch = 
      intro.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intro.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intro.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = !selectedTags || intro.tags?.some(tag => 
      tag.toLowerCase().includes(selectedTags.toLowerCase())
    );
    
    return matchesSearch && matchesTags;
  });

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
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="apple-button text-lg px-8 py-4 smooth-bounce bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 font-apple-medium"
          >
            <Video className="h-5 w-5 mr-2" />
            Create Video Intro
          </Button>
        </div>

        <Tabs defaultValue="featured" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl p-2 shadow-lg">
              <TabsTrigger value="featured" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
                Featured
              </TabsTrigger>
              <TabsTrigger value="recent" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
                Recent
              </TabsTrigger>
              <TabsTrigger value="trending" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
                Trending
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="featured" className="space-y-8">
            {/* Search and Filters */}
            <div className="apple-card">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search video introductions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="apple-input pl-12 text-lg"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <select
                    value={selectedTags}
                    onChange={(e) => setSelectedTags(e.target.value)}
                    className="apple-input"
                  >
                    <option value="">All Skills</option>
                    <option value="React">React</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Product">Product</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVideoIntros.map((intro, index) => (
                <div 
                  key={intro.id} 
                  className="apple-card overflow-hidden group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                    {intro.thumbnail_url ? (
                      <img 
                        src={intro.thumbnail_url} 
                        alt={intro.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                        <Play className="h-16 w-16 text-purple-600" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <Button className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 rounded-full w-16 h-16 bg-white/90 hover:bg-white text-purple-600 shadow-lg">
                        <Play className="h-6 w-6 ml-1" />
                      </Button>
                    </div>
                    
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {Math.floor(intro.duration / 60)}:{(intro.duration % 60).toString().padStart(2, '0')}
                    </div>
                    
                    {intro.is_featured && (
                      <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Featured
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center overflow-hidden shadow-lg">
                        {intro.user_avatar ? (
                          <img 
                            src={intro.user_avatar} 
                            alt={intro.user_name}
                            className="w-12 h-12 rounded-2xl object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 text-lg">{intro.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">{intro.user_name}</span>
                          <span>•</span>
                          <span>{intro.user_title}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {intro.description}
                    </p>
                    
                    {intro.tags && intro.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {intro.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {tag}
                          </span>
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent Videos</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Check out the latest video introductions from our community
              </p>
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-12 w-12 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trending Videos</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Discover the most popular video introductions this week
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VideoIntros;
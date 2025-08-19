import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Briefcase, 
  Building, 
  Trophy, 
  MapPin,
  Plus,
  Camera,
  Type,
  Image as ImageIcon
} from 'lucide-react';

// Sample story data - in real app this would come from API
const sampleStories = [
  {
    id: 'recruiter_1',
    title: 'Tech Recruiter',
    hasStory: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'company_1', 
    title: 'Google',
    hasStory: true,
    avatar: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=150&h=150&fit=crop',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 'success_1',
    title: 'Sarah K.',
    hasStory: true,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b900?w=150&h=150&fit=crop&crop=face',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'colleague_1',
    title: 'John D.',
    hasStory: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'mentor_1',
    title: 'Lisa M.',
    hasStory: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    gradient: 'from-orange-500 to-red-500'
  }
];

export const StoryBubbles: React.FC = () => {
  const { user } = useAuth();
  const [showCreateStory, setShowCreateStory] = useState(false);

  // Get user profile for avatar
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  const handleStoryClick = (storyId: string) => {
    if (storyId === 'add') {
      setShowCreateStory(true);
    } else {
      // Handle viewing other stories
      console.log('Viewing story:', storyId);
    }
  };

  const handleCreateStory = (type: 'photo' | 'text') => {
    // In a real app, this would open camera or text editor
    console.log('Creating story with type:', type);
    setShowCreateStory(false);
    // Here you would implement story creation logic
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <>
      <div className="px-4 py-4 bg-white/95 backdrop-blur-sm">
        <ScrollArea>
          <div className="flex gap-4 pb-2">
            {/* Your Story - Add Story Button */}
            <div 
              className="flex flex-col items-center min-w-0 cursor-pointer active:scale-95 transition-all duration-200"
              onClick={() => handleStoryClick('add')}
            >
              <div className="relative">
                <div className="relative p-0.5 bg-gradient-to-tr from-gray-300 to-gray-400 rounded-full">
                  <div className="bg-white rounded-full p-1">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile?.profile_picture_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-lg">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1.5 border-2 border-white shadow-lg">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
              <span className="text-xs text-gray-700 mt-2 font-medium text-center max-w-[70px] truncate">
                Your Story
              </span>
            </div>

            {/* Other Stories */}
            {sampleStories.map((story) => (
              <div 
                key={story.id} 
                className="flex flex-col items-center min-w-0 cursor-pointer active:scale-95 transition-all duration-200"
                onClick={() => handleStoryClick(story.id)}
              >
                <div className={`relative p-0.5 bg-gradient-to-tr ${story.gradient} rounded-full animate-pulse`}>
                  <div className="bg-white rounded-full p-1">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={story.avatar} className="object-cover" />
                      <AvatarFallback className={`bg-gradient-to-br ${story.gradient} text-white text-lg`}>
                        {story.title[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Story ring indicator */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
                </div>
                <span className="text-xs text-gray-700 mt-2 font-medium text-center max-w-[70px] truncate">
                  {story.title}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Create Story Modal */}
      <Dialog open={showCreateStory} onOpenChange={setShowCreateStory}>
        <DialogContent className="max-w-sm mx-auto rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-center text-xl font-semibold">Create Story</DialogTitle>
          </DialogHeader>
          
          <div className="px-6 pb-6 space-y-4">
            <Button
              onClick={() => handleCreateStory('photo')}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium flex items-center gap-3"
            >
              <Camera className="h-5 w-5" />
              Take Photo/Video
            </Button>
            
            <Button
              onClick={() => handleCreateStory('text')}
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 font-medium flex items-center gap-3 hover:bg-gray-50"
            >
              <Type className="h-5 w-5" />
              Create Text Story
            </Button>
            
            <Button
              onClick={() => handleCreateStory('photo')}
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 font-medium flex items-center gap-3 hover:bg-gray-50"
            >
              <ImageIcon className="h-5 w-5" />
              Choose from Gallery
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
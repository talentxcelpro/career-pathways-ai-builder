import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface Reel {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  video: {
    url: string;
    thumbnail: string;
    duration: number;
  };
  caption: string;
  hashtags: string[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  isLiked: boolean;
}

interface InfiniteReelsFeedProps {
  onUploadClick: () => void;
}

export const InfiniteReelsFeed: React.FC<InfiniteReelsFeedProps> = ({ onUploadClick }) => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const { triggerHaptic } = useHapticFeedback();
  
  const [reels] = useState<Reel[]>([
    {
      id: 'reel-1',
      user: {
        id: 'user-1',
        name: 'Sarah Chen',
        username: '@sarahtech',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b60e9077?w=150&h=150&fit=crop',
        verified: true
      },
      video: {
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1551818255-e6e10975cd5d?w=400&h=600&fit=crop',
        duration: 30
      },
      caption: '5 Essential tips for your next tech interview! 💻✨ #TechTips #CareerAdvice',
      hashtags: ['#TechTips', '#CareerAdvice', '#InterviewPrep'],
      stats: { likes: 12500, comments: 340, shares: 890, views: 45600 },
      isLiked: false
    }
  ]);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleLike = useCallback((reelId: string) => {
    triggerHaptic('light');
    toast.success('Liked!');
  }, [triggerHaptic]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    triggerHaptic('light');
  }, [isPlaying, triggerHaptic]);

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      {reels.map((reel, index) => (
        <div key={reel.id} className="relative w-full h-screen flex-shrink-0 bg-black overflow-hidden">
          <video
            ref={(el) => { videoRefs.current[index] = el; }}
            className="absolute inset-0 w-full h-full object-cover"
            poster={reel.video.thumbnail}
            loop
            playsInline
            onClick={togglePlayPause}
          >
            <source src={reel.video.url} type="video/mp4" />
          </video>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* User Info */}
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 ring-2 ring-white/30">
                <AvatarImage src={reel.user.avatar} alt={reel.user.name} />
                <AvatarFallback>{reel.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-sm">{reel.user.name}</p>
                <p className="text-white/80 text-xs">{reel.user.username}</p>
              </div>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-4 left-4 right-20 z-10">
            <p className="text-white text-sm mb-2">{reel.caption}</p>
            <div className="flex items-center space-x-2 bg-black/30 rounded-full px-3 py-1 w-fit">
              <Music className="w-3 h-3 text-white" />
              <span className="text-white text-xs">Original Audio</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-20 right-4 z-10 flex flex-col space-y-4">
            <div className="flex flex-col items-center">
              <Button
                size="icon"
                variant="ghost"
                className={`w-12 h-12 rounded-full ${reel.isLiked ? 'text-red-500' : 'text-white'} hover:bg-white/20`}
                onClick={() => handleLike(reel.id)}
              >
                <Heart className={`w-6 h-6 ${reel.isLiked ? 'fill-current' : ''}`} />
              </Button>
              <span className="text-white text-xs">{reel.stats.likes > 1000 ? `${(reel.stats.likes / 1000).toFixed(1)}K` : reel.stats.likes}</span>
            </div>
          </div>

          {/* Play/Pause Control */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            {!isPlaying && (
              <Button
                size="icon"
                variant="ghost"
                className="w-16 h-16 rounded-full bg-black/30 text-white hover:bg-black/50"
                onClick={togglePlayPause}
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
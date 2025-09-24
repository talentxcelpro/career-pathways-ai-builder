import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { VideoReelPlayer } from './VideoReelPlayer';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';

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
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1551818255-e6e10975cd5d?w=400&h=600&fit=crop',
        duration: 30
      },
      caption: '5 Essential tips for your next tech interview! 💻✨ #TechTips #CareerAdvice',
      hashtags: ['#TechTips', '#CareerAdvice', '#InterviewPrep'],
      stats: { likes: 12500, comments: 340, shares: 890, views: 45600 },
      isLiked: false
    },
    {
      id: 'reel-2',
      user: {
        id: 'user-2',
        name: 'Marcus Johnson',
        username: '@marcusfinance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        verified: false
      },
      video: {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=600&fit=crop',
        duration: 45
      },
      caption: 'Breaking down cryptocurrency for beginners 🚀 Start your investment journey! #CryptoBasics #Investment',
      hashtags: ['#CryptoBasics', '#Investment', '#FinanceTips'],
      stats: { likes: 8920, comments: 234, shares: 567, views: 32100 },
      isLiked: true
    },
    {
      id: 'reel-3',
      user: {
        id: 'user-3',
        name: 'Dr. Emily Rodriguez',
        username: '@dremilymed',
        avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop',
        verified: true
      },
      video: {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=600&fit=crop',
        duration: 60
      },
      caption: 'Quick anatomy lesson: Understanding the human heart ❤️ #MedicalEducation #Anatomy #Healthcare',
      hashtags: ['#MedicalEducation', '#Anatomy', '#Healthcare'],
      stats: { likes: 15600, comments: 456, shares: 1200, views: 58900 },
      isLiked: false
    },
    {
      id: 'reel-4',
      user: {
        id: 'user-4',
        name: 'Alex Creative',
        username: '@alexcreates',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        verified: false
      },
      video: {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop',
        duration: 35
      },
      caption: 'UI/UX design principles that will level up your portfolio 🎨 #UIDesign #UXTips #Design',
      hashtags: ['#UIDesign', '#UXTips', '#Design', '#Portfolio'],
      stats: { likes: 9870, comments: 201, shares: 445, views: 38200 },
      isLiked: false
    },
    {
      id: 'reel-5',
      user: {
        id: 'user-5',
        name: 'Maya Career Coach',
        username: '@mayacoach',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        verified: true
      },
      video: {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=600&fit=crop',
        duration: 50
      },
      caption: '30-second career tip: How to network effectively at tech events 💼 #CareerTips #Networking',
      hashtags: ['#CareerTips', '#Networking', '#ProfessionalGrowth'],
      stats: { likes: 11200, comments: 167, shares: 789, views: 42000 },
      isLiked: true
    }
  ]);

  const nextReel = useCallback(() => {
    setCurrentReelIndex(prev => 
      prev < reels.length - 1 ? prev + 1 : prev
    );
    triggerHaptic('light');
  }, [triggerHaptic, reels.length]);

  const prevReel = useCallback(() => {
    setCurrentReelIndex(prev => prev > 0 ? prev - 1 : prev);
    triggerHaptic('light');
  }, [triggerHaptic]);

  const swipeHandlers = useSwipeGestures({
    onSwipeUp: nextReel,
    onSwipeDown: prevReel,
    onDoubleTap: () => handleLike(reels[currentReelIndex]?.id),
    threshold: 30,
    velocity: 0.2
  });

  const handleLike = useCallback((reelId: string) => {
    triggerHaptic('light');
    toast.success('Liked!');
  }, [triggerHaptic]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    triggerHaptic('light');
  }, [isPlaying, triggerHaptic]);

  return (
    <div 
      className="w-full h-screen overflow-hidden bg-black"
      {...swipeHandlers}
    >
      <div 
        className="flex flex-col transition-transform duration-300 ease-out"
        style={{ 
          transform: `translateY(-${currentReelIndex * 100}vh)`,
          height: `${reels.length * 100}vh`
        }}
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="relative w-full h-screen flex-shrink-0 bg-black overflow-hidden">
            <VideoReelPlayer
              videoUrl={reel.video.url}
              thumbnailUrl={reel.video.thumbnail}
              isActive={index === currentReelIndex}
              onPlayStateChange={(playing) => setIsPlaying(playing)}
              muted={isMuted}
              className="absolute inset-0 w-full h-full"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* User Info */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10 ring-2 ring-white/30">
                    <AvatarImage src={reel.user.avatar} alt={reel.user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {reel.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{reel.user.name}</p>
                      <p className="text-gray-300 text-xs">{reel.user.username}</p>
                    </div>
                    {reel.user.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-black"
                >
                  Follow
                </Button>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-4 left-4 right-20 z-10">
              <div className="mb-4">
                <p className="text-white text-sm leading-relaxed mb-2">{reel.caption}</p>
                <div className="flex flex-wrap gap-1">
                  {reel.hashtags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-blue-300 text-xs">{tag}</span>
                  ))}
                </div>
              </div>
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
                <span className="text-white text-xs font-medium">
                  {reel.stats.likes > 1000 ? `${(reel.stats.likes / 1000).toFixed(1)}K` : reel.stats.likes}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12 rounded-full text-white hover:bg-white/20"
                >
                  <MessageCircle className="w-6 h-6" />
                </Button>
                <span className="text-white text-xs font-medium">
                  {reel.stats.comments > 1000 ? `${(reel.stats.comments / 1000).toFixed(1)}K` : reel.stats.comments}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12 rounded-full text-white hover:bg-white/20"
                >
                  <Share2 className="w-6 h-6" />
                </Button>
                <span className="text-white text-xs font-medium">
                  {reel.stats.shares > 1000 ? `${(reel.stats.shares / 1000).toFixed(1)}K` : reel.stats.shares}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12 rounded-full text-white hover:bg-white/20"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10">
              <div 
                className="h-full bg-white transition-all duration-100"
                style={{ width: index === currentReelIndex ? '100%' : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reel Indicators */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-2">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-colors cursor-pointer ${
              index === currentReelIndex ? 'bg-white' : 'bg-white/30'
            }`}
            onClick={() => setCurrentReelIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};
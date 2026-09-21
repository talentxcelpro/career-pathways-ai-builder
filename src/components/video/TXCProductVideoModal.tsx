import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OFFICIAL_TXC_VIDEOS, TXCVideoItem, getVideoById } from '@/data/officialVideos';
import { Play, Pause, Volume2, VolumeX, ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TXCProductVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideoId?: string;
}

export const TXCProductVideoModal: React.FC<TXCProductVideoModalProps> = ({
  isOpen,
  onClose,
  initialVideoId = 'talentxcel-overview'
}) => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<TXCVideoItem>(() => getVideoById(initialVideoId));
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (initialVideoId) {
      setSelectedVideo(getVideoById(initialVideoId));
    }
  }, [initialVideoId]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay with audio was blocked, try muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      });
    }
  }, [isOpen, selectedVideo]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSelectVideo = (video: TXCVideoItem) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  };

  const handleCtaClick = () => {
    onClose();
    if (selectedVideo.ctaLink.startsWith('http')) {
      window.open(selectedVideo.ctaLink, '_blank');
    } else {
      navigate(selectedVideo.ctaLink);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] p-0 bg-slate-950 text-white border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <DialogTitle className="sr-only">{selectedVideo.title} — Product Demo</DialogTitle>
        <DialogDescription className="sr-only">{selectedVideo.description}</DialogDescription>

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] font-bold">
              {selectedVideo.badge}
            </Badge>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-[200px] sm:max-w-md">
              {selectedVideo.title}
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              ({selectedVideo.durationFormatted})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player & Showcase Area */}
        <div className="grid lg:grid-cols-12 bg-black">
          {/* Main Video Viewport (8 cols on lg) */}
          <div className="lg:col-span-8 relative aspect-video flex items-center justify-center bg-black overflow-hidden group">
            <video
              ref={videoRef}
              src={selectedVideo.videoUrl}
              poster={selectedVideo.thumbnailUrl}
              playsInline
              controls
              autoPlay
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Playlist & Actions Sidebar (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800/80 bg-slate-900/90 p-4 sm:p-5">
            <div>
              <div className="mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Featured Product Demos
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a demo to watch the platform in action:
                </p>
              </div>

              {/* Scrollable playlist pills */}
              <div className="space-y-2 max-h-[260px] sm:max-h-[300px] overflow-y-auto pr-1">
                {OFFICIAL_TXC_VIDEOS.map((item) => {
                  const isCurrent = item.id === selectedVideo.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectVideo(item)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                        isCurrent
                          ? 'bg-blue-600/20 border-blue-500/60 text-white shadow-md'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="relative w-14 h-9 rounded-md overflow-hidden bg-slate-800 flex-shrink-0">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className={`w-3 h-3 ${isCurrent ? 'text-blue-400 fill-blue-400' : 'text-white'}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold truncate">{item.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono ml-1">{item.durationFormatted}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.tagline}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Conversion CTA */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">Instant access — No credit card required</span>
              </div>
              <Button
                onClick={handleCtaClick}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all group"
              >
                <span>{selectedVideo.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

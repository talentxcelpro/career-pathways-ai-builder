import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OFFICIAL_TXC_VIDEOS, TXCVideoItem } from '@/data/officialVideos';
import { Play, Pause, Volume2, VolumeX, CheckCircle, ArrowRight, Sparkles, Shield, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProductVideoSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState<TXCVideoItem>(OFFICIAL_TXC_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSelectVideo = (video: TXCVideoItem) => {
    setActiveVideo(video);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

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

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Live Platform Demonstrations
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            See TalentXcel in Action
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Watch how our AI platform scores resumes against enterprise ATS algorithms, matches high-fit jobs, and opens doors to 10,250+ Indian colleges.
          </p>
        </div>

        {/* Video Selector Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {OFFICIAL_TXC_VIDEOS.slice(0, 6).map((video) => {
            const isCurrent = video.id === activeVideo.id;
            return (
              <button
                key={video.id}
                onClick={() => handleSelectVideo(video)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30 scale-105'
                    : 'bg-slate-850/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Play className={`w-3 h-3 ${isCurrent ? 'fill-white' : 'text-slate-400'}`} />
                <span>{video.title}</span>
                <span className="text-[10px] font-mono opacity-80">({video.durationFormatted})</span>
              </button>
            );
          })}
        </div>

        {/* Main Showcase Stage */}
        <div className="grid lg:grid-cols-12 gap-8 items-center bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Main Video Viewport (7 cols on lg) */}
          <div className="lg:col-span-7 relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner group">
            <video
              ref={videoRef}
              src={activeVideo.videoUrl}
              poster={activeVideo.thumbnailUrl}
              playsInline
              muted={isMuted}
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />

            {/* Quick Mute/Unmute Overlay Button */}
            <button
              onClick={toggleMute}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-all"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Video Information & Direct CTA (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs font-bold">
                  {activeVideo.badge}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  Length: {activeVideo.durationFormatted} • 1080p HD
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeVideo.title}
              </h3>
              
              <p className="text-sm font-medium text-blue-300">
                {activeVideo.tagline}
              </p>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {activeVideo.description}
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Real-time AI analysis & parsing algorithms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Compatible with Greenhouse, Lever & Workday</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Free instant utility — No paywall to check</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Button
                onClick={() => {
                  if (activeVideo.ctaLink.startsWith('http')) {
                    window.open(activeVideo.ctaLink, '_blank');
                  } else {
                    navigate(activeVideo.ctaLink);
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group transition-all"
              >
                <span>{activeVideo.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Thumbnail Grid / Reel Strip */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              More Platform & Diagnostic Demos
            </h4>
            <span className="text-xs text-slate-500">
              Click any demo to play above
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {OFFICIAL_TXC_VIDEOS.map((item) => {
              const isCurrent = item.id === activeVideo.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectVideo(item)}
                  className={`group text-left rounded-2xl overflow-hidden border p-2 transition-all ${
                    isCurrent
                      ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-2.5">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                      <div className="w-8 h-8 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      {item.durationFormatted}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.tagline}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

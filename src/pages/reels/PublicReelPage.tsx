import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Play, Pause, Volume2, VolumeX, Share2, ThumbsUp, MessageSquare, 
  Sparkles, ShieldCheck, ArrowRight, Video, Briefcase, Eye, ChevronLeft, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GLOBAL_CURATED_REELS, ReelData } from '@/hooks/useReelsData';
import { toast } from 'sonner';

export const PublicReelPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const reel = GLOBAL_CURATED_REELS.find(r => r.id === id) || GLOBAL_CURATED_REELS[0];
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasLiked, setHasLiked] = useState<boolean>(reel.has_liked);
  const [likesCount, setLikesCount] = useState<number>(reel.likes_count);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleLike = () => {
    if (hasLiked) {
      setHasLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      setHasLiked(true);
      setLikesCount(prev => prev + 1);
      toast.success('Reel liked!');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${reel.title} | TalentXcel Career Reels`,
          text: reel.description,
          url
        });
        return;
      } catch (_) {}
    }
    navigator.clipboard.writeText(url);
    toast.success('Reel link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans">
      <Helmet>
        <title>{`${reel.title} — Career Pitch Reel | TalentXcel`}</title>
        <meta name="description" content={reel.description} />
        <meta property="og:title" content={`${reel.title} | TalentXcel Reels`} />
        <meta property="og:description" content={reel.description} />
        <meta property="og:type" content="video.other" />
        <meta property="og:video" content={`https://talentxcel.in${reel.video_url}`} />
        <meta property="og:image" content={`https://talentxcel.in${reel.thumbnail_url}`} />
        <meta property="og:url" content={`https://talentxcel.in/reels/${reel.id}`} />
        <meta name="twitter:card" content="player" />
        <meta name="twitter:title" content={reel.title} />
        <meta name="twitter:description" content={reel.description} />
        <meta name="twitter:image" content={`https://talentxcel.in${reel.thumbnail_url}`} />
        <link rel="canonical" href={`https://talentxcel.in/reels/${reel.id}`} />
      </Helmet>

      {/* Top Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/reels" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-semibold">
            <ChevronLeft className="w-4 h-4" />
            <span>Explore All Reels</span>
          </Link>

          <Link to="/" className="text-sm font-black text-blue-500">
            TalentXcel <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-bold">REELS</span>
          </Link>

          <Button
            size="sm"
            onClick={handleShare}
            variant="outline"
            className="h-8 px-3 rounded-lg border-slate-800 text-slate-300 hover:text-white text-xs gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </Button>
        </div>
      </header>

      {/* Main Video Presentation Section */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col md:flex-row items-center justify-center gap-8">
        {/* 9:16 Video Player Container */}
        <div className="relative w-full max-w-[360px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 shrink-0 group">
          <video
            ref={videoRef}
            src={reel.video_url}
            poster={reel.thumbnail_url}
            className="w-full h-full object-cover cursor-pointer"
            autoPlay
            loop
            playsInline
            muted={isMuted}
            onClick={togglePlay}
          />

          {/* Floating Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {!isPlaying && (
            <div 
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10"
            >
              <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 ml-1" />
              </div>
            </div>
          )}

          {/* Bottom Video Metadata Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent z-20 pointer-events-none">
            <div className="flex items-center gap-2 mb-1.5">
              <Avatar className="w-7 h-7 ring-2 ring-blue-500/50">
                <AvatarImage src={reel.user_avatar} alt={reel.user_name} />
                <AvatarFallback className="text-[10px] bg-blue-700">TX</AvatarFallback>
              </Avatar>
              <span className="text-xs font-bold text-white">@{reel.user_name}</span>
            </div>
            <p className="text-xs text-slate-200 line-clamp-2 leading-snug">
              {reel.title}
            </p>
          </div>
        </div>

        {/* Creator Identity & Viral Action Sidebar */}
        <div className="flex-1 w-full max-w-md space-y-5">
          {/* Creator Profile Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 rounded-xl ring-2 ring-blue-500/30">
                  <AvatarImage src={reel.user_avatar} alt={reel.user_name} />
                  <AvatarFallback className="bg-blue-700 text-white font-bold">TX</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-extrabold text-white">@{reel.user_name}</h2>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{reel.creator_role || 'Verified Leader'}</p>
                </div>
              </div>

              {reel.talent_score && (
                <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  TalentScore: {reel.talent_score}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-white leading-snug mb-2">
                {reel.title}
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                {reel.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {reel.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-slate-800 text-slate-300 text-[10px] font-semibold">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Engagement Metrics Row */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 font-semibold">
              <div className="flex items-center gap-4">
                <button onClick={handleLike} className={`flex items-center gap-1.5 transition ${hasLiked ? 'text-rose-500' : 'hover:text-white'}`}>
                  <ThumbsUp className="w-4 h-4" />
                  <span>{likesCount}</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{reel.views_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>{reel.comments_count}</span>
                </div>
              </div>

              <Button size="sm" onClick={handleShare} variant="ghost" className="h-7 text-xs text-blue-400 hover:text-blue-300 p-0">
                <Share2 className="w-3.5 h-3.5 mr-1" /> Share Reel
              </Button>
            </div>
          </div>

          {/* Sticky Pitch Call-To-Action Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-800/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Recruiter OS Fast-Track
            </div>
            <p className="text-xs sm:text-sm font-bold text-white leading-snug">
              Record your 30-second Career Pitch to get 3x more recruiter views across top Indian & global tech employers.
            </p>
            <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
              <Button
                onClick={() => navigate('/reels')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 rounded-xl shadow-md gap-1.5"
              >
                <Video className="w-3.5 h-3.5" /> Record Pitch Reel (Free)
              </Button>
              <Link to="/passport" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs h-9 rounded-xl">
                  Claim Career Passport
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Call-To-Action Bar */}
      <footer className="border-t border-slate-900 bg-slate-950/90 backdrop-blur-md p-4 sticky bottom-0 z-30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="text-xs text-slate-400">
            <span className="font-bold text-white">Want verified recruiter access?</span> Establish your career profile &amp; publish verified pitch reels.
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => navigate('/reels')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold h-8 px-4 rounded-xl shadow-xs"
            >
              Watch More Reels &rarr;
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicReelPage;

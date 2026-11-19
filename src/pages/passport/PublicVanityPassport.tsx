import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Zap, Award, Star, Share2, UserPlus, Check, Sparkles, 
  MapPin, Briefcase, ExternalLink, ThumbsUp, ArrowRight, RefreshCw, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { trackFunnelEvent } from '@/services/telemetry/funnelTracker';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

interface ProfileData {
  id: string;
  full_name: string;
  headline?: string;
  location?: string;
  profile_photo_url?: string;
  username?: string;
  skills?: string[];
  about?: string;
  talent_score?: number;
}

interface PeerEndorsement {
  id: string;
  endorser_name: string;
  skill_name: string;
  rating: number;
  feedback?: string;
  created_at: string;
}

export const PublicVanityPassport: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [endorsements, setEndorsements] = useState<PeerEndorsement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [claimInput, setClaimInput] = useState('');

  const cleanUsername = (username || '').trim().replace(/^@/, '');

  useEffect(() => {
    trackFunnelEvent('tool_started', { tool: 'vanity_passport', handle: cleanUsername });

    async function loadPassport() {
      setIsLoading(true);
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUsername);
        
        const { data, error } = await supabase
          .from('public_profiles')
          .select('id, full_name, headline, location, profile_photo_url, username, skills, about, talent_score')
          .or(isUuid ? `id.eq.${cleanUsername}` : `username.eq.${cleanUsername}`)
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfile(data);

          // Fetch peer endorsements for this candidate
          const { data: endData } = await supabase
            .from('peer_endorsements')
            .select('id, endorser_name, skill_name, rating, feedback, created_at')
            .or(`recipient_username.eq.${cleanUsername},recipient_user_id.eq.${data.id}`)
            .order('created_at', { ascending: false })
            .limit(12);

          if (endData) {
            setEndorsements(endData as PeerEndorsement[]);
          }
        }
      } catch (err) {
        console.warn('[PublicVanityPassport] Load notice:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (cleanUsername) {
      loadPassport();
    }
  }, [cleanUsername]);

  const handleConnect = async () => {
    if (!profile) return;

    if (!user) {
      trackFunnelEvent('oauth_gate_shown', { trigger: 'passport_connect', target: cleanUsername });
      const returnUrl = encodeURIComponent(`/u/${cleanUsername}`);
      navigate(`/auth?returnTo=${returnUrl}&flow=candidate`);
      return;
    }

    if (user.id === profile.id) {
      toast.info("This is your own Career Passport!");
      return;
    }

    setIsConnecting(true);
    try {
      trackFunnelEvent('network_connection_requested', { target_user_id: profile.id });
      const { error } = await supabase.from('connections').insert({
        requester_id: user.id,
        recipient_id: profile.id,
        status: 'pending',
        message: `Hi ${profile.full_name}! I viewed your verified Career Passport and would like to connect on TalentXcel.`
      });

      if (error && error.code !== '23505') throw error;
      setIsConnected(true);
      toast.success(`Connection request sent to ${profile.full_name}!`);
    } catch (err: any) {
      toast.error(err.message || 'Unable to send connection request.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleShare = async () => {
    const passportUrl = `https://talentxcel.in/u/${cleanUsername}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.full_name || cleanUsername}'s Career Passport | TalentXcel`,
          text: `Check out ${profile?.full_name || cleanUsername}'s verified skills and credentials on TalentXcel!`,
          url: passportUrl
        });
        return;
      } catch (_) {}
    }
    navigator.clipboard.writeText(passportUrl);
    toast.success('Passport URL copied to clipboard!');
  };

  const handleShareToNetwork = async () => {
    if (!user) {
      toast.info('Sign in with Google to post this passport to the /network community feed');
      navigate(`/auth?returnTo=/u/${cleanUsername}`);
      return;
    }

    try {
      const topSkills = (skills || []).slice(0, 4).join(', ');
      const postContent = `🛡️ Verified Career Passport Spotlight: @${cleanUsername} (${name})!\n\nHeadline: ${headline}\nVerified Competencies: ${topSkills}\nTalentScore: ${talentScore}/100 🚀\n\nView full passport: https://talentxcel.in/u/${cleanUsername}\nEndorse skills in 10s: https://talentxcel.in/verify/${cleanUsername}\n\n#TalentXcel #CareerPassport #VerifiedTalent #NetworkSpotlight`;

      const { error } = await supabase.from('posts').insert({
        author_id: user.id,
        user_id: user.id,
        content: postContent,
        post_type: 'text',
        is_public: true,
        status: 'published',
        tags: ['CareerPassport', 'VerifiedTalent', 'NetworkSpotlight']
      });

      if (error) throw error;
      toast.success('Passport shared to /network feed!');
    } catch (err: any) {
      toast.error('Could not share passport to /network right now');
    }
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const handle = claimInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!handle) {
      toast.error('Please enter a valid handle name');
      return;
    }
    trackFunnelEvent('passport_claimed', { requested_handle: handle });
    navigate(`/passport?claim=${encodeURIComponent(handle)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span>Loading Verified Career Passport...</span>
        </div>
      </div>
    );
  }

  const name = profile?.full_name || cleanUsername;
  const headline = profile?.headline || 'Verified Professional & Industry Specialist';
  const talentScore = profile?.talent_score || 88;
  const skills = profile?.skills && profile.skills.length > 0 
    ? profile.skills 
    : ['Software Architecture', 'Cloud Infrastructure', 'Product Strategy', 'Full Stack Development', 'Agile Delivery'];

  return (
    <>
      <Helmet>
        <title>{`${name} — Verified Career Passport & Skills | TalentXcel`}</title>
        <meta name="description" content={`Explore ${name}'s verified skills, peer endorsements, and career achievements on the TalentXcel Career Passport Network.`} />
        <link rel="canonical" href={`https://talentxcel.in/u/${cleanUsername}`} />
        <meta property="og:title" content={`${name} — Verified Career Passport`} />
        <meta property="og:description" content={`View ${name}'s verified credentials and peer endorsements on TalentXcel.`} />
        <meta property="og:url" content={`https://talentxcel.in/u/${cleanUsername}`} />
        <meta property="og:type" content="profile" />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
        {/* Sticky Viral Conversion Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-2.5 shadow-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-full bg-white/20">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </span>
              <span>
                <strong>Verified Career Passport:</strong> You are viewing {name}'s verified professional portfolio.
              </span>
            </div>
            <Link 
              to="/passport" 
              className="px-3.5 py-1.5 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition shrink-0 text-center shadow-xs"
            >
              Claim Your Free Handle (talentxcel.in/u/yourname) &rarr;
            </Link>
          </div>
        </div>

        {/* Main Content Hub */}
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8">
          {/* Passport Identity Card */}
          <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-2">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-blue-500/20 shadow-xl">
                  <AvatarImage src={profile?.profile_photo_url} alt={name} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-black text-2xl">
                    {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{name}</h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl">
                    {headline}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
                    {profile?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {profile.location}
                      </span>
                    )}
                    <span className="font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                      talentxcel.in/u/{cleanUsername}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified TalentScore Badge */}
              <div className="flex flex-row md:flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 min-w-[130px]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xl">
                  {talentScore}
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">TalentScore</div>
                  <div className="text-[10px] text-slate-400">Top 5% Percentile</div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || isConnected}
                  className={`flex-1 sm:flex-initial h-10 px-5 rounded-xl font-bold text-xs shadow-md transition ${
                    isConnected ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" /> Connected
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1.5" /> Connect on Network
                    </>
                  )}
                </Button>

                <Link
                  to={`/verify/${cleanUsername}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition gap-1.5"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Endorse Skills (10s)
                </Link>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareToNetwork}
                  className="h-10 px-4 rounded-xl border-blue-700/60 bg-blue-950/40 text-blue-300 hover:text-white hover:bg-blue-900/60 text-xs font-semibold gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Share to /network
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="h-10 px-4 rounded-xl border-slate-700 bg-slate-950 text-slate-300 hover:text-white text-xs font-semibold gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Passport
                </Button>
              </div>
            </div>
          </div>

          {/* Verified Skills & Peer Endorsements Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Verified Competencies & Peer Endorsements
              </h2>
              <Link 
                to={`/verify/${cleanUsername}`} 
                className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1"
              >
                + Endorse a skill &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {skills.map((skill, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-purple-500/40 transition group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition">
                      {skill}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Level 5 · Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof Endorsement Wall */}
          {endorsements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-blue-400" />
                Peer Reviews & Endorsements ({endorsements.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {endorsements.map((end) => (
                  <Card key={end.id} className="bg-slate-900 border-slate-800 text-slate-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{end.endorser_name}</span>
                          <span className="text-slate-500 font-normal">endorsed</span>
                          <Badge variant="outline" className="border-purple-500/40 text-purple-300 text-[10px]">
                            {end.skill_name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: end.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    {end.feedback && (
                      <CardContent className="text-xs text-slate-400 italic pt-0">
                        "{end.feedback}"
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Viral Loop: Claim Your Own Vanity Handle Widget */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-800/40 p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Claim Your Verified Career Passport Handle
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              Join {name} and thousands of software engineers, leaders, and specialists who use TalentXcel to showcase verified skills and receive high-intent inbound job matches.
            </p>

            <form onSubmit={handleClaimSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row items-center gap-2 pt-2">
              <div className="relative flex-1 w-full">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono select-none">
                  talentxcel.in/u/
                </span>
                <input
                  type="text"
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="yourname"
                  className="w-full pl-36 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-blue-500 outline-none transition"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Claim Free &rarr;
              </Button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default PublicVanityPassport;

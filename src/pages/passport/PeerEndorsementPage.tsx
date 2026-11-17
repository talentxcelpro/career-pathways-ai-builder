import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ThumbsUp, Star, ShieldCheck, CheckCircle2, Sparkles, User, Mail, 
  ArrowRight, RefreshCw, Award, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { trackFunnelEvent } from '@/services/telemetry/funnelTracker';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export const PeerEndorsementPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const cleanUsername = (username || '').trim().replace(/^@/, '');
  const preselectedSkill = searchParams.get('skill') || '';

  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Form states
  const [endorserName, setEndorserName] = useState('');
  const [endorserEmail, setEndorserEmail] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(preselectedSkill);
  const [customSkill, setCustomSkill] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [claimHandle, setClaimHandle] = useState('');

  useEffect(() => {
    trackFunnelEvent('tool_started', { tool: 'peer_endorsement', target: cleanUsername });

    if (user) {
      setEndorserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      setEndorserEmail(user.email || '');
    }

    async function loadRecipient() {
      setIsLoadingProfile(true);
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUsername);
        const { data } = await supabase
          .from('public_profiles')
          .select('id, full_name, headline, profile_photo_url, username, skills')
          .or(isUuid ? `id.eq.${cleanUsername}` : `username.eq.${cleanUsername}`)
          .limit(1)
          .maybeSingle();

        if (data) {
          setProfile(data);
          if (!preselectedSkill && data.skills && data.skills.length > 0) {
            setSelectedSkill(data.skills[0]);
          }
        }
      } catch (err) {
        console.warn('[PeerEndorsementPage] Recipient load notice:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    if (cleanUsername) loadRecipient();
  }, [cleanUsername, user, preselectedSkill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalSkill = (customSkill.trim() || selectedSkill || 'Technical Excellence').trim();
    if (!endorserName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!endorserEmail.trim() || !endorserEmail.includes('@')) {
      toast.error('Please provide a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Insert endorsement
      const { error: endErr } = await supabase.from('peer_endorsements').insert({
        recipient_user_id: profile?.id || null,
        recipient_username: cleanUsername,
        endorser_name: endorserName.trim(),
        endorser_email: endorserEmail.trim(),
        endorser_user_id: user?.id || null,
        skill_name: finalSkill,
        rating: rating,
        feedback: feedback.trim() || null
      });

      if (endErr) throw endErr;

      // 2. Award referral credits to recipient
      if (profile?.id) {
        await supabase.from('referral_credits').insert({
          referrer_id: profile.id,
          credit_amount: 50,
          reason: `peer_endorsement:${finalSkill}`
        }).then(() => {}).catch(() => {});
      }

      trackFunnelEvent('endorsement_sent', {
        recipient: cleanUsername,
        skill: finalSkill,
        rating
      });

      setIsSubmitted(true);
      toast.success(`Endorsement submitted for ${profile?.full_name || cleanUsername}!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit endorsement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const recipientName = profile?.full_name || cleanUsername;
  const availableSkills = profile?.skills && profile.skills.length > 0
    ? profile.skills
    : ['System Architecture', 'Full Stack Development', 'Cloud Infrastructure', 'Product Leadership', 'Problem Solving'];

  return (
    <>
      <Helmet>
        <title>{`Endorse ${recipientName}'s Skills | TalentXcel Peer Review`}</title>
        <meta name="description" content={`Submit a 10-second verified peer endorsement for ${recipientName} on the TalentXcel Career Passport Network.`} />
        <link rel="canonical" href={`https://talentxcel.in/verify/${cleanUsername}`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
        {/* Top Header */}
        <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-40 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-black text-blue-500">TalentXcel</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50 font-semibold uppercase">
                Peer Review
              </span>
            </Link>
            <Link 
              to={`/u/${cleanUsername}`} 
              className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              View {recipientName}'s Passport &rarr;
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-xl mx-auto px-4 py-8 sm:py-12 w-full">
          {!isSubmitted ? (
            <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-2xl rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
              
              <CardHeader className="text-center pb-4 pt-6">
                <Avatar className="w-20 h-20 mx-auto rounded-2xl ring-4 ring-purple-500/20 mb-3 shadow-lg">
                  <AvatarImage src={profile?.profile_photo_url} alt={recipientName} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-700 to-indigo-900 text-white font-bold text-xl">
                    {recipientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> 10-Second Peer Verification
                </div>
                <CardTitle className="text-2xl font-black text-white">
                  Endorse {recipientName}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your peer endorsement helps {recipientName} boost their verified TalentScore and stand out to hiring companies.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Skill Picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Select Competency to Endorse:</span>
                      <span className="text-slate-500 text-[11px] font-normal">Choose 1 key skill</span>
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {availableSkills.map((sk: string) => (
                        <button
                          type="button"
                          key={sk}
                          onClick={() => { setSelectedSkill(sk); setCustomSkill(''); }}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                            selectedSkill === sk && !customSkill
                              ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {sk}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Or enter custom skill (e.g. Distributed Systems)..."
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      className="w-full mt-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-none transition"
                    />
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Proficiency Rating:</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition"
                        >
                          <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                        </button>
                      ))}
                      <span className="text-xs text-slate-400 ml-2 font-medium">
                        {rating === 5 ? 'Exceptional / Top 5%' : `${rating} out of 5 stars`}
                      </span>
                    </div>
                  </div>

                  {/* Feedback / Note */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">
                      Recommendation Note (Optional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder={`e.g. "Worked together on scaling high-throughput APIs — exceptional architecture and delivery."`}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-none transition"
                    />
                  </div>

                  {/* Endorser Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" /> Your Full Name:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Sharma"
                        value={endorserName}
                        onChange={(e) => setEndorserName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" /> Your Work/Personal Email:
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. alex@example.com"
                        value={endorserEmail}
                        onChange={(e) => setEndorserEmail(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Endorsement...
                      </span>
                    ) : (
                      <>
                        <ThumbsUp className="w-4 h-4 mr-2" /> Submit Verified Endorsement
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Viral Completion Card */
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Endorsement Live & Credited (+50 Credits)
                </span>
                <h2 className="text-2xl font-black text-white">
                  Thank You, {endorserName}!
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  Your endorsement for <strong className="text-white">{recipientName}</strong> has been verified and added to their official Career Passport.
                </p>
              </div>

              {/* Reciprocal Viral Hook */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 border border-blue-700/50 space-y-4">
                <div className="flex items-center justify-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Want {recipientName} to Endorse You Back?
                </div>
                <h3 className="text-lg font-bold text-white">
                  Claim Your Free Career Passport in 60 Seconds
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Grab your custom vanity handle (<code className="text-blue-300 font-mono">talentxcel.in/u/yourname</code>) to start collecting verified endorsements from colleagues.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2 max-w-sm mx-auto pt-2">
                  <div className="relative flex-1 w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                      /u/
                    </span>
                    <input
                      type="text"
                      placeholder="yourname"
                      value={claimHandle}
                      onChange={(e) => setClaimHandle(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-purple-500 outline-none"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const h = claimHandle.trim().toLowerCase() || endorserName.toLowerCase().replace(/\s+/g, '-');
                      trackFunnelEvent('passport_claimed', { trigger: 'peer_endorsement_completion', handle: h });
                      navigate(`/passport?claim=${encodeURIComponent(h)}`);
                    }}
                    className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Claim & Reciprocate &rarr;
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/u/${cleanUsername}`}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  Return to {recipientName}'s Passport &rarr;
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default PeerEndorsementPage;

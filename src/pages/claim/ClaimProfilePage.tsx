/**
 * src/pages/claim/ClaimProfilePage.tsx
 * TalentXcel Professional Activation — Profile Claim Landing Experience
 * 
 * Secure, zero-PII claim flow:
 * - Reads cryptographic token from URL parameter (?t=TOKEN)
 * - Zero PII in the URL
 * - Previews profile with masked email (server-side verified)
 * - Authenticated claim or inline registration/sign-in
 * - Explicit opt-out / deletion button
 * - Clean privacy notice compliant with applicable data protection laws
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight,
  EyeOff
} from 'lucide-react';

interface ProfilePreview {
  id: string;
  fullName: string;
  maskedEmail: string;
  headline?: string;
  locationCity?: string;
  locationCountry?: string;
  skills: string[];
  experienceYears?: number;
  currentCompany?: string;
  currentTitle?: string;
  expiresAt?: string;
}

export default function ClaimProfilePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('t') || searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [optOutLoading, setOptOutLoading] = useState(false);

  const [profile, setProfile] = useState<ProfilePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [optedOut, setOptedOut] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setError('No claim token provided in the link. Please check your invitation email.');
      setLoading(false);
      return;
    }

    async function verifyToken() {
      setVerifying(true);
      setError(null);
      try {
        const res = await fetch(`/api/claim/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setError(data.error || 'Claim link is invalid or has expired.');
          if (data.expired) setErrorCode('EXPIRED');
          if (data.already_claimed) setErrorCode('ALREADY_CLAIMED');
          if (data.opted_out) setErrorCode('OPTED_OUT');
        } else {
          setProfile(data.profile);
        }
      } catch (err: any) {
        setError('Unable to verify your claim link. Please check your connection and try again.');
      } finally {
        setLoading(false);
        setVerifying(false);
      }
    }

    verifyToken();
  }, [token]);

  // Claim handler
  async function handleClaim() {
    if (!currentUser) return;
    setClaiming(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch('/api/claim/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to claim profile. Please try again.');
      } else {
        setClaimed(true);
      }
    } catch (err: any) {
      setError('An unexpected error occurred while claiming your profile.');
    } finally {
      setClaiming(false);
    }
  }

  // Opt-out handler
  async function handleOptOut(deleteData: boolean = false) {
    if (!token) return;
    setOptOutLoading(true);
    try {
      const res = await fetch('/api/claim/opt-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          reason: 'user_claim_page_optout',
          deleteData,
        }),
      });

      if (res.ok) {
        setOptedOut(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to process opt-out.');
      }
    } catch (err: any) {
      setError('Failed to process opt-out. Please try again.');
    } finally {
      setOptOutLoading(false);
    }
  }

  // Inline auth handler (signup or signin)
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError(null);

    try {
      if (authMode === 'signup') {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              full_name: profile?.fullName || '',
            },
          },
        });
        if (signUpErr) throw signUpErr;
        if (data.session) {
          setCurrentUser(data.session.user);
        } else {
          setAuthError('Please check your email to verify your account, then return to claim your profile.');
        }
      } else {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (signInErr) throw signInErr;
        setCurrentUser(data.session.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthSubmitting(false);
    }
  }

  // Render: Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Verifying your secure invitation link...</p>
        <p className="text-xs text-slate-500 mt-2">Checking link security and token validity</p>
      </div>
    );
  }

  // Render: Claimed successfully
  if (claimed) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <Card className="max-w-md w-full bg-slate-900 border-emerald-500/30 text-white">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl text-white">Profile Claimed!</CardTitle>
            <CardDescription className="text-slate-400">
              Welcome to the TalentXcel Professional Network, {profile?.fullName || ''}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <p className="text-sm text-slate-300 text-center">
              Your professional profile is now linked to your authenticated account. You can now customize your visibility, upload your resume, and start matching with verified opportunities.
            </p>
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="text-emerald-400 font-medium">Verified Professional</span>
              </div>
              <div className="flex justify-between">
                <span>Public Visibility:</span>
                <span className="text-slate-300">Private (you control when to publish)</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" 
              onClick={() => navigate('/candidate-dashboard')}
            >
              Go to Your Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => navigate('/resume/build')}
            >
              Build / Upload Resume
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render: Opted out
  if (optedOut) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 text-white text-center">
          <CardHeader>
            <EyeOff className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <CardTitle className="text-xl">You Have Been Unsubscribed</CardTitle>
            <CardDescription className="text-slate-400">
              Your preferences have been updated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">
              You will receive no further invitations or communications from TalentXcel. 
              The invitation token has been permanently invalidated.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render: Error state
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <Card className="max-w-md w-full bg-slate-900 border-red-500/30 text-white">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-xl">Unable to Claim Profile</CardTitle>
            <CardDescription className="text-slate-400">
              {errorCode === 'EXPIRED' && 'This invitation link has expired.'}
              {errorCode === 'ALREADY_CLAIMED' && 'This profile has already been claimed.'}
              {errorCode === 'OPTED_OUT' && 'This contact record has been opted out.'}
              {!errorCode && 'Invalid or missing link.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300 text-center">
            <p>{error}</p>
            {errorCode === 'EXPIRED' && (
              <p className="text-xs text-slate-400">
                Invitation links expire after 14 days for your security. 
                You can create a free account directly using the button below.
              </p>
            )}
            {errorCode === 'ALREADY_CLAIMED' && (
              <p className="text-xs text-slate-400">
                If you previously claimed this profile, please sign in with your email address.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-500"
              onClick={() => navigate('/auth')}
            >
              Sign In to TalentXcel
            </Button>
            <Button 
              variant="outline"
              className="w-full border-slate-700 text-slate-300"
              onClick={() => navigate('/')}
            >
              Visit TalentXcel.in
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render: Valid profile preview & claim interface
  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Invitation Link
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Claim Your TalentXcel Profile</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            You were invited to claim your verified professional presence on India's premier AI career network.
          </p>
        </div>

        {/* Profile Card Preview */}
        {profile && (
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-white font-semibold flex items-center gap-2">
                    {profile.fullName}
                    <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 text-xs font-normal">
                      Invited
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    {profile.currentTitle ? `${profile.currentTitle}${profile.currentCompany ? ` at ${profile.currentCompany}` : ''}` : (profile.headline || 'Professional')}
                  </CardDescription>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expires in 14 days</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Contact Email:</span>
                  <p className="font-mono text-slate-300 mt-0.5">{profile.maskedEmail}</p>
                </div>
                <div>
                  <span className="text-slate-500">Location:</span>
                  <p className="text-slate-300 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {profile.locationCity || 'India'}
                  </p>
                </div>
              </div>

              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <span className="text-xs text-slate-500 block mb-1.5">Detected Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Notice:</strong> Your information is currently isolated in our secure staging environment and is NOT visible in public search or to recruiters until you claim and explicitly publish it.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Claim / Auth Action */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg">
              {currentUser ? 'Confirm & Claim Your Profile' : 'Authenticate to Claim'}
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              {currentUser 
                ? `You are signed in as ${currentUser.email}. Click below to link this profile to your account.`
                : 'Create a password or sign in to permanently link this profile to your secure account.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {currentUser ? (
              <div className="space-y-3">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-xs text-indigo-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>
                    Claiming will link this professional profile to <strong>{currentUser.email}</strong>.
                  </span>
                </div>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                  onClick={handleClaim}
                  disabled={claiming}
                >
                  {claiming ? 'Claiming Profile...' : 'Claim This Profile'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex border-b border-slate-800 text-xs">
                  <button
                    type="button"
                    className={`pb-2 px-3 font-medium border-b-2 transition-colors ${
                      authMode === 'signup' 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                    onClick={() => setAuthMode('signup')}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    className={`pb-2 px-3 font-medium border-b-2 transition-colors ${
                      authMode === 'signin' 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                    onClick={() => setAuthMode('signin')}
                  >
                    I Already Have an Account
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-3">
                  {authError && (
                    <Alert className="bg-red-500/10 border-red-500/30 text-red-300 text-xs">
                      <AlertDescription>{authError}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Your Email</label>
                    <Input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Password</label>
                    <Input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white text-xs"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                    disabled={authSubmitting}
                  >
                    {authSubmitting 
                      ? 'Processing...' 
                      : (authMode === 'signup' ? 'Create Account & Continue' : 'Sign In & Continue')}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Don't want to be contacted?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleOptOut(false)}
                disabled={optOutLoading}
                className="text-slate-400 hover:text-slate-200 underline"
              >
                Unsubscribe
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleOptOut(true)}
                disabled={optOutLoading}
                className="text-red-400 hover:text-red-300 underline"
              >
                Delete My Data
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-600 space-y-1">
          <p>TalentXcel.in — India's Premier AI Career & Recruitment Platform</p>
          <p>
            <Link to="/privacy" className="text-slate-500 hover:underline">Privacy Policy</Link>
            {' • '}
            <Link to="/terms" className="text-slate-500 hover:underline">Terms of Service</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

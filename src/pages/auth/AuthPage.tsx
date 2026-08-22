import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Lock, User, Building, Chrome } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthPageProps {
  mode?: 'signin' | 'signup';
  flow?: 'resume' | 'jobs' | 'interview' | 'insights' | 'employer';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode = 'signin', flow }) => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [authMode, setAuthMode] = useState(mode);
  const [userType, setUserType] = useState<'candidate' | 'employer'>('candidate');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: ''
  });

  // Get flow from URL params or props
  const currentFlow = flow || searchParams.get('flow') || 'resume';
  const redirectTo = searchParams.get('redirect') || location.state?.from || '/network';

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup' || urlMode === 'signin') {
      setAuthMode(urlMode);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  if (!loading && user) {
    return <Navigate to={redirectTo} replace />;
  }

  const getFlowConfig = () => {
    const configs = {
      resume: {
        title: 'Build Your Professional Resume',
        subtitle: 'Free ATS scan + 1 download',
        benefits: ['ATS-optimized templates', 'AI-powered suggestions', 'Free download in PDF/Word']
      },
      jobs: {
        title: 'Find Your Dream Job',
        subtitle: 'First 3 applications free',
        benefits: ['1-click apply', 'AI job matching', 'Application tracking']
      },
      interview: {
        title: 'Ace Your Interviews',
        subtitle: '5 free practice questions',
        benefits: ['Role-specific questions', 'AI feedback', 'Video practice']
      },
      insights: {
        title: 'Get Market Insights',
        subtitle: 'Free salary & skills report',
        benefits: ['Salary benchmarks', 'Skills gap analysis', 'Career recommendations']
      },
      employer: {
        title: 'Find Top Talent',
        subtitle: 'Post jobs & hire faster',
        benefits: ['AI candidate matching', 'Bulk outreach tools', 'ATS integration']
      }
    };
    return configs[currentFlow as keyof typeof configs] || configs.resume;
  };

  const flowConfig = getFlowConfig();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use current domain for redirects
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/onboarding?flow=${currentFlow}&type=${userType}`;
      
      console.log('Auth attempt:', { authMode, userType, redirectUrl });

      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: formData.fullName,
              user_type: userType,
              company_name: userType === 'employer' ? formData.companyName : null,
              onboarding_flow: currentFlow
            }
          }
        });

        if (error) throw error;
        
        console.log('Signup successful:', data);
        toast.success('Check your email to verify your account!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;
        
        console.log('Signin successful:', data);
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // More specific error messages
      let errorMessage = 'An error occurred';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'This email is already registered. Try signing in instead.';
      } else {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'linkedin_oidc') => {
    try {
      setIsLoading(true);
      
      // Use current domain for redirects
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/onboarding?flow=${currentFlow}&type=${userType}`;
      
      console.log('Social auth attempt:', { provider, redirectUrl });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
      
      console.log('Social auth initiated:', data);
      // Don't set loading to false here as page will redirect
    } catch (error: any) {
      console.error('Social auth error:', error);
      
      let errorMessage = 'Social authentication failed';
      if (error.message.includes('OAuth')) {
        errorMessage = 'Please check your browser settings and try again';
      } else {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b bg-background/80 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center p-1 shadow-sm">
            <img 
              src="/talentxcel-official-logo.png" 
              alt="TalentXcel" 
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-lg font-semibold">TalentXcel</span>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left side - Benefits */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{flowConfig.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{flowConfig.subtitle}</p>
              
              <div className="space-y-3">
                {flowConfig.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Proof */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Trusted by professionals at</p>
              <div className="flex items-center gap-4 text-xs font-medium opacity-60">
                <span>Google</span>
                <span>•</span>
                <span>Microsoft</span>
                <span>•</span>
                <span>Amazon</span>
                <span>•</span>
                <span>TCS</span>
              </div>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="flex flex-col justify-center">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-full">
                    <div className="grid w-full grid-cols-2 border rounded-lg p-1 bg-muted">
                      <Button
                        variant={userType === 'candidate' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setUserType('candidate')}
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Job Seeker
                      </Button>
                      <Button
                        variant={userType === 'employer' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setUserType('employer')}
                        className="flex items-center gap-2"
                      >
                        <Building className="h-4 w-4" />
                        Employer
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <CardTitle className="text-2xl">
                    {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
                  </CardTitle>
                  <CardDescription>
                    {authMode === 'signup' 
                      ? `Start your ${userType === 'employer' ? 'hiring' : 'career'} journey today`
                      : `Sign in to your ${userType} account`
                    }
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Fast Login - Social Auth */}
                <div className="space-y-3">
                  <div className="text-center mb-3">
                    <p className="text-sm font-medium text-foreground">⚡ Fast Login</p>
                    <p className="text-xs text-muted-foreground">Sign in with one click</p>
                  </div>
                  
                  <Button
                    onClick={() => handleSocialAuth('google')}
                    disabled={isLoading}
                    className="w-full h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                  >
                    <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-medium">Continue with Google</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleSocialAuth('linkedin_oidc')}
                    disabled={isLoading}
                    className="w-full h-12 bg-[#0077B5] hover:bg-[#005a87] text-white shadow-sm"
                  >
                    <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="font-medium">Continue with LinkedIn</span>
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'signup' && (
                    <>
                      <div className="relative space-y-2">
                        <Input
                          type="text"
                          placeholder="Full Name"
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          required
                          disabled={isLoading}
                          className="pl-10"
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>

                      {userType === 'employer' && (
                        <div className="relative space-y-2">
                          <Input
                            type="text"
                            placeholder="Company Name"
                            value={formData.companyName}
                            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                            required
                            disabled={isLoading}
                            className="pl-10"
                          />
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </>
                  )}

                  <div className="relative space-y-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      disabled={isLoading}
                      className="pl-10"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="relative space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      disabled={isLoading}
                      className="pl-10"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Please wait...' : (authMode === 'signup' ? 'Create Account' : 'Sign In')}
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                  </span>
                  <Button
                    variant="link"
                    onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                    className="p-0 ml-1 h-auto"
                  >
                    {authMode === 'signup' ? 'Sign in' : 'Sign up'}
                  </Button>
                </div>

                {authMode === 'signup' && (
                  <p className="text-xs text-muted-foreground text-center">
                    By creating an account, you agree to our{' '}
                    <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                    {' '}and{' '}
                    <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
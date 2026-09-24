import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Building2, Zap } from 'lucide-react';
import { SocialLogin } from './SocialLogin';
import { useNavigate, useSearchParams } from 'react-router-dom';
import talentxcelLogo from '@/assets/talentxcel-logo.png';
import { conversionTelemetry } from '@/utils/conversionTelemetry';

interface UnifiedAuthFormProps {
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const UnifiedAuthForm = ({ onSuccess, initialMode }: UnifiedAuthFormProps) => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(() => {
    if (initialMode) return initialMode !== 'signup';
    return searchParams.get('mode') !== 'signup';
  });

  const [accountType, setAccountType] = useState<'candidate' | 'employer'>(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'employer' || roleParam === 'recruiter') return 'employer';
    if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/recruiters') || window.location.pathname.startsWith('/hire'))) return 'employer';
    return 'candidate';
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (accountType === 'employer' && !formData.companyName.trim()) {
        toast.error('Please enter your company name');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data.user) {
          // Login successful
          onSuccess?.();
          const { returnUrl } = conversionTelemetry.consumeAcquisitionReturnUrl();
          const metaRole = (data.user.user_metadata as any)?.role || (data.user.user_metadata as any)?.user_type;
          const isEmployer = metaRole === 'employer' || window.location.hostname === 'employer.talentxcel.in' || localStorage.getItem('txc_active_workspace') === 'employer';
          const defaultPath = isEmployer ? '/dashboard?view=role' : '/network';
          const redirectPath = returnUrl || defaultPath;
          navigate(redirectPath);
        }
      } else {
        // Sign Up
        const userRole = accountType === 'employer' ? 'employer' : 'candidate';
        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName.trim(),
              role: userRole,
              user_type: userRole,
              company_name: accountType === 'employer' ? formData.companyName.trim() : undefined,
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data.user) {
          if (accountType === 'employer') {
            localStorage.setItem('txc_active_workspace', 'employer');
          } else {
            localStorage.setItem('txc_active_workspace', 'candidate');
          }

          toast.success(accountType === 'employer' ? 'Recruiter account created! Welcome to Recruiter OS 🎉' : 'Account created successfully! 🎉');
          onSuccess?.();
          const { source, returnUrl } = conversionTelemetry.consumeAcquisitionReturnUrl();
          conversionTelemetry.track('signup_completed', { source: source || 'direct', role: userRole });
          const defaultPath = accountType === 'employer' || window.location.hostname === 'employer.talentxcel.in' ? '/dashboard?view=role' : '/network';
          const redirectPath = returnUrl || defaultPath;
          navigate(redirectPath);
        }
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-transparent border-0 shadow-none">
      <CardContent className="p-0 space-y-4">
        {/* Compact TalentXcel Branding */}
        <div className="text-center space-y-2 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-center space-x-2">
            <img src={talentxcelLogo} alt="TalentXcel" className="w-8 h-8" />
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TalentXcel
            </h2>
          </div>
        </div>

        {/* Compact Tab Toggle */}
        <div className="flex bg-slate-50 rounded-lg p-1 mb-2">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
              isLogin
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              conversionTelemetry.track('signup_started');
            }}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
              !isLogin
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Role Toggle for Sign Up */}
        {!isLogin && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAccountType('candidate')}
              className={`py-1.5 rounded transition-all flex items-center justify-center gap-1 ${
                accountType === 'candidate'
                  ? 'bg-white text-blue-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="h-3 w-3" />
              <span>Job Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('employer')}
              className={`py-1.5 rounded transition-all flex items-center justify-center gap-1 ${
                accountType === 'employer'
                  ? 'bg-white text-blue-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-3 w-3 text-blue-500" />
              <span>Recruiter OS</span>
            </button>
          </div>
        )}

        {/* Contextual Value Proposition Banner */}
        {!isLogin && (
          <div className="bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 rounded-xl p-2.5 text-center space-y-0.5 shadow-sm">
            <p className="text-xs font-bold text-blue-950 dark:text-blue-200">
              {accountType === 'employer' 
                ? 'Search 12,000+ candidates & manage talent in Recruiter OS.' 
                : typeof window !== 'undefined' && sessionStorage.getItem('txc_acquisition_source') === 'ats_scanner'
                  ? 'Save your ATS score and unlock your personalized job matches.'
                  : typeof window !== 'undefined' && sessionStorage.getItem('txc_acquisition_source') === 'seo_job_page'
                    ? 'Check ATS compatibility and apply directly to verified roles.'
                    : 'Save your profile and unlock verified matching jobs.'}
            </p>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
              {accountType === 'employer' ? 'Free Recruiter Workspace' : 'Free Candidate Account • 100% Free'}
            </p>
          </div>
        )}

        {/* Compact Social Login */}
        <div className="space-y-2">
          <SocialLogin variant="prominent" />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-500 font-medium">
              Or with email
            </span>
          </div>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-xs font-medium text-slate-700">
                {accountType === 'employer' ? 'Recruiter / Hiring Lead Name' : 'Full Name'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder={accountType === 'employer' ? 'e.g. Sarah Jenkins' : 'Enter your full name'}
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-10 h-9 border-slate-200 focus:border-blue-500 text-sm"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {!isLogin && accountType === 'employer' && (
            <div className="space-y-1">
              <Label htmlFor="companyName" className="text-xs font-medium text-slate-700">
                Company Name
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="e.g. Acme Corp / TechScale"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="pl-10 h-9 border-slate-200 focus:border-blue-500 text-sm"
                  required={!isLogin && accountType === 'employer'}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-medium text-slate-700">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 h-9 border-slate-200 focus:border-blue-500 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-medium text-slate-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 h-9 border-slate-200 focus:border-blue-500 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-9 border-slate-200 focus:border-blue-500 text-sm"
                  required={!isLogin}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-9 font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isLogin ? 'Signing in...' : 'Creating...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        {isLogin && (
          <div className="text-center">
            <button 
              type="button"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        {!isLogin && (
          <p className="text-xs text-slate-500 text-center">
            By creating an account, you agree to our Terms & Privacy Policy
          </p>
        )}
      </CardContent>
    </Card>
  );
};
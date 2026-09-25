import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check, Shield, Zap, Users, Target, Building2 } from 'lucide-react';
import { SocialLogin } from './SocialLogin';
import { generatePersonProfileSlug, ensureUserProfileSlug } from '@/utils/userProfileSlug';
import { PLATFORM_METRICS } from '@/config/platformMetrics';

// Restored full register form functionality with Recruiter OS support
export const MinimalRegisterForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrlParam = searchParams.get('returnUrl') || searchParams.get('redirect');
  const roleParam = searchParams.get('role');

  const [accountType, setAccountType] = useState<'candidate' | 'employer'>(
    roleParam === 'employer' || roleParam === 'recruiter' ? 'employer' : 'candidate'
  );
  const [companyName, setCompanyName] = useState('');

  // Password validation helpers
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      toast.error('Password must meet all requirements');
      return;
    }

    if (accountType === 'employer' && !companyName.trim()) {
      toast.error('Please enter your company or organization name');
      return;
    }

    setLoading(true);

    try {
      const profileSlug = generatePersonProfileSlug(fullName, email);
      const userRole = accountType === 'employer' ? 'employer' : 'candidate';

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: userRole,
            user_type: userRole,
            company_name: accountType === 'employer' ? companyName.trim() : undefined,
            slug: profileSlug,
            custom_profile_url: profileSlug,
            username: profileSlug.replace(/-/g, '')
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // Ensure profile row has the clean first-middle-last / first-last slug immediately
        try {
          await ensureUserProfileSlug(data.user.id, fullName.trim(), email.trim());
        } catch (_) {}

        if (accountType === 'employer') {
          localStorage.setItem('txc_active_workspace', 'employer');
        } else {
          localStorage.setItem('txc_active_workspace', 'candidate');
        }

        // If email confirmation is required by Supabase, session is null
        if (!data.session) {
          toast.success('Verification link sent! Please check your email inbox.');
          navigate(`/auth/login?registered=true&role=${userRole}&email=${encodeURIComponent(email.trim())}`);
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const redirectParam = urlParams.get('redirect') || urlParams.get('returnUrl');
        
        if (accountType === 'employer') {
          toast.success('Recruiter account created! Welcome to Recruiter OS 🎉');
          navigate(redirectParam ? decodeURIComponent(redirectParam) : '/dashboard?view=role');
        } else {
          const targetUrl = redirectParam ? decodeURIComponent(redirectParam) : '/network';
          toast.success('Account created successfully! 🎉');
          navigate(targetUrl);
        }
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Social Login */}
      <div>
        <SocialLogin variant="default" />
      </div>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400 font-medium">
            or continue with email
          </span>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setAccountType('candidate')}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            accountType === 'candidate'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Job Seeker</span>
        </button>

        <button
          type="button"
          onClick={() => setAccountType('employer')}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            accountType === 'employer'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Building2 className="h-3.5 w-3.5 text-blue-500" />
          <span>Recruiter / Employer</span>
        </button>
      </div>

      {accountType === 'employer' && (
        <div className="p-2.5 rounded-lg bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200 flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span>Creates an employer account with immediate access to <strong>Recruiter OS</strong> and {PLATFORM_METRICS.totalProfessionalsDisplay} verified candidates.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="space-y-1">
          <Label htmlFor="fullName" className="text-xs font-medium text-slate-700">
            {accountType === 'employer' ? 'Full Name / Recruiter Name' : 'Full Name'}
          </Label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              id="fullName"
              type="text"
              placeholder={accountType === 'employer' ? 'e.g. Sarah Jenkins' : 'Enter your full name'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium text-slate-800"
              required
              autoComplete="name"
              maxLength={100}
            />
          </div>
        </div>

        {accountType === 'employer' && (
          <div className="space-y-1">
            <Label htmlFor="companyName" className="text-xs font-medium text-slate-700">
              Company / Organization Name
            </Label>
            <div className="relative group">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="companyName"
                type="text"
                placeholder="e.g. Acme Corp / TechScale AI"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="pl-10 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium text-slate-800"
                required={accountType === 'employer'}
                maxLength={100}
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs font-medium text-slate-700">
            {accountType === 'employer' ? 'Work Email Address' : 'Email Address'}
          </Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              id="email"
              type="email"
              placeholder={accountType === 'employer' ? 'name@company.com' : 'Enter your email address'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium text-slate-800"
              required
              autoComplete="email"
              maxLength={254}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" className="text-xs font-medium text-slate-700">
            Password
          </Label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-12 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium text-slate-800"
              required
              autoComplete="new-password"
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-2 pt-1">
          <Checkbox 
            id="terms" 
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="text-xs text-slate-600 font-normal leading-tight cursor-pointer">
            I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </Label>
        </div>

        <Button 
          type="submit" 
          className="w-full h-10 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer mt-1" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>{accountType === 'employer' ? 'Setting up Recruiter OS...' : 'Creating account...'}</span>
            </div>
          ) : (
            accountType === 'employer' ? 'Create Recruiter Account (Recruiter OS)' : 'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center pt-1">
        <p className="text-xs text-slate-600">
          Already have an account?{' '}
          <Link 
            to={`/auth/login${returnUrlParam ? `?returnUrl=${encodeURIComponent(returnUrlParam)}` : ''}`} 
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
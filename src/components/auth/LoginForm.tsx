import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { SocialLogin } from './SocialLogin';
import { getSubdomainRedirect } from '@/utils/subdomainRedirect';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get return URL from query params
  const returnUrl = searchParams.get('returnUrl');
  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // User is already logged in, redirect appropriately
        if (returnUrl) {
          navigate(decodeURIComponent(returnUrl));
        } else if (redirectParam) {
          navigate(redirectParam);
        } else {
          const subdomainPath = getSubdomainRedirect();
          const redirectPath = subdomainPath || '/network';
          navigate(redirectPath);
        }
      }
    };
    checkUser();
  }, [navigate, returnUrl, redirectParam]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!email || !password) {
        toast.error('Please fill in all fields');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAttemptCount(prev => prev + 1);
        
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before signing in.');
        } else {
          toast.error('Unable to sign in. Please try again later.');
        }
        return;
      }

      if (data.user) {
        // Login successful - no toast message
        
        // Redirect to return URL, subdomain path, or appropriate dashboard
        if (returnUrl) {
          navigate(decodeURIComponent(returnUrl));
        } else if (redirectParam) {
          navigate(redirectParam);
        } else {
          const subdomainPath = getSubdomainRedirect();
          const redirectPath = subdomainPath || '/network';
          navigate(redirectPath);
        }
      }
    } catch (error: any) {
      setAttemptCount(prev => prev + 1);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Social Login */}
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

      {/* Enhanced Email Login Form */}
      <form onSubmit={handleEmailLogin} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs font-medium text-slate-700">
            Email Address
          </Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-12 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium text-slate-800"
              required
              autoComplete="current-password"
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link 
            to="/auth/forgot-password" 
            className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          className="w-full h-10 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer" 
          disabled={loading || attemptCount >= 5}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <Link 
              to={`/auth/register${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

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
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { useSecurityContext } from '@/components/security/SecurityProvider';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [attemptCount, setAttemptCount] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { validateAuthInput, isValidating } = useSecurityValidation();
  const { logSecurityEvent } = useSecurityContext();

  // Get return URL from query params
  const returnUrl = searchParams.get('returnUrl');

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // User is already logged in, redirect appropriately
        if (returnUrl) {
          navigate(decodeURIComponent(returnUrl));
        } else {
          navigate('/network');
        }
      }
    };
    checkUser();
  }, [navigate, returnUrl]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    try {
      // Enhanced security validation
      const userIdentifier = email || `${Date.now()}-${Math.random()}`;
      
      // Validate inputs with security checks
      const validation = await validateAuthInput(email, password, userIdentifier);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setAttemptCount(prev => prev + 1);
        
        // Log failed validation attempt
        await logSecurityEvent(
          'login_validation_failed',
          'Login attempt failed validation',
          {
            email: email ? email.substring(0, 3) + '***' : 'empty',
            attemptCount: attemptCount + 1,
            errors: Object.keys(validation.errors),
            userAgent: navigator.userAgent
          }
        );
        
        toast.error('Please check your input and try again');
        return;
      }

      // Log successful validation
      await logSecurityEvent(
        'login_attempt',
        'User attempting to sign in',
        {
          email: email.substring(0, 3) + '***',
          attemptCount: attemptCount + 1
        }
      );

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAttemptCount(prev => prev + 1);
        
        // Log authentication failure
        await logSecurityEvent(
          'login_failed',
          'Authentication failed',
          {
            email: email.substring(0, 3) + '***',
            error: error.message,
            attemptCount: attemptCount + 1,
            userAgent: navigator.userAgent
          }
        );
        
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before signing in.');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          toast.error('Unable to sign in. Please try again later.');
        }
        return;
      }

      if (data.user) {
        // Log successful login
        await logSecurityEvent(
          'login_success',
          'User successfully signed in',
          {
            userId: data.user.id,
            email: email.substring(0, 3) + '***',
            sessionId: data.session?.access_token.substring(0, 10) + '...'
          }
        );
        
        toast.success('Welcome back! 🎉');
        
        // Redirect to return URL or network
        if (returnUrl) {
          navigate(decodeURIComponent(returnUrl));
        } else {
          navigate('/network');
        }
      }
    } catch (error: any) {
      setAttemptCount(prev => prev + 1);
      
      // Log unexpected error
      await logSecurityEvent(
        'login_system_error',
        'Unexpected error during login',
        {
          email: email ? email.substring(0, 3) + '***' : 'empty',
          error: error.message || 'Unknown error',
          attemptCount: attemptCount + 1
        }
      );
      
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          {returnUrl ? 'Login to Continue' : 'Welcome back'}
        </CardTitle>
        <CardDescription className="text-sm text-slate-600 font-medium">
          {returnUrl 
            ? 'Please sign in to apply for this job'
            : 'Sign in to your account to continue your journey'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Enhanced Social Login */}
        <div className="space-y-3">
          <SocialLogin variant="prominent" />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-500 font-semibold tracking-wide">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Enhanced Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
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
                className={`pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium text-slate-800 ${
                  validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
                required
                autoComplete="email"
                maxLength={254}
              />
              {validationErrors.email && (
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            {validationErrors.email && (
              <p className="text-xs text-red-600 font-medium mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
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
                className={`pl-10 pr-12 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium text-slate-800 ${
                  validationErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
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
              {validationErrors.password && (
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            {validationErrors.password && (
              <p className="text-xs text-red-600 font-medium mt-1">{validationErrors.password}</p>
            )}
            {validationErrors.general && (
              <p className="text-xs text-red-600 font-medium mt-1">{validationErrors.general}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-sm">
              <Link 
                to="/auth/forgot-password" 
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading || isValidating || attemptCount >= 5}
          >
            {loading || isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isValidating ? 'Validating...' : 'Signing in...'}
              </>
            ) : attemptCount >= 5 ? (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Too many attempts
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          
          {attemptCount >= 3 && attemptCount < 5 && (
            <div className="text-xs text-amber-600 text-center mt-2 p-2 bg-amber-50 rounded border border-amber-200">
              <AlertTriangle className="inline h-3 w-3 mr-1" />
              Multiple failed attempts detected. Please verify your credentials.
            </div>
          )}
          
          {attemptCount >= 5 && (
            <div className="text-xs text-red-600 text-center mt-2 p-2 bg-red-50 rounded border border-red-200">
              <AlertTriangle className="inline h-3 w-3 mr-1" />
              Account temporarily locked. Please wait 15 minutes before trying again.
            </div>
          )}
        </form>

        <div className="text-center pt-2">
          <span className="text-sm text-slate-600 font-medium">Don't have an account? </span>
          <Link 
            to={`/auth/register${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
          >
            Sign up for free
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;

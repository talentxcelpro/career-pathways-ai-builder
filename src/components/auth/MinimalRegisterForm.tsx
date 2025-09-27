import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check, Shield, Zap, Users, Target } from 'lucide-react';
import { SocialLogin } from './SocialLogin';

// Restored full register form functionality
export const MinimalRegisterForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(true);
  const navigate = useNavigate();

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

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success('Account created successfully! 🎉');
        navigate('/network');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">Create Account</CardTitle>
        <CardDescription className="text-sm text-slate-600 font-medium">
          Get started with your free TalentXcel account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Social Login */}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Full Name
            </Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium text-slate-800"
                required
                autoComplete="name"
                maxLength={100}
              />
            </div>
          </div>

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
                className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium text-slate-800"
                required
                autoComplete="email"
                maxLength={254}
              />
            </div>
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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-12 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium text-slate-800"
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
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            
            {/* Password Requirements */}
            {password && (
              <div className="space-y-1 mt-2">
                <div className="flex items-center space-x-2">
                  <Check className={`h-3 w-3 ${hasMinLength ? 'text-green-500' : 'text-slate-300'}`} />
                  <span className={`text-xs ${hasMinLength ? 'text-green-600' : 'text-slate-500'}`}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className={`h-3 w-3 ${hasUppercase ? 'text-green-500' : 'text-slate-300'}`} />
                  <span className={`text-xs ${hasUppercase ? 'text-green-600' : 'text-slate-500'}`}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className={`h-3 w-3 ${hasLowercase ? 'text-green-500' : 'text-slate-300'}`} />
                  <span className={`text-xs ${hasLowercase ? 'text-green-600' : 'text-slate-500'}`}>
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className={`h-3 w-3 ${hasNumber ? 'text-green-500' : 'text-slate-300'}`} />
                  <span className={`text-xs ${hasNumber ? 'text-green-600' : 'text-slate-500'}`}>
                    One number
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Terms and Privacy Checkbox */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                  I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link to="/privacypolicy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </Label>
                <p className="text-xs text-slate-500">Required to create your account</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="subscribe"
                checked={subscribeToUpdates}
                onCheckedChange={(checked) => setSubscribeToUpdates(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label htmlFor="subscribe" className="text-sm text-slate-700 cursor-pointer">
                  Subscribe to career insights and updates
                </Label>
                <p className="text-xs text-slate-500">Get the latest job opportunities and career tips</p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">What you'll get with TalentXcel</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-600">AI-powered job matching</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-600">Professional networking tools</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-600">Career coaching & insights</span>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="text-center pt-2">
          <span className="text-sm text-slate-600 font-medium">Already have an account? </span>
          <Link 
            to="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-green-800">Your data is secure with us</p>
              <p className="text-xs text-green-700">
                We use industry-standard encryption to protect your personal information.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
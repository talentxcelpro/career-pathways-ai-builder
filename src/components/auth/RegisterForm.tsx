
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Gift } from 'lucide-react';
import { SocialLogin } from './SocialLogin';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const navigate = useNavigate();
  const { triggerWelcomeEmail } = useEmailAutomation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced input validation and sanitization
    const sanitizedEmail = formData.email.trim().toLowerCase();
    const sanitizedFullName = formData.fullName.trim();
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Name validation
    if (sanitizedFullName.length < 2 || sanitizedFullName.length > 100) {
      toast.error("Full name must be between 2 and 100 characters");
      return;
    }

    // XSS prevention for name
    if (/<[^>]*>/g.test(sanitizedFullName)) {
      toast.error("Full name contains invalid characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Enhanced password validation
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: sanitizedFullName,
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // Process referral if referral code exists
        if (referralCode) {
          try {
            await supabase.rpc('process_successful_referral', {
              p_referee_id: data.user.id,
              p_referral_code: referralCode
            });
            console.log('Referral processed successfully');
          } catch (referralError) {
            console.error('Failed to process referral:', referralError);
            // Don't show error to user as registration was successful
          }
        }

        toast.success('Account created successfully! Please check your email to verify your account.');
        
        // Trigger welcome email
        try {
          await triggerWelcomeEmail(formData.email, formData.fullName);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't show error to user as registration was successful
        }
        
        navigate('/auth/login');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Get started with your free TalentXcel account
        </CardDescription>
        {referralCode && (
          <Badge variant="secondary" className="mt-2">
            <Gift className="w-4 h-4 mr-1" />
            Referral Code Applied
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Social Registration */}
        <div className="space-y-4">
          <SocialLogin variant="prominent" />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground font-medium">
              Or register with email
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-12 h-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 pr-12 h-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 font-semibold" 
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

        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link 
            to="/auth/login" 
            className="text-blue-600 hover:text-blue-500 font-medium hover:underline"
          >
            Sign in
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacypolicy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

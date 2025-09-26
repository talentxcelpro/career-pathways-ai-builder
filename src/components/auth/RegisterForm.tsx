
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Gift, Check, X, Shield, Zap } from 'lucide-react';
import { SocialLogin } from './SocialLogin';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: '',
    company: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeUpdates, setSubscribeUpdates] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const navigate = useNavigate();
  const { triggerWelcomeEmail } = useEmailAutomation();

  // Email availability checker with debounce
  useEffect(() => {
    const checkEmailAvailability = async (email: string) => {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailAvailable(null);
        return;
      }

      setCheckingEmail(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        
        setEmailAvailable(!data);
      } catch (error) {
        setEmailAvailable(true); // Assume available on error
      } finally {
        setCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (formData.email) {
        checkEmailAvailability(formData.email);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  // Password strength calculator
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 30) return 'bg-red-500';
    if (strength < 60) return 'bg-yellow-500';
    if (strength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Profile picture must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update password strength in real-time
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
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

    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (emailAvailable === false) {
      toast.error('This email is already registered. Please use a different email or try signing in.');
      return;
    }

    setLoading(true);

    try {
      // Upload profile picture if provided
      let profilePictureUrl = null;
      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, profilePicture);

        if (uploadError) {
          console.error('Profile picture upload failed:', uploadError);
          toast.error('Failed to upload profile picture, but account will still be created');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(fileName);
          profilePictureUrl = publicUrl;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: sanitizedFullName,
            job_title: formData.jobTitle,
            company: formData.company,
            profile_picture_url: profilePictureUrl,
            subscribe_to_updates: subscribeUpdates
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

        {/* Profile Picture Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Profile Picture (Optional)</Label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Upload a profile picture to personalize your account
              </p>
              <p className="text-xs text-muted-foreground">
                Max 5MB • JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="pl-10 pr-10 h-11"
                required
              />
              {/* Email availability indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {checkingEmail && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
                {!checkingEmail && emailAvailable === true && formData.email && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {!checkingEmail && emailAvailable === false && (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            {emailAvailable === false && (
              <p className="text-xs text-red-600">This email is already registered</p>
            )}
            {emailAvailable === true && formData.email && (
              <p className="text-xs text-green-600">Email is available</p>
            )}
          </div>

          {/* Optional professional details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-sm font-medium">Job Title (Optional)</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                type="text"
                placeholder="e.g. Software Engineer"
                value={formData.jobTitle}
                onChange={handleChange}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">Company (Optional)</Label>
              <Input
                id="company"
                name="company"
                type="text"
                placeholder="e.g. TechCorp"
                value={formData.company}
                onChange={handleChange}
                className="h-11"
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
            {/* Real-time password strength indicator */}
            {formData.password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength < 30 ? 'text-red-600' :
                    passwordStrength < 60 ? 'text-yellow-600' :
                    passwordStrength < 80 ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
                <Progress 
                  value={passwordStrength} 
                  className="h-1.5"
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    {formData.password.length >= 8 ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-red-500" />
                    )}
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[A-Z]/.test(formData.password) ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-red-500" />
                    )}
                    <span>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[a-z]/.test(formData.password) ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-red-500" />
                    )}
                    <span>One lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/\d/.test(formData.password) ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-red-500" />
                    )}
                    <span>One number</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terms and updates preferences */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-0.5"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the Terms of Service and Privacy Policy
                </label>
                <p className="text-xs text-muted-foreground">
                  Required to create your account
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="updates" 
                checked={subscribeUpdates}
                onCheckedChange={(checked) => setSubscribeUpdates(checked as boolean)}
                className="mt-0.5"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="updates"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Subscribe to career insights and updates
                </label>
                <p className="text-xs text-muted-foreground">
                  Get the latest job opportunities and career tips
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced feature highlights */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              What you'll get with TalentXcel
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-green-600" />
                <span>AI-powered job matching</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-green-600" />
                <span>Professional networking tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-green-600" />
                <span>Career coaching & insights</span>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 font-semibold" 
            disabled={loading || !agreeToTerms || emailAvailable === false || checkingEmail}
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

        {/* Security notice */}
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Your data is secure with us</span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            We use industry-standard encryption to protect your personal information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

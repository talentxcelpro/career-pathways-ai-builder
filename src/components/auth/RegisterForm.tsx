
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Gift, Check, X, Shield, Zap } from 'lucide-react';
import { SocialLogin } from './SocialLogin';
import { useOptimizedRegistration } from '@/hooks/useOptimizedRegistration';
import { useTurbo, useInView } from '@/hooks/useTurbo';
import { toast } from '@/hooks/use-toast';

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
  
  // Optimized hooks
  const { 
    loading, 
    progress, 
    register, 
    checkEmailAvailability, 
    calculatePasswordStrength, 
    getPasswordStrengthDetails 
  } = useOptimizedRegistration();
  const { ref: formRef, isInView } = useInView();
  const cardRef = useRef<HTMLDivElement>(null);

  // Optimized email availability checker with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (formData.email) {
        setCheckingEmail(true);
        const available = await checkEmailAvailability(formData.email);
        setEmailAvailable(available);
        setCheckingEmail(false);
      }
    }, 300); // Reduced debounce time for faster response

    return () => clearTimeout(timeoutId);
  }, [formData.email, checkEmailAvailability]);

  // Memoized password strength details
  const passwordStrengthDetails = useMemo(() => 
    getPasswordStrengthDetails(passwordStrength), 
    [passwordStrength, getPasswordStrengthDetails]
  );

  // Optimized profile picture handler
  const handleProfilePictureChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant validation
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Profile picture must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select a valid image file',
        variant: 'destructive'
      });
      return;
    }

    setProfilePicture(file);
    
    // Use createObjectURL for instant preview (faster than FileReader)
    const previewUrl = URL.createObjectURL(file);
    setProfilePicturePreview(previewUrl);
    
    // Cleanup previous object URL
    return () => URL.revokeObjectURL(previewUrl);
  }, []);

  // Optimized form handler
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update password strength in real-time
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  }, [calculatePasswordStrength]);

  // Optimized form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailAvailable === false) {
      toast({
        title: 'Email Already Registered',
        description: 'This email is already registered. Please use a different email or try signing in.',
        variant: 'destructive'
      });
      return;
    }

    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      jobTitle: formData.jobTitle,
      company: formData.company,
      profilePicture,
      agreeToTerms,
      subscribeUpdates
    }, referralCode);

    if (result.success) {
      navigate('/auth/login');
    }
  }, [formData, profilePicture, agreeToTerms, subscribeUpdates, emailAvailable, referralCode, register, navigate]);

  return (
    <Card ref={cardRef} className="w-full max-w-md mx-auto shadow-xl">
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

        {/* Progress indicator for registration */}
        {loading && progress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Creating account...</span>
              <span className="text-primary font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

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
                  <span className={`font-medium ${passwordStrengthDetails.textColor}`}>
                    {passwordStrengthDetails.text}
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

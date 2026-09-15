import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTurbo } from './useTurbo';

interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  jobTitle?: string;
  company?: string;
  profilePicture?: File | null;
  agreeToTerms: boolean;
  subscribeUpdates: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const useOptimizedRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { getMetrics } = useTurbo('RegistrationForm');

  // Optimized validation with memoization
  const validateForm = useCallback((data: RegistrationData): ValidationResult => {
    const errors: Record<string, string> = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim().toLowerCase())) {
      errors.email = 'Please enter a valid email address';
    }

    // Name validation with XSS protection
    const sanitizedName = data.fullName.trim();
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      errors.fullName = 'Full name must be between 2 and 100 characters';
    }
    if (/<[^>]*>/g.test(sanitizedName)) {
      errors.fullName = 'Full name contains invalid characters';
    }

    // Password validation
    if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Password confirmation
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement
    if (!data.agreeToTerms) {
      errors.agreeToTerms = 'Please agree to the Terms of Service and Privacy Policy';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  // Fast profile picture upload
  const uploadProfilePicture = useCallback(async (file: File): Promise<string | null> => {
    if (!file) return null;

    try {
      // Optimize file before upload
      const optimizedFile = await optimizeImage(file);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, optimizedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      return null;
    }
  }, []);

  // Image optimization for faster uploads
  const optimizeImage = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Resize to maximum 400x400 for profile pictures
        const maxSize = 400;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Optimized registration with progress tracking
  const register = useCallback(async (data: RegistrationData, referralCode?: string | null) => {
    setLoading(true);
    setProgress(10);

    try {
      // Step 1: Validate form
      const validation = validateForm(data);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError);
        return { success: false, errors: validation.errors };
      }
      setProgress(25);

      // Step 2: Upload profile picture (if provided)
      let profilePictureUrl = null;
      if (data.profilePicture) {
        profilePictureUrl = await uploadProfilePicture(data.profilePicture);
        if (!profilePictureUrl) {
          toast.error('Failed to upload profile picture, but account will still be created');
        }
      }
      setProgress(50);

      // Step 3: Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: data.fullName.trim(),
            job_title: data.jobTitle || '',
            company: data.company || '',
            profile_picture_url: profilePictureUrl,
            subscribe_to_updates: data.subscribeUpdates
          }
        }
      });

      if (authError) {
        toast.error(authError.message);
        return { success: false, error: authError.message };
      }
      setProgress(75);

      // Step 4: Process referral (if exists)
      if (authData.user && referralCode) {
        try {
          await supabase.rpc('process_successful_referral', {
            p_referee_id: authData.user.id,
            p_referral_code: referralCode
          });
        } catch (referralError) {
          console.error('Failed to process referral:', referralError);
          // Don't fail registration for referral errors
        }
      }
      setProgress(90);

      // Step 5: Queue welcome email
      try {
        await supabase
          .from('email_automation_queue')
          .insert({
            trigger_type: 'welcome',
            recipient_email: data.email,
            recipient_name: data.fullName,
            template_data: {
              first_name: data.fullName.split(' ')[0],
              name: data.fullName
            },
            scheduled_at: new Date().toISOString()
          });
      } catch (emailError) {
        console.error('Failed to queue welcome email:', emailError);
        // Don't fail registration for email errors
      }
      setProgress(100);

      toast.success('Account created successfully! Please check your email to verify your account.');
      
      return { 
        success: true, 
        user: authData.user,
        metrics: getMetrics()
      };

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [validateForm, uploadProfilePicture, getMetrics]);

  // Real-time email availability checker
  const checkEmailAvailability = useCallback(async (email: string): Promise<boolean | null> => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();
      
      return !data; // Available if no existing record
    } catch (error) {
      return true; // Assume available on error
    }
  }, []);

  // Password strength calculator
  const calculatePasswordStrength = useCallback((password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  }, []);

  // Memoized password strength details
  const getPasswordStrengthDetails = useMemo(() => (strength: number) => ({
    color: strength < 30 ? 'bg-red-500' : 
           strength < 60 ? 'bg-yellow-500' : 
           strength < 80 ? 'bg-blue-500' : 'bg-green-500',
    text: strength < 30 ? 'Weak' : 
          strength < 60 ? 'Fair' : 
          strength < 80 ? 'Good' : 'Strong',
    textColor: strength < 30 ? 'text-red-600' : 
               strength < 60 ? 'text-yellow-600' : 
               strength < 80 ? 'text-blue-600' : 'text-green-600'
  }), []);

  return {
    loading,
    progress,
    register,
    validateForm,
    checkEmailAvailability,
    calculatePasswordStrength,
    getPasswordStrengthDetails
  };
};
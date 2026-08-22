import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useMobileDetection } from '@/hooks/useMobileDetection';

export const MobileAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useMobileDetection();

  useEffect(() => {
    if (user) {
      navigate('/network', { replace: true });
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Login successful - no toast message
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        toast.success('Account created! Check your email to verify.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Access on Mobile</h2>
          <p className="text-gray-600 text-center">
            This mobile-optimized auth experience is designed for mobile devices. 
            Please switch to mobile or use the regular web interface.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-accent/10 flex flex-col">
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-6">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto mb-4 flex items-center justify-center p-2 shadow-lg border border-slate-800">
          <img 
            src="/talentxcel-official-logo.png" 
            alt="TalentXcel logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">TalentXcel</h1>
        <p className="text-gray-600">Your AI-powered career companion</p>
      </div>

      {/* Auth Form */}
      <div className="flex-1 px-6">
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {isLogin ? 'Welcome back!' : 'Get started today'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isLogin ? 'Sign in to continue your journey' : 'Create your account in seconds'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 text-base"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium"
            >
              {isLogin ? 'New here? Create account' : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>
      </div>

      {/* Benefits Section */}
      <div className="px-6 py-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>AI-powered job matching</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Smart resume builder</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Career coaching & insights</span>
          </div>
        </div>
      </div>
    </div>
  );
};
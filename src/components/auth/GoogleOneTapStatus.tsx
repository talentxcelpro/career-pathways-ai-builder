import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, Zap, Shield, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleOneTapStatusProps {
  className?: string;
}

export const GoogleOneTapStatus: React.FC<GoogleOneTapStatusProps> = ({ 
  className = '' 
}) => {
  const { user } = useAuth();
  const [oneTapAvailable, setOneTapAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Google One Tap is available
    const checkOneTapAvailability = () => {
      if (window.google?.accounts?.id && !user) {
        setOneTapAvailable(true);
      }
    };

    if (window.google) {
      checkOneTapAvailability();
    } else {
      // Wait for Google script to load
      const checkScript = setInterval(() => {
        if (window.google) {
          checkOneTapAvailability();
          clearInterval(checkScript);
        }
      }, 100);

      return () => clearInterval(checkScript);
    }
  }, [user]);

  const handleManualGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/network`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        toast.error('Failed to sign in with Google');
        console.error('Google OAuth error:', error);
      }
    } catch (error) {
      toast.error('Authentication failed');
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerOneTap = () => {
    if (window.google?.accounts?.id?.prompt) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          toast.info('Google One Tap is not available. Using standard sign-in.');
          handleManualGoogleSignIn();
        }
      });
    } else {
      handleManualGoogleSignIn();
    }
  };

  // Don't show if user is already logged in
  if (user) return null;

  return (
    <Card className={`border-0 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-sm ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <LogIn className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Quick Sign In Available
              </h3>
              <p className="text-xs text-gray-600">
                {oneTapAvailable 
                  ? 'One-tap Google Sign In is ready' 
                  : 'Sign in with Google to access your network'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {oneTapAvailable && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <Zap className="w-3 h-3 mr-1" />
                One Tap
              </Badge>
            )}
            
            <Button
              onClick={triggerOneTap}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <img 
                    src="https://developers.google.com/identity/images/g-logo.png" 
                    alt="Google" 
                    className="w-3 h-3"
                  />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Feature highlights for signed out users */}
        <div className="mt-3 pt-3 border-t border-blue-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-1">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Secure</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Instant</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Network</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
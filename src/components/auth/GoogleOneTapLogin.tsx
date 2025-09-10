import React from 'react';
import { useGoogleOneTap } from '@/hooks/useGoogleOneTap';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GoogleOneTapLoginProps {
  disabled?: boolean;
  autoSelect?: boolean;
}

export const GoogleOneTapLogin: React.FC<GoogleOneTapLoginProps> = ({ 
  disabled = false,
  autoSelect = true 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Don't show One Tap if user is already logged in
  const isDisabled = disabled || !!user;

  const handleSuccess = () => {
    // Get redirect path from URL params or stored context
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    const storedRedirect = localStorage.getItem('subdomain_redirect');
    const redirectPath = redirectParam || storedRedirect || '/network';
    navigate(redirectPath, { replace: true });
  };

  const handleError = (error: string) => {
    console.error('Google One Tap error:', error);
  };

  useGoogleOneTap({
    clientId: '888146676949-fl3fn4ijhgduneqmmpbbpamlio30lm8g.apps.googleusercontent.com',
    onSuccess: handleSuccess,
    onError: handleError,
    autoSelect,
    disabled: isDisabled,
  });

  // This component doesn't render any UI - it just manages the One Tap functionality
  return null;
};
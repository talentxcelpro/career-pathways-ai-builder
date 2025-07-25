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
    // Redirect to network page after successful login
    navigate('/network', { replace: true });
  };

  const handleError = (error: string) => {
    console.error('Google One Tap error:', error);
  };

  useGoogleOneTap({
    clientId: '1019718523965-4j8u6i7g48fcfq0g5f1a4j2v4b5o8k9m.apps.googleusercontent.com', // Replace with your actual client ID
    onSuccess: handleSuccess,
    onError: handleError,
    autoSelect,
    disabled: isDisabled,
  });

  // This component doesn't render any UI - it just manages the One Tap functionality
  return null;
};
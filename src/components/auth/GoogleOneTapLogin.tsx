import React from 'react';
import { FastGoogleOneTap } from './FastGoogleOneTap';
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
    console.log('🎉 Google One Tap login successful!');
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    const storedRedirect = localStorage.getItem('subdomain_redirect');
    const redirectPath = redirectParam || storedRedirect || '/network';
    
    // Clean up stored redirects
    localStorage.removeItem('subdomain_redirect');
    
    navigate(redirectPath, { replace: true });
  };

  return (
    <FastGoogleOneTap
      onSuccess={handleSuccess}
      autoSelect={autoSelect}
      disabled={isDisabled}
    />
  );
};
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useNavigate } from 'react-router-dom';

interface FastLoginButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const FastLoginButton: React.FC<FastLoginButtonProps> = ({ 
  className, 
  variant = "default",
  size = "default" 
}) => {
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const { fastLogin, isAuthenticating } = useFastAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async () => {
    // Demo credentials for quick access
    const result = await fastLogin('demo@talentxcel.com', 'demo123');
    if (result.success) {
      navigate('/network');
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      className={className}
      onClick={handleQuickLogin}
      disabled={isAuthenticating}
    >
      {isAuthenticating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4 mr-2" />
          Quick Login
        </>
      )}
    </Button>
  );
};
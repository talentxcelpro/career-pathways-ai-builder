import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface LegacyRouteRedirectProps {
  to: string;
  message?: string;
  includeId?: boolean;
}

/**
 * Redirects from legacy resume builder routes to the new unified builder
 * Shows a toast notification to inform users about the redirect
 */
export const LegacyRouteRedirect: React.FC<LegacyRouteRedirectProps> = ({ 
  to, 
  message = "Redirecting to our improved resume builder...",
  includeId = false 
}) => {
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    // Show notification about redirect
    toast.info(message, {
      duration: 3000,
    });

    // Build the redirect path
    let redirectPath = to;
    if (includeId && params.id) {
      redirectPath = `${to}/${params.id}`;
    }

    // Redirect after a brief delay
    const timer = setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate, to, message, includeId, params.id]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-lg font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">You'll be redirected shortly...</p>
      </div>
    </div>
  );
};

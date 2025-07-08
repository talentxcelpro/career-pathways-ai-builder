import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AcceptInvitation = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    if (!user) {
      // Redirect to login with the invitation token so we can come back
      navigate(`/auth/login?invitation=${token}`);
      return;
    }

    acceptInvitation();
  }, [token, user]);

  const acceptInvitation = async () => {
    if (!token) return;

    try {
      setLoading(true);
      
      // Call the database function to accept the invitation
      const { data, error } = await supabase.rpc('accept_team_invitation', {
        invitation_token: token
      });

      if (error) {
        throw error;
      }

      const result = data as any;
      if (!result.success) {
        throw new Error(result.error || 'Failed to accept invitation');
      }

      setInvitationData(result);
      toast.success('Welcome to the team! You now have employer access.');

      // Force clear any cached data and redirect immediately
      window.location.href = '/employer';

    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setError(error.message || 'Failed to accept invitation');
      toast.error(error.message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Processing Invitation</h2>
            <p className="text-gray-600">Please wait while we set up your access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-600">Invitation Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/auth/login')}>
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-green-600">Welcome to the Team!</h2>
            <p className="text-gray-600 mb-4">
              You have successfully joined the company as a <strong>{invitationData?.role}</strong>.
              You now have access to employer features.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/employer')} className="w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Go to Employer Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/employer/team')} className="w-full">
                View Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AcceptInvitation;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Lock } from 'lucide-react';

interface RestrictedAccessPageProps {
  moduleName: string;
  description?: string;
}

export const RestrictedAccessPage: React.FC<RestrictedAccessPageProps> = ({
  moduleName,
  description = `${moduleName} is currently available only to administrators.`
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>

        {/* Main Restriction Notice */}
        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full w-fit">
              <Lock className="h-12 w-12 text-orange-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-orange-600">
              Access Restricted
            </CardTitle>
            <p className="text-lg text-muted-foreground mt-4">
              {description}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-400">
                    {moduleName} - Admin Only
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    This feature is currently in development and restricted to administrators only.
                  </p>
                </div>
              </div>
            </div>

            {/* Available Actions */}
            <div className="text-center space-y-4 pt-4 border-t">
              <h3 className="font-semibold">What you can do instead:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild variant="default">
                  <Link to="/dashboard">
                    <Shield className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/network">
                    <Shield className="h-4 w-4 mr-2" />
                    Network
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/jobs">
                    <Shield className="h-4 w-4 mr-2" />
                    Jobs
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/passport">
                    <Shield className="h-4 w-4 mr-2" />
                    Career Passport
                  </Link>
                </Button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Need access to this feature? Contact our support team for more information.
              </p>
              <Button size="sm" variant="outline" className="mt-2">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
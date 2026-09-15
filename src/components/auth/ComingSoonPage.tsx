import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Star, Users, Zap, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface ComingSoonPageProps {
  feature: string;
  description?: string;
  expectedDate?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  feature,
  description = "We're working hard to bring you this amazing feature. Stay tuned!",
  expectedDate = "Soon"
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Star,
      title: "Premium Features",
      description: "Access to advanced tools and analytics"
    },
    {
      icon: Users,
      title: "Priority Support", 
      description: "Get help from our expert team"
    },
    {
      icon: Zap,
      title: "Early Access",
      description: "Be the first to try new features"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>

        {/* Main Card */}
        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-full w-fit">
              <Clock className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {feature} Coming Soon
            </CardTitle>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              {description}
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Timeline */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Expected: {expectedDate}</span>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-4 pt-8 border-t">
              {!user ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Join TalentXcel to get early access to new features
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button asChild>
                      <Link to="/auth/register">Sign Up Free</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/auth/login">Login</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Explore other features while you wait
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button asChild>
                      <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/network">Explore Network</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Development Progress</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full w-3/4 transition-all duration-1000"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Preview */}
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="pt-6 text-center">
            <h3 className="font-semibold mb-2">Want to be notified?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Follow us on social media for the latest updates
            </p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="outline">LinkedIn</Button>
              <Button size="sm" variant="outline">Twitter</Button>
              <Button size="sm" variant="outline">Newsletter</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
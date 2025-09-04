import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { publicRoutes } from '@/navigation/publicRoutes';
import { TierBadge } from '@/components/ui/tier-badge';
import { ArrowRight } from 'lucide-react';

export const PublicToolsNav: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Free Career Tools</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Access powerful career tools without signing up. Start your career journey today.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publicRoutes.map((route) => (
          <Card key={route.to} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {route.icon}
                  <CardTitle className="text-lg">{route.title}</CardTitle>
                </div>
                <TierBadge tier="free" size="sm" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {route.description}
              </p>
              <Link to={route.to}>
                <Button className="w-full group">
                  Try Now
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Want More Features?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sign up for free to save your progress and unlock additional features.
            </p>
            <div className="space-y-2">
              <Link to="/auth">
                <Button className="w-full">Sign Up Free</Button>
              </Link>
              <Link to="/pro/subscription">
                <Button variant="outline" className="w-full">
                  View Pro Features
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
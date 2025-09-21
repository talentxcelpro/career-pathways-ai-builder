import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, User, MapPin, Briefcase, ExternalLink } from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { motion } from 'framer-motion';

interface CareerQRCardProps {
  profile: {
    id: string;
    full_name: string;
    title?: string;
    location?: string;
    profile_picture_url?: string;
    headline?: string;
    skills?: string[];
  };
  className?: string;
}

export const CareerQRCard: React.FC<CareerQRCardProps> = ({
  profile,
  className
}) => {
  const profileUrl = `${window.location.origin}/passport/public/${profile.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`${className} overflow-hidden`}>
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Digital Career Card
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your professional identity in QR format
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Preview */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground">
                    {profile.full_name}
                  </h3>
                  {profile.title && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      {profile.title}
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {profile.location}
                    </div>
                  )}
                </div>
              </div>

              {profile.headline && (
                <p className="text-sm text-muted-foreground">
                  {profile.headline}
                </p>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Top Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.slice(0, 6).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {profile.skills.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(profileUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Profile
              </Button>
            </div>

            {/* QR Code Generator */}
            <div>
              <QRCodeGenerator
                profileUrl={profileUrl}
                profileName={profile.full_name}
                className="border-0 shadow-none"
              />
            </div>
          </div>

          {/* Career Insights */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-xs text-muted-foreground">Profile Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Active</div>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Pro</div>
                <div className="text-xs text-muted-foreground">Tier</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">QR Code Benefits</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>✓ Instant profile sharing</div>
              <div>✓ Professional networking</div>
              <div>✓ Offline accessibility</div>
              <div>✓ Real-time updates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
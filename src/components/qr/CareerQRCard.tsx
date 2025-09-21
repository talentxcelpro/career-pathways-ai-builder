import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, User, MapPin, Briefcase, ExternalLink, Sparkles, Zap } from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const profileUrl = `${window.location.origin}/passport/public/${profile.id}`;

  const handleViewProfile = () => {
    navigate(`/passport/public/${profile.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      <Card className={`${className} overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/20`}>
        <CardHeader className="bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 border-b border-primary/20 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            Digital Career Passport
          </CardTitle>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Share your professional identity instantly
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Mobile-first responsive grid */}
          <div className="flex flex-col space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
            {/* Profile Preview - Mobile Optimized */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.full_name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-primary/30 shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-md">
                      <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                  )}
                </motion.div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight">
                    {profile.full_name}
                  </h3>
                  {profile.title && (
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <Briefcase className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{profile.title}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {profile.headline && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {profile.headline}
                </p>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Top Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.slice(0, 4).map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20">
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                    {profile.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        +{profile.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="default"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
                  onClick={handleViewProfile}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Profile
                </Button>
              </motion.div>
            </motion.div>

            {/* QR Code Generator - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <QRCodeGenerator
                profileUrl={profileUrl}
                profileName={profile.full_name}
                className="border-0 shadow-none bg-transparent"
              />
            </motion.div>
          </div>

          {/* Career Insights - Mobile First */}
          <motion.div 
            className="pt-4 border-t border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <motion.div 
                className="text-center p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-lg sm:text-xl font-bold text-primary">Ready</div>
                <div className="text-xs text-muted-foreground">Career Status</div>
              </motion.div>
              <motion.div 
                className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-lg sm:text-xl font-bold text-green-600">Active</div>
                <div className="text-xs text-muted-foreground">Profile Status</div>
              </motion.div>
            </div>
          </motion.div>

          {/* QR Benefits - Compact Mobile */}
          <motion.div 
            className="p-3 sm:p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" />
              QR Benefits
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="text-green-500">✓</span> Instant sharing
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">✓</span> Professional networking
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">✓</span> Offline access
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">✓</span> Real-time updates
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
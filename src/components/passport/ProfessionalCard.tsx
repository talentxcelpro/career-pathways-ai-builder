import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Globe, Linkedin, Github, Star, Award, Users, TrendingUp } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PublicProfile, PublicCareerPassport } from '@/hooks/usePublicProfile';

interface ProfessionalCardProps {
  profile: PublicProfile;
  careerPassport?: PublicCareerPassport | null;
  isOwner?: boolean;
  className?: string;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  profile,
  careerPassport,
  isOwner = false,
  className = ""
}) => {
  const profileUrl = `${window.location.origin}/passport/public/${profile.username || profile.id}`;
  const currentDate = new Date().toLocaleDateString();
  const uniqueId = `TX-${profile.id.slice(0, 8).toUpperCase()}`;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={`overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20 ${className}`}>
      {/* Header with branding */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold tracking-wide">TalentXcel</h3>
            <p className="text-primary-foreground/80 text-sm">Professional Career Passport</p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
            ID: {uniqueId}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20 border-4 border-primary/20">
            <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.full_name} />
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold text-foreground">{profile.full_name}</h2>
            {profile.title && (
              <p className="text-primary font-medium">{profile.title}</p>
            )}
            {profile.location && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-3 w-3" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
          
          {/* QR Code */}
          <div className="bg-white p-3 rounded-lg border-2 border-primary/20 shadow-sm">
            <QRCodeSVG
              value={profileUrl}
              size={80}
              bgColor="#ffffff"
              fgColor="#1a365d"
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* About Section */}
        {profile.headline && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Professional Summary</h4>
            <p className="text-sm text-foreground leading-relaxed">{profile.headline}</p>
          </div>
        )}

        {/* Career Metrics */}
        {careerPassport && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold text-primary">{careerPassport.career_readiness_score}</span>
              </div>
              <p className="text-xs text-muted-foreground">Career Readiness</p>
            </div>
            
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-lg font-bold text-amber-600">{careerPassport.market_competitiveness_score}</span>
              </div>
              <p className="text-xs text-muted-foreground">Market Score</p>
            </div>
            
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Award className="h-4 w-4 text-green-500" />
                <span className="text-lg font-bold text-green-600">{careerPassport.certifications_count}</span>
              </div>
              <p className="text-xs text-muted-foreground">Certifications</p>
            </div>
            
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-lg font-bold text-blue-600">{careerPassport.connections_count}</span>
              </div>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
          </div>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Core Skills</h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
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

        {/* Social Links */}
        <div className="flex gap-4 pt-2">
          {profile.linkedin_url && (
            <a 
              href={profile.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          )}
          {profile.github_url && (
            <a 
              href={profile.github_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-700 text-sm"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          )}
          {profile.portfolio_url && (
            <a 
              href={profile.portfolio_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm"
            >
              <Globe className="h-4 w-4" />
              <span>Portfolio</span>
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 pt-4 flex justify-between items-center text-xs text-muted-foreground">
          <div>
            <p>Issued: {currentDate}</p>
            <p>Valid until: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-primary font-medium">TalentXcel.in</p>
            <p>Verified Professional Profile</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalCard;
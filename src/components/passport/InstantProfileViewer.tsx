import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Globe, Linkedin, Github, Award, Users, TrendingUp, Star, ExternalLink, Share2 } from 'lucide-react';
import { PublicProfile, PublicCareerPassport, PublicAchievements } from '@/hooks/usePublicProfile';
import ProfessionalCard from './ProfessionalCard';
import { useToast } from '@/hooks/use-toast';

interface InstantProfileViewerProps {
  profile: PublicProfile;
  careerPassport?: PublicCareerPassport | null;
  achievements?: PublicAchievements[];
  isLoading?: boolean;
}

const InstantProfileViewer: React.FC<InstantProfileViewerProps> = ({
  profile,
  careerPassport,
  achievements = [],
  isLoading = false
}) => {
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const shareProfile = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${profile.full_name} - Professional Profile`,
      text: `Check out ${profile.full_name}'s professional profile on TalentXcel`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Profile link copied to clipboard!",
        });
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        {profile.cover_image_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${profile.cover_image_url})` }}
          />
        )}
        
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TX</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">TalentXcel</h1>
                <p className="text-primary-foreground/80 text-sm">Professional Career Passport</p>
              </div>
            </div>
            
            <Button
              onClick={shareProfile}
              variant="outline"
              size="sm"
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-primary-foreground/20">
              <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.full_name} />
              <AvatarFallback className="text-2xl font-bold bg-primary-foreground/20 text-primary-foreground">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{profile.full_name}</h2>
                {profile.title && (
                  <p className="text-xl text-primary-foreground/90 mb-3">{profile.title}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/80">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {new Date(profile.created_at).getFullYear()}</span>
                  </div>
                </div>
              </div>

              {profile.headline && (
                <p className="text-primary-foreground/90 leading-relaxed max-w-2xl">
                  {profile.headline}
                </p>
              )}

              {/* Social Links */}
              <div className="flex gap-4">
                {profile.linkedin_url && (
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span className="text-sm">LinkedIn</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {profile.github_url && (
                  <a 
                    href={profile.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span className="text-sm">GitHub</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {profile.portfolio_url && (
                  <a 
                    href={profile.portfolio_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Portfolio</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Career Metrics */}
            {careerPassport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Career Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-primary">{careerPassport.career_readiness_score}</div>
                      <p className="text-sm text-muted-foreground">Career Readiness</p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-amber-600">{careerPassport.market_competitiveness_score}</div>
                      <p className="text-sm text-muted-foreground">Market Competitiveness</p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-green-600">{careerPassport.certifications_count}</div>
                      <p className="text-sm text-muted-foreground">Certifications</p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-blue-600">{careerPassport.connections_count}</div>
                      <p className="text-sm text-muted-foreground">Professional Network</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-1">
                      Profile Completion: {careerPassport.completion_percentage}%
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${careerPassport.completion_percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About */}
            {profile.about && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {profile.about}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.slice(0, 5).map((achievement) => (
                      <div key={achievement.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{achievement.achievement_title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{achievement.achievement_description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 text-amber-500" />
                            <span>{achievement.points_awarded} points</span>
                            {achievement.verified && (
                              <Badge variant="outline" className="text-xs">Verified</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Professional Card */}
            <ProfessionalCard 
              profile={profile} 
              careerPassport={careerPassport}
              className="w-full"
            />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profile Views</span>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Active</span>
                  <span className="text-sm">{new Date(profile.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6 text-center space-y-4">
                <h3 className="font-semibold text-primary">Join TalentXcel</h3>
                <p className="text-sm text-muted-foreground">
                  Create your own professional career passport and connect with {profile.full_name}
                </p>
                <Button className="w-full" asChild>
                  <a href="/auth/signup">Get Started</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantProfileViewer;
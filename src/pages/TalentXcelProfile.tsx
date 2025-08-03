import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Trophy, 
  Target, 
  History, 
  QrCode, 
  Share2, 
  Download,
  ExternalLink,
  Award,
  TrendingUp,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  FileText,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Star,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { CareerPassportCard } from '@/components/profile/CareerPassportCard';
import { formatDistanceToNow, format } from 'date-fns';

export default function TalentXcelProfile() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { careerPassport, achievements, journeyEvents, getCompletionBreakdown, isLoading } = useCareerPassport();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-muted rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const breakdown = getCompletionBreakdown();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">TalentXcel Career Passport</h1>
          <p className="text-muted-foreground">
            Your unified career identity and professional journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="default" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="journey">Journey</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{profile?.full_name || 'User'}</h3>
                      <p className="text-muted-foreground">{profile?.headline || 'Professional'}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {profile?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {profile.location}
                          </div>
                        )}
                        {profile?.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {profile.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        ID: {profile?.talentxcel_id || 'TXL000000'}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Member since {format(new Date(profile?.created_at || new Date()), 'MMM yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  {profile?.about && (
                    <div>
                      <h4 className="font-medium mb-2">About</h4>
                      <p className="text-sm text-muted-foreground">{profile.about}</p>
                    </div>
                  )}

                  <Separator />

                  {/* Social Links */}
                  <div className="flex gap-2">
                    {profile?.linkedin_url && (
                      <Button variant="outline" size="sm">
                        <Linkedin className="h-4 w-4 mr-1" />
                        LinkedIn
                      </Button>
                    )}
                    {profile?.github_url && (
                      <Button variant="outline" size="sm">
                        <Github className="h-4 w-4 mr-1" />
                        GitHub
                      </Button>
                    )}
                    {profile?.website && (
                      <Button variant="outline" size="sm">
                        <Globe className="h-4 w-4 mr-1" />
                        Website
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Completion Breakdown */}
              {breakdown && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Profile Completion Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Profile Information (40%)</span>
                        <span className="font-medium">{breakdown.profile}/40</span>
                      </div>
                      <Progress value={(breakdown.profile / 40) * 100} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Resumes Created (25%)</span>
                        <span className="font-medium">{breakdown.resumes}/25</span>
                      </div>
                      <Progress value={(breakdown.resumes / 25) * 100} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Certifications (20%)</span>
                        <span className="font-medium">{breakdown.certifications}/20</span>
                      </div>
                      <Progress value={(breakdown.certifications / 20) * 100} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Skill Tests (15%)</span>
                        <span className="font-medium">{breakdown.tests}/15</span>
                      </div>
                      <Progress value={(breakdown.tests / 15) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="journey" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Career Journey Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {journeyEvents && journeyEvents.length > 0 ? (
                    <div className="space-y-4">
                      {journeyEvents.map((event, index) => (
                        <div key={event.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                              {index + 1}
                            </div>
                            {index < journeyEvents.length - 1 && (
                              <div className="w-px h-8 bg-border mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{event.event_type.replace(/_/g, ' ')}</h4>
                              <Badge variant="outline" className="text-xs">
                                {event.event_module}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                            </p>
                            {event.impact_score > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-muted-foreground">
                                  +{event.impact_score} impact score
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No journey events yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Career Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements && achievements.length > 0 ? (
                    <div className="grid gap-4">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <Trophy className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium">{achievement.achievement_title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {achievement.achievement_description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    +{achievement.points_awarded} points
                                  </Badge>
                                  {achievement.verified && (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {format(new Date(achievement.earned_at), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No achievements yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Career Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CareerPassportCard showFullView={true} />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Create Resume
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="h-4 w-4 mr-2" />
                Find Jobs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="h-4 w-4 mr-2" />
                Take Assessment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Public Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
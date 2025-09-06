import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  MapPin, 
  Calendar, 
  Trophy, 
  Star, 
  Briefcase, 
  GraduationCap,
  Globe,
  Shield,
  Settings,
  Edit,
  Camera,
  QrCode,
  Share2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

export const MobilePassport = () => {
  const { user } = useAuth();

  // Redirect to talentxcel.in/passport
  useEffect(() => {
    window.location.href = 'https://talentxcel.in/passport';
  }, []);

  // Mock user data - will be replaced with real profile data
  const profileData = {
    name: user?.user_metadata?.full_name || 'Professional User',
    title: 'Software Engineer',
    location: 'San Francisco, CA',
    joinedDate: '2024',
    profileCompletion: 85,
    careerLevel: 'Senior',
    verificationStatus: 'Verified',
    skillsCount: 12,
    connectionsCount: 156,
    recommendationsCount: 8,
    achievementsCount: 5
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-foreground">Career Passport</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <QrCode className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-primary/5 border border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-20 h-20 ring-4 ring-primary/20">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{profileData.name}</h2>
                <p className="text-sm text-muted-foreground">{profileData.title}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{profileData.location}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              {profileData.verificationStatus}
            </Badge>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-sm font-medium">{profileData.joinedDate}</p>
            </div>
          </div>
        </Card>

        {/* Profile Completion */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">Profile Completion</h3>
            <span className="text-sm font-medium text-primary">{profileData.profileCompletion}%</span>
          </div>
          <Progress value={profileData.profileCompletion} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">Complete your profile to unlock more opportunities</p>
        </Card>

        {/* Career Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-lg font-bold text-foreground">{profileData.skillsCount}</p>
            <p className="text-xs text-muted-foreground">Skills Verified</p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <User className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-foreground">{profileData.connectionsCount}</p>
            <p className="text-xs text-muted-foreground">Connections</p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-lg font-bold text-foreground">{profileData.achievementsCount}</p>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Briefcase className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-lg font-bold text-foreground">{profileData.recommendationsCount}</p>
            <p className="text-xs text-muted-foreground">Recommendations</p>
          </Card>
        </div>

        {/* Professional Identity */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Professional Identity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Career Level</p>
                  <p className="text-xs text-muted-foreground">{profileData.careerLevel}</p>
                </div>
              </div>
              <Badge variant="outline">{profileData.careerLevel}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Education</p>
                  <p className="text-xs text-muted-foreground">Computer Science</p>
                </div>
              </div>
              <Badge variant="outline">Bachelor's</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Globe className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Global Visibility</p>
                  <p className="text-xs text-muted-foreground">Profile searchable worldwide</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start h-auto p-3">
              <div className="flex flex-col items-start">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Schedule</span>
                </div>
                <span className="text-xs text-muted-foreground">Manage availability</span>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-3">
              <div className="flex flex-col items-start">
                <div className="flex items-center space-x-2 mb-1">
                  <Star className="h-4 w-4" />
                  <span className="text-sm font-medium">Skills</span>
                </div>
                <span className="text-xs text-muted-foreground">Add & verify skills</span>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-3">
              <div className="flex flex-col items-start">
                <div className="flex items-center space-x-2 mb-1">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">Portfolio</span>
                </div>
                <span className="text-xs text-muted-foreground">Showcase work</span>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-3">
              <div className="flex flex-col items-start">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">References</span>
                </div>
                <span className="text-xs text-muted-foreground">Manage contacts</span>
              </div>
            </Button>
          </div>
        </Card>
      </div>

      <MobileBottomNav />
    </div>
  );
};
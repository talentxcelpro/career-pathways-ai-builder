import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface ProfileItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
}

export const ProfileCompletionNudge = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [items, setItems] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
      calculateCompletion(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = (profileData: any) => {
    const allItems: ProfileItem[] = [
      {
        id: 'basic_info',
        title: 'Complete Basic Info',
        description: 'Add your full name, title, and location',
        completed: !!(profileData?.full_name && profileData?.title && profileData?.location),
        link: '/profile/edit',
        priority: 'high',
        points: 20
      },
      {
        id: 'profile_picture',
        title: 'Add Profile Picture',
        description: 'Upload a professional photo',
        completed: !!profileData?.profile_picture_url,
        link: '/profile/edit',
        priority: 'medium',
        points: 15
      },
      {
        id: 'about_section',
        title: 'Write About Section',
        description: 'Tell employers about yourself',
        completed: !!(profileData?.about && profileData.about.length > 50),
        link: '/profile/edit',
        priority: 'high',
        points: 25
      },
      {
        id: 'experience',
        title: 'Add Work Experience',
        description: 'Include your professional background',
        completed: !!(profileData?.experience && profileData.experience.length > 0),
        link: '/profile/edit',
        priority: 'high',
        points: 25
      },
      {
        id: 'skills',
        title: 'Add Skills',
        description: 'List your key competencies',
        completed: !!(profileData?.skills && profileData.skills.length >= 3),
        link: '/profile/edit',
        priority: 'medium',
        points: 15
      }
    ];

    setItems(allItems);
    
    const completedItems = allItems.filter(item => item.completed);
    const totalPoints = allItems.reduce((sum, item) => sum + item.points, 0);
    const earnedPoints = completedItems.reduce((sum, item) => sum + item.points, 0);
    
    setCompletionPercentage(Math.round((earnedPoints / totalPoints) * 100));
  };

  const getIncompleteItems = () => {
    return items
      .filter(item => !item.completed)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 3); // Show max 3 items
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('profile-nudge-dismissed', Date.now().toString());
  };

  // Don't show if user dismissed recently or profile is complete
  useEffect(() => {
    const dismissed = localStorage.getItem('profile-nudge-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setIsVisible(false);
      }
    }
  }, []);

  if (!isVisible || loading || completionPercentage >= 80) {
    return null;
  }

  const incompleteItems = getIncompleteItems();

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Complete Your Profile</CardTitle>
            <Badge variant="outline" className="ml-2">
              {completionPercentage}% Complete
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground mb-3">
          Complete profiles get <strong>3x more job views</strong> and interview callbacks!
        </p>

        <div className="space-y-2">
          {incompleteItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      item.priority === 'high' ? 'border-red-200 text-red-700' :
                      item.priority === 'medium' ? 'border-orange-200 text-orange-700' :
                      'border-gray-200 text-gray-700'
                    }`}
                  >
                    +{item.points} pts
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to={item.link}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {completionPercentage >= 50 && (
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Great progress! You're {100 - completionPercentage}% away from a complete profile.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            🎯 Target: 80% completion for maximum visibility
          </div>
          <Button asChild size="sm">
            <Link to="/profile/edit">
              Complete Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
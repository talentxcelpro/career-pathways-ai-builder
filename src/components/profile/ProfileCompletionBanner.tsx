
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, User, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  full_name?: string;
  title?: string;
  profile_picture_url?: string;
  about?: string;
  skills?: string[];
  location?: string;
  current_company?: string;
}

interface ProfileCompletionBannerProps {
  profile: ProfileData | null;
  showFullPrompt?: boolean;
}

export const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({
  profile,
  showFullPrompt = true
}) => {
  const navigate = useNavigate();

  const completionItems = [
    {
      key: 'profile_picture',
      label: 'Profile Picture',
      completed: !!profile?.profile_picture_url,
      icon: Camera,
      description: 'Add your photo so others can recognize you'
    },
    {
      key: 'title',
      label: 'Job Title',
      completed: !!profile?.title,
      icon: User,
      description: 'Share your current role or expertise'
    },
    {
      key: 'about',
      label: 'About Section',
      completed: !!profile?.about && profile.about.length > 50,
      icon: User,
      description: 'Tell your professional story'
    },
    {
      key: 'skills',
      label: 'Skills',
      completed: !!profile?.skills && profile.skills.length >= 3,
      icon: User,
      description: 'Add at least 3 skills'
    },
    {
      key: 'location',
      label: 'Location',
      completed: !!profile?.location,
      icon: User,
      description: 'Show where you are based'
    }
  ];

  const completedCount = completionItems.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);
  
  const isFullyComplete = completionPercentage === 100;

  if (isFullyComplete && !showFullPrompt) return null;

  return (
    <Card className={`mb-6 ${isFullyComplete ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {isFullyComplete ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-orange-600" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {isFullyComplete 
                  ? 'Profile Complete! 🎉'
                  : 'Complete your profile to get better visibility'
                }
              </h3>
              <p className="text-gray-600 mt-1">
                {isFullyComplete
                  ? 'Your profile is fully optimized for networking and professional opportunities.'
                  : 'Add your profile picture, job title so others can recognize you in the network and posts. This makes your profile more engaging and trustworthy.'
                }
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Progress value={completionPercentage} className="flex-1" />
                <Badge variant={isFullyComplete ? "default" : "secondary"}>
                  {completionPercentage}% Complete
                </Badge>
              </div>
            </div>

            {showFullPrompt && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {completionItems.map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      item.completed 
                        ? 'bg-white border-green-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <item.icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${item.completed ? 'text-green-900' : 'text-gray-900'}`}>
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button 
              onClick={() => navigate('/profile/edit')}
              className={isFullyComplete ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isFullyComplete ? 'View Profile' : 'Complete Profile'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

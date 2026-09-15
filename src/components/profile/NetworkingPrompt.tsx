
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  full_name?: string;
  title?: string;
  profile_picture_url?: string;
  about?: string;
}

interface NetworkingPromptProps {
  profile: ProfileData | null;
}

export const NetworkingPrompt: React.FC<NetworkingPromptProps> = ({ profile }) => {
  const navigate = useNavigate();
  
  const needsProfilePicture = !profile?.profile_picture_url;
  const needsTitle = !profile?.title;
  const needsAbout = !profile?.about || profile.about.length < 20;
  
  const showPrompt = needsProfilePicture || needsTitle || needsAbout;
  
  if (!showPrompt) return null;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              Boost Your Networking Presence
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              Complete your profile to make meaningful connections and stand out in the network.
            </p>
            <Button 
              size="sm" 
              onClick={() => navigate('/profile/edit')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <User className="h-4 w-4 mr-2" />
              Complete Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

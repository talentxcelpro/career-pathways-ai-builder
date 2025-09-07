
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, ExternalLink, Eye, EyeOff } from "lucide-react";

interface ContactInformationProps {
  profile: any;
  hideByDefault?: boolean;
}

export const ContactInformation: React.FC<ContactInformationProps> = ({ 
  profile, 
  hideByDefault = false 
}) => {
  const [isVisible, setIsVisible] = useState(!hideByDefault);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Contact Information</CardTitle>
          {hideByDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="h-8 w-8 p-0"
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      {isVisible && (
        <CardContent className="space-y-3">
        {profile?.email && (
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{profile.email}</span>
          </div>
        )}
        {profile?.phone && (
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{profile.phone}</span>
          </div>
        )}
        {profile?.linkedin_url && (
          <div className="flex items-center space-x-3">
            <ExternalLink className="h-4 w-4 text-gray-400" />
            <a 
              href={profile.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              LinkedIn Profile
            </a>
          </div>
        )}
        {profile?.portfolio_url && (
          <div className="flex items-center space-x-3">
            <ExternalLink className="h-4 w-4 text-gray-400" />
            <a 
              href={profile.portfolio_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Portfolio
            </a>
          </div>
        )}
        </CardContent>
      )}
    </Card>
  );
};

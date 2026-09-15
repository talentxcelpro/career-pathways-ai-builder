
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Users, Globe, Share } from "lucide-react";

interface ProfileVisibilitySettingsProps {
  visibility: 'public' | 'private' | 'connections_only';
  allowSharing: boolean;
  customUrl?: string;
  onVisibilityChange: (visibility: 'public' | 'private' | 'connections_only') => void;
  onSharingChange: (allow: boolean) => void;
}

export const ProfileVisibilitySettings: React.FC<ProfileVisibilitySettingsProps> = ({
  visibility,
  allowSharing,
  customUrl,
  onVisibilityChange,
  onSharingChange
}) => {
  const visibilityOptions = [
    {
      value: 'public' as const,
      label: 'Public',
      description: 'Anyone can view your profile',
      icon: Globe
    },
    {
      value: 'connections_only' as const,
      label: 'Connections Only',
      description: 'Only your connections can view your profile',
      icon: Users
    },
    {
      value: 'private' as const,
      label: 'Private',
      description: 'Only you can view your profile',
      icon: EyeOff
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Profile Visibility & Sharing</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visibility Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Who can view your profile?</h4>
          <div className="space-y-3">
            {visibilityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    visibility === option.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onVisibilityChange(option.value)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <input
                        type="radio"
                        checked={visibility === option.value}
                        onChange={() => onVisibilityChange(option.value)}
                        className="mt-1"
                      />
                    </div>
                    <Icon className="h-5 w-5 mt-0.5 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{option.label}</span>
                        {visibility === option.value && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sharing Settings */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Share className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Allow Profile Sharing</span>
              </div>
              <p className="text-sm text-gray-600">
                Let others share your profile link with potential connections
              </p>
            </div>
            <Switch
              checked={allowSharing}
              onCheckedChange={onSharingChange}
            />
          </div>
        </div>

        {/* Custom URL Display */}
        {customUrl && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-medium">Your Profile URL</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <code className="text-sm">
                {window.location.origin}/profile/{customUrl}
              </code>
            </div>
            <p className="text-xs text-gray-500">
              This is your custom profile URL that others can use to find you
            </p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Privacy Note:</strong> Even with private settings, basic information like your name 
            may still be visible to employers and recruiters through job applications and networking activities.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

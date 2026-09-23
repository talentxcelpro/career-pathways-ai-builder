
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
    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-xs rounded-2xl">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-600" />
          <span>Profile Visibility & Sharing</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
        {/* Visibility Settings */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Who can view your profile?</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {visibilityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`p-3 border rounded-xl cursor-pointer transition-all ${
                    visibility === option.value 
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/30'
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
                        <span className="text-xs font-bold">{option.label}</span>
                        {visibility === option.value && (
                          <Badge variant="default" className="text-[10px] h-4 px-1.5 font-bold">Current</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
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
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <Share className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Allow Profile Sharing</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
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
          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Your Profile URL</h4>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <code className="text-xs text-blue-600 font-mono">
                {window.location.origin}/profile/{customUrl}
              </code>
            </div>
            <p className="text-[11px] text-muted-foreground">
              This is your custom profile URL that others can use to find you
            </p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200/70 dark:border-blue-900/40">
          <p className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
            <strong className="font-bold">Privacy Note:</strong> Even with private settings, verified credentials like your name 
            may still be visible to verified employers through direct applications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

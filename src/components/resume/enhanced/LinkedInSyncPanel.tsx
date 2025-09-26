import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Linkedin, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useLinkedInSync } from '@/hooks/useLinkedInSync';
import { Label } from '@/components/ui/label';

export const LinkedInSyncPanel: React.FC = () => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const { profile, isLoading, syncLinkedInProfile, getLinkedInProfile } = useLinkedInSync();

  useEffect(() => {
    getLinkedInProfile();
  }, [getLinkedInProfile]);

  const handleSync = async () => {
    if (!linkedinUrl.trim()) return;
    await syncLinkedInProfile(linkedinUrl);
  };

  const getStatusBadge = () => {
    if (!profile) return null;
    
    switch (profile.sync_status) {
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Synced
        </Badge>;
      case 'syncing':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Syncing
        </Badge>;
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Linkedin className="h-5 w-5 text-blue-600" />
          LinkedIn Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
          <div className="flex gap-2">
            <Input
              id="linkedin-url"
              placeholder="https://linkedin.com/in/your-profile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              onClick={handleSync}
              disabled={isLoading || !linkedinUrl.trim()}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync
            </Button>
          </div>
        </div>

        {profile && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Sync Status</span>
              {getStatusBadge()}
            </div>
            
            {profile.last_synced_at && (
              <div className="text-sm text-muted-foreground">
                Last synced: {new Date(profile.last_synced_at).toLocaleDateString()}
              </div>
            )}

            {profile.profile_data && Object.keys(profile.profile_data).length > 0 && (
              <div className="space-y-2">
                <div className="font-medium text-sm">Imported Data:</div>
                <div className="space-y-1 text-sm">
                  {profile.profile_data.name && (
                    <div>Name: {profile.profile_data.name}</div>
                  )}
                  {profile.profile_data.headline && (
                    <div>Headline: {profile.profile_data.headline}</div>
                  )}
                  {profile.profile_data.location && (
                    <div>Location: {profile.profile_data.location}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          💡 Sync your LinkedIn profile to automatically import your professional information and keep your resume up to date.
        </div>
      </CardContent>
    </Card>
  );
};
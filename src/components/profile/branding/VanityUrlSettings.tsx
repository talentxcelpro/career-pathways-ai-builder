import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, X, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFeatureGating } from '@/hooks/useFeatureGating';

interface VanityUrlSettingsProps {
  currentVanityUrl?: string;
  profileName: string;
  onUpdateSuccess?: (url: string) => void;
  profileId: string;
}

export const VanityUrlSettings: React.FC<VanityUrlSettingsProps> = ({
  currentVanityUrl,
  profileName,
  onUpdateSuccess,
  profileId
}) => {
  const [vanityUrl, setVanityUrl] = useState(currentVanityUrl || '');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { checkFeatureAccess } = useFeatureGating();

  const checkAvailability = async (url: string) => {
    if (!url || url.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .rpc('check_vanity_url_availability', { url });

      if (error) throw error;
      setIsAvailable(data);
    } catch (error) {
      console.error('Availability check error:', error);
      toast({
        title: "Error",
        description: "Failed to check URL availability",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const generateSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .rpc('generate_vanity_url_suggestions', { base_name: profileName });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  const handleSave = async () => {
    if (!checkFeatureAccess('Vanity URLs')) {
      return;
    }

    if (!vanityUrl) {
      toast({
        title: "Error",
        description: "Please enter a vanity URL",
        variant: "destructive",
      });
      return;
    }

    if (isAvailable === false) {
      toast({
        title: "Error",
        description: "This URL is not available",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ vanity_url: vanityUrl })
        .eq('id', profileId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Vanity URL saved successfully!",
      });
      
      onUpdateSuccess?.(vanityUrl);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save vanity URL",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!checkFeatureAccess('Vanity URLs')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ vanity_url: null })
        .eq('id', profileId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Vanity URL removed successfully!",
      });
      
      setVanityUrl('');
      setIsAvailable(null);
      onUpdateSuccess?.('');
    } catch (error) {
      console.error('Remove error:', error);
      toast({
        title: "Error",
        description: "Failed to remove vanity URL",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, [profileName]);

  useEffect(() => {
    if (vanityUrl && vanityUrl !== currentVanityUrl) {
      const timeoutId = setTimeout(() => {
        checkAvailability(vanityUrl);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [vanityUrl, currentVanityUrl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Vanity URL
        </CardTitle>
        <CardDescription>
          Create a custom URL for your profile (Elite feature)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vanity-url">Your Custom URL</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">talentxcel.in/</span>
            <Input
              id="vanity-url"
              placeholder="your-name-pro"
              value={vanityUrl}
              onChange={(e) => setVanityUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1"
              maxLength={50}
            />
            {isChecking && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
            {!isChecking && isAvailable === true && <Check className="h-4 w-4 text-green-500" />}
            {!isChecking && isAvailable === false && <X className="h-4 w-4 text-red-500" />}
          </div>
          
          {isAvailable === true && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              URL is available
            </div>
          )}
          
          {isAvailable === false && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <X className="h-4 w-4" />
              URL is not available
            </div>
          )}
        </div>

        {currentVanityUrl && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current URL:</p>
                <p className="text-sm text-muted-foreground">
                  talentxcel.in/{currentVanityUrl}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://talentxcel.in/${currentVanityUrl}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <Label>Suggestions</Label>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 6).map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setVanityUrl(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || !vanityUrl || isAvailable === false}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Save URL'}
          </Button>
          
          {currentVanityUrl && (
            <Button
              variant="ghost"
              onClick={handleRemove}
              disabled={isSaving}
            >
              Remove
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>• URL must be 3-50 characters</p>
          <p>• Only lowercase letters, numbers, and hyphens allowed</p>
          <p>• Cannot start or end with a hyphen</p>
        </div>
      </CardContent>
    </Card>
  );
};
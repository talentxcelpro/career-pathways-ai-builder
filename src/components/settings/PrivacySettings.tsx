import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Lock, Globe, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Affirmative Privacy Defaults: UNCHECKED / PRIVATE BY DEFAULT
  const [publicConsentGranted, setPublicConsentGranted] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'connections_only' | 'private'>('private');
  const [lastConsentTimestamp, setLastConsentTimestamp] = useState<string | null>(null);

  // Load existing persisted affirmative consent status
  useEffect(() => {
    let isMounted = true;
    async function loadConsent() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('candidate_privacy_consents')
          .select('consent_status, consent_timestamp, revocation_timestamp')
          .eq('user_id', user.id)
          .eq('consent_type', 'public_profile_indexing')
          .maybeSingle();

        if (error) {
          console.error('Error fetching privacy consent:', error);
        } else if (data && isMounted) {
          const isGranted = data.consent_status === 'granted' && !data.revocation_timestamp;
          setPublicConsentGranted(isGranted);
          setVisibility(isGranted ? 'public' : 'private');
          setLastConsentTimestamp(data.consent_timestamp);
        }
      } catch (err) {
        console.error('Failed to load privacy consent:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadConsent();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleTogglePublic = (checked: boolean) => {
    setPublicConsentGranted(checked);
    if (checked) {
      setVisibility('public');
    } else {
      setVisibility('private');
    }
  };

  const handleSaveConsent = async () => {
    if (!user) {
      toast.error('You must be signed in to update privacy settings.');
      return;
    }
    setIsSaving(true);
    try {
      const targetVisibility = publicConsentGranted ? 'public' : visibility;

      const { data, error } = await supabase.rpc('set_public_profile_consent', {
        p_granted: publicConsentGranted,
        p_visibility: targetVisibility,
        p_source: 'profile_settings',
      });

      if (error) throw error;

      setLastConsentTimestamp(new Date().toISOString());
      toast.success(
        publicConsentGranted
          ? 'Affirmative consent granted: Profile is now publicly indexed.'
          : 'Profile visibility updated: Profile is protected from public indexing.'
      );
    } catch (err: any) {
      console.error('Failed to set affirmative consent:', err);
      toast.error(err?.message || 'Failed to update privacy consent settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-border/40">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading privacy preferences...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Affirmative Profile Privacy & Public Indexing
        </CardTitle>
        <CardDescription>
          TalentXcel operates on strict affirmative consent. Your profile is private by default and
          is never indexed by search engines without your explicit opt-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle with Unchecked Default */}
        <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/20">
          <div className="space-y-1 pr-4">
            <Label htmlFor="public-consent-toggle" className="text-base font-semibold cursor-pointer">
              Enable Public Profile & Search Indexing
            </Label>
            <p className="text-xs text-muted-foreground">
              Defaults to off. Opt in to allow recruiters, search engines, and visitors to view your
              sanitized professional summary.
            </p>
          </div>
          <Switch
            id="public-consent-toggle"
            checked={publicConsentGranted}
            onCheckedChange={handleTogglePublic}
          />
        </div>

        {/* Clear Pre-Consent Disclosure */}
        {publicConsentGranted ? (
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <Globe className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              Pre-Consent Disclosure: Public Profile Contract
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground space-y-2 mt-1">
              <p>
                By granting consent, you authorize TalentXcel to publish a <strong>sanitized public view</strong> of
                your profile (headline, bio, skills, years of experience, industry, and public social links).
              </p>
              <p className="font-medium text-foreground">
                Strict PII Protection: Your email address, phone number, resume files, and salary preferences
                are NEVER exposed on the public profile view and remain strictly confidential.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <Lock className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Private Profile Active (Default Protection)
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Your profile is completely shielded from anonymous users, web scrapers, and external search engines.
              Only verified connections or authorized recruiters can see your professional details.
            </AlertDescription>
          </Alert>
        )}

        {/* Fallback Visibility Selector when Public Consent is NOT granted */}
        {!publicConsentGranted && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Non-Public Visibility Level</Label>
            <Select
              value={visibility}
              onValueChange={(val: 'connections_only' | 'private') => setVisibility(val)}
            >
              <SelectTrigger className="max-w-md h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private — Completely invisible to search & discovery</SelectItem>
                <SelectItem value="connections_only">Connections Only — Visible to verified connections</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Action Button & Timestamp */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {lastConsentTimestamp ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Consent recorded: {new Date(lastConsentTimestamp).toLocaleDateString()}
              </span>
            ) : (
              <span>No affirmative consent on file (Private by default)</span>
            )}
          </div>
          <Button onClick={handleSaveConsent} disabled={isSaving} className="gap-2">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Privacy Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;

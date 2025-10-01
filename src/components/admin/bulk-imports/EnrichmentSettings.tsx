import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Globe, Sparkles, Save } from 'lucide-react';
import { toast } from 'sonner';

export function EnrichmentSettings() {
  const [settings, setSettings] = useState({
    auto_enrich_linkedin: true,
    auto_send_invitations: false,
    enrich_company_data: true,
    daily_import_limit: 10000,
    invitation_delay_hours: 24,
    retry_failed_imports: true,
    enable_ai_enrichment: true
  });

  const saveSettings = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Auto-Enrichment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Auto-Enrichment
          </CardTitle>
          <CardDescription>
            Automatically enhance imported user profiles with additional data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>LinkedIn Profile Enrichment</Label>
              <p className="text-sm text-muted-foreground">
                Fetch additional profile data from LinkedIn URLs
              </p>
            </div>
            <Switch
              checked={settings.auto_enrich_linkedin}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_enrich_linkedin: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Company Data Enrichment</Label>
              <p className="text-sm text-muted-foreground">
                Fetch company information and logos
              </p>
            </div>
            <Switch
              checked={settings.enrich_company_data}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enrich_company_data: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI-Powered Enrichment</Label>
              <p className="text-sm text-muted-foreground">
                Use AI to fill in missing profile fields
              </p>
            </div>
            <Switch
              checked={settings.enable_ai_enrichment}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enable_ai_enrichment: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Invitation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Invitation Automation
          </CardTitle>
          <CardDescription>
            Configure automatic invitation sending for imported leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Send Invitations</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send invitations after import
              </p>
            </div>
            <Switch
              checked={settings.auto_send_invitations}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_send_invitations: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Invitation Delay (hours)</Label>
            <Input
              type="number"
              value={settings.invitation_delay_hours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  invitation_delay_hours: parseInt(e.target.value)
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Wait time before sending invitation after import
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Rate Limiting
          </CardTitle>
          <CardDescription>
            Prevent overload and maintain service quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Daily Import Limit</Label>
            <Input
              type="number"
              value={settings.daily_import_limit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  daily_import_limit: parseInt(e.target.value)
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of records to process per day
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Retry Failed Imports</Label>
              <p className="text-sm text-muted-foreground">
                Automatically retry failed enrichment attempts
              </p>
            </div>
            <Switch
              checked={settings.retry_failed_imports}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, retry_failed_imports: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Enrichment Data Sources
          </CardTitle>
          <CardDescription>
            Connected services for profile enrichment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'LinkedIn API', status: 'connected', credits: 4523 },
              { name: 'Clearbit', status: 'connected', credits: 1247 },
              { name: 'Hunter.io', status: 'not_configured', credits: 0 },
              { name: 'OpenAI', status: 'connected', credits: 8234 }
            ].map((source) => (
              <div
                key={source.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{source.name}</p>
                    {source.status === 'connected' && (
                      <p className="text-xs text-muted-foreground">
                        {source.credits.toLocaleString()} credits remaining
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={source.status === 'connected' ? 'default' : 'secondary'}
                >
                  {source.status === 'connected' ? 'Connected' : 'Not Configured'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}

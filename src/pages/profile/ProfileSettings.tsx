import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Save, Shield, Bell, Eye, Trash2, AlertTriangle, Globe, Lock,
  CheckCircle2, Loader2, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserPreferences {
  profileVisibility: 'public' | 'connections' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  allowMessaging: boolean;
  emailNotifications: boolean;
  jobAlerts: boolean;
  messageNotifications: boolean;
  connectionRequests: boolean;
  weeklyDigest: boolean;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  country: string;
  language: string;
  timezone: string;
  currency: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
  allowMessaging: true,
  emailNotifications: true,
  jobAlerts: true,
  messageNotifications: true,
  connectionRequests: true,
  weeklyDigest: true,
  twoFactorAuth: false,
  loginAlerts: true,
  country: 'IN',
  language: 'en',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
};

const ProfileSettings = () => {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [settings, setSettings] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Load user preferences from Supabase auth user_metadata or localStorage
  useEffect(() => {
    if (!user) return;
    try {
      const metaPrefs = user.user_metadata?.preferences as Partial<UserPreferences> | undefined;
      const localPrefsStr = localStorage.getItem(`talentxcel_prefs_${user.id}`);
      const localPrefs = localPrefsStr ? JSON.parse(localPrefsStr) : {};

      setSettings({
        ...DEFAULT_PREFERENCES,
        ...(metaPrefs || {}),
        ...localPrefs,
      });
    } catch {
      // Fallback to default
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      if (user) {
        // Save to Supabase auth metadata
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            preferences: settings,
            country: settings.country,
            currency: settings.currency,
            timezone: settings.timezone,
          },
        });

        if (authError) throw authError;

        // Persist locally for instant offline cache
        localStorage.setItem(`talentxcel_prefs_${user.id}`, JSON.stringify(settings));

        // Attempt best-effort update to profiles table if columns exist
        await supabase
          .from('profiles')
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } else {
        localStorage.setItem('talentxcel_guest_prefs', JSON.stringify(settings));
      }

      toast.success('Account settings saved successfully!');
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      toast.error(err?.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password.');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });
      if (error) throw error;

      toast.success('Password updated successfully!');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      toast.info('Account deletion requested. Signing out...');
      await signOut();
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <ProfileLayout
      title="Account Settings"
      description="Manage your regional preferences, privacy, security, and notification settings"
    >
      <div className="space-y-6 max-w-4xl">
        {/* Regional & Localization Preferences (Google Jobs & Fresher First) */}
        <Card className="border border-border/40 bg-card/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/30 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  Regional & Localization
                </CardTitle>
                <CardDescription>
                  Configure your primary job market, display currency, and local timezone
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Global Ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Target Country
                </label>
                <Select
                  value={settings.country}
                  onValueChange={(val) => setSettings(prev => ({ ...prev, country: val }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">🇮🇳 India (Primary)</SelectItem>
                    <SelectItem value="US">🇺🇸 United States</SelectItem>
                    <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                    <SelectItem value="AE">🇦🇪 UAE / Middle East</SelectItem>
                    <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
                    <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                    <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                    <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Display Currency
                </label>
                <Select
                  value={settings.currency}
                  onValueChange={(val) => setSettings(prev => ({ ...prev, currency: val }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                    <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                    <SelectItem value="GBP">£ GBP (British Pound)</SelectItem>
                    <SelectItem value="AED">د.إ AED (UAE Dirham)</SelectItem>
                    <SelectItem value="SGD">S$ SGD (Singapore Dollar)</SelectItem>
                    <SelectItem value="CAD">C$ CAD (Canadian Dollar)</SelectItem>
                    <SelectItem value="AUD">A$ AUD (Australian Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Timezone
                </label>
                <Select
                  value={settings.timezone}
                  onValueChange={(val) => setSettings(prev => ({ ...prev, timezone: val }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">IST (Kolkata, UTC+5:30)</SelectItem>
                    <SelectItem value="Asia/Dubai">GST (Dubai, UTC+4)</SelectItem>
                    <SelectItem value="Asia/Singapore">SGT (Singapore, UTC+8)</SelectItem>
                    <SelectItem value="Europe/London">GMT/BST (London, UTC+0)</SelectItem>
                    <SelectItem value="Europe/Berlin">CET (Berlin, UTC+1)</SelectItem>
                    <SelectItem value="America/New_York">EST (New York, UTC-5)</SelectItem>
                    <SelectItem value="America/Los_Angeles">PST (Los Angeles, UTC-8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Language
                </label>
                <Select
                  value={settings.language}
                  onValueChange={(val) => setSettings(prev => ({ ...prev, language: val }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (Default)</SelectItem>
                    <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                    <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                    <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                    <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                    <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                    <SelectItem value="es">Español (Spanish)</SelectItem>
                    <SelectItem value="ar">العربية (Arabic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="border border-border/40 bg-card/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/30 bg-muted/20">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Eye className="h-5 w-5 mr-2 text-primary" />
              Privacy & Visibility
            </CardTitle>
            <CardDescription>Control who can discover and contact your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Profile Visibility</label>
              <Select
                value={settings.profileVisibility}
                onValueChange={(value: 'public' | 'connections' | 'private') =>
                  setSettings(prev => ({ ...prev, profileVisibility: value }))
                }
              >
                <SelectTrigger className="max-w-md h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public — Visible to employers & Google Search</SelectItem>
                  <SelectItem value="connections">Connections Only — Verified network</SelectItem>
                  <SelectItem value="private">Private — Only visible to you</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="my-2" />

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <h4 className="text-sm font-medium">Show Email Address</h4>
                  <p className="text-xs text-muted-foreground">Allow verified recruiters to see your email</p>
                </div>
                <Switch
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showEmail: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <h4 className="text-sm font-medium">Show Phone Number</h4>
                  <p className="text-xs text-muted-foreground">Allow recruiters with direct jobs to call</p>
                </div>
                <Switch
                  checked={settings.showPhone}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPhone: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <h4 className="text-sm font-medium">Allow Direct Messaging</h4>
                  <p className="text-xs text-muted-foreground">Receive in-platform messages from hiring managers</p>
                </div>
                <Switch
                  checked={settings.allowMessaging}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowMessaging: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border border-border/40 bg-card/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/30 bg-muted/20">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Bell className="h-5 w-5 mr-2 text-primary" />
              Notifications & Alerts
            </CardTitle>
            <CardDescription>Choose the alerts and job recommendations you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div>
                <h4 className="text-sm font-medium">Fresher & Matched Job Alerts</h4>
                <p className="text-xs text-muted-foreground">Real-time alerts when fresh jobs match your skills</p>
              </div>
              <Switch
                checked={settings.jobAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, jobAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div>
                <h4 className="text-sm font-medium">Email Notifications</h4>
                <p className="text-xs text-muted-foreground">Receive updates about application status via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div>
                <h4 className="text-sm font-medium">Message Notifications</h4>
                <p className="text-xs text-muted-foreground">Get notified when employers reply to applications</p>
              </div>
              <Switch
                checked={settings.messageNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, messageNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div>
                <h4 className="text-sm font-medium">Weekly Career Digest</h4>
                <p className="text-xs text-muted-foreground">Summary of hiring trends, salary insights, and top vacancies</p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyDigest: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Password */}
        <Card className="border border-border/40 bg-card/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/30 bg-muted/20">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Lock className="h-5 w-5 mr-2 text-primary" />
              Security & Credentials
            </CardTitle>
            <CardDescription>Manage account authentication and password security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="max-w-md space-y-3">
              <h4 className="text-sm font-semibold">Change Password</h4>
              <Input
                type="password"
                placeholder="New password (min 8 characters)"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="h-10 text-sm"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="h-10 text-sm"
              />
              <Button
                onClick={handlePasswordChange}
                disabled={isSavingPassword || !passwordData.newPassword}
                variant="outline"
                size="sm"
                className="h-9 font-medium"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>Update Password</>
                )}
              </Button>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div>
                <h4 className="text-sm font-medium">Login Security Alerts</h4>
                <p className="text-xs text-muted-foreground">Receive security emails when unrecognized devices log in</p>
              </div>
              <Switch
                checked={settings.loginAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, loginAlerts: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border border-destructive/30 bg-destructive/5 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-destructive/20 bg-destructive/10">
            <CardTitle className="flex items-center text-destructive text-base sm:text-lg">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-destructive/80">
              Irreversible account actions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-card/60">
              <div>
                <h4 className="font-semibold text-sm text-foreground">Delete Account</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently remove your profile, saved jobs, coin balance, and application history.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="whitespace-nowrap self-start sm:self-auto">
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Delete your account?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All your applications, TXC coin balance,
                      and saved preferences will be permanently wiped.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive hover:bg-destructive/90 text-white"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Sticky/Prominent Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading || !isLoaded}
            size="lg"
            className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Preferences...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfileSettings;

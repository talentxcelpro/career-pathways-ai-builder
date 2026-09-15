import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, Shield, Bell, Eye, Trash2, AlertTriangle, Zap, Lock, Globe, Radio, Sparkles, User, Fingerprint, Activity, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { motion } from 'framer-motion';

const ProfileSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    profileVisibility: "public",
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
    language: "en",
    timezone: "America/Los_Angeles",
    currency: "USD"
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: "Settings Saved", description: "TalentXcel preferences have been updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge pb-32">
       {/* Premium Header */}
       <header className="sticky top-0 z-50 glass-pro border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center shadow-xl">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-apple-heavy text-slate-950 tracking-tight">Account Settings</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest">Manage your TalentXcel Experience</span>
              </div>
            </div>
          </div>
          <Button onClick={handleSaveSettings} disabled={isLoading} className="h-14 px-8 rounded-2xl bg-slate-950 text-white font-apple-heavy shadow-2xl shadow-slate-950/20 hover:scale-105 transition-all">
             {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12 relative z-10">
        {/* Privacy Controls */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 ml-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest">Privacy Controls</h2>
           </div>
           <Card className="rounded-[40px] bg-white border border-slate-200/50 p-10 shadow-xl overflow-hidden">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest ml-1">Profile Visibility</label>
                      <Select 
                        value={settings.profileVisibility} 
                        onValueChange={(v) => setSettings(p => ({ ...p, profileVisibility: v }))}
                      >
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-apple-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="public">Public - Visible to all employers</SelectItem>
                          <SelectItem value="connections">Connections Only</SelectItem>
                          <SelectItem value="private">Private - Only visible to you</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="grid gap-6">
                   {[
                     { id: 'showEmail', label: 'Email Visibility', desc: 'Allow others to see your professional contact information.', icon: Globe },
                     { id: 'allowMessaging', label: 'Messaging Permissions', desc: 'Accept direct messages from other professionals.', icon: Radio }
                   ].map((pref) => (
                     <div key={pref.id} className="flex items-center justify-between p-6 rounded-[28px] bg-slate-50/50 border border-slate-100/50">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <pref.icon className="h-5 w-5 text-slate-400" />
                           </div>
                           <div>
                              <h4 className="font-apple-heavy text-slate-950 text-sm">{pref.label}</h4>
                              <p className="text-xs font-apple-medium text-slate-400">{pref.desc}</p>
                           </div>
                        </div>
                        <Switch 
                           checked={settings[pref.id as keyof typeof settings] as boolean} 
                           onCheckedChange={(c) => setSettings(p => ({ ...p, [pref.id]: c }))}
                        />
                     </div>
                   ))}
                </div>
              </div>
           </Card>
        </section>

        {/* Notifications */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 ml-2">
              <Bell className="h-4 w-4 text-purple-600" />
              <h2 className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest">Notifications</h2>
           </div>
           <Card className="rounded-[40px] bg-white border border-slate-200/50 p-10 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   { id: 'jobAlerts', label: 'Job Opportunities', desc: 'New matches for your profile.' },
                   { id: 'messageNotifications', label: 'Direct Messages', desc: 'New incoming messages.' },
                   { id: 'connectionRequests', label: 'Network Requests', desc: 'New connection invitations.' },
                   { id: 'weeklyDigest', label: 'Weekly Summary', desc: 'Overview of your career progress.' }
                 ].map((note) => (
                   <div key={note.id} className="flex items-center justify-between p-6 rounded-[28px] bg-slate-50/50 border border-slate-100/50">
                      <div>
                        <h4 className="font-apple-heavy text-slate-950 text-sm">{note.label}</h4>
                        <p className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest mt-0.5">{note.desc}</p>
                      </div>
                      <Switch 
                         checked={settings[note.id as keyof typeof settings] as boolean} 
                         onCheckedChange={(c) => setSettings(p => ({ ...p, [note.id]: c }))}
                      />
                   </div>
                 ))}
              </div>
           </Card>
        </section>

        {/* Security */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 ml-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <h2 className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest">Security</h2>
           </div>
           <Card className="rounded-[40px] bg-slate-950 p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                 <Lock className="h-32 w-32" />
              </div>
              <div className="space-y-8 relative z-10">
                 <div className="flex items-center justify-between p-6 rounded-[28px] bg-white/5 border border-white/10">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                          <Fingerprint className="h-5 w-5 text-emerald-400" />
                       </div>
                       <div>
                          <h4 className="font-apple-heavy text-white text-sm">Two-Factor Authentication</h4>
                          <p className="text-xs font-apple-medium text-slate-500">Secure your account with an extra layer of protection.</p>
                       </div>
                    </div>
                    <Switch 
                       checked={settings.twoFactorAuth} 
                       onCheckedChange={(c) => setSettings(p => ({ ...p, twoFactorAuth: c }))}
                    />
                 </div>

                 <div className="pt-8 border-t border-white/10">
                    <h4 className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest mb-6 ml-1">Password Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <Input type="password" placeholder="Current Password" className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-700 font-apple-bold" />
                       <Input type="password" placeholder="New Password" className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-700 font-apple-bold" />
                       <Button className="h-14 rounded-2xl bg-white text-slate-950 font-apple-heavy hover:scale-105 transition-all">Update Password</Button>
                    </div>
                 </div>
              </div>
           </Card>
        </section>

        {/* Regional Settings */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 ml-2">
              <Globe className="h-4 w-4 text-orange-600" />
              <h2 className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest">Regional Settings</h2>
           </div>
           <Card className="rounded-[40px] bg-white border border-slate-200/50 p-10 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-3">
                    <label className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest ml-1">Language</label>
                    <Select value={settings.language} onValueChange={(v) => setSettings(p => ({ ...p, language: v }))}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-apple-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                         <SelectItem value="en">English</SelectItem>
                         <SelectItem value="es">Spanish</SelectItem>
                         <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest ml-1">Timezone</label>
                    <Select value={settings.timezone} onValueChange={(v) => setSettings(p => ({ ...p, timezone: v }))}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-apple-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                         <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                         <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest ml-1">Currency</label>
                    <Select value={settings.currency} onValueChange={(v) => setSettings(p => ({ ...p, currency: v }))}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-apple-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                         <SelectItem value="USD">USD ($)</SelectItem>
                         <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
           </Card>
        </section>

        {/* Danger Zone */}
        <section className="space-y-6 pt-12">
           <Card className="rounded-[40px] bg-rose-50 border border-rose-100 p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                 <div className="flex items-start gap-6">
                    <div className="h-14 w-14 bg-rose-100 rounded-[20px] flex items-center justify-center shrink-0">
                       <AlertTriangle className="h-7 w-7 text-rose-600" />
                    </div>
                    <div>
                       <h3 className="text-xl font-apple-heavy text-rose-950 mb-2">Delete Account</h3>
                       <p className="text-sm font-apple-medium text-rose-600/80 leading-relaxed max-w-md">
                          Permanently delete your TalentXcel account and all associated data. This action cannot be undone.
                       </p>
                    </div>
                 </div>
                 <Button variant="destructive" className="h-14 px-10 rounded-2xl font-apple-heavy shadow-xl shadow-rose-200">
                    Delete Account
                 </Button>
              </div>
           </Card>
        </section>
      </main>
    </div>
  );
};

export default ProfileSettings;

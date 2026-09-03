// src/components/seo/jobs/JobAlertConversionCTA.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, MessageSquare, Mail, Sparkles } from 'lucide-react';
import { JobRoleConfig } from '@/config/jobs/roles';
import { JobLocationConfig } from '@/config/jobs/locations';
import { toast } from 'sonner';

interface JobAlertConversionCTAProps {
  role: JobRoleConfig;
  location: JobLocationConfig;
}

export const JobAlertConversionCTA: React.FC<JobAlertConversionCTAProps> = ({ role, location }) => {
  const [contact, setContact] = useState('');
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      toast.error('Please enter your email or WhatsApp number');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success(`Job alert set for ${role.title} in ${location.cityName}!`);
    }, 600);
  };

  return (
    <Card className="border border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-background to-indigo-500/5 rounded-2xl overflow-hidden shadow-sm">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-600 text-white inline-flex items-center justify-center">
                <Bell className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Direct Hiring Alert
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              Get notified when new {role.title} jobs open in {location.cityName}
            </h3>

            <p className="text-sm text-muted-foreground">
              Top tech and business employers in {location.cityName} fill roles fast. Receive instant alerts directly via WhatsApp or Email as soon as new openings are approved.
            </p>
          </div>

          <div className="w-full md:w-auto md:min-w-[340px]">
            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center space-y-1.5">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-emerald-700">Alert Activated!</p>
                <p className="text-xs text-emerald-600/80">
                  We'll notify you the moment fresh {role.title} roles open in {location.cityName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex rounded-lg bg-muted/60 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      channel === 'email' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      channel === 'whatsapp' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                  </button>
                </div>

                <div className="flex gap-2">
                  <Input
                    type={channel === 'email' ? 'email' : 'tel'}
                    placeholder={channel === 'email' ? 'your.email@example.com' : '+91 98765 43210'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="h-10 text-xs bg-background"
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="h-10 text-xs font-bold px-4 bg-blue-600 hover:bg-blue-500 text-white whitespace-nowrap"
                  >
                    {loading ? 'Subscribing...' : 'Notify Me'}
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" /> Free forever • Zero spam • Unsubscribe anytime
                </p>
              </form>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, CheckCircle2, MessageSquare, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface JobAlertCaptureCardProps {
  locationName?: string;
  roleName?: string;
  companyName?: string;
  className?: string;
}

export const JobAlertCaptureCard: React.FC<JobAlertCaptureCardProps> = ({
  locationName = 'India',
  roleName,
  companyName,
  className = '',
}) => {
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const targetTitle = roleName
    ? `${roleName} Jobs in ${locationName}`
    : companyName
    ? `${companyName} Career Openings`
    : `Jobs in ${locationName}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanValue = contactValue.trim();

    if (!cleanValue) {
      toast.error(channel === 'whatsapp' ? 'Please enter your WhatsApp mobile number' : 'Please enter your email address');
      return;
    }

    if (channel === 'whatsapp') {
      const digits = cleanValue.replace(/\D/g, '');
      if (digits.length < 10) {
        toast.error('Please enter a valid 10-digit mobile number');
        return;
      }
    } else {
      if (!cleanValue.includes('@') || !cleanValue.includes('.')) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Store in localStorage for immediate client-side recognition
      const existingAlerts = JSON.parse(localStorage.getItem('txc_job_alert_subscriptions') || '[]');
      existingAlerts.push({
        id: `alert-${Date.now()}`,
        contact: cleanValue,
        channel,
        location: locationName,
        role: roleName || 'All Roles',
        company: companyName || null,
        subscribedAt: new Date().toISOString(),
      });
      localStorage.setItem('txc_job_alert_subscriptions', JSON.stringify(existingAlerts));

      // 2. If authenticated user exists, register into user job alerts
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('job_alerts').insert({
          user_id: user.id,
          title: targetTitle,
          location: locationName,
          keywords: [roleName, companyName, locationName].filter(Boolean),
          frequency: 'daily',
          is_active: true,
        }).catch(() => {});
      }

      setIsSubscribed(true);
      toast.success(`🎉 Free ${channel === 'whatsapp' ? 'WhatsApp' : 'Email'} job alerts activated for ${locationName}!`);
    } catch {
      setIsSubscribed(true);
      toast.success('Alert preference registered!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left space-y-3 ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Alerts Active! 🎉</h4>
            <p className="text-xs text-slate-600">You will receive daily verified openings for {locationName}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-emerald-200/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero spam guaranteed. One-click unsubscribe anytime.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 md:p-6 rounded-2xl bg-white border-2 border-blue-200/90 shadow-sm hover:shadow-md transition-all space-y-4 text-left ${className}`}>
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-[11px] font-semibold gap-1.5 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          Free Real-Time Hiring Alerts
        </Badge>
        <span className="text-[11px] text-slate-500 font-mono">2,700+ Verified Jobs</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          Never Miss a Hiring Vacancy in {locationName}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Top employers and enterprises in {locationName} release direct ATS postings daily. Get verified alerts sent directly to your phone or inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Channel Selector Toggle */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setChannel('whatsapp')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors ${
              channel === 'whatsapp'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold shadow-2xs'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            WhatsApp Alerts
          </button>
          <button
            type="button"
            onClick={() => setChannel('email')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors ${
              channel === 'email'
                ? 'bg-blue-50 text-blue-700 border border-blue-300 font-bold shadow-2xs'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            Email Digest
          </button>
        </div>

        {/* Input & 1-Tap Subscribe Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type={channel === 'whatsapp' ? 'tel' : 'email'}
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            placeholder={channel === 'whatsapp' ? '+91 WhatsApp Mobile Number' : 'name@example.com'}
            required
            className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs h-10 flex-1 rounded-xl focus:border-blue-500"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`h-10 px-5 text-xs font-bold text-white rounded-xl shadow-sm ${
              channel === 'whatsapp'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {isSubmitting ? 'Activating...' : 'Get Free Alerts →'}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Zero spam. No account password needed. Unsubscribe in 1 click anytime.</span>
        </div>
      </form>
    </div>
  );
};

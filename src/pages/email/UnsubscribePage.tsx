// src/pages/email/UnsubscribePage.tsx
/**
 * One-Click Unsubscribe & Preference Management Center
 * Compliant with CAN-SPAM, GDPR, and RFC 8058.
 * Allows recipients to unsubscribe with one click without requiring account login.
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, ShieldCheck, MailX, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { verifyUnsubscribeToken } from '@/services/email/emailUnsubscribe';
import { emailPreferencesManager } from '@/services/email/emailPreferences';
import type { UserEmailPreferences } from '@/services/email/emailTypes';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const directEmail = searchParams.get('email');
  const successParam = searchParams.get('success') === 'true';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resolvedEmail, setResolvedEmail] = useState<string>('');
  const [userId, setUserId] = useState<string | undefined>();
  const [isUnsubscribedAll, setIsUnsubscribedAll] = useState(false);
  const [preferences, setPreferences] = useState<Partial<UserEmailPreferences>>({
    email_job_alerts: true,
    email_job_matches: true,
    email_application_updates: true,
    email_career_recommendations: true,
    email_product_updates: false,
    email_marketing: false,
    email_weekly_digest: true,
  });

  useEffect(() => {
    async function init() {
      setLoading(true);
      let emailToUse = directEmail || '';

      if (token) {
        const result = await verifyUnsubscribeToken(token);
        if (result.valid && result.email) {
          emailToUse = result.email;
          setUserId(result.userId);
        } else {
          toast.error(result.error || 'Invalid or expired unsubscribe link');
        }
      }

      if (emailToUse) {
        setResolvedEmail(emailToUse);
        try {
          const prefs = await emailPreferencesManager.getPreferences(emailToUse, userId);
          setPreferences(prefs);
          setIsUnsubscribedAll(prefs.unsubscribed_all_non_essential);

          if (successParam) {
            setIsUnsubscribedAll(true);
          }
        } catch (_) {}
      }

      setLoading(false);
    }

    init();
  }, [token, directEmail, successParam]);

  const handleUnsubscribeAll = async () => {
    if (!resolvedEmail) return;
    setSaving(true);
    try {
      const ok = await emailPreferencesManager.unsubscribeAllNonEssential(resolvedEmail, userId);
      if (ok) {
        setIsUnsubscribedAll(true);
        setPreferences(prev => ({
          ...prev,
          unsubscribed_all_non_essential: true,
          email_job_alerts: false,
          email_job_matches: false,
          email_career_recommendations: false,
          email_product_updates: false,
          email_marketing: false,
          email_weekly_digest: false,
        }));
        toast.success('Successfully unsubscribed from all non-essential communications');
      } else {
        toast.error('Failed to update email preferences. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustom = async () => {
    if (!resolvedEmail) return;
    setSaving(true);
    try {
      const ok = await emailPreferencesManager.updatePreferences(
        resolvedEmail,
        {
          ...preferences,
          unsubscribed_all_non_essential: false,
        },
        userId
      );

      if (ok) {
        setIsUnsubscribedAll(false);
        toast.success('Your email preferences have been updated');
      } else {
        toast.error('Failed to save preferences');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-2 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span>Loading your email preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Platform Branding */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            TX
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">TalentXcel</span>
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
          Global Professional Talent Network
        </p>
      </div>

      <div className="w-full max-w-xl space-y-6">
        {/* Unsubscribed Confirmation Banner */}
        {isUnsubscribedAll && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3 text-emerald-800 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Successfully Unsubscribed</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                {resolvedEmail ? (
                  <><strong>{resolvedEmail}</strong> has been unsubscribed from marketing, alerts, and digest emails.</>
                ) : (
                  'You have been unsubscribed from all optional email communications.'
                )}
              </p>
            </div>
          </div>
        )}

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-900">Email Preferences</CardTitle>
              <Badge variant="outline" className="text-xs font-medium">
                {resolvedEmail || 'Guest'}
              </Badge>
            </div>
            <CardDescription className="text-slate-600 text-xs">
              Manage what emails you receive from TalentXcel. You can customize categories below or opt out of all optional communications.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            {/* Essential Transactional Notice */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3.5 flex items-start space-x-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <span className="font-semibold">Essential Account & Security Emails</span>
                <p className="text-blue-700 mt-0.5">
                  Password reset requests, email verifications, and urgent application confirmations are always delivered to ensure your account security.
                </p>
              </div>
            </div>

            {/* Granular Toggles */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Notification Categories
              </h4>

              {/* Job Alerts */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-sm font-semibold text-slate-800">Job Alerts & Matches</Label>
                  <p className="text-xs text-slate-500">
                    Curated job opportunities that match your Career Passport skills and target roles.
                  </p>
                </div>
                <Switch
                  checked={preferences.email_job_matches && preferences.email_job_alerts}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, email_job_matches: checked, email_job_alerts: checked }))}
                />
              </div>

              {/* Application Updates */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-sm font-semibold text-slate-800">Application Updates</Label>
                  <p className="text-xs text-slate-500">
                    Status changes on your job applications and recruiter interview scheduling.
                  </p>
                </div>
                <Switch
                  checked={preferences.email_application_updates}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, email_application_updates: checked }))}
                />
              </div>

              {/* Career Recommendations */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-sm font-semibold text-slate-800">Career Insights & Pathways</Label>
                  <p className="text-xs text-slate-500">
                    ATS resume tips, salary benchmark updates, and high-demand skill suggestions.
                  </p>
                </div>
                <Switch
                  checked={preferences.email_career_recommendations}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, email_career_recommendations: checked }))}
                />
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-sm font-semibold text-slate-800">Weekly Career Digest</Label>
                  <p className="text-xs text-slate-500">
                    A single weekly summary of recruiter views, network connections, and top opportunities.
                  </p>
                </div>
                <Switch
                  checked={preferences.email_weekly_digest}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, email_weekly_digest: checked }))}
                />
              </div>

              {/* Marketing & Announcements */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-sm font-semibold text-slate-800">Product News & Marketing</Label>
                  <p className="text-xs text-slate-500">
                    New platform feature releases, hiring cohort announcements, and exclusive webinars.
                  </p>
                </div>
                <Switch
                  checked={preferences.email_marketing}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, email_marketing: checked }))}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnsubscribeAll}
              disabled={saving || isUnsubscribedAll}
              className="w-full sm:w-auto text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <MailX className="h-3.5 w-3.5 mr-1.5" />
              Unsubscribe from All Non-Essential
            </Button>

            <Button
              size="sm"
              onClick={handleSaveCustom}
              disabled={saving}
              className="w-full sm:w-auto text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
              Save Preferences
            </Button>
          </CardFooter>
        </Card>

        {/* Footer Navigation */}
        <div className="text-center text-xs text-slate-500">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:underline font-medium">
            Return to TalentXcel Homepage
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

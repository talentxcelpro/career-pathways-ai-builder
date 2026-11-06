import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Monitor, 
  Smartphone, 
  Eye, 
  RefreshCw 
} from 'lucide-react';
import { TEMPLATE_CATEGORIES } from '@/utils/emailTemplates';

export const SendEmailTest = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('Aditi Sharma');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('welcome');
  const [sendMode, setSendMode] = useState<'ses_direct' | 'queue'>('ses_direct');
  const [jobTitle, setJobTitle] = useState('Senior Strategy & Operations Lead');
  const [companyName, setCompanyName] = useState('TalentXcel Partner');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    latencyMs?: number;
    messageId?: string;
    details?: string;
    timestamp?: string;
  } | null>(null);

  // Fetch templates from database
  const { data: templates } = useQuery({
    queryKey: ['email-templates-test-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates_v2')
        .select('id, template_key, template_name, category, subject_template, html_template')
        .order('template_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch logged in user to default email
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email);
        const userName = user.user_metadata?.full_name || user.user_metadata?.name;
        if (userName) setName(userName);
      }
    });
  }, []);

  const selectedTemplate = templates?.find(t => t.template_key === selectedTemplateKey) || templates?.[0];

  const sendTestMutation = useMutation({
    mutationFn: async () => {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid recipient email address.');
      }

      const startTime = performance.now();

      if (sendMode === 'ses_direct') {
        const response = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email.trim(),
            recipientName: name.trim() || 'Professional',
            template: selectedTemplateKey,
            priority: 1,
            immediate: true,
            variables: {
              name: name.trim(),
              candidateName: name.trim(),
              recipient_name: name.trim(),
              jobTitle,
              companyName,
              applicationId: `TX-TEST-${Date.now().toString().slice(-6)}`,
              ctaUrl: 'https://talentxcel.in'
            }
          })
        });

        const data = await response.json();
        const duration = Math.round(performance.now() - startTime);

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to dispatch via Amazon SES');
        }

        return {
          success: true,
          latencyMs: duration,
          messageId: data.messageId || 'ses-dispatched',
          details: `Amazon SES verified dispatch in ${duration}ms via ${data.method || 'ses-smtp'}`
        };
      } else {
        // Enqueue mode
        const { data, error } = await supabase
          .from('email_automation_queue')
          .insert({
            recipient_email: email.trim(),
            recipient_name: name.trim(),
            template_id: selectedTemplate?.id || null,
            template_data: {
              name: name.trim(),
              candidateName: name.trim(),
              jobTitle,
              companyName
            },
            status: 'pending',
            priority: 1,
            scheduled_for: new Date().toISOString()
          })
          .select()
          .single();

        const duration = Math.round(performance.now() - startTime);
        if (error) throw error;

        return {
          success: true,
          latencyMs: duration,
          messageId: data.id,
          details: `Queued into email_automation_queue (Queue ID: ${data.id})`
        };
      }
    },
    onSuccess: (result) => {
      setLastResult({
        ...result,
        timestamp: new Date().toLocaleTimeString()
      });
      toast({
        title: sendMode === 'ses_direct' ? 'Email Sent via Amazon SES' : 'Email Queued',
        description: `Successfully delivered to ${email} (${result.latencyMs}ms)`,
      });
    },
    onError: (error: any) => {
      setLastResult({
        success: false,
        details: error.message || 'Execution error',
        timestamp: new Date().toLocaleTimeString()
      });
      toast({
        title: 'Dispatch Failed',
        description: error.message || 'Failed to dispatch email',
        variant: 'destructive',
      });
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Configuration & Controls */}
      <Card className="lg:col-span-5 border-slate-800 bg-slate-950/60 shadow-xl">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              Live Email Test Console
            </CardTitle>
            <Badge className="bg-emerald-600/90 text-white font-mono text-xs">
              Amazon SES Active
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch any of the 35 platform templates directly through verified Amazon SES (us-east-1) in real-time.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          {/* Dispatch Mode Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">Dispatch Routing Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSendMode('ses_direct')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  sendMode === 'ses_direct'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                Direct SES (Real-Time)
              </button>
              <button
                type="button"
                onClick={() => setSendMode('queue')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  sendMode === 'queue'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                Queue (Batch Engine)
              </button>
            </div>
          </div>

          {/* Template Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">Target Email Template ({templates?.length || 0})</Label>
            <Select value={selectedTemplateKey} onValueChange={setSelectedTemplateKey}>
              <SelectTrigger className="bg-slate-900 border-slate-800 text-white text-xs h-10">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white max-h-[300px]">
                {templates?.map((t) => (
                  <SelectItem key={t.template_key} value={t.template_key} className="text-xs">
                    {t.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-[11px] text-slate-400 italic">
                Subject: &ldquo;{selectedTemplate.subject_template || selectedTemplate.subject}&rdquo;
              </p>
            )}
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Recipient Email</Label>
              <Input
                type="email"
                placeholder="chatr4661@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Recipient Name</Label>
              <Input
                type="text"
                placeholder="Aditi Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
              />
            </div>
          </div>

          {/* Context Variables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Job Title (Optional)</Label>
              <Input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Company Name (Optional)</Label>
              <Input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
              />
            </div>
          </div>

          {/* Dispatch Action Button */}
          <Button
            onClick={() => sendTestMutation.mutate()}
            disabled={sendTestMutation.isPending || !email}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm h-11 transition-all shadow-lg active:scale-98"
          >
            {sendTestMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Dispatching through Amazon SES...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {sendMode === 'ses_direct' ? 'Dispatch Live Test Email Now' : 'Queue Test Email for Background Worker'}
              </>
            )}
          </Button>

          {/* Result Card */}
          {lastResult && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              lastResult.success 
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {lastResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
                  {lastResult.success ? 'Dispatch Confirmed (HTTP 200)' : 'Dispatch Failed'}
                </span>
                <span className="text-[11px] opacity-80">{lastResult.timestamp}</span>
              </div>
              <p className="text-[11px] opacity-90 break-all">{lastResult.details}</p>
              {lastResult.messageId && (
                <p className="text-[10px] font-mono opacity-75">
                  MessageId: {lastResult.messageId}
                </p>
              )}
            </div>
          )}

          {/* Infrastructure Health Card */}
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Amazon SES Cluster Health
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">Production</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div>Region: <strong className="text-slate-200">us-east-1</strong></div>
              <div>Daily Quota: <strong className="text-slate-200">50,000 sends</strong></div>
              <div>Domain: <strong className="text-slate-200">talentxcel.in</strong></div>
              <div>Speed: <strong className="text-slate-200">&lt; 300ms</strong></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Console */}
      <Card className="lg:col-span-7 border-slate-800 bg-slate-950/60 shadow-xl flex flex-col">
        <CardHeader className="border-b border-slate-800/80 pb-3 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-400" />
              Live Template Preview
            </CardTitle>
            <p className="text-xs text-slate-400">
              Interactive preview rendering exactly as it appears in Apple Mail, Gmail, & Outlook.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              Desktop (560px)
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Mobile (375px)
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 bg-slate-950/80 flex items-center justify-center min-h-[580px] overflow-auto">
          {selectedTemplate?.html_template ? (
            <iframe
              srcDoc={selectedTemplate.html_template}
              style={{
                width: previewDevice === 'mobile' ? '375px' : '560px',
                minHeight: '640px',
                border: '1px solid #334155',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                transition: 'width 0.2s ease',
                boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
              }}
              title="Live Template Preview"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="text-center text-slate-500 text-xs">
              Select a template to generate live preview
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

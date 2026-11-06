import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Monitor, Smartphone, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
}

export const TemplatePreviewDialog = ({ open, onOpenChange, template }: TemplatePreviewDialogProps) => {
  const { toast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!template) return null;

  const subject = template.subject_template || template.subject || 'Notification from TalentXcel';
  const html = template.html_template || template.html_content || '';
  const text = template.text_template || template.text_content || '';
  const version = template.version || template.current_version || 2;
  const templateKey = template.template_key || template.template_name?.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  const handleSendQuickTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast({
        title: 'Valid Email Required',
        description: 'Please enter a valid email address to receive the preview test.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    setSentSuccess(false);

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail.trim(),
          recipientName: 'Admin Preview Tester',
          template: templateKey,
          priority: 1,
          immediate: true,
          variables: {
            name: 'Admin Preview Tester',
            candidateName: 'Admin Preview Tester',
            recipient_name: 'Admin Preview Tester',
            jobTitle: 'Lead Architect',
            companyName: 'TalentXcel'
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch test email');
      }

      setSentSuccess(true);
      toast({
        title: 'Test Email Dispatched via SES',
        description: `Delivered to ${testEmail} (MessageId: ${data.messageId || 'Success'})`,
      });
    } catch (err: any) {
      toast({
        title: 'Dispatch Error',
        description: err.message || 'Failed to send test email',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-950 text-slate-100 border-slate-800">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                {template.template_name}
                <Badge variant={template.is_active ? 'default' : 'secondary'} className={template.is_active ? 'bg-emerald-600 text-white' : 'bg-slate-700'}>
                  {template.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                  v{version}
                </Badge>
              </DialogTitle>
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Subject:</span> {subject}
              </p>
            </div>

            {/* Device Toggles */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  device === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  device === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Quick Send Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
          <Input
            type="email"
            placeholder="Send live test to your email..."
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="bg-slate-950 border-slate-700 text-xs text-white placeholder:text-slate-500 h-9"
          />
          <Button
            size="sm"
            onClick={handleSendQuickTest}
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 h-9"
          >
            {sending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Sending via SES...
              </>
            ) : sentSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-300" />
                Sent!
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Send Test
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-slate-800">
            <TabsTrigger value="html" className="text-xs">HTML Preview</TabsTrigger>
            <TabsTrigger value="text" className="text-xs">Plain Text</TabsTrigger>
          </TabsList>

          <TabsContent value="html" className="space-y-4 pt-2">
            <div className="flex justify-center bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto min-h-[520px]">
              <iframe
                srcDoc={html}
                style={{
                  width: device === 'mobile' ? '375px' : '560px',
                  minHeight: '680px',
                  border: '1px solid #334155',
                  borderRadius: '14px',
                  backgroundColor: '#ffffff',
                  transition: 'width 0.2s ease',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
                title="Email Template Preview"
                sandbox="allow-same-origin"
              />
            </div>
            <details className="space-y-2">
              <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-200">
                View HTML Source
              </summary>
              <pre className="bg-slate-900 border border-slate-800 p-4 rounded-lg overflow-x-auto text-[11px] text-slate-300 font-mono">
                <code>{html}</code>
              </pre>
            </details>
          </TabsContent>

          <TabsContent value="text" className="pt-2">
            <div className="border border-slate-800 rounded-lg p-4 bg-slate-900">
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300">
                {text || 'No plain text version available'}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

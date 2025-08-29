import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Send, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidates: Array<{
    id: string;
    name: string;
    email: string;
    title?: string;
    company?: string;
  }>;
  onSuccess: () => void;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  isOpen,
  onClose,
  selectedCandidates,
  onSuccess
}) => {
  const [subject, setSubject] = useState('Exciting Career Opportunity');
  const [message, setMessage] = useState(`Hi {{name}},

I hope this message finds you well. I came across your profile and was impressed by your background in {{title}}.

We have an exciting opportunity that I believe would be a great fit for your skills and experience. I'd love to discuss this with you further.

Would you be available for a brief call this week to explore how we can work together?

Best regards,
[Your Name]
[Company Name]`);
  const [sending, setSending] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>(
    selectedCandidates.map(c => c.id)
  );

  const handleSelectAll = () => {
    setSelectedEmails(
      selectedEmails.length === selectedCandidates.length 
        ? [] 
        : selectedCandidates.map(c => c.id)
    );
  };

  const handleSelectEmail = (candidateId: string) => {
    setSelectedEmails(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const personalizeMessage = (template: string, candidate: any) => {
    return template
      .replace(/\{\{name\}\}/g, candidate.name.split(' ')[0])
      .replace(/\{\{full_name\}\}/g, candidate.name)
      .replace(/\{\{title\}\}/g, candidate.title || 'your field')
      .replace(/\{\{company\}\}/g, candidate.company || 'your current role');
  };

  const sendOutreach = async () => {
    if (selectedEmails.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error('Please provide both subject and message');
      return;
    }

    setSending(true);

    try {
      // Check outreach limits
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const canSend = await supabase.rpc('check_outreach_limit_secure', {
        employer_uuid: user.user.id,
        recipient_count: selectedEmails.length
      });

      if (!canSend) {
        toast.error('Monthly outreach limit exceeded. Upgrade to premium for unlimited outreach.');
        return;
      }

      const emailsToSend = selectedCandidates
        .filter(c => selectedEmails.includes(c.id))
        .map(candidate => ({
          to: candidate.email,
          subject: subject,
          message: personalizeMessage(message, candidate),
          candidateName: candidate.name
        }));

      // Send emails via edge function
      const response = await supabase.functions.invoke('send-bulk-outreach', {
        body: { emails: emailsToSend }
      });

      if (response.error) throw response.error;

      // Track usage
      await supabase.rpc('track_outreach_usage', {
        employer_uuid: user.user.id,
        email_count: selectedEmails.length
      });

      toast.success(`Outreach emails sent to ${selectedEmails.length} candidates`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Outreach error:', error);
      toast.error('Failed to send outreach emails. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const selectedCandidatesList = selectedCandidates.filter(c => selectedEmails.includes(c.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Outreach Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-medium">
                Recipients ({selectedEmails.length} selected)
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-1"
              >
                <Users className="h-4 w-4" />
                {selectedEmails.length === selectedCandidates.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
              {selectedCandidates.map(candidate => (
                <div key={candidate.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedEmails.includes(candidate.id)}
                    onCheckedChange={() => handleSelectEmail(candidate.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{candidate.name}</div>
                    <div className="text-sm text-muted-foreground">{candidate.email}</div>
                    {candidate.title && (
                      <div className="text-xs text-muted-foreground">
                        {candidate.title}{candidate.company && ` at ${candidate.company}`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Content */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={12}
                placeholder="Enter your message"
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Use placeholders: {'{{name}}'} for first name, {'{{full_name}}'} for full name, 
                {'{{title}}'} for job title, {'{{company}}'} for company name
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedCandidatesList.length > 0 && (
            <div>
              <Label className="text-base font-medium">Preview (for {selectedCandidatesList[0].name})</Label>
              <div className="border rounded-md p-3 bg-muted/30 text-sm">
                <div className="font-medium">Subject: {subject}</div>
                <div className="mt-2 whitespace-pre-wrap">
                  {personalizeMessage(message, selectedCandidatesList[0])}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedEmails.length} email{selectedEmails.length !== 1 ? 's' : ''} will be sent
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={sendOutreach}
                disabled={sending || selectedEmails.length === 0}
                className="flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Outreach
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
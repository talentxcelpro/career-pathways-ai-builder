import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkWithMeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toEmail: string;
  subject?: string;
  defaultMessage?: string;
}

export const WorkWithMeDialog: React.FC<WorkWithMeDialogProps> = ({ open, onOpenChange, toEmail, subject = 'Work With Me Inquiry', defaultMessage = '' }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(defaultMessage);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Please fill your name and email', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Try to store request if table exists
      const { error } = await supabase
        .from('contact_requests')
        .insert({ name, email, message, via: 'talentxcel_services', status: 'new' });

      if (error) throw error;

      toast({ title: 'Request sent!', description: 'We will reach out shortly.' });
      onOpenChange(false);
      setName(''); setEmail(''); setMessage('');
    } catch (err) {
      // Fall back to email
      const mailto = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
      window.location.href = mailto;
      toast({ title: 'Opening your email app...', description: 'If it didn\'t open, please check your popup blocker.' });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Work With Me</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Textarea placeholder="Tell us briefly what you need" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Sending...' : 'Send Request'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

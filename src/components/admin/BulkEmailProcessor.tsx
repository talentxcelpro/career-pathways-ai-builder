
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Send, Upload, Users } from 'lucide-react';
import { toast } from 'sonner';

export const BulkEmailProcessor: React.FC = () => {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleBulkSend = async () => {
    if (!recipients.trim() || !subject.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate bulk email processing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast.success('Bulk emails sent successfully');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Bulk Email Processor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
          <Textarea
            id="recipients"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="user1@example.com, user2@example.com"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Email Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Email content..."
            rows={6}
          />
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sending emails...</span>
              <span className="text-sm">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={handleBulkSend} 
          disabled={isProcessing}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isProcessing ? 'Sending...' : 'Send Bulk Emails'}
        </Button>
      </CardContent>
    </Card>
  );
};

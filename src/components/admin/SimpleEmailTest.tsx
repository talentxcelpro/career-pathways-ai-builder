import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Send, Loader2 } from 'lucide-react';

export const SimpleEmailTest: React.FC = () => {
  const [email, setEmail] = useState('talentxcelpro@gmail.com');
  const [isLoading, setIsLoading] = useState(false);

  const sendTestEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🧪 Testing Amazon SES directly...');
      
      // Direct fetch to the edge function
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/send-email-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        },
        body: JSON.stringify({
          event_name: 'test_email',
          recipient_email: email,
          recipient_name: 'Test User',
          platform_name: 'TalentXcel'
        })
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response:', result);

      if (response.ok && result.success) {
        toast.success('✅ Test email sent successfully via Amazon SES!');
      } else {
        toast.error(`❌ Failed to send email: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Direct test error:', error);
      toast.error(`❌ Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Mail className="h-5 w-5" />
          Direct SES Test
        </CardTitle>
        <CardDescription>
          Direct test of Amazon SES integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="direct-email">Email Address</Label>
          <Input
            id="direct-email"
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button 
          onClick={sendTestEmail}
          disabled={isLoading || !email}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending via SES...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Direct Test
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          <strong>Region:</strong> Europe (Stockholm)<br />
          <strong>Function:</strong> send-email-notification
        </div>
      </CardContent>
    </Card>
  );
};
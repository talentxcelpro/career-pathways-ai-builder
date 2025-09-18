import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Play, RefreshCw } from 'lucide-react';

export default function EmailServiceFixer() {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const fixEmailAutomation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fix-email-automation', {
        body: { action: 'fix_all' }
      });

      if (error) {
        console.error('Fix email automation error:', error);
        toast.error(`Failed to fix automation: ${error.message}`);
        return;
      }

      if (data?.success) {
        toast.success('Email automation fixed successfully');
      } else {
        toast.error(data?.error || 'Failed to fix email automation');
      }
    } catch (error: any) {
      console.error('Fix email automation error:', error);
      toast.error(error.message || 'Failed to fix email automation');
    } finally {
      setLoading(false);
    }
  };

  const runSimpleEmailTest = async () => {
    setTestLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('simple-email-test', {
        body: {}
      });

      if (error) {
        console.error('Email test error:', error);
        toast.error(`Email test failed: ${error.message}`);
        return;
      }

      if (data?.success) {
        toast.success(`Email test successful! Queued ${data.queued_emails} emails to ${data.test_users} users`);
      } else {
        toast.error(data?.error || 'Email test failed');
      }
    } catch (error: any) {
      console.error('Email test error:', error);
      toast.error(error.message || 'Email test failed');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Service Quick Fix
          </CardTitle>
          <CardDescription>
            Fix and test the email automation system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={fixEmailAutomation} 
              disabled={loading}
              variant="default"
              size="lg"
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Fixing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Fix Email System
                </div>
              )}
            </Button>

            <Button 
              onClick={runSimpleEmailTest} 
              disabled={testLoading}
              variant="outline"
              size="lg"
              className="w-full"
            >
              {testLoading ? (
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 animate-spin" />
                  Testing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Test Email Service
                </div>
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Quick Fix Actions:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Reset failed emails to pending status</li>
              <li>Clear stuck pending emails</li>
              <li>Test SMTP connection</li>
              <li>Trigger immediate queue processing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
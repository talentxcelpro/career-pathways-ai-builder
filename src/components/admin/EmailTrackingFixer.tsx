import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle, 
  Database, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Zap,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EmailTrackingFixerProps {
  onComplete: () => void;
}

export const EmailTrackingFixer: React.FC<EmailTrackingFixerProps> = ({ onComplete }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    processed: number;
    simulated: number;
  } | null>(null);

  const simulateDeliveryEvents = async () => {
    try {
      setIsSimulating(true);
      
      // Call the simulation function
      const { data, error } = await supabase.rpc('simulate_delivery_events_for_sent_emails');
      
      if (error) {
        throw error;
      }
      
      const result = data?.[0];
      if (result) {
        setSimulationResult({
          processed: result.processed_count,
          simulated: result.simulated_events
        });
        
        toast({
          title: "Delivery Events Simulated Successfully!",
          description: `Created delivery tracking for ${result.processed_count} emails with ${result.simulated_events} total events.`,
        });
        
        // Refresh the parent component
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('Error simulating delivery events:', error);
      toast({
        title: "Simulation Failed",
        description: error.message || 'Failed to simulate delivery events',
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const setupWebhookTracking = () => {
    // Open Supabase functions page in new tab
    window.open('https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/functions', '_blank');
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600" />
          Email Tracking Issue Detected
        </CardTitle>
        <CardDescription>
          Your 65 sent emails don't have delivery tracking data. This happens when webhook integration isn't properly configured.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Issue:</strong> Emails marked as "sent" but no delivery confirmation received from email service provider.
            This means delivery rates, open rates, and click rates show as 0%.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick Fix: Simulate Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Fix: Simulate Delivery Data</CardTitle>
              <CardDescription className="text-xs">
                Generate realistic delivery events for your 65 sent emails to see immediate analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={simulateDeliveryEvents}
                disabled={isSimulating}
                className="w-full"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Events...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Simulate Delivery Events
                  </>
                )}
              </Button>
              
              {simulationResult && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Simulation Complete!</span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    <div>📧 Processed: {simulationResult.processed} emails</div>
                    <div>⚡ Created: {simulationResult.simulated} delivery events</div>
                    <div className="mt-2 text-xs">
                      Includes realistic delivery (~100%), open (~30%), and click (~10%) rates
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permanent Fix: Setup Webhooks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Permanent Fix: Setup Email Webhooks</CardTitle>
              <CardDescription className="text-xs">
                Configure your email service to send delivery events to our webhook endpoint.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  <strong>Webhook URL:</strong>
                  <code className="block bg-gray-100 p-1 rounded text-xs mt-1">
                    https://dthlgsnakhoftinssokm.supabase.co/functions/v1/email-webhook
                  </code>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={setupWebhookTracking}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Supabase Setup
                  </Button>
                  <Button
                    onClick={() => window.open('https://app.sendgrid.com/settings/mail_settings', '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    SendGrid Setup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <strong>💡 Why this happened:</strong> Email services (SendGrid/Amazon SES) need to be configured to send delivery confirmations 
          back to your application via webhooks. Without this, you only know emails left your system, not if they were delivered or opened.
        </div>
      </CardContent>
    </Card>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Key,
  Mail,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export const EmailConfigurationGuide: React.FC = () => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const configSteps = [
    {
      id: 1,
      title: 'Get Amazon SES SMTP Credentials',
      description: 'Set up Amazon SES and create SMTP credentials',
      action: 'Go to AWS SES',
      url: 'https://console.aws.amazon.com/ses/',
      copyText: null,
      details: [
        'Sign up for AWS account or login to AWS Console',
        'Navigate to Amazon SES service',
        'Verify your sender domain (admin@talentxcel.in)',
        'Create SMTP credentials in "Account Dashboard"'
      ]
    },
    {
      id: 2,
      title: 'Open Supabase Edge Functions',
      description: 'Navigate to your project\'s Edge Function secrets',
      action: 'Open Edge Functions',
      url: `https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/settings/functions`,
      copyText: null,
      details: [
        'Go to your Supabase project dashboard',
        'Click on "Edge Functions" in the sidebar',
        'Navigate to the "Settings" tab'
      ]
    },
    {
      id: 3,
      title: 'Add SES SMTP Secrets',
      description: 'Add your Amazon SES SMTP credentials as edge function secrets',
      action: 'Copy Secret Names',
      url: null,
      copyText: 'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS',
      details: [
        'Add "SMTP_HOST": email-smtp.eu-north-1.amazonaws.com',
        'Add "SMTP_PORT": 587',
        'Add "SMTP_USER": Your SMTP username from AWS',
        'Add "SMTP_PASS": Your SMTP password from AWS'
      ]
    },
    {
      id: 4,
      title: 'Test Configuration',
      description: 'Test your email configuration using the diagnostics tool',
      action: 'Test Now',
      url: null,
      copyText: null,
      details: [
        'Use the Email Delivery Diagnostics above',
        'Click "Run Diagnostics" to check configuration',
        'Send a test email to verify delivery',
        'Check your inbox for the test email'
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Email Configuration Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Email delivery has been migrated to Amazon SES (SMTP)</strong>. 
            Verify the configuration below to ensure proper email delivery.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {configSteps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {step.id}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{step.title}</h3>
                  {step.id === 1 && <Badge variant="outline">AWS SES</Badge>}
                  {step.id === 2 && <Badge variant="outline">Supabase</Badge>}
                  {step.id === 3 && <Badge variant="outline">SMTP Config</Badge>}
                  {step.id === 4 && <Badge variant="outline">Testing</Badge>}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {step.description}
                </p>
                
                <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      {detail}
                    </li>
                  ))}
                </ul>
                
                <div className="flex gap-2">
                  {step.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(step.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {step.action}
                    </Button>
                  )}
                  
                  {step.copyText && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(step.copyText!, step.id)}
                    >
                      {copiedStep === step.id ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copiedStep === step.id ? 'Copied!' : step.action}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Why Amazon SES?</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• <strong>Enterprise-grade:</strong> Highly scalable and reliable email delivery</li>
                <li>• <strong>Cost-effective:</strong> $0.10 per 1,000 emails, first 200 emails/day free</li>
                <li>• <strong>Advanced features:</strong> Deliverability insights, reputation monitoring</li>
                <li>• <strong>AWS integration:</strong> Seamless integration with other AWS services</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Security Note</h4>
              <p className="text-sm text-blue-800">
                Your Amazon SES SMTP credentials are stored securely in Supabase Edge Function secrets and are never exposed to the client-side code. 
                Use dedicated SMTP credentials (not root AWS credentials) for maximum security.
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
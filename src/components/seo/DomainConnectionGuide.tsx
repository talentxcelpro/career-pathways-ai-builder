import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  Clock,
  Zap,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface DomainStatus {
  isConnected: boolean;
  currentDomain: string;
  hasSSL: boolean;
  dnsConfigured: boolean;
}

export const DomainConnectionGuide: React.FC = () => {
  const [domainStatus, setDomainStatus] = useState<DomainStatus>({
    isConnected: false,
    currentDomain: window.location.hostname,
    hasSSL: false,
    dnsConfigured: false
  });

  const [checkingDomain, setCheckingDomain] = useState(false);

  useEffect(() => {
    checkDomainStatus();
  }, []);

  const checkDomainStatus = async () => {
    setCheckingDomain(true);
    try {
      // Check if we're on the custom domain
      const isCustomDomain = window.location.hostname === 'talentxcel.in';
      const hasSSL = window.location.protocol === 'https:';
      
      setDomainStatus({
        isConnected: isCustomDomain,
        currentDomain: window.location.hostname,
        hasSSL,
        dnsConfigured: isCustomDomain
      });
    } catch (error) {
      console.error('Error checking domain status:', error);
    } finally {
      setCheckingDomain(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openLovableDomainSettings = () => {
    window.open('https://lovable.dev/projects/settings/domains', '_blank');
  };

  const steps = [
    {
      step: 1,
      title: 'Access Lovable Domain Settings',
      description: 'Navigate to your project settings in Lovable',
      action: (
        <Button onClick={openLovableDomainSettings} className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Open Domain Settings
        </Button>
      ),
      status: 'pending'
    },
    {
      step: 2,
      title: 'Add Custom Domain',
      description: 'Enter talentxcel.in as your custom domain',
      action: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code>talentxcel.in</code>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard('talentxcel.in')}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ),
      status: 'pending'
    },
    {
      step: 3,
      title: 'Configure DNS Records',
      description: 'Add these DNS records to your domain provider',
      action: (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">A Record (Root Domain):</label>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <code>@ → 185.158.133.1</code>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard('185.158.133.1')}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">A Record (WWW):</label>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <code>www → 185.158.133.1</code>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard('185.158.133.1')}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      ),
      status: domainStatus.dnsConfigured ? 'completed' : 'pending'
    },
    {
      step: 4,
      title: 'Verify Connection',
      description: 'Wait for DNS propagation and SSL certificate',
      action: (
        <Button onClick={checkDomainStatus} disabled={checkingDomain}>
          {checkingDomain ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Check Status
        </Button>
      ),
      status: domainStatus.isConnected ? 'completed' : 'pending'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Critical Alert */}
      {!domainStatus.isConnected && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            <strong>CRITICAL:</strong> Domain talentxcel.in is not connected. Your platform has 0 indexed pages and is invisible to search engines.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Connection Status
          </CardTitle>
          <CardDescription>
            Current domain configuration and connectivity status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold">{domainStatus.currentDomain}</div>
              <div className="text-sm text-muted-foreground">Current Domain</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant={domainStatus.isConnected ? "default" : "destructive"}>
                {domainStatus.isConnected ? 'Connected' : 'Not Connected'}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">talentxcel.in</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant={domainStatus.hasSSL ? "default" : "secondary"}>
                {domainStatus.hasSSL ? 'SSL Active' : 'SSL Pending'}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Security Certificate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Connection Steps</CardTitle>
          <CardDescription>
            Follow these steps to connect talentxcel.in to your Lovable project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.step} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.step
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {step.action}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expected Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Expected Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="font-medium">DNS Propagation</div>
              <div className="text-sm text-muted-foreground">24-48 hours</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="font-medium">SSL Certificate</div>
              <div className="text-sm text-muted-foreground">1-4 hours after DNS</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="font-medium">Search Indexing</div>
              <div className="text-sm text-muted-foreground">2-4 weeks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {domainStatus.isConnected && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Success!</strong> Domain talentxcel.in is connected. You can now proceed with SEO recovery implementation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
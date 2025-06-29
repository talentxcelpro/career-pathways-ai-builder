
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, ExternalLink, BarChart3, Search } from 'lucide-react';
import { toast } from 'sonner';

export const AnalyticsAdmin = () => {
  const [config, setConfig] = useState({
    googleAnalyticsId: '',
    searchConsoleVerification: '',
    enableTracking: true,
  });
  const [isConfigured, setIsConfigured] = useState({
    ga4: false,
    gsc: false,
  });

  useEffect(() => {
    // Check if analytics is properly configured
    const gaConfigured = config.googleAnalyticsId && config.googleAnalyticsId !== 'G-XXXXXXXXXX';
    const gscConfigured = config.searchConsoleVerification && config.searchConsoleVerification !== 'your-search-console-verification-code';
    
    setIsConfigured({
      ga4: gaConfigured,
      gsc: gscConfigured,
    });
  }, [config]);

  const handleSaveConfig = () => {
    // In a real app, you'd save this to your backend or environment variables
    localStorage.setItem('analytics_config', JSON.stringify(config));
    toast.success('Analytics configuration saved! Please refresh the page to apply changes.');
  };

  const handleTestTracking = () => {
    if (window.gtag) {
      window.gtag('event', 'test_event', {
        event_category: 'admin',
        event_label: 'Analytics test from admin panel',
        value: 1,
      });
      toast.success('Test event sent to Google Analytics');
    } else {
      toast.error('Google Analytics not loaded');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Configuration
          </CardTitle>
          <CardDescription>
            Configure Google Analytics 4 and Search Console for your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ga-id">Google Analytics 4 Measurement ID</Label>
                  <Input
                    id="ga-id"
                    placeholder="G-XXXXXXXXXX"
                    value={config.googleAnalyticsId}
                    onChange={(e) => setConfig(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                  />
                  <p className="text-sm text-gray-600">
                    Find this in your GA4 property under Admin → Property → Data Streams
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gsc-verification">Search Console Verification Code</Label>
                  <Input
                    id="gsc-verification"
                    placeholder="your-verification-code"
                    value={config.searchConsoleVerification}
                    onChange={(e) => setConfig(prev => ({ ...prev, searchConsoleVerification: e.target.value }))}
                  />
                  <p className="text-sm text-gray-600">
                    Get this from Google Search Console → Settings → Ownership verification
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enableTracking}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableTracking: checked }))}
                  />
                  <Label>Enable Analytics Tracking</Label>
                </div>

                <Button onClick={handleSaveConfig} className="w-full">
                  Save Configuration
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Google Analytics 4
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={isConfigured.ga4 ? "default" : "secondary"}>
                        {isConfigured.ga4 ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Configured</>
                        ) : (
                          <><AlertCircle className="h-3 w-3 mr-1" /> Not Configured</>
                        )}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Search Console
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={isConfigured.gsc ? "default" : "secondary"}>
                        {isConfigured.gsc ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Configured</>
                        ) : (
                          <><AlertCircle className="h-3 w-3 mr-1" /> Not Configured</>
                        )}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Quick Links</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      GA4 Dashboard
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Search Console
                    </a>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Test your analytics implementation to ensure events are being tracked properly.
                </p>
                
                <Button onClick={handleTestTracking} variant="outline">
                  Send Test Event
                </Button>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Events Being Tracked:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Page views (automatic)</li>
                    <li>• Job applications</li>
                    <li>• Course enrollments</li>
                    <li>• Job searches</li>
                    <li>• Profile views</li>
                    <li>• Tool usage</li>
                    <li>• File downloads</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

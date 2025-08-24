import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const modules = [
  { name: 'talentxcel', label: 'Main Pages', priority: 'high' },
  { name: 'jobs', label: 'Job Listings', priority: 'high' },
  { name: 'network', label: 'Network Posts', priority: 'medium' },
  { name: 'companies', label: 'Companies', priority: 'medium' },
  { name: 'learning', label: 'Learning Paths', priority: 'medium' },
  { name: 'tools', label: 'Career Tools', priority: 'low' },
  { name: 'services', label: 'Services', priority: 'low' },
  { name: 'employer', label: 'Employer Pages', priority: 'medium' },
  { name: 'resume', label: 'Resume Templates', priority: 'low' },
  { name: 'colleges', label: 'Colleges', priority: 'low' },
  { name: 'career-map', label: 'Career Map', priority: 'low' },
  { name: 'career-passport', label: 'Career Passport', priority: 'low' }
];

export const SitemapManager: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const handleGenerateSitemaps = async () => {
    setIsGenerating(true);
    try {
      // Test sitemap index generation
      const { data, error } = await supabase.functions.invoke('sitemap-index');
      
      if (error) throw error;

      setLastGenerated(new Date().toISOString());
      toast.success('Sitemaps generated successfully!');
    } catch (error) {
      console.error('Error generating sitemaps:', error);
      toast.error('Failed to generate sitemaps');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePingSearchEngines = async () => {
    setIsPinging(true);
    try {
      const { data, error } = await supabase.functions.invoke('ping-google-sitemap');
      
      if (error) throw error;

      toast.success('Search engines notified successfully!');
    } catch (error) {
      console.error('Error pinging search engines:', error);
      toast.error('Failed to notify search engines');
    } finally {
      setIsPinging(false);
    }
  };

  const openSitemapIndex = () => {
    window.open('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/sitemap-index', '_blank');
  };

  const openModuleSitemap = (module: string) => {
    window.open(`https://dthlgsnakhoftinssokm.supabase.co/functions/v1/sitemap-module?module=${module}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Automated Sitemap System
          </CardTitle>
          <CardDescription>
            Manage dynamic sitemaps for all TalentXcel modules with real-time generation and search engine notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={handleGenerateSitemaps}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Generate All Sitemaps
            </Button>
            
            <Button 
              onClick={handlePingSearchEngines}
              disabled={isPinging}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isPinging ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Notify Search Engines
            </Button>

            <Button 
              onClick={openSitemapIndex}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Sitemap Index
            </Button>
          </div>

          {lastGenerated && (
            <div className="text-sm text-muted-foreground">
              Last generated: {new Date(lastGenerated).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Module Sitemaps</CardTitle>
          <CardDescription>
            Individual sitemaps for each TalentXcel module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <div key={module.name} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{module.label}</h4>
                  <Badge variant={
                    module.priority === 'high' ? 'destructive' : 
                    module.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {module.priority}
                  </Badge>
                </div>
                <Button 
                  onClick={() => openModuleSitemap(module.name)}
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Sitemap
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            SEO Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Automated Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Real-time sitemap generation from database</li>
                <li>• Automatic Google & Bing notifications</li>
                <li>• Module-specific changefreq & priority</li>
                <li>• Scalable to millions of URLs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">SEO Impact</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Faster indexing of new content</li>
                <li>• Improved crawl efficiency</li>
                <li>• Better search engine visibility</li>
                <li>• Dynamic priority optimization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
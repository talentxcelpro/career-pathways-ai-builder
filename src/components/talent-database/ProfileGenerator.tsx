import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Eye,
  Share2,
  Settings
} from 'lucide-react';

const ProfileGenerator = () => {
  // This would be populated from actual data
  const profileStats = {
    totalProfiles: 0,
    publicProfiles: 0,
    seoOptimized: 0,
    needsReview: 0
  };

  return (
    <div className="space-y-6">
      {/* Profile Generation Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{profileStats.totalProfiles}</div>
                <div className="text-sm text-muted-foreground">Total Profiles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{profileStats.publicProfiles}</div>
                <div className="text-sm text-muted-foreground">Public Profiles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{profileStats.seoOptimized}</div>
                <div className="text-sm text-muted-foreground">SEO Optimized</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{profileStats.needsReview}</div>
                <div className="text-sm text-muted-foreground">Needs Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Generation Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Generation Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              Generate Missing Profiles
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Globe className="h-6 w-6" />
              Optimize SEO
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Settings className="h-6 w-6" />
              Bulk Update Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Profile Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Preview Sample</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">No profiles generated yet.</p>
                <p className="text-sm">Upload CVs in the Bulk Upload section to generate profiles automatically.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">URL Structure</h4>
              <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                talentxcel.in/profile/[username]
              </div>
              
              <h4 className="font-medium">Meta Title Template</h4>
              <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                {`{name} - {title} | Hire on TalentXcel`}
              </div>
              
              <h4 className="font-medium">Meta Description Template</h4>
              <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                {`Connect with {name} on TalentXcel. {summary}...`}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">JSON-LD Schema</h4>
              <div className="p-3 bg-gray-50 rounded text-sm">
                <pre>{`{
  "@context": "http://schema.org",
  "@type": "Person",
  "name": "{candidate_name}",
  "jobTitle": "{job_title}",
  "url": "https://talentxcel.in/profile/{username}",
  "sameAs": ["{linkedin_url}"],
  "knowsAbout": ["{skills}"],
  "workLocation": "{location}"
}`}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Profile Generation Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. CV Processing</h3>
              <p className="text-sm text-muted-foreground">
                When CVs are uploaded, AI extracts structured data including personal info, experience, and skills.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Profile Creation</h3>
              <p className="text-sm text-muted-foreground">
                Automatic generation of public profile pages with SEO-optimized URLs and meta tags.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">3. SEO Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Profiles include structured data, optimized titles, and keyword-rich descriptions for search visibility.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ProfileGenerator };
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Wifi, 
  Download, 
  Globe,
  MapPin,
  Languages,
  IndianRupee,
  Zap,
  Users,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface RegionalContent {
  id: string;
  title: string;
  description: string;
  language: string;
  region: string;
  category: 'jobs' | 'skills' | 'interview' | 'resume';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  localRelevance: number;
}

export const IndianMobileOptimizations = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dataMode, setDataMode] = useState<'full' | 'lite' | 'offline'>('full');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [userLocation, setUserLocation] = useState<string>('');

  // Network detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Detect connection quality
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const updateDataMode = () => {
        if (!isOnline) {
          setDataMode('offline');
        } else if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          setDataMode('lite');
        } else {
          setDataMode('full');
        }
      };
      
      updateDataMode();
      connection.addEventListener('change', updateDataMode);
      
      return () => connection.removeEventListener('change', updateDataMode);
    }
  }, [isOnline]);

  const indianLanguages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' }
  ];

  const tier2Cities = [
    'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
    'Visakhapatnam', 'Patna', 'Vadodara', 'Ludhiana', 'Agra', 'Nashik',
    'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad'
  ];

  const regionalJobCategories = [
    { name: 'Government Jobs', count: '50K+', popular: true },
    { name: 'Banking & Finance', count: '25K+', popular: true },
    { name: 'Teaching', count: '30K+', popular: false },
    { name: 'Healthcare', count: '15K+', popular: true },
    { name: 'Manufacturing', count: '40K+', popular: false },
    { name: 'Retail & Sales', count: '35K+', popular: true },
    { name: 'Transportation', count: '20K+', popular: false },
    { name: 'Agriculture Tech', count: '8K+', popular: false }
  ];

  const MobileFirstFeatures = () => (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card className={`border-l-4 ${
        isOnline ? 'border-l-green-500' : 'border-l-red-500'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className={`h-4 w-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'} - {dataMode} mode
              </span>
            </div>
            {dataMode === 'lite' && (
              <Badge variant="outline" className="text-xs">
                Data Saver
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for Mobile */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="h-auto p-4 flex-col gap-2">
          <Link to="/mobile/jobs?location=nearby">
            <MapPin className="h-6 w-6" />
            <span className="text-sm">Nearby Jobs</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
          <Link to="/mobile/resume/quick-build">
            <Zap className="h-6 w-6" />
            <span className="text-sm">Quick Resume</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
          <Link to="/mobile/interview/hindi">
            <Languages className="h-6 w-6" />
            <span className="text-sm">Hindi Interview</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
          <Link to="/mobile/govt-jobs">
            <Star className="h-6 w-6" />
            <span className="text-sm">Govt Jobs</span>
          </Link>
        </Button>
      </div>
    </div>
  );

  const RegionalJobBoard = () => (
    <div className="space-y-4">
      {/* Language Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Choose Your Language
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {indianLanguages.slice(0, 6).map((lang) => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage(lang.code)}
                className="text-xs"
              >
                {lang.native}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Job Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Popular in Your Region</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {regionalJobCategories.filter(cat => cat.popular).map((category) => (
              <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">{category.name}</h4>
                  <p className="text-xs text-muted-foreground">{category.count} jobs available</p>
                </div>
                <Button size="sm" variant="ghost">
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tier 2/3 City Focus */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Jobs in Your City
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {tier2Cities.slice(0, 9).map((city) => (
              <Button
                key={city}
                variant="outline"
                size="sm"
                className="text-xs"
                asChild
              >
                <Link to={`/jobs?location=${city}`}>
                  {city}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const OfflineFeatures = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download for Offline Use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button className="w-full justify-start" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Resume Templates (2MB)
            </Button>
            <Button className="w-full justify-start" size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Save Interview Questions (500KB)
            </Button>
            <Button className="w-full justify-start" size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Cache Job Alerts (1MB)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Offline Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Resume Builder</span>
              <Badge variant="secondary" className="text-xs">Ready</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Interview Practice</span>
              <Badge variant="secondary" className="text-xs">Ready</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Job Application Forms</span>
              <Badge variant="outline" className="text-xs">Download</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Header with Data Mode Indicator */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-2">TalentXcel Mobile</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Smartphone className="h-4 w-4" />
          <span>Optimized for India</span>
          {dataMode === 'lite' && (
            <Badge variant="outline" className="text-xs">
              Lite Mode
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features" className="text-xs">Features</TabsTrigger>
          <TabsTrigger value="regional" className="text-xs">Regional</TabsTrigger>
          <TabsTrigger value="offline" className="text-xs">Offline</TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <MobileFirstFeatures />
        </TabsContent>

        <TabsContent value="regional">
          <RegionalJobBoard />
        </TabsContent>

        <TabsContent value="offline">
          <OfflineFeatures />
        </TabsContent>
      </Tabs>

      {/* Mobile-specific CTAs */}
      <div className="mt-6 space-y-3">
        <Button className="w-full" asChild>
          <Link to="/auth?mode=signup&flow=mobile">
            <Users className="h-4 w-4 mr-2" />
            Join 1 Lakh+ Indians
          </Link>
        </Button>
        
        <div className="text-center text-xs text-muted-foreground">
          🇮🇳 Made for Bharat • Available in 8 languages
        </div>
      </div>
    </div>
  );
};
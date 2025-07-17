
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2, 
  FileText, 
  Search, 
  Target, 
  Sparkles, 
  Brain,
  Upload,
  Download,
  Copy,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { AIResumeEnhancer } from './AIResumeEnhancer';
import { useAIResumeEnhancements } from '@/hooks/useAIResumeEnhancements';
import { toast } from 'sonner';

interface ChatGPTStyleInterfaceProps {
  resumeData: any;
  onEnhancementApplied: (enhancedData: any) => void;
}

export const ChatGPTStyleInterface: React.FC<ChatGPTStyleInterfaceProps> = ({
  resumeData,
  onEnhancementApplied
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('enhance');
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('');
  
  const {
    generateSmartTitles,
    isGeneratingTitles,
    adjustTone,
    isAdjustingTone,
    optimizeKeywords,
    isOptimizingKeywords
  } = useAIResumeEnhancements();

  const [titleSuggestions, setTitleSuggestions] = useState<any>(null);
  const [keywordResults, setKeywordResults] = useState<any>(null);
  const [toneResults, setToneResults] = useState<any>(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastActivity(new Date());
      toast.success('Connection restored!');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost. Please check your internet connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(new Date());
    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);
    
    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, []);

  const handleGenerateTitles = async () => {
    if (!isOnline) {
      toast.error('No internet connection. Please check your connection and try again.');
      return;
    }

    console.log('Generating titles with resume data:', resumeData);
    const results = await generateSmartTitles(resumeData, targetRole, industry, experience);
    if (results) {
      setTitleSuggestions(results);
      toast.success('Smart titles generated successfully!');
    }
  };

  const handleOptimizeKeywords = async () => {
    if (!isOnline) {
      toast.error('No internet connection. Please check your connection and try again.');
      return;
    }

    console.log('Optimizing keywords with resume data:', resumeData);
    const results = await optimizeKeywords(resumeData, jobDescription, targetRole, industry);
    if (results) {
      setKeywordResults(results);
      toast.success('Keywords optimized successfully!');
    }
  };

  const handleAdjustTone = async (content: string, tone: string) => {
    if (!isOnline) {
      toast.error('No internet connection. Please check your connection and try again.');
      return;
    }

    const results = await adjustTone(content, tone, 'summary');
    if (results) {
      setToneResults(results);
      toast.success('Tone adjusted successfully!');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const NetworkStatus = () => (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-red-600">Offline</span>
        </>
      )}
      <span className="text-gray-500">
        • Last activity: {lastActivity.toLocaleTimeString()}
      </span>
    </div>
  );

  const ResumeDataStatus = () => {
    const hasData = resumeData && typeof resumeData === 'object' && Object.keys(resumeData).length > 0;
    
    return (
      <div className="flex items-center gap-2 text-sm">
        {hasData ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-600">Resume data loaded</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-600">No resume data - using fallback mode</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Resume Assistant</h1>
          <p className="text-gray-600">Enhance your resume with AI-powered tools</p>
        </div>
        <div className="space-y-2">
          <NetworkStatus />
          <ResumeDataStatus />
        </div>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enhance" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Enhance
          </TabsTrigger>
          <TabsTrigger value="titles" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Titles
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="tone" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Tone
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Resume Tab */}
        <TabsContent value="enhance" className="space-y-4">
          <AIResumeEnhancer 
            resumeData={resumeData} 
            onEnhancementApplied={onEnhancementApplied}
          />
        </TabsContent>

        {/* Smart Titles Tab */}
        <TabsContent value="titles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Smart Title Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Role</label>
                  <Input
                    placeholder="e.g., Software Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Industry</label>
                  <Input
                    placeholder="e.g., Technology"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Experience Level</label>
                  <Input
                    placeholder="e.g., 3-5 years"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerateTitles} 
                disabled={isGeneratingTitles || !isOnline}
                className="w-full"
              >
                {isGeneratingTitles ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Titles...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Smart Titles
                  </>
                )}
              </Button>

              {titleSuggestions && (
                <div className="space-y-3">
                  <h3 className="font-medium">Generated Titles:</h3>
                  {titleSuggestions.titles?.map((title: any, index: number) => (
                    <div key={`title-${index}`} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{title.title}</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(title.title)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{title.reasoning}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">ATS Score: {title.atsScore}</Badge>
                        <div className="flex gap-1">
                          {title.keywords?.map((keyword: string, kidx: number) => (
                            <Badge key={`keyword-${index}-${kidx}`} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                ATS Keyword Optimizer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Job Description (Optional)</label>
                <textarea
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  placeholder="Paste job description here for better keyword matching..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleOptimizeKeywords} 
                disabled={isOptimizingKeywords || !isOnline}
                className="w-full"
              >
                {isOptimizingKeywords ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing Keywords...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Optimize Keywords
                  </>
                )}
              </Button>

              {keywordResults && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">ATS Compatibility Score</h3>
                    <div className="flex items-center gap-2">
                      <Progress value={keywordResults.atsScore} className="w-32" />
                      <span className="font-medium">{keywordResults.atsScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-2 text-green-600">Matched Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {keywordResults.keywordAnalysis?.matched?.map((keyword: string, index: number) => (
                          <Badge key={`matched-${index}`} variant="default" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-2 text-red-600">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {keywordResults.keywordAnalysis?.missing?.map((keyword: string, index: number) => (
                          <Badge key={`missing-${index}`} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Improvement Tips</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {keywordResults.improvementTips?.map((tip: string, index: number) => (
                        <li key={`tip-${index}`} className="text-sm text-gray-600">{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tone Tab */}
        <TabsContent value="tone" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Tone Adjustment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Content to Adjust</label>
                <textarea
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  placeholder="Paste content here to adjust tone..."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Professional', 'Confident', 'Friendly', 'Authoritative'].map((tone) => (
                  <Button
                    key={tone}
                    variant="outline"
                    onClick={() => handleAdjustTone('sample content', tone.toLowerCase())}
                    disabled={isAdjustingTone || !isOnline}
                  >
                    {tone}
                  </Button>
                ))}
              </div>

              {toneResults && (
                <div className="space-y-3">
                  <h3 className="font-medium">Adjusted Content:</h3>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <p className="text-sm">{toneResults.adjustedContent}</p>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="outline">
                        Impact Score: {toneResults.impactScore}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(toneResults.adjustedContent)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

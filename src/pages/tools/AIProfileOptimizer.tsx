import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Zap, 
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const AIProfileOptimizer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profileData, setProfileData] = useState({
    headline: '',
    summary: '',
    experience: '',
    skills: '',
    goals: ''
  });
  const [optimization, setOptimization] = useState<any>(null);

  const analyzeProfile = async () => {
    if (!profileData.headline.trim() || !profileData.summary.trim()) {
      toast.error('Please provide at least a headline and summary');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setOptimization({
        overallScore: 75,
        improvements: [
          {
            category: 'Headline',
            score: 80,
            suggestions: [
              'Add specific years of experience',
              'Include key technologies or skills',
              'Make it more results-oriented'
            ]
          },
          {
            category: 'Summary',
            score: 70,
            suggestions: [
              'Quantify achievements with numbers',
              'Add industry-specific keywords',
              'Highlight unique value proposition'
            ]
          },
          {
            category: 'Keywords',
            score: 65,
            suggestions: [
              'Include more relevant industry terms',
              'Add trending skill keywords',
              'Optimize for ATS scanning'
            ]
          }
        ],
        keywords: [
          { word: 'JavaScript', importance: 'high', present: true },
          { word: 'React', importance: 'high', present: true },
          { word: 'Node.js', importance: 'medium', present: false },
          { word: 'AWS', importance: 'medium', present: false },
          { word: 'Agile', importance: 'low', present: true }
        ]
      });
      setIsAnalyzing(false);
      toast.success('Profile analysis completed!');
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Zap className="h-8 w-8 text-purple-600" />
          Powered by TalentXcel AI Profile Optimizer
        </h1>
        <p className="text-gray-600 mt-2">
          Optimize your professional profile with Powered by TalentXcel AI suggestions and keyword analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Enter your current profile details for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="headline">Professional Headline *</Label>
                <Input
                  id="headline"
                  placeholder="e.g., Senior Software Engineer with 5+ years experience"
                  value={profileData.headline}
                  onChange={(e) => setProfileData(prev => ({ ...prev, headline: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="summary">Professional Summary *</Label>
                <Textarea
                  id="summary"
                  placeholder="Write a brief summary of your professional background..."
                  value={profileData.summary}
                  onChange={(e) => setProfileData(prev => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="experience">Key Experience</Label>
                <Textarea
                  id="experience"
                  placeholder="Highlight your most relevant work experience..."
                  value={profileData.experience}
                  onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  placeholder="JavaScript, React, Node.js, AWS..."
                  value={profileData.skills}
                  onChange={(e) => setProfileData(prev => ({ ...prev, skills: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="goals">Career Goals</Label>
                <Textarea
                  id="goals"
                  placeholder="What are your career aspirations?"
                  value={profileData.goals}
                  onChange={(e) => setProfileData(prev => ({ ...prev, goals: e.target.value }))}
                  rows={2}
                />
              </div>

              <Button 
                onClick={analyzeProfile}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Optimize Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        <div>
          {optimization && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Profile Analysis Results
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {optimization.overallScore}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="improvements" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="improvements">Improvements</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="improvements" className="space-y-4">
                    {optimization.improvements.map((item: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{item.category}</h4>
                          <div className="flex items-center gap-2">
                            <Progress value={item.score} className="w-20" />
                            <span className="text-sm text-gray-600">{item.score}%</span>
                          </div>
                        </div>
                        <ul className="space-y-1">
                          {item.suggestions.map((suggestion: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <TrendingUp className="h-3 w-3 mt-1 text-blue-500 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="keywords" className="space-y-4">
                    <div className="space-y-3">
                      {optimization.keywords.map((keyword: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {keyword.present ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="font-medium">{keyword.word}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={keyword.importance === 'high' ? 'default' : keyword.importance === 'medium' ? 'secondary' : 'outline'}
                            >
                              {keyword.importance}
                            </Badge>
                            {!keyword.present && (
                              <Badge variant="outline" className="text-orange-600">
                                Missing
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {!optimization && !isAnalyzing && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Optimize</h3>
                <p className="text-gray-600 text-center">
                  Fill in your profile information and click "Optimize Profile" to get AI-powered suggestions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIProfileOptimizer;
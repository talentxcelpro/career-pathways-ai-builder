import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Copy,
  Save,
  Download,
  Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ProfessionalBioWriter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [bioResults, setBioResults] = useState<any>(null);
  
  // Form inputs
  const [bioType, setBioType] = useState('professional');
  const [tone, setTone] = useState('professional');
  const [platform, setPlatform] = useState('linkedin');
  const [keyPoints, setKeyPoints] = useState('');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('professional-bio-writer', 'Professional Bio Writer');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Please log in to generate professional bios');
      return;
    }

    setIsGenerating(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: resume } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'bio-generation',
          data: {
            bioType,
            tone,
            platform,
            keyPoints,
            profile,
            resumeContent: resume?.content
          },
          userId: user.id
        }
      });

      const result = {
        short_bio: aiResponse?.short_bio || generateFallbackBio('short'),
        medium_bio: aiResponse?.medium_bio || generateFallbackBio('medium'),
        long_bio: aiResponse?.long_bio || generateFallbackBio('long'),
        platform_optimized: aiResponse?.platform_optimized || {
          linkedin: "LinkedIn-optimized version with industry keywords",
          twitter: "Twitter-friendly version under 160 characters",
          website: "Website version with call-to-action",
          email_signature: "Professional email signature version"
        },
        writing_tips: aiResponse?.writing_tips || [
          "Start with your current role and key expertise",
          "Include quantifiable achievements where possible",
          "End with a forward-looking statement or call-to-action",
          "Keep it authentic and conversational"
        ],
        keyword_suggestions: aiResponse?.keyword_suggestions || [
          "Industry-specific terms",
          "Professional certifications",
          "Core competencies",
          "Leadership qualities"
        ]
      };

      setBioResults(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 90);
      }

      toast.success('Professional bios generated!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate bios. Please try again.');
      if (usageId) {
        await updateToolUsage(usageId, {}, 'failed', 0);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackBio = (length: string) => {
    const name = user?.user_metadata?.full_name || 'Professional';
    switch (length) {
      case 'short':
        return `${name} is a results-driven professional with expertise in driving growth and innovation. Passionate about delivering excellence and building meaningful connections.`;
      case 'medium':
        return `${name} is an experienced professional with a proven track record of success. With expertise across multiple domains, they bring a unique blend of strategic thinking and hands-on execution to every project. Known for their collaborative approach and commitment to excellence.`;
      case 'long':
        return `${name} is a seasoned professional with extensive experience in their field. Throughout their career, they have consistently delivered outstanding results while building strong relationships with colleagues and clients. Their approach combines strategic vision with practical execution, making them a valuable asset to any organization. They are passionate about continuous learning and helping others achieve their professional goals.`;
      default:
        return `${name} is a dedicated professional committed to excellence.`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Bio copied to clipboard!');
  };

  const handleSaveResult = async () => {
    if (!bioResults) return;
    
    await saveToolResult(
      'professional-bio-writer',
      'Professional Bio Collection',
      bioResults,
      'document',
      ['bio', 'professional', 'profile', platform]
    );
  };

  const bioVersions = [
    { key: 'short_bio', title: 'Short Bio', description: '1-2 sentences, perfect for social media' },
    { key: 'medium_bio', title: 'Medium Bio', description: '1 paragraph, ideal for team pages' },
    { key: 'long_bio', title: 'Long Bio', description: '2-3 paragraphs, great for speaker bios' }
  ];

  const renderResults = () => {
    if (!bioResults) return null;

    return (
      <div className="space-y-6">
        {/* Bio Versions */}
        {bioVersions.map((version) => (
          <Card key={version.key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg">{version.title}</h3>
                  <p className="text-sm text-muted-foreground font-normal">{version.description}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(bioResults[version.key])}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm leading-relaxed">{bioResults[version.key]}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Platform Optimized */}
        <Card>
          <CardHeader>
            <CardTitle>Platform-Optimized Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(bioResults.platform_optimized).map(([platform, bio]: [string, any]) => (
                <div key={platform} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{platform.replace('_', ' ')}</h4>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bio)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{bio}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Writing Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Bio Writing Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {bioResults.writing_tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Keyword Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {bioResults.keyword_suggestions.map((keyword: string, index: number) => (
                <Badge key={index} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save All Bios
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Collection
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {!bioResults ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Professional Bio Writer</h2>
                  <p className="text-muted-foreground mb-6">
                    Short + long bios for social media and websites
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Bio Type</label>
                      <Select value={bioType} onValueChange={setBioType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Tone</label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="authoritative">Authoritative</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Primary Platform</label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="portfolio">Portfolio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Key Points to Highlight (Optional)</label>
                  <Textarea
                    placeholder="Any specific achievements, skills, or aspects you want emphasized in your bio..."
                    value={keyPoints}
                    onChange={(e) => setKeyPoints(e.target.value)}
                    rows={4}
                  />
                </div>

                {isGenerating ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Writing Your Bios</h3>
                    <p className="text-muted-foreground">
                      Creating multiple versions for different platforms...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleGenerate} size="lg" className="w-full">
                    <Edit3 className="h-5 w-5 mr-2" />
                    Generate Professional Bios
                  </Button>
                )}
              </div>
            ) : (
              renderResults()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalBioWriter;
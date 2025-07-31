import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIMetaGenerator } from '@/hooks/useAIMetaGenerator';
import { Loader2, Sparkles, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MetaTagPreviewProps {
  title: string;
  description: string;
  url?: string;
}

const MetaTagPreview: React.FC<MetaTagPreviewProps> = ({ title, description, url = 'https://talentxcel.in' }) => (
  <div className="border rounded-lg p-4 bg-background">
    <div className="text-blue-600 text-lg hover:underline cursor-pointer font-medium">
      {title}
    </div>
    <div className="text-green-700 text-sm">{url}</div>
    <div className="text-gray-600 text-sm mt-1">{description}</div>
  </div>
);

export const AIMetaTagGenerator: React.FC = () => {
  const { toast } = useToast();
  const {
    generateJobMetaTags,
    generateCompanyMetaTags,
    generateCourseMetaTags,
    generateProfileMetaTags,
    generateToolMetaTags,
    isGenerating,
    error
  } = useAIMetaGenerator();

  const [activeTab, setActiveTab] = useState('job');
  const [formData, setFormData] = useState({
    job: {
      title: 'Senior Frontend Developer',
      company_name: 'TechCorp',
      location: 'Mumbai, India',
      employment_type: 'Full-time',
      salary_min: 1500000,
      salary_max: 2500000,
      skills: ['React', 'TypeScript', 'Next.js']
    },
    company: {
      name: 'TechCorp Industries',
      industry: 'Technology',
      location: 'Bangalore, India',
      size: '500-1000 employees',
      description: 'Leading software development company specializing in AI and machine learning solutions.'
    },
    course: {
      title: 'Complete React Development Bootcamp',
      instructor: 'John Smith',
      duration: '12 weeks',
      level: 'Intermediate',
      price: 15999,
      skills: ['React', 'JavaScript', 'HTML/CSS']
    },
    profile: {
      full_name: 'Priya Sharma',
      headline: 'Senior Product Manager',
      location: 'Delhi, India',
      experience_years: 7,
      skills: ['Product Strategy', 'Agile', 'Data Analysis']
    },
    tool: {
      name: 'AI Resume Builder',
      description: 'Create professional resumes with AI assistance',
      category: 'Career Tools',
      features: ['ATS Optimization', 'AI Writing', 'Multiple Templates']
    }
  });

  const [generatedMeta, setGeneratedMeta] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const handleGenerate = async () => {
    const data = formData[activeTab as keyof typeof formData];
    
    let result = null;
    switch (activeTab) {
      case 'job':
        result = await generateJobMetaTags(data);
        break;
      case 'company':
        result = await generateCompanyMetaTags(data);
        break;
      case 'course':
        result = await generateCourseMetaTags(data);
        break;
      case 'profile':
        result = await generateProfileMetaTags(data);
        break;
      case 'tool':
        result = await generateToolMetaTags(data);
        break;
    }

    if (result) {
      setGeneratedMeta({
        title: result.title,
        description: result.description
      });
      toast({
        title: "Meta Tags Generated!",
        description: "AI-optimized SEO meta tags are ready to use.",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} Copied!`,
      description: `The ${type.toLowerCase()} has been copied to your clipboard.`,
    });
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Meta Tag Generator
          </CardTitle>
          <CardDescription>
            Generate SEO-optimized titles and descriptions for your content using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full mb-6">
              <TabsTrigger value="job">Jobs</TabsTrigger>
              <TabsTrigger value="company">Companies</TabsTrigger>
              <TabsTrigger value="course">Courses</TabsTrigger>
              <TabsTrigger value="profile">Profiles</TabsTrigger>
              <TabsTrigger value="tool">Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="job" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    value={formData.job.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={formData.job.company_name}
                    onChange={(e) => updateFormData('company_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.job.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="employment-type">Employment Type</Label>
                  <Input
                    id="employment-type"
                    value={formData.job.employment_type}
                    onChange={(e) => updateFormData('employment_type', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="salary-min">Min Salary (INR)</Label>
                  <Input
                    id="salary-min"
                    type="number"
                    value={formData.job.salary_min}
                    onChange={(e) => updateFormData('salary_min', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="salary-max">Max Salary (INR)</Label>
                  <Input
                    id="salary-max"
                    type="number"
                    value={formData.job.salary_max}
                    onChange={(e) => updateFormData('salary_max', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label>Skills (comma-separated)</Label>
                <Input
                  value={formData.job.skills.join(', ')}
                  onChange={(e) => updateFormData('skills', e.target.value.split(', '))}
                />
              </div>
            </TabsContent>

            <TabsContent value="company" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={formData.company.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.company.industry}
                    onChange={(e) => updateFormData('industry', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.company.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="size">Company Size</Label>
                  <Input
                    id="size"
                    value={formData.company.size}
                    onChange={(e) => updateFormData('size', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.company.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="course" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course-title">Course Title</Label>
                  <Input
                    id="course-title"
                    value={formData.course.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={formData.course.instructor}
                    onChange={(e) => updateFormData('instructor', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.course.duration}
                    onChange={(e) => updateFormData('duration', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Input
                    id="level"
                    value={formData.course.level}
                    onChange={(e) => updateFormData('level', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (INR)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.course.price}
                    onChange={(e) => updateFormData('price', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label>Skills Taught (comma-separated)</Label>
                <Input
                  value={formData.course.skills.join(', ')}
                  onChange={(e) => updateFormData('skills', e.target.value.split(', '))}
                />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={formData.profile.full_name}
                    onChange={(e) => updateFormData('full_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="headline">Professional Headline</Label>
                  <Input
                    id="headline"
                    value={formData.profile.headline}
                    onChange={(e) => updateFormData('headline', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.profile.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.profile.experience_years}
                    onChange={(e) => updateFormData('experience_years', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label>Key Skills (comma-separated)</Label>
                <Input
                  value={formData.profile.skills.join(', ')}
                  onChange={(e) => updateFormData('skills', e.target.value.split(', '))}
                />
              </div>
            </TabsContent>

            <TabsContent value="tool" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tool-name">Tool Name</Label>
                  <Input
                    id="tool-name"
                    value={formData.tool.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.tool.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tool-description">Description</Label>
                <Textarea
                  id="tool-description"
                  value={formData.tool.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
              </div>
              <div>
                <Label>Key Features (comma-separated)</Label>
                <Input
                  value={formData.tool.features.join(', ')}
                  onChange={(e) => updateFormData('features', e.target.value.split(', '))}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 mt-6">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Meta Tags'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error:</span>
              </div>
              <p className="text-sm text-destructive mt-1">{error}</p>
            </div>
          )}

          {generatedMeta && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Generated Meta Tags
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">Meta Title</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedMeta.title, 'Title')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                    {generatedMeta.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Length: {generatedMeta.title.length} characters
                    <Badge variant={generatedMeta.title.length <= 60 ? "default" : "destructive"} className="ml-2">
                      {generatedMeta.title.length <= 60 ? "Good" : "Too Long"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">Meta Description</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedMeta.description, 'Description')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                    {generatedMeta.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Length: {generatedMeta.description.length} characters
                    <Badge variant={generatedMeta.description.length <= 160 ? "default" : "destructive"} className="ml-2">
                      {generatedMeta.description.length <= 160 ? "Good" : "Too Long"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Google Search Preview</Label>
                  <div className="mt-2">
                    <MetaTagPreview 
                      title={generatedMeta.title}
                      description={generatedMeta.description}
                      url={`https://talentxcel.in/${activeTab}s/example`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
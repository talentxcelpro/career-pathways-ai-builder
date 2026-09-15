import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Grid3X3, Star, TrendingUp, Download, Eye, 
  Award, Filter, Search, BookmarkPlus 
} from 'lucide-react';

interface ResumeExample {
  id: string;
  title: string;
  industry: string;
  role: string;
  experienceLevel: string;
  rating: number;
  views: number;
  description: string;
  tags: string[];
  beforeAfter?: boolean;
  template: string;
  salary: string;
  improvements?: string[];
}

interface ResumeExamplesGalleryProps {
  onExampleSelect: (example: ResumeExample) => void;
  onTemplateApply: (templateId: string) => void;
}

export const ResumeExamplesGallery: React.FC<ResumeExamplesGalleryProps> = ({
  onExampleSelect,
  onTemplateApply
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('top-rated');

  // Mock data - in real app, this would come from your examples database
  const resumeExamples: ResumeExample[] = [
    {
      id: '1',
      title: 'Senior Software Engineer - FAANG Success',
      industry: 'Technology',
      role: 'Software Engineer',
      experienceLevel: 'Senior',
      rating: 4.9,
      views: 15420,
      description: 'Landed senior role at Meta with 40% salary increase. Strong technical skills presentation.',
      tags: ['Python', 'System Design', 'Leadership', 'Open Source'],
      template: 'modern-tech',
      salary: '$180,000 - $220,000',
      improvements: [
        'Added quantified achievements',
        'Highlighted open source contributions',
        'Emphasized system design experience'
      ]
    },
    {
      id: '2',
      title: 'Marketing Manager - Startup to Enterprise',
      industry: 'Marketing',
      role: 'Marketing Manager',
      experienceLevel: 'Mid-Level',
      rating: 4.8,
      views: 12850,
      description: 'Transitioned from startup to Fortune 500 company. Focus on growth metrics and ROI.',
      tags: ['Growth Marketing', 'Analytics', 'Campaign Management', 'ROI'],
      template: 'modern-minimal',
      salary: '$85,000 - $110,000',
      beforeAfter: true,
      improvements: [
        'Added ROI metrics for campaigns',
        'Highlighted team growth achievements',
        'Improved keyword optimization'
      ]
    },
    {
      id: '3',
      title: 'Product Manager - Tech Industry Entry',
      industry: 'Technology',
      role: 'Product Manager',
      experienceLevel: 'Entry',
      rating: 4.7,
      views: 9630,
      description: 'Career pivot from consulting to product management. Excellent for career changers.',
      tags: ['Product Strategy', 'User Research', 'Agile', 'Analytics'],
      template: 'creative-modern',
      salary: '$95,000 - $125,000',
      improvements: [
        'Translated consulting skills to product context',
        'Added technical project examples',
        'Emphasized user-centric approach'
      ]
    },
    {
      id: '4',
      title: 'Data Scientist - Research to Industry',
      industry: 'Technology',
      role: 'Data Scientist',
      experienceLevel: 'Mid-Level',
      rating: 4.8,
      views: 11200,
      description: 'Successful transition from academic research to industry data science role.',
      tags: ['Machine Learning', 'Python', 'Research', 'Statistics'],
      template: 'professional-clean',
      salary: '$110,000 - $140,000',
      beforeAfter: true,
      improvements: [
        'Translated research impact to business value',
        'Added practical ML project examples',
        'Highlighted collaboration skills'
      ]
    }
  ];

  const industries = ['all', 'Technology', 'Marketing', 'Finance', 'Healthcare', 'Consulting'];
  const levels = ['all', 'Entry', 'Mid-Level', 'Senior', 'Executive'];

  const filteredExamples = resumeExamples.filter(example => {
    const matchesIndustry = selectedIndustry === 'all' || example.industry === selectedIndustry;
    const matchesLevel = selectedLevel === 'all' || example.experienceLevel === selectedLevel;
    
    return matchesIndustry && matchesLevel;
  });

  const sortedExamples = [...filteredExamples].sort((a, b) => {
    switch (selectedCategory) {
      case 'top-rated':
        return b.rating - a.rating;
      case 'most-viewed':
        return b.views - a.views;
      case 'recent':
        return 0; // Would use date in real implementation
      default:
        return 0;
    }
  });

  const handleViewExample = (example: ResumeExample) => {
    onExampleSelect(example);
  };

  const handleApplyTemplate = (example: ResumeExample) => {
    onTemplateApply(example.template);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Resume Examples Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gallery" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="before-after">Before & After</TabsTrigger>
              <TabsTrigger value="by-industry">By Industry</TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry.charAt(0).toUpperCase() + industry.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-rated">Top Rated</SelectItem>
                    <SelectItem value="most-viewed">Most Viewed</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Examples Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedExamples.map((example) => (
                  <Card key={example.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{example.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex">{renderStars(example.rating)}</div>
                            <span className="text-sm text-muted-foreground">
                              {example.rating} • {example.views.toLocaleString()} views
                            </span>
                          </div>
                        </div>
                        {example.beforeAfter && (
                          <Badge variant="secondary">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Before/After
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{example.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Industry:</span>
                          <span className="font-medium">{example.industry}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Level:</span>
                          <span className="font-medium">{example.experienceLevel}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Salary Range:</span>
                          <span className="font-medium text-green-600">{example.salary}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {example.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {example.improvements && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Key Improvements:</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {example.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Award className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleViewExample(example)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Example
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApplyTemplate(example)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="before-after" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Before & After Transformations</h3>
                <p className="text-muted-foreground mb-4">
                  See how our AI-powered improvements transformed these resumes
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedExamples
                    .filter(example => example.beforeAfter)
                    .map((example) => (
                    <Card key={`ba-${example.id}`} className="border-2 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          {example.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="text-2xl font-bold text-red-600">Before</div>
                              <div className="text-sm text-red-600">Low ATS Score</div>
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">After</div>
                              <div className="text-sm text-green-600">High Performance</div>
                            </div>
                          </div>
                          
                          <Button onClick={() => handleViewExample(example)} className="w-full">
                            View Transformation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="by-industry" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {industries.filter(ind => ind !== 'all').map((industry) => {
                  const industryExamples = resumeExamples.filter(ex => ex.industry === industry);
                  return (
                    <Card key={industry} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{industry}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-primary">
                            {industryExamples.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Resume examples available
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedIndustry(industry)}
                            className="w-full"
                          >
                            View Examples
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
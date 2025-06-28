
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Code, Palette, GraduationCap, Zap, Building, Search, Eye, Download } from 'lucide-react';

interface ResumeTemplate {
  id: string;
  name: string;
  category: 'executive' | 'technical' | 'creative' | 'academic' | 'minimalist' | 'industry';
  description: string;
  features: string[];
  atsScore: number;
  preview: string;
  colors: string[];
  multiPage: boolean;
  industry?: string;
}

interface TemplateLibraryProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onPreview: (templateId: string) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onPreview
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const templates: ResumeTemplate[] = [
    // Executive Templates
    {
      id: 'executive-classic',
      name: 'Executive Classic',
      category: 'executive',
      description: 'Traditional C-suite layout with emphasis on leadership achievements',
      features: ['Leadership Focus', 'Board Experience', 'P&L Highlights'],
      atsScore: 92,
      preview: '/templates/executive-classic.png',
      colors: ['#1F2937', '#3B82F6', '#6B7280'],
      multiPage: true
    },
    {
      id: 'executive-modern',
      name: 'Executive Modern',
      category: 'executive',
      description: 'Contemporary design for senior management roles',
      features: ['Strategic Vision', 'Digital Leadership', 'Innovation Focus'],
      atsScore: 88,
      preview: '/templates/executive-modern.png',
      colors: ['#0F172A', '#7C3AED', '#64748B'],
      multiPage: true
    },
    // Technical Templates
    {
      id: 'developer-stack',
      name: 'Developer Stack',
      category: 'technical',
      description: 'Optimized for software engineers and developers',
      features: ['Tech Stack Showcase', 'GitHub Integration', 'Project Highlights'],
      atsScore: 95,
      preview: '/templates/developer-stack.png',
      colors: ['#0D1117', '#58A6FF', '#F0F6FF'],
      multiPage: false
    },
    {
      id: 'data-scientist',
      name: 'Data Scientist Pro',
      category: 'technical',
      description: 'Perfect for data science and analytics roles',
      features: ['Model Performance', 'Research Papers', 'Tool Proficiency'],
      atsScore: 93,
      preview: '/templates/data-scientist.png',
      colors: ['#1E3A8A', '#F59E0B', '#EF4444'],
      multiPage: true
    },
    // Creative Templates
    {
      id: 'creative-portfolio',
      name: 'Creative Portfolio',
      category: 'creative',
      description: 'Visual-first design for creative professionals',
      features: ['Portfolio Showcase', 'Brand Identity', 'Award Highlights'],
      atsScore: 78,
      preview: '/templates/creative-portfolio.png',
      colors: ['#EC4899', '#8B5CF6', '#06B6D4'],
      multiPage: true
    },
    {
      id: 'marketing-growth',
      name: 'Marketing Growth',
      category: 'creative',
      description: 'Results-driven layout for marketing professionals',
      features: ['Campaign Results', 'Growth Metrics', 'Brand Building'],
      atsScore: 85,
      preview: '/templates/marketing-growth.png',
      colors: ['#F97316', '#84CC16', '#EF4444'],
      multiPage: false
    },
    // Academic Templates
    {
      id: 'academic-research',
      name: 'Academic Research',
      category: 'academic',
      description: 'Comprehensive format for researchers and educators',
      features: ['Publication List', 'Research Focus', 'Teaching Experience'],
      atsScore: 90,
      preview: '/templates/academic-research.png',
      colors: ['#374151', '#059669', '#DC2626'],
      multiPage: true
    },
    // Minimalist Templates
    {
      id: 'minimal-clean',
      name: 'Minimal Clean',
      category: 'minimalist',
      description: 'ATS-optimized clean design',
      features: ['ATS Friendly', 'Scannable Layout', 'Professional Typography'],
      atsScore: 98,
      preview: '/templates/minimal-clean.png',
      colors: ['#111827', '#6B7280', '#9CA3AF'],
      multiPage: false
    },
    {
      id: 'minimal-modern',
      name: 'Minimal Modern',
      category: 'minimalist',
      description: 'Contemporary minimalist approach',
      features: ['White Space', 'Clear Hierarchy', 'Professional'],
      atsScore: 96,
      preview: '/templates/minimal-modern.png',
      colors: ['#1F2937', '#3B82F6', '#E5E7EB'],
      multiPage: false
    },
    // Industry-Specific Templates
    {
      id: 'healthcare-professional',
      name: 'Healthcare Professional',
      category: 'industry',
      industry: 'Healthcare',
      description: 'Tailored for medical and healthcare professionals',
      features: ['Certifications', 'Clinical Experience', 'Patient Care'],
      atsScore: 94,
      preview: '/templates/healthcare.png',
      colors: ['#065F46', '#10B981', '#ECFDF5'],
      multiPage: true
    },
    {
      id: 'finance-consulting',
      name: 'Finance & Consulting',
      category: 'industry',
      industry: 'Finance',
      description: 'Professional format for finance and consulting roles',
      features: ['Deal Experience', 'Client Impact', 'Financial Modeling'],
      atsScore: 91,
      preview: '/templates/finance.png',
      colors: ['#1E40AF', '#3B82F6', '#DBEAFE'],
      multiPage: false
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'executive': return <Crown className="h-4 w-4" />;
      case 'technical': return <Code className="h-4 w-4" />;
      case 'creative': return <Palette className="h-4 w-4" />;
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      case 'minimalist': return <Zap className="h-4 w-4" />;
      case 'industry': return <Building className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getAtsScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 85) return 'text-blue-600 bg-blue-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="executive" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Executive
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            Tech
          </TabsTrigger>
          <TabsTrigger value="creative" className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            Creative
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="minimalist" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Minimal
          </TabsTrigger>
          <TabsTrigger value="industry" className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            Industry
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge className={`text-xs ${getAtsScoreColor(template.atsScore)}`}>
                      ATS {template.atsScore}%
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Template Preview */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500 text-sm">Template Preview</div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Colors:</h4>
                    <div className="flex gap-1">
                      {template.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{template.multiPage ? 'Multi-page' : 'Single page'}</span>
                    {template.industry && (
                      <Badge variant="secondary" className="text-xs">
                        {template.industry}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => onTemplateSelect(template.id)}
                      className={selectedTemplate === template.id ? 'bg-blue-600' : ''}
                    >
                      {selectedTemplate === template.id ? 'Selected' : 'Select'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPreview(template.id)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No templates found matching your criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('all');
            }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

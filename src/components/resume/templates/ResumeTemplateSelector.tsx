import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Check, Zap, Eye, Palette, Layout, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string[];
  experience_level: string;
  preview_image_url?: string;
  template_config: any;
  design_tokens: any;
  layout_config: any;
  features: any;
  is_premium: boolean;
  usage_count: number;
  rating: number;
}

interface ResumeTemplateSelectorProps {
  onTemplateSelect: (template: ResumeTemplate) => void;
  selectedTemplateId?: string;
  userIndustry?: string;
  userExperienceLevel?: string;
}

export const ResumeTemplateSelector: React.FC<ResumeTemplateSelectorProps> = ({
  onTemplateSelect,
  selectedTemplateId,
  userIndustry,
  userExperienceLevel
}) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resume_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (template: ResumeTemplate) => {
    try {
      // Track template usage
      await supabase.rpc('track_template_usage', {
        template_uuid: template.id,
        user_uuid: user?.id || null,
        action_type: 'template_selected',
        metadata: {
          category: template.category,
          industry: template.industry,
          experience_level: template.experience_level
        }
      });

      onTemplateSelect(template);
      toast.success(`Selected ${template.name} template`);
    } catch (error) {
      console.error('Error selecting template:', error);
      toast.error('Failed to select template');
    }
  };

  const getFilteredTemplates = () => {
    let filtered = templates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Smart recommendations based on user profile
    if (userIndustry || userExperienceLevel) {
      filtered = filtered.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Industry match
        if (userIndustry && a.industry.includes(userIndustry)) scoreA += 10;
        if (userIndustry && b.industry.includes(userIndustry)) scoreB += 10;

        // Experience level match
        if (userExperienceLevel && a.experience_level === userExperienceLevel) scoreA += 5;
        if (userExperienceLevel && b.experience_level === userExperienceLevel) scoreB += 5;

        return scoreB - scoreA;
      });
    }

    return filtered;
  };

  const categories = [
    { id: 'all', name: 'All Templates', icon: Layout },
    { id: 'professional', name: 'Professional', icon: Star },
    { id: 'creative', name: 'Creative', icon: Palette },
    { id: 'industry', name: 'Industry Specific', icon: Filter },
    { id: 'experience', name: 'Experience Level', icon: Zap }
  ];

  const getTemplatePreview = (template: ResumeTemplate) => {
    const { design_tokens } = template;
    const primaryColor = design_tokens?.primaryColor || '#3498DB';
    const backgroundColor = design_tokens?.backgroundColor || '#FFFFFF';
    const textColor = design_tokens?.textColor || '#2C3E50';

    return (
      <div className="w-full h-48 bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary/50 transition-colors">
        <div 
          className="w-full h-full p-4 text-xs"
          style={{ backgroundColor, color: textColor }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="h-3 bg-gray-300 rounded mb-1 w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
            {template.features?.photoSupport && (
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            )}
          </div>

          {/* Content sections */}
          <div className="space-y-2">
            <div>
              <div 
                className="h-2 rounded mb-1 w-1/3" 
                style={{ backgroundColor: primaryColor }}
              ></div>
              <div className="space-y-1">
                <div className="h-1 bg-gray-300 rounded w-full"></div>
                <div className="h-1 bg-gray-300 rounded w-4/5"></div>
              </div>
            </div>

            <div>
              <div 
                className="h-2 rounded mb-1 w-1/4" 
                style={{ backgroundColor: primaryColor }}
              ></div>
              <div className="space-y-1">
                <div className="h-1 bg-gray-300 rounded w-full"></div>
                <div className="h-1 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>

            <div>
              <div 
                className="h-2 rounded mb-1 w-1/5" 
                style={{ backgroundColor: primaryColor }}
              ></div>
              <div className="grid grid-cols-3 gap-1">
                <div className="h-1 bg-gray-300 rounded"></div>
                <div className="h-1 bg-gray-300 rounded"></div>
                <div className="h-1 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getRecommendationBadge = (template: ResumeTemplate) => {
    if (userIndustry && template.industry.includes(userIndustry)) {
      return <Badge variant="secondary" className="text-xs">Recommended</Badge>;
    }
    if (userExperienceLevel && template.experience_level === userExperienceLevel) {
      return <Badge variant="outline" className="text-xs">Good Match</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Resume Template</h2>
        <p className="text-muted-foreground">
          Select a professional template that matches your industry and experience level
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
              <category.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredTemplates().map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {template.name}
                        {selectedTemplateId === template.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                    {template.is_premium && (
                      <Badge variant="secondary" className="text-xs">Premium</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {getRecommendationBadge(template)}
                    <Badge variant="outline" className="text-xs capitalize">
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.experience_level}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {getTemplatePreview(template)}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{template.usage_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-muted-foreground">{template.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {template.features?.atsOptimized && (
                        <Badge variant="outline" className="text-xs">ATS-Friendly</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Industries:</span>
                    <div className="flex flex-wrap gap-1">
                      {template.industry.slice(0, 3).map((industry, idx) => (
                        <span key={idx} className="capitalize">{industry}</span>
                      ))}
                      {template.industry.length > 3 && (
                        <span>+{template.industry.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <Button 
                    variant={selectedTemplateId === template.id ? "default" : "outline"}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template);
                    }}
                  >
                    {selectedTemplateId === template.id ? 'Selected' : 'Select Template'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {getFilteredTemplates().length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No templates found for the selected category.</p>
        </div>
      )}
    </div>
  );
};
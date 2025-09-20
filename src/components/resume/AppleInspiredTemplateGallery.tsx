import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, Crown, CheckCircle, Eye, Palette, 
  Briefcase, GraduationCap, Code, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { templateList } from './templates/index';

interface AppleInspiredTemplateGalleryProps {
  onTemplateSelect: (templateId: string) => void;
  selectedTemplate?: string;
  resumeData?: any;
  className?: string;
}

export const AppleInspiredTemplateGallery: React.FC<AppleInspiredTemplateGalleryProps> = ({
  onTemplateSelect,
  selectedTemplate,
  resumeData,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Templates', icon: Palette },
    { id: 'Traditional', label: 'Traditional', icon: Briefcase },
    { id: 'Contemporary', label: 'Modern', icon: Code },
    { id: 'Education', label: 'Academic', icon: GraduationCap },
    { id: 'Design', label: 'Creative', icon: Palette }
  ];

  // Enhanced template data with additional metadata
  const enhancedTemplates = templateList.map(template => ({
    ...template,
    preview: '/api/placeholder/300/400', // Placeholder for template preview
    isPremium: ['executive', 'creative', 'startup'].includes(template.id),
    atsScore: Math.floor(Math.random() * 15) + 85, // 85-100 ATS score
    features: getTemplateFeatures(template.id),
    industryMatch: getIndustryMatch(template.id, resumeData)
  }));

  function getTemplateFeatures(templateId: string): string[] {
    const featureMap: Record<string, string[]> = {
      classic: ['Clean Layout', 'ATS Optimized', 'Traditional Format'],
      modern: ['Modern Design', 'Color Accents', 'Professional'],
      creative: ['Unique Layout', 'Visual Elements', 'Standout Design'],
      technical: ['Skills Focus', 'Tech-Friendly', 'Clean Code'],
      executive: ['Leadership Focus', 'Premium Design', 'Executive Level'],
      academic: ['Publication Ready', 'Research Focus', 'Academic Format'],
      minimalist: ['Clean & Simple', 'Minimalist', 'Space Efficient'],
      sales: ['Results Focused', 'Sales Metrics', 'Achievement Highlight'],
      healthcare: ['Healthcare Optimized', 'Certification Focus', 'Professional'],
      startup: ['Innovation Focus', 'Tech Startup', 'Dynamic Layout']
    };
    return featureMap[templateId] || ['Professional', 'ATS Optimized', 'Clean Design'];
  }

  function getIndustryMatch(templateId: string, data: any): number {
    if (!data) return 85;
    // Simple algorithm to match template to industry based on skills/experience
    const skills = data.skills || [];
    const techSkills = skills.filter((skill: string) => 
      ['javascript', 'python', 'react', 'node', 'sql', 'aws'].some(tech => 
        skill.toLowerCase().includes(tech)
      )
    ).length;
    
    if (templateId === 'technical' && techSkills > 3) return 98;
    if (templateId === 'modern' && techSkills > 0) return 92;
    if (templateId === 'startup' && techSkills > 2) return 95;
    return Math.floor(Math.random() * 10) + 85;
  }

  const filteredTemplates = enhancedTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={cn("w-full", className)}>
      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "rounded-full px-4 py-2 transition-all duration-300",
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
              )}
            >
              <category.icon className="h-4 w-4 mr-2" />
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <Card
            key={template.id}
            className={cn(
              "group cursor-pointer transition-all duration-300 border-0 shadow-lg hover:shadow-2xl",
              "bg-white/80 backdrop-blur-sm hover:scale-105 overflow-hidden",
              selectedTemplate === template.id && "ring-2 ring-blue-500 shadow-blue-500/25 scale-105"
            )}
            onClick={() => onTemplateSelect(template.id)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Template Preview */}
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              {/* Placeholder for template preview */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2 p-4">
                  <div className="w-full h-2 bg-gray-300 rounded mb-2"></div>
                  <div className="w-3/4 h-2 bg-gray-300 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="h-12 bg-gray-300 rounded"></div>
                    <div className="space-y-1">
                      <div className="h-1 bg-gray-300 rounded"></div>
                      <div className="h-1 bg-gray-300 rounded"></div>
                      <div className="h-1 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1 bg-gray-300 rounded"></div>
                    <div className="h-1 bg-gray-300 rounded w-4/5"></div>
                    <div className="h-1 bg-gray-300 rounded w-3/5"></div>
                  </div>
                </div>
              </div>

              {/* Overlay */}
              <div className={cn(
                "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300",
                "flex items-center justify-center opacity-0 group-hover:opacity-100"
              )}>
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                  <Eye className="h-6 w-6 text-gray-700" />
                </div>
              </div>

              {/* Premium Badge */}
              {template.isPremium && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}

              {/* Selected Badge */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 left-3">
                  <div className="bg-blue-600 text-white rounded-full p-1 shadow-lg">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Template Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{template.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {template.atsScore}% ATS
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.category} Style</p>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {template.features.slice(0, 2).map((feature, featureIndex) => (
                  <Badge
                    key={featureIndex}
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-700"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>

              {/* Industry Match */}
              {resumeData && (
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      template.industryMatch > 90 ? "bg-green-500" : "bg-blue-500"
                    )}></div>
                    <span className="text-gray-600">
                      {template.industryMatch}% Match
                    </span>
                  </div>
                </div>
              )}

              {/* Select Button */}
              <Button
                size="sm"
                className={cn(
                  "w-full transition-all duration-300",
                  selectedTemplate === template.id
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                )}
              >
                {selectedTemplate === template.id ? 'Selected' : 'Use Template'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Template Count */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Showing {filteredTemplates.length} of {enhancedTemplates.length} templates
      </div>
    </div>
  );
};
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Crown, Star, Sparkles } from "lucide-react";
import { TemplateRecommendationWidget } from './TemplateRecommendationWidget';
import { enhancedTemplateLibrary } from '@/data/enhancedTemplateLibrary';

interface TemplateSelectorProps {
  templates?: any[];
  currentTemplateId?: string;
  onTemplateSelect: (templateId: string) => void;
}

export const TemplateSelector = ({ templates = enhancedTemplateLibrary, currentTemplateId, onTemplateSelect }: TemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'classic-ats', name: 'Classic & ATS' },
    { id: 'modern-stylish', name: 'Modern & Stylish' },
    { id: 'industry-specific', name: 'Industry Specific' },
    { id: 'executive-leadership', name: 'Executive' },
    { id: 'creative-portfolio', name: 'Creative' },
    { id: 'experience-based', name: 'Experience Based' }
  ];

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const getAtsScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 85) return 'text-blue-600 bg-blue-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handlePreview = (template: any) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const generatePreviewContent = (template: any) => {
    const primaryColor = template.css_config?.primaryColor || '#2563eb';
    const fontFamily = template.css_config?.fontFamily || 'Inter, sans-serif';

    return (
      <div className="bg-white p-8 rounded-lg shadow-lg" style={{ fontFamily }}>
        <div className="text-center border-b-4 pb-4 mb-6" style={{ borderColor: primaryColor }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
            John Doe
          </h1>
          <div className="text-sm text-gray-600 space-x-2">
            <span>john.doe@email.com</span>
            <span>•</span>
            <span>(555) 123-4567</span>
            <span>•</span>
            <span>San Francisco, CA</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 border-b-2 pb-1" style={{ color: primaryColor }}>
            Professional Summary
          </h2>
          <p className="text-gray-700 text-sm">
            Experienced software engineer with 5+ years of expertise in full-stack development, 
            cloud architecture, and team leadership. Proven track record of delivering scalable 
            solutions and driving technical innovation.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 border-b-2 pb-1" style={{ color: primaryColor }}>
            Experience
          </h2>
          <div className="mb-3">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-medium">Senior Software Engineer</h3>
              <span className="text-xs text-gray-600">2021 - Present</span>
            </div>
            <div className="text-sm font-medium mb-1" style={{ color: primaryColor }}>
              Tech Solutions Inc. • San Francisco, CA
            </div>
            <p className="text-xs text-gray-700">
              Led development of microservices architecture serving 10M+ users, 
              mentored 5 junior developers, and improved deployment efficiency by 40%.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 border-b-2 pb-1" style={{ color: primaryColor }}>
            Skills
          </h2>
          <div className="flex flex-wrap gap-1">
            {['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'].map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs rounded-full"
                style={{ 
                  backgroundColor: `${primaryColor}15`, 
                  color: primaryColor 
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 border-b-2 pb-1" style={{ color: primaryColor }}>
            Education
          </h2>
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-medium">Bachelor of Computer Science</h3>
              <span className="text-xs text-gray-600">2016 - 2020</span>
            </div>
            <div className="text-sm" style={{ color: primaryColor }}>
              University of Technology • Boston, MA
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Smart Recommendations Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Choose Your Template</h2>
        <Button
          variant="outline"
          onClick={() => setShowRecommendations(!showRecommendations)}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {showRecommendations ? 'Browse All' : 'Get Recommendations'}
        </Button>
      </div>

      {/* Smart Recommendations */}
      {showRecommendations ? (
        <TemplateRecommendationWidget 
          onTemplateSelect={onTemplateSelect}
          currentTemplateId={currentTemplateId}
        />
      ) : (
        <>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  currentTemplateId === template.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Template Preview */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border overflow-hidden">
                    <div className="p-2 text-xs" style={{ 
                      fontFamily: template.colorSchemes?.[0]?.primary || 'Inter',
                      color: template.colorSchemes?.[0]?.primary || '#2563eb'
                    }}>
                      <div className="font-bold mb-1">Sample Resume</div>
                      <div className="space-y-1 text-gray-600">
                        <div className="h-1 bg-current opacity-20 rounded"></div>
                        <div className="h-1 bg-current opacity-15 rounded w-3/4"></div>
                        <div className="h-1 bg-current opacity-15 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      <Badge className={`text-xs ${getAtsScoreColor(template.atsScore || 85)}`}>
                        <Star className="h-3 w-3 mr-1" />
                        {template.atsScore || 85}% ATS
                      </Badge>
                    </div>

                    {/* Tags */}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(template)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onTemplateSelect(template.id)}
                      className="flex-1"
                      disabled={currentTemplateId === template.id}
                    >
                      {currentTemplateId === template.id ? 'Selected' : 'Use Template'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {previewTemplate?.name} - Template Preview
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewTemplate && generatePreviewContent(previewTemplate)}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={() => {
              onTemplateSelect(previewTemplate.id);
              setShowPreview(false);
            }}>
              Use This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
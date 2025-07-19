
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star } from 'lucide-react';
import type { ResumeTemplate } from '@/types/resume';

interface TemplateSelectorProps {
  templates: ResumeTemplate[];
  selectedTemplate?: string;
  onTemplateSelect: (templateId: string) => void;
  recommendedTemplate?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  recommendedTemplate,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Template</h2>
        <p className="text-muted-foreground">
          Select a professional template that matches your industry and style
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const isRecommended = recommendedTemplate === template.id;

          return (
            <Card 
              key={template.id}
              className={`
                cursor-pointer transition-all hover:shadow-lg
                ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}
              `}
              onClick={() => onTemplateSelect(template.id)}
            >
              <CardContent className="p-0">
                {/* Template Preview */}
                <div className="relative">
                  <div className="aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-6 w-6 text-primary bg-white rounded-full" />
                    </div>
                  )}

                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500 text-yellow-900">
                        <Star className="h-3 w-3 mr-1" />
                        AI Recommended
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    {template.atsOptimized && (
                      <Badge variant="secondary" className="text-xs">
                        ATS
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>

                  <Button 
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                  >
                    {isSelected ? 'Selected' : 'Select Template'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recommendedTemplate && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-900">AI Recommendation</h4>
          </div>
          <p className="text-sm text-yellow-800">
            Based on your background and industry, we recommend the{' '}
            <strong>{templates.find(t => t.id === recommendedTemplate)?.name}</strong> template
            for optimal ATS performance and visual appeal.
          </p>
        </div>
      )}
    </div>
  );
};

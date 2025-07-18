
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  isPremium: boolean;
  isPopular: boolean;
  preview: string;
  description: string;
  features: string[];
}

interface TemplateGalleryProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  selectedTemplate,
  onTemplateSelect
}) => {
  const templates: Template[] = [
    {
      id: 'modern-professional',
      name: 'Modern Professional',
      category: 'Professional',
      isPremium: false,
      isPopular: true,
      preview: '/templates/modern-professional.jpg',
      description: 'Clean, modern design perfect for corporate roles',
      features: ['ATS Optimized', 'Single Column', 'Professional']
    },
    {
      id: 'creative-designer',
      name: 'Creative Designer',
      category: 'Creative',
      isPremium: true,
      isPopular: false,
      preview: '/templates/creative-designer.jpg',
      description: 'Bold, visual design for creative professionals',
      features: ['Portfolio Ready', 'Visual Elements', 'Creative']
    },
    {
      id: 'executive-classic',
      name: 'Executive Classic',
      category: 'Executive',
      isPremium: true,
      isPopular: true,
      preview: '/templates/executive-classic.jpg',
      description: 'Sophisticated design for senior executives',
      features: ['Two Column', 'Executive Focus', 'Premium']
    },
    {
      id: 'minimalist-clean',
      name: 'Minimalist Clean',
      category: 'Minimal',
      isPremium: false,
      isPopular: false,
      preview: '/templates/minimalist-clean.jpg',
      description: 'Ultra-clean design focusing on content',
      features: ['Minimal Design', 'Typography Focus', 'Clean']
    },
    {
      id: 'tech-innovator',
      name: 'Tech Innovator',
      category: 'Technology',
      isPremium: true,
      isPopular: true,
      preview: '/templates/tech-innovator.jpg',
      description: 'Modern tech-focused design with visual elements',
      features: ['Tech Focused', 'Modern', 'Visual Charts']
    },
    {
      id: 'academic-scholar',
      name: 'Academic Scholar',
      category: 'Academic',
      isPremium: false,
      isPopular: false,
      preview: '/templates/academic-scholar.jpg',
      description: 'Traditional academic format for researchers',
      features: ['Research Focus', 'Publications', 'Academic']
    }
  ];

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Choose Template</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredTemplates.map(template => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <CardContent className="p-4">
              <div className="flex gap-3">
                {/* Template Preview */}
                <div className="w-16 h-20 bg-muted rounded flex items-center justify-center relative overflow-hidden">
                  <div className="text-xs text-center p-1">
                    <div className="w-full h-1 bg-primary/20 mb-1"></div>
                    <div className="w-3/4 h-1 bg-primary/30 mb-1"></div>
                    <div className="w-full h-1 bg-primary/20 mb-1"></div>
                    <div className="w-2/3 h-1 bg-primary/30"></div>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <div className="flex gap-1">
                      {template.isPopular && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      {template.isPremium && (
                        <Badge variant="outline" className="text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {template.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 2).map(feature => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {template.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.features.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/5 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Upgrade to Pro</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Unlock 15+ premium templates and advanced customization options
        </p>
        <Button size="sm" className="w-full">
          Upgrade Now - ₹199/month
        </Button>
      </div>
    </div>
  );
};

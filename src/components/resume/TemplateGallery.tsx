import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Palette } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  preview: string;
}

interface TemplateGalleryProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  resumeData: any;
}

const templates: Template[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    category: 'Professional',
    description: 'Clean design with blue accents, perfect for tech and business roles',
    features: ['ATS-Friendly', 'Clean Layout', 'Professional Colors'],
    preview: '/images/templates/modern-preview.png'
  },
  {
    id: 'classic',
    name: 'Classic Traditional',
    category: 'Traditional',
    description: 'Timeless serif design ideal for conservative industries',
    features: ['Traditional Format', 'Serif Typography', 'Professional'],
    preview: '/images/templates/classic-preview.png'
  },
  {
    id: 'creative',
    name: 'Creative Gradient',
    category: 'Creative',
    description: 'Eye-catching design with gradients for creative professionals',
    features: ['Colorful Design', 'Modern Gradients', 'Creative Layout'],
    preview: '/images/templates/creative-preview.png'
  },
  {
    id: 'executive',
    name: 'Executive Corporate',
    category: 'Executive',
    description: 'Sophisticated design for senior leadership positions',
    features: ['Executive Format', 'Professional', 'Leadership Focus'],
    preview: '/images/templates/executive-preview.png'
  },
  {
    id: 'technical',
    name: 'Technical Developer',
    category: 'Technical',
    description: 'Code-inspired design perfect for developers and engineers',
    features: ['Tech-Focused', 'Code Style', 'Developer-Friendly'],
    preview: '/images/templates/technical-preview.png'
  },
  {
    id: 'academic',
    name: 'Academic Scholar',
    category: 'Academic',
    description: 'Research-focused design for academia and publications',
    features: ['Academic Format', 'Research Focus', 'Publication Ready'],
    preview: '/images/templates/academic-preview.png'
  }
];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  selectedTemplate,
  onTemplateSelect,
  resumeData
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choose Template
          </h3>
          <p className="text-sm text-gray-600">Select a template that matches your industry and style</p>
        </div>
        <Badge variant="outline">{templates.length} Templates</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <CardContent className="p-4">
              {/* Template Preview */}
              <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>

              {/* Template Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{template.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600">{template.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {selectedTemplate === template.id && (
                  <div className="pt-2">
                    <Button size="sm" className="w-full">
                      Currently Selected
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
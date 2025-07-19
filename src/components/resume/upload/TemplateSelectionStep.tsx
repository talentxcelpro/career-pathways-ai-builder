
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Star, FileText, CheckCircle } from "lucide-react";

interface TemplateSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
  onTemplateSelect: (templateId: string) => void;
  selectedTemplate: string;
  canGoBack: boolean;
  canGoNext: boolean;
}

const templates = [
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    description: 'Clean, modern design perfect for tech professionals',
    popular: true,
    color: 'from-blue-500 to-purple-500',
    preview: '/api/placeholder/200/280'
  },
  {
    id: 'executive-classic',
    name: 'Executive Classic',
    description: 'Traditional, authoritative template for senior roles',
    popular: false,
    color: 'from-gray-700 to-gray-900',
    preview: '/api/placeholder/200/280'
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    description: 'Vibrant, creative template for design professionals',
    popular: true,
    color: 'from-pink-500 to-orange-500',
    preview: '/api/placeholder/200/280'
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Ultra-clean, minimalist design focusing on content',
    popular: false,
    color: 'from-green-500 to-teal-500',
    preview: '/api/placeholder/200/280'
  }
];

export const TemplateSelectionStep: React.FC<TemplateSelectionStepProps> = ({
  onNext,
  onBack,
  onTemplateSelect,
  selectedTemplate,
  canGoBack,
  canGoNext
}) => {
  const handleTemplateClick = (templateId: string) => {
    onTemplateSelect(templateId);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Perfect Template
        </h2>
        <p className="text-gray-600">
          Select a professional design that matches your industry and style
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleTemplateClick(template.id)}
          >
            <CardContent className="p-0">
              <div className="relative">
                {/* Template Preview */}
                <div className={`w-full h-64 bg-gradient-to-br ${template.color} rounded-t-lg flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                  <div className="relative z-10 text-white">
                    <FileText className="w-16 h-16 opacity-80" />
                  </div>
                  
                  {/* Popular Badge */}
                  {template.popular && (
                    <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  
                  {/* Selected Indicator */}
                  {selectedTemplate === template.id && (
                    <div className="absolute inset-0 bg-blue-500/20 rounded-t-lg flex items-center justify-center">
                      <div className="bg-white rounded-full p-2">
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {template.description}
                  </p>
                  
                  <Button
                    variant={selectedTemplate === template.id ? "default" : "outline"}
                    size="sm"
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateClick(template.id);
                    }}
                  >
                    {selectedTemplate === template.id ? 'Selected' : 'Use This Template'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Template Info */}
      {selectedTemplate && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  {templates.find(t => t.id === selectedTemplate)?.name} Selected
                </h3>
                <p className="text-blue-700 text-sm">
                  Great choice! This template will make your resume stand out.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={!canGoBack}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continue to Processing
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};


import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, FileText, Star, CheckCircle } from "lucide-react";

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
    id: 'modern', 
    name: 'Modern Professional', 
    description: 'Clean, contemporary design perfect for most industries',
    popular: true,
    color: 'from-blue-500 to-purple-500'
  },
  { 
    id: 'creative', 
    name: 'Creative Impact', 
    description: 'Eye-catching layout ideal for creative professionals',
    popular: false,
    color: 'from-pink-500 to-orange-500'
  },
  { 
    id: 'executive', 
    name: 'Executive Elite', 
    description: 'Sophisticated design for leadership positions',
    popular: false,
    color: 'from-gray-700 to-gray-900'
  },
  { 
    id: 'minimalist', 
    name: 'Minimalist Clean', 
    description: 'Simple, elegant design that highlights content',
    popular: true,
    color: 'from-green-500 to-teal-500'
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
          Choose Your Template
        </h2>
        <p className="text-gray-600">
          Select a professional template that matches your industry and style
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
            onClick={() => handleTemplateClick(template.id)}
          >
            <CardContent className="p-0">
              <div className="relative">
                <div className={`w-full h-48 bg-gradient-to-br ${template.color} rounded-t-lg flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                  <div className="relative z-10 text-white">
                    <FileText className="w-12 h-12 opacity-80" />
                  </div>
                  
                  {template.popular && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </div>
                  )}
                  
                  {selectedTemplate === template.id && (
                    <div className="absolute inset-0 bg-blue-500/20 rounded-t-lg flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          onClick={onBack}
          disabled={!canGoBack}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canGoNext}
        >
          Process Resume
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Eye, Palette, Download } from 'lucide-react';
import { sampleResumeData, colorSchemes } from '@/data/sampleResumeData';

interface TemplatePreviewProps {
  template: {
    id: string;
    name: string;
    category: string;
    description: string;
    preview: string;
    features: string[];
    atsScore: number;
    isRecommended?: boolean;
    designStyle: string;
    bestFor: string[];
  };
  isSelected: boolean;
  onSelect: (templateId: string) => void;
  onPreview: (templateId: string) => void;
}

export const EnhancedTemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  isSelected,
  onSelect,
  onPreview
}) => {
  const [selectedColorScheme, setSelectedColorScheme] = useState('professional-blue');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const currentColorScheme = colorSchemes[selectedColorScheme as keyof typeof colorSchemes];

  const renderTemplatePreview = () => {
    const style = {
      '--primary-color': currentColorScheme.primary,
      '--secondary-color': currentColorScheme.secondary,
      '--accent-color': currentColorScheme.accent,
      '--text-color': currentColorScheme.text,
      '--bg-color': currentColorScheme.background,
    } as React.CSSProperties;

    return (
      <div className="w-full h-full" style={style}>
        {template.id === 'modern' && (
          <div className="p-4 text-xs bg-white">
            <div className="border-b-2 pb-2 mb-3" style={{ borderColor: currentColorScheme.primary }}>
              <h1 className="font-bold text-lg" style={{ color: currentColorScheme.text }}>
                {sampleResumeData.personalInfo.fullName}
              </h1>
              <p className="text-xs" style={{ color: currentColorScheme.primary }}>
                Senior Product Manager
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: currentColorScheme.primary }}>Experience</h3>
                <div className="space-y-1">
                  <div>
                    <p className="font-medium">{sampleResumeData.experience[0].title}</p>
                    <p style={{ color: currentColorScheme.secondary }}>{sampleResumeData.experience[0].company}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: currentColorScheme.primary }}>Skills</h3>
                <div className="space-y-1">
                  {sampleResumeData.skills.slice(0, 3).map((skill, i) => (
                    <div key={i} className="text-xs">
                      <span>{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {template.id === 'creative' && (
          <div className="p-4 text-xs bg-white">
            <div 
              className="p-3 mb-3 text-white rounded-t"
              style={{ 
                background: `linear-gradient(135deg, ${currentColorScheme.primary}, ${currentColorScheme.secondary})`
              }}
            >
              <h1 className="font-bold text-lg">{sampleResumeData.personalInfo.fullName}</h1>
              <p className="text-xs opacity-90">Creative Professional</p>
            </div>
            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-xs mb-1" style={{ color: currentColorScheme.primary }}>
                  About
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {sampleResumeData.personalInfo.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {sampleResumeData.skills.slice(0, 4).map((skill, i) => (
                  <span 
                    key={i} 
                    className="text-xs px-2 py-1 rounded text-white"
                    style={{ backgroundColor: currentColorScheme.accent }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {(template.id === 'classic' || !['modern', 'creative'].includes(template.id)) && (
          <div className="p-4 text-xs bg-white">
            <div className="border-b pb-2 mb-3">
              <h1 className="font-bold text-lg text-black">
                {sampleResumeData.personalInfo.fullName}
              </h1>
              <p className="text-xs text-gray-600">
                {sampleResumeData.personalInfo.email} • {sampleResumeData.personalInfo.phone}
              </p>
            </div>
            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-xs mb-1">PROFESSIONAL EXPERIENCE</h3>
                <div>
                  <p className="font-medium text-xs">{sampleResumeData.experience[0].title}</p>
                  <p className="text-xs text-gray-600">{sampleResumeData.experience[0].company}</p>
                  <p className="text-xs text-gray-500">{sampleResumeData.experience[0].startDate} - Present</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-xs mb-1">EDUCATION</h3>
                <p className="text-xs">{sampleResumeData.education[0].degree}</p>
                <p className="text-xs text-gray-600">{sampleResumeData.education[0].school}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getAtsScoreColor = (score: number) => {
    if (score >= 95) return 'bg-success/10 text-success';
    if (score >= 85) return 'bg-primary/10 text-primary';
    if (score >= 75) return 'bg-orange/10 text-orange';
    return 'bg-red/10 text-red';
  };

  return (
    <Card className={`cursor-pointer transition-smooth animate-fadeInScale hover:shadow-float ${
      isSelected ? 'ring-2 ring-primary shadow-lg' : ''
    }`}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Template Preview Area */}
          <div className="aspect-[3/4] bg-card rounded-t-lg overflow-hidden border border-border">
            {renderTemplatePreview()}
          </div>
          
          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2">
              <CheckCircle className="h-6 w-6 text-primary bg-white rounded-full" />
            </div>
          )}

          {/* Recommended Badge */}
          {template.isRecommended && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-yellow-500 text-yellow-900">
                <Star className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
            </div>
          )}

          {/* Color Scheme Selector */}
          <div className="absolute bottom-2 left-2">
            <div className="flex space-x-1">
              {Object.values(colorSchemes).slice(0, 4).map((scheme) => (
                <button
                  key={scheme.id}
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedColorScheme === scheme.id ? 'border-white shadow-lg' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: scheme.primary }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColorScheme(scheme.id);
                  }}
                />
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(!showColorPicker);
                }}
                className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center"
              >
                <Palette className="h-2 w-2 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(template.id);
              }}
              className="h-7 px-2"
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Template Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-xs text-muted-foreground">{template.designStyle}</p>
            </div>
            <Badge className={`text-xs ${getAtsScoreColor(template.atsScore)}`}>
              ATS {template.atsScore}%
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {template.description}
          </p>

          {/* Best For Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {template.bestFor.slice(0, 2).map((use) => (
              <Badge key={use} variant="outline" className="text-xs">
                {use}
              </Badge>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1 mb-3">
            {template.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>

          {/* Color Scheme Info */}
          <div className="text-xs text-muted-foreground mb-3">
            <span className="font-medium">Color:</span> {currentColorScheme.name}
          </div>

          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={() => onSelect(template.id)}
          >
            {isSelected ? 'Selected' : 'Select Template'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

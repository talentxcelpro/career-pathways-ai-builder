
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Palette, Maximize, Minimize } from 'lucide-react';
import { sampleResumeData, colorSchemes } from '@/data/sampleResumeData';
import { enhancedTemplateData } from '@/data/enhancedTemplateData';
import { resumeTemplates } from '@/data/resumeTemplates';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  onSelect: (templateId: string) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  templateId,
  onSelect
}) => {
  const [selectedColorScheme, setSelectedColorScheme] = useState('professional-blue');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const template = enhancedTemplateData.find(t => t.id === templateId) ||
                    resumeTemplates.find(t => t.id === templateId);
  const currentColorScheme = colorSchemes[selectedColorScheme as keyof typeof colorSchemes];

  if (!template) return null;

  const renderFullTemplate = () => {
    const style = {
      '--primary-color': currentColorScheme.primary,
      '--secondary-color': currentColorScheme.secondary,
      '--accent-color': currentColorScheme.accent,
      '--text-color': currentColorScheme.text,
      '--bg-color': currentColorScheme.background,
    } as React.CSSProperties;

    return (
      <div 
        className="w-full max-w-4xl mx-auto bg-white shadow-lg" 
        style={style}
      >
        {/* Template-specific full rendering would go here */}
        <div className="p-8">
          <div className="border-b-2 pb-4 mb-6" style={{ borderColor: currentColorScheme.primary }}>
            <h1 className="text-4xl font-bold mb-2" style={{ color: currentColorScheme.text }}>
              {sampleResumeData.personalInfo.fullName}
            </h1>
            <p className="text-xl" style={{ color: currentColorScheme.primary }}>
              Senior Product Manager
            </p>
            <div className="flex space-x-4 mt-2 text-sm text-gray-600">
              <span>{sampleResumeData.personalInfo.email}</span>
              <span>{sampleResumeData.personalInfo.phone}</span>
              <span>{sampleResumeData.personalInfo.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: currentColorScheme.primary }}>
                  Professional Summary
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {sampleResumeData.professionalSummary?.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: currentColorScheme.primary }}>
                  Experience
                </h2>
                <div className="space-y-6">
                  {sampleResumeData.experience.map((exp, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold">{exp.title}</h3>
                          <p style={{ color: currentColorScheme.secondary }} className="font-medium">
                            {exp.company}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{exp.description}</p>
                      {exp.achievements && (
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-bold mb-4" style={{ color: currentColorScheme.primary }}>
                  Skills
                </h2>
                <div className="space-y-3">
                  {sampleResumeData.skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-sm text-gray-500">{skill.level}</span>
                      </div>
                      <div className="bg-gray-200 h-2 rounded">
                        <div 
                          className="h-2 rounded"
                          style={{ 
                            backgroundColor: currentColorScheme.accent,
                            width: skill.level === 'expert' ? '100%' : 
                                   skill.level === 'advanced' ? '80%' : '60%'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4" style={{ color: currentColorScheme.primary }}>
                  Education
                </h2>
                <div className="space-y-4">
                  {sampleResumeData.education.map((edu, index) => (
                    <div key={index}>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p style={{ color: currentColorScheme.secondary }}>{edu.school}</p>
                      <p className="text-sm text-gray-500">{edu.endDate}</p>
                      {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] h-[95vh]' : 'max-w-6xl h-[80vh]'} p-0`}>
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">{template.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${
                template.atsScore >= 95 ? 'bg-green-100 text-green-800' : 
                template.atsScore >= 85 ? 'bg-blue-100 text-blue-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                ATS {template.atsScore}%
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Color Scheme Selector */}
          <div className="flex items-center space-x-3 mt-3">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Color Scheme:</span>
            <div className="flex space-x-2">
              {Object.values(colorSchemes).map((scheme) => (
                <button
                  key={scheme.id}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColorScheme === scheme.id ? 'border-gray-800 shadow-lg' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: scheme.primary }}
                  onClick={() => setSelectedColorScheme(scheme.id)}
                  title={scheme.name}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              {currentColorScheme.name}
            </span>
          </div>
        </DialogHeader>

        {/* Template Preview */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <div className="flex justify-center">
            {renderFullTemplate()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-white flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {template.features.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Preview PDF
            </Button>
            <Button 
              onClick={() => {
                onSelect(template.id);
                onClose();
              }}
            >
              Select This Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeTemplateSelector } from './ResumeTemplateSelector';
import { TemplateCustomizer } from './TemplateCustomizer';
import { TemplateRenderer } from './TemplateRenderer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Download, Eye, Settings, Palette } from 'lucide-react';

interface ResumeTemplateInterfaceProps {
  resumeData: any;
  onSaveTemplate?: (templateId: string, customization: any) => void;
  onClose?: () => void;
}

export const ResumeTemplateInterface: React.FC<ResumeTemplateInterfaceProps> = ({
  resumeData,
  onSaveTemplate,
  onClose
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customization, setCustomization] = useState({
    colors: {
      primary: '#3498DB',
      secondary: '#2980B9',
      accent: '#1ABC9C',
      text: '#2C3E50',
      background: '#FFFFFF'
    },
    typography: {
      headingFont: 'inter',
      bodyFont: 'inter',
      fontSize: 12,
      lineHeight: 1.5
    },
    layout: {
      margins: 'normal' as const,
      spacing: 'standard' as const,
      columns: 1 as const
    },
    sections: {
      showPhoto: false,
      showSummary: true,
      showObjective: false,
      sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications']
    }
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const steps = [
    { id: 'template', title: 'Choose Template', icon: Palette },
    { id: 'customize', title: 'Customize', icon: Settings },
    { id: 'preview', title: 'Preview & Download', icon: Eye }
  ];

  useEffect(() => {
    if (selectedTemplate) {
      // Apply template defaults to customization
      const templateDefaults = {
        colors: selectedTemplate.design_tokens || customization.colors,
        typography: {
          ...customization.typography,
          headingFont: selectedTemplate.template_config?.fontFamily || customization.typography.headingFont,
          bodyFont: selectedTemplate.template_config?.fontFamily || customization.typography.bodyFont
        },
        layout: {
          ...customization.layout,
          margins: selectedTemplate.layout_config?.margins || customization.layout.margins,
          spacing: selectedTemplate.template_config?.sectionSpacing || customization.layout.spacing,
          columns: selectedTemplate.layout_config?.columns || customization.layout.columns
        },
        sections: {
          ...customization.sections,
          showPhoto: selectedTemplate.features?.photoSupport || customization.sections.showPhoto
        }
      };

      setCustomization(templateDefaults);
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setCurrentStep(1);
    toast.success(`Selected ${template.name} template`);
  };

  const handleCustomizationChange = (newCustomization: any) => {
    setCustomization(newCustomization);
  };

  const handlePreview = () => {
    setPreviewMode(true);
    setCurrentStep(2);
  };

  const handleDownloadPDF = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }

    try {
      setIsGeneratingPDF(true);
      toast.info('Generating PDF...');

      // Create a temporary element for PDF generation
      const element = document.createElement('div');
      element.style.width = '210mm';
      element.style.minHeight = '297mm';
      element.style.padding = '0';
      element.style.margin = '0';
      element.style.backgroundColor = 'white';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';

      document.body.appendChild(element);

      // Render the template to the element
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(element);
      
      root.render(
        <TemplateRenderer
          template={selectedTemplate}
          resumeData={resumeData}
          customization={customization}
          className="pdf-export"
        />
      );

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show message that PDF export is not available in development
      toast.info('PDF export is temporarily disabled in development mode. Please use production build for PDF export.');
      return;

      // Track download
      await supabase.rpc('track_template_usage', {
        template_uuid: selectedTemplate.id,
        user_uuid: user?.id || null,
        action_type: 'template_downloaded',
        metadata: {
          format: 'pdf',
          customization: customization
        }
      });

      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedTemplate !== null;
      case 1:
        return selectedTemplate !== null;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">Resume Template Builder</h1>
              <p className="text-muted-foreground">
                Create a professional resume with our customizable templates
              </p>
            </div>
          </div>
          
          {selectedTemplate && (
            <Badge variant="secondary" className="text-sm">
              {selectedTemplate.name}
            </Badge>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStep
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-gray-100 text-gray-400 border-gray-300'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    index <= currentStep ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-px ${
                      index < currentStep ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 0 && (
              <ResumeTemplateSelector
                onTemplateSelect={handleTemplateSelect}
                selectedTemplateId={selectedTemplate?.id}
                userIndustry={resumeData.personalInfo?.industry}
                userExperienceLevel={resumeData.experience?.length > 3 ? 'senior' : 'mid'}
              />
            )}

            {currentStep === 1 && selectedTemplate && (
              <TemplateCustomizer
                template={selectedTemplate}
                customization={customization}
                onCustomizationChange={handleCustomizationChange}
                onPreview={handlePreview}
                onDownload={handleDownloadPDF}
              />
            )}

            {currentStep === 2 && selectedTemplate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Resume Preview</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={handleDownloadPDF}
                      disabled={isGeneratingPDF}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <TemplateRenderer
                        template={selectedTemplate}
                        resumeData={resumeData}
                        customization={customization}
                        className="p-8"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Live Preview */}
            {selectedTemplate && currentStep < 2 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Live Preview</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="transform scale-50 origin-top-left w-[200%] h-[200%] overflow-hidden">
                      <TemplateRenderer
                        template={selectedTemplate}
                        resumeData={resumeData}
                        customization={customization}
                        className="p-4"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Template Info */}
            {selectedTemplate && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold">Template Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Name:</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {selectedTemplate.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Category:</span>
                      <span className="text-sm text-muted-foreground ml-2 capitalize">
                        {selectedTemplate.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Features:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTemplate.features?.atsOptimized && (
                          <Badge variant="outline" className="text-xs">ATS-Friendly</Badge>
                        )}
                        {selectedTemplate.features?.photoSupport && (
                          <Badge variant="outline" className="text-xs">Photo Support</Badge>
                        )}
                        {selectedTemplate.features?.colorCustomization && (
                          <Badge variant="outline" className="text-xs">Customizable</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed() || currentStep === steps.length - 1}
                    className="flex-1"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
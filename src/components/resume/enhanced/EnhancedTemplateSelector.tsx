
import React, { useEffect, useState } from 'react';
import { TemplateLibrary } from '../templates/TemplateLibrary';
import { CustomizationEngine } from '../customization/CustomizationEngine';
import { ExportSystem } from '../export/ExportSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { templateEngine } from '@/services/template-engine';
import { coreToLegacy } from '@/utils/template-adapters';

interface EnhancedTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  customizationSettings: any;
  onCustomizationChange: (settings: any) => void;
  resumeData: any;
  onExport: (format: string, settings: any) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
}

export const EnhancedTemplateSelector: React.FC<EnhancedTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  customizationSettings,
  onCustomizationChange,
  resumeData,
  onExport,
  onNext,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('templates');

  // Auto-select a recommended modern ATS template and move to Customize when user asks to proceed
  useEffect(() => {
    if (!selectedTemplate) {
      const recommended = templateEngine.getRecommendedTemplates();
      const modern = recommended.find(t => t.metadata.category === 'modern');
      const fallback = recommended[0] || templateEngine.getAllTemplates().sort((a, b) => b.metadata.atsScore - a.metadata.atsScore)[0];
      const toSelect = modern || fallback;
      if (toSelect) {
        onTemplateSelect(toSelect.metadata.id);
        setActiveTab('customize');
      }
    }
  }, [selectedTemplate, onTemplateSelect]);

  const handlePreview = (templateId: string) => {
    // Preview functionality is now handled within TemplateLibrary component
    console.log('Template preview triggered for:', templateId);
  };

  const handleCustomizationPreview = () => {
    console.log('Previewing customizations');
    // Implement customization preview
  };

  const handleCustomizationReset = () => {
    const defaultSettings = {
      colorScheme: 'blue',
      fontFamily: 'inter',
      fontSize: 11,
      spacing: 'normal',
      sectionOrder: ['personalInfo', 'summary', 'experience', 'education', 'skills'],
      showPhoto: true,
      showBorder: false,
      accentColor: '#2563eb'
    };
    onCustomizationChange(defaultSettings);
  };

  const handleCustomizationSave = () => {
    console.log('Saving customizations');
    // Implement save logic
  };

  return (
    <main className="space-y-6 animate-slideInUp">
      <Helmet>
        <title>Resume Templates & Customization | ATS-Optimized</title>
        <meta name="description" content="Browse, customize, and export ATS-friendly resume templates designed for modern hiring." />
        <link rel="canonical" href="https://talentxcel.in/resume/templates" />
      </Helmet>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Resume Templates & Customization</h1>
        <p className="text-muted-foreground">Choose a template, fine-tune styles, and export your resume in one flow.</p>
      </header>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Choose Template</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <TemplateLibrary
            selectedTemplate={selectedTemplate}
            onTemplateSelect={onTemplateSelect}
            onPreview={handlePreview}
          />
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          <CustomizationEngine
            settings={customizationSettings}
            onSettingsChange={onCustomizationChange}
            onPreview={handleCustomizationPreview}
            onReset={handleCustomizationReset}
            onSave={handleCustomizationSave}
          />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ExportSystem
            resumeData={resumeData}
            selectedTemplate={selectedTemplate}
            onExport={onExport}
          />
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex gap-2">
          {activeTab !== 'export' && (
            <Button 
              onClick={() => {
                if (activeTab === 'templates') setActiveTab('customize');
                else if (activeTab === 'customize') setActiveTab('export');
              }}
              variant="outline"
            >
              Next Step
            </Button>
          )}
          <Button onClick={onNext} className="flex items-center gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </main>
  );
};

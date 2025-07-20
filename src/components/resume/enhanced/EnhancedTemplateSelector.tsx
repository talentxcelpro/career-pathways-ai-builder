
import React, { useState } from 'react';
import { TemplateLibrary } from '../templates/TemplateLibrary';
import { CustomizationEngine } from '../customization/CustomizationEngine';
import { ExportSystem } from '../export/ExportSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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

  const handlePreview = (templateId: string) => {
    console.log('Previewing template:', templateId);
    // Implement preview logic
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
    <div className="space-y-6">
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
    </div>
  );
};

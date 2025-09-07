
import React from 'react';
import { ResponsiveTemplateGrid } from './ResponsiveTemplateGrid';

interface TemplateLibraryProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onPreview: (templateId: string) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onPreview
}) => {
  return (
    <div className="space-y-6">
      <ResponsiveTemplateGrid
        selectedTemplate={selectedTemplate}
        onTemplateSelect={onTemplateSelect}
        onPreview={onPreview}
      />
    </div>
  );
};
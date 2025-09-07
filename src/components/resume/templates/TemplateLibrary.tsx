import React from 'react';
import { ResponsiveTemplateGrid } from './ResponsiveTemplateGrid';
// import { TemplatePreviewModal } from './TemplatePreviewModal';

interface TemplateLibraryProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onPreview
}) => {
  // Preview state handled inside ResponsiveTemplateGrid

  return (
    <div className="space-y-6">
      <ResponsiveTemplateGrid
        selectedTemplate={selectedTemplate}
        onTemplateSelect={onTemplateSelect}
        onPreview={onPreview ?? ((_: string) => {})}
      />
      
      {/* Preview modal removed - handled by ResponsiveTemplateGrid */}
    </div>
  );
};
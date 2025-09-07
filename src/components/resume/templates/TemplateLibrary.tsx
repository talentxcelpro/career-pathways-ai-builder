import React, { useState } from 'react';
import { ResponsiveTemplateGrid } from './ResponsiveTemplateGrid';
import { TemplatePreviewModal } from './TemplatePreviewModal';

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
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  const handlePreview = (templateId: string) => {
    setPreviewTemplateId(templateId);
    onPreview?.(templateId);
  };

  const handleClosePreview = () => {
    setPreviewTemplateId(null);
  };

  return (
    <div className="space-y-6">
      <ResponsiveTemplateGrid
        selectedTemplate={selectedTemplate}
        onTemplateSelect={onTemplateSelect}
        onPreview={handlePreview}
      />
      
      {previewTemplateId && (
        <TemplatePreviewModal
          isOpen={!!previewTemplateId}
          onClose={handleClosePreview}
          templateId={previewTemplateId}
          onSelect={onTemplateSelect}
        />
      )}
    </div>
  );
};
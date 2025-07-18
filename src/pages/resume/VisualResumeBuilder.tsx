
import React from 'react';
import { VisualResumeBuilder } from "@/components/resume/visual/VisualResumeBuilder";
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const VisualResumeBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSave = async (data: any) => {
    try {
      console.log('Saving resume data:', data);
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    try {
      console.log('Exporting resume as:', format);
      toast.success(`Resume exported as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Error exporting resume:', error);
      toast.error('Failed to export resume');
    }
  };

  return (
    <VisualResumeBuilder
      onSave={handleSave}
      onExport={handleExport}
    />
  );
};

export default VisualResumeBuilderPage;

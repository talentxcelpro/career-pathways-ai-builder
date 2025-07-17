
import React from 'react';
import { Card } from "@/components/ui/card";
import { ResumePreview as BaseResumePreview } from "@/components/resume/ResumePreview";

interface ResumePreviewProps {
  data?: any;
  content?: any;
  template?: any;
  fullPage?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  data, 
  content, 
  template, 
  fullPage 
}) => {
  // Use either data or content as the resume data
  const resumeData = data || content;
  
  return (
    <Card className="h-fit">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="border rounded-lg overflow-hidden">
          <BaseResumePreview 
            data={resumeData}
          />
        </div>
      </div>
    </Card>
  );
};

// Export the props interface for other components to use
export type { ResumePreviewProps };

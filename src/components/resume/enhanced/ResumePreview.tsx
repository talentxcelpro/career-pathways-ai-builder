
import React from 'react';
import { Card } from "@/components/ui/card";
import { ResumePreview as BaseResumePreview } from "@/components/resume/ResumePreview";

interface ResumePreviewProps {
  data: any;
  template?: any;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template }) => {
  return (
    <Card className="h-fit">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="border rounded-lg overflow-hidden">
          <BaseResumePreview 
            content={data} 
            template={template}
            fullPage={false}
          />
        </div>
      </div>
    </Card>
  );
};


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResumePreviewProps {
  resume: any;
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export const ResumePreview = ({ resume, open, onClose, onDownload, onShare }: ResumePreviewProps) => {
  const { toast } = useToast();

  const generateResumeHTML = (resumeData: any) => {
    const { personalInfo = {}, experience = [], education = [], skills = [] } = resumeData;
    
    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: white;">
        <header style="text-align: center; border-bottom: 3px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 2.5em; margin: 0; color: #1F2937; font-weight: 700;">${personalInfo.fullName || 'Full Name'}</h1>
          <div style="margin-top: 10px; font-size: 1.1em; color: #6B7280;">
            ${personalInfo.email || ''} ${personalInfo.phone ? ` | ${personalInfo.phone}` : ''} ${personalInfo.location ? ` | ${personalInfo.location}` : ''}
            ${personalInfo.website ? ` | ${personalInfo.website}` : ''}
          </div>
        </header>
        
        ${personalInfo.summary ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 1.5em; color: #3B82F6; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px; margin-bottom: 15px;">Professional Summary</h2>
          <p style="font-size: 1.1em; line-height: 1.7; margin: 0;">${personalInfo.summary}</p>
        </section>
        ` : ''}
        
        ${skills.length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 1.5em; color: #3B82F6; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px; margin-bottom: 15px;">Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${skills.map(skill => `<span style="background: #F3F4F6; color: #374151; padding: 6px 12px; border-radius: 20px; font-size: 0.9em;">${skill}</span>`).join('')}
          </div>
        </section>
        ` : ''}
        
        ${experience.length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 1.5em; color: #3B82F6; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px; margin-bottom: 15px;">Professional Experience</h2>
          ${experience.map(exp => `
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <h3 style="font-size: 1.2em; margin: 0; color: #1F2937; font-weight: 600;">${exp.title || 'Job Title'}</h3>
                <span style="font-size: 0.9em; color: #6B7280; font-weight: 500;">${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}</span>
              </div>
              <div style="font-weight: 600; color: #3B82F6; margin-bottom: 8px; font-size: 1.05em;">${exp.company || 'Company'}${exp.location ? ` • ${exp.location}` : ''}</div>
              ${exp.description ? `<p style="margin: 0; color: #4B5563; line-height: 1.6;">${exp.description}</p>` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}
        
        ${education.length > 0 ? `
        <section>
          <h2 style="font-size: 1.5em; color: #3B82F6; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px; margin-bottom: 15px;">Education</h2>
          ${education.map(edu => `
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                <h3 style="font-size: 1.1em; margin: 0; color: #1F2937; font-weight: 600;">${edu.degree || 'Degree'}</h3>
                <span style="font-size: 0.9em; color: #6B7280; font-weight: 500;">${edu.startDate || ''} - ${edu.endDate || ''}</span>
              </div>
              <div style="color: #3B82F6; font-weight: 600; font-size: 1.05em;">${edu.school || 'School'}${edu.location ? ` • ${edu.location}` : ''}</div>
              ${edu.gpa ? `<div style="color: #6B7280; margin-top: 5px;">GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}
      </div>
    `;
  };

  const copyShareableLink = () => {
    const shareUrl = `${window.location.origin}/resume/${resume.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "Shareable resume link copied to clipboard."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Resume Preview: {resume?.title}</span>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={copyShareableLink}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="border rounded-lg p-6 bg-white">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: generateResumeHTML(resume?.content || {}) 
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

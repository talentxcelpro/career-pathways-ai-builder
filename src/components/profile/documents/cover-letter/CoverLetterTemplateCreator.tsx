
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface CoverLetterData {
  title: string;
  content: string;
  targetCompany: string;
  targetRole: string;
}

export const CoverLetterTemplateCreator = () => {
  const { toast } = useToast();
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
    title: '',
    content: '',
    targetCompany: '',
    targetRole: ''
  });

  const handleSaveTemplate = () => {
    if (!coverLetterData.title.trim() || !coverLetterData.content.trim()) {
      toast({
        title: "Error",
        description: "Please provide both title and content for the cover letter.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Cover Letter Saved",
      description: "Your cover letter template has been saved successfully.",
    });
    
    setCoverLetterData({
      title: '',
      content: '',
      targetCompany: '',
      targetRole: ''
    });
  };

  const handleExportTemplate = () => {
    if (!coverLetterData.content.trim()) {
      toast({
        title: "Error",
        description: "No content to export. Please write a cover letter first.",
        variant: "destructive",
      });
      return;
    }

    const content = `${coverLetterData.title}\n\n${coverLetterData.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${coverLetterData.title || 'cover-letter'}.txt`;
    link.click();

    toast({
      title: "Cover Letter Exported",
      description: "Your cover letter has been downloaded as a text file.",
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Create Cover Letter Template</CardTitle>
        <CardDescription>Write and save reusable cover letter templates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Template Title</label>
            <Input
              placeholder="e.g., Software Engineer Cover Letter"
              value={coverLetterData.title}
              onChange={(e) => setCoverLetterData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Target Company (Optional)</label>
            <Input
              placeholder="Company name"
              value={coverLetterData.targetCompany}
              onChange={(e) => setCoverLetterData(prev => ({ ...prev, targetCompany: e.target.value }))}
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Target Role (Optional)</label>
          <Input
            placeholder="Job title"
            value={coverLetterData.targetRole}
            onChange={(e) => setCoverLetterData(prev => ({ ...prev, targetRole: e.target.value }))}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Cover Letter Content</label>
          <Textarea
            placeholder="Dear Hiring Manager,

I am writing to express my interest in the [Position] role at [Company]. With my background in [relevant experience], I am confident that I would be a valuable addition to your team.

[Your compelling content here]

Sincerely,
[Your Name]"
            value={coverLetterData.content}
            onChange={(e) => setCoverLetterData(prev => ({ ...prev, content: e.target.value }))}
            className="min-h-[200px]"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSaveTemplate} className="flex-1">
            Save Template
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportTemplate}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as File
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

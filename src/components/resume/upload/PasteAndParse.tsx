import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ClipboardPaste, Zap, Linkedin, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useAIResumeProcessor } from "@/hooks/useAIResumeProcessor";
import { toast } from "sonner";

interface PasteAndParseProps {
  onDataExtracted: (extractedData: any) => void;
  className?: string;
}

export const PasteAndParse: React.FC<PasteAndParseProps> = ({
  onDataExtracted,
  className = ""
}) => {
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const [extractedPreview, setExtractedPreview] = useState<any>(null);

  const { parseTextContent } = useAIResumeProcessor();

  const detectContentFormat = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // LinkedIn profile detection
    if (lowerText.includes('linkedin.com') || 
        lowerText.includes('experience at') || 
        lowerText.includes('connections') ||
        lowerText.includes('recommendations')) {
      return 'linkedin';
    }
    
    // Resume detection
    if (lowerText.includes('experience') && 
        lowerText.includes('education') &&
        (lowerText.includes('skills') || lowerText.includes('summary'))) {
      return 'resume';
    }
    
    // Job description detection
    if (lowerText.includes('requirements') || 
        lowerText.includes('responsibilities') ||
        lowerText.includes('qualifications')) {
      return 'job_description';
    }
    
    return 'generic_text';
  };

  const handleTextChange = (text: string) => {
    setPastedText(text);
    if (text.length > 50) {
      const format = detectContentFormat(text);
      setDetectedFormat(format);
    } else {
      setDetectedFormat(null);
    }
  };

  const processText = async () => {
    if (!pastedText.trim()) {
      toast.error('Please paste some content first');
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await parseTextContent(pastedText);
      
      if (result.success && result.extractedData) {
        setExtractedPreview(result.extractedData);
        toast.success('Content parsed successfully!');
      } else {
        toast.error(result.error || 'Failed to parse content');
      }
    } catch (error) {
      toast.error('Failed to process content');
    } finally {
      setIsProcessing(false);
    }
  };

  const useExtractedData = () => {
    if (extractedPreview) {
      onDataExtracted(extractedPreview);
      toast.success('Resume data applied successfully!');
    }
  };

  const clearData = () => {
    setPastedText('');
    setDetectedFormat(null);
    setExtractedPreview(null);
  };

  const getFormatInfo = (format: string) => {
    switch (format) {
      case 'linkedin':
        return {
          icon: <Linkedin className="h-4 w-4" />,
          label: 'LinkedIn Profile',
          color: 'bg-blue-100 text-blue-800',
          description: 'LinkedIn profile content detected'
        };
      case 'resume':
        return {
          icon: <FileText className="h-4 w-4" />,
          label: 'Resume Text',
          color: 'bg-green-100 text-green-800',
          description: 'Resume format detected'
        };
      case 'job_description':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Job Description',
          color: 'bg-yellow-100 text-yellow-800',
          description: 'This appears to be a job description'
        };
      default:
        return {
          icon: <FileText className="h-4 w-4" />,
          label: 'Generic Text',
          color: 'bg-gray-100 text-gray-800',
          description: 'Generic text content'
        };
    }
  };

  if (extractedPreview) {
    return (
      <Card className={`border-2 border-green-200 bg-green-50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-green-900">
            <CheckCircle className="mr-2 h-5 w-5" />
            Content Processed Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-3">Extracted Information:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {extractedPreview.personalInfo?.fullName && (
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <p className="text-gray-900">{extractedPreview.personalInfo.fullName}</p>
                </div>
              )}
              
              {extractedPreview.personalInfo?.email && (
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="text-gray-900">{extractedPreview.personalInfo.email}</p>
                </div>
              )}
              
              {extractedPreview.experience?.length > 0 && (
                <div>
                  <span className="font-medium text-gray-600">Experience:</span>
                  <p className="text-gray-900">{extractedPreview.experience.length} positions found</p>
                </div>
              )}
              
              {extractedPreview.skills?.length > 0 && (
                <div>
                  <span className="font-medium text-gray-600">Skills:</span>
                  <p className="text-gray-900">{extractedPreview.skills.length} skills identified</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <Button 
              variant="outline"
              onClick={clearData}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              Start Over
            </Button>
            
            <Button 
              onClick={useExtractedData}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Apply to Resume
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardPaste className="mr-2 h-5 w-5" />
          Paste & Parse Content
        </CardTitle>
        <p className="text-sm text-gray-600">
          Paste resume text, LinkedIn profile, or any career content for AI parsing
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={pastedText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste your resume text, LinkedIn profile content, or any career-related content here..."
            className="min-h-[200px] resize-y"
            disabled={isProcessing}
          />
          
          {detectedFormat && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Detected format:</span>
              <Badge className={getFormatInfo(detectedFormat).color}>
                {getFormatInfo(detectedFormat).icon}
                <span className="ml-1">{getFormatInfo(detectedFormat).label}</span>
              </Badge>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {pastedText.length} characters
          </div>
          
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={clearData}
              disabled={!pastedText || isProcessing}
            >
              Clear
            </Button>
            
            <Button
              onClick={processText}
              disabled={!pastedText.trim() || isProcessing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isProcessing ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Parse with AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 mb-2 text-sm">💡 Quick Tips:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Copy your entire LinkedIn profile for comprehensive extraction</li>
            <li>• Paste resume text from PDFs or Word documents</li>
            <li>• Include contact information for better parsing accuracy</li>
            <li>• The AI will enhance and structure your content automatically</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
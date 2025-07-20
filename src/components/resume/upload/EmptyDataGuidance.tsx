import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText, Image, RefreshCw, Upload } from 'lucide-react';

interface EmptyDataGuidanceProps {
  extractedText: string;
  extractionMethod: string;
  onRetry: () => void;
  onUploadNew: () => void;
}

export const EmptyDataGuidance: React.FC<EmptyDataGuidanceProps> = ({
  extractedText,
  extractionMethod,
  onRetry,
  onUploadNew
}) => {
  const getGuidanceContent = () => {
    const textLength = extractedText.trim().length;
    
    if (textLength === 0) {
      return {
        title: "No Content Found",
        description: "We couldn't extract any readable text from your file.",
        icon: <FileText className="h-8 w-8 text-red-500" />,
        issues: [
          "The file might be corrupted or empty",
          "The file format might not be supported properly",
          "The file might be password-protected"
        ],
        solutions: [
          "Try uploading a different version of your resume",
          "Convert your resume to PDF or Word format",
          "Make sure the file isn't password-protected",
          "Use our resume builder to create a new resume"
        ]
      };
    }
    
    if (textLength < 100) {
      return {
        title: "Very Little Content Found",
        description: "We found some text but it's very minimal for a complete resume.",
        icon: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
        issues: [
          "The resume might be mostly images",
          "Important sections might be in image format",
          "The file might be partially corrupted"
        ],
        solutions: [
          "Try using a text-based resume template",
          "Convert images to text using OCR software",
          "Recreate your resume in a word processor",
          "Use our resume builder for best results"
        ]
      };
    }

    if (extractionMethod === 'ocr') {
      return {
        title: "OCR Processing Issues",
        description: "We used image recognition but couldn't organize the content properly.",
        icon: <Image className="h-8 w-8 text-blue-500" />,
        issues: [
          "The image quality might be too low",
          "The text layout is complex for OCR",
          "Special formatting is causing confusion"
        ],
        solutions: [
          "Try uploading a higher resolution file",
          "Use a simpler resume template",
          "Convert to a text-based format",
          "Manually create a new resume"
        ]
      };
    }

    return {
      title: "Content Organization Issues",
      description: "We found text but couldn't identify the different resume sections.",
      icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
      issues: [
        "The resume format might be non-standard",
        "Section headers might not be clear",
        "The content might be heavily formatted"
      ],
      solutions: [
        "Use standard section headers (Experience, Education, Skills)",
        "Try a simpler resume format",
        "Remove complex formatting or graphics",
        "Use our resume builder for optimal formatting"
      ]
    };
  };

  const guidance = getGuidanceContent();

  return (
    <div className="space-y-6">
      {/* Main Issue Card */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            {guidance.icon}
            <div>
              <CardTitle className="text-lg">{guidance.title}</CardTitle>
              <CardDescription className="mt-1">
                {guidance.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* What Went Wrong */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Possible Issues:</h4>
            <ul className="space-y-1">
              {guidance.issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-yellow-500 mt-1">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>

          {/* How to Fix */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommended Solutions:</h4>
            <ul className="space-y-1">
              {guidance.solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-1">✓</span>
                  {solution}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Processing Again
            </Button>
            <Button onClick={onUploadNew} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Different File
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details (Collapsible) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Technical Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Extraction Method:</span>
              <span className="ml-2 capitalize">{extractionMethod}</span>
            </div>
            <div>
              <span className="font-medium">Text Length:</span>
              <span className="ml-2">{extractedText.trim().length} characters</span>
            </div>
          </div>
          
          {extractedText.trim().length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-gray-900 hover:text-gray-700">
                View Extracted Text
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                {extractedText.trim() || 'No text extracted'}
              </div>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Help Resources */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-blue-900 mb-2">Need More Help?</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Check our resume formatting guidelines</li>
            <li>• Use our resume builder for guaranteed compatibility</li>
            <li>• Contact support if you continue having issues</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
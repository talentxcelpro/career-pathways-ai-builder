
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Smartphone, Monitor, Printer, ZoomIn, ZoomOut } from 'lucide-react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface EnhancedPreviewProps {
  resumeData: EnhancedResumeData;
  selectedTemplate: string;
}

export const EnhancedPreview: React.FC<EnhancedPreviewProps> = ({
  resumeData,
  selectedTemplate
}) => {
  const [previewMode, setPreviewMode] = React.useState<'desktop' | 'mobile' | 'print'>('desktop');
  const [zoom, setZoom] = React.useState(100);

  const getPreviewStyles = () => {
    const baseStyles = "transition-all duration-200";
    switch (previewMode) {
      case 'mobile':
        return `${baseStyles} max-w-sm mx-auto`;
      case 'print':
        return `${baseStyles} aspect-[8.5/11] bg-white shadow-lg`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* View Mode Buttons */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('desktop')}
              className="flex-1"
            >
              <Monitor className="h-3 w-3 mr-1" />
              Desktop
            </Button>
            <Button
              size="sm"
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('mobile')}
              className="flex-1"
            >
              <Smartphone className="h-3 w-3 mr-1" />
              Mobile
            </Button>
            <Button
              size="sm"
              variant={previewMode === 'print' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('print')}
              className="flex-1"
            >
              <Printer className="h-3 w-3 mr-1" />
              Print
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Zoom</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-xs w-12 text-center">{zoom}%</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                disabled={zoom >= 150}
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Template Info */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-gray-600">Template</span>
            <Badge variant="outline" className="text-xs capitalize">
              {selectedTemplate}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Preview Area */}
      <Card className="flex-1">
        <CardContent className="p-4">
          <div 
            className={getPreviewStyles()}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[600px] shadow-sm">
              {/* Resume Preview Content */}
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center border-b pb-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {resumeData.personalInfo.fullName || 'Your Name'}
                  </h1>
                  <div className="text-gray-600 space-y-1">
                    <p>{resumeData.personalInfo.email || 'email@example.com'}</p>
                    <p>{resumeData.personalInfo.phone || '+1 (555) 000-0000'}</p>
                    <p>{resumeData.personalInfo.location || 'City, State'}</p>
                  </div>
                </div>

                {/* Professional Summary */}
                {resumeData.professionalSummary.content && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                      Professional Summary
                    </h2>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {resumeData.professionalSummary.content}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                      Work Experience
                    </h2>
                    <div className="space-y-4">
                      {resumeData.experience.slice(0, 2).map((exp, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">{exp.title}</h3>
                            <span className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <p className="text-gray-700 font-medium">{exp.company}</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {exp.description?.substring(0, 150)}...
                          </p>
                        </div>
                      ))}
                      {resumeData.experience.length > 2 && (
                        <p className="text-xs text-gray-500 italic">
                          And {resumeData.experience.length - 2} more positions...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                      Education
                    </h2>
                    <div className="space-y-2">
                      {resumeData.education.slice(0, 2).map((edu, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                            <span className="text-sm text-gray-600">{edu.endDate}</span>
                          </div>
                          <p className="text-gray-700">{edu.school}</p>
                          {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.slice(0, 8).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill.name}
                        </Badge>
                      ))}
                      {resumeData.skills.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{resumeData.skills.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-900">
              Resume Completeness
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: '75%' }}
              ></div>
            </div>
            <p className="text-xs text-gray-600">75% Complete</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

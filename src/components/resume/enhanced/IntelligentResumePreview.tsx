
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, Share, Smartphone, Monitor, FileText } from 'lucide-react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface IntelligentResumePreviewProps {
  data: EnhancedResumeData;
  template: string;
  customization: any;
  compact?: boolean;
}

export const IntelligentResumePreview: React.FC<IntelligentResumePreviewProps> = ({
  data,
  template,
  customization,
  compact = false
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'print'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getTemplateStyles = () => {
    const baseStyles = "w-full h-full bg-white";
    
    switch (template) {
      case 'modern-professional':
        return `${baseStyles} font-sans`;
      case 'creative':
        return `${baseStyles} font-serif`;
      case 'minimal':
        return `${baseStyles} font-mono`;
      default:
        return baseStyles;
    }
  };

  const getViewModeStyles = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-xs mx-auto';
      case 'print':
        return 'max-w-[8.5in] mx-auto';
      default:
        return 'w-full';
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="aspect-[8.5/11] bg-white border rounded-lg overflow-hidden shadow-sm">
          <div className={`${getTemplateStyles()} p-4 text-xs`}>
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold text-gray-900">
                {data.personalInfo.fullName || 'Your Name'}
              </h1>
              <div className="text-gray-600 space-y-1">
                <div>{data.personalInfo.email}</div>
                <div>{data.personalInfo.phone}</div>
                <div>{data.personalInfo.location}</div>
              </div>
            </div>

            {data.personalInfo.summary && (
              <div className="mb-4">
                <h2 className="font-bold text-sm mb-2 border-b border-gray-300">
                  Professional Summary
                </h2>
                <p className="text-gray-700 text-xs leading-relaxed">
                  {data.personalInfo.summary}
                </p>
              </div>
            )}

            {data.experience && data.experience.length > 0 && (
              <div className="mb-4">
                <h2 className="font-bold text-sm mb-2 border-b border-gray-300">
                  Experience
                </h2>
                <div className="space-y-3">
                  {data.experience.slice(0, 2).map((exp, index) => (
                    <div key={index}>
                      <div className="font-medium text-xs">{exp.title}</div>
                      <div className="text-gray-600 text-xs">
                        {exp.company} • {exp.startDate} - {exp.endDate || 'Present'}
                      </div>
                      <div className="text-gray-700 text-xs mt-1 line-clamp-2">
                        {exp.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.skills && data.skills.length > 0 && (
              <div className="mb-4">
                <h2 className="font-bold text-sm mb-2 border-b border-gray-300">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-1">
                  {data.skills.slice(0, 8).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {data.education && data.education.length > 0 && (
              <div>
                <h2 className="font-bold text-sm mb-2 border-b border-gray-300">
                  Education
                </h2>
                <div className="space-y-2">
                  {data.education.slice(0, 1).map((edu, index) => (
                    <div key={index}>
                      <div className="font-medium text-xs">{edu.degree}</div>
                      <div className="text-gray-600 text-xs">
                        {edu.school} • {edu.endDate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'desktop' ? 'default' : 'outline'}
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'mobile' ? 'default' : 'outline'}
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'print' ? 'default' : 'outline'}
            onClick={() => setViewMode('print')}
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          <Eye className="w-4 h-4 mr-2" />
          {isFullscreen ? 'Exit' : 'Fullscreen'}
        </Button>
      </div>

      {/* Preview Area */}
      <div className={`border rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 bg-gray-100' : 'h-[600px]'}`}>
        <div className="h-full overflow-auto p-4 bg-gray-100">
          <div className={`${getViewModeStyles()} aspect-[8.5/11] bg-white shadow-lg rounded-lg overflow-hidden`}>
            <div className={`${getTemplateStyles()} p-8`}>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {data.personalInfo.fullName || 'Your Name'}
                </h1>
                <div className="text-gray-600 space-y-1">
                  <div className="flex justify-center gap-4">
                    <span>{data.personalInfo.email}</span>
                    <span>{data.personalInfo.phone}</span>
                  </div>
                  <div>{data.personalInfo.location}</div>
                  {data.personalInfo.linkedin && (
                    <div>{data.personalInfo.linkedin}</div>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              {data.personalInfo.summary && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3 border-b-2 border-blue-600 pb-1">
                    Professional Summary
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {data.personalInfo.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {data.experience && data.experience.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3 border-b-2 border-blue-600 pb-1">
                    Professional Experience
                  </h2>
                  <div className="space-y-6">
                    {data.experience.map((exp, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{exp.title}</h3>
                            <p className="text-blue-600 font-medium">{exp.company}</p>
                          </div>
                          <div className="text-gray-600 text-right">
                            <div>{exp.startDate} - {exp.endDate || 'Present'}</div>
                            <div>{exp.location}</div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{exp.description}</p>
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {exp.achievements.map((achievement, achIndex) => (
                              <li key={achIndex}>{achievement}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {data.skills && data.skills.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3 border-b-2 border-blue-600 pb-1">
                    Skills
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Group skills by category */}
                    {Array.from(new Set(data.skills.map(s => s.category))).map((category) => (
                      <div key={category}>
                        <h3 className="font-semibold text-gray-800 mb-2 capitalize">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {data.skills
                            .filter(skill => skill.category === category)
                            .map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {data.education && data.education.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3 border-b-2 border-blue-600 pb-1">
                    Education
                  </h2>
                  <div className="space-y-4">
                    {data.education.map((edu, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{edu.degree}</h3>
                          <p className="text-blue-600 font-medium">{edu.school}</p>
                          {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                        </div>
                        <div className="text-gray-600 text-right">
                          <div>{edu.endDate}</div>
                          <div>{edu.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {data.projects && data.projects.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3 border-b-2 border-blue-600 pb-1">
                    Projects
                  </h2>
                  <div className="space-y-4">
                    {data.projects.map((project, index) => (
                      <div key={index}>
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className="text-gray-700 mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="outline">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

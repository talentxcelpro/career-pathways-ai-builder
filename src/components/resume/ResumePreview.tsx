import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Share, Edit, Maximize2 } from 'lucide-react';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    linkedin?: string;
    website?: string;
  };
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements?: string[];
    technologies?: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    honors?: string;
    relevantCoursework?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    tools: string[];
  };
  projects: Array<{
    title: string;
    description: string;
    technologies?: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
    github?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
  }>;
  awards: Array<{
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
}

interface ResumePreviewProps {
  resumeData: ResumeData;
  template?: string;
  onEdit?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  fullscreen?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData,
  template = 'modern',
  onEdit,
  onExport,
  onShare,
  fullscreen = false
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.toLowerCase() === 'present') return 'Present';
    
    // Handle different date formats
    if (dateStr.includes('-')) {
      const [year, month] = dateStr.split('-');
      return `${month}/${year}`;
    }
    return dateStr;
  };

  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return <ModernTemplate resumeData={resumeData} />;
      case 'classic':
        return <ClassicTemplate resumeData={resumeData} />;
      case 'creative':
        return <CreativeTemplate resumeData={resumeData} />;
      case 'executive':
        return <ExecutiveTemplate resumeData={resumeData} />;
      case 'technical':
        return <TechnicalTemplate resumeData={resumeData} />;
      case 'academic':
        return <AcademicTemplate resumeData={resumeData} />;
      default:
        return <ModernTemplate resumeData={resumeData} />;
    }
  };

  if (fullscreen) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Resume Preview</h1>
            <div className="flex gap-2">
              {onEdit && (
                <Button onClick={onEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onExport && (
                <Button onClick={onExport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              )}
              {onShare && (
                <Button onClick={onShare} variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {renderTemplate()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Resume Preview
          </h3>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.open(`/resume-preview/${template}`, '_blank')}
              variant="outline" 
              size="sm"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            {onEdit && (
              <Button onClick={onEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Button onClick={onExport} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto transform scale-75 origin-top-left">
          {renderTemplate()}
        </div>
      </CardContent>
    </Card>
  );
};

// Modern Template Component
const ModernTemplate: React.FC<{ resumeData: ResumeData }> = ({ resumeData }) => (
  <div className="max-w-4xl mx-auto bg-white">
    {/* Header */}
    <div className="bg-blue-600 text-white p-8">
      <h1 className="text-4xl font-bold mb-2">{resumeData.personalInfo.fullName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>{resumeData.personalInfo.email}</div>
        <div>{resumeData.personalInfo.phone}</div>
        <div>{resumeData.personalInfo.location}</div>
      </div>
      {resumeData.personalInfo.linkedin && (
        <div className="mt-2 text-sm">{resumeData.personalInfo.linkedin}</div>
      )}
    </div>

    <div className="p-8">
      {/* Summary */}
      {resumeData.personalInfo.summary && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4 border-b-2 border-blue-200">Professional Summary</h2>
          <p className="text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resumeData.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4 border-b-2 border-blue-200">Work Experience</h2>
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold">{exp.title}</h3>
                  <p className="text-lg text-blue-600">{exp.company}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{exp.location}</div>
                  <div>{exp.startDate} - {exp.endDate}</div>
                </div>
              </div>
              <p className="text-gray-700 mb-3">{exp.description}</p>
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              )}
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {exp.technologies.map((tech, i) => (
                    <Badge key={i} variant="secondary">{tech}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 border-b-2 border-blue-200">Skills</h2>
        <div className="space-y-4">
          {resumeData.skills.technical.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.technical.map((skill, i) => (
                  <Badge key={i} variant="default">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          {resumeData.skills.soft.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Soft Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.soft.map((skill, i) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Education */}
      {resumeData.education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4 border-b-2 border-blue-200">Education</h2>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-blue-600">{edu.school}</p>
                  {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{edu.location}</div>
                  <div>{edu.startDate} - {edu.endDate}</div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {resumeData.projects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4 border-b-2 border-blue-200">Projects</h2>
          {resumeData.projects.map((project, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-gray-700 mb-2">{project.description}</p>
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, i) => (
                    <Badge key={i} variant="outline">{tech}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  </div>
);

// Placeholder templates - these would be fully implemented
const ClassicTemplate: React.FC<{ resumeData: ResumeData }> = ({ resumeData }) => (
  <div className="font-serif">
    <ModernTemplate resumeData={resumeData} />
  </div>
);

const CreativeTemplate: React.FC<{ resumeData: ResumeData }> = ({ resumeData }) => (
  <div className="bg-gradient-to-br from-purple-50 to-pink-50">
    <ModernTemplate resumeData={resumeData} />
  </div>
);

const ExecutiveTemplate: React.FC<{ resumeData: ResumeData }> = ({ resumeData }) => (
  <div className="font-semibold">
    <ModernTemplate resumeData={resumeData} />
  </div>
);

const TechnicalTemplate: React.FC<{ resumeData: ResumeData }> = ({ resumeData }) => (
  <div className="font-mono text-sm">
    <ModernTemplate resumeData={resumeData} />
  </div>
);

const AcademicTemplate: React.FC<{ resumeData: ResumeData }> = ({ resumeData }) => (
  <div className="text-justify">
    <ModernTemplate resumeData={resumeData} />
  </div>
);

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, GraduationCap, Award, Mail, Phone, MapPin } from 'lucide-react';

interface LivePreviewRendererProps {
  previewData: any;
}

export const LivePreviewRenderer: React.FC<LivePreviewRendererProps> = ({ previewData }) => {
  if (!previewData) return null;

  console.log('🎨 Rendering live preview:', previewData);

  return (
    <div className="space-y-4">
      {/* Personal Info Section */}
      {previewData.personalInfo?.fullName && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {previewData.personalInfo.fullName}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {previewData.personalInfo.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{previewData.personalInfo.email}</span>
                  </div>
                )}
                {previewData.personalInfo.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{previewData.personalInfo.phone}</span>
                  </div>
                )}
                {previewData.personalInfo.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{previewData.personalInfo.location}</span>
                  </div>
                )}
              </div>
              {previewData.personalInfo.summary && (
                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                  {previewData.personalInfo.summary}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Experience Section */}
      {previewData.experience?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-primary" />
              Work Experience ({previewData.totalExperience || previewData.experience.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewData.experience.map((exp: any, index: number) => (
              <div key={index} className="border-l-2 border-gray-200 pl-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                  <span className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">{exp.company}</p>
                {exp.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{exp.description}</p>
                )}
              </div>
            ))}
            {previewData.totalExperience > 3 && (
              <div className="text-xs text-gray-500 italic text-center pt-2 border-t">
                +{previewData.totalExperience - 3} more positions detected
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Education Section */}
      {previewData.education?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
              Education ({previewData.totalEducation || previewData.education.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {previewData.education.map((edu: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                  <span className="text-sm text-gray-500">{edu.endDate}</span>
                </div>
                <p className="text-sm text-gray-700">{edu.school}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Skills Section */}
      {previewData.skills?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Skills & Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {previewData.skills.map((skill: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Processing Info */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Extraction Method:</span>
              <br />
              {previewData.metadata?.extractionMethod || 'Enhanced AI Parsing'}
            </div>
            {previewData.atsScore && (
              <div>
                <span className="font-medium">ATS Score:</span>
                <br />
                <span className="text-lg font-bold text-green-600">{previewData.atsScore}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

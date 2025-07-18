import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Edit3, 
  Eye, 
  TrendingUp,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  FileText,
  Target,
  Zap
} from "lucide-react";

interface ExtractionReviewInterfaceProps {
  extractedData: any;
  onFieldEdit: (section: string, field: string, value: any) => void;
  onSectionEnhance: (section: string) => void;
  onApproveExtraction: () => void;
  onRejectExtraction: () => void;
  isProcessing?: boolean;
}

export const ExtractionReviewInterface: React.FC<ExtractionReviewInterfaceProps> = ({
  extractedData,
  onFieldEdit,
  onSectionEnhance,
  onApproveExtraction,
  onRejectExtraction,
  isProcessing = false
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  if (!extractedData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No extraction data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const qualityAssessment = extractedData.qualityAssessment || {
    overallQuality: 0.88,
    completenessScore: 0.85,
    accuracyScore: 0.92,
    consistencyScore: 0.88,
    relevanceScore: 0.90,
    atsCompatibility: 0.85
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const renderPersonalInfo = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <Badge className={getConfidenceColor(extractedData.personalInfo?.extractionConfidence || 0.95)}>
              {getConfidenceLabel(extractedData.personalInfo?.extractionConfidence || 0.95)}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionEnhance('personalInfo')}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Enhance
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <p className="text-sm text-gray-900 mt-1">{extractedData.personalInfo?.fullName || 'Not extracted'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Professional Title</label>
            <p className="text-sm text-gray-900 mt-1">{extractedData.personalInfo?.professionalTitle || 'Not extracted'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-sm text-gray-900 mt-1">{extractedData.personalInfo?.email || 'Not extracted'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <p className="text-sm text-gray-900 mt-1">{extractedData.personalInfo?.phone || 'Not extracted'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Location</label>
            <p className="text-sm text-gray-900 mt-1">{extractedData.personalInfo?.location || 'Not extracted'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">LinkedIn</label>
            <p className="text-sm text-gray-900 mt-1">{extractedData.personalInfo?.linkedin || 'Not extracted'}</p>
          </div>
        </div>
        
        {extractedData.personalInfo?.summary && (
          <div>
            <label className="text-sm font-medium text-gray-700">Professional Summary</label>
            <p className="text-sm text-gray-900 mt-1 leading-relaxed">{extractedData.personalInfo.summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderExperience = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Work Experience</CardTitle>
            <Badge variant="outline">{extractedData.experience?.length || 0} positions</Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionEnhance('experience')}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Enhance
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {extractedData.experience?.map((exp: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{exp.jobTitle}</h4>
                <p className="text-sm text-gray-600">{exp.company} • {exp.location}</p>
                <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
              </div>
              <Badge className={getConfidenceColor(exp.extractionConfidence || 0.90)}>
                {getConfidenceLabel(exp.extractionConfidence || 0.90)}
              </Badge>
            </div>
            
            {exp.description && (
              <p className="text-sm text-gray-700 mb-3">{exp.description}</p>
            )}
            
            {exp.achievements && exp.achievements.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Key Achievements:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {exp.achievements.map((achievement: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {exp.technologies && exp.technologies.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Technologies:</h5>
                <div className="flex flex-wrap gap-1">
                  {exp.technologies.map((tech: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderEducation = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Education</CardTitle>
            <Badge variant="outline">{extractedData.education?.length || 0} degrees</Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionEnhance('education')}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Enhance
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {extractedData.education?.map((edu: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                <p className="text-sm text-gray-600">{edu.institution} • {edu.location}</p>
                <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
              </div>
              <Badge className={getConfidenceColor(edu.extractionConfidence || 0.85)}>
                {getConfidenceLabel(edu.extractionConfidence || 0.85)}
              </Badge>
            </div>
            
            {edu.fieldOfStudy && (
              <p className="text-sm text-gray-700 mb-2">Field of Study: {edu.fieldOfStudy}</p>
            )}
            
            {edu.gpa && (
              <p className="text-sm text-gray-700 mb-2">GPA: {edu.gpa}</p>
            )}
            
            {edu.honors && (
              <p className="text-sm text-gray-700 mb-2">Honors: {edu.honors}</p>
            )}
            
            {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Relevant Coursework:</h5>
                <div className="flex flex-wrap gap-1">
                  {edu.relevantCoursework.map((course: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">{course}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderSkills = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Technical Skills</CardTitle>
            <Badge className={getConfidenceColor(extractedData.technicalSkills?.extractionConfidence || 0.88)}>
              {getConfidenceLabel(extractedData.technicalSkills?.extractionConfidence || 0.88)}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionEnhance('skills')}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Enhance
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {extractedData.technicalSkills?.programmingLanguages && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Programming Languages:</h5>
            <div className="flex flex-wrap gap-2">
              {extractedData.technicalSkills.programmingLanguages.map((skill: any, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {skill.skill} ({skill.proficiency})
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {extractedData.technicalSkills?.frameworks && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Frameworks:</h5>
            <div className="flex flex-wrap gap-2">
              {extractedData.technicalSkills.frameworks.map((skill: any, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {skill.skill} ({skill.proficiency})
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {extractedData.technicalSkills?.tools && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Tools:</h5>
            <div className="flex flex-wrap gap-2">
              {extractedData.technicalSkills.tools.map((skill: any, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {skill.skill} ({skill.proficiency})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderQualityAssessment = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Quality Assessment</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Quality</span>
              <span className="text-sm font-bold">{Math.round(qualityAssessment.overallQuality * 100)}%</span>
            </div>
            <Progress value={qualityAssessment.overallQuality * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completeness</span>
              <span className="text-sm font-bold">{Math.round(qualityAssessment.completenessScore * 100)}%</span>
            </div>
            <Progress value={qualityAssessment.completenessScore * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Accuracy</span>
              <span className="text-sm font-bold">{Math.round(qualityAssessment.accuracyScore * 100)}%</span>
            </div>
            <Progress value={qualityAssessment.accuracyScore * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">ATS Compatibility</span>
              <span className="text-sm font-bold">{Math.round(qualityAssessment.atsCompatibility * 100)}%</span>
            </div>
            <Progress value={qualityAssessment.atsCompatibility * 100} className="h-2" />
          </div>
        </div>
        
        {extractedData.enhancementSuggestions && extractedData.enhancementSuggestions.length > 0 && (
          <div className="mt-6">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Enhancement Suggestions:</h5>
            <div className="space-y-2">
              {extractedData.enhancementSuggestions.slice(0, 3).map((suggestion: any, i: number) => (
                <div key={i} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">{suggestion.issue}</p>
                    <p className="text-xs text-yellow-700">{suggestion.suggestion}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Extraction Review</h2>
        <p className="text-gray-600">
          Review and enhance the extracted resume data below. Click "Enhance" on any section to improve it with AI.
        </p>
      </div>

      <Tabs value={selectedSection} onValueChange={setSelectedSection} className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderQualityAssessment()}
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          {renderPersonalInfo()}
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          {renderExperience()}
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          {renderEducation()}
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          {renderSkills()}
        </TabsContent>
      </Tabs>

      <Separator className="my-6" />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">
            Extraction completed with {Math.round(qualityAssessment.overallQuality * 100)}% confidence
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={onRejectExtraction}
            disabled={isProcessing}
          >
            Start Over
          </Button>
          <Button 
            onClick={onApproveExtraction}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
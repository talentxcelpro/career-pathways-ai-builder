import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Target, 
  Zap, 
  FileText, 
  Users, 
  Award, 
  Briefcase, 
  GraduationCap,
  Code,
  Star,
  Globe,
  Heart
} from "lucide-react";

export const FeaturesPreview: React.FC = () => {
  const extractionFeatures = [
    {
      icon: <Users className="h-5 w-5 text-blue-600" />,
      title: "Personal Information",
      description: "Name, contact details, location, and professional summary",
      items: ["Full Name", "Email & Phone", "Location", "LinkedIn Profile", "Professional Summary"]
    },
    {
      icon: <Briefcase className="h-5 w-5 text-green-600" />,
      title: "Work Experience",
      description: "Complete employment history with achievements",
      items: ["Job Titles & Companies", "Employment Dates", "Responsibilities", "Key Achievements", "Technologies Used"]
    },
    {
      icon: <GraduationCap className="h-5 w-5 text-purple-600" />,
      title: "Education & Qualifications",
      description: "Academic background and credentials",
      items: ["Degrees & Institutions", "Graduation Dates", "GPA & Honors", "Relevant Coursework", "Academic Projects"]
    },
    {
      icon: <Code className="h-5 w-5 text-orange-600" />,
      title: "Skills & Technologies",
      description: "Technical and soft skills categorization",
      items: ["Technical Skills", "Programming Languages", "Tools & Software", "Soft Skills", "Languages Spoken"]
    },
    {
      icon: <Star className="h-5 w-5 text-yellow-600" />,
      title: "Projects & Certifications",
      description: "Portfolio projects and professional certifications",
      items: ["Project Details", "Technologies Used", "GitHub Links", "Certifications", "Professional Awards"]
    },
    {
      icon: <Heart className="h-5 w-5 text-pink-600" />,
      title: "Additional Sections",
      description: "Volunteer work and other activities",
      items: ["Volunteer Experience", "Publications", "Interests", "References", "Custom Sections"]
    }
  ];

  const aiFeatures = [
    {
      icon: <Brain className="h-4 w-4" />,
      title: "AI-Powered Extraction",
      description: "Advanced AI analyzes and extracts all resume sections"
    },
    {
      icon: <Target className="h-4 w-4" />,
      title: "ATS Optimization",
      description: "Calculates and improves your ATS compatibility score"
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: "Smart Formatting",
      description: "Intelligently preserves and enhances content structure"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Multiple File Types",
      description: "Supports PDF, DOC, DOCX, and TXT formats"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>AI Content Extraction</span>
          </CardTitle>
          <CardDescription>
            Our advanced AI will extract and analyze all sections of your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border">
                  {feature.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{feature.title}</div>
                  <div className="text-sm text-gray-600">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Extraction Details */}
      <Card>
        <CardHeader>
          <CardTitle>What Will Be Extracted</CardTitle>
          <CardDescription>
            Comprehensive analysis of all resume sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {extractionFeatures.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  {section.icon}
                  <div>
                    <h4 className="font-medium text-gray-900">{section.title}</h4>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {section.items.map((item, itemIndex) => (
                    <Badge key={itemIndex} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Fast & Accurate Processing</h4>
              <p className="text-sm text-blue-700">
                Processing typically takes 30-60 seconds depending on resume complexity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Note */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Globe className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-green-900">Secure & Private</h4>
              <p className="text-sm text-green-700">
                Your resume data is processed securely and stored with encryption
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
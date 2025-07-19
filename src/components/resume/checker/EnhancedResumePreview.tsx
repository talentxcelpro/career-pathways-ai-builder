
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, FileText, ExternalLink, Sparkles, ArrowRight, Crown } from 'lucide-react';

interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills?: string[];
}

interface EnhancedResumePreviewProps {
  originalData: ResumeData;
  enhancedData?: ResumeData;
  showEnhanced?: boolean;
}

export const EnhancedResumePreview: React.FC<EnhancedResumePreviewProps> = ({
  originalData,
  enhancedData,
  showEnhanced = true
}) => {
  const [activeTab, setActiveTab] = useState('original');

  const ResumeContent = ({ data, isEnhanced = false }: { data: ResumeData; isEnhanced?: boolean }) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b border-gray-200">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {data?.name?.charAt(0) || 'U'}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {data?.name || 'Your Name'}
        </h2>
        {data?.title && (
          <p className="text-lg text-gray-600 mb-2">{data.title}</p>
        )}
        <div className="flex justify-center space-x-4 text-sm text-gray-600">
          <span>{data?.email || 'email@example.com'}</span>
          <span>•</span>
          <span>{data?.phone || 'Phone Number'}</span>
        </div>
      </div>

      {/* Summary */}
      {data?.summary && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            Professional Summary
            {isEnhanced && <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Enhanced</Badge>}
          </h3>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data?.experience && data.experience.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Professional Experience
            {isEnhanced && <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Optimized</Badge>}
          </h3>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index} className="pb-4 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">{exp.duration}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data?.education && data.education.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
          <div className="space-y-2">
            {data.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                  <p className="text-gray-600 text-sm">{edu.school}</p>
                </div>
                <span className="text-sm text-gray-500">{edu.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data?.skills && data.skills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Key Skills
            {isEnhanced && <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">ATS Optimized</Badge>}
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-gray-50">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Resume Preview
        </CardTitle>
        <p className="text-sm text-gray-600">
          Compare your original resume with TalentXcel's AI-enhanced version
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="original" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Original
            </TabsTrigger>
            <TabsTrigger 
              value="enhanced" 
              className="flex items-center gap-2"
              disabled={!showEnhanced}
            >
              <Sparkles className="h-4 w-4" />
              TalentXcel Enhanced
              {!showEnhanced && <Crown className="h-3 w-3 text-yellow-500" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="original" className="space-y-4">
            <div className="border rounded-lg p-6 bg-white min-h-[500px] max-h-[600px] overflow-y-auto">
              <ResumeContent data={originalData} />
            </div>
          </TabsContent>

          <TabsContent value="enhanced" className="space-y-4">
            {showEnhanced && enhancedData ? (
              <div className="border rounded-lg p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-[500px] max-h-[600px] overflow-y-auto">
                <ResumeContent data={enhancedData} isEnhanced />
              </div>
            ) : (
              <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50 min-h-[500px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Crown className="h-16 w-16 text-purple-500 mx-auto" />
                  <h3 className="text-xl font-bold text-purple-900">
                    Unlock Enhanced Resume
                  </h3>
                  <p className="text-purple-700 max-w-md">
                    See how TalentXcel AI can transform your resume with optimized content, ATS-friendly formatting, and industry-specific enhancements.
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade to See Enhanced Version
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t">
          <Button className="w-full" size="lg">
            <FileText className="h-4 w-4 mr-2" />
            Edit with TalentXcel Builder
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Templates
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Powered by TalentXcel AI Resume Technology
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, FileText, ExternalLink, Sparkles, Crown } from 'lucide-react';

interface EnhancedResumePreviewProps {
  originalContent?: any;
  enhancedContent?: any;
}

const TEMPLATE_STYLES = [
  { 
    id: 'talentxcel-modern', 
    name: 'TalentXcel Modern', 
    color: 'bg-gradient-to-br from-blue-100 to-blue-200',
    premium: false,
    description: 'Clean, modern design with subtle colors'
  },
  { 
    id: 'talentxcel-executive', 
    name: 'TalentXcel Executive', 
    color: 'bg-gradient-to-br from-gray-100 to-gray-200',
    premium: true,
    description: 'Professional layout for senior positions'
  },
  { 
    id: 'talentxcel-creative', 
    name: 'TalentXcel Creative', 
    color: 'bg-gradient-to-br from-purple-100 to-pink-200',
    premium: true,
    description: 'Eye-catching design for creative roles'
  },
  { 
    id: 'talentxcel-minimalist', 
    name: 'TalentXcel Minimalist', 
    color: 'bg-gradient-to-br from-green-100 to-green-200',
    premium: false,
    description: 'Simple, elegant design that focuses on content'
  },
  { 
    id: 'talentxcel-tech', 
    name: 'TalentXcel Tech', 
    color: 'bg-gradient-to-br from-indigo-100 to-purple-200',
    premium: true,
    description: 'Perfect for tech and engineering roles'
  }
];

export const EnhancedResumePreview: React.FC<EnhancedResumePreviewProps> = ({ 
  originalContent, 
  enhancedContent 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('talentxcel-modern');
  const [activeTab, setActiveTab] = useState('enhanced');

  const handleEditWithTemplate = () => {
    window.open(`/resume-builder/new?template=${selectedTemplate}`, '_blank');
  };

  const handleDownloadPDF = () => {
    console.log('Downloading PDF with template:', selectedTemplate);
  };

  const PreviewContent = ({ isEnhanced = false }: { isEnhanced?: boolean }) => (
    <div className="border rounded-lg bg-white min-h-[500px] shadow-sm">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pb-4 border-b">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600">
              {enhancedContent?.name?.charAt(0) || 'J'}
            </span>
          </div>
          <h1 className="text-2xl font-bold">
            {enhancedContent?.name || 'John Doe'}
          </h1>
          <p className="text-lg text-gray-600">
            {enhancedContent?.title || 'Software Engineer'}
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <span>{enhancedContent?.email || 'john.doe@email.com'}</span>
            <span>{enhancedContent?.phone || '(555) 123-4567'}</span>
            <span>{enhancedContent?.location || 'San Francisco, CA'}</span>
          </div>
        </div>

        {/* Professional Summary */}
        {isEnhanced && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold border-b-2 border-blue-500 inline-block">
              Professional Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Results-driven Software Engineer with 5+ years of experience developing scalable web applications. 
              Proven track record of increasing team productivity by 40% and reducing deployment time by 60% 
              through implementation of modern development practices and CI/CD pipelines.
            </p>
          </div>
        )}

        {/* Experience */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold border-b-2 border-blue-500 inline-block">
            Experience
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Senior Software Engineer</h3>
                  <p className="text-gray-600">TechCorp Inc.</p>
                </div>
                <span className="text-sm text-gray-500">2022 - Present</span>
              </div>
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                {isEnhanced ? (
                  <>
                    <li>Led development of customer portal, increasing user engagement by 35%</li>
                    <li>Implemented automated testing suite, reducing bug reports by 50%</li>
                    <li>Mentored 3 junior developers, improving team code quality metrics by 25%</li>
                  </>
                ) : (
                  <>
                    <li>Developed web applications using React and Node.js</li>
                    <li>Worked with team to build customer portal</li>
                    <li>Helped junior developers with code reviews</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Software Engineer</h3>
                  <p className="text-gray-600">StartupCo</p>
                </div>
                <span className="text-sm text-gray-500">2020 - 2022</span>
              </div>
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                {isEnhanced ? (
                  <>
                    <li>Built e-commerce platform serving 10,000+ daily active users</li>
                    <li>Optimized database queries, reducing page load time by 40%</li>
                  </>
                ) : (
                  <>
                    <li>Built e-commerce website</li>
                    <li>Worked on database optimization</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold border-b-2 border-blue-500 inline-block">
            Technical Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {(isEnhanced ? 
              ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'Jest', 'CI/CD'] :
              ['React', 'JavaScript', 'Node.js', 'HTML', 'CSS']
            ).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold border-b-2 border-blue-500 inline-block">
            Education
          </h2>
          <div>
            <h3 className="font-semibold">Bachelor of Science in Computer Science</h3>
            <p className="text-gray-600">University of California, Berkeley</p>
            <span className="text-sm text-gray-500">2020</span>
          </div>
        </div>
      </div>
      
      {/* Template watermark */}
      <div className="text-center text-xs text-gray-400 py-2 border-t bg-gray-50">
        {TEMPLATE_STYLES.find(t => t.id === selectedTemplate)?.name} Template
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Resume Preview & Templates
        </CardTitle>
        <p className="text-sm text-gray-600">
          See how your resume looks with TalentXcel's professional templates
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Choose Your Template</label>
          <div className="grid grid-cols-1 gap-3">
            {TEMPLATE_STYLES.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate === template.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTemplate(template.id)}
                className="justify-start h-auto p-3"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-8 h-6 rounded ${template.color} flex-shrink-0`}></div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{template.name}</span>
                      {template.premium && <Crown className="h-3 w-3 text-yellow-500" />}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Preview Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="original">Original</TabsTrigger>
            <TabsTrigger value="enhanced" className="flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              TalentXcel Enhanced
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="original" className="mt-4">
            <PreviewContent isEnhanced={false} />
          </TabsContent>
          
          <TabsContent value="enhanced" className="mt-4">
            <PreviewContent isEnhanced={true} />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={handleEditWithTemplate} className="w-full" size="lg">
            <Sparkles className="h-4 w-4 mr-2" />
            Build with TalentXcel Builder
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleDownloadPDF} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="ghost" size="sm" className="text-blue-600">
              <ExternalLink className="h-4 w-4 mr-2" />
              All Templates
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-center text-gray-500 pt-4 border-t">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3 text-blue-500" />
            <span>Powered by TalentXcel AI Resume Technology</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

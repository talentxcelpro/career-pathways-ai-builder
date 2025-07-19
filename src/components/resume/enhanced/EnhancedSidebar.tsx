
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Move, 
  Palette, 
  Type, 
  Sparkles, 
  CheckCircle, 
  Download, 
  Share2, 
  History, 
  Settings,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Languages,
  Heart,
  Book,
  Wrench,
  Users
} from 'lucide-react';

interface EnhancedSidebarProps {
  onAddSection: (sectionType: string) => void;
  onRearrangeSections: () => void;
  onTemplateChange: (templateId: string) => void;
  onDesignChange: (designOption: string) => void;
  onAIImprovement: () => void;
  onATSCheck: () => void;
  onExport: () => void;
  onShare: () => void;
  selectedTemplate: string;
  atsScore: number;
  isLoading?: boolean;
}

const sectionTypes = [
  { id: 'experience', label: 'Work Experience', icon: <Briefcase className="h-4 w-4" />, popular: true },
  { id: 'education', label: 'Education', icon: <GraduationCap className="h-4 w-4" />, popular: true },
  { id: 'skills', label: 'Skills', icon: <Code className="h-4 w-4" />, popular: true },
  { id: 'projects', label: 'Projects', icon: <FileText className="h-4 w-4" />, popular: false },
  { id: 'certifications', label: 'Certifications', icon: <Award className="h-4 w-4" />, popular: false },
  { id: 'languages', label: 'Languages', icon: <Languages className="h-4 w-4" />, popular: false },
  { id: 'awards', label: 'Awards', icon: <Award className="h-4 w-4" />, popular: false },
  { id: 'volunteer', label: 'Volunteer Work', icon: <Heart className="h-4 w-4" />, popular: false },
  { id: 'publications', label: 'Publications', icon: <Book className="h-4 w-4" />, popular: false },
  { id: 'references', label: 'References', icon: <Users className="h-4 w-4" />, popular: false },
  { id: 'tools', label: 'Tools & Software', icon: <Wrench className="h-4 w-4" />, popular: false },
];

const templates = [
  { id: 'modern', name: 'Modern Tech', color: 'bg-blue-100' },
  { id: 'executive', name: 'Executive', color: 'bg-gray-100' },
  { id: 'creative', name: 'Creative', color: 'bg-purple-100' },
  { id: 'minimalist', name: 'Minimalist', color: 'bg-green-100' },
];

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  onAddSection,
  onRearrangeSections,
  onTemplateChange,
  onDesignChange,
  onAIImprovement,
  onATSCheck,
  onExport,
  onShare,
  selectedTemplate,
  atsScore,
  isLoading = false
}) => {
  const [expandedSection, setExpandedSection] = useState<string>('add');

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? '' : sectionId);
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Resume Builder</h2>
          <p className="text-sm text-gray-600">Customize your resume</p>
        </div>

        {/* Add Section */}
        <Card>
          <CardHeader 
            className="cursor-pointer pb-3"
            onClick={() => toggleSection('add')}
          >
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Section
              </div>
              <Badge variant="secondary" className="text-xs">
                {sectionTypes.filter(s => s.popular).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          {expandedSection === 'add' && (
            <CardContent className="pt-0 space-y-2">
              <div className="text-xs text-gray-600 mb-3">Popular sections</div>
              {sectionTypes.filter(s => s.popular).map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddSection(section.id)}
                  className="w-full justify-start text-sm"
                >
                  {section.icon}
                  <span className="ml-2">{section.label}</span>
                </Button>
              ))}
              <Separator className="my-2" />
              <div className="text-xs text-gray-600 mb-2">More sections</div>
              {sectionTypes.filter(s => !s.popular).map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddSection(section.id)}
                  className="w-full justify-start text-sm"
                >
                  {section.icon}
                  <span className="ml-2">{section.label}</span>
                </Button>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Rearrange Sections */}
        <Card>
          <CardContent className="p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onRearrangeSections}
              className="w-full justify-start"
            >
              <Move className="h-4 w-4 mr-2" />
              Rearrange Sections
            </Button>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader 
            className="cursor-pointer pb-3"
            onClick={() => toggleSection('templates')}
          >
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Templates
            </CardTitle>
          </CardHeader>
          {expandedSection === 'templates' && (
            <CardContent className="pt-0 space-y-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTemplateChange(template.id)}
                  className="w-full justify-start"
                >
                  <div className={`w-3 h-3 rounded mr-2 ${template.color}`}></div>
                  {template.name}
                </Button>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Design & Fonts */}
        <Card>
          <CardHeader 
            className="cursor-pointer pb-3"
            onClick={() => toggleSection('design')}
          >
            <CardTitle className="text-sm flex items-center gap-2">
              <Type className="h-4 w-4" />
              Design & Fonts
            </CardTitle>
          </CardHeader>
          {expandedSection === 'design' && (
            <CardContent className="pt-0 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDesignChange('colors')}
                className="w-full justify-start"
              >
                <Palette className="h-4 w-4 mr-2" />
                Color Scheme
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDesignChange('fonts')}
                className="w-full justify-start"
              >
                <Type className="h-4 w-4 mr-2" />
                Font Family
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDesignChange('spacing')}
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Spacing
              </Button>
            </CardContent>
          )}
        </Card>

        {/* AI Improvement */}
        <Card>
          <CardContent className="p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onAIImprovement}
              className="w-full justify-start bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100"
              disabled={isLoading}
            >
              <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
              {isLoading ? 'Improving...' : 'AI Improve Text'}
            </Button>
          </CardContent>
        </Card>

        {/* ATS Checker */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">ATS Score</span>
              <Badge className={`text-xs ${getATSScoreColor(atsScore)}`}>
                {atsScore}%
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onATSCheck}
              className="w-full justify-start"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Check ATS Compatibility
            </Button>
          </CardContent>
        </Card>

        {/* Export & Share */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <Button
              size="sm"
              onClick={onExport}
              className="w-full justify-start bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Resume
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="w-full justify-start"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Resume
            </Button>
          </CardContent>
        </Card>

        {/* Version History */}
        <Card>
          <CardContent className="p-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <History className="h-4 w-4 mr-2" />
              Version History
            </Button>
          </CardContent>
        </Card>

        {/* Branding */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Powered by <span className="font-semibold text-blue-600">TalentXcel</span>
          </p>
        </div>
      </div>
    </div>
  );
};

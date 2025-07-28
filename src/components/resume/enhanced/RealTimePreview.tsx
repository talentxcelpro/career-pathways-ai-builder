import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Eye, 
  Palette,
  Type,
  Layout,
  Settings,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimePreviewProps {
  resumeData: any;
  selectedTemplate: string;
  onTemplateChange?: (templateId: string) => void;
  className?: string;
}

export const RealTimePreview: React.FC<RealTimePreviewProps> = ({
  resumeData,
  selectedTemplate,
  onTemplateChange,
  className
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const renderResumeContent = () => {
    const sections = resumeData?.sections || [];
    
    return (
      <div className={cn(
        "w-full min-h-[800px] bg-white text-gray-900 shadow-lg",
        previewTheme === 'dark' && "bg-gray-900 text-white"
      )}>
        {/* Resume Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              {sections.find((s: any) => s.type === 'personal')?.content?.fullName || 'Your Name'}
            </h1>
            <div className="text-sm text-gray-600 space-x-2">
              <span>{sections.find((s: any) => s.type === 'personal')?.content?.email || 'email@example.com'}</span>
              <span>•</span>
              <span>{sections.find((s: any) => s.type === 'personal')?.content?.phone || '+1 (555) 123-4567'}</span>
              <span>•</span>
              <span>{sections.find((s: any) => s.type === 'personal')?.content?.location || 'City, State'}</span>
            </div>
          </div>
        </div>

        {/* Resume Sections */}
        <div className="p-6 space-y-6">
          {sections
            .filter((section: any) => section.isVisible && section.type !== 'personal')
            .sort((a: any, b: any) => a.order - b.order)
            .map((section: any) => (
              <div key={section.id} className="space-y-3">
                <h2 className="text-lg font-semibold uppercase tracking-wide border-b border-gray-300 pb-1">
                  {section.title}
                </h2>
                {renderSectionContent(section)}
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderSectionContent = (section: any) => {
    switch (section.type) {
      case 'summary':
        return (
          <p className="text-sm leading-relaxed text-gray-700">
            {section.content?.text || 'Your professional summary will appear here...'}
          </p>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            {section.content?.items?.map((exp: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm">{exp.title || 'Job Title'}</h3>
                    <p className="text-sm text-gray-600">{exp.company || 'Company Name'}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {exp.startDate || 'Start'} - {exp.endDate || 'End'}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {exp.description || 'Job description and achievements...'}
                </p>
              </div>
            )) || <p className="text-sm text-gray-500">No experience added yet</p>}
          </div>
        );

      case 'education':
        return (
          <div className="space-y-3">
            {section.content?.items?.map((edu: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm">{edu.degree || 'Degree'}</h3>
                    <p className="text-sm text-gray-600">{edu.school || 'School Name'}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {edu.startDate || 'Start'} - {edu.endDate || 'End'}
                  </span>
                </div>
              </div>
            )) || <p className="text-sm text-gray-500">No education added yet</p>}
          </div>
        );

      case 'skills':
        return (
          <div className="flex flex-wrap gap-2">
            {section.content?.items?.map((skill: any, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill.name || 'Skill'}
              </Badge>
            )) || <p className="text-sm text-gray-500">No skills added yet</p>}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            {section.content?.items?.map((item: any, index: number) => (
              <div key={index} className="text-sm">
                <h3 className="font-medium">{item.name || item.title || 'Item'}</h3>
                {item.description && (
                  <p className="text-gray-700">{item.description}</p>
                )}
              </div>
            )) || <p className="text-sm text-gray-500">No items added yet</p>}
          </div>
        );
    }
  };

  const getViewModeClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Preview</CardTitle>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('desktop')}
                className="h-7 w-7 p-0"
              >
                <Monitor className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tablet')}
                className="h-7 w-7 p-0"
              >
                <Tablet className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('mobile')}
                className="h-7 w-7 p-0"
              >
                <Smartphone className="h-3 w-3" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="h-7 w-7 p-0"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-xs min-w-[3rem] text-center">
                {zoomLevel}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                className="h-7 w-7 p-0"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="h-7 w-7 p-0"
            >
              <Palette className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 bg-muted/50">
            <div 
              className={cn(
                "transition-all duration-300 origin-top",
                getViewModeClass()
              )}
              style={{ 
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center'
              }}
            >
              {renderResumeContent()}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
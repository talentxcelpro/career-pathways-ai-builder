import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, X, Share2, Download, Eye, Edit3, Smartphone,
  ChevronLeft, ChevronRight, MoreVertical, Maximize2,
  Minimize2, RotateCcw, Zap, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileResumeViewerProps {
  resumeData: any;
  onEdit?: () => void;
  className?: string;
}

export const MobileResumeViewer: React.FC<MobileResumeViewerProps> = ({
  resumeData,
  onEdit,
  className
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  const sections = [
    { id: 'header', title: 'Header', icon: '👤' },
    { id: 'summary', title: 'Summary', icon: '📝' },
    { id: 'experience', title: 'Experience', icon: '💼' },
    { id: 'skills', title: 'Skills', icon: '🛠️' },
    { id: 'education', title: 'Education', icon: '🎓' },
    { id: 'projects', title: 'Projects', icon: '🚀' }
  ];

  // Touch handlers for section navigation
  const handleTouchStart = useRef({ x: 0, y: 0 });
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!handleTouchStart.current) return;
    
    const xDiff = handleTouchStart.current.x - e.touches[0].clientX;
    const yDiff = handleTouchStart.current.y - e.touches[0].clientY;
    
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 50 && currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      } else if (xDiff < -50 && currentSection > 0) {
        setCurrentSection(currentSection - 1);
      }
    }
  };

  const handleTouchStartCapture = (e: React.TouchEvent) => {
    handleTouchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  // Auto-hide controls
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  return (
    <div className={cn("relative h-screen bg-gray-100 overflow-hidden", className)}>
      {/* Mobile Header */}
      <div className={cn(
        "absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b transition-transform duration-300",
        showControls ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Resume Preview</span>
            <Badge variant="outline" className="text-xs">Mobile</Badge>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="space-y-4 pt-6">
                <Button onClick={onEdit} className="w-full">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Resume
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Section Navigation */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {sections.map((section, index) => (
              <Button
                key={section.id}
                variant={currentSection === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentSection(index)}
                className={cn(
                  "flex-shrink-0 transition-all duration-200",
                  currentSection === index && "bg-blue-600 text-white"
                )}
              >
                <span className="mr-2">{section.icon}</span>
                {section.title}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Content */}
      <div 
        className={cn(
          "absolute inset-0 bg-white transition-all duration-300",
          isFullscreen ? "pt-0" : "pt-32 pb-20"
        )}
        onClick={() => setShowControls(!showControls)}
        onTouchStart={handleTouchStartCapture}
        onTouchMove={handleTouchMove}
      >
        <div className="h-full overflow-y-auto px-4">
          <div className="max-w-md mx-auto py-6 space-y-6">
            {/* Render current section */}
            {currentSection === 0 && (
              <MobileResumeSection title="Personal Information">
                <div className="text-center space-y-3">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
                    {resumeData?.personalInfo?.fullName?.charAt(0) || 'A'}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {resumeData?.personalInfo?.fullName || 'Your Name'}
                  </h1>
                  <p className="text-gray-600">
                    {resumeData?.personalInfo?.email || 'your.email@example.com'}
                  </p>
                  <p className="text-gray-600">
                    {resumeData?.personalInfo?.phone || '+1 (555) 123-4567'}
                  </p>
                  <p className="text-gray-600">
                    {resumeData?.personalInfo?.location || 'Your Location'}
                  </p>
                </div>
              </MobileResumeSection>
            )}

            {currentSection === 1 && (
              <MobileResumeSection title="Professional Summary">
                <p className="text-gray-700 leading-relaxed">
                  {resumeData?.personalInfo?.summary || 
                    'A dedicated professional with a passion for innovation and excellence. Proven track record of delivering results and driving success in dynamic environments.'}
                </p>
              </MobileResumeSection>
            )}

            {currentSection === 2 && (
              <MobileResumeSection title="Experience">
                <div className="space-y-4">
                  {(resumeData?.experience || []).map((exp: any, index: number) => (
                    <Card key={index} className="border-l-4 border-blue-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                        <p className="text-blue-600 font-medium">{exp.company}</p>
                        <p className="text-gray-600 text-sm mb-2">{exp.duration}</p>
                        <p className="text-gray-700 text-sm">{exp.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </MobileResumeSection>
            )}

            {currentSection === 3 && (
              <MobileResumeSection title="Skills">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(resumeData?.skills || []).map((skill: string, index: number) => (
                      <Badge 
                        key={index} 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </MobileResumeSection>
            )}

            {currentSection === 4 && (
              <MobileResumeSection title="Education">
                <div className="space-y-3">
                  {(resumeData?.education || []).map((edu: any, index: number) => (
                    <Card key={index} className="border-l-4 border-green-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                        <p className="text-green-600 font-medium">{edu.school}</p>
                        <p className="text-gray-600 text-sm">{edu.year}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </MobileResumeSection>
            )}

            {currentSection === 5 && (
              <MobileResumeSection title="Projects">
                <div className="space-y-3">
                  {(resumeData?.projects || []).map((project: any, index: number) => (
                    <Card key={index} className="border-l-4 border-purple-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {(project.technologies || []).map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </MobileResumeSection>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t transition-transform duration-300",
        showControls ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex space-x-2">
            {sections.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  currentSection === index ? "bg-blue-600" : "bg-gray-300"
                )}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            disabled={currentSection === sections.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Quick Actions FAB */}
      <div className="absolute bottom-24 right-4 space-y-2">
        <Button
          size="sm"
          className="rounded-full w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          onClick={onEdit}
        >
          <Edit3 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

interface MobileResumeSectionProps {
  title: string;
  children: React.ReactNode;
}

const MobileResumeSection: React.FC<MobileResumeSectionProps> = ({ title, children }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

// Touch-optimized file upload for mobile
export const MobileTouchFileUpload: React.FC<{
  onFileSelect: (files: FileList) => void;
  className?: string;
}> = ({ onFileSelect, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("p-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 touch-manipulation",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50",
          "active:scale-95"
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Resume</h3>
            <p className="text-gray-600 text-sm">
              Tap to select your resume file or drag and drop
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Supports PDF, DOC, DOCX formats
            </p>
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => e.target.files && onFileSelect(e.target.files)}
      />
    </div>
  );
};
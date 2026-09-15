import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, Download, Share2, Eye, Settings, Sparkles, Target, 
  Brain, BarChart3, Clock, Users, Smartphone, Monitor,
  Tablet, History, GitBranch, MessageSquare, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdvancedAIFeatures } from '@/hooks/useAdvancedAIFeatures';
import { useAIResumeEnhancements } from '@/hooks/useAIResumeEnhancements';

interface AppleInspiredResumeEditorProps {
  resumeId: string;
  resumeData: any;
  onSave: (data: any) => void;
  className?: string;
}

export const AppleInspiredResumeEditor: React.FC<AppleInspiredResumeEditorProps> = ({
  resumeId,
  resumeData,
  onSave,
  className
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [atsScore, setAtsScore] = useState(85);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  const {
    performAdvancedATSAnalysis,
    optimizeForSpecificJob,
    generatePerformanceAnalytics,
    isAnalyzing,
    isOptimizing,
    isGeneratingAnalytics
  } = useAdvancedAIFeatures();

  const {
    generateSmartTitles,
    adjustTone,
    optimizeKeywords,
    isGeneratingTitles,
    isAdjustingTone,
    isOptimizingKeywords
  } = useAIResumeEnhancements();

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (resumeData) {
        setIsAutoSaving(true);
        onSave(resumeData);
        setLastSaved(new Date());
        setTimeout(() => setIsAutoSaving(false), 1000);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [resumeData, onSave]);

  const handleAdvancedAnalysis = useCallback(async () => {
    const analysis = await performAdvancedATSAnalysis(resumeData);
    if (analysis) {
      setAtsScore(analysis.overallScore);
    }
  }, [resumeData, performAdvancedATSAnalysis]);

  const handleJobOptimization = useCallback(async () => {
    // This would open a dialog to input job description
    const jobDescription = "Sample job description"; // This would come from user input
    const optimization = await optimizeForSpecificJob(
      resumeData,
      jobDescription,
      "Software Engineer",
      "Technology"
    );
    if (optimization) {
      onSave(optimization.optimizedContent);
    }
  }, [resumeData, optimizeForSpecificJob, onSave]);

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50", className)}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Title and Status */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Resume Editor</h1>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isAutoSaving ? "bg-blue-500 animate-pulse" : "bg-green-500"
                )} />
                <span className="text-sm text-gray-600">
                  {isAutoSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
                </span>
              </div>
            </div>

            {/* Center: View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {[
                { mode: 'desktop', icon: Monitor, label: 'Desktop' },
                { mode: 'tablet', icon: Tablet, label: 'Tablet' },
                { mode: 'mobile', icon: Smartphone, label: 'Mobile' }
              ].map((item) => (
                <Button
                  key={item.mode}
                  variant={viewMode === item.mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(item.mode as any)}
                  className={cn(
                    "rounded-md transition-all duration-200",
                    viewMode === item.mode && "bg-white shadow-sm"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                Version History
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={() => onSave(resumeData)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* AI Assistant Panel */}
          {showAIPanel && (
            <div className="col-span-12 lg:col-span-3">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-600" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* ATS Score */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">ATS Score</span>
                      <Badge className={cn(
                        atsScore >= 90 ? "bg-green-500" : atsScore >= 75 ? "bg-yellow-500" : "bg-red-500"
                      )}>
                        {atsScore}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-500",
                          atsScore >= 90 ? "bg-green-500" : atsScore >= 75 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${atsScore}%` }}
                      />
                    </div>
                  </div>

                  {/* AI Actions */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleAdvancedAnalysis}
                      disabled={isAnalyzing}
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      {isAnalyzing ? 'Analyzing...' : 'Deep ATS Analysis'}
                    </Button>

                    <Button
                      onClick={handleJobOptimization}
                      disabled={isOptimizing}
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isOptimizing ? 'Optimizing...' : 'Job-Specific Optimization'}
                    </Button>

                    <Button
                      onClick={() => generatePerformanceAnalytics(resumeId)}
                      disabled={isGeneratingAnalytics}
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {isGeneratingAnalytics ? 'Generating...' : 'Performance Analytics'}
                    </Button>
                  </div>

                  <Separator />

                  {/* Quick Stats */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-blue-600">24</div>
                        <div className="text-gray-600">Keywords</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-green-600">450</div>
                        <div className="text-gray-600">Words</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-purple-600">1.2</div>
                        <div className="text-gray-600">Pages</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-orange-600">7</div>
                        <div className="text-gray-600">Sections</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Recent Activity</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>Auto-saved 2 min ago</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-3 w-3" />
                        <span>Version 1.3 created</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-3 w-3" />
                        <span>Shared with 2 contacts</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Resume Editor */}
          <div className={cn(
            "col-span-12",
            showAIPanel ? "lg:col-span-9" : "lg:col-span-12"
          )}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-0">
                {/* Resume Preview */}
                <div className={cn(
                  "bg-white rounded-lg shadow-inner transition-all duration-300",
                  viewMode === 'desktop' && "max-w-4xl mx-auto p-8",
                  viewMode === 'tablet' && "max-w-2xl mx-auto p-6",
                  viewMode === 'mobile' && "max-w-md mx-auto p-4"
                )}>
                  {/* Resume content would be rendered here */}
                  <div className="min-h-[800px] space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {resumeData?.personalInfo?.fullName || 'Your Name'}
                      </h1>
                      <p className="text-gray-600">
                        {resumeData?.personalInfo?.email || 'your.email@example.com'} | 
                        {resumeData?.personalInfo?.phone || '+1 (555) 123-4567'}
                      </p>
                    </div>

                    {/* Summary */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
                        Professional Summary
                      </h2>
                      <p className="text-gray-700 leading-relaxed">
                        {resumeData?.personalInfo?.summary || 
                          'Dynamic and results-driven professional with expertise in driving innovation and delivering exceptional outcomes.'}
                      </p>
                    </div>

                    {/* Experience */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
                        Professional Experience
                      </h2>
                      <div className="space-y-4">
                        {(resumeData?.experience || []).map((exp: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                                <p className="text-blue-600">{exp.company}</p>
                              </div>
                              <p className="text-gray-600 text-sm">{exp.duration}</p>
                            </div>
                            <p className="text-gray-700">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
                        Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {(resumeData?.skills || []).map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
                        Education
                      </h2>
                      <div className="space-y-2">
                        {(resumeData?.education || []).map((edu: any, index: number) => (
                          <div key={index} className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                              <p className="text-blue-600">{edu.school}</p>
                            </div>
                            <p className="text-gray-600 text-sm">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collaboration Panel */}
            <Card className="mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Collaboration & Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Share for Review
                  </Button>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Get Expert Review
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Comments (0)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
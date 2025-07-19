
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Sparkles, 
  Settings, 
  History, 
  Plus,
  GripVertical,
  Eye,
  Wand2,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { ResumeLeftSidebar } from "./ResumeLeftSidebar";
import { ResumePreviewPanel } from "./ResumePreviewPanel";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { SectionManager } from "./SectionManager";
import { useAdvancedResumeEditor } from "@/hooks/useAdvancedResumeEditor";

interface EnhancedResumeEditorProps {
  resumeId?: string;
  initialData?: any;
  onSave?: (data: any) => void;
}

export const EnhancedResumeEditor: React.FC<EnhancedResumeEditorProps> = ({
  resumeId,
  initialData,
  onSave
}) => {
  const {
    resumeData,
    aiAnalysis,
    isAnalyzing,
    updateResumeData,
    analyzeResume,
    improveContent,
    saveResume,
    undoLastChange,
    redoLastChange,
    canUndo,
    canRedo
  } = useAdvancedResumeEditor(resumeId, initialData);

  const [activePanel, setActivePanel] = useState<'edit' | 'preview' | 'insights'>('edit');
  const [showSectionManager, setShowSectionManager] = useState(false);

  const overallScore = aiAnalysis?.overallScore || 0;

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Resume Builder</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={undoLastChange}
                disabled={!canUndo}
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redoLastChange}
                disabled={!canRedo}
              >
                <History className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>

          {/* Overall Score */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Resume Score</span>
              <Badge variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}>
                {overallScore}/100
              </Badge>
            </div>
            <Progress value={overallScore} className="h-2" />
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
              <TrendingUp className="h-3 w-3" />
              {overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : "Needs Improvement"}
            </div>
          </div>

          {/* AI Insights Preview */}
          {aiAnalysis && (
            <div className="mb-4 p-3 border border-amber-200 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">AI Insights</span>
              </div>
              <div className="space-y-1">
                {aiAnalysis.criticalIssues?.slice(0, 2).map((issue, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <AlertCircle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-700">{issue.issue}</span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-amber-700 hover:text-amber-800"
                onClick={() => setActivePanel('insights')}
              >
                View All Insights
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          <ResumeLeftSidebar
            resumeData={resumeData}
            onUpdateData={updateResumeData}
            onShowSectionManager={() => setShowSectionManager(true)}
            onAnalyzeResume={analyzeResume}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Button
            onClick={() => saveResume()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Save Resume
          </Button>
          <Button
            variant="outline"
            onClick={() => analyzeResume()}
            disabled={isAnalyzing}
            className="w-full"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <Tabs value={activePanel} onValueChange={(value) => setActivePanel(value as any)}>
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Insights
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSectionManager(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Section
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <GripVertical className="h-4 w-4 mr-1" />
                Rearrange
              </Button>
            </div>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activePanel === 'edit' && (
            <div className="max-w-4xl mx-auto">
              <ResumePreviewPanel
                resumeData={resumeData}
                onUpdateData={updateResumeData}
                onImproveContent={improveContent}
                aiAnalysis={aiAnalysis}
                editable={true}
              />
            </div>
          )}

          {activePanel === 'preview' && (
            <div className="max-w-4xl mx-auto">
              <ResumePreviewPanel
                resumeData={resumeData}
                onUpdateData={updateResumeData}
                onImproveContent={improveContent}
                aiAnalysis={aiAnalysis}
                editable={false}
              />
            </div>
          )}

          {activePanel === 'insights' && (
            <div className="max-w-4xl mx-auto">
              <AIInsightsPanel
                analysis={aiAnalysis}
                resumeData={resumeData}
                onApplyImprovement={(improvement) => {
                  updateResumeData(improvement);
                }}
                onReanalyze={analyzeResume}
                isAnalyzing={isAnalyzing}
              />
            </div>
          )}
        </div>
      </div>

      {/* Section Manager Modal */}
      {showSectionManager && (
        <SectionManager
          resumeData={resumeData}
          onUpdateData={updateResumeData}
          onClose={() => setShowSectionManager(false)}
        />
      )}
    </div>
  );
};

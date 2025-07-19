
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Wand2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Eye,
  EyeOff 
} from "lucide-react";

interface ResumePreviewPanelProps {
  resumeData: any;
  onUpdateData: (updates: any) => void;
  onImproveContent: (content: string, section: string, type?: string) => Promise<any>;
  aiAnalysis?: any;
  editable?: boolean;
}

export const ResumePreviewPanel: React.FC<ResumePreviewPanelProps> = ({
  resumeData,
  onUpdateData,
  onImproveContent,
  aiAnalysis,
  editable = true
}) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState<string | null>(null);

  const handleImproveContent = async (content: string, section: string) => {
    setIsImproving(section);
    try {
      const improvement = await onImproveContent(content, section);
      if (improvement.improvedContent) {
        // Apply the improvement to the resume data
        const updates: any = {};
        if (section === 'summary') {
          updates.personalInfo = {
            ...resumeData.personalInfo,
            summary: improvement.improvedContent
          };
        } else if (section === 'experience') {
          // Handle experience improvement
        }
        onUpdateData(updates);
      }
    } finally {
      setIsImproving(null);
    }
  };

  const getSectionScore = (sectionName: string) => {
    return aiAnalysis?.categories?.[sectionName]?.score || 0;
  };

  const getSectionFeedback = (sectionName: string) => {
    return aiAnalysis?.categories?.[sectionName]?.feedback || '';
  };

  const EditableSection = ({ 
    title, 
    content, 
    sectionKey, 
    onUpdate, 
    multiline = false,
    placeholder = '' 
  }: any) => {
    const isEditing = editingSection === sectionKey;
    const score = getSectionScore(sectionKey);
    const feedback = getSectionFeedback(sectionKey);

    return (
      <div className="group relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            {score > 0 && (
              <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
                {score}/100
              </Badge>
            )}
          </div>
          {editable && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing ? null : sectionKey)}
              >
                {isEditing ? <EyeOff className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleImproveContent(content, sectionKey)}
                disabled={isImproving === sectionKey}
              >
                <Wand2 className={`h-4 w-4 ${isImproving === sectionKey ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        </div>

        {feedback && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
            {feedback}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-2">
            {multiline ? (
              <Textarea
                value={content}
                onChange={(e) => onUpdate(e.target.value)}
                rows={4}
                placeholder={placeholder}
                className="resize-none"
              />
            ) : (
              <Input
                value={content}
                onChange={(e) => onUpdate(e.target.value)}
                placeholder={placeholder}
              />
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setEditingSection(null)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingSection(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose max-w-none">
            {multiline ? (
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {content || placeholder}
              </p>
            ) : (
              <p className="text-slate-700">{content || placeholder}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <EditableSection
              title=""
              content={resumeData.personalInfo?.fullName}
              sectionKey="fullName"
              onUpdate={(value: string) => onUpdateData({
                personalInfo: { ...resumeData.personalInfo, fullName: value }
              })}
              placeholder="Your Full Name"
            />
            
            <EditableSection
              title=""
              content={resumeData.personalInfo?.title}
              sectionKey="title"
              onUpdate={(value: string) => onUpdateData({
                personalInfo: { ...resumeData.personalInfo, title: value }
              })}
              placeholder="Professional Title"
            />

            <div className="flex justify-center items-center gap-6 text-sm text-slate-600">
              <span>{resumeData.personalInfo?.email}</span>
              <span>{resumeData.personalInfo?.phone}</span>
              <span>{resumeData.personalInfo?.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <EditableSection
            title="Professional Summary"
            content={resumeData.personalInfo?.summary}
            sectionKey="summary"
            onUpdate={(value: string) => onUpdateData({
              personalInfo: { ...resumeData.personalInfo, summary: value }
            })}
            multiline={true}
            placeholder="Write a compelling professional summary that highlights your key qualifications and career objectives..."
          />
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-800">Work Experience</h3>
              {getSectionScore('experience') > 0 && (
                <Badge variant={getSectionScore('experience') >= 80 ? "default" : getSectionScore('experience') >= 60 ? "secondary" : "destructive"}>
                  {getSectionScore('experience')}/100
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {resumeData.experience?.map((exp: any, index: number) => (
              <div key={index} className="border-l-2 border-blue-200 pl-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{exp.title}</h4>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                    <p className="text-sm text-slate-500">{exp.startDate} - {exp.endDate || 'Present'}</p>
                    {exp.description && (
                      <div className="mt-2 text-slate-700 leading-relaxed">
                        {exp.description.split('\n').map((line: string, i: number) => (
                          <p key={i} className="mb-1">{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  {editable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleImproveContent(exp.description, 'experience')}
                      disabled={isImproving === `experience-${index}`}
                    >
                      <Wand2 className={`h-4 w-4 ${isImproving === `experience-${index}` ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Skills</h3>
            {getSectionScore('skills') > 0 && (
              <Badge variant={getSectionScore('skills') >= 80 ? "default" : getSectionScore('skills') >= 60 ? "secondary" : "destructive"}>
                {getSectionScore('skills')}/100
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {resumeData.skills?.map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className="px-3 py-1">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      {resumeData.education && resumeData.education.length > 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Education</h3>
              {getSectionScore('education') > 0 && (
                <Badge variant={getSectionScore('education') >= 80 ? "default" : getSectionScore('education') >= 60 ? "secondary" : "destructive"}>
                  {getSectionScore('education')}/100
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              {resumeData.education?.map((edu: any, index: number) => (
                <div key={index}>
                  <h4 className="font-semibold text-slate-800">{edu.degree}</h4>
                  <p className="text-blue-600 font-medium">{edu.school}</p>
                  <p className="text-sm text-slate-500">{edu.year}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {aiAnalysis?.contentSuggestions && aiAnalysis.contentSuggestions.length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-800">AI Recommendations</h3>
            </div>
            
            <div className="space-y-3">
              {aiAnalysis.contentSuggestions.slice(0, 3).map((suggestion: any, index: number) => (
                <div key={index} className="p-3 bg-white border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800">{suggestion.section}</p>
                      <p className="text-sm text-amber-700">{suggestion.reason}</p>
                      {editable && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                          onClick={() => {
                            // Apply the suggestion
                            const updates: any = {};
                            if (suggestion.section === 'summary') {
                              updates.personalInfo = {
                                ...resumeData.personalInfo,
                                summary: suggestion.improved
                              };
                            }
                            onUpdateData(updates);
                          }}
                        >
                          Apply Suggestion
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

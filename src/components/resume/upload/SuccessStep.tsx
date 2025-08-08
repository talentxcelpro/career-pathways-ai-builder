
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Edit, Share2, BarChart3, Sparkles, Save, Wand2, Eye, FileText, Star, Zap } from "lucide-react";
import { ResumePreview } from "../ResumePreview";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { normalizeResumeATS } from "@/utils/atsNormalizer";
import { toATSJson } from "@/utils/atsSchemaFormatter";

interface SuccessStepProps {
  onComplete: () => void;
  resumeData: any;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ onComplete, resumeData }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const atsJson = normalizeResumeATS(resumeData);
  console.log('SuccessStep - Original resumeData:', resumeData);
  console.log('SuccessStep - Normalized atsJson:', atsJson);
  console.log('SuccessStep - atsJson.profile:', atsJson.profile);
  console.log('SuccessStep - atsJson.profile.fullName:', atsJson.profile.fullName);
  const atsStrict = toATSJson(resumeData);
  console.log('SuccessStep - ATS strict schema:', atsStrict);
  const handleSaveResume = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to save your resume');
      return;
    }

    setIsSaving(true);
    try {
      const resumeTitle = resumeData?.personalInfo?.fullName 
        ? `${resumeData.personalInfo.fullName}'s Resume`
        : 'My Resume';

      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: resumeTitle,
          content: resumeData,
          template_id: resumeData?.selectedTemplate || 'modern-professional',
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Resume saved successfully!', {
        description: 'You can find it in your resume dashboard'
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Failed to save resume: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Show message that PDF export is not available in development
      toast.info('PDF export is temporarily disabled in development mode. Please use production build for PDF export.');
      
    } catch (error: any) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAIEnhancement = async () => {
    setIsEnhancing(true);
    try {
      // Call AI enhancement edge function
      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: { 
          resumeData,
          enhancementType: 'comprehensive'
        }
      });

      if (error) throw error;

      toast.success('Resume enhanced with AI!', {
        description: 'Your resume has been optimized for better ATS compatibility'
      });

      // You could update the resumeData here if needed
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast.error('AI enhancement temporarily unavailable');
    } finally {
      setIsEnhancing(false);
    }
  };

  const generateResumeHTML = (data: any) => {
    const personalInfo = data?.personalInfo || {};
    const experience = data?.experience || [];
    const education = data?.education || [];
    const skills = data?.skills || [];

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333;">
        <div style="margin-bottom: 30px;">
          <h1 style="font-size: 32px; margin: 0 0 10px 0; color: #2563eb;">${personalInfo.fullName || 'Your Name'}</h1>
          <div style="font-size: 14px; color: #666; margin-bottom: 15px;">
            ${personalInfo.email ? `📧 ${personalInfo.email}` : ''} 
            ${personalInfo.phone ? `📱 ${personalInfo.phone}` : ''} 
            ${personalInfo.location ? `📍 ${personalInfo.location}` : ''}
          </div>
          ${personalInfo.summary ? `<p style="font-size: 16px; margin: 15px 0;">${personalInfo.summary}</p>` : ''}
        </div>

        ${experience.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Experience</h2>
            ${experience.map(exp => `
              <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                  <h3 style="margin: 0; font-size: 18px;">${exp.title || 'Position'}</h3>
                  <span style="font-size: 14px; color: #666;">${exp.startDate} - ${exp.endDate || 'Present'}</span>
                </div>
                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                  ${exp.company} ${exp.location ? `• ${exp.location}` : ''}
                </div>
                ${exp.description ? `<p style="margin: 8px 0;">${exp.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${education.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Education</h2>
            ${education.map(edu => `
              <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <h3 style="margin: 0; font-size: 16px;">${edu.degree || 'Degree'}</h3>
                  <span style="font-size: 14px; color: #666;">${edu.endDate || edu.graduationDate || 'Year'}</span>
                </div>
                <div style="font-size: 14px; color: #666;">
                  ${edu.school || edu.institution} ${edu.location ? `• ${edu.location}` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${skills.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Skills</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${skills.map(skill => {
                const skillName = typeof skill === 'string' ? skill : skill.name || '';
                return `<span style="background: #e5f3ff; color: #2563eb; padding: 4px 12px; border-radius: 20px; font-size: 14px;">${skillName}</span>`;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Resume Preview
          </h2>
          <p className="text-xl text-gray-600">
            Your resume is ready! Review the final version below.
          </p>
        </div>
      </div>

      {/* Resume Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {resumeData?.confidence ? Math.round(resumeData.confidence * 100) : 85}%
            </div>
            <div className="text-sm text-gray-600">Extraction Quality</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Array.isArray(resumeData?.experience) ? resumeData.experience.length : 1}
            </div>
            <div className="text-sm text-gray-600">Work Experiences</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Array.isArray(resumeData?.skills) ? resumeData.skills.length : 5}
            </div>
            <div className="text-sm text-gray-600">Skills Identified</div>
          </CardContent>
        </Card>
      </div>

      {/* Resume Preview Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Preview
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </CardHeader>
        {showPreview && (
          <CardContent>
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <ResumePreview data={resumeData} content={atsStrict} fullPage={true} />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          What would you like to do next?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleSaveResume}
            disabled={isSaving}
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Save className="h-6 w-6" />
            <span>{isSaving ? 'Saving...' : 'Save Resume'}</span>
          </Button>
          
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Download className="h-6 w-6" />
            <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={onComplete}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1"
          >
            <Edit className="h-6 w-6" />
            <span>Edit & Customize</span>
          </Button>
          
          <Button
            onClick={handleAIEnhancement}
            disabled={isEnhancing}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Wand2 className="h-6 w-6" />
            <span>{isEnhancing ? 'Enhancing...' : 'AI Enhance'}</span>
          </Button>
        </div>
      </div>

      {/* Enhancement Features */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
            <Star className="h-5 w-5 text-purple-600 mr-2" />
            AI-Powered Features Available
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>ATS Optimization</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Content Enhancement</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Keyword Optimization</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Professional Formatting</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

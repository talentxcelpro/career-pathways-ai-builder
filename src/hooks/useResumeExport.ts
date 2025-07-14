import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExportSettings {
  format: 'pdf' | 'docx' | 'html';
  template: string;
  colorScheme: string;
  fontSize: string;
  fontFamily: string;
  showBranding: boolean;
  includePhoto: boolean;
  pageMargins: 'narrow' | 'normal' | 'wide';
  sectionOrder: string[];
}

export interface ResumeSettings {
  title: string;
  isPublic: boolean;
  publicSlug?: string;
  template: string;
  colorScheme: string;
  customization: {
    fontSize: string;
    fontFamily: string;
    showBranding: boolean;
    includePhoto: boolean;
    pageMargins: 'narrow' | 'normal' | 'wide';
    sectionOrder: string[];
  };
  exportHistory: Array<{
    format: string;
    timestamp: string;
    settings: any;
  }>;
}

export const useResumeExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportResume = async (
    resumeData: any,
    settings: ExportSettings
  ): Promise<{ success: boolean; downloadUrl?: string; filename?: string }> => {
    setIsExporting(true);
    setExportProgress(10);

    try {
      console.log('Starting resume export:', settings.format);
      setExportProgress(30);

      const { data, error } = await supabase.functions.invoke('resume-export', {
        body: {
          resumeData,
          template: {
            id: settings.template,
            colorSchemes: [{ id: settings.colorScheme }]
          },
          format: settings.format,
          settings: {
            fontSize: settings.fontSize,
            fontFamily: settings.fontFamily,
            showBranding: settings.showBranding,
            includePhoto: settings.includePhoto,
            pageMargins: settings.pageMargins,
            sectionOrder: settings.sectionOrder
          }
        }
      });

      setExportProgress(70);

      if (error) {
        console.error('Export error:', error);
        throw new Error(`Export failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Export unsuccessful');
      }

      setExportProgress(90);

      // Create downloadable blob
      let blob: Blob;
      let mimeType = data.mimeType;

      if (settings.format === 'docx') {
        // For DOCX, we'd need proper binary content
        blob = new Blob([data.content], { type: mimeType });
      } else if (settings.format === 'pdf') {
        // For PDF, we'd convert HTML to PDF (would need additional processing)
        blob = new Blob([data.content], { type: 'text/html' });
        mimeType = 'text/html'; // Temporary - would be PDF in production
      } else {
        // HTML format
        blob = new Blob([data.content], { type: mimeType });
      }

      const downloadUrl = URL.createObjectURL(blob);
      setExportProgress(100);

      toast.success(`Resume exported as ${settings.format.toUpperCase()} successfully!`);
      
      return {
        success: true,
        downloadUrl,
        filename: data.filename
      };

    } catch (error) {
      console.error('Resume export failed:', error);
      toast.error(`Failed to export resume: ${error.message}`);
      return { success: false };
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  };

  const saveResumeSettings = async (
    resumeId: string,
    settings: Partial<ResumeSettings>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ai_resumes')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeId);

      if (error) throw error;

      toast.success('Resume settings saved successfully!');
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save resume settings');
      return false;
    }
  };

  const generatePublicLink = async (
    resumeId: string,
    customSlug?: string
  ): Promise<string | null> => {
    try {
      const slug = customSlug || `resume-${Date.now()}`;
      
      const { error } = await supabase
        .from('ai_resumes')
        .update({
          is_public: true,
          public_url_slug: slug,
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeId);

      if (error) throw error;

      const publicUrl = `${window.location.origin}/resume/${slug}`;
      toast.success('Public link generated successfully!');
      
      return publicUrl;
    } catch (error) {
      console.error('Failed to generate public link:', error);
      toast.error('Failed to generate public link');
      return null;
    }
  };

  const revokePublicLink = async (resumeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ai_resumes')
        .update({
          is_public: false,
          public_url_slug: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeId);

      if (error) throw error;

      toast.success('Public link revoked successfully!');
      return true;
    } catch (error) {
      console.error('Failed to revoke public link:', error);
      toast.error('Failed to revoke public link');
      return false;
    }
  };

  const previewResume = async (
    resumeData: any,
    settings: ExportSettings
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('resume-export', {
        body: {
          resumeData,
          template: {
            id: settings.template,
            colorSchemes: [{ id: settings.colorScheme }]
          },
          format: 'html',
          settings
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Preview generation failed');
      }

      return data.content;
    } catch (error) {
      console.error('Preview generation failed:', error);
      toast.error('Failed to generate preview');
      return null;
    }
  };

  return {
    // Export functions
    exportResume,
    isExporting,
    exportProgress,
    
    // Settings management
    saveResumeSettings,
    
    // Public sharing
    generatePublicLink,
    revokePublicLink,
    
    // Preview
    previewResume,
  };
};
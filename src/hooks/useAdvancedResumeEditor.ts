
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdvancedResumeEditor = (resumeId?: string, initialData?: any) => {
  const [resumeData, setResumeData] = useState(initialData || {
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });
  
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState([initialData || {}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Load resume data if resumeId is provided
  useEffect(() => {
    if (resumeId && !initialData) {
      loadResumeData();
    }
  }, [resumeId]);

  const loadResumeData = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error) throw error;
      
      if (data) {
        setResumeData(data.content);
        setHistory([data.content]);
        setHistoryIndex(0);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Failed to load resume data');
    }
  };

  const updateResumeData = useCallback((updates: any) => {
    const newData = { ...resumeData, ...updates };
    setResumeData(newData);
    
    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [resumeData, history, historyIndex]);

  const analyzeResume = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      console.log('Starting AI resume analysis...');
      
      const { data, error } = await supabase.functions.invoke('ai-resume-analyzer', {
        body: {
          resumeContent: resumeData,
          targetRole: resumeData.personalInfo?.title,
          industry: resumeData.personalInfo?.industry
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      if (data.success) {
        setAiAnalysis(data.analysis);
        toast.success('Resume analysis completed!');
      } else {
        // Use fallback analysis
        setAiAnalysis(data.fallback);
        toast.success('Analysis completed with fallback data');
      }
    } catch (error) {
      console.error('Failed to analyze resume:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeData]);

  const improveContent = useCallback(async (content: string, section: string, type = 'general') => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-improver', {
        body: {
          content,
          section,
          improvementType: type
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Content improved successfully!');
        return data;
      } else {
        return {
          improvedContent: content,
          changes: [],
          suggestions: []
        };
      }
    } catch (error) {
      console.error('Failed to improve content:', error);
      toast.error('Failed to improve content');
      return {
        improvedContent: content,
        changes: [],
        suggestions: []
      };
    }
  }, []);

  const saveResume = useCallback(async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('resumes')
        .upsert({
          id: resumeId,
          content: resumeData,
          title: resumeData.personalInfo?.fullName 
            ? `${resumeData.personalInfo.fullName}'s Resume`
            : 'My Resume',
          ats_score: aiAnalysis?.overallScore || 0,
          updated_at: new Date().toISOString(),
          user_id: (await supabase.auth.getUser()).data.user?.id || ''
        }, {
          onConflict: resumeId ? 'id' : undefined
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Resume saved successfully!');
      return data;
    } catch (error) {
      console.error('Failed to save resume:', error);
      toast.error('Failed to save resume');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [resumeId, resumeData, aiAnalysis]);

  const undoLastChange = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setResumeData(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redoLastChange = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setResumeData(history[newIndex]);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    resumeData,
    aiAnalysis,
    isAnalyzing,
    isSaving,
    updateResumeData,
    analyzeResume,
    improveContent,
    saveResume,
    undoLastChange,
    redoLastChange,
    canUndo,
    canRedo
  };
};

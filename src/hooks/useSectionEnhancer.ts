import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EnhanceArgs {
  resumeId?: string;
  section: string;
  text: string;
  targetRole?: string;
  atsJson?: any;
}

interface CommitArgs {
  resumeId: string;
  section: string;
  beforeText: string;
  afterText: string;
  content: any; // full ATS JSON after merge
}

export const useSectionEnhancer = () => {
  const [isLoading, setIsLoading] = useState(false);

  const enhanceSection = useCallback(async (args: EnhanceArgs) => {
    setIsLoading(true);
    const localEnhance = (text: string) => {
      const base = (text || '').trim();
      const profileName = args.atsJson?.ats?.profile?.fullName || '';
      const roleStr = args.targetRole ? ` ${args.targetRole}` : '';
      const improved = base
        ? base.replace(/\s+/g, ' ').replace(/\.$/, '')
        : `Results-driven${roleStr ? ' ' : ''}${roleStr || ' professional'} with strengths across ${
            (args.atsJson?.ats?.skills || []).slice(0, 5).map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean).join(', ') || 'key areas'
          }`;
      return `${improved}.`;
    };

    try {
      const { data, error } = await supabase.functions.invoke(
        "deepseek-enhance-section",
        { body: { section: args.section, text: args.text, targetRole: args.targetRole, atsJson: args.atsJson } }
      );
      if (error || !data?.success) {
        return localEnhance(args.text);
      }
      return String(data.enhancedText ?? args.text);
    } catch (e: any) {
      console.warn("enhanceSection falling back to local enhancer", e);
      return localEnhance(args.text);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const commitEnhancement = useCallback(async ({ resumeId, section, beforeText, afterText, content }: CommitArgs) => {
    try {
      if (!resumeId) {
        toast.error('Missing resumeId to save enhancement');
        return null;
      }

      // Ensure user is authenticated for RLS on ai_resumes
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        toast.error('Please sign in to save changes');
        return null;
      }

      // 1) Update the AI resume content with the enhanced ATS JSON
      const { data: updated, error: updateErr } = await supabase
        .from('ai_resumes')
        .update({ content })
        .eq('id', resumeId)
        .select()
        .single();
      if (updateErr) throw updateErr;

      // 2) Log AI usage (non-blocking)
      await supabase
        .from('ai_usage_logs')
        .insert([
          {
            user_id: auth.user.id,
            feature_type: 'resume_enhancement',
            request_type: 'section_enhance',
            tool_slug: 'deepseek-enhance-section',
            request_data: { section, beforeText },
            response_data: { afterText },
            success: true,
          },
        ]);

      toast.success('Saved enhanced version');
      return updated;
    } catch (e: any) {
      console.error('commitEnhancement failed', e);
      toast.error(e?.message || 'Failed to save version');
      return null;
    }
  }, []);

  return { isLoading, enhanceSection, commitEnhancement };
}

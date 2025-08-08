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
    try {
      const { data, error } = await supabase.functions.invoke(
        "deepseek-enhance-section",
        { body: { section: args.section, text: args.text, targetRole: args.targetRole, atsJson: args.atsJson } }
      );
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Enhancement failed");
      return String(data.enhancedText ?? args.text);
    } catch (e: any) {
      console.error("enhanceSection failed", e);
      toast.error(e?.message || "Failed to enhance section");
      return args.text;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const commitEnhancement = useCallback(async ({ resumeId, section, beforeText, afterText, content }: CommitArgs) => {
    try {
      // 1) create a new version with updated content
      const { data: versionRows, error: vErr } = await (supabase as any)
        .from('resume_versions')
        .insert([{ resume_id: resumeId, content, source: 'ai' }])
        .select();
      if (vErr) throw vErr;
      const version = (versionRows?.[0] as any) || null;

      // 2) log AI change
      const { error: lErr } = await (supabase as any)
        .from('resume_ai_logs')
        .insert([
          {
            resume_id: resumeId,
            resume_version_id: version?.id,
            section,
            before_text: beforeText,
            after_text: afterText,
            model_used: 'deepseek-chat',
          },
        ]);
      if (lErr) throw lErr;

      toast.success("Saved new version with AI enhancement");
      return version;
    } catch (e: any) {
      console.error("commitEnhancement failed", e);
      toast.error(e?.message || "Failed to save version");
      return null;
    }
  }, []);

  return { isLoading, enhanceSection, commitEnhancement };
};

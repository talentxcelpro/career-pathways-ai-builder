import { supabase } from "@/integrations/supabase/client";

type Privacy = 'private' | 'unlisted' | 'public';

export async function createYouTubeUploadSession(params: {
  title: string;
  description?: string;
  privacyStatus?: Privacy;
  channelIndex?: number;
  fileSize: number;
  contentType?: string;
}) {
  const { data, error } = await supabase.functions.invoke('yt-create-upload-session', {
    body: params,
  });

  if (error) throw error;
  return data as { uploadUrl: string };
}

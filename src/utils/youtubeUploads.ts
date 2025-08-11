import { supabase } from "@/integrations/supabase/client";

type Privacy = 'private' | 'unlisted' | 'public';

export async function createYouTubeUploadSession(params: {
  title: string;
  fileSize: number;
  contentType: string;
  privacyStatus: Privacy; // required per spec
  channelIndex: number;   // 0-based index
  description?: string;
}) {
  const { data, error } = await supabase.functions.invoke('yt-create-upload-session', {
    body: params,
  });

  if (error) throw error;
  return data as { uploadUrl: string };
}

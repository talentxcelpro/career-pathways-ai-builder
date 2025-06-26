
import { supabase } from "@/integrations/supabase/client";

export const uploadProfileAsset = async (file: File, userId: string, type: 'avatar' | 'resume' | 'portfolio') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${type}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('profile-assets')
    .upload(fileName, file);

  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('profile-assets')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

export const deleteProfileAsset = async (url: string) => {
  const path = url.split('/profile-assets/')[1];
  if (!path) return;
  
  const { error } = await supabase.storage
    .from('profile-assets')
    .remove([path]);
  
  if (error) throw error;
};

export const incrementProfileView = async (profileUserId: string) => {
  const { error } = await supabase.rpc('increment_profile_views', {
    profile_user_id: profileUserId,
    viewer_ip: null,
    viewer_agent: navigator.userAgent
  });
  
  if (error) console.error('Error tracking profile view:', error);
};

export const validateSocialUrl = (platform: string, url: string): boolean => {
  const patterns: Record<string, RegExp> = {
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
    github: /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/,
    twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
    website: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/
  };
  
  return patterns[platform]?.test(url) || false;
};

export const generateCustomProfileUrl = (fullName: string): string => {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Utility functions for standardizing avatar and username handling across the app
 */

export interface ProfileLike {
  profile_picture_url?: string | null;
  profile_photo_url?: string | null;
  avatar_url?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  name?: string | null;
  email?: string | null;
}

export interface UserLike {
  user_metadata?: {
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
  email?: string | null;
}

/**
 * Standardizes avatar URL from various possible field names
 * Priority: profile_picture_url -> avatar_url -> profile_photo_url
 */
export function getStandardAvatarUrl(profile: ProfileLike | null | undefined): string | null {
  if (!profile) return null;
  
  const rawUrl = profile.profile_picture_url || 
                 profile.avatar_url || 
                 profile.profile_photo_url || 
                 null;

  if (rawUrl && rawUrl.includes('chatr.chat')) {
    return '/assets/avatar-placeholder.png';
  }

  return rawUrl;
}

/**
 * Standardizes username from various possible sources
 * Priority: full_name -> display_name -> name -> email -> "Professional User"
 */
export function getStandardUsername(profile: ProfileLike | null | undefined): string {
  if (!profile) return "Professional User";
  
  return profile.full_name || 
         profile.display_name || 
         profile.name || 
         (profile.email ? profile.email.split('@')[0] : null) ||
         "Professional User";
}

/**
 * Gets avatar URL from user metadata (typically from auth.user)
 */
export function getUserAvatarUrl(user: UserLike | null | undefined): string | null {
  if (!user?.user_metadata) return null;
  const rawUrl = user.user_metadata.avatar_url || null;
  if (rawUrl && rawUrl.includes('chatr.chat')) {
    return '/assets/avatar-placeholder.png';
  }
  return rawUrl;
}

/**
 * Gets username from user metadata with email fallback
 */
export function getUserDisplayName(user: UserLike | null | undefined): string {
  if (!user) return "Professional User";
  
  return user.user_metadata?.full_name || 
         (user.email ? user.email.split('@')[0] : null) ||
         "Professional User";
}

/**
 * Combined utility for getting standardized avatar props for UserAvatar component
 */
export function getAvatarProps(profile: ProfileLike | null | undefined) {
  return {
    src: getStandardAvatarUrl(profile),
    userName: getStandardUsername(profile)
  };
}

/**
 * Combined utility for getting avatar props from auth user
 */
export function getUserAvatarProps(user: UserLike | null | undefined) {
  return {
    src: getUserAvatarUrl(user),
    userName: getUserDisplayName(user)
  };
}
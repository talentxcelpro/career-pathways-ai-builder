import { supabase } from '@/integrations/supabase/client';

/**
 * Generates an SEO-optimized personal profile slug from a user's full name or email.
 * 
 * Rules:
 * - First + Middle + Last name: "Arshid Hussain Wani" -> "arshid-hussain-wani"
 * - First + Last name: "Priyanka Dhangar" -> "priyanka-dhangar"
 * - Multiple middle names: "John Fitz Gerald Kennedy" -> "john-fitz-gerald-kennedy"
 * - Handles accents/diacritics: "José García" -> "jose-garcia"
 * - Strips special symbols, punctuation, and multiple hyphens
 * - Falls back to email prefix if full name is not available
 */
export function generatePersonProfileSlug(fullName?: string | null, email?: string | null): string {
  if (fullName && fullName.trim()) {
    const cleaned = fullName
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // keep only alphanumeric, spaces, and hyphens
      .replace(/\s+/g, '-') // convert spaces to single hyphens
      .replace(/-+/g, '-') // collapse consecutive hyphens
      .replace(/^-+|-+$/g, ''); // strip leading and trailing hyphens

    if (cleaned.length >= 2) {
      return cleaned;
    }
  }

  if (email && email.trim()) {
    const prefix = email
      .split('@')[0]
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (prefix.length >= 2) {
      return prefix;
    }
  }

  return 'user';
}

/**
 * Generates a unique profile slug, checking against existing profiles in Supabase
 * and appending a numeric suffix if a collision occurs (e.g. "john-doe", "john-doe-2").
 */
export async function getUniqueProfileSlug(
  fullName?: string | null,
  email?: string | null,
  currentUserId?: string
): Promise<string> {
  const baseSlug = generatePersonProfileSlug(fullName, email);

  try {
    // Check if the base slug is taken by another user
    const { data: conflicts } = await supabase
      .from('profiles')
      .select('id, slug, custom_profile_url, username')
      .or(`slug.ilike.${baseSlug}%,custom_profile_url.ilike.${baseSlug}%`);

    if (!conflicts || conflicts.length === 0) {
      return baseSlug;
    }

    // Filter out conflicts belonging to the current user
    const otherUserConflicts = conflicts.filter((p) => p.id !== currentUserId);
    if (otherUserConflicts.length === 0) {
      return baseSlug;
    }

    const takenSlugs = new Set(
      otherUserConflicts.flatMap((p) => [
        p.slug?.toLowerCase(),
        p.custom_profile_url?.toLowerCase(),
        p.username?.toLowerCase()
      ]).filter(Boolean)
    );

    if (!takenSlugs.has(baseSlug)) {
      return baseSlug;
    }

    // Increment numeric suffix until unique
    let counter = 2;
    while (takenSlugs.has(`${baseSlug}-${counter}`)) {
      counter++;
    }
    return `${baseSlug}-${counter}`;
  } catch (err) {
    console.warn('Error checking slug uniqueness, using baseSlug:', err);
    return baseSlug;
  }
}

/**
 * Ensures a user profile has a valid SEO-friendly slug (first-middle-last or first-last).
 * If missing or invalid, generates a unique slug and saves it to the database.
 */
export async function ensureUserProfileSlug(
  userId: string,
  fullName?: string | null,
  email?: string | null
): Promise<string> {
  if (!userId) return 'user';

  try {
    // 1. Fetch current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, slug, custom_profile_url, username')
      .eq('id', userId)
      .maybeSingle();

    const nameToUse = profile?.full_name || fullName;
    const emailToUse = profile?.email || email;

    // If profile already has a valid slug that contains hyphens or matches name, keep it
    if (profile?.slug && profile.slug.length >= 3 && !profile.slug.startsWith('user_')) {
      return profile.slug;
    }

    // 2. Generate unique name slug
    const uniqueSlug = await getUniqueProfileSlug(nameToUse, emailToUse, userId);

    // 3. Update profile row with the new slug and custom_profile_url
    const updatePayload: Record<string, any> = {
      slug: uniqueSlug,
      custom_profile_url: uniqueSlug,
      updated_at: new Date().toISOString()
    };

    if (nameToUse && !profile?.full_name) {
      updatePayload.full_name = nameToUse;
    }

    if (!profile?.username || profile.username.startsWith('user_')) {
      updatePayload.username = uniqueSlug.replace(/-/g, '');
    }

    await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId);

    return uniqueSlug;
  } catch (err) {
    console.warn('Failed to ensure user profile slug:', err);
    return generatePersonProfileSlug(fullName, email);
  }
}

/**
 * Returns the canonical public profile URL for a user
 * e.g. https://talentxcel.in/profile/arshid-hussain-wani
 */
export function getPublicProfileFullUrl(slugOrUsername?: string | null): string {
  if (!slugOrUsername) return 'https://talentxcel.in/network';
  const clean = slugOrUsername.replace(/^@/, '').trim().toLowerCase();
  return `https://talentxcel.in/profile/${clean}`;
}

/**
 * Returns the public profile route path
 * e.g. /profile/arshid-hussain-wani
 */
export function getPublicProfilePath(slugOrUsername?: string | null): string {
  if (!slugOrUsername) return '/network';
  const clean = slugOrUsername.replace(/^@/, '').trim().toLowerCase();
  return `/profile/${clean}`;
}

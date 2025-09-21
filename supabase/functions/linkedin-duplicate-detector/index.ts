import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    switch (action) {
      case 'detect-duplicates':
        return await detectDuplicates(payload);
      case 'merge-profiles':
        return await mergeProfiles(payload);
      case 'mark-as-duplicate':
        return await markAsDuplicate(payload);
      case 'resolve-duplicates':
        return await resolveDuplicates(payload);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Duplicate detector error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function detectDuplicates(payload: any) {
  console.log('Detecting duplicates:', payload);
  
  const { detection_method = 'all', threshold = 0.8 } = payload;
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .limit(1000);
  
  if (!profiles || profiles.length < 2) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        duplicates: [],
        message: 'No duplicates found'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const duplicateGroups = [];
  const processed = new Set();
  
  for (let i = 0; i < profiles.length; i++) {
    if (processed.has(profiles[i].id)) continue;
    
    const group = [profiles[i]];
    processed.add(profiles[i].id);
    
    for (let j = i + 1; j < profiles.length; j++) {
      if (processed.has(profiles[j].id)) continue;
      
      const similarity = calculateSimilarity(profiles[i], profiles[j], detection_method);
      
      if (similarity >= threshold) {
        group.push(profiles[j]);
        processed.add(profiles[j].id);
      }
    }
    
    if (group.length > 1) {
      duplicateGroups.push({
        group_id: `dup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        profiles: group,
        similarity_scores: group.map((profile, idx) => ({
          profile_id: profile.id,
          similarity: idx === 0 ? 1.0 : calculateSimilarity(group[0], profile, detection_method)
        })),
        detected_at: new Date().toISOString()
      });
    }
  }
  
  // Save duplicate detection results
  if (duplicateGroups.length > 0) {
    await supabase
      .from('linkedin_analytics')
      .insert({
        analytics_date: new Date().toISOString().split('T')[0],
        metrics_data: { 
          duplicate_detection: {
            groups_found: duplicateGroups.length,
            total_duplicates: duplicateGroups.reduce((sum, group) => sum + group.profiles.length, 0),
            detection_method,
            threshold
          }
        },
        processed_at: new Date().toISOString()
      });
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      duplicates: duplicateGroups,
      summary: {
        groups_found: duplicateGroups.length,
        total_duplicates: duplicateGroups.reduce((sum, group) => sum + group.profiles.length, 0)
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function calculateSimilarity(profile1: any, profile2: any, method: string): number {
  let totalScore = 0;
  let weightSum = 0;
  
  // Email similarity (highest weight)
  if (method === 'all' || method === 'email') {
    if (profile1.email && profile2.email) {
      const emailSimilarity = profile1.email.toLowerCase() === profile2.email.toLowerCase() ? 1.0 : 0.0;
      totalScore += emailSimilarity * 0.4;
      weightSum += 0.4;
    }
  }
  
  // Name similarity
  if (method === 'all' || method === 'name') {
    if (profile1.full_name && profile2.full_name) {
      const nameSimilarity = calculateStringSimilarity(
        profile1.full_name.toLowerCase(),
        profile2.full_name.toLowerCase()
      );
      totalScore += nameSimilarity * 0.3;
      weightSum += 0.3;
    }
  }
  
  // LinkedIn URL similarity
  if (method === 'all' || method === 'linkedin') {
    if (profile1.linkedin_url && profile2.linkedin_url) {
      const urlSimilarity = profile1.linkedin_url === profile2.linkedin_url ? 1.0 : 0.0;
      totalScore += urlSimilarity * 0.2;
      weightSum += 0.2;
    }
  }
  
  // Phone similarity
  if (method === 'all' || method === 'phone') {
    if (profile1.phone && profile2.phone) {
      const phoneSimilarity = normalizePhone(profile1.phone) === normalizePhone(profile2.phone) ? 1.0 : 0.0;
      totalScore += phoneSimilarity * 0.1;
      weightSum += 0.1;
    }
  }
  
  return weightSum > 0 ? totalScore / weightSum : 0;
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

async function mergeProfiles(payload: any) {
  console.log('Merging profiles:', payload);
  
  const { profile_ids, keep_profile_id, merge_strategy = 'most_complete' } = payload;
  
  if (profile_ids.length < 2) {
    throw new Error('At least 2 profiles required for merging');
  }
  
  // Get all profiles to merge
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', profile_ids);
    
  if (error) {
    throw new Error(`Failed to fetch profiles: ${error.message}`);
  }
  
  // Determine which profile to keep
  let keepProfile;
  if (keep_profile_id) {
    keepProfile = profiles.find(p => p.id === keep_profile_id);
  } else {
    keepProfile = selectBestProfile(profiles, merge_strategy);
  }
  
  if (!keepProfile) {
    throw new Error('Could not determine profile to keep');
  }
  
  // Merge data from other profiles
  const mergedData = mergeProfileData(profiles, keepProfile);
  
  // Update the kept profile with merged data
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      ...mergedData,
      updated_at: new Date().toISOString(),
      merge_history: {
        merged_profiles: profile_ids.filter(id => id !== keepProfile.id),
        merged_at: new Date().toISOString(),
        merge_strategy
      }
    })
    .eq('id', keepProfile.id);
    
  if (updateError) {
    throw new Error(`Failed to update merged profile: ${updateError.message}`);
  }
  
  // Mark other profiles as merged/deleted
  const profilesToRemove = profile_ids.filter(id => id !== keepProfile.id);
  if (profilesToRemove.length > 0) {
    await supabase
      .from('profiles')
      .update({
        is_merged: true,
        merged_into: keepProfile.id,
        updated_at: new Date().toISOString()
      })
      .in('id', profilesToRemove);
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Successfully merged ${profilesToRemove.length} profiles into ${keepProfile.id}`,
      kept_profile_id: keepProfile.id,
      merged_profile_ids: profilesToRemove
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function selectBestProfile(profiles: any[], strategy: string): any {
  switch (strategy) {
    case 'most_complete':
      return profiles.reduce((best, current) => {
        const bestScore = calculateCompletenessScore(best);
        const currentScore = calculateCompletenessScore(current);
        return currentScore > bestScore ? current : best;
      });
    case 'most_recent':
      return profiles.reduce((newest, current) => {
        return new Date(current.updated_at) > new Date(newest.updated_at) ? current : newest;
      });
    case 'first_created':
      return profiles.reduce((oldest, current) => {
        return new Date(current.created_at) < new Date(oldest.created_at) ? current : oldest;
      });
    default:
      return profiles[0];
  }
}

function calculateCompletenessScore(profile: any): number {
  let score = 0;
  const fields = ['full_name', 'email', 'title', 'about', 'location', 'linkedin_url', 'phone'];
  
  fields.forEach(field => {
    if (profile[field] && profile[field].toString().trim().length > 0) {
      score += 1;
    }
  });
  
  if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
    score += 1;
  }
  
  return score;
}

function mergeProfileData(profiles: any[], keepProfile: any): any {
  const merged = { ...keepProfile };
  
  profiles.forEach(profile => {
    if (profile.id === keepProfile.id) return;
    
    // Merge fields, preferring non-empty values
    Object.keys(profile).forEach(key => {
      if (key === 'id' || key === 'created_at') return;
      
      if (!merged[key] || (merged[key].toString().trim().length === 0 && profile[key])) {
        merged[key] = profile[key];
      }
      
      // Special handling for arrays (like skills)
      if (key === 'skills' && Array.isArray(profile[key])) {
        const existingSkills = Array.isArray(merged[key]) ? merged[key] : [];
        merged[key] = [...new Set([...existingSkills, ...profile[key]])];
      }
    });
  });
  
  return merged;
}

async function markAsDuplicate(payload: any) {
  const { profile_ids, duplicate_type = 'auto_detected' } = payload;
  
  const { error } = await supabase
    .from('profiles')
    .update({
      is_duplicate: true,
      duplicate_type,
      marked_at: new Date().toISOString()
    })
    .in('id', profile_ids);
    
  if (error) {
    throw new Error(`Failed to mark profiles as duplicates: ${error.message}`);
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Marked ${profile_ids.length} profiles as duplicates`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function resolveDuplicates(payload: any) {
  console.log('Resolving duplicates:', payload);
  
  const { action = 'auto', groups } = payload;
  const resolved = [];
  
  for (const group of groups) {
    try {
      if (action === 'merge') {
        const result = await mergeProfiles({
          profile_ids: group.profiles.map(p => p.id),
          merge_strategy: 'most_complete'
        });
        resolved.push({
          group_id: group.group_id,
          action: 'merged',
          result: JSON.parse(result.body)
        });
      } else if (action === 'mark') {
        await markAsDuplicate({
          profile_ids: group.profiles.map(p => p.id)
        });
        resolved.push({
          group_id: group.group_id,
          action: 'marked_as_duplicate'
        });
      }
    } catch (error) {
      resolved.push({
        group_id: group.group_id,
        action: 'error',
        error: error.message
      });
    }
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Resolved ${resolved.length} duplicate groups`,
      resolved 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

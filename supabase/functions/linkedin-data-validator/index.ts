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
      case 'validate-profile':
        return await validateProfile(payload);
      case 'validate-batch':
        return await validateProfileBatch(payload);
      case 'fix-data-issues':
        return await fixDataIssues(payload);
      case 'quality-scan':
        return await performQualityScan(payload);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Data validator error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function validateProfile(payload: any) {
  console.log('Validating profile:', payload);
  
  const { profile_id } = payload;
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profile_id)
    .single();
    
  if (error) {
    throw new Error(`Profile not found: ${error.message}`);
  }
  
  const validation = performProfileValidation(profile);
  
  // Update profile with validation results
  await supabase
    .from('profiles')
    .update({
      data_quality_score: validation.score,
      validation_issues: validation.issues,
      last_validated: new Date().toISOString()
    })
    .eq('id', profile_id);
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      validation,
      profile_id 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function performProfileValidation(profile: any) {
  const issues = [];
  let score = 100;
  
  // Validate required fields
  if (!profile.full_name || profile.full_name.trim().length < 2) {
    issues.push({
      type: 'critical',
      field: 'full_name',
      message: 'Full name is missing or too short',
      severity: 'high'
    });
    score -= 20;
  }
  
  if (!profile.email) {
    issues.push({
      type: 'critical',
      field: 'email',
      message: 'Email address is missing',
      severity: 'high'
    });
    score -= 15;
  } else if (!isValidEmail(profile.email)) {
    issues.push({
      type: 'validation',
      field: 'email',
      message: 'Email format is invalid',
      severity: 'medium'
    });
    score -= 10;
  }
  
  // Validate LinkedIn URL
  if (profile.linkedin_url) {
    if (!isValidLinkedInUrl(profile.linkedin_url)) {
      issues.push({
        type: 'validation',
        field: 'linkedin_url',
        message: 'LinkedIn URL format is invalid',
        severity: 'medium'
      });
      score -= 10;
    }
  } else {
    issues.push({
      type: 'completeness',
      field: 'linkedin_url',
      message: 'LinkedIn URL is missing',
      severity: 'low'
    });
    score -= 5;
  }
  
  // Validate professional information
  if (!profile.title) {
    issues.push({
      type: 'completeness',
      field: 'title',
      message: 'Professional title is missing',
      severity: 'medium'
    });
    score -= 10;
  }
  
  if (!profile.about || profile.about.length < 50) {
    issues.push({
      type: 'completeness',
      field: 'about',
      message: 'Professional summary is missing or too short',
      severity: 'low'
    });
    score -= 8;
  }
  
  // Validate location
  if (!profile.location) {
    issues.push({
      type: 'completeness',
      field: 'location',
      message: 'Location information is missing',
      severity: 'low'
    });
    score -= 5;
  }
  
  // Validate skills
  if (!profile.skills || profile.skills.length === 0) {
    issues.push({
      type: 'completeness',
      field: 'skills',
      message: 'Skills information is missing',
      severity: 'low'
    });
    score -= 7;
  }
  
  // Validate phone number format if present
  if (profile.phone && !isValidPhoneNumber(profile.phone)) {
    issues.push({
      type: 'validation',
      field: 'phone',
      message: 'Phone number format is invalid',
      severity: 'low'
    });
    score -= 5;
  }
  
  // Check for suspicious data patterns
  if (profile.full_name && profile.full_name.includes('test')) {
    issues.push({
      type: 'quality',
      field: 'full_name',
      message: 'Name appears to be test data',
      severity: 'medium'
    });
    score -= 15;
  }
  
  return {
    score: Math.max(0, score),
    issues,
    status: score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low',
    last_validated: new Date().toISOString()
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidLinkedInUrl(url: string): boolean {
  const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
  return linkedinRegex.test(url);
}

function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

async function validateProfileBatch(payload: any) {
  console.log('Validating profile batch:', payload);
  
  const { profile_ids, fix_issues = false } = payload;
  const results = [];
  
  for (const profileId of profile_ids) {
    try {
      const response = await validateProfile({ profile_id: profileId });
      const validation = JSON.parse(response.body).validation;
      
      if (fix_issues && validation.issues.length > 0) {
        await autoFixIssues(profileId, validation.issues);
      }
      
      results.push({ 
        profile_id: profileId, 
        status: 'success', 
        validation 
      });
    } catch (error) {
      results.push({ 
        profile_id: profileId, 
        status: 'error', 
        error: error.message 
      });
    }
  }
  
  const summary = {
    total: results.length,
    high_quality: results.filter(r => r.validation?.status === 'high').length,
    medium_quality: results.filter(r => r.validation?.status === 'medium').length,
    low_quality: results.filter(r => r.validation?.status === 'low').length,
    errors: results.filter(r => r.status === 'error').length
  };
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      results,
      summary
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function autoFixIssues(profileId: string, issues: any[]) {
  const fixes = {};
  
  for (const issue of issues) {
    switch (issue.field) {
      case 'email':
        if (issue.type === 'validation' && issue.message.includes('format')) {
          // Could implement email format correction here
        }
        break;
      case 'linkedin_url':
        if (issue.type === 'validation') {
          // Could implement LinkedIn URL format correction here
        }
        break;
      case 'phone':
        if (issue.type === 'validation') {
          // Could implement phone number format correction here
        }
        break;
    }
  }
  
  if (Object.keys(fixes).length > 0) {
    await supabase
      .from('profiles')
      .update(fixes)
      .eq('id', profileId);
  }
}

async function fixDataIssues(payload: any) {
  console.log('Fixing data issues:', payload);
  
  const { issue_types = ['format', 'completeness'], auto_fix = true } = payload;
  
  // Get profiles with validation issues
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .not('validation_issues', 'is', null)
    .limit(100);
  
  const fixed = [];
  
  for (const profile of profiles || []) {
    const fixes = {};
    let hasChanges = false;
    
    // Fix email format issues
    if (issue_types.includes('format') && profile.email) {
      const cleanEmail = profile.email.trim().toLowerCase();
      if (cleanEmail !== profile.email) {
        fixes.email = cleanEmail;
        hasChanges = true;
      }
    }
    
    // Fix LinkedIn URL format
    if (issue_types.includes('format') && profile.linkedin_url) {
      let cleanUrl = profile.linkedin_url.trim();
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      if (cleanUrl !== profile.linkedin_url) {
        fixes.linkedin_url = cleanUrl;
        hasChanges = true;
      }
    }
    
    // Fix completeness issues
    if (issue_types.includes('completeness')) {
      if (!profile.title && profile.about) {
        // Try to extract title from about section
        const titleMatch = profile.about.match(/^([^.,\n]{10,50})/);
        if (titleMatch) {
          fixes.title = titleMatch[1].trim();
          hasChanges = true;
        }
      }
    }
    
    if (hasChanges && auto_fix) {
      await supabase
        .from('profiles')
        .update({
          ...fixes,
          last_updated: new Date().toISOString()
        })
        .eq('id', profile.id);
      
      fixed.push({
        profile_id: profile.id,
        fixes: Object.keys(fixes)
      });
    }
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Fixed issues in ${fixed.length} profiles`,
      fixed 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function performQualityScan(payload: any) {
  console.log('Performing quality scan:', payload);
  
  const { scan_type = 'full', limit = 1000 } = payload;
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .limit(limit);
  
  const qualityReport = {
    total_profiles: profiles?.length || 0,
    high_quality: 0,
    medium_quality: 0,
    low_quality: 0,
    common_issues: {},
    recommendations: []
  };
  
  for (const profile of profiles || []) {
    const validation = performProfileValidation(profile);
    
    if (validation.status === 'high') qualityReport.high_quality++;
    else if (validation.status === 'medium') qualityReport.medium_quality++;
    else qualityReport.low_quality++;
    
    // Track common issues
    validation.issues.forEach(issue => {
      const key = `${issue.field}_${issue.type}`;
      qualityReport.common_issues[key] = (qualityReport.common_issues[key] || 0) + 1;
    });
  }
  
  // Generate recommendations
  const issueEntries = Object.entries(qualityReport.common_issues);
  issueEntries.sort((a, b) => b[1] - a[1]);
  
  qualityReport.recommendations = issueEntries.slice(0, 5).map(([issue, count]) => ({
    issue: issue.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    affected_profiles: count as number,
    priority: (count as number) > qualityReport.total_profiles * 0.2 ? 'high' : 'medium'
  }));
  
  // Save quality report
  await supabase
    .from('linkedin_analytics')
    .insert({
      analytics_date: new Date().toISOString().split('T')[0],
      metrics_data: { quality_report: qualityReport },
      processed_at: new Date().toISOString()
    });
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      quality_report: qualityReport
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
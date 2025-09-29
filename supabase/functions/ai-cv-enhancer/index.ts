import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnhancementRequest {
  operation: 'single_enhance' | 'bulk_enhance';
  cvId?: string;
  useAdvancedNLP?: boolean;
  extractSkillGaps?: boolean;
  batchSize?: number;
}

interface SkillExtraction {
  technical: string[];
  soft: string[];
  frameworks: string[];
  languages: string[];
  tools: string[];
  certifications: string[];
}

interface EnhancedProfile {
  originalName: string;
  standardizedName: string;
  skillsExtracted: SkillExtraction;
  experienceLevel: string;
  careerProgression: string[];
  salaryPrediction: number;
  skillGaps: string[];
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      operation, 
      cvId, 
      useAdvancedNLP = true, 
      extractSkillGaps = true,
      batchSize = 100 
    }: EnhancementRequest = await req.json();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting CV enhancement - Operation: ${operation}`);

    let cvFiles: any[] = [];

    if (operation === 'single_enhance' && cvId) {
      const { data, error } = await supabase
        .from('cv_files')
        .select('*')
        .eq('id', cvId)
        .single();
      
      if (error) throw error;
      cvFiles = [data];
    } else {
      // Bulk enhancement
      const { data, error } = await supabase
        .from('cv_files')
        .select('*')
        .limit(batchSize);
      
      if (error) throw error;
      cvFiles = data || [];
    }

    console.log(`Processing ${cvFiles.length} CV files`);

    const enhancementResults: EnhancedProfile[] = [];
    const processingStart = Date.now();

    for (const cvFile of cvFiles) {
      try {
        const enhanced = await enhanceCV(cvFile, useAdvancedNLP, extractSkillGaps);
        enhancementResults.push(enhanced);
        
        // Update the CV file with enhanced data
        await updateCVWithEnhancements(supabase, cvFile.id, enhanced);
        
      } catch (error) {
        console.error(`Failed to enhance CV ${cvFile.id}:`, error);
      }
    }

    const processingTime = Date.now() - processingStart;

    // Log metrics
    await supabase.from('ai_metrics').insert({
      metric: 'cv_enhancement_performance',
      value: processingTime,
      ref_url: `/ai-cv-enhancer/${operation}`
    });

    const response = {
      success: true,
      enhanced: enhancementResults.length,
      failed: cvFiles.length - enhancementResults.length,
      processingTimeMs: processingTime,
      averageTimePerCV: Math.round(processingTime / cvFiles.length),
      results: enhancementResults.slice(0, 10), // Return sample results
      metadata: {
        operation,
        useAdvancedNLP,
        extractSkillGaps,
        totalProcessed: cvFiles.length
      }
    };

    console.log(`CV enhancement complete: ${enhancementResults.length} enhanced`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('CV enhancement error:', error);
    return new Response(JSON.stringify({ 
      error: (error as Error).message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function enhanceCV(
  cvFile: any, 
  useAdvancedNLP: boolean, 
  extractSkillGaps: boolean
): Promise<EnhancedProfile> {
  const parsing = cvFile.parsing_results || {};
  const originalName = parsing.profile?.fullName || parsing.profile?.name || 'Unknown';
  
  // Advanced skill extraction
  const skillsExtracted = extractAdvancedSkills(parsing);
  
  // Standardize name
  const standardizedName = standardizeName(originalName);
  
  // Determine experience level
  const experienceLevel = determineExperienceLevel(parsing);
  
  // Extract career progression
  const careerProgression = extractCareerProgression(parsing);
  
  // Predict salary based on skills and experience
  const salaryPrediction = predictSalary(skillsExtracted, experienceLevel);
  
  // Extract skill gaps if requested
  const skillGaps = extractSkillGaps ? identifySkillGaps(skillsExtracted, experienceLevel) : [];
  
  // Generate recommendations
  const recommendations = generateRecommendations(skillsExtracted, experienceLevel, skillGaps);
  
  return {
    originalName,
    standardizedName,
    skillsExtracted,
    experienceLevel,
    careerProgression,
    salaryPrediction,
    skillGaps,
    recommendations
  };
}

function extractAdvancedSkills(parsing: any): SkillExtraction {
  const allText = JSON.stringify(parsing).toLowerCase();
  
  // Technical skills patterns
  const technicalSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
    'spring', 'laravel', 'rails', 'asp.net', 'pandas', 'numpy', 'tensorflow',
    'pytorch', 'scikit-learn', 'docker', 'kubernetes', 'aws', 'azure', 'gcp'
  ];
  
  const softSkills = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'creativity',
    'adaptability', 'time management', 'critical thinking', 'collaboration'
  ];
  
  const frameworks = [
    'react', 'angular', 'vue', 'next.js', 'gatsby', 'svelte', 'express',
    'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net'
  ];
  
  const languages = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
    'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'matlab'
  ];
  
  const tools = [
    'git', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'jira',
    'confluence', 'slack', 'teams', 'figma', 'sketch', 'photoshop'
  ];
  
  const certifications = [
    'aws certified', 'azure certified', 'google cloud', 'pmp', 'scrum master',
    'cissp', 'ceh', 'comptia', 'cisco', 'microsoft certified'
  ];
  
  return {
    technical: technicalSkills.filter(skill => allText.includes(skill)),
    soft: softSkills.filter(skill => allText.includes(skill)),
    frameworks: frameworks.filter(skill => allText.includes(skill)),
    languages: languages.filter(skill => allText.includes(skill)),
    tools: tools.filter(skill => allText.includes(skill)),
    certifications: certifications.filter(cert => allText.includes(cert))
  };
}

function standardizeName(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

function determineExperienceLevel(parsing: any): string {
  const experience = parsing.experience || [];
  const totalYears = experience.length;
  
  if (totalYears >= 8) return 'Senior';
  if (totalYears >= 5) return 'Mid-level';
  if (totalYears >= 2) return 'Junior';
  return 'Entry-level';
}

function extractCareerProgression(parsing: any): string[] {
  const experience = parsing.experience || [];
  return experience
    .map((exp: any) => exp.title || exp.position)
    .filter(Boolean)
    .slice(0, 5);
}

function predictSalary(skills: SkillExtraction, experienceLevel: string): number {
  let baseSalary = 400000; // Base salary in INR
  
  // Experience multiplier
  const experienceMultipliers = {
    'Entry-level': 1.0,
    'Junior': 1.5,
    'Mid-level': 2.5,
    'Senior': 4.0
  };
  
  baseSalary *= experienceMultipliers[experienceLevel as keyof typeof experienceMultipliers] || 1.0;
  
  // Skills bonus
  const skillBonus = (skills.technical.length * 25000) + 
                    (skills.frameworks.length * 30000) +
                    (skills.languages.length * 20000) +
                    (skills.certifications.length * 50000);
  
  return Math.round(baseSalary + skillBonus);
}

function identifySkillGaps(skills: SkillExtraction, experienceLevel: string): string[] {
  const gaps: string[] = [];
  
  // Common skill gaps by experience level
  if (experienceLevel === 'Entry-level' || experienceLevel === 'Junior') {
    if (!skills.technical.includes('git')) gaps.push('Version Control (Git)');
    if (!skills.frameworks.length) gaps.push('Frontend Framework');
    if (!skills.tools.includes('docker')) gaps.push('Containerization');
  }
  
  if (experienceLevel === 'Mid-level' || experienceLevel === 'Senior') {
    if (!skills.tools.includes('kubernetes')) gaps.push('Container Orchestration');
    if (!skills.soft.includes('leadership')) gaps.push('Leadership Skills');
    if (!skills.certifications.length) gaps.push('Professional Certifications');
  }
  
  return gaps.slice(0, 5);
}

function generateRecommendations(
  skills: SkillExtraction, 
  experienceLevel: string, 
  skillGaps: string[]
): string[] {
  const recommendations: string[] = [];
  
  if (skillGaps.length > 0) {
    recommendations.push(`Focus on ${skillGaps[0]} to enhance your profile`);
  }
  
  if (skills.technical.length >= 5) {
    recommendations.push('Consider specializing in a specific technology stack');
  }
  
  if (experienceLevel === 'Senior' && skills.soft.length < 3) {
    recommendations.push('Develop soft skills for leadership roles');
  }
  
  recommendations.push('Keep skills updated with latest industry trends');
  
  return recommendations.slice(0, 3);
}

async function updateCVWithEnhancements(
  supabase: any, 
  cvId: string, 
  enhanced: EnhancedProfile
): Promise<void> {
  const { error } = await supabase
    .from('cv_files')
    .update({
      parsing_results: {
        enhanced: true,
        enhancement_timestamp: new Date().toISOString(),
        standardized_name: enhanced.standardizedName,
        experience_level: enhanced.experienceLevel,
        salary_prediction: enhanced.salaryPrediction,
        skill_gaps: enhanced.skillGaps,
        recommendations: enhanced.recommendations,
        skills_extracted: enhanced.skillsExtracted
      }
    })
    .eq('id', cvId);
  
  if (error) {
    console.error('Failed to update CV with enhancements:', error);
  }
}
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ComprehensiveATSResult {
  overallScore: number;
  sections: {
    contact: { score: number; issues: string[]; suggestions: string[] };
    summary: { score: number; issues: string[]; suggestions: string[] };
    experience: { score: number; issues: string[]; suggestions: string[] };
    education: { score: number; issues: string[]; suggestions: string[] };
    skills: { score: number; issues: string[]; suggestions: string[] };
  };
  keywords: {
    matched: string[];
    missing: string[];
    density: number;
    recommendations: string[];
  };
  formatting: {
    score: number;
    issues: string[];
    strengths: string[];
  };
  competitiveAnalysis: {
    industryStandard: number;
    ranking: string;
    improvementAreas: string[];
  };
  actionableSteps: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    impact: string;
    section: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData, jobDescription, targetRole, industry } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Starting comprehensive ATS analysis...');

    const resumeText = buildDetailedResumeText(resumeData);

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer with 15+ years of experience in recruitment technology. Perform a comprehensive, professional analysis covering:

**1. ATS COMPATIBILITY (50+ Criteria)**
- Keyword optimization and density
- Formatting compatibility (headers, bullets, dates)
- Section structure and naming
- File format compliance
- Special character handling
- Font and styling compatibility
- Table and column usage
- Contact information placement
- Date format standardization

**2. CONTENT QUALITY**
- Achievement quantification (metrics, percentages, numbers)
- Action verb usage and variety
- Passive vs. active voice
- Professional tone consistency
- Spelling and grammar
- Redundancy and filler words
- Technical terminology accuracy
- Industry-specific language

**3. KEYWORD ANALYSIS**
- Hard skills matching
- Soft skills representation
- Industry buzzwords
- Role-specific terminology
- Technology stack relevance
- Certification mentions
- Methodology references

**4. SECTION-BY-SECTION EVALUATION**
For each section (Contact, Summary, Experience, Education, Skills):
- Completeness score
- Specific issues found
- Actionable improvement suggestions
- ATS optimization tips

**5. COMPETITIVE ANALYSIS**
- Compare against industry standards for ${targetRole || 'the role'} in ${industry || 'the industry'}
- Ranking (Top 10%, 25%, 50%, etc.)
- Key differentiation points
- Gap analysis

**6. ACTIONABLE ROADMAP**
Prioritized list of improvements with:
- Priority level (critical/high/medium/low)
- Specific action to take
- Expected impact
- Affected section

Return comprehensive analysis as JSON following this structure exactly.`;

    let userPrompt = `Analyze this resume in depth:\n\n${resumeText}`;
    
    if (jobDescription) {
      userPrompt += `\n\nTarget Job Description:\n${jobDescription}\n\nProvide job-specific keyword matching and optimization recommendations.`;
    }

    if (targetRole && industry) {
      userPrompt += `\n\nTarget Role: ${targetRole}\nIndustry: ${industry}\n\nTailor analysis for this specific role and industry.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    let analysis: ComprehensiveATSResult;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                        analysisText.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', analysisText);
      
      // Provide fallback analysis
      analysis = generateFallbackAnalysis(resumeData);
    }

    console.log(`✅ Comprehensive ATS analysis completed. Score: ${analysis.overallScore}/100`);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in comprehensive-ats-analyzer:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildDetailedResumeText(resumeData: any): string {
  const sections: string[] = [];

  // Personal Info with detailed contact
  if (resumeData.personalInfo) {
    const pi = resumeData.personalInfo;
    sections.push(`=== CONTACT INFORMATION ===`);
    sections.push(`Name: ${pi.fullName || 'N/A'}`);
    sections.push(`Email: ${pi.email || 'N/A'}`);
    sections.push(`Phone: ${pi.phone || 'N/A'}`);
    sections.push(`Location: ${pi.location || 'N/A'}`);
    if (pi.linkedin) sections.push(`LinkedIn: ${pi.linkedin}`);
    if (pi.github) sections.push(`GitHub: ${pi.github}`);
    if (pi.website) sections.push(`Website: ${pi.website}`);
  }

  // Professional Summary
  if (resumeData.personalInfo?.summary) {
    sections.push(`\n=== PROFESSIONAL SUMMARY ===`);
    sections.push(resumeData.personalInfo.summary);
  }

  // Experience with full details
  if (resumeData.experience?.length > 0) {
    sections.push(`\n=== WORK EXPERIENCE ===`);
    resumeData.experience.forEach((exp: any, index: number) => {
      sections.push(`\n[Experience ${index + 1}]`);
      sections.push(`Title: ${exp.title || 'N/A'}`);
      sections.push(`Company: ${exp.company || 'N/A'}`);
      sections.push(`Duration: ${exp.startDate || 'N/A'} - ${exp.endDate || exp.current ? 'Present' : 'N/A'}`);
      sections.push(`Location: ${exp.location || 'N/A'}`);
      if (exp.description) {
        sections.push(`Description: ${exp.description}`);
      }
      if (exp.achievements?.length > 0) {
        sections.push(`Achievements:`);
        exp.achievements.forEach((achievement: string) => {
          sections.push(`  • ${achievement}`);
        });
      }
      if (exp.technologies?.length > 0) {
        sections.push(`Technologies: ${exp.technologies.join(', ')}`);
      }
    });
  }

  // Education
  if (resumeData.education?.length > 0) {
    sections.push(`\n=== EDUCATION ===`);
    resumeData.education.forEach((edu: any) => {
      sections.push(`\n${edu.degree || 'Degree'} - ${edu.institution || 'Institution'}`);
      sections.push(`${edu.startDate || 'Start'} - ${edu.endDate || 'End'}`);
      if (edu.location) sections.push(`Location: ${edu.location}`);
      if (edu.gpa) sections.push(`GPA: ${edu.gpa}`);
      if (edu.honors) sections.push(`Honors: ${edu.honors}`);
    });
  }

  // Skills with categories
  if (resumeData.skills?.length > 0) {
    sections.push(`\n=== SKILLS ===`);
    const skillsByCategory: Record<string, string[]> = {};
    resumeData.skills.forEach((skill: any) => {
      const category = skill.category || 'general';
      const skillName = typeof skill === 'string' ? skill : skill.name;
      if (!skillsByCategory[category]) {
        skillsByCategory[category] = [];
      }
      skillsByCategory[category].push(skillName);
    });
    
    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      sections.push(`${category.toUpperCase()}: ${skills.join(', ')}`);
    });
  }

  // Certifications
  if (resumeData.certifications?.length > 0) {
    sections.push(`\n=== CERTIFICATIONS ===`);
    resumeData.certifications.forEach((cert: any) => {
      sections.push(`• ${cert.name} - ${cert.issuer} (${cert.issueDate || 'Date N/A'})`);
    });
  }

  // Projects
  if (resumeData.projects?.length > 0) {
    sections.push(`\n=== PROJECTS ===`);
    resumeData.projects.forEach((project: any) => {
      sections.push(`\n${project.name}`);
      sections.push(`${project.description}`);
      if (project.technologies?.length > 0) {
        sections.push(`Technologies: ${project.technologies.join(', ')}`);
      }
    });
  }

  return sections.join('\n');
}

function generateFallbackAnalysis(resumeData: any): ComprehensiveATSResult {
  const hasContact = !!(resumeData.personalInfo?.email && resumeData.personalInfo?.phone);
  const hasSummary = !!resumeData.personalInfo?.summary;
  const hasExperience = resumeData.experience?.length > 0;
  const hasEducation = resumeData.education?.length > 0;
  const hasSkills = resumeData.skills?.length > 0;

  const completeness = [hasContact, hasSummary, hasExperience, hasEducation, hasSkills].filter(Boolean).length;
  const overallScore = Math.round((completeness / 5) * 100);

  return {
    overallScore,
    sections: {
      contact: {
        score: hasContact ? 90 : 40,
        issues: hasContact ? [] : ['Missing complete contact information'],
        suggestions: hasContact ? ['Contact information is complete'] : ['Add email and phone number']
      },
      summary: {
        score: hasSummary ? 80 : 30,
        issues: hasSummary ? [] : ['Missing professional summary'],
        suggestions: hasSummary ? ['Consider adding more metrics'] : ['Add a compelling professional summary']
      },
      experience: {
        score: hasExperience ? 75 : 20,
        issues: hasExperience ? [] : ['No work experience listed'],
        suggestions: hasExperience ? ['Quantify achievements with metrics'] : ['Add work experience with achievements']
      },
      education: {
        score: hasEducation ? 85 : 50,
        issues: hasEducation ? [] : ['Missing education information'],
        suggestions: hasEducation ? ['Education section looks good'] : ['Add education background']
      },
      skills: {
        score: hasSkills ? 80 : 40,
        issues: hasSkills ? [] : ['No skills listed'],
        suggestions: hasSkills ? ['Categorize skills by type'] : ['Add relevant technical and soft skills']
      }
    },
    keywords: {
      matched: [],
      missing: ['Add industry-specific keywords'],
      density: 0,
      recommendations: ['Include role-specific terminology', 'Add technical skills keywords']
    },
    formatting: {
      score: 70,
      issues: ['AI analysis unavailable - fallback mode'],
      strengths: ['Basic structure detected']
    },
    competitiveAnalysis: {
      industryStandard: 75,
      ranking: 'Average',
      improvementAreas: ['Add more quantifiable achievements', 'Enhance keyword optimization']
    },
    actionableSteps: [
      {
        priority: 'critical',
        action: 'Complete all basic sections (contact, experience, education, skills)',
        impact: 'Significantly improves ATS compatibility',
        section: 'all'
      },
      {
        priority: 'high',
        action: 'Add quantifiable achievements with metrics',
        impact: 'Increases perceived value and impact',
        section: 'experience'
      }
    ]
  };
}

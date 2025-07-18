import { EnhancedExtractedContent } from '../interfaces/EnhancedExtractedContent';

interface SummaryTemplate {
  pattern: string;
  tone: 'confident' | 'executive' | 'humble' | 'entry-level';
  industry: string;
  yearsRange: string;
}

export class ProfessionalSummaryGenerator {
  private readonly summaryTemplates: SummaryTemplate[] = [
    {
      pattern: "Results-driven {role} with {experience} years of experience in {industry}. Proven track record of {achievement} and expertise in {skills}. Passionate about {goal} and seeking opportunities to {objective}.",
      tone: 'confident',
      industry: 'technology',
      yearsRange: '3-10'
    },
    {
      pattern: "Senior {role} with {experience} years of strategic leadership in {industry}. Demonstrated success in {achievement} and building high-performing teams. Skilled in {skills} with a focus on {goal}.",
      tone: 'executive',
      industry: 'any',
      yearsRange: '8+'
    },
    {
      pattern: "Dedicated {role} with {experience} years of experience specializing in {industry}. Strong background in {skills} with a commitment to {goal}. Seeking to contribute {objective} to a forward-thinking organization.",
      tone: 'humble',
      industry: 'any',
      yearsRange: '2-8'
    },
    {
      pattern: "Motivated {role} with foundational experience in {industry}. Skilled in {skills} with a passion for {goal}. Eager to apply knowledge and grow in a dynamic environment while contributing to {objective}.",
      tone: 'entry-level',
      industry: 'any',
      yearsRange: '0-2'
    }
  ];

  private readonly roleBasedTemplates: Record<string, any> = {
    'software_engineer': {
      roles: ['Software Engineer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer'],
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git'],
      achievements: ['developing scalable applications', 'optimizing system performance', 'leading development teams'],
      goals: ['building innovative solutions', 'solving complex technical challenges', 'advancing software architecture'],
      objectives: ['drive digital transformation', 'enhance user experiences', 'deliver robust applications']
    },
    'data_scientist': {
      roles: ['Data Scientist', 'ML Engineer', 'Data Analyst', 'Research Scientist'],
      skills: ['Python', 'R', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistical Analysis'],
      achievements: ['building predictive models', 'deriving actionable insights', 'improving data-driven decisions'],
      goals: ['advancing AI capabilities', 'uncovering data patterns', 'driving business intelligence'],
      objectives: ['optimize business processes', 'enhance decision-making', 'create intelligent systems']
    },
    'product_manager': {
      roles: ['Product Manager', 'Senior Product Manager', 'Product Owner', 'Product Lead'],
      skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis', 'Stakeholder Management'],
      achievements: ['launching successful products', 'driving user adoption', 'managing cross-functional teams'],
      goals: ['delivering user-centric solutions', 'driving product innovation', 'maximizing business value'],
      objectives: ['accelerate product growth', 'enhance user satisfaction', 'drive market expansion']
    },
    'marketing_manager': {
      roles: ['Marketing Manager', 'Digital Marketing Manager', 'Brand Manager', 'Marketing Lead'],
      skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics', 'Social Media', 'Campaign Management'],
      achievements: ['increasing brand awareness', 'driving lead generation', 'improving ROI'],
      goals: ['building strong brand presence', 'engaging target audiences', 'driving growth'],
      objectives: ['expand market reach', 'boost conversion rates', 'enhance brand loyalty']
    },
    'designer': {
      roles: ['UX Designer', 'UI Designer', 'Product Designer', 'Graphic Designer'],
      skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems'],
      achievements: ['creating intuitive interfaces', 'improving user experience', 'designing award-winning campaigns'],
      goals: ['crafting exceptional user experiences', 'solving design challenges', 'innovating visual solutions'],
      objectives: ['enhance user satisfaction', 'drive engagement', 'create memorable experiences']
    }
  };

  generateSummary(
    resumeData: EnhancedExtractedContent,
    targetRole?: string,
    tone: 'confident' | 'executive' | 'humble' | 'entry-level' = 'confident'
  ): {
    summary: string;
    alternatives: string[];
    improvements: string[];
    atsScore: number;
  } {
    console.log('🎯 Generating professional summary...');

    const roleKey = this.detectRole(resumeData, targetRole);
    const experienceYears = this.calculateExperienceYears(resumeData);
    const roleData = this.roleBasedTemplates[roleKey] || this.roleBasedTemplates['software_engineer'];

    // Select appropriate template based on experience and tone
    const template = this.selectTemplate(experienceYears, tone);
    
    // Generate primary summary
    const primarySummary = this.fillTemplate(template, resumeData, roleData, experienceYears);
    
    // Generate alternatives
    const alternatives = this.generateAlternatives(resumeData, roleData, experienceYears);
    
    // Generate improvements
    const improvements = this.generateImprovements(resumeData, primarySummary);
    
    // Calculate ATS score
    const atsScore = this.calculateATSScore(primarySummary, resumeData);

    return {
      summary: primarySummary,
      alternatives,
      improvements,
      atsScore
    };
  }

  private detectRole(resumeData: EnhancedExtractedContent, targetRole?: string): string {
    if (targetRole) {
      const normalizedRole = targetRole.toLowerCase().replace(/\s+/g, '_');
      if (this.roleBasedTemplates[normalizedRole]) {
        return normalizedRole;
      }
    }

    // Analyze experience to detect role
    const experienceText = resumeData.experience
      .map(exp => `${exp.jobTitle} ${exp.responsibilities.join(' ')}`)
      .join(' ')
      .toLowerCase();

    // Check for role keywords
    const roleKeywords = {
      'software_engineer': ['software', 'developer', 'engineer', 'programming', 'coding'],
      'data_scientist': ['data', 'analytics', 'machine learning', 'statistics', 'python'],
      'product_manager': ['product', 'manager', 'strategy', 'roadmap', 'stakeholder'],
      'marketing_manager': ['marketing', 'brand', 'campaign', 'digital', 'social media'],
      'designer': ['design', 'ui', 'ux', 'figma', 'adobe', 'creative']
    };

    for (const [role, keywords] of Object.entries(roleKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (experienceText.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score >= 2) {
        return role;
      }
    }

    return 'software_engineer'; // Default
  }

  private calculateExperienceYears(resumeData: EnhancedExtractedContent): number {
    let totalYears = 0;
    
    for (const exp of resumeData.experience) {
      const start = parseInt(exp.startDate) || 0;
      const end = exp.endDate.toLowerCase() === 'present' ? new Date().getFullYear() : (parseInt(exp.endDate) || 0);
      
      if (start > 0 && end > 0) {
        totalYears += Math.max(0, end - start);
      }
    }

    return Math.max(0, totalYears);
  }

  private selectTemplate(experienceYears: number, tone: 'confident' | 'executive' | 'humble' | 'entry-level'): SummaryTemplate {
    let filteredTemplates = this.summaryTemplates.filter(template => {
      if (template.tone === tone) return true;
      
      // Fallback logic
      if (experienceYears >= 8 && template.tone === 'executive') return true;
      if (experienceYears >= 3 && template.tone === 'confident') return true;
      if (experienceYears >= 1 && template.tone === 'humble') return true;
      if (experienceYears < 2 && template.tone === 'entry-level') return true;
      
      return false;
    });

    if (filteredTemplates.length === 0) {
      filteredTemplates = this.summaryTemplates.filter(t => t.tone === 'confident');
    }

    return filteredTemplates[0];
  }

  private fillTemplate(
    template: SummaryTemplate,
    resumeData: EnhancedExtractedContent,
    roleData: any,
    experienceYears: number
  ): string {
    const role = roleData.roles[0];
    const skills = resumeData.skills.technical.slice(0, 3).map(s => s.skill).join(', ');
    const achievement = roleData.achievements[Math.floor(Math.random() * roleData.achievements.length)];
    const goal = roleData.goals[Math.floor(Math.random() * roleData.goals.length)];
    const objective = roleData.objectives[Math.floor(Math.random() * roleData.objectives.length)];

    return template.pattern
      .replace('{role}', role)
      .replace('{experience}', experienceYears.toString())
      .replace('{industry}', this.detectIndustry(resumeData))
      .replace('{achievement}', achievement)
      .replace('{skills}', skills || 'modern technologies')
      .replace('{goal}', goal)
      .replace('{objective}', objective);
  }

  private detectIndustry(resumeData: EnhancedExtractedContent): string {
    const industryKeywords = {
      'technology': ['software', 'tech', 'programming', 'development', 'engineering'],
      'finance': ['finance', 'banking', 'investment', 'accounting', 'financial'],
      'healthcare': ['healthcare', 'medical', 'hospital', 'clinical', 'pharmaceutical'],
      'education': ['education', 'university', 'school', 'teaching', 'academic'],
      'retail': ['retail', 'commerce', 'sales', 'customer', 'store']
    };

    const experienceText = resumeData.experience
      .map(exp => `${exp.companyName} ${exp.responsibilities.join(' ')}`)
      .join(' ')
      .toLowerCase();

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => experienceText.includes(keyword))) {
        return industry;
      }
    }

    return 'technology'; // Default
  }

  private generateAlternatives(
    resumeData: EnhancedExtractedContent,
    roleData: any,
    experienceYears: number
  ): string[] {
    const alternatives = [];
    
    // Generate different tones
    const tones: Array<'confident' | 'executive' | 'humble' | 'entry-level'> = ['confident', 'executive', 'humble'];
    
    for (const tone of tones) {
      const template = this.selectTemplate(experienceYears, tone);
      const alternative = this.fillTemplate(template, resumeData, roleData, experienceYears);
      alternatives.push(alternative);
    }

    return alternatives.slice(0, 3); // Return top 3 alternatives
  }

  private generateImprovements(resumeData: EnhancedExtractedContent, summary: string): string[] {
    const improvements = [];

    // Check for quantifiable metrics
    if (!/\d+%|\d+\+|\$\d+/.test(summary)) {
      improvements.push('Consider adding quantifiable achievements or metrics to demonstrate impact');
    }

    // Check for industry keywords
    const industryKeywords = this.getIndustryKeywords(resumeData);
    const summaryLower = summary.toLowerCase();
    const missingKeywords = industryKeywords.filter(keyword => !summaryLower.includes(keyword));
    
    if (missingKeywords.length > 0) {
      improvements.push(`Consider including these industry keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
    }

    // Check length
    if (summary.length < 200) {
      improvements.push('Summary could be more detailed to better showcase your experience');
    } else if (summary.length > 400) {
      improvements.push('Consider shortening the summary for better readability');
    }

    // Check for passive voice
    if (summary.includes('was') || summary.includes('were')) {
      improvements.push('Use active voice to make the summary more impactful');
    }

    return improvements;
  }

  private getIndustryKeywords(resumeData: EnhancedExtractedContent): string[] {
    const role = this.detectRole(resumeData);
    const roleData = this.roleBasedTemplates[role];
    
    return roleData ? roleData.skills.slice(0, 5) : [];
  }

  private calculateATSScore(summary: string, resumeData: EnhancedExtractedContent): number {
    let score = 0;
    const maxScore = 100;

    // Industry keywords (30 points)
    const industryKeywords = this.getIndustryKeywords(resumeData);
    const keywordMatches = industryKeywords.filter(keyword => 
      summary.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    score += Math.min(30, (keywordMatches / industryKeywords.length) * 30);

    // Length (20 points)
    if (summary.length >= 200 && summary.length <= 400) {
      score += 20;
    } else if (summary.length >= 150 && summary.length <= 450) {
      score += 15;
    } else {
      score += 10;
    }

    // Quantifiable metrics (20 points)
    if (/\d+%|\d+\+|\$\d+|\d+x/.test(summary)) {
      score += 20;
    }

    // Action words (15 points)
    const actionWords = ['achieved', 'developed', 'led', 'managed', 'created', 'improved', 'optimized', 'delivered'];
    const actionWordMatches = actionWords.filter(word => 
      summary.toLowerCase().includes(word)
    ).length;
    score += Math.min(15, (actionWordMatches / actionWords.length) * 15);

    // Professional tone (15 points)
    if (!/\b(i|me|my)\b/i.test(summary)) {
      score += 15;
    }

    return Math.min(maxScore, Math.round(score));
  }
}
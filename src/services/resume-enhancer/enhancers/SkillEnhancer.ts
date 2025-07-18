import { EnhancedExtractedContent } from '../interfaces/EnhancedExtractedContent';

interface SkillSuggestion {
  skill: string;
  category: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface SkillEnhancementResult {
  enhancedSkills: EnhancedExtractedContent['skills'];
  suggestions: SkillSuggestion[];
  missingSkills: string[];
  skillGaps: Array<{
    skill: string;
    currentLevel: string;
    suggestedLevel: string;
    reasoning: string;
  }>;
  industryAlignment: number;
}

export class SkillEnhancer {
  private readonly skillTaxonomy = {
    'software_engineer': {
      'programming_languages': {
        essential: ['JavaScript', 'Python', 'Java', 'TypeScript'],
        recommended: ['Go', 'Rust', 'C++', 'C#', 'PHP', 'Ruby'],
        emerging: ['WebAssembly', 'Dart', 'Kotlin', 'Swift']
      },
      'frameworks_libraries': {
        essential: ['React', 'Node.js', 'Express', 'Next.js'],
        recommended: ['Vue.js', 'Angular', 'Django', 'Flask', 'Spring Boot'],
        emerging: ['Svelte', 'Astro', 'Remix', 'Solid.js']
      },
      'databases': {
        essential: ['SQL', 'PostgreSQL', 'MongoDB'],
        recommended: ['Redis', 'MySQL', 'Cassandra', 'Elasticsearch'],
        emerging: ['Supabase', 'PlanetScale', 'Neon', 'Vercel Postgres']
      },
      'cloud_devops': {
        essential: ['Git', 'Docker', 'AWS', 'CI/CD'],
        recommended: ['Kubernetes', 'Jenkins', 'Azure', 'GCP', 'Terraform'],
        emerging: ['Serverless', 'Edge Computing', 'Microservices', 'Service Mesh']
      },
      'soft_skills': {
        essential: ['Problem Solving', 'Communication', 'Team Collaboration', 'Adaptability'],
        recommended: ['Leadership', 'Mentoring', 'Project Management', 'Code Review'],
        emerging: ['Cross-functional Collaboration', 'Technical Writing', 'System Design']
      }
    },
    'data_scientist': {
      'programming_languages': {
        essential: ['Python', 'R', 'SQL'],
        recommended: ['Julia', 'Scala', 'Java'],
        emerging: ['Rust', 'Go']
      },
      'ml_frameworks': {
        essential: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'],
        recommended: ['Keras', 'XGBoost', 'LightGBM', 'Apache Spark'],
        emerging: ['Hugging Face', 'Weights & Biases', 'MLflow', 'Kubeflow']
      },
      'visualization': {
        essential: ['Matplotlib', 'Seaborn', 'Plotly'],
        recommended: ['Tableau', 'Power BI', 'D3.js', 'ggplot2'],
        emerging: ['Streamlit', 'Dash', 'Observable', 'Altair']
      },
      'cloud_platforms': {
        essential: ['AWS', 'Google Cloud', 'Azure'],
        recommended: ['Databricks', 'Snowflake', 'BigQuery'],
        emerging: ['Vertex AI', 'SageMaker', 'Azure ML']
      },
      'soft_skills': {
        essential: ['Analytical Thinking', 'Statistical Analysis', 'Communication', 'Problem Solving'],
        recommended: ['Business Acumen', 'Storytelling', 'Stakeholder Management'],
        emerging: ['Ethical AI', 'Model Interpretability', 'Data Governance']
      }
    },
    'product_manager': {
      'strategy_planning': {
        essential: ['Product Strategy', 'Roadmap Planning', 'Market Research', 'Competitive Analysis'],
        recommended: ['OKRs', 'KPIs', 'Metrics Analysis', 'A/B Testing'],
        emerging: ['Growth Hacking', 'Product-Led Growth', 'Jobs to be Done']
      },
      'technical_skills': {
        essential: ['SQL', 'Data Analysis', 'User Research', 'Prototyping'],
        recommended: ['Python', 'R', 'Tableau', 'Figma', 'Miro'],
        emerging: ['Machine Learning', 'AI/ML Product Management', 'No-Code Tools']
      },
      'methodologies': {
        essential: ['Agile', 'Scrum', 'Lean', 'Design Thinking'],
        recommended: ['Kanban', 'SAFe', 'Dual Track Agile', 'Continuous Discovery'],
        emerging: ['Product Operations', 'Design Systems', 'Platform Product Management']
      },
      'soft_skills': {
        essential: ['Leadership', 'Communication', 'Stakeholder Management', 'Strategic Thinking'],
        recommended: ['Negotiation', 'Influence', 'Empathy', 'Decision Making'],
        emerging: ['Change Management', 'Cultural Intelligence', 'Systems Thinking']
      }
    },
    'designer': {
      'design_tools': {
        essential: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Principle'],
        recommended: ['Framer', 'InVision', 'Zeplin', 'Miro'],
        emerging: ['Webflow', 'Notion', 'Linear', 'Spline']
      },
      'design_methods': {
        essential: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing'],
        recommended: ['Design Systems', 'Information Architecture', 'Interaction Design'],
        emerging: ['Voice UI', 'AR/VR Design', 'Ethical Design', 'Inclusive Design']
      },
      'technical_skills': {
        essential: ['HTML', 'CSS', 'Design Systems'],
        recommended: ['JavaScript', 'React', 'Animation', 'Responsive Design'],
        emerging: ['WebGL', 'Three.js', 'Motion Design', 'No-Code Development']
      },
      'soft_skills': {
        essential: ['Creativity', 'Attention to Detail', 'Communication', 'Empathy'],
        recommended: ['Collaboration', 'Storytelling', 'Presentation', 'Feedback'],
        emerging: ['Design Leadership', 'Business Acumen', 'Strategic Design']
      }
    }
  };

  private readonly skillRelationships = {
    'React': ['JavaScript', 'TypeScript', 'JSX', 'Redux', 'React Router'],
    'Node.js': ['JavaScript', 'Express', 'npm', 'API Development'],
    'Python': ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy'],
    'AWS': ['EC2', 'S3', 'Lambda', 'RDS', 'CloudFormation'],
    'Machine Learning': ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Statistics'],
    'Docker': ['Kubernetes', 'DevOps', 'Containerization', 'CI/CD'],
    'SQL': ['Database Design', 'PostgreSQL', 'MySQL', 'Data Analysis'],
    'Product Management': ['Agile', 'Scrum', 'User Research', 'A/B Testing', 'Analytics']
  };

  enhanceSkills(
    resumeData: EnhancedExtractedContent,
    targetRole?: string,
    industryFocus?: string
  ): SkillEnhancementResult {
    console.log('🔧 Enhancing skills for better industry alignment...');

    const role = this.detectRole(resumeData, targetRole);
    const roleSkills = this.skillTaxonomy[role] || this.skillTaxonomy['software_engineer'];
    
    // Analyze current skills
    const currentSkills = this.analyzeCurrentSkills(resumeData);
    
    // Generate skill suggestions
    const suggestions = this.generateSkillSuggestions(currentSkills, roleSkills, role);
    
    // Find missing critical skills
    const missingSkills = this.findMissingSkills(currentSkills, roleSkills);
    
    // Identify skill gaps
    const skillGaps = this.identifySkillGaps(currentSkills, roleSkills);
    
    // Enhanced skills with suggestions
    const enhancedSkills = this.combineSkills(resumeData.skills, suggestions);
    
    // Calculate industry alignment
    const industryAlignment = this.calculateIndustryAlignment(enhancedSkills, roleSkills);

    return {
      enhancedSkills,
      suggestions,
      missingSkills,
      skillGaps,
      industryAlignment
    };
  }

  private detectRole(resumeData: EnhancedExtractedContent, targetRole?: string): string {
    if (targetRole && this.skillTaxonomy[targetRole.toLowerCase().replace(/\s+/g, '_')]) {
      return targetRole.toLowerCase().replace(/\s+/g, '_');
    }

    const experienceText = resumeData.experience
      .map(exp => `${exp.jobTitle} ${exp.responsibilities.join(' ')}`)
      .join(' ')
      .toLowerCase();

    const skillsText = [
      ...resumeData.skills.technical.map(s => s.skill),
      ...resumeData.skills.soft.map(s => s.skill)
    ].join(' ').toLowerCase();

    const combinedText = experienceText + ' ' + skillsText;

    const roleKeywords = {
      'software_engineer': ['software', 'developer', 'engineer', 'programming', 'coding', 'javascript', 'python', 'react'],
      'data_scientist': ['data', 'analytics', 'machine learning', 'statistics', 'python', 'sql', 'tensorflow'],
      'product_manager': ['product', 'manager', 'strategy', 'roadmap', 'stakeholder', 'agile', 'scrum'],
      'designer': ['design', 'ui', 'ux', 'figma', 'sketch', 'adobe', 'creative', 'wireframe']
    };

    let bestMatch = 'software_engineer';
    let highestScore = 0;

    for (const [role, keywords] of Object.entries(roleKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (combinedText.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = role;
      }
    }

    return bestMatch;
  }

  private analyzeCurrentSkills(resumeData: EnhancedExtractedContent): {
    technical: Map<string, string>;
    soft: Map<string, string>;
    categories: Map<string, string[]>;
  } {
    const technical = new Map<string, string>();
    const soft = new Map<string, string>();
    const categories = new Map<string, string[]>();

    // Process technical skills
    resumeData.skills.technical.forEach(skill => {
      technical.set(skill.skill, skill.proficiency);
      
      if (skill.category) {
        if (!categories.has(skill.category)) {
          categories.set(skill.category, []);
        }
        categories.get(skill.category)!.push(skill.skill);
      }
    });

    // Process soft skills
    resumeData.skills.soft.forEach(skill => {
      soft.set(skill.skill, skill.proficiency);
    });

    return { technical, soft, categories };
  }

  private generateSkillSuggestions(
    currentSkills: any,
    roleSkills: any,
    role: string
  ): SkillSuggestion[] {
    const suggestions: SkillSuggestion[] = [];

    // Analyze each skill category
    for (const [category, skills] of Object.entries(roleSkills)) {
      const categorySkills = skills as any;
      
      // Essential skills (highest priority)
      categorySkills.essential?.forEach((skill: string) => {
        if (!currentSkills.technical.has(skill) && !currentSkills.soft.has(skill)) {
          suggestions.push({
            skill,
            category,
            reasoning: `Essential skill for ${role.replace('_', ' ')} role`,
            priority: 'critical',
            proficiency: 'intermediate'
          });
        }
      });

      // Recommended skills
      categorySkills.recommended?.forEach((skill: string) => {
        if (!currentSkills.technical.has(skill) && !currentSkills.soft.has(skill)) {
          suggestions.push({
            skill,
            category,
            reasoning: `Highly recommended for ${role.replace('_', ' ')} role`,
            priority: 'high',
            proficiency: 'intermediate'
          });
        }
      });

      // Emerging skills
      categorySkills.emerging?.forEach((skill: string) => {
        if (!currentSkills.technical.has(skill) && !currentSkills.soft.has(skill)) {
          suggestions.push({
            skill,
            category,
            reasoning: `Emerging skill that demonstrates forward-thinking`,
            priority: 'medium',
            proficiency: 'beginner'
          });
        }
      });
    }

    // Add complementary skills based on existing skills
    this.addComplementarySkills(currentSkills, suggestions);

    return suggestions.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private addComplementarySkills(currentSkills: any, suggestions: SkillSuggestion[]): void {
    // Look for skill relationships
    for (const [skill, proficiency] of currentSkills.technical) {
      if (this.skillRelationships[skill]) {
        this.skillRelationships[skill].forEach(relatedSkill => {
          if (!currentSkills.technical.has(relatedSkill) && 
              !suggestions.some(s => s.skill === relatedSkill)) {
            suggestions.push({
              skill: relatedSkill,
              category: 'complementary',
              reasoning: `Complements your existing ${skill} knowledge`,
              priority: 'medium',
              proficiency: 'beginner'
            });
          }
        });
      }
    }
  }

  private findMissingSkills(currentSkills: any, roleSkills: any): string[] {
    const missing: string[] = [];

    for (const [category, skills] of Object.entries(roleSkills)) {
      const categorySkills = skills as any;
      
      // Focus on essential skills
      categorySkills.essential?.forEach((skill: string) => {
        if (!currentSkills.technical.has(skill) && !currentSkills.soft.has(skill)) {
          missing.push(skill);
        }
      });
    }

    return missing;
  }

  private identifySkillGaps(currentSkills: any, roleSkills: any): Array<{
    skill: string;
    currentLevel: string;
    suggestedLevel: string;
    reasoning: string;
  }> {
    const gaps = [];

    for (const [skill, currentLevel] of currentSkills.technical) {
      // Check if this skill should be at a higher level
      let suggestedLevel = this.getSuggestedLevel(skill, roleSkills);
      
      if (this.shouldUpgradeSkill(currentLevel, suggestedLevel)) {
        gaps.push({
          skill,
          currentLevel,
          suggestedLevel,
          reasoning: `This skill is essential for senior roles and should be at ${suggestedLevel} level`
        });
      }
    }

    return gaps;
  }

  private getSuggestedLevel(skill: string, roleSkills: any): string {
    for (const [category, skills] of Object.entries(roleSkills)) {
      const categorySkills = skills as any;
      
      if (categorySkills.essential?.includes(skill)) {
        return 'advanced';
      } else if (categorySkills.recommended?.includes(skill)) {
        return 'intermediate';
      } else if (categorySkills.emerging?.includes(skill)) {
        return 'beginner';
      }
    }
    
    return 'intermediate';
  }

  private shouldUpgradeSkill(currentLevel: string, suggestedLevel: string): boolean {
    const levelOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    return levelOrder[currentLevel] < levelOrder[suggestedLevel];
  }

  private combineSkills(
    originalSkills: EnhancedExtractedContent['skills'],
    suggestions: SkillSuggestion[]
  ): EnhancedExtractedContent['skills'] {
    const enhancedSkills = {
      technical: [...originalSkills.technical],
      soft: [...originalSkills.soft],
      languages: [...originalSkills.languages]
    };

    // Add top suggestions to skills
    const topSuggestions = suggestions
      .filter(s => s.priority === 'critical' || s.priority === 'high')
      .slice(0, 10);

    topSuggestions.forEach(suggestion => {
      if (suggestion.category === 'soft_skills') {
        enhancedSkills.soft.push({
          skill: suggestion.skill,
          proficiency: suggestion.proficiency
        });
      } else {
        enhancedSkills.technical.push({
          skill: suggestion.skill,
          proficiency: suggestion.proficiency,
          category: suggestion.category
        });
      }
    });

    return enhancedSkills;
  }

  private calculateIndustryAlignment(
    enhancedSkills: EnhancedExtractedContent['skills'],
    roleSkills: any
  ): number {
    let totalSkills = 0;
    let alignedSkills = 0;

    const allSkills = [
      ...enhancedSkills.technical.map(s => s.skill),
      ...enhancedSkills.soft.map(s => s.skill)
    ];

    // Check alignment with role skills
    for (const [category, skills] of Object.entries(roleSkills)) {
      const categorySkills = skills as any;
      
      categorySkills.essential?.forEach((skill: string) => {
        totalSkills += 3; // Weight essential skills more
        if (allSkills.includes(skill)) {
          alignedSkills += 3;
        }
      });

      categorySkills.recommended?.forEach((skill: string) => {
        totalSkills += 2;
        if (allSkills.includes(skill)) {
          alignedSkills += 2;
        }
      });

      categorySkills.emerging?.forEach((skill: string) => {
        totalSkills += 1;
        if (allSkills.includes(skill)) {
          alignedSkills += 1;
        }
      });
    }

    return totalSkills > 0 ? Math.round((alignedSkills / totalSkills) * 100) : 0;
  }

  // Public method to get skill recommendations for a specific role
  getSkillRecommendations(role: string): any {
    return this.skillTaxonomy[role.toLowerCase().replace(/\s+/g, '_')] || 
           this.skillTaxonomy['software_engineer'];
  }

  // Public method to get complementary skills for a given skill
  getComplementarySkills(skill: string): string[] {
    return this.skillRelationships[skill] || [];
  }
}
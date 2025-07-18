import { EnhancedExtractedContent } from '../interfaces/EnhancedExtractedContent';

interface TransformationRule {
  pattern: RegExp;
  replacement: string;
  category: 'verb' | 'impact' | 'structure' | 'quantification';
  strength: number;
}

export class AchievementTransformer {
  private readonly transformationRules: TransformationRule[] = [
    // Verb improvements
    { pattern: /\b(responsible for|handled|did|worked on)\b/gi, replacement: 'led', category: 'verb', strength: 3 },
    { pattern: /\b(helped|assisted)\b/gi, replacement: 'collaborated on', category: 'verb', strength: 2 },
    { pattern: /\b(managed|oversaw)\b/gi, replacement: 'spearheaded', category: 'verb', strength: 4 },
    { pattern: /\b(participated in|involved in)\b/gi, replacement: 'played a key role in', category: 'verb', strength: 3 },
    { pattern: /\b(created|made)\b/gi, replacement: 'developed', category: 'verb', strength: 3 },
    { pattern: /\b(fixed|resolved)\b/gi, replacement: 'optimized', category: 'verb', strength: 4 },
    { pattern: /\b(used|utilized)\b/gi, replacement: 'leveraged', category: 'verb', strength: 2 },
    { pattern: /\b(coordinated|organized)\b/gi, replacement: 'orchestrated', category: 'verb', strength: 4 },
    { pattern: /\b(improved|enhanced)\b/gi, replacement: 'transformed', category: 'verb', strength: 4 },
    { pattern: /\b(completed|finished)\b/gi, replacement: 'delivered', category: 'verb', strength: 3 },

    // Impact improvements
    { pattern: /\b(good|nice|great)\b/gi, replacement: 'exceptional', category: 'impact', strength: 3 },
    { pattern: /\b(fast|quick)\b/gi, replacement: 'efficient', category: 'impact', strength: 2 },
    { pattern: /\b(big|large)\b/gi, replacement: 'significant', category: 'impact', strength: 3 },
    { pattern: /\b(small|minor)\b/gi, replacement: 'targeted', category: 'impact', strength: 2 },
    { pattern: /\b(new|fresh)\b/gi, replacement: 'innovative', category: 'impact', strength: 4 },
    { pattern: /\b(old|outdated)\b/gi, replacement: 'legacy', category: 'impact', strength: 2 },

    // Structure improvements
    { pattern: /\b(a lot of|lots of|many)\b/gi, replacement: 'numerous', category: 'structure', strength: 2 },
    { pattern: /\b(etc\.?|and so on)\b/gi, replacement: '', category: 'structure', strength: 1 },
    { pattern: /\b(like|such as)\b/gi, replacement: 'including', category: 'structure', strength: 1 },
    { pattern: /\b(got|received)\b/gi, replacement: 'achieved', category: 'structure', strength: 3 },
    { pattern: /\b(went|moved)\b/gi, replacement: 'transitioned', category: 'structure', strength: 2 },
  ];

  private readonly impactFrameworks = [
    'Achieved {result} by {action}, resulting in {impact}',
    'Led {action} that delivered {result}, improving {metric} by {percentage}',
    'Spearheaded {action} to {result}, generating {impact}',
    'Developed {solution} that {result}, resulting in {impact}',
    'Optimized {process} through {action}, achieving {result}',
    'Transformed {area} by {action}, delivering {result}',
    'Implemented {solution} that {result}, improving {metric}',
    'Collaborated with {team} to {action}, resulting in {impact}'
  ];

  private readonly industryMetrics = {
    'technology': ['performance', 'efficiency', 'user engagement', 'system reliability', 'code quality', 'deployment speed'],
    'sales': ['revenue', 'conversion rate', 'customer acquisition', 'deal closure', 'territory growth', 'client retention'],
    'marketing': ['brand awareness', 'lead generation', 'engagement rate', 'ROI', 'campaign performance', 'audience reach'],
    'finance': ['cost reduction', 'profit margin', 'accuracy', 'compliance', 'risk mitigation', 'process efficiency'],
    'operations': ['productivity', 'cost savings', 'process improvement', 'quality score', 'turnaround time', 'resource utilization']
  };

  private readonly quantificationSuggestions = [
    '25% improvement', '30% increase', '50% reduction', '40% growth', '60% efficiency gain',
    '2x faster', '3x more efficient', '10x scale', '5x performance boost',
    '$100K+ savings', '$50K revenue', '$25K cost reduction', '$75K increase',
    '1000+ users', '500+ customers', '200+ projects', '100+ team members',
    '95% accuracy', '99% uptime', '90% satisfaction', '85% adoption rate'
  ];

  transformAchievements(resumeData: EnhancedExtractedContent): {
    transformedResume: EnhancedExtractedContent;
    improvements: Array<{
      section: string;
      original: string;
      transformed: string;
      impact: string;
      confidence: number;
    }>;
    overallScore: number;
  } {
    console.log('🚀 Transforming achievements to outcome-driven format...');

    const improvements = [];
    let totalTransformations = 0;
    let highImpactTransformations = 0;

    // Transform experience section
    const transformedExperience = resumeData.experience.map(exp => {
      const transformedResponsibilities = exp.responsibilities.map(responsibility => {
        const transformation = this.transformSingleAchievement(responsibility, exp.jobTitle);
        if (transformation.wasTransformed) {
          improvements.push({
            section: 'Experience',
            original: responsibility,
            transformed: transformation.result,
            impact: transformation.impactDescription,
            confidence: transformation.confidence
          });
          totalTransformations++;
          if (transformation.confidence >= 0.8) {
            highImpactTransformations++;
          }
        }
        return transformation.result;
      });

      return {
        ...exp,
        responsibilities: transformedResponsibilities,
        achievements: this.generateAchievements(exp, transformedResponsibilities)
      };
    });

    // Transform projects section
    const transformedProjects = resumeData.projects.map(project => {
      const transformedDescription = this.transformSingleAchievement(project.description, 'project');
      if (transformedDescription.wasTransformed) {
        improvements.push({
          section: 'Projects',
          original: project.description,
          transformed: transformedDescription.result,
          impact: transformedDescription.impactDescription,
          confidence: transformedDescription.confidence
        });
        totalTransformations++;
        if (transformedDescription.confidence >= 0.8) {
          highImpactTransformations++;
        }
      }

      return {
        ...project,
        description: transformedDescription.result,
        achievements: this.generateProjectAchievements(project)
      };
    });

    // Calculate overall score
    const overallScore = this.calculateTransformationScore(totalTransformations, highImpactTransformations, improvements.length);

    return {
      transformedResume: {
        ...resumeData,
        experience: transformedExperience,
        projects: transformedProjects
      },
      improvements,
      overallScore
    };
  }

  private transformSingleAchievement(text: string, context: string): {
    result: string;
    wasTransformed: boolean;
    confidence: number;
    impactDescription: string;
  } {
    let transformedText = text;
    let transformationCount = 0;
    let totalStrength = 0;

    // Apply transformation rules
    for (const rule of this.transformationRules) {
      const originalText = transformedText;
      transformedText = transformedText.replace(rule.pattern, rule.replacement);
      
      if (originalText !== transformedText) {
        transformationCount++;
        totalStrength += rule.strength;
      }
    }

    // Add quantification if missing
    if (!/\d+%|\d+\+|\$\d+/.test(transformedText)) {
      transformedText = this.addQuantification(transformedText, context);
      transformationCount++;
      totalStrength += 3;
    }

    // Improve structure using action-result pattern
    if (!this.hasActionResultPattern(transformedText)) {
      transformedText = this.addActionResultPattern(transformedText, context);
      transformationCount++;
      totalStrength += 4;
    }

    // Clean up the text
    transformedText = this.cleanupText(transformedText);

    const wasTransformed = transformationCount > 0;
    const confidence = Math.min(1.0, (totalStrength / (transformationCount * 4)) || 0);
    const impactDescription = this.generateImpactDescription(transformationCount, totalStrength);

    return {
      result: transformedText,
      wasTransformed,
      confidence,
      impactDescription
    };
  }

  private addQuantification(text: string, context: string): string {
    // Don't add quantification if it already exists
    if (/\d+%|\d+\+|\$\d+|\d+x/.test(text)) {
      return text;
    }

    const suggestion = this.quantificationSuggestions[
      Math.floor(Math.random() * this.quantificationSuggestions.length)
    ];

    // Add contextual quantification
    if (text.toLowerCase().includes('improve') || text.toLowerCase().includes('increase')) {
      return `${text}, achieving ${suggestion}`;
    } else if (text.toLowerCase().includes('reduce') || text.toLowerCase().includes('decrease')) {
      return `${text}, resulting in ${suggestion}`;
    } else if (text.toLowerCase().includes('develop') || text.toLowerCase().includes('create')) {
      return `${text}, supporting ${suggestion} in usage`;
    } else {
      return `${text}, resulting in ${suggestion}`;
    }
  }

  private hasActionResultPattern(text: string): boolean {
    const patterns = [
      /\w+ed.*resulting in/i,
      /\w+ed.*achieving/i,
      /\w+ed.*leading to/i,
      /\w+ed.*improving/i,
      /\w+ed.*by \d+/i
    ];

    return patterns.some(pattern => pattern.test(text));
  }

  private addActionResultPattern(text: string, context: string): string {
    const frameworks = this.impactFrameworks;
    const randomFramework = frameworks[Math.floor(Math.random() * frameworks.length)];

    // Extract key elements from the text
    const action = this.extractAction(text);
    const result = this.extractResult(text, context);
    const impact = this.generateImpact(context);

    // If we can't extract clear elements, use a simple pattern
    if (!action || !result) {
      return `${text}, resulting in improved ${this.getContextualMetric(context)}`;
    }

    return randomFramework
      .replace('{action}', action)
      .replace('{result}', result)
      .replace('{impact}', impact)
      .replace('{metric}', this.getContextualMetric(context))
      .replace('{percentage}', this.getRandomPercentage())
      .replace('{solution}', this.extractSolution(text))
      .replace('{process}', this.extractProcess(text))
      .replace('{area}', this.extractArea(text))
      .replace('{team}', this.extractTeam(text));
  }

  private extractAction(text: string): string {
    const actionWords = ['developed', 'led', 'managed', 'created', 'improved', 'optimized', 'implemented', 'designed'];
    const words = text.toLowerCase().split(' ');
    
    for (const word of words) {
      if (actionWords.includes(word)) {
        const index = text.toLowerCase().indexOf(word);
        return text.substring(index, index + word.length + 20).trim();
      }
    }
    
    return 'key initiatives';
  }

  private extractResult(text: string, context: string): string {
    if (text.toLowerCase().includes('application')) return 'scalable application';
    if (text.toLowerCase().includes('system')) return 'robust system';
    if (text.toLowerCase().includes('process')) return 'streamlined process';
    if (text.toLowerCase().includes('team')) return 'high-performing team';
    if (text.toLowerCase().includes('product')) return 'innovative product';
    
    return 'successful outcome';
  }

  private generateImpact(context: string): string {
    const impacts = {
      'technology': 'enhanced system performance',
      'sales': 'increased revenue generation',
      'marketing': 'improved brand engagement',
      'finance': 'optimized cost efficiency',
      'operations': 'streamlined workflow'
    };

    return impacts[context] || 'significant business value';
  }

  private getContextualMetric(context: string): string {
    const metrics = this.industryMetrics[context] || this.industryMetrics['technology'];
    return metrics[Math.floor(Math.random() * metrics.length)];
  }

  private getRandomPercentage(): string {
    const percentages = ['25%', '30%', '40%', '50%', '35%', '45%'];
    return percentages[Math.floor(Math.random() * percentages.length)];
  }

  private extractSolution(text: string): string {
    if (text.toLowerCase().includes('api')) return 'API solution';
    if (text.toLowerCase().includes('database')) return 'database optimization';
    if (text.toLowerCase().includes('ui')) return 'user interface';
    return 'technical solution';
  }

  private extractProcess(text: string): string {
    if (text.toLowerCase().includes('deployment')) return 'deployment process';
    if (text.toLowerCase().includes('testing')) return 'testing workflow';
    if (text.toLowerCase().includes('development')) return 'development pipeline';
    return 'operational process';
  }

  private extractArea(text: string): string {
    if (text.toLowerCase().includes('performance')) return 'system performance';
    if (text.toLowerCase().includes('security')) return 'security protocols';
    if (text.toLowerCase().includes('user')) return 'user experience';
    return 'operational efficiency';
  }

  private extractTeam(text: string): string {
    if (text.toLowerCase().includes('cross-functional')) return 'cross-functional teams';
    if (text.toLowerCase().includes('development')) return 'development teams';
    if (text.toLowerCase().includes('product')) return 'product teams';
    return 'stakeholder teams';
  }

  private generateAchievements(exp: any, responsibilities: string[]): string[] {
    const achievements = [];
    
    // Generate achievements based on responsibilities
    for (const responsibility of responsibilities) {
      if (responsibility.includes('led') || responsibility.includes('spearheaded')) {
        achievements.push(`Successfully delivered project outcomes ahead of schedule`);
      }
      if (responsibility.includes('optimized') || responsibility.includes('improved')) {
        achievements.push(`Achieved measurable performance improvements`);
      }
      if (responsibility.includes('developed') || responsibility.includes('created')) {
        achievements.push(`Delivered innovative solutions meeting business requirements`);
      }
    }

    return achievements.slice(0, 3); // Limit to 3 achievements
  }

  private generateProjectAchievements(project: any): string[] {
    const achievements = [];
    
    if (project.technologies && project.technologies.length > 0) {
      achievements.push(`Leveraged ${project.technologies.length}+ technologies for optimal solution`);
    }
    
    if (project.githubUrl) {
      achievements.push(`Open-sourced solution with community engagement`);
    }
    
    if (project.liveUrl) {
      achievements.push(`Deployed production-ready application with user adoption`);
    }

    return achievements;
  }

  private cleanupText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*\.\s*/g, '. ')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  }

  private generateImpactDescription(transformationCount: number, totalStrength: number): string {
    if (transformationCount === 0) {
      return 'No transformations applied';
    }

    const avgStrength = totalStrength / transformationCount;
    
    if (avgStrength >= 3.5) {
      return 'High-impact transformation with strong action words and quantifiable results';
    } else if (avgStrength >= 2.5) {
      return 'Moderate transformation with improved professional language';
    } else {
      return 'Basic transformation with minor improvements';
    }
  }

  private calculateTransformationScore(total: number, highImpact: number, improvements: number): number {
    const baseScore = Math.min(50, total * 5);
    const impactBonus = Math.min(30, highImpact * 10);
    const improvementBonus = Math.min(20, improvements * 2);
    
    return Math.min(100, baseScore + impactBonus + improvementBonus);
  }
}
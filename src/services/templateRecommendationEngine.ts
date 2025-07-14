import { 
  TemplateMetadata, 
  TemplateRecommendation, 
  RecommendationRequest,
  Industry,
  ExperienceLevel
} from '@/types/resume-templates';
import { enhancedTemplateLibrary } from '@/data/enhancedTemplateLibrary';

export class TemplateRecommendationEngine {
  private templates: TemplateMetadata[];

  constructor() {
    this.templates = enhancedTemplateLibrary;
  }

  /**
   * Generate smart template recommendations based on user input
   */
  generateRecommendations(request: RecommendationRequest): TemplateRecommendation[] {
    const scoredTemplates = this.templates.map(template => ({
      template,
      score: this.calculateCompatibilityScore(template, request),
      reasons: this.generateReasons(template, request)
    }));

    // Sort by score and take top recommendations
    const sorted = scoredTemplates
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Top 8 recommendations

    // Categorize recommendations
    return sorted.map(item => ({
      ...item,
      category: this.categorizeRecommendation(item.score)
    }));
  }

  /**
   * Calculate compatibility score for a template based on user requirements
   */
  private calculateCompatibilityScore(template: TemplateMetadata, request: RecommendationRequest): number {
    let score = 0;
    const weights = {
      industry: 25,
      experienceLevel: 20,
      atsRequirement: 20,
      designPreference: 15,
      roleMatch: 10,
      popularity: 5,
      rating: 5
    };

    // Industry match
    if (request.industry && template.industry.includes(request.industry)) {
      score += weights.industry;
    }

    // Experience level match
    if (request.experienceLevel && template.experienceLevel.includes(request.experienceLevel)) {
      score += weights.experienceLevel;
    }

    // ATS requirement match
    if (request.atsRequirement) {
      const atsScore = this.normalizeAtsScore(template.atsScore, request.atsRequirement);
      score += weights.atsRequirement * atsScore;
    }

    // Design preference match
    if (request.designPreference) {
      const designScore = this.calculateDesignPreferenceScore(template, request.designPreference);
      score += weights.designPreference * designScore;
    }

    // Role match
    if (request.jobTitle) {
      const roleScore = this.calculateRoleMatchScore(template, request.jobTitle);
      score += weights.roleMatch * roleScore;
    }

    // Popularity and rating
    const popularityScore = Math.min(template.usageCount / 20000, 1); // Normalize to 0-1
    const ratingScore = template.rating / 5; // Normalize to 0-1
    
    score += weights.popularity * popularityScore;
    score += weights.rating * ratingScore;

    return Math.round(score);
  }

  /**
   * Normalize ATS score based on requirement level
   */
  private normalizeAtsScore(templateAtsScore: number, requirement: string): number {
    switch (requirement) {
      case 'critical':
        return templateAtsScore >= 95 ? 1 : templateAtsScore >= 90 ? 0.7 : 0.3;
      case 'important':
        return templateAtsScore >= 85 ? 1 : templateAtsScore >= 80 ? 0.8 : 0.5;
      case 'flexible':
        return templateAtsScore >= 75 ? 1 : 0.8;
      default:
        return 0.8;
    }
  }

  /**
   * Calculate design preference compatibility score
   */
  private calculateDesignPreferenceScore(template: TemplateMetadata, preference: string): number {
    const conservativeTemplates = ['classic-ats', 'executive-leadership'];
    const modernTemplates = ['modern-stylish', 'industry-specific'];
    const creativeTemplates = ['creative-portfolio', 'experience-based'];

    switch (preference) {
      case 'conservative':
        return conservativeTemplates.includes(template.category) ? 1 : 0.5;
      case 'modern':
        return modernTemplates.includes(template.category) ? 1 : 0.7;
      case 'creative':
        return creativeTemplates.includes(template.category) ? 1 : 0.6;
      default:
        return 0.7;
    }
  }

  /**
   * Calculate role match score based on job title
   */
  private calculateRoleMatchScore(template: TemplateMetadata, jobTitle: string): number {
    const normalizedTitle = jobTitle.toLowerCase();
    const roleMatches = template.bestForRoles.some(role => 
      normalizedTitle.includes(role.toLowerCase()) || 
      role.toLowerCase().includes(normalizedTitle)
    );
    
    return roleMatches ? 1 : 0.3;
  }

  /**
   * Generate reasons for recommendation
   */
  private generateReasons(template: TemplateMetadata, request: RecommendationRequest): string[] {
    const reasons: string[] = [];

    // Industry alignment
    if (request.industry && template.industry.includes(request.industry)) {
      reasons.push(`Optimized for ${request.industry} industry`);
    }

    // Experience level match
    if (request.experienceLevel && template.experienceLevel.includes(request.experienceLevel)) {
      reasons.push(`Perfect for ${request.experienceLevel.replace('-', ' ')} professionals`);
    }

    // ATS optimization
    if (template.atsScore >= 95) {
      reasons.push(`Excellent ATS compatibility (${template.atsScore}%)`);
    } else if (template.atsScore >= 85) {
      reasons.push(`Good ATS optimization (${template.atsScore}%)`);
    }

    // High rating
    if (template.rating >= 4.7) {
      reasons.push(`Highly rated by users (${template.rating}/5)`);
    }

    // Popular choice
    if (template.usageCount > 10000) {
      reasons.push('Popular choice among professionals');
    }

    // Premium features
    if (template.isPremium) {
      reasons.push('Advanced design features available');
    }

    // New template
    if (template.isNewTemplate) {
      reasons.push('Latest design trends');
    }

    return reasons.slice(0, 3); // Limit to top 3 reasons
  }

  /**
   * Categorize recommendation based on score
   */
  private categorizeRecommendation(score: number): 'perfect-match' | 'good-fit' | 'alternative' {
    if (score >= 80) return 'perfect-match';
    if (score >= 60) return 'good-fit';
    return 'alternative';
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): TemplateMetadata[] {
    if (category === 'all') return this.templates;
    return this.templates.filter(template => template.category === category);
  }

  /**
   * Get templates by experience level
   */
  getTemplatesByExperience(level: ExperienceLevel): TemplateMetadata[] {
    return this.templates.filter(template => 
      template.experienceLevel.includes(level)
    );
  }

  /**
   * Get templates by industry
   */
  getTemplatesByIndustry(industry: Industry): TemplateMetadata[] {
    return this.templates.filter(template => 
      template.industry.includes(industry)
    );
  }

  /**
   * Get popular templates
   */
  getPopularTemplates(limit: number = 6): TemplateMetadata[] {
    return this.templates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Get new templates
   */
  getNewTemplates(limit: number = 4): TemplateMetadata[] {
    return this.templates
      .filter(template => template.isNewTemplate)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): TemplateMetadata | undefined {
    return this.templates.find(template => template.id === id);
  }

  /**
   * Search templates by name or tags
   */
  searchTemplates(query: string): TemplateMetadata[] {
    const normalizedQuery = query.toLowerCase();
    return this.templates.filter(template => 
      template.name.toLowerCase().includes(normalizedQuery) ||
      template.description.toLowerCase().includes(normalizedQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
      template.bestForRoles.some(role => role.toLowerCase().includes(normalizedQuery))
    );
  }
}

// Export singleton instance
export const templateRecommendationEngine = new TemplateRecommendationEngine();
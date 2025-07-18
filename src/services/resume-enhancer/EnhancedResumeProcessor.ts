import { EnhancedExtractedContent, EnhancementScore } from './interfaces/EnhancedExtractedContent';
import { EnhancedResumeExtractor } from './extractors/EnhancedResumeExtractor';
import { ProfessionalSummaryGenerator } from './enhancers/ProfessionalSummaryGenerator';
import { AchievementTransformer } from './enhancers/AchievementTransformer';
import { ATSScanner } from './enhancers/ATSScanner';
import { SkillEnhancer } from './enhancers/SkillEnhancer';
import { toast } from 'sonner';

export interface EnhancedProcessingResult {
  extractedContent: EnhancedExtractedContent;
  enhancedContent: EnhancedExtractedContent;
  enhancementScore: EnhancementScore;
  recommendations: Array<{
    category: string;
    suggestion: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
  }>;
  processingLog: string[];
}

export class EnhancedResumeProcessor {
  private extractor: EnhancedResumeExtractor;
  private summaryGenerator: ProfessionalSummaryGenerator;
  private achievementTransformer: AchievementTransformer;
  private atsScanner: ATSScanner;
  private skillEnhancer: SkillEnhancer;

  constructor() {
    this.extractor = new EnhancedResumeExtractor();
    this.summaryGenerator = new ProfessionalSummaryGenerator();
    this.achievementTransformer = new AchievementTransformer();
    this.atsScanner = new ATSScanner();
    this.skillEnhancer = new SkillEnhancer();
  }

  async processResume(
    file: File,
    options: {
      targetRole?: string;
      jobDescription?: string;
      tone?: 'confident' | 'executive' | 'humble' | 'entry-level';
      enhancementLevel?: 'basic' | 'standard' | 'comprehensive';
    } = {}
  ): Promise<EnhancedProcessingResult> {
    console.log('🚀 Starting enhanced resume processing...');
    
    const processingLog: string[] = [];
    const startTime = Date.now();

    try {
      // Step 1: Extract content from file
      processingLog.push('📄 Extracting content from resume file...');
      const extractedContent = await this.extractor.extractFromFile(file);
      processingLog.push(`✅ Extracted ${this.countSections(extractedContent)} sections successfully`);

      // Step 2: Enhance professional summary
      processingLog.push('✨ Generating enhanced professional summary...');
      const summaryResult = this.summaryGenerator.generateSummary(
        extractedContent,
        options.targetRole,
        options.tone || 'confident'
      );
      
      const enhancedContent = { ...extractedContent };
      enhancedContent.professionalSummary = {
        ...enhancedContent.professionalSummary,
        content: summaryResult.summary
      };
      processingLog.push(`✅ Generated summary with ${summaryResult.atsScore}% ATS score`);

      // Step 3: Transform achievements (if comprehensive enhancement)
      if (options.enhancementLevel === 'comprehensive') {
        processingLog.push('🎯 Transforming achievements to outcome-driven format...');
        const achievementResult = this.achievementTransformer.transformAchievements(enhancedContent);
        
        Object.assign(enhancedContent, achievementResult.transformedResume);
        processingLog.push(`✅ Transformed ${achievementResult.improvements.length} achievements`);
      }

      // Step 4: Enhance skills
      processingLog.push('🔧 Enhancing skills for industry alignment...');
      const skillResult = this.skillEnhancer.enhanceSkills(
        enhancedContent,
        options.targetRole
      );
      
      enhancedContent.skills = skillResult.enhancedSkills;
      processingLog.push(`✅ Enhanced skills with ${skillResult.industryAlignment}% industry alignment`);

      // Step 5: Run ATS scan
      processingLog.push('🔍 Scanning for ATS compatibility...');
      const atsResult = this.atsScanner.scanResume(
        enhancedContent,
        options.jobDescription,
        options.targetRole
      );
      processingLog.push(`✅ ATS scan completed with ${atsResult.overallScore}% score`);

      // Step 6: Calculate enhancement scores
      const enhancementScore = this.calculateEnhancementScore(
        extractedContent,
        enhancedContent,
        atsResult
      );

      // Step 7: Generate comprehensive recommendations
      const recommendations = this.generateRecommendations(
        enhancedContent,
        atsResult,
        skillResult,
        summaryResult
      );

      const processingTime = Date.now() - startTime;
      processingLog.push(`🎉 Processing completed in ${processingTime}ms`);

      // Update metadata
      enhancedContent.metadata = {
        ...enhancedContent.metadata,
        atsScore: atsResult.overallScore,
        completionPercentage: this.calculateCompletionPercentage(enhancedContent),
        enhancementSuggestions: recommendations.slice(0, 5).map(r => r.suggestion)
      };

      return {
        extractedContent,
        enhancedContent,
        enhancementScore,
        recommendations,
        processingLog
      };

    } catch (error) {
      console.error('❌ Enhanced resume processing failed:', error);
      processingLog.push(`❌ Error: ${error.message}`);
      throw error;
    }
  }

  private countSections(content: EnhancedExtractedContent): number {
    let count = 0;
    if (content.personalInfo.fullName) count++;
    if (content.professionalSummary.content) count++;
    if (content.experience.length > 0) count++;
    if (content.education.length > 0) count++;
    if (content.skills.technical.length > 0) count++;
    if (content.certifications.length > 0) count++;
    if (content.projects.length > 0) count++;
    if (content.awards.length > 0) count++;
    if (content.languages.length > 0) count++;
    if (content.hobbies.length > 0) count++;
    if (content.additional.declaration || content.additional.references?.length > 0) count++;
    return count;
  }

  private calculateEnhancementScore(
    original: EnhancedExtractedContent,
    enhanced: EnhancedExtractedContent,
    atsResult: any
  ): EnhancementScore {
    const sections = {
      personalInfo: this.scoreSectionCompletion(enhanced.personalInfo, [
        'fullName', 'email', 'phone', 'location'
      ]),
      summary: enhanced.professionalSummary.content.length > 100 ? 90 : 50,
      experience: enhanced.experience.length > 0 ? 
        Math.min(100, enhanced.experience.length * 25) : 0,
      education: enhanced.education.length > 0 ? 
        Math.min(100, enhanced.education.length * 30) : 0,
      skills: enhanced.skills.technical.length > 0 ? 
        Math.min(100, enhanced.skills.technical.length * 10) : 0,
      certifications: enhanced.certifications.length > 0 ? 
        Math.min(100, enhanced.certifications.length * 20) : 0,
      projects: enhanced.projects.length > 0 ? 
        Math.min(100, enhanced.projects.length * 25) : 0,
      awards: enhanced.awards.length > 0 ? 
        Math.min(100, enhanced.awards.length * 25) : 0
    };

    const overallScore = Math.round(
      Object.values(sections).reduce((sum, score) => sum + score, 0) / 
      Object.keys(sections).length
    );

    return {
      overall: overallScore,
      atsCompatibility: atsResult.overallScore,
      professionalTone: this.calculateToneScore(enhanced),
      achievementCoverage: this.calculateAchievementCoverage(enhanced),
      skillDepth: this.calculateSkillDepth(enhanced),
      sections
    };
  }

  private scoreSectionCompletion(section: any, requiredFields: string[]): number {
    const completedFields = requiredFields.filter(field => 
      section[field] && section[field].toString().trim().length > 0
    );
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  private calculateToneScore(content: EnhancedExtractedContent): number {
    const text = [
      content.professionalSummary.content,
      ...content.experience.map(exp => exp.responsibilities.join(' ')),
      ...content.experience.map(exp => exp.achievements.join(' '))
    ].join(' ').toLowerCase();

    let score = 50; // Base score

    // Check for professional language
    const professionalWords = [
      'developed', 'led', 'managed', 'achieved', 'implemented', 'optimized',
      'delivered', 'spearheaded', 'collaborated', 'designed'
    ];
    
    const professionalWordCount = professionalWords.filter(word => 
      text.includes(word)
    ).length;
    
    score += Math.min(30, professionalWordCount * 3);

    // Check for quantifiable achievements
    if (/\d+%|\d+\+|\$\d+/.test(text)) {
      score += 20;
    }

    return Math.min(100, score);
  }

  private calculateAchievementCoverage(content: EnhancedExtractedContent): number {
    const totalAchievements = content.experience.reduce((sum, exp) => 
      sum + exp.achievements.length, 0
    );
    
    const experienceEntries = content.experience.length;
    
    if (experienceEntries === 0) return 0;
    
    const avgAchievements = totalAchievements / experienceEntries;
    return Math.min(100, Math.round(avgAchievements * 25));
  }

  private calculateSkillDepth(content: EnhancedExtractedContent): number {
    const technicalSkills = content.skills.technical.length;
    const softSkills = content.skills.soft.length;
    
    let score = 0;
    
    // Technical skills (70% weight)
    score += Math.min(70, technicalSkills * 7);
    
    // Soft skills (30% weight)
    score += Math.min(30, softSkills * 6);
    
    return Math.min(100, score);
  }

  private calculateCompletionPercentage(content: EnhancedExtractedContent): number {
    const sections = [
      { name: 'personalInfo', weight: 15, completed: this.isPersonalInfoComplete(content.personalInfo) },
      { name: 'summary', weight: 10, completed: content.professionalSummary.content.length > 50 },
      { name: 'experience', weight: 25, completed: content.experience.length > 0 },
      { name: 'education', weight: 15, completed: content.education.length > 0 },
      { name: 'skills', weight: 20, completed: content.skills.technical.length > 0 },
      { name: 'certifications', weight: 5, completed: content.certifications.length > 0 },
      { name: 'projects', weight: 5, completed: content.projects.length > 0 },
      { name: 'awards', weight: 3, completed: content.awards.length > 0 },
      { name: 'languages', weight: 2, completed: content.languages.length > 0 }
    ];

    const completedWeight = sections.reduce((sum, section) => 
      sum + (section.completed ? section.weight : 0), 0
    );

    return Math.round(completedWeight);
  }

  private isPersonalInfoComplete(personalInfo: any): boolean {
    return !!(personalInfo.fullName && personalInfo.email && personalInfo.phone);
  }

  private generateRecommendations(
    content: EnhancedExtractedContent,
    atsResult: any,
    skillResult: any,
    summaryResult: any
  ): Array<{
    category: string;
    suggestion: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
  }> {
    const recommendations = [];

    // ATS recommendations
    recommendations.push(...atsResult.recommendations);

    // Skill recommendations
    skillResult.suggestions.slice(0, 3).forEach(skill => {
      recommendations.push({
        category: 'Skills',
        suggestion: `Add ${skill.skill} to your technical skills`,
        priority: skill.priority,
        impact: `Improves industry alignment by showing ${skill.reasoning}`
      });
    });

    // Summary recommendations
    summaryResult.improvements.forEach(improvement => {
      recommendations.push({
        category: 'Professional Summary',
        suggestion: improvement,
        priority: 'medium' as const,
        impact: 'Enhances professional presentation'
      });
    });

    // Content recommendations
    if (content.experience.length === 0) {
      recommendations.push({
        category: 'Experience',
        suggestion: 'Add work experience entries with responsibilities and achievements',
        priority: 'critical',
        impact: 'Essential for resume completeness'
      });
    }

    if (content.projects.length === 0) {
      recommendations.push({
        category: 'Projects',
        suggestion: 'Include relevant projects to demonstrate practical skills',
        priority: 'high',
        impact: 'Shows hands-on experience and initiative'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Public method to get processing capabilities
  getProcessingCapabilities(): {
    supportedFormats: string[];
    enhancementFeatures: string[];
    maxFileSize: number;
  } {
    return {
      supportedFormats: ['PDF', 'DOCX', 'DOC', 'TXT', 'Images (JPG, PNG, WebP)'],
      enhancementFeatures: [
        'Professional Summary Generation',
        'Achievement Transformation',
        'ATS Compatibility Scanning',
        'Skills Enhancement',
        'Industry Alignment',
        'Quantifiable Metrics Addition',
        'Tone Optimization',
        'Keyword Optimization'
      ],
      maxFileSize: 10 * 1024 * 1024 // 10MB
    };
  }

  // Public method to get enhancement preview
  async getEnhancementPreview(
    content: EnhancedExtractedContent,
    targetRole?: string
  ): Promise<{
    currentScore: number;
    projectedScore: number;
    improvements: string[];
  }> {
    const currentATS = this.atsScanner.scanResume(content, undefined, targetRole);
    const skillAnalysis = this.skillEnhancer.enhanceSkills(content, targetRole);
    
    const currentScore = currentATS.overallScore;
    const projectedScore = Math.min(100, currentScore + 15); // Estimated improvement
    
    const improvements = [
      `ATS Score: ${currentScore}% → ${projectedScore}%`,
      `Skills Alignment: ${skillAnalysis.industryAlignment}%`,
      `Missing ${skillAnalysis.missingSkills.length} critical skills`,
      `${currentATS.recommendations.length} optimization opportunities`
    ];

    return {
      currentScore,
      projectedScore,
      improvements
    };
  }

  async processBasicExtraction(file: File): Promise<EnhancedProcessingResult> {
    console.log('Starting basic extraction for:', file.name);
    
    try {
      // Use basic extraction with minimal enhancements
      const result = await this.processResume(file, {
        enhancementLevel: 'basic'
      });
      
      console.log('Basic extraction completed successfully');
      return result;
    } catch (error) {
      console.error('Basic extraction failed:', error);
      throw new Error(`Basic extraction failed: ${error.message}`);
    }
  }
}
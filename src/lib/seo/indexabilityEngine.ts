// src/lib/seo/indexabilityEngine.ts
// Central Indexability Policy, Quality Grading & Thin Content Protection Engine for TalentXcel
// Controls sitemap inclusion, robots meta tags, and internal engineering quality grading.

export type PublicEntityType = 'job' | 'post' | 'profile' | 'company' | 'topic' | 'service' | 'resource' | 'college';

export type QualityGrade = 'A+' | 'A' | 'B' | 'C' | 'D';
export type QualityAction = 'KEEP_INDEXED' | 'IMPROVE' | 'CONSOLIDATE' | 'NOINDEX' | '404' | '410' | 'REDIRECT';

export interface IndexabilityResult {
  isIndexable: boolean;
  qualityGrade: QualityGrade;
  action: QualityAction;
  qualityScore: number; // 0 to 100
  reason?: string;
  robotsDirective: 'index, follow' | 'noindex, nofollow' | 'noindex, follow';
}

export function isIndexablePublicEntity(type: PublicEntityType, entity: any): IndexabilityResult {
  if (!entity) {
    return {
      isIndexable: false,
      qualityGrade: 'D',
      action: '404',
      qualityScore: 0,
      reason: 'Entity data is missing or null',
      robotsDirective: 'noindex, nofollow',
    };
  }

  // 1. Check Deleted / Status
  if (entity.is_deleted === true || entity.deleted_at || entity.status === 'deleted' || entity.status === 'suspended') {
    return {
      isIndexable: false,
      qualityGrade: 'D',
      action: '410',
      qualityScore: 0,
      reason: 'Entity is marked as deleted or suspended',
      robotsDirective: 'noindex, nofollow',
    };
  }

  // 2. Entity-specific rules and quality evaluation
  switch (type) {
    case 'job': {
      const hasTitle = Boolean(entity.title && entity.title.trim().length >= 3);
      const isActive = entity.is_active !== false && entity.job_status !== 'closed' && entity.job_status !== 'expired';
      const descLength = (entity.description || '').trim().length;

      if (!hasTitle || !isActive) {
        return {
          isIndexable: false,
          qualityGrade: 'D',
          action: 'NOINDEX',
          qualityScore: 10,
          reason: 'Job is inactive, closed, or missing title',
          robotsDirective: 'noindex, follow',
        };
      }

      if (descLength < 50) {
        return {
          isIndexable: false,
          qualityGrade: 'C',
          action: 'IMPROVE',
          qualityScore: 40,
          reason: 'Job description is too thin (< 50 characters)',
          robotsDirective: 'noindex, follow',
        };
      }

      const hasSalary = Boolean(entity.salary_min);
      const hasLocation = Boolean(entity.location);
      const score = 70 + (hasSalary ? 15 : 0) + (hasLocation ? 15 : 0);
      const grade: QualityGrade = score >= 90 ? 'A+' : score >= 80 ? 'A' : 'B';

      return {
        isIndexable: true,
        qualityGrade: grade,
        action: 'KEEP_INDEXED',
        qualityScore: score,
        robotsDirective: 'index, follow',
      };
    }

    case 'post': {
      const content = (entity.content || '').trim();
      if (entity.visibility === 'private' || entity.is_private === true || entity.is_draft === true) {
        return {
          isIndexable: false,
          qualityGrade: 'D',
          action: 'NOINDEX',
          qualityScore: 0,
          reason: 'Post is marked private or draft',
          robotsDirective: 'noindex, nofollow',
        };
      }

      if (content.length < 25) {
        return {
          isIndexable: false,
          qualityGrade: 'D',
          action: 'NOINDEX',
          qualityScore: 20,
          reason: 'Post content is too short (< 25 chars)',
          robotsDirective: 'noindex, follow',
        };
      }

      const hasAuthor = Boolean(entity.author_id || entity.author);
      const score = Math.min(100, 60 + Math.floor(content.length / 10) + (hasAuthor ? 20 : 0));
      const grade: QualityGrade = score >= 85 ? 'A' : 'B';

      return {
        isIndexable: true,
        qualityGrade: grade,
        action: 'KEEP_INDEXED',
        qualityScore: score,
        robotsDirective: 'index, follow',
      };
    }

    case 'college': {
      const hasName = Boolean(entity.name && entity.name.trim().length >= 3);
      if (!hasName) {
        return {
          isIndexable: false,
          qualityGrade: 'D',
          action: '404',
          qualityScore: 0,
          reason: 'College name is missing',
          robotsDirective: 'noindex, follow',
        };
      }

      const hasRank = Boolean(entity.nirf_rank || (entity.accreditation && entity.accreditation.nirfRank));
      const hasPlacement = Boolean(entity.placement_avg_lpa || (entity.placements && entity.placements.averagePackageLpa));
      const hasFees = Boolean(entity.annual_fee_min || (entity.financials && entity.financials.annualTuitionMinInr));

      let score = 70;
      if (hasRank) score += 10;
      if (hasPlacement) score += 10;
      if (hasFees) score += 10;

      const grade: QualityGrade = score >= 90 ? 'A+' : score >= 80 ? 'A' : 'B';

      return {
        isIndexable: true,
        qualityGrade: grade,
        action: 'KEEP_INDEXED',
        qualityScore: score,
        robotsDirective: 'index, follow',
      };
    }

    case 'company':
    case 'service':
    case 'topic':
    case 'resource':
      return {
        isIndexable: true,
        qualityGrade: 'A+',
        action: 'KEEP_INDEXED',
        qualityScore: 98,
        robotsDirective: 'index, follow',
      };

    default:
      return {
        isIndexable: true,
        qualityGrade: 'B',
        action: 'KEEP_INDEXED',
        qualityScore: 75,
        robotsDirective: 'index, follow',
      };
  }
}

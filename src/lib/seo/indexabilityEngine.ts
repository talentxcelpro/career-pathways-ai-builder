// src/lib/seo/indexabilityEngine.ts
// Central Indexability Policy & Quality Threshold Engine for TalentXcel
// Controls sitemap inclusion, robots meta tags, and structured data generation.

export type PublicEntityType = 'job' | 'post' | 'profile' | 'company' | 'topic' | 'service' | 'resource' | 'college';

export interface IndexabilityResult {
  isIndexable: boolean;
  reason?: string;
  robotsDirective: 'index, follow' | 'noindex, nofollow' | 'noindex, follow';
}

export function isIndexablePublicEntity(type: PublicEntityType, entity: any): IndexabilityResult {
  if (!entity) {
    return {
      isIndexable: false,
      reason: 'Entity data is missing or null',
      robotsDirective: 'noindex, nofollow',
    };
  }

  // 1. Check Deleted / Status
  if (entity.is_deleted === true || entity.deleted_at || entity.status === 'deleted' || entity.status === 'suspended') {
    return {
      isIndexable: false,
      reason: 'Entity is marked as deleted or suspended',
      robotsDirective: 'noindex, nofollow',
    };
  }

  // 2. Entity-specific rules
  switch (type) {
    case 'job': {
      // Must have valid title, active status, open status
      const hasTitle = Boolean(entity.title && entity.title.trim().length >= 3);
      const isActive = entity.is_active !== false && entity.job_status !== 'closed' && entity.job_status !== 'expired';
      const hasDescription = Boolean(entity.description && entity.description.trim().length >= 20);

      if (!hasTitle) {
        return { isIndexable: false, reason: 'Job missing valid title', robotsDirective: 'noindex, follow' };
      }
      if (!isActive) {
        return { isIndexable: false, reason: 'Job is not currently active/open', robotsDirective: 'noindex, follow' };
      }
      if (!hasDescription) {
        return { isIndexable: false, reason: 'Job description is too thin', robotsDirective: 'noindex, follow' };
      }
      return { isIndexable: true, robotsDirective: 'index, follow' };
    }

    case 'post': {
      // Must have content and not be private/draft
      const content = (entity.content || '').trim();
      if (content.length < 15) {
        return { isIndexable: false, reason: 'Post content is too short or empty', robotsDirective: 'noindex, follow' };
      }
      if (entity.visibility === 'private' || entity.is_private === true || entity.is_draft === true) {
        return { isIndexable: false, reason: 'Post is marked private or draft', robotsDirective: 'noindex, nofollow' };
      }
      return { isIndexable: true, robotsDirective: 'index, follow' };
    }

    case 'profile': {
      // Must have name and username/title, and not be explicitly private
      const hasName = Boolean(entity.full_name && entity.full_name.trim().length > 1);
      const isPrivate = entity.is_private === true || entity.privacy_level === 'private';
      if (!hasName || isPrivate) {
        return { isIndexable: false, reason: 'Profile is private or missing name', robotsDirective: 'noindex, nofollow' };
      }
      return { isIndexable: true, robotsDirective: 'index, follow' };
    }

    case 'company': {
      // Must have company name and not be suspended
      const hasName = Boolean((entity.name || entity.company_name) && (entity.name || entity.company_name).trim().length >= 2);
      if (!hasName) {
        return { isIndexable: false, reason: 'Company name is missing', robotsDirective: 'noindex, follow' };
      }
      return { isIndexable: true, robotsDirective: 'index, follow' };
    }

    case 'topic':
    case 'service':
    case 'resource':
    case 'college':
      return { isIndexable: true, robotsDirective: 'index, follow' };

    default:
      return { isIndexable: true, robotsDirective: 'index, follow' };
  }
}

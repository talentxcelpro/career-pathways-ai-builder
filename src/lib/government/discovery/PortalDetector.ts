/**
 * TalentXcel Global Jobs Network — Portal Detector
 * Analyzes web recruitment structures, vacancies notice tables, and career layouts.
 */

export interface DetectedPortalFeatures {
  hasVacancyTable: boolean;
  hasRecruitmentNoticeKeywords: boolean;
  hasPdfBulletins: boolean;
  hasApplyButtons: boolean;
  confidenceScore: number;
}

export class PortalDetector {
  private static recruitmentKeywords = [
    'recruitment', 'vacancies', 'career', 'employment notice',
    'advertisement', 'bharti', 'sarkari naukri', 'opportunities',
    'positions open', 'job announcement', 'civil service',
  ];

  public static detectFeatures(htmlOrText: string): DetectedPortalFeatures {
    const text = htmlOrText.toLowerCase();
    const hasKeywords = this.recruitmentKeywords.some((k) => text.includes(k));
    const hasTable = text.includes('<table') || text.includes('grid') || text.includes('vacancy list');
    const hasPdf = text.includes('.pdf') || text.includes('notification');
    const hasApply = text.includes('apply online') || text.includes('application form');

    let score = 0;
    if (hasKeywords) score += 35;
    if (hasTable) score += 25;
    if (hasPdf) score += 20;
    if (hasApply) score += 20;

    return {
      hasVacancyTable: hasTable,
      hasRecruitmentNoticeKeywords: hasKeywords,
      hasPdfBulletins: hasPdf,
      hasApplyButtons: hasApply,
      confidenceScore: score,
    };
  }
}

/**
 * src/lib/growth-os/DiagnosticShareEngine.ts
 *
 * Implements the Diagnostic Viral Sharing Engine.
 * Converts internal user utility results into lightweight, shareable diagnostic cards.
 *
 * User → Tool → Personal Result → Shareable Card → Peer Discovers → Peer Runs Tool
 */

import { DiagnosticCardPayload, DiagnosticType } from './types';

export class DiagnosticShareEngine {
  private static readonly BASE_URL = 'https://talentxcel.in';

  /**
   * Generates a structured, shareable diagnostic card payload
   */
  public static generateCard(
    type: DiagnosticType,
    subjectTitle: string,
    headlineScore: string | number,
    subtext: string,
    keyInsights: string[],
    benchmarkedAgainst: string
  ): DiagnosticCardPayload {
    const cardId = `diag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const shareableUrl = `${this.BASE_URL}/verify/diagnostic/${cardId}`;

    return {
      cardId,
      type,
      subjectTitle,
      headlineScore,
      subtext,
      keyInsights,
      benchmarkedAgainst,
      shareableUrl,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Pre-formatted template for Resume ATS diagnostic
   */
  public static createAtsResumeCard(
    score: number,
    targetRole: string,
    missingSkills: string[],
    strongestSkill: string
  ): DiagnosticCardPayload {
    return this.generateCard(
      'RESUME_ATS_SCORE',
      `ATS Audit: ${targetRole}`,
      `${score}/100`,
      score >= 80 ? 'Top 15% ATS Compatibility' : 'Optimization Required for Automated Filters',
      [
        `Strongest Capability Identified: ${strongestSkill}`,
        `Critical Keywords Missing: ${missingSkills.slice(0, 3).join(', ')}`,
        'Formatting & structure verified against Tier-1 ATS parsers (Workday, Greenhouse)',
      ],
      `Benchmark: 12,400+ Verified ${targetRole} Applications`
    );
  }

  /**
   * Pre-formatted template for Salary Percentile diagnostic
   */
  public static createSalaryPercentileCard(
    role: string,
    location: string,
    percentile: number,
    medianSalaryLPA: number,
    userSalaryLPA?: number
  ): DiagnosticCardPayload {
    return this.generateCard(
      'SALARY_PERCENTILE',
      `${role} Compensation Benchmark`,
      `${percentile}th Percentile`,
      `In ${location} across verified corporate payroll data`,
      [
        `Verified Market Median (50th): ₹${medianSalaryLPA} LPA`,
        `Top Quartile (75th): ₹${(medianSalaryLPA * 1.35).toFixed(1)} LPA`,
        userSalaryLPA ? `Current vs Market: ${userSalaryLPA >= medianSalaryLPA ? 'Above' : 'Below'} Median` : 'Directly compared with verified local tech salary bands',
      ],
      `TalentXcel Verified Compensation Index (${location})`
    );
  }

  /**
   * Pre-formatted template for Career Transition diagnostic
   */
  public static createCareerTransitionCard(
    fromRole: string,
    topTargetRole: string,
    overlapPercentage: number,
    pathsCount: number
  ): DiagnosticCardPayload {
    return this.generateCard(
      'SKILL_OVERLAP_MATRIX',
      `Career Pivot: ${fromRole} → ${topTargetRole}`,
      `${overlapPercentage}% Portability`,
      `${pathsCount} viable adjacent transition pathways identified`,
      [
        `High skill transferability to: ${topTargetRole}`,
        'Core transferable assets: Problem Solving, Architecture, Data Modeling',
        'Estimated bridging timeframe: 60–90 days deliberate practice',
      ],
      'TalentXcel Global Capability Overlap Graph'
    );
  }

  /**
   * Generates formatted text for LinkedIn / Twitter / WhatsApp sharing
   */
  public static formatSocialShareText(card: DiagnosticCardPayload): string {
    return (
      `📊 My ${card.subjectTitle} on TalentXcel:\n` +
      `Result: ${card.headlineScore} (${card.subtext})\n\n` +
      `Key Takeaways:\n` +
      card.keyInsights.map(i => `• ${i}`).join('\n') + `\n\n` +
      `Benchmark: ${card.benchmarkedAgainst}\n` +
      `Verify or run your own test here: ${card.shareableUrl}`
    );
  }
}

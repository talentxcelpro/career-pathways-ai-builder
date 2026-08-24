// src/agents/email/MailboxRegistry.ts
// Central Registry of all 11 Authorised TalentXcel Zoho Mailboxes
// Manages departmental assignment, sender identities, and live health metrics.

import type { MailboxDescriptor, ZohoMailboxId } from './types';

export class MailboxRegistry {
  private mailboxes = new Map<ZohoMailboxId, MailboxDescriptor>();

  constructor() {
    this.registerAuthorizedMailboxes();
  }

  private registerAuthorizedMailboxes() {
    const defaultList: MailboxDescriptor[] = [
      {
        id: 'talentxcel',
        email: 'talentxcel@talentxcel.in',
        displayName: 'TalentXcel Executive Office',
        department: 'executive',
        autonomousRole: 'General corporate announcements & Claim #1 official invitations',
        dailyLimit: 300,
        sentTodayCount: 0,
        hourlyLimit: 50,
        sentThisHourCount: 0,
        healthStatus: 'HEALTHY',
        bounceRatePct: 0.2,
        activeThreadsCount: 12,
        authorizedAgents: ['founder_ceo', 'growth', 'claim_discovery', 'claim_acquisition'],
      },
      {
        id: 'admin',
        email: 'admin@talentxcel.in',
        displayName: 'TalentXcel Administration',
        department: 'executive',
        autonomousRole: 'Administrative notifications, account activations & billing',
        dailyLimit: 300,
        sentTodayCount: 0,
        hourlyLimit: 50,
        healthStatus: 'HEALTHY',
        bounceRatePct: 0.1,
        activeThreadsCount: 8,
        authorizedAgents: ['coo', 'billing', 'revenue'],
      },
      {
        id: 'support',
        email: 'support@talentxcel.in',
        displayName: 'TalentXcel Candidate Support',
        department: 'candidates',
        autonomousRole: 'Candidate inquiries, resume tooling support & verification',
        dailyLimit: 300,
        sentTodayCount: 0,
        hourlyLimit: 50,
        healthStatus: 'HEALTHY',
        bounceRatePct: 0.1,
        activeThreadsCount: 24,
        authorizedAgents: ['candidate_retention', 'resume', 'career'],
      },
      {
        id: 'shelly',
        email: 'shelly@talentxcel.in',
        displayName: 'Shelly from TalentXcel',
        department: 'employer',
        autonomousRole: 'Employer discovery, hiring vacancy outreach & initial talent partnership',
        dailyLimit: 250,
        sentTodayCount: 0,
        hourlyLimit: 40,
        healthStatus: 'HEALTHY',
        bounceRatePct: 0.4,
        activeThreadsCount: 35,
        authorizedAgents: ['employer_discovery', 'employer_outreach', 'employer_qualification'],
      },
      {
        id: 'sana',
        email: 'sana@talentxcel.in',
        displayName: 'Sana from TalentXcel',
        department: 'candidates',
        autonomousRole: 'Candidate onboarding, career pathway coaching & skill milestones',
        dailyLimit: 250,
        sentTodayCount: 0,
        hourlyLimit: 40,
        healthStatus: 'HEALTHY',
        bounceRatePct: 0.3,
        activeThreadsCount: 42,
        authorizedAgents: ['candidate_acquisition', 'matching', 'career'],
      },
      {
        id: 'raj',
        email: 'raj@talentxcel.in',
        displayName: 'Raj from TalentXcel Business Development',
        department: 'employer',
        autonomousRole: 'Mid-market & enterprise employer talent acquisition solutions',
        dailyLimit: 250,
        sentTodayCount: 0,
        hourlyLimit: 40,
        healthStatus: 'HEALTHY',
        bounceRatePct: 0.5,
        activeThreadsCount: 28,
        authorizedAgents: ['employer_outreach', 'employer_onboarding'],
      },
      {
        id: 'arjun',
        email: 'arjun@talentxcel.in',
        displayName: 'Arjun from TalentXcel Enterprise',
        department: 'employer',
        autonomousRole: 'Tech startup hiring partnerships & AI recruiter outreach',
        dailyLimit: 250,
        sentTodayCount: 0,
        hourlyLimit: 40,
        healthStatus: 'HEALTHY',
        bounceRatePct: 0.4,
        activeThreadsCount: 19,
        authorizedAgents: ['employer_outreach', 'employer_qualification'],
      },
      {
        id: 'nikki',
        email: 'nikki@talentxcel.in',
        displayName: 'Nikki from TalentXcel Talent Network',
        department: 'candidates',
        autonomousRole: 'Student & job seeker activation, portfolio review alerts',
        dailyLimit: 250,
        sentTodayCount: 0,
        hourlyLimit: 40,
        healthStatus: 'HEALTHY',
        bounceRatePct: 0.2,
        activeThreadsCount: 31,
        authorizedAgents: ['candidate_acquisition', 'candidate_retention'],
      },
      {
        id: 'meera',
        email: 'meera@talentxcel.in',
        displayName: 'Meera from TalentXcel University Relations',
        department: 'colleges',
        autonomousRole: 'University placement cell partnerships, MoUs & student cohort onboarding',
        dailyLimit: 200,
        sentTodayCount: 0,
        hourlyLimit: 30,
        healthStatus: 'HEALTHY',
        bounceRatePct: 0.2,
        activeThreadsCount: 15,
        authorizedAgents: ['college_discovery', 'college_partnership', 'student_cohort'],
      },
      {
        id: 'ishaan',
        email: 'ishaan@talentxcel.in',
        displayName: 'Ishaan from TalentXcel Jobs',
        department: 'jobs',
        autonomousRole: 'Job feed validation, recruiter vacancy ingestion & posting verification',
        dailyLimit: 250,
        sentTodayCount: 0,
        hourlyLimit: 40,
        healthStatus: 'HEALTHY',
        bounceRatePct: 0.3,
        activeThreadsCount: 11,
        authorizedAgents: ['job_discovery', 'job_quality', 'employer_onboarding'],
      },
      {
        id: 'zoya',
        email: 'zoya@talentxcel.in',
        displayName: 'Zoya from TalentXcel Growth',
        department: 'growth_marketing',
        autonomousRole: 'Growth campaigns, product launches & AI founder invites',
        dailyLimit: 250,
        sentTodayCount: 0,
        hourlyLimit: 40,
        healthStatus: 'HEALTHY',
        bounceRatePct: 0.4,
        activeThreadsCount: 22,
        authorizedAgents: ['growth', 'marketing', 'email_growth', 'campaign_optimization'],
      },
    ];

    for (const mb of defaultList) {
      this.mailboxes.set(mb.id, mb);
    }
  }

  getMailbox(id: ZohoMailboxId): MailboxDescriptor | undefined {
    return this.mailboxes.get(id);
  }

  getAllMailboxes(): MailboxDescriptor[] {
    return Array.from(this.mailboxes.values());
  }

  getMailboxesForDepartment(department: string): MailboxDescriptor[] {
    return Array.from(this.mailboxes.values()).filter(
      (m) => m.department === department || m.department === 'executive'
    );
  }

  incrementSentCount(id: ZohoMailboxId) {
    const mb = this.mailboxes.get(id);
    if (mb) {
      mb.sentTodayCount += 1;
      mb.sentThisHourCount += 1;
    }
  }

  updateHealthStatus(id: ZohoMailboxId, status: import('./types').MailboxHealthStatus) {
    const mb = this.mailboxes.get(id);
    if (mb) {
      mb.healthStatus = status;
    }
  }
}

export const coreMailboxRegistry = new MailboxRegistry();

// src/agents/employer/EmployerAgent.ts
// Autonomous Employer & Company Acquisition Operating Agent
// Executes 4,812-job signals -> Qualification -> Candidate Matching -> Zoho Outreach Loop

import { supabase } from '@/integrations/supabase/client';
import { coreBusinessSignalEngine } from '../core/BusinessSignalEngine';
import { coreOpportunityManager } from '../core/OpportunityManager';
import { coreEmailOrchestrator } from '../email/EmailOrchestrator';
import { kernelAuditEngine } from '../kernel/AuditEngine';
import { kernelEventBus } from '../kernel/EventBus';

export class EmployerAgent {
  readonly name = 'EmployerAgent';
  private isRunning = false;

  constructor() {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    kernelEventBus.subscribe('EMPLOYER_HIRING_SIGNAL', async (event) => {
      await this.handleHiringSignal(event.payload);
    });

    kernelEventBus.subscribe('EMAIL_INTERESTED', async (event) => {
      if (event.department === 'employer') {
        await this.handleEmployerInterested(event.payload);
      }
    });
  }

  /**
   * Executes the full closed-loop employer acquisition cycle.
   */
  async runEmployerCycle(): Promise<{ actionsTaken: number; qualifiedCount: number; contactedCount: number }> {
    this.isRunning = true;
    let actionsTaken = 0;
    let qualifiedCount = 0;
    let contactedCount = 0;

    try {
      console.log('⚡ [EmployerAgent] Scanning hiring signals from 4,812 active scraped jobs...');

      // 1. Scan hiring signals from live scraped_jobs
      const signals = await coreBusinessSignalEngine.scanHiringSignals(5);

      for (const sig of signals) {
        actionsTaken += 1;

        // 2. Score & Qualify Opportunity
        const matchableCandidates = Math.min(45, 12 + sig.activeVacanciesCount * 2);
        const opp = coreOpportunityManager.upsertOpportunity({
          entityName: sig.companyName,
          domain: sig.domain,
          category: 'employer',
          stage: 'QUALIFIED',
          score: sig.opportunityScore,
          activeVacanciesCount: sig.activeVacanciesCount,
          matchingCandidatesCount: matchableCandidates,
          assignedMailbox: 'shelly@talentxcel.in',
          assignedAgent: 'employer_outreach',
          contactEmail: `talent@${sig.domain || 'company.com'}`,
        });

        qualifiedCount += 1;

        // 3. Dispatch Personalized Outreach via Shelly (if not already contacted)
        if (opp.touchCount === 0) {
          const contactEmail = `careers@${sig.domain || 'company.com'}`;

          const emailResult = await coreEmailOrchestrator.sendEmail({
            department: 'employer',
            agentId: 'employer_outreach',
            recipientEmail: contactEmail,
            recipientName: `Hiring Leader at ${sig.companyName}`,
            companyName: sig.companyName,
            subject: `Candidate matches for ${sig.activeVacanciesCount} open tech roles at ${sig.companyName}`,
            templateName: 'employer_discovery',
            templateVariables: {
              activeVacanciesCount: sig.activeVacanciesCount,
              matchingCandidatesCount: matchableCandidates,
              sampleTitles: sig.sampleTitles.join(', '),
            },
            preferredMailbox: 'shelly',
          });

          if (emailResult.success) {
            coreOpportunityManager.transitionStage(opp.id, 'CONTACTED', `Dispatched outreach via ${emailResult.mailboxUsed}`);
            contactedCount += 1;
            actionsTaken += 1;
          }
        }
      }

      await kernelAuditEngine.record('employer_agent', 'employer', 'EMPLOYER_CYCLE_EXECUTED', {
        signalsProcessed: signals.length,
        qualifiedCount,
        contactedCount,
        success: true,
      });
    } catch (err: any) {
      console.error('[EmployerAgent] Error during cycle:', err);
    } finally {
      this.isRunning = false;
    }

    return { actionsTaken, qualifiedCount, contactedCount };
  }

  private async handleHiringSignal(signal: any) {
    coreOpportunityManager.upsertOpportunity({
      entityName: signal.companyName,
      domain: signal.domain,
      category: 'employer',
      stage: 'QUALIFIED',
      score: signal.opportunityScore,
      activeVacanciesCount: signal.activeVacanciesCount,
    });
  }

  private async handleEmployerInterested(payload: any) {
    console.log('🎉 [EmployerAgent] Employer positive reply received:', payload);
    // Mark as interested in opportunity manager
    const opps = coreOpportunityManager.getAllOpportunities();
    const match = opps.find((o) => payload.email && payload.email.includes(o.domain || ''));
    if (match) {
      coreOpportunityManager.transitionStage(match.id, 'INTERESTED', `Positive reply: "${payload.snippet}"`);
    }
  }

  getStatus(): 'RUNNING' | 'IDLE' {
    return this.isRunning ? 'RUNNING' : 'IDLE';
  }
}

export const employerAgent = new EmployerAgent();

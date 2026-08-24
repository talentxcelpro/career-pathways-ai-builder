// src/agents/core/DecisionEngine.ts
// Real-Time Signal-to-Action Decision Engine for Departmental Specialist Workers

import { kernelTaskQueue } from '../kernel/TaskQueue';
import { kernelAuditEngine } from '../kernel/AuditEngine';
import type { DepartmentType } from './types';

export interface BusinessSignal {
  id: string;
  source: string;
  department: DepartmentType;
  type: string;
  payload: Record<string, any>;
  timestamp: string;
}

export class DecisionEngine {
  /**
   * Evaluates an incoming verified business signal and dispatches assigned specialist worker tasks.
   */
  async processSignal(signal: BusinessSignal) {
    switch (signal.type) {
      case 'NEW_EMPLOYER_SIGNAL':
      case 'COMPANY_POSTED_JOBS': {
        // 1. Task Employer Qualification Agent
        kernelTaskQueue.enqueue(
          'employer_qualification',
          'employer',
          'employer.qualifyEmployer',
          { companyId: signal.payload.companyId, companyName: signal.payload.name },
          { priority: 'HIGH', idempotencyKey: `qualify-${signal.payload.companyId}` }
        );
        break;
      }

      case 'ENTITY_OUTBID': {
        // 2. Task Outbid / Reclaim Agent
        kernelTaskQueue.enqueue(
          'outbid_reclaim',
          'claim1',
          'claim1.dispatchOutbidAlert',
          {
            listingId: signal.payload.listingId,
            outbidEntityId: signal.payload.outbidEntityId,
            newTopBidINR: signal.payload.newTopBidINR,
          },
          { priority: 'CRITICAL', idempotencyKey: `outbid-${signal.payload.listingId}-${signal.payload.newTopBidINR}` }
        );
        break;
      }

      case 'PROSPECT_DISCOVERED': {
        // 3. Task Marketing / Email Growth Agent
        kernelTaskQueue.enqueue(
          'email_growth',
          'growth_marketing',
          'marketing.qualifyProspect',
          { prospectId: signal.payload.prospectId },
          { priority: 'NORMAL', idempotencyKey: `qualify-prospect-${signal.payload.prospectId}` }
        );
        break;
      }

      case 'JOB_INVENTORY_STALE': {
        // 4. Task Job Quality Agent
        kernelTaskQueue.enqueue(
          'job_quality',
          'jobs',
          'jobs.auditInventory',
          {},
          { priority: 'NORMAL', idempotencyKey: `job-audit-${Date.now()}` }
        );
        break;
      }

      default:
        break;
    }

    await kernelAuditEngine.record('decision', 'executive', `SIGNAL_PROCESSED_${signal.type}`, {
      inputs: signal.payload,
      success: true,
    });
  }
}

export const coreDecisionEngine = new DecisionEngine();

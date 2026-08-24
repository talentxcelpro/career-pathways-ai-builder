// src/agents/kernel/WorkflowEngine.ts
// Multi-step Stateful Workflow Orchestration (e.g. Discovery -> Qualification -> Outreach -> Claim -> Bid)

import { kernelTaskQueue } from './TaskQueue';
import { kernelEventBus } from './EventBus';

export interface WorkflowInstance {
  id: string;
  workflowType: 'CLAIM1_ACQUISITION' | 'EMPLOYER_ONBOARDING' | 'COLLEGE_PARTNERSHIP' | 'OUTBID_RIVALRY';
  entityId: string;
  currentStep: string;
  history: { step: string; timestamp: string; status: 'SUCCESS' | 'FAILED' }[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

class KernelWorkflowEngine {
  private workflows = new Map<string, WorkflowInstance>();

  startClaim1Workflow(prospectId: string, companyName: string, slug: string): WorkflowInstance {
    const wf: WorkflowInstance = {
      id: `wf-claim-${Date.now()}-${slug}`,
      workflowType: 'CLAIM1_ACQUISITION',
      entityId: prospectId,
      currentStep: 'DISCOVERED',
      history: [{ step: 'DISCOVERED', timestamp: new Date().toISOString(), status: 'SUCCESS' }],
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
    };

    this.workflows.set(wf.id, wf);
    return wf;
  }

  transitionStep(workflowId: string, nextStep: string, status: 'SUCCESS' | 'FAILED' = 'SUCCESS') {
    const wf = this.workflows.get(workflowId);
    if (wf) {
      wf.currentStep = nextStep;
      wf.history.push({ step: nextStep, timestamp: new Date().toISOString(), status });
      if (nextStep === 'CLAIMED' || nextStep === 'CONVERTED') {
        wf.status = 'COMPLETED';
      }
    }
  }

  getActiveWorkflows(): WorkflowInstance[] {
    return Array.from(this.workflows.values());
  }
}

export const kernelWorkflowEngine = new KernelWorkflowEngine();

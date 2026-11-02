// src/agents/si/engines/CustomerAcquisitionEngine.ts
// Engine 2 — Autonomous Customer Acquisition

import { supabase } from '@/integrations/supabase/client';
import { kernelEventBus } from '@/agents/kernel/EventBus';

export type LeadStage = 'DISCOVERY' | 'QUALIFIED' | 'CONTACTED' | 'ENGAGED' | 'MEETING' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type LeadSegment = 'JOB_SEEKER' | 'EMPLOYER' | 'RECRUITER' | 'CAREER_SERVICE';

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  segment: LeadSegment;
  stage: LeadStage;
  score: number;
  source: string;
  estimatedValueINR?: number;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  assignedAgentId?: string;
  createdAt: string;
}

class CustomerAcquisitionEngine {
  async getLeads(stage?: LeadStage, segment?: LeadSegment): Promise<Lead[]> {
    try {
      let query = supabase
        .from('si_leads' as any)
        .select('*')
        .order('score', { ascending: false })
        .limit(50);
      if (stage) query = query.eq('stage', stage);
      if (segment) query = query.eq('segment', segment);
      const { data } = await query;
      return (data || []) as Lead[];
    } catch {
      return [];
    }
  }

  async getLeadStats(): Promise<{
    totalLeads: number;
    qualifiedLeads: number;
    activeOpportunities: number;
    wonDeals: number;
    estimatedPipelineValueINR: number;
    segmentBreakdown: Record<LeadSegment, number>;
  }> {
    try {
      const { data, count } = await supabase
        .from('si_leads' as any)
        .select('stage, segment, estimated_value_inr', { count: 'exact' });

      const rows = (data || []) as any[];
      const qualified = rows.filter((r) => r.stage !== 'DISCOVERY').length;
      const active = rows.filter((r) => !['WON', 'LOST', 'DISCOVERY'].includes(r.stage)).length;
      const won = rows.filter((r) => r.stage === 'WON').length;
      const pipeline = rows
        .filter((r) => !['LOST', 'DISCOVERY'].includes(r.stage))
        .reduce((sum, r) => sum + (Number(r.estimated_value_inr) || 0), 0);

      const breakdown: Record<LeadSegment, number> = {
        JOB_SEEKER: 0, EMPLOYER: 0, RECRUITER: 0, CAREER_SERVICE: 0,
      };
      for (const r of rows) {
        if (r.segment && r.segment in breakdown) breakdown[r.segment as LeadSegment]++;
      }

      return {
        totalLeads: count || 0,
        qualifiedLeads: qualified,
        activeOpportunities: active,
        wonDeals: won,
        estimatedPipelineValueINR: pipeline,
        segmentBreakdown: breakdown,
      };
    } catch {
      return {
        totalLeads: 0, qualifiedLeads: 0, activeOpportunities: 0,
        wonDeals: 0, estimatedPipelineValueINR: 0,
        segmentBreakdown: { JOB_SEEKER: 0, EMPLOYER: 0, RECRUITER: 0, CAREER_SERVICE: 0 },
      };
    }
  }

  async discoverProspect(prospect: {
    name: string;
    company?: string;
    email?: string;
    segment: LeadSegment;
    source: string;
    estimatedValueINR?: number;
  }): Promise<{ success: boolean; leadId?: string }> {
    try {
      const { data, error } = await supabase.from('si_leads' as any).insert({
        ...prospect,
        stage: 'DISCOVERY',
        score: 0,
        created_at: new Date().toISOString(),
      }).select('id').single();

      if (error) return { success: false };

      await kernelEventBus.publish(
        'PROSPECT_DISCOVERED',
        { prospectId: (data as any).id, segment: prospect.segment },
        'customer_acquisition',
        'growth_marketing'
      );

      return { success: true, leadId: (data as any).id };
    } catch {
      return { success: false };
    }
  }
}

export const customerAcquisitionEngine = new CustomerAcquisitionEngine();

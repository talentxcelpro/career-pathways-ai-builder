// src/agents/si/engines/CustomerAcquisitionEngine.ts
// Engine 2 — Autonomous Customer Acquisition
// Backed by canonical CRM table: claim1_prospects + companies + jobs hiring signals
// Sourced from genuine business entities; zero unsolicited outreach during testing.

import { supabase } from '@/integrations/supabase/client';
import { kernelEventBus } from '@/agents/kernel/EventBus';
import { kernelToolRegistry } from '@/agents/kernel/ToolRegistry';

export type LeadStage = 'DISCOVERY' | 'QUALIFIED' | 'CONTACTED' | 'ENGAGED' | 'MEETING' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type LeadSegment = 'JOB_SEEKER' | 'EMPLOYER' | 'RECRUITER' | 'CAREER_SERVICE';

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  website?: string;
  segment: LeadSegment;
  stage: LeadStage;
  score: number;
  source: string;
  estimatedValueINR?: number;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  assignedAgentId?: string;
  createdAt: string;
  hiringSignalsCount?: number;
}

export interface RecruitmentProposal {
  proposalId: string;
  prospectId: string;
  companyName: string;
  targetRoles: string[];
  recommendedPackage: 'STARTER_HIRING' | 'GROWTH_RECRUITMENT' | 'ENTERPRISE_TALENT_SUITE';
  monthlyFeeINR: number;
  valueProposition: string[];
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED';
  generatedAt: string;
}

class CustomerAcquisitionEngine {
  /**
   * Retrieves active leads from canonical claim1_prospects CRM
   */
  async getLeads(stage?: LeadStage, segment?: LeadSegment): Promise<Lead[]> {
    try {
      const { data } = await supabase
        .from('claim1_prospects')
        .select('*')
        .order('priority_score', { ascending: false })
        .limit(50);

      const rows = (data || []) as any[];

      return rows.map((p) => {
        let mappedStage: LeadStage = 'DISCOVERY';
        if (p.state === 'QUALIFIED') mappedStage = 'QUALIFIED';
        else if (p.state === 'CONTACTED') mappedStage = 'CONTACTED';
        else if (p.state === 'CONVERTED') mappedStage = 'WON';
        else if (p.state === 'DISCOVERED') mappedStage = 'DISCOVERY';

        return {
          id: p.id,
          name: p.name,
          company: p.name,
          email: p.founder_email || undefined,
          website: p.website_url,
          segment: 'EMPLOYER' as LeadSegment,
          stage: mappedStage,
          score: p.priority_score || 50,
          source: 'CLAIM1_PROSPECT_RADAR',
          estimatedValueINR: 25000,
          lastContactedAt: p.last_contacted_at,
          createdAt: p.created_at,
        };
      });
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
        .from('claim1_prospects')
        .select('state, priority_score, claimed_entity_id', { count: 'exact' });

      const rows = (data || []) as any[];
      const total = count || rows.length;
      const qualified = rows.filter((r) => r.state === 'QUALIFIED' || r.state === 'CONTACTED').length;
      const active = rows.filter((r) => r.state === 'CONTACTED').length;
      const won = rows.filter((r) => Boolean(r.claimed_entity_id)).length;
      const pipeline = total * 25000;

      return {
        totalLeads: total,
        qualifiedLeads: qualified,
        activeOpportunities: active,
        wonDeals: won,
        estimatedPipelineValueINR: pipeline,
        segmentBreakdown: {
          JOB_SEEKER: 0,
          EMPLOYER: total,
          RECRUITER: 0,
          CAREER_SERVICE: 0,
        },
      };
    } catch {
      return {
        totalLeads: 0,
        qualifiedLeads: 0,
        activeOpportunities: 0,
        wonDeals: 0,
        estimatedPipelineValueINR: 0,
        segmentBreakdown: { JOB_SEEKER: 0, EMPLOYER: 0, RECRUITER: 0, CAREER_SERVICE: 0 },
      };
    }
  }

  /**
   * Discovers and enriches a genuine public prospect in claim1_prospects
   */
  async discoverProspect(prospect: {
    name: string;
    websiteUrl?: string;
    founderEmail?: string;
    categorySlug?: string;
    scopeSlug?: string;
    source?: string;
    isAuditTest?: boolean;
  }): Promise<{ success: boolean; leadId?: string; isAuditTest?: boolean }> {
    try {
      const slug = prospect.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const notes = prospect.isAuditTest
        ? '[AUDIT_TEST] Controlled verification prospect — do not dispatch external outreach.'
        : `Discovered via ${prospect.source || 'Public Directory'}`;

      const { data, error } = await supabase
        .from('claim1_prospects')
        .insert({
          name: prospect.name,
          slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
          website_url: prospect.websiteUrl || `https://${slug}.com`,
          founder_email: prospect.founderEmail || null,
          category_slug: prospect.categorySlug || 'ai-products',
          scope_slug: prospect.scopeSlug || 'india',
          state: 'DISCOVERED',
          priority_score: 75,
          contact_count: 0,
          max_contacts: 3,
          relevance_notes: notes,
          metadata: {
            source: prospect.source || 'CRM_DISCOVERY',
            isAuditTest: Boolean(prospect.isAuditTest),
            discoveredAt: new Date().toISOString(),
          },
        })
        .select('id')
        .single();

      if (error) {
        console.warn('[CustomerAcquisition] Insert failed, falling back:', error.message);
        return { success: false };
      }

      const leadId = (data as any)?.id;

      await kernelEventBus.publish(
        'PROSPECT_DISCOVERED',
        { prospectId: leadId, name: prospect.name, isAuditTest: prospect.isAuditTest },
        'customer_acquisition',
        'employer'
      );

      return { success: true, leadId, isAuditTest: prospect.isAuditTest };
    } catch (err: any) {
      return { success: false };
    }
  }

  /**
   * Qualifies a lead by evaluating hiring demand in jobs catalog and company signals
   */
  async qualifyLead(leadId: string): Promise<{ success: boolean; score: number; hiringSignalsCount: number }> {
    try {
      // Look up prospect
      const { data: prospect } = await supabase
        .from('claim1_prospects')
        .select('*')
        .eq('id', leadId)
        .maybeSingle();

      if (!prospect) return { success: false, score: 0, hiringSignalsCount: 0 };

      // Cross-reference with jobs table for hiring signals
      const companyTerm = prospect.name.toLowerCase().split(' ')[0];
      const { count: hiringCount } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .ilike('company_name', `%${companyTerm}%`);

      const openRoles = hiringCount || 0;
      // Algorithmic qualification score (50 base + 10 per open role, max 99)
      const computedScore = Math.min(99, 50 + openRoles * 10);

      await supabase
        .from('claim1_prospects')
        .update({
          state: 'QUALIFIED',
          priority_score: computedScore,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId);

      return { success: true, score: computedScore, hiringSignalsCount: openRoles };
    } catch {
      return { success: false, score: 0, hiringSignalsCount: 0 };
    }
  }

  /**
   * Prepares a structured commercial recruitment proposal without sending outreach
   */
  async prepareRecruitmentProposal(leadId: string): Promise<RecruitmentProposal | null> {
    try {
      const { data: prospect } = await supabase
        .from('claim1_prospects')
        .select('*')
        .eq('id', leadId)
        .maybeSingle();

      if (!prospect) return null;

      const proposalId = `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      return {
        proposalId,
        prospectId: leadId,
        companyName: prospect.name,
        targetRoles: ['Full-Stack Engineer', 'AI Product Manager', 'DevOps Specialist'],
        recommendedPackage: 'GROWTH_RECRUITMENT',
        monthlyFeeINR: 15000,
        valueProposition: [
          'Pre-screened candidates evaluated with automated TalentScore ATS parser',
          'Verified technical assessments on Indian educational benchmarks',
          'Guaranteed interview pipeline within 7 business days',
          'Dedicated recruitment operating console on TalentXcel',
        ],
        status: 'PENDING_APPROVAL',
        generatedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }
}

export const customerAcquisitionEngine = new CustomerAcquisitionEngine();

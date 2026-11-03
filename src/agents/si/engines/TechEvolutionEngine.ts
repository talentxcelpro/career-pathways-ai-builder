// src/agents/si/engines/TechEvolutionEngine.ts
// Engine 5 — Self-Evolving Technology Intelligence

import { supabase } from '@/integrations/supabase/client';
import type { TechDiscovery } from '../types';

class TechEvolutionEngine {
  async getTechDiscoveries(status?: string): Promise<TechDiscovery[]> {
    try {
      let query = supabase
        .from('si_technology_registry' as any)
        .select('*')
        .order('discovered_at', { ascending: false })
        .limit(30);
      if (status) query = query.eq('evaluation_status', status);
      const { data } = await query;
      return (data || []).map((d: any): TechDiscovery => ({
        id: d.id,
        name: d.name,
        category: d.category,
        source: d.source,
        repositoryUrl: d.repository_url,
        documentationUrl: d.documentation_url,
        version: d.version,
        license: d.license,
        securityStatus: d.security_status,
        evaluationStatus: d.evaluation_status,
        expectedBenefit: d.expected_benefit,
        recommendedUseCase: d.recommended_use_case,
        discoveredAt: d.discovered_at,
      }));
    } catch {
      return [];
    }
  }

  async addDiscovery(discovery: Omit<TechDiscovery, 'id' | 'discoveredAt'>): Promise<{ success: boolean }> {
    try {
      await supabase.from('si_technology_registry' as any).insert({
        ...discovery,
        repository_url: discovery.repositoryUrl,
        documentation_url: discovery.documentationUrl,
        security_status: discovery.securityStatus,
        evaluation_status: discovery.evaluationStatus,
        expected_benefit: discovery.expectedBenefit,
        recommended_use_case: discovery.recommendedUseCase,
        discovered_at: new Date().toISOString(),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  async updateEvaluationStatus(id: string, status: TechDiscovery['evaluationStatus']): Promise<void> {
    try {
      await supabase
        .from('si_technology_registry' as any)
        .update({ evaluation_status: status, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch { /* safe */ }
  }

  async getEvaluationStats(): Promise<Record<string, number>> {
    try {
      const { data } = await supabase
        .from('si_technology_registry' as any)
        .select('evaluation_status');
      const counts: Record<string, number> = {};
      for (const r of (data || [])) {
        counts[r.evaluation_status] = (counts[r.evaluation_status] || 0) + 1;
      }
      return counts;
    } catch {
      return {};
    }
  }
}

export const techEvolutionEngine = new TechEvolutionEngine();

// src/agents/si/engines/MarketingFactoryEngine.ts
// Engine 1 — Autonomous Marketing Factory

import { supabase } from '@/integrations/supabase/client';
import { kernelToolRegistry } from '@/agents/kernel/ToolRegistry';
import { kernelEventBus } from '@/agents/kernel/EventBus';
import { kernelAgentRegistry } from '@/agents/kernel/AgentRegistry';

export interface ContentAsset {
  id: string;
  type: 'SEO_ARTICLE' | 'SOCIAL_POST' | 'EMAIL' | 'CAREER_GUIDE' | 'LANDING_PAGE' | 'VIDEO_SCRIPT';
  title: string;
  targetAudience: string;
  primaryKeyword: string;
  funnelStage: 'AWARENESS' | 'CONSIDERATION' | 'CONVERSION' | 'RETENTION';
  status: 'DRAFT' | 'QA_PENDING' | 'APPROVED' | 'PUBLISHED' | 'SCHEDULED';
  qualityScore?: number;
  conversionObjective?: string;
  createdAt: string;
  publishedAt?: string;
  channel?: string;
}

export interface CampaignRecord {
  id: string;
  name: string;
  objective: string;
  status: 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: string;
  endDate?: string;
  targetAudience: string;
  channels: string[];
  contentAssetCount: number;
  impressions?: number;
  clicks?: number;
  registrations?: number;
}

class MarketingFactoryEngine {
  private dailyContentCount = 0;
  private readonly MAX_DAILY_CONTENT = 5; // SEO governance limit

  async getActiveCampaigns(): Promise<CampaignRecord[]> {
    // Try to fetch from si_campaigns if it exists, otherwise return structured empty state
    try {
      const { data } = await supabase
        .from('si_campaigns' as any)
        .select('*')
        .in('status', ['PLANNING', 'ACTIVE'])
        .order('created_at', { ascending: false })
        .limit(10);
      return (data || []) as CampaignRecord[];
    } catch {
      return [];
    }
  }

  async getContentAssets(status?: string): Promise<ContentAsset[]> {
    try {
      let query = supabase
        .from('si_content_assets' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (status) {
        query = query.eq('status', status);
      }
      const { data } = await query;
      return (data || []) as ContentAsset[];
    } catch {
      return [];
    }
  }

  async queueContentRequest(request: {
    type: ContentAsset['type'];
    title: string;
    targetAudience: string;
    primaryKeyword: string;
    funnelStage: ContentAsset['funnelStage'];
    conversionObjective?: string;
  }): Promise<{ success: boolean; message: string }> {
    if (this.dailyContentCount >= this.MAX_DAILY_CONTENT) {
      return {
        success: false,
        message: `Daily content limit reached (${this.MAX_DAILY_CONTENT} assets per day). This preserves SEO quality governance.`,
      };
    }

    try {
      await supabase.from('si_content_assets' as any).insert({
        ...request,
        status: 'DRAFT',
        created_at: new Date().toISOString(),
      });
      this.dailyContentCount++;

      await kernelEventBus.publish(
        'CAMPAIGN_CREATED',
        { type: request.type, keyword: request.primaryKeyword },
        'marketing_factory',
        'growth_marketing'
      );

      return { success: true, message: `Content request queued: "${request.title}"` };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async getSEOMetrics(): Promise<{
    totalIndexedPages: number;
    organicKeywords: number;
    avgPosition: number;
    totalClicks: number;
    totalImpressions: number;
  }> {
    try {
      // Pull from existing GSC data in Supabase if available
      const { data } = await supabase
        .from('gsc_performance_data' as any)
        .select('clicks, impressions, position, query')
        .limit(1000);

      if (!data || data.length === 0) {
        return { totalIndexedPages: 0, organicKeywords: 0, avgPosition: 0, totalClicks: 0, totalImpressions: 0 };
      }

      const totalClicks = data.reduce((sum: number, r: any) => sum + (Number(r.clicks) || 0), 0);
      const totalImpressions = data.reduce((sum: number, r: any) => sum + (Number(r.impressions) || 0), 0);
      const avgPosition = data.reduce((sum: number, r: any) => sum + (Number(r.position) || 0), 0) / data.length;

      return {
        totalIndexedPages: 0, // would come from GSC URL inspection
        organicKeywords: data.length,
        avgPosition: Math.round(avgPosition * 10) / 10,
        totalClicks,
        totalImpressions,
      };
    } catch {
      return { totalIndexedPages: 0, organicKeywords: 0, avgPosition: 0, totalClicks: 0, totalImpressions: 0 };
    }
  }

  async getCompetitorIntelligence(): Promise<Array<{
    name: string;
    website: string;
    seoVisibility: 'HIGH' | 'MEDIUM' | 'LOW';
    targetSegment: string;
    keyWeakness: string;
    opportunity: string;
  }>> {
    // Static seed data for now — would be populated by competitor intelligence agent
    return [
      { name: 'Naukri.com', website: 'naukri.com', seoVisibility: 'HIGH', targetSegment: 'Job seekers & recruiters', keyWeakness: 'Generic resume tools, no AI personalisation', opportunity: 'Premium AI-powered career coaching' },
      { name: 'LinkedIn (India)', website: 'linkedin.com', seoVisibility: 'HIGH', targetSegment: 'Professionals', keyWeakness: 'Expensive premium, complex UI', opportunity: 'Affordable ATS-optimised resumes' },
      { name: 'Internshala', website: 'internshala.com', seoVisibility: 'MEDIUM', targetSegment: 'Students & freshers', keyWeakness: 'Limited to internships, no career progression', opportunity: 'Full career passport from fresher to executive' },
      { name: 'Apna', website: 'apna.co', seoVisibility: 'MEDIUM', targetSegment: 'Blue/grey collar workers', keyWeakness: 'No white-collar focus', opportunity: 'Professional resume services for mid-career switches' },
    ];
  }
}

export const marketingFactoryEngine = new MarketingFactoryEngine();

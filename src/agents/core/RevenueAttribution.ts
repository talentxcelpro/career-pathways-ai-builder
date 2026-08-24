// src/agents/core/RevenueAttribution.ts
// Multi-Touch Revenue & Acquisition Attribution Engine

import type { AttributionRecord, DepartmentType } from './types';
import { supabase } from '@/integrations/supabase/client';

export class RevenueAttribution {
  private inMemoryAttributions: AttributionRecord[] = [];

  async trackConversion(record: Omit<AttributionRecord, 'id' | 'timestamp'>): Promise<AttributionRecord> {
    const fullRecord: AttributionRecord = {
      ...record,
      id: `attr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    this.inMemoryAttributions.unshift(fullRecord);
    if (this.inMemoryAttributions.length > 500) {
      this.inMemoryAttributions.pop();
    }

    try {
      await supabase.from('claim1_growth_events' as any).insert({
        event_type: `CONVERSION_${record.conversionType}`,
        channel: record.channelId,
        metadata: {
          ...fullRecord,
          attributionId: fullRecord.id,
        },
      });
    } catch {
      // safe fallback
    }

    return fullRecord;
  }

  getRecentAttributions(limit = 30): AttributionRecord[] {
    return this.inMemoryAttributions.slice(0, limit);
  }

  getChannelRevenueBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    for (const item of this.inMemoryAttributions) {
      breakdown[item.channelId] = (breakdown[item.channelId] || 0) + item.revenueAmountINR;
    }
    return breakdown;
  }
}

export const coreRevenueAttribution = new RevenueAttribution();

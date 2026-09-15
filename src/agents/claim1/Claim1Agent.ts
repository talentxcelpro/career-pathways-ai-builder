// src/agents/claim1/Claim1Agent.ts
// Autonomous Claim #1 Revenue & Leaderboard Operating Agent

import { eventBus } from '../shared/EventBus';
import { businessMemory } from '../shared/BusinessMemory';
import { guardrails } from '../shared/Guardrails';
import { agentAuditLog } from '../shared/AuditLog';
import { supabase } from '@/integrations/supabase/client';
import type { AgentStatus } from '../shared/types';

export class Claim1Agent {
  readonly name = 'Claim1Agent';
  private status: AgentStatus = 'IDLE';

  constructor() {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    // React to new claims
    eventBus.subscribe('CLAIM1_PROFILE_CLAIMED', async (event) => {
      await this.handleProfileClaimed(event.payload);
    });

    // React to outbid events
    eventBus.subscribe('CLAIM1_ENTITY_OUTBID', async (event) => {
      await this.handleEntityOutbid(event.payload);
    });
  }

  /**
   * Heartbeat / tick executed by the kernel
   */
  async pulse(): Promise<void> {
    this.status = 'RUNNING';
    try {
      // 1. Audit active leaderboards and check for stale or un-reclaimed positions
      const { data: listings } = await supabase
        .from('claim1_listings')
        .select('id, entity_id, scope_id, current_bid_amount, current_rank, bid_count')
        .order('current_rank', { ascending: true })
        .limit(20);

      // 2. Log pulse
      await agentAuditLog.record(this.name, 'PULSE_LEADERBOARD_AUDIT', {
        activeListingsChecked: listings?.length || 0,
      });

      this.status = 'IDLE';
    } catch (err: any) {
      this.status = 'ERROR';
      await agentAuditLog.record(this.name, 'PULSE_ERROR', {}, false, err.message);
    }
  }

  /**
   * Handles newly claimed company entity
   */
  private async handleProfileClaimed(payload: { entityId: string; slug: string; name: string }) {
    await agentAuditLog.record(this.name, 'HANDLE_CLAIMED_ENTITY', payload);

    // Notify marketing agent to trigger welcome and 1-click flex suggestions
    await eventBus.publish(
      'CONVERSION_RECORDED',
      {
        conversionType: 'CLAIM1_PROFILE_CLAIMED',
        entityId: payload.entityId,
        slug: payload.slug,
      },
      this.name
    );
  }

  /**
   * Handles outbid rivalry event
   */
  private async handleEntityOutbid(payload: {
    listingId: string;
    dethronedEntityName: string;
    newRank: number;
    reclaimPrice: number;
  }) {
    await agentAuditLog.record(this.name, 'TRIGGER_RECLAIM_RIVALRY', payload);

    // Publish event for telemetry and notification engines
    await eventBus.publish(
      'OUTREACH_SENT',
      {
        channel: 'outbid_notification',
        targetListingId: payload.listingId,
        reclaimTarget: payload.reclaimPrice,
      },
      this.name
    );
  }

  getStatus(): AgentStatus {
    return this.status;
  }
}

export const claim1Agent = new Claim1Agent();

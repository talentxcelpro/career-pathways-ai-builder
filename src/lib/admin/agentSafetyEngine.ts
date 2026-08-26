// src/lib/admin/agentSafetyEngine.ts
// AI Agent Safety & Risk Classification Engine
// Prevents high-risk/irreversible autonomous operations without human governance.

import { isSuperAdminUser, AdminActor } from './superAdminPolicy';
import { recordAdminAction } from './adminAuditLedger';

export type AgentRiskClass =
  | 'READ_ONLY'        // Scraping public data, inspecting queries, read-only analytics
  | 'LOW_RISK'        // Generating draft content, drafting emails, local cache warming
  | 'REVERSIBLE'      // Updating draft status, creating internal indexes, generating scorecards
  | 'EXTERNAL_ACTION' // Sending live emails, posting to LinkedIn, webhook dispatches
  | 'IRREVERSIBLE';   // Deleting data, mass user role modifications, treasury minting

export interface AgentActionSpec {
  action_id: string;
  agent_name: string;
  risk_class: AgentRiskClass;
  description: string;
  reversible: boolean;
  requires_super_admin: boolean;
}

export const AGENT_ACTION_CATALOG: Record<string, AgentActionSpec> = Object.freeze({
  'scrape_public_jobs': {
    action_id: 'scrape_public_jobs',
    agent_name: 'JobScraperAgent',
    risk_class: 'READ_ONLY',
    description: 'Fetch and parse publicly listed job listings from external sources',
    reversible: true,
    requires_super_admin: false
  },
  'generate_ats_scorecard': {
    action_id: 'generate_ats_scorecard',
    agent_name: 'ATSAnalysisAgent',
    risk_class: 'LOW_RISK',
    description: 'Analyze resume keywords and generate score breakdown',
    reversible: true,
    requires_super_admin: false
  },
  'publish_network_post': {
    action_id: 'publish_network_post',
    agent_name: 'SocialBotAgent',
    risk_class: 'EXTERNAL_ACTION',
    description: 'Publish AI generated industry topic directly to public feed',
    reversible: true,
    requires_super_admin: false
  },
  'mass_user_suspension': {
    action_id: 'mass_user_suspension',
    agent_name: 'SecurityEnforcementAgent',
    risk_class: 'IRREVERSIBLE',
    description: 'Execute automated ban on suspect bot networks',
    reversible: false,
    requires_super_admin: true
  },
  'autonomous_treasury_mint': {
    action_id: 'autonomous_treasury_mint',
    agent_name: 'TokenEconomyAgent',
    risk_class: 'IRREVERSIBLE',
    description: 'Direct minting of platform TXC tokens',
    reversible: false,
    requires_super_admin: true
  }
});

/**
 * Evaluates whether an agent action is permitted to execute automatically or requires human gate
 */
export function evaluateAgentExecutionGate(
  actionId: string,
  actor?: AdminActor | null
): { allowed: boolean; requiresApproval: boolean; riskClass: AgentRiskClass; reason: string } {
  const spec = AGENT_ACTION_CATALOG[actionId] || {
    action_id: actionId,
    agent_name: 'GenericAgent',
    risk_class: 'EXTERNAL_ACTION' as AgentRiskClass,
    description: 'Unclassified agent operation',
    reversible: false,
    requires_super_admin: true
  };

  if (spec.risk_class === 'READ_ONLY' || spec.risk_class === 'LOW_RISK') {
    return {
      allowed: true,
      requiresApproval: false,
      riskClass: spec.risk_class,
      reason: `Automated execution permitted for ${spec.risk_class} action.`
    };
  }

  if (spec.risk_class === 'REVERSIBLE') {
    return {
      allowed: true,
      requiresApproval: false,
      riskClass: spec.risk_class,
      reason: 'Automated execution permitted with immutable audit log.'
    };
  }

  if (spec.risk_class === 'EXTERNAL_ACTION') {
    return {
      allowed: true,
      requiresApproval: false,
      riskClass: spec.risk_class,
      reason: 'External action permitted subject to active safety switches.'
    };
  }

  // IRREVERSIBLE requires Super Admin identity
  const isSuper = isSuperAdminUser(actor);
  return {
    allowed: isSuper,
    requiresApproval: !isSuper,
    riskClass: spec.risk_class,
    reason: isSuper
      ? 'IRREVERSIBLE action approved by Super Admin.'
      : 'BLOCKED: IRREVERSIBLE action requires Root Super Admin confirmation.'
  };
}

// src/lib/admin/treasuryPolicyEngine.ts
// TXC Treasury Governance & Multi-Signature Engine
// Enforces 2-Super-Admin multi-sig for large mints, mandatory audit reasons, and append-only ledger invariant.

import { isSuperAdminPhone, AdminActor } from './superAdminPolicy';
import { recordAdminAction } from './adminAuditLedger';

export interface TreasuryMintRequest {
  request_id: string;
  amount_txc: number;
  recipient_user_id: string;
  recipient_name?: string;
  reason: string;
  requested_by_phone: string;
  requested_at: string;
  signatures: Array<{
    admin_phone: string;
    signed_at: string;
    approved: boolean;
    note?: string;
  }>;
  status: 'PENDING_SECOND_SIGNATURE' | 'EXECUTED' | 'REJECTED';
  executed_at?: string;
}

export const TREASURY_TIER_LIMITS = Object.freeze({
  AUTOMATED_USER_REWARD_MAX: 1000,
  SCOPED_ADMIN_AWARD_MAX: 10000,
  SUPER_ADMIN_SINGLE_MINT_MAX: 100000,
  MULTI_SIG_THRESHOLD: 100000
});

/**
 * Validates mandatory reason string for financial balance modifications
 */
export function validateAdjustmentReason(reason: string): { valid: boolean; error?: string } {
  if (!reason || reason.trim().length < 10) {
    return {
      valid: false,
      error: 'Treasury Policy Error: A descriptive reason of at least 10 characters is mandatory for any balance adjustment.'
    };
  }
  return { valid: true };
}

/**
 * Evaluates treasury operation category and required authorization
 */
export function classifyTreasuryOperation(amountTxc: number): {
  tier: 'AUTOMATED' | 'SCOPED_ADMIN' | 'SUPER_ADMIN_SINGLE' | 'MULTI_SIG_REQUIRED';
  requiredSignatures: number;
} {
  if (amountTxc <= TREASURY_TIER_LIMITS.AUTOMATED_USER_REWARD_MAX) {
    return { tier: 'AUTOMATED', requiredSignatures: 0 };
  }
  if (amountTxc <= TREASURY_TIER_LIMITS.SCOPED_ADMIN_AWARD_MAX) {
    return { tier: 'SCOPED_ADMIN', requiredSignatures: 1 };
  }
  if (amountTxc <= TREASURY_TIER_LIMITS.SUPER_ADMIN_SINGLE_MINT_MAX) {
    return { tier: 'SUPER_ADMIN_SINGLE', requiredSignatures: 1 };
  }
  return { tier: 'MULTI_SIG_REQUIRED', requiredSignatures: 2 };
}

/**
 * In-memory sample of pending multi-sig treasury requests
 */
export const SAMPLE_TREASURY_QUEUE: TreasuryMintRequest[] = [
  {
    request_id: 'txc_req_00192',
    amount_txc: 250000,
    recipient_user_id: 'treasury_pool_main',
    recipient_name: 'TalentXcel Liquidity Pool',
    reason: 'Quarterly candidate onboarding incentive allocation & university career fair reward pool.',
    requested_by_phone: '9910678611',
    requested_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    signatures: [
      {
        admin_phone: '9910678611',
        signed_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        approved: true,
        note: 'Initial request authored and signed by Root Admin 1'
      }
    ],
    status: 'PENDING_SECOND_SIGNATURE'
  }
];

/**
 * Approves a treasury request with second Super Admin signature
 */
export function submitSecondSignature(
  request: TreasuryMintRequest,
  actor: AdminActor,
  approved: boolean,
  note?: string
): TreasuryMintRequest {
  if (!isSuperAdminPhone(actor.phone)) {
    throw new Error('TREASURY_POLICY_ERROR: Only a verified Root Super Admin can sign treasury mint requests.');
  }

  const signerNorm = (actor.phone || '').replace(/[^0-9]/g, '').slice(-10);
  const firstSignerNorm = request.requested_by_phone.replace(/[^0-9]/g, '').slice(-10);

  if (signerNorm === firstSignerNorm) {
    throw new Error('TREASURY_MULTI_SIG_ERROR: The second signature must be from the other Super Admin (Dual Control Invariant).');
  }

  const updatedSignatures = [
    ...request.signatures,
    {
      admin_phone: actor.phone || '',
      signed_at: new Date().toISOString(),
      approved,
      note
    }
  ];

  const updatedRequest: TreasuryMintRequest = {
    ...request,
    signatures: updatedSignatures,
    status: approved ? 'EXECUTED' : 'REJECTED',
    executed_at: approved ? new Date().toISOString() : undefined
  };

  recordAdminAction({
    actor_user_id: actor.id,
    actor_phone: actor.phone || null,
    actor_role: 'SUPER_ADMIN',
    action: approved ? 'TXC_MINT_APPROVED' : 'TXC_MINT_REJECTED',
    resource_type: 'TREASURY_MINT_REQUEST',
    resource_id: request.request_id,
    before_state: { status: request.status },
    after_state: { status: updatedRequest.status, amount_txc: request.amount_txc },
    reason: note || (approved ? 'Dual Super Admin Approval Executed' : 'Rejected by second Super Admin'),
    success: true
  });

  return updatedRequest;
}

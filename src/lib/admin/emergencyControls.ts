// src/lib/admin/emergencyControls.ts
// Platform Emergency Controls & Kill Switches
// Centralized, audited kill switches to immediately halt high-risk autonomous subsystems.

import { isSuperAdminUser, AdminActor } from './superAdminPolicy';
import { recordAdminAction } from './adminAuditLedger';

export interface EmergencyControlState {
  disable_txc_minting: boolean;
  disable_ai_agents: boolean;
  disable_automated_publishing: boolean;
  disable_bot_posting: boolean;
  maintenance_mode: boolean;
  updated_at: string;
  updated_by_phone: string;
  reason: string;
}

let CURRENT_EMERGENCY_STATE: EmergencyControlState = {
  disable_txc_minting: false,
  disable_ai_agents: false,
  disable_automated_publishing: false,
  disable_bot_posting: false,
  maintenance_mode: false,
  updated_at: new Date().toISOString(),
  updated_by_phone: 'SYSTEM_BOOT',
  reason: 'Initial safe production baseline'
};

export function getEmergencyControlState(): EmergencyControlState {
  return { ...CURRENT_EMERGENCY_STATE };
}

export function setEmergencyKillSwitch(
  key: keyof Omit<EmergencyControlState, 'updated_at' | 'updated_by_phone' | 'reason'>,
  newValue: boolean,
  actor: AdminActor,
  reason: string
): EmergencyControlState {
  if (!isSuperAdminUser(actor)) {
    throw new Error('EMERGENCY_CONTROL_DENIED: Only a verified Root Super Admin can toggle platform emergency kill switches.');
  }

  if (!reason || reason.trim().length < 8) {
    throw new Error('EMERGENCY_CONTROL_ERROR: A non-empty reason is mandatory to toggle platform emergency controls.');
  }

  const before = { ...CURRENT_EMERGENCY_STATE };

  CURRENT_EMERGENCY_STATE = {
    ...CURRENT_EMERGENCY_STATE,
    [key]: newValue,
    updated_at: new Date().toISOString(),
    updated_by_phone: actor.phone || '9910678611',
    reason
  };

  recordAdminAction({
    actor_user_id: actor.id,
    actor_phone: actor.phone || null,
    actor_role: 'SUPER_ADMIN',
    action: 'EMERGENCY_KILL_SWITCH_TOGGLED',
    resource_type: 'EMERGENCY_CONTROL',
    resource_id: String(key),
    before_state: { [key]: before[key] },
    after_state: { [key]: newValue },
    reason,
    success: true
  });

  return { ...CURRENT_EMERGENCY_STATE };
}

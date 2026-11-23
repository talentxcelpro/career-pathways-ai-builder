import { useActivityHeartbeat } from './useActivityHeartbeat';

/**
 * useUserPresence - Upgraded to delegate to unified activity heartbeat engine.
 * Maintains backward compatibility while eliminating conflicting duplicate channels.
 */
export function useUserPresence() {
  useActivityHeartbeat();
}

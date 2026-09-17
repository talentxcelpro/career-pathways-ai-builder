/**
 * UDX Comparator Module — Barrel Export
 * v3.3 Ollama-Only Blind Generic AI Comparator Gate
 */
export {
  runComparatorHandshake,
  runObjectiveQualification,
  enforceBlindingInvariant,
  BlindingViolationError,
} from './ComparatorGate';

export type {
  ComparatorStatus,
  ComparatorGateResult,
  ComparatorObjectiveResult,
  TVOMetrics,
} from './ComparatorGate';

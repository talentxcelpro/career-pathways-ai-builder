// src/agents/si/types.ts
// TalentXcel SI — Autonomous Growth OS: Complete Unified Type System
// Extends kernel types with six-engine SI model, orchestration, approvals, MCP, and metrics.

// ── Six Autonomous Engines ──────────────────────────────────────────────────
export type SIEngineId =
  | 'marketing_factory'    // Engine 1: Autonomous Marketing Factory
  | 'customer_acquisition' // Engine 2: Autonomous Customer Acquisition
  | 'career_intelligence'  // Engine 3: Autonomous Career Intelligence
  | 'mcp_gateway'          // Engine 4: MCP Integration Gateway
  | 'tech_evolution'       // Engine 5: Self-Evolving Technology Intelligence
  | 'growth_flywheel';     // Engine 6: Autonomous Growth Flywheel

export interface SIEngine {
  id: SIEngineId;
  name: string;
  description?: string;
  assignedAgents?: string[];
  assignedAgentIds?: string[];
  status: 'ACTIVE' | 'IDLE' | 'PAUSED' | 'ERROR';
  lastExecutionAt: string | null;
  nextExecutionAt?: string | null;
  nextScheduledAt?: string | null;
  tasksCompleted: number;
  tasksFailed: number;
  successRate: number;
  costINR: number;
}

// ── Metrics ─────────────────────────────────────────────────────────────────
export interface SIMetrics {
  totalUsers: number;
  totalCompanies: number;
  activeJobs: number;
  totalJobs?: number;
  revenueINR: number;
  totalRevenue?: number;
  pendingApprovals: number;
  activeTasks: number;
  failedToday: number;
  failedTasksToday?: number;
}

// ── Permission Levels (3-tier model) ──────────────────────────────────────
export type PermissionLevel =
  | 'L1_AUTOMATIC'       // Fully autonomous — no human gate
  | 'L2_CONDITIONAL'     // Autonomous unless threshold exceeded
  | 'L3_HUMAN_APPROVAL'; // Always requires explicit human sign-off

// ── Human Approval Requests / Items ─────────────────────────────────────────
export interface SIApprovalRequest {
  id: string;
  agentId: string;
  engineId: SIEngineId;
  action: string;
  description: string;
  permissionLevel: PermissionLevel;
  financialImpactINR?: number;
  payload: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  expiresAt: string;
}

export interface SIApproval {
  id: string;
  agentId: string;
  agentName?: string;
  engineId: SIEngineId;
  actionTitle: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  financialImpactINR?: number;
  requestedAt: string;
  expiresAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
}

// ── SI Task ────────────────────────────────────────────────────────────────
export interface SITask {
  id: string;
  engineId: SIEngineId | string;
  agentId: string;
  agentName?: string;
  title?: string;
  action?: string;
  description?: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  permissionLevel?: PermissionLevel;
  inputPayload?: Record<string, any>;
  outputPayload?: Record<string, any>;
  errorMessage?: string;
  tokenUsage?: number;
  costINR?: number;
  startedAt?: string;
  completedAt?: string | null;
  createdAt: string;
}

// ── SI Audit Log ───────────────────────────────────────────────────────────
export interface SIAuditLog {
  id: string;
  agentId: string;
  agentName?: string;
  engineId?: string;
  action: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  payload?: Record<string, any>;
  costINR?: number;
  durationMs?: number;
  createdAt: string;
}

// ── MCP Server ─────────────────────────────────────────────────────────────
export interface MCPServer {
  id: string;
  name: string;
  description: string;
  category: string;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'AUTH_REQUIRED' | 'ERROR' | 'DISABLED';
  endpoint?: string;
  authType: 'NONE' | 'API_KEY' | 'OAUTH' | 'SERVICE_ACCOUNT';
  toolCount: number;
  lastHealthCheckAt?: string;
  usageThisMonth: number;
  costINR: number;
}

// ── Technology Discovery ───────────────────────────────────────────────────
export interface TechDiscovery {
  id: string;
  name: string;
  category: 'AI_MODEL' | 'MCP_SERVER' | 'API' | 'FRAMEWORK' | 'REPOSITORY';
  source: string;
  repositoryUrl?: string;
  documentationUrl?: string;
  version?: string;
  license?: string;
  securityStatus: 'REVIEWED' | 'PENDING_REVIEW' | 'FLAGGED';
  evaluationStatus:
    | 'DISCOVERED'
    | 'EVALUATING'
    | 'BENCHMARKING'
    | 'RECOMMENDED'
    | 'ADOPTED'
    | 'REJECTED';
  expectedBenefit?: string;
  recommendedUseCase?: string;
  discoveredAt: string;
}

// ── SI Command ─────────────────────────────────────────────────────────────
export interface SICommand {
  id: string;
  instruction: string;
  engineTarget?: SIEngineId;
  agentTarget?: string;
  status: 'QUEUED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  result?: string;
  workflowId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SICommandResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

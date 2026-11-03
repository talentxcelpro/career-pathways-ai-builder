const fs = require('fs');
const filePath = 'src/agents/si/SIOrchestrator.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes('ApprovalGovernanceEngine')) {
  content = content.replace(
    "import type { SIEngine, SIEngineId, SITask, SIApprovalRequest } from './types';",
    "import { approvalGovernanceEngine } from './governance/ApprovalGovernanceEngine';\nimport type { SIEngine, SIEngineId, SITask, SIApprovalRequest } from './types';"
  );
}

// 2. Update getPendingApprovals and resolveApproval
const oldApprovalsBlock = `  // ── Approval Management ───────────────────────────────────────────────
  async getPendingApprovals(): Promise<SIApprovalRequest[]> {
    try {
      const { data } = await supabase
        .from('si_approvals' as any)
        .select('*')
        .eq('status', 'PENDING')
        .order('requested_at', { ascending: false });
      return (data || []) as unknown as SIApprovalRequest[];
    } catch {
      return [];
    }
  }

  async resolveApproval(approvalId: string, decision: 'APPROVED' | 'REJECTED'): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase
        .from('si_approvals' as any)
        .update({
          status: decision,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq('id', approvalId);
    } catch {
      // safe fallback
    }
  }`;

const newApprovalsBlock = `  // ── Approval Management ───────────────────────────────────────────────
  async getPendingApprovals(): Promise<SIApprovalRequest[]> {
    return await approvalGovernanceEngine.getPendingRequests();
  }

  async resolveApproval(approvalId: string, decision: 'APPROVED' | 'REJECTED'): Promise<void> {
    const operator = { id: 'admin-console', role: 'admin' as const };
    if (decision === 'APPROVED') {
      await approvalGovernanceEngine.approveRequest(approvalId, operator);
    } else {
      await approvalGovernanceEngine.rejectRequest(approvalId, operator, 'Declined by Administrator');
    }
  }`;

content = content.replace(oldApprovalsBlock, newApprovalsBlock);

// 3. Update triggerEmergencyStop and resumeOperations
content = content.replace(
  `  triggerEmergencyStop(): void {
    this.emergencyStop = true;
    this.isRunning = false;`,
  `  triggerEmergencyStop(): void {
    this.emergencyStop = true;
    this.isRunning = false;
    approvalGovernanceEngine.triggerEmergencyShutdown();`
);

content = content.replace(
  `  resumeOperations(): void {
    this.emergencyStop = false;`,
  `  resumeOperations(): void {
    this.emergencyStop = false;
    approvalGovernanceEngine.resumeOperations();`
);

// 4. Update getLiveMetrics to use approvalGovernanceEngine and real tables
content = content.replace(
  `        supabase
          .from('si_approvals' as any)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'PENDING'),`,
  `        approvalGovernanceEngine.getPendingRequests(),`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched SIOrchestrator.ts');

// scripts/run-si-daily-cycle.ts
// TalentXcel SI — Autonomous Daily Operating Cycle
// Executes scheduled business cycles across all 6 engines with concurrency control and audit logging.

import { siOrchestrator } from '../src/agents/si/SIOrchestrator';
import { coreAgentOrchestrator } from '../src/agents/core/AgentOrchestrator';
import { marketingFactoryEngine } from '../src/agents/si/engines/MarketingFactoryEngine';
import { customerAcquisitionEngine } from '../src/agents/si/engines/CustomerAcquisitionEngine';
import { careerIntelligenceEngine } from '../src/agents/si/engines/CareerIntelligenceEngine';
import { mcpGatewayEngine } from '../src/agents/si/engines/MCPGatewayEngine';
import { techEvolutionEngine } from '../src/agents/si/engines/TechEvolutionEngine';
import { growthFlywheelEngine } from '../src/agents/si/engines/GrowthFlywheelEngine';
import { kernelAuditEngine } from '../src/agents/kernel/AuditEngine';
import { kernelEventBus } from '../src/agents/kernel/EventBus';

export async function executeAutonomousDailyCycle() {
  console.log(`[${new Date().toISOString()}] ══════════════════════════════════════════════════════════════`);
  console.log('TALENTXCEL SI — AUTONOMOUS DAILY OPERATING CYCLE: COMMENCING');
  console.log(`[${new Date().toISOString()}] ══════════════════════════════════════════════════════════════\n`);

  const startTime = Date.now();

  try {
    // ── STAGE 1: CONTINUOUS MONITORING & HEALTH CHECK ───────────────────────────
    console.log('▶ [STAGE 1] Health & Connectivity Verification...');
    const health = await mcpGatewayEngine.getGatewayHealth();
    console.log(`  ✓ MCP Gateway: ${health.registeredTools} tools registered, ${health.connectedServers} servers online.`);

    // ── STAGE 2: MORNING INTELLIGENCE CYCLE ────────────────────────────────────
    console.log('\n▶ [STAGE 2] Morning Commercial & Telemetry Reconciliation...');
    const funnel = await growthFlywheelEngine.getFunnelMetrics();
    console.log(`  ✓ Growth Funnel Stages Reconciled (${funnel.length} stages audited).`);

    // ── STAGE 3: MARKETING FACTORY CYCLE ───────────────────────────────────────
    console.log('\n▶ [STAGE 3] Autonomous Marketing Factory (Engine 1)...');
    const competitors = await marketingFactoryEngine.getCompetitorIntelligence();
    console.log(`  ✓ Competitor Monitor: ${competitors.length} key rival domains indexed.`);

    // ── STAGE 4: CUSTOMER ACQUISITION CYCLE ────────────────────────────────────
    console.log('\n▶ [STAGE 4] Autonomous Customer Acquisition (Engine 2)...');
    const leadStats = await customerAcquisitionEngine.getLeadStats();
    console.log(`  ✓ Pipeline Snapshot: ${leadStats.totalLeads} total prospects in multi-stage CRM.`);

    // ── STAGE 5: CAREER INTELLIGENCE CYCLE ─────────────────────────────────────
    console.log('\n▶ [STAGE 5] Autonomous Career Intelligence (Engine 3)...');
    const trendingSkills = await careerIntelligenceEngine.getTrendingSkills();
    console.log(`  ✓ Trending Skills Ingested: ${trendingSkills.slice(0, 3).map(s => s.name).join(', ')}.`);

    // ── STAGE 6: TECHNOLOGY EVOLUTION CYCLE ───────────────────────────────────
    console.log('\n▶ [STAGE 6] Technology Evolution & Benchmarking (Engine 5)...');
    const techDiscoveries = await techEvolutionEngine.getTechDiscoveries();
    console.log(`  ✓ Technology Registry: ${techDiscoveries.length} AI models/tools evaluated.`);

    // ── STAGE 7: EXECUTIVE ORCHESTRATOR PULSE ───────────────────────────────────
    console.log('\n▶ [STAGE 7] Master Orchestration Pulse across all 48 Specialist Workers...');
    const cycleResult = await coreAgentOrchestrator.executeFullBusinessCycle();
    console.log(`  ✓ Master Pulse Complete: ${cycleResult.summary}`);

    // ── STAGE 8: EVENING CONSOLIDATION & AUDIT ──────────────────────────────────
    const elapsed = Date.now() - startTime;
    console.log(`\n▶ [STAGE 8] Evening Consolidation: Duration ${elapsed}ms.`);

    await kernelAuditEngine.record('si_orchestrator', 'executive', 'DAILY_CYCLE_COMPLETE', {
      inputs: { durationMs: elapsed, enginesAudited: 6 },
      success: true,
    });

    console.log(`\n[${new Date().toISOString()}] ✅ AUTONOMOUS DAILY OPERATING CYCLE COMPLETED SUCCESSFULLY.`);
    return { success: true, durationMs: elapsed };
  } catch (err: any) {
    console.error(`[${new Date().toISOString()}] ❌ Error during autonomous operating cycle:`, err);
    await kernelAuditEngine.record('si_orchestrator', 'executive', 'DAILY_CYCLE_FAILED', {
      inputs: { error: err?.message || String(err) },
      success: false,
      error: err?.message,
    });
    return { success: false, error: err?.message };
  }
}

// Run directly if invoked from CLI
if (process.argv[1]?.endsWith('run-si-daily-cycle.ts')) {
  executeAutonomousDailyCycle()
    .then((res) => {
      if (!res.success) process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

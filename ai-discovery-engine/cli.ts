/**
 * ai-discovery-engine/cli.ts
 * Command Line Interface for the TalentXcel Global AI Discovery & Distribution Engine.
 * Run with: npx tsx ai-discovery-engine/cli.ts [audit|expand|benchmark|sources]
 */

import fs from 'fs';
import path from 'path';
import {
  AI_PLATFORM_REGISTRY,
  CANONICAL_PRODUCT_ENTITIES,
  CORE_QUERY_DEFINITIONS,
  generateExpandedQueryUniverse,
  COMPETITOR_REGISTRY,
  AI_AUTHORITY_SOURCES,
  AiVisibilityBenchmarkRunner
} from './src';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'summary';

  console.log('🌐 TALENTXCEL GLOBAL AI DISCOVERY & DISTRIBUTION ENGINE CLI');
  console.log(`Command: ${command}\n`);

  if (command === 'summary' || command === 'audit') {
    console.log(`📦 Registered Product Entities: ${CANONICAL_PRODUCT_ENTITIES.length}`);
    CANONICAL_PRODUCT_ENTITIES.forEach((e) => {
      console.log(`   - [${e.id}] ${e.name} -> ${e.canonicalUrl} (${e.functionalConnections.length} functional links)`);
    });

    console.log(`\n🤖 Registered AI Platforms: ${AI_PLATFORM_REGISTRY.length}`);
    const tier1 = AI_PLATFORM_REGISTRY.filter((p) => p.tier === 1);
    const tier2 = AI_PLATFORM_REGISTRY.filter((p) => p.tier === 2);
    console.log(`   Tier 1 (Priority): ${tier1.map((p) => p.name).join(', ')}`);
    console.log(`   Tier 2 (Expanded): ${tier2.map((p) => p.name).join(', ')}`);

    console.log(`\n🔍 Core Query Clusters: ${CORE_QUERY_DEFINITIONS.length}`);
    console.log(`🏢 Competitor Profiles: ${COMPETITOR_REGISTRY.length}`);
    console.log(`📚 Authority Sources:   ${AI_AUTHORITY_SOURCES.length}`);
  }

  if (command === 'expand' || command === 'all') {
    console.log('\n🌍 Generating Combinatorial Multi-Country Query Universe...');
    const expanded = generateExpandedQueryUniverse();
    console.log(`✅ Generated ${expanded.length} localized query-destination mappings across 21 global markets.`);

    const outDir = path.resolve('ai-discovery-engine/output');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outFile = path.join(outDir, 'expanded_query_universe.json');
    fs.writeFileSync(outFile, JSON.stringify(expanded, null, 2), 'utf-8');
    console.log(`📁 Saved query universe to: ${outFile}`);
  }

  if (command === 'benchmark' || command === 'all') {
    console.log('\n📊 Initializing Visibility Benchmark Schema...');
    const runner = new AiVisibilityBenchmarkRunner();
    const baseline = runner.generateBaselineObservationSchema();
    console.log(`✅ Generated ${baseline.length} observation schemas for multi-platform tracking.`);

    const outDir = path.resolve('ai-discovery-engine/output');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outFile = path.join(outDir, 'visibility_baseline_observations.json');
    fs.writeFileSync(outFile, JSON.stringify(baseline, null, 2), 'utf-8');
    console.log(`📁 Exported baseline observation ledger to: ${outFile}`);
  }

  if (command === 'sources' || command === 'all') {
    console.log('\n🎯 High-Authority AI Citation Sources:');
    AI_AUTHORITY_SOURCES.forEach((s) => {
      console.log(`   - [${s.sourceType}] ${s.name} (${s.domain}) -> Status: ${s.status} [${s.riskRating}]`);
    });
  }

  console.log('\n✨ AI Discovery Engine operation completed successfully.');
}

main().catch(console.error);

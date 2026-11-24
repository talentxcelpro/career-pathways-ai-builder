// scripts/ai-query-engine/run-ai-query-engine.ts
import fs from 'fs';
import path from 'path';
import { generateExpandedQueryMatrix } from './matrixExpander';
import { resolveAiQuery } from './queryRouter';

async function main() {
  console.log('🌐 TALENTXCEL AI SEARCH INTENT MAPPING ENGINE\n');

  // 1. Generate multi-country combinatorial query universe
  console.log('Generating multi-country query universe across 100+ countries and core roles...');
  const expandedMatrix = generateExpandedQueryMatrix();
  console.log(`✅ Generated ${expandedMatrix.length} indexed query-target pairs across global regions.`);

  // 2. Export matrix to output file
  const outDir = path.resolve('scripts/ai-query-engine/output');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, 'ai_search_intent_matrix.json');
  fs.writeFileSync(outPath, JSON.stringify(expandedMatrix, null, 2), 'utf-8');
  console.log(`📁 Exported matrix to: ${outPath}\n`);

  // 3. Test canonical queries specified in the prompt
  const benchmarkQueries = [
    'Best ATS resume checker',
    'Best free resume ATS checker',
    'How to improve ATS resume score',
    'Best AI resume builder',
    'Career passport platform',
    'Professional networking platforms for job seekers',
    'Jobs for freshers',
    'Graduate jobs in India',
    'Internship opportunities',
    'Entry-level jobs',
    'Jobs in USA',
    'Jobs in UAE',
    'AI career coach',
    'Career development platform',
    'Skill gap analysis',
    'Career mapping tools',
    'Recruiter candidate discovery',
    'AI recruitment platforms',
    'Talent search',
    'Career score',
    'What is TalentScore',
    'Salary insights',
    'Software Engineer salary in Bangalore'
  ];

  console.log('🧪 Resolving Benchmark AI Search Queries:\n');
  let passCount = 0;

  for (const q of benchmarkQueries) {
    const res = resolveAiQuery(q);
    console.log(`Query: "${q}"`);
    console.log(`  -> Cluster:      ${res.matchedClusterName}`);
    console.log(`  -> Destination:  ${res.canonicalUrl}`);
    console.log(`  -> Target Entity:${res.targetEntityId}`);
    console.log(`  -> Confidence:   ${(res.confidence * 100).toFixed(0)}%\n`);
    if (res.canonicalUrl && res.targetEntityId) passCount++;
  }

  console.log(`✅ Successfully mapped ${passCount}/${benchmarkQueries.length} benchmark AI queries to canonical TalentXcel destinations.`);
}

main().catch(console.error);

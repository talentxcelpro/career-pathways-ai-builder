# UDX Benchmark — Reproducibility & Independent Verification Guide
**Run ID**: `bench-v2-2026-09-15-1789487219631`  
**License**: Open Scientific Benchmark Specification

---

## 1. Prerequisites for Independent Replication
1. **Node.js**: v18+ (tested on v25.6.1)
2. **Local Ollama**: Install from https://ollama.com and pull: `ollama pull phi3:mini`
3. **Network**: Internet access to query `https://talentxcel.in/api/udx/resolve`

---

## 2. Command Sequence to Reproduce
```bash
# 1. Clone repository
git clone https://github.com/talentxcelpro/career-pathways-ai-builder.git
cd career-pathways-ai-builder

# 2. Verify frozen architecture
node scripts/verify-udx-architecture.cjs

# 3. Run production reality canary
node scripts/run-production-canary.cjs

# 4. Execute 100-objective blind benchmark
node scripts/run-udx-world-benchmark.cjs
```

---

## 3. Cryptographic & Data Provenance
- Every run generates an immutable `runId`.
- Raw results are saved to `reports/udx_world_challenge/benchmark-results.json`.
- Public UI renders raw measurements at `/discovery/benchmark`.

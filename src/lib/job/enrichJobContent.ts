/**
 * TALENTXCEL — PHASE 2 GATE 2C
 * Runtime Job Intelligence Enrichment Layer
 * src/lib/job/enrichJobContent.ts
 *
 * PURPOSE:
 *   Analyze the canonical job description and extract SECONDARY requirements
 *   that are NOT already represented in the SOURCE_PROVIDED structured fields.
 *
 * GUARANTEES:
 *   - RUNTIME ONLY — never writes to jobs table or any database table
 *   - AI_INFERRED items are always separately tagged; never replace source data
 *   - SOURCE_PROVIDED items always win conflict resolution
 *   - Deduplicates inferred items against existing source requirements
 *   - Malformed / timeout AI response → AI_INFERENCE_UNAVAILABLE (no fallback fabrication)
 *   - Phase 1 atsEngine.ts is NOT modified by this module
 *   - normalizeJobContent.ts is NOT modified by this module
 *
 * ARCHITECTURE:
 *   normalizeJobContent()
 *         ↓
 *   EnrichedJobContent
 *     ├─ sourceRequirements   (from normalizeJobContent — SOURCE_PROVIDED)
 *     └─ inferredRequirements (from this module — AI_INFERRED, runtime only)
 *
 * AI PROVIDER:
 *   Uses existing Supabase ats-analyzer edge function (Gemini 1.5 Flash)
 *   via supabase.functions.invoke(). No new provider introduced.
 */

import { supabase } from '@/integrations/supabase/client';
import {
  NormalizedJobContent,
  NormalizedJobRequirement,
  RequirementCategory,
  ProvenanceSource,
  ProvenanceConfidence,
} from './normalizeJobContent';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InferredCategory =
  | 'MUST_HAVE'
  | 'PREFERRED'
  | 'SKILL'
  | 'RESPONSIBILITY'
  | 'EXPERIENCE'
  | 'EDUCATION';

export interface InferredRequirement {
  text: string;
  category: InferredCategory;
  source: 'AI_INFERRED';
  confidence: ProvenanceConfidence;
  evidence: string;   // exact substring from description that caused inference
  reason: string;     // explanation of the inference decision
}

export type JobEnrichmentStatus =
  | 'ENRICHED'
  | 'ENRICHED_PARTIAL'
  | 'AI_INFERENCE_UNAVAILABLE'
  | 'NO_DESCRIPTION'
  | 'SKIPPED_ALL_SOURCE_PROVIDED';

export interface ConflictReport {
  field: string;
  sourceValue: string;
  inferredValue: string;
  resolution: 'SOURCE_WINS';
}

export interface EnrichedJobContent {
  // Source-side canonical job (unchanged from Gate 2B)
  canonical: NormalizedJobContent;

  // AI-inferred runtime requirements (never persisted)
  inferredRequirements: InferredRequirement[];

  // Metadata
  enrichmentStatus: JobEnrichmentStatus;
  duplicatesRemoved: number;
  conflicts: ConflictReport[];
  confidenceDistribution: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  inferenceTimingMs: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function normalizeForDedup(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Build set of already-known requirement texts from the canonical source.
 * Used to deduplicate AI inferences against existing source-provided data.
 */
function buildSourceCorpus(canonical: NormalizedJobContent): Set<string> {
  const corpus = new Set<string>();
  const allSource: NormalizedJobRequirement[] = [
    ...canonical.skillsRequired,
    ...canonical.mustHaveRequirements,
    ...canonical.niceToHave,
    ...canonical.keyResponsibilities,
  ];
  for (const req of allSource) {
    corpus.add(normalizeForDedup(req.text));
  }
  return corpus;
}

/**
 * Validate a single inferred item from the AI response.
 * Returns null if the item is structurally invalid.
 */
function validateInferredItem(raw: unknown): InferredRequirement | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const item = raw as Record<string, unknown>;

  const text = typeof item.text === 'string' ? item.text.trim() : '';
  if (!text) return null;

  const validCategories = new Set<InferredCategory>([
    'MUST_HAVE', 'PREFERRED', 'SKILL', 'RESPONSIBILITY', 'EXPERIENCE', 'EDUCATION',
  ]);
  const category = validCategories.has(item.category as InferredCategory)
    ? (item.category as InferredCategory)
    : 'PREFERRED';

  const validConfidences = new Set<ProvenanceConfidence>(['HIGH', 'MEDIUM', 'LOW']);
  const confidence = validConfidences.has(item.confidence as ProvenanceConfidence)
    ? (item.confidence as ProvenanceConfidence)
    : 'LOW';

  const evidence = typeof item.evidence === 'string' && item.evidence.trim()
    ? item.evidence.trim()
    : '';
  if (!evidence) return null; // evidence is mandatory — reject items with no evidence

  const reason = typeof item.reason === 'string' ? item.reason.trim() : '';

  return {
    text,
    category,
    source: 'AI_INFERRED',
    confidence,
    evidence,
    reason,
  };
}

/**
 * Build the structured prompt for the AI enrichment call.
 * Instructs the model to extract ONLY secondary requirements not already in the source.
 */
function buildEnrichmentPrompt(canonical: NormalizedJobContent): string {
  const existingSkills = canonical.skillsRequired.map(s => s.text).join(', ') || 'None listed';
  const existingMustHaves = canonical.mustHaveRequirements.map(r => r.text).join('\n') || 'None listed';
  const existingPreferred = canonical.niceToHave.map(r => r.text).join('\n') || 'None listed';
  const existingResponsibilities = canonical.keyResponsibilities.map(r => r.text).join('\n') || 'None listed';

  return `You are a job intelligence engine. Your task is to extract SECONDARY requirements from a job description that are NOT already captured in the structured source fields provided below.

JOB TITLE: ${canonical.title || 'Not specified'}
COMPANY: ${canonical.companyName || 'Not specified'}
EMPLOYMENT TYPE: ${canonical.employmentType}
EXPERIENCE LEVEL: ${canonical.experienceLevel || 'Not specified'}

ALREADY STRUCTURED (SOURCE_PROVIDED — DO NOT DUPLICATE THESE):
Skills: ${existingSkills}
Must-Have Requirements: ${existingMustHaves}
Preferred Requirements: ${existingPreferred}
Key Responsibilities: ${existingResponsibilities}

JOB DESCRIPTION TO ANALYZE:
${canonical.description}

STRICT RULES:
1. Extract ONLY requirements visible in the description that are NOT already in the structured fields above.
2. Use conservative classification — do NOT classify something as MUST_HAVE unless it is explicitly stated as required.
3. Provide exact evidence text from the description for EVERY item.
4. Do NOT invent requirements. Do NOT paraphrase vaguely into a requirement.
5. Do NOT convert casual phrases like "fast learner" into skill or education requirements.
6. Do NOT create numeric experience from non-numeric phrases like "experienced professional".
7. If nothing is clearly inferable beyond what's already structured, return an empty array.
8. Maximum 12 inferred items. Prefer precision over coverage.

CLASSIFICATION GUIDE:
- MUST_HAVE: explicitly required ("must have", "required", "essential", "minimum")
- PREFERRED: desired but not mandatory ("preferred", "nice to have", "bonus", "ideally")
- SKILL: a specific tool, technology, framework, or domain skill
- RESPONSIBILITY: a duty or task this role will perform
- EXPERIENCE: a numeric or clearly bounded experience requirement ("at least 3 years of...")
- EDUCATION: explicit degree or certification requirement ("Bachelor's degree required")

Respond ONLY with a valid JSON object matching this exact schema:
{
  "inferred": [
    {
      "text": "string — the requirement text",
      "category": "MUST_HAVE | PREFERRED | SKILL | RESPONSIBILITY | EXPERIENCE | EDUCATION",
      "confidence": "HIGH | MEDIUM | LOW",
      "evidence": "string — exact relevant quote from the description",
      "reason": "string — brief explanation of why this was inferred"
    }
  ]
}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** AICaller type used for production and test injection */
export type AICaller = (prompt: string) => Promise<{
  data: unknown;
  error: null | { message: string };
}>;

/**
 * enrichJobContentWithCaller
 *
 * Testable flat-argument variant.
 * Accepts the canonical job and an injectable AI caller (mock or real).
 * Used directly by unit tests.
 */
export async function enrichJobContentWithCaller(
  canonical: NormalizedJobContent,
  caller: AICaller
): Promise<EnrichedJobContent> {
    const startTime = Date.now();

    const base: EnrichedJobContent = {
      canonical,
      inferredRequirements: [],
      enrichmentStatus: 'AI_INFERENCE_UNAVAILABLE',
      duplicatesRemoved: 0,
      conflicts: [],
      confidenceDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0 },
      inferenceTimingMs: 0,
    };

    // Guard: no description to analyze
    if (!canonical.description || canonical.description.trim().length < 30) {
      return {
        ...base,
        enrichmentStatus: 'NO_DESCRIPTION',
        inferenceTimingMs: Date.now() - startTime,
      };
    }

    const sourceCorpus = buildSourceCorpus(canonical);
    const prompt = buildEnrichmentPrompt(canonical);

  let rawResponse: unknown;
  try {
    const { data, error } = await caller(prompt);
    if (error) {
      console.warn('[Gate 2C] AI enrichment error:', error.message);
      return { ...base, inferenceTimingMs: Date.now() - startTime };
    }
    rawResponse = data;
  } catch (err) {
    console.warn('[Gate 2C] AI enrichment call failed:', err);
    return { ...base, inferenceTimingMs: Date.now() - startTime };
  }

    let parsedInferred: unknown[] = [];
    try {
      if (typeof rawResponse === 'object' && rawResponse !== null) {
        const resp = rawResponse as Record<string, unknown>;
        const inferredRaw = resp.inferred ?? (resp.analysis as any)?.inferred;
        if (Array.isArray(inferredRaw)) {
          parsedInferred = inferredRaw;
        } else {
          return { ...base, enrichmentStatus: 'AI_INFERENCE_UNAVAILABLE', inferenceTimingMs: Date.now() - startTime };
        }
      } else {
        return { ...base, inferenceTimingMs: Date.now() - startTime };
      }
    } catch (err) {
      return { ...base, inferenceTimingMs: Date.now() - startTime };
    }

    const validated: InferredRequirement[] = [];
    let duplicatesRemoved = 0;
    const seenInferred = new Set<string>();

    for (const rawItem of parsedInferred) {
      const item = validateInferredItem(rawItem);
      if (!item) continue;
      const normalized = normalizeForDedup(item.text);
      if (sourceCorpus.has(normalized) || seenInferred.has(normalized)) {
        duplicatesRemoved++;
        continue;
      }
      seenInferred.add(normalized);
      validated.push(item);
    }

    const confidenceDist = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const item of validated) {
      confidenceDist[item.confidence]++;
    }

    const status: JobEnrichmentStatus =
      validated.length === 0 && parsedInferred.length > 0
        ? 'ENRICHED_PARTIAL'
        : validated.length === 0
        ? 'SKIPPED_ALL_SOURCE_PROVIDED'
        : 'ENRICHED';

    return {
      canonical,
      inferredRequirements: validated,
      enrichmentStatus: status,
      duplicatesRemoved,
      conflicts: [],
      confidenceDistribution: confidenceDist,
      inferenceTimingMs: Date.now() - startTime,
    };
}

/**
 * enrichJobContent — production entry point.
 * Uses the real Supabase ats-analyzer edge function.
 * NEVER writes to the database.
 */
export async function enrichJobContent(
  canonical: NormalizedJobContent
): Promise<EnrichedJobContent> {
  const supabaseCaller: AICaller = async (prompt: string) => {
    const { data, error } = await supabase.functions.invoke('ats-analyzer', {
      body: { mode: 'job_intelligence', prompt, responseFormat: 'json' },
    });
    return { data, error: error ? { message: error.message } : null };
  };
  return enrichJobContentWithCaller(canonical, supabaseCaller);
}

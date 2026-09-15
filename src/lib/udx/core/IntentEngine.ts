/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Universal Intent Engine
 * 
 * Ingests ANY signal (query, voice, conversation, document, agent request)
 * and normalizes it into a first-class UDXIntent.
 */

import { 
  UDXIntent, 
  UDXDomain, 
  SignalReference, 
  Constraint, 
  EntityReference, 
  Timeframe, 
  LocationContext,
  SignalChannel
} from './IntentTypes';

export interface RawSignalInput {
  channel: SignalChannel;
  content: string | Record<string, unknown>;
  timestamp?: string;
  sourceOrigin?: string;
  metadata?: Record<string, unknown>;
}

export class IntentEngine {
  /**
   * Robust colloquial, leet-speak, and multi-lingual signal normalization.
   */
  public static normalizeSignalText(text: string): string {
    let normalized = text.toLowerCase();

    // 1. Leet-speak and phonetic typo fixes
    normalized = normalized
      .replace(/\bc0ding\b/g, 'coding')
      .replace(/\bintrenship\b/g, 'internship')
      .replace(/\bstypend\b/g, 'stipend')
      .replace(/\bdveloper\b/g, 'developer')
      .replace(/\bsoftwer\b/g, 'software')
      .replace(/\benginer\b/g, 'engineer');

    // 2. Hinglish and colloquial regional mappings
    normalized = normalized
      // Geographic aliases
      .replace(/\b(kashi|banaras|benares)\b/g, 'varanasi')
      // Objective triggers
      .replace(/\b(naukri|rozgar|kaam|kam)\b/g, 'job')
      .replace(/\b(chahiye|dhoondh|dhoondo|khoj|chahye)\b/g, 'search')
      .replace(/\b(achi salary|badiya salary|paisa)\b/g, 'salary');

    return normalized;
  }

  /**
   * Helper alias for external agent and background signal ingestion.
   */
  public static ingestSignal(input: {
    signalId?: string;
    channel: SignalChannel;
    rawContent: string;
    confidence?: number;
    timestamp?: string;
    metadata?: Record<string, unknown>;
  }): UDXIntent {
    return this.fromSignal({
      channel: input.channel,
      content: input.rawContent,
      timestamp: input.timestamp,
      metadata: input.metadata,
    });
  }

  /**
   * Distills any raw signal into a structured UDXIntent.
   */
  public static fromSignal(signal: RawSignalInput): UDXIntent {
    const rawText = typeof signal.content === 'string' 
      ? signal.content 
      : JSON.stringify(signal.content);

    const normalizedText = this.normalizeSignalText(rawText);
    const detectedDomain = this.classifyDomain(normalizedText);
    const entities = this.extractEntities(normalizedText);
    const constraints = this.extractConstraints(normalizedText);
    const timeframe = this.extractTimeframe(normalizedText);
    const location = this.extractLocation(normalizedText, entities);
    const goal = this.distillGoal(rawText, detectedDomain);
    const canonical = this.generateCanonicalIntent(goal, detectedDomain, entities);

    const sourceSignal: SignalReference = {
      signalId: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      channel: signal.channel,
      rawPayload: signal.content,
      detectedAt: signal.timestamp || new Date().toISOString(),
      confidence: 0.95,
      metadata: signal.metadata,
    };

    return {
      intentId: `intent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      domain: detectedDomain,
      canonicalIntent: canonical,
      goal,
      currentState: { rawInputSample: rawText.slice(0, 100) },
      desiredState: { targetResolutionGoal: goal },
      constraints,
      entities,
      urgency: timeframe?.horizon === 'IMMEDIATE' ? 0.9 : 0.5,
      timeframe,
      location,
      confidence: 0.88,
      sourceSignals: [sourceSignal],
      epistemicStatus: 'DETECTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Domain classification across the 9 universal UDX domains.
   */
  public static classifyDomain(text: string): UDXDomain {
    const lower = this.normalizeSignalText(text);

    // 1. Education
    if (/\b(learn|study|college|university|degree|course|curriculum|exam|phd|b\.tech|mca|mba|scholarship)\b/.test(lower)) {
      return 'EDUCATION';
    }

    // 2. Business
    if (/\b(start a business|startup|incorporation|market size|competitors|customer acquisition|saas|revenue model|venture capital)\b/.test(lower)) {
      return 'BUSINESS';
    }

    // 3. Finance
    if (/\b(invest|equity|crypto|portfolio|mortgage|wealth|dividend|tax planning|credit score|underwriting)\b/.test(lower)) {
      return 'FINANCE';
    }

    // 4. Technology
    if (/\b(deploy|architecture|kubernetes|docker|react|typescript|python|neural network|llm|api integration)\b/.test(lower)) {
      return 'TECHNOLOGY';
    }

    // 5. Travel
    if (/\b(flight|hotel|visa|relocate to|move to dubai|itinerary|residence permit)\b/.test(lower)) {
      return 'TRAVEL';
    }

    // 6. Commerce
    if (/\b(buy|purchase|supplier|wholesale|ecommerce|procurement|shipping)\b/.test(lower)) {
      return 'COMMERCE';
    }

    // 7. Personal
    if (/\b(life balance|habit|wellness|fitness|mindfulness|personal goal|change my life)\b/.test(lower)) {
      return 'PERSONAL';
    }

    // 8. Career (Default for professional mobility and job ecosystem)
    if (/\b(job|hire|career|salary|work|employment|resume|ats|interview|vacancy|developer|engineer|internship|stipend|ctc|lpa|naukri|rozgar)\b/.test(lower)) {
      return 'CAREER';
    }

    return 'GENERAL';
  }

  /**
   * Extract semantic entities (locations, organizations, roles, concepts)
   */
  public static extractEntities(text: string): EntityReference[] {
    const entities: EntityReference[] = [];
    const lower = this.normalizeSignalText(text);

    // Geographic matches
    const geoTokens = ['varanasi', 'noida', 'lucknow', 'delhi', 'bangalore', 'mumbai', 'hyderabad', 'pune', 'chennai', 'dubai', 'remote', 'usa', 'uk', 'india'];
    geoTokens.forEach(geo => {
      if (lower.includes(geo)) {
        entities.push({
          entityId: `geo-${geo}`,
          name: geo.charAt(0).toUpperCase() + geo.slice(1),
          type: 'LOCATION',
          confidence: 0.96,
        });
      }
    });

    // Technical / Capability matches
    const capabilityTokens = ['coding', 'software', 'tech', 'react', 'node', 'python', 'ai', 'machine learning', 'frontend', 'backend', 'fullstack', 'product management', 'credit risk', 'marketing', 'sales'];
    capabilityTokens.forEach(cap => {
      if (lower.includes(cap)) {
        entities.push({
          entityId: `cap-${cap.replace(/\s+/g, '-')}`,
          name: cap.toUpperCase(),
          type: 'CAPABILITY',
          confidence: 0.90,
        });
      }
    });

    return entities;
  }

  /**
   * Extract constraints
   */
  public static extractConstraints(text: string): Constraint[] {
    const constraints: Constraint[] = [];
    const lower = this.normalizeSignalText(text);

    // Temporal constraints
    const dayMatch = lower.match(/(\d+)\s*(days?|months?|weeks?)/);
    if (dayMatch) {
      constraints.push({
        id: `const-time-${Date.now()}`,
        type: 'TEMPORAL',
        description: `Target resolution window: within ${dayMatch[1]} ${dayMatch[2]}`,
        strictness: 'HARD',
        value: `${dayMatch[1]} ${dayMatch[2]}`,
      });
    }

    // Remote preference
    if (lower.includes('remote') || lower.includes('work from home')) {
      constraints.push({
        id: `const-geo-remote`,
        type: 'GEOGRAPHIC',
        description: 'Requires distributed / remote outcome pathway',
        strictness: 'HARD',
        value: 'REMOTE',
      });
    }

    // Financial / Compensation constraint
    const lpaMatch = lower.match(/(\d+)\s*(lpa|lakh|lakhs)/);
    if (lpaMatch) {
      constraints.push({
        id: `const-fin-lpa`,
        type: 'FINANCIAL',
        description: `Minimum target compensation: ${lpaMatch[1]} LPA`,
        strictness: 'PREFERENCE',
        value: `${lpaMatch[1]} LPA`,
      });
    } else if (lower.includes('stipend')) {
      constraints.push({
        id: `const-fin-stipend`,
        type: 'FINANCIAL',
        description: 'Requires paid / compensated stipend pathway',
        strictness: 'HARD',
        value: 'STIPEND_REQUIRED',
      });
    }

    // Program / Role Type constraint
    if (lower.includes('internship') || lower.includes('intern')) {
      constraints.push({
        id: `const-type-internship`,
        type: 'OTHER',
        description: 'Internship / apprenticeship pathway constraint',
        strictness: 'HARD',
        value: 'INTERNSHIP',
      });
    }

    return constraints;
  }

  /**
   * Timeframe estimation
   */
  public static extractTimeframe(text: string): Timeframe {
    const lower = this.normalizeSignalText(text);
    if (/\b(urgent|urgently|immediate|asap|today|this week)\b/.test(lower)) {
      return { targetDays: 7, horizon: 'IMMEDIATE' };
    }
    if (/\b(30 days|next month|soon)\b/.test(lower)) {
      return { targetDays: 30, horizon: 'SHORT_TERM' };
    }
    if (/\b(60 days|90 days|quarter)\b/.test(lower)) {
      return { targetDays: 60, horizon: 'MEDIUM_TERM' };
    }
    return { targetDays: 90, horizon: 'LONG_TERM' };
  }

  /**
   * Location context
   */
  public static extractLocation(text: string, entities: EntityReference[]): LocationContext {
    const geo = entities.find(e => e.type === 'LOCATION');
    const isRemote = text.toLowerCase().includes('remote');

    return {
      primaryLocation: geo?.name || (isRemote ? 'Remote' : 'Anywhere'),
      mobility: isRemote ? 'REMOTE' : (geo ? 'LOCAL_ONLY' : 'GLOBAL'),
    };
  }

  /**
   * Distill high-level goal
   */
  public static distillGoal(text: string, domain: UDXDomain): string {
    const cleaned = text.trim();
    if (domain === 'CAREER') {
      return `Resolve professional mobility & verified career transition: ${cleaned}`;
    }
    if (domain === 'EDUCATION') {
      return `Acquire certified capability & structured learning path: ${cleaned}`;
    }
    if (domain === 'BUSINESS') {
      return `Establish commercial enterprise & market positioning: ${cleaned}`;
    }
    return `Resolve human goal: ${cleaned}`;
  }

  /**
   * Universal canonical intent formulation
   */
  public static generateCanonicalIntent(goal: string, domain: UDXDomain, entities: EntityReference[]): string {
    const loc = entities.find(e => e.type === 'LOCATION')?.name;
    const cap = entities.find(e => e.type === 'CAPABILITY')?.name;

    if (loc && cap) {
      return `${domain}: ${cap} IN ${loc.toUpperCase()}`;
    }
    if (loc) {
      return `${domain}: MOBILITY IN ${loc.toUpperCase()}`;
    }
    if (cap) {
      return `${domain}: SPECIALIZATION IN ${cap}`;
    }
    return `${domain}: ${goal.slice(0, 45).toUpperCase()}`;
  }
}

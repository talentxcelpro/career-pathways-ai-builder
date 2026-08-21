import { supabase } from '@/integrations/supabase/client';
import { NETWORK_AUTO_POST_SEEDS } from '@/data/networkAutoPostSeed';
import { 
  ContentPillar, 
  AutoPostConfig, 
  AutoPostRecord, 
  ValidationResult 
} from '@/types/networkAutoPost';

const AUTHORIZED_EMAIL = 'talentxcelpro@gmail.com';
const STORAGE_CONFIG_KEY = 'talentxcel_auto_post_config';
const STORAGE_AUDIT_KEY = 'talentxcel_auto_post_audit_logs';

const ALL_PILLARS: ContentPillar[] = [
  'careers',
  'jobs',
  'skills',
  'education',
  'resumes',
  'learning',
  'passport',
  'network',
  'ecosystem'
];

// Banned marketing hype, corporate jargon, and spam tokens
const BANNED_PATTERNS = [
  /unlock your potential/i,
  /transform your career/i,
  /revolutionize/i,
  /game-?changer/i,
  /in today'?s fast-paced world/i,
  /in today'?s rapidly evolving/i,
  /are you ready to/i,
  /click the link/i,
  /buy now/i,
  /act now/i,
  /100% guaranteed/i,
  /double your salary/i,
  /secret hack/i,
  /#\w+/, // No hashtags
  /[\u{1F300}-\u{1FAFF}]/u // No emojis
];

/**
 * Normalizes text for strict duplicate and similarity detection
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates word count after trimming whitespace
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculates simple Jaccard word set similarity between two strings
 */
export function calculateWordSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(normalizeText(textA).split(' '));
  const wordsB = new Set(normalizeText(textB).split(' '));
  
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }

  const union = wordsA.size + wordsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Validates a micro-post candidate strictly against quality rules
 */
export function validateMicroPost(
  content: string,
  recentPostsHistory: string[] = []
): ValidationResult {
  const wordCount = countWords(content);

  // 1. Strict 10-25 word requirement
  if (wordCount < 10) {
    return {
      valid: false,
      wordCount,
      reason: `Length too short (${wordCount} words). Minimum is 10 words.`
    };
  }

  if (wordCount > 25) {
    return {
      valid: false,
      wordCount,
      reason: `Length too long (${wordCount} words). Maximum is 25 words.`
    };
  }

  // 2. Banned marketing hype / jargon / emoji check
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(content)) {
      return {
        valid: false,
        wordCount,
        reason: 'Contains promotional marketing jargon, hashtags, or emojis.'
      };
    }
  }

  // 3. Exact and near-duplicate check against recent history
  const normalizedCandidate = normalizeText(content);
  for (const pastPost of recentPostsHistory) {
    const normalizedPast = normalizeText(pastPost);
    
    // Exact match
    if (normalizedCandidate === normalizedPast) {
      return {
        valid: false,
        wordCount,
        similarityScore: 1.0,
        reason: 'Exact duplicate of a recent post.'
      };
    }

    // High word overlap (near duplicate > 0.70)
    const similarity = calculateWordSimilarity(content, pastPost);
    if (similarity >= 0.70) {
      return {
        valid: false,
        wordCount,
        similarityScore: similarity,
        reason: `Too similar to a recent post (${Math.round(similarity * 100)}% match).`
      };
    }
  }

  return {
    valid: true,
    wordCount
  };
}

class NetworkAutoPostEngine {
  private static instance: NetworkAutoPostEngine;

  private constructor() {}

  public static getInstance(): NetworkAutoPostEngine {
    if (!NetworkAutoPostEngine.instance) {
      NetworkAutoPostEngine.instance = new NetworkAutoPostEngine();
    }
    return NetworkAutoPostEngine.instance;
  }

  /**
   * Helper to fetch active session and verify authorization
   */
  public async getAuthorizedUser(): Promise<{ id: string; email: string } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Allow if email is talentxcelpro@gmail.com OR has admin role in profiles
      if (user.email === AUTHORIZED_EMAIL) {
        return { id: user.id, email: user.email };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_super_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && (profile.role === 'admin' || profile.is_super_admin)) {
        return { id: user.id, email: user.email || AUTHORIZED_EMAIL };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Loads current persistent configuration
   */
  public async getConfig(): Promise<AutoPostConfig> {
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('network_auto_post_config' as any)
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const config = data as unknown as AutoPostConfig;
        
        // Reset daily count if counter_date is in past
        if (config.counter_date < todayStr) {
          config.posts_today_count = 0;
          config.counter_date = todayStr;
          // Update in DB asynchronously
          supabase
            .from('network_auto_post_config' as any)
            .update({ posts_today_count: 0, counter_date: todayStr })
            .eq('id', config.id)
            .then();
        }

        return config;
      }
    } catch (err) {
      console.warn('DB config fetch failed, using local storage fallback:', err);
    }

    // Local fallback
    const cached = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as AutoPostConfig;
        if (parsed.counter_date < todayStr) {
          parsed.posts_today_count = 0;
          parsed.counter_date = todayStr;
          localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(parsed));
        }
        return parsed;
      } catch {}
    }

    // Default configuration
    const defaultConfig: AutoPostConfig = {
      id: 'default-config',
      authorized_email: AUTHORIZED_EMAIL,
      enabled: true,
      min_interval_minutes: 120,
      max_interval_minutes: 180,
      max_daily_posts: 6,
      next_post_scheduled_at: new Date(Date.now() + 120 * 60000).toISOString(),
      last_post_timestamp: null,
      posts_today_count: 0,
      counter_date: todayStr,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(defaultConfig));
    return defaultConfig;
  }

  /**
   * Updates configuration
   */
  public async updateConfig(updates: Partial<AutoPostConfig>): Promise<AutoPostConfig> {
    const current = await this.getConfig();
    const updated: AutoPostConfig = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };

    try {
      await supabase
        .from('network_auto_post_config' as any)
        .update(updates)
        .eq('id', current.id);
    } catch (err) {
      console.warn('DB config update failed, saved locally:', err);
    }

    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  }

  /**
   * Fetches recent audit logs for deduplication and display
   */
  public async getRecentAuditLogs(limit = 20): Promise<AutoPostRecord[]> {
    try {
      const { data, error } = await supabase
        .from('network_auto_posts' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data as unknown as AutoPostRecord[];
      }
    } catch (err) {
      console.warn('DB audit fetch failed, using local storage:', err);
    }

    const cached = localStorage.getItem(STORAGE_AUDIT_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as AutoPostRecord[];
      } catch {}
    }

    return [];
  }

  /**
   * Records an audit log
   */
  private async recordAuditLog(record: Omit<AutoPostRecord, 'id' | 'created_at'>): Promise<void> {
    const fullRecord: AutoPostRecord = {
      ...record,
      id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    try {
      await supabase
        .from('network_auto_posts' as any)
        .insert(fullRecord);
    } catch (err) {
      console.warn('DB audit insert failed, storing locally:', err);
    }

    const currentLogs = await this.getRecentAuditLogs(50);
    const updatedLogs = [fullRecord, ...currentLogs].slice(0, 50);
    localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(updatedLogs));
  }

  /**
   * Generates a quality-validated candidate post using pillar rotation and deduplication
   */
  public async generateCandidatePost(): Promise<{ text: string; pillar: ContentPillar } | null> {
    const recentLogs = await this.getRecentAuditLogs(30);
    const recentTexts = recentLogs.map(l => l.content);
    const lastPillar = recentLogs.find(l => l.status === 'published')?.pillar;

    // Filter available pillars excluding the last used one for clean rotation
    const candidatePillars = ALL_PILLARS.filter(p => p !== lastPillar);
    const selectedPillar = candidatePillars[Math.floor(Math.random() * candidatePillars.length)] || 'careers';

    // Get all seed concepts for this pillar
    const pillarSeeds = NETWORK_AUTO_POST_SEEDS.filter(s => s.pillar === selectedPillar);
    const shuffled = [...pillarSeeds].sort(() => 0.5 - Math.random());

    for (const seed of shuffled) {
      const validation = validateMicroPost(seed.text, recentTexts);
      if (validation.valid) {
        return {
          text: seed.text,
          pillar: seed.pillar
        };
      }
    }

    // Fallback search across all pillars if the current pillar's seeds were recently used
    const allShuffled = [...NETWORK_AUTO_POST_SEEDS].sort(() => 0.5 - Math.random());
    for (const seed of allShuffled) {
      const validation = validateMicroPost(seed.text, recentTexts);
      if (validation.valid) {
        return {
          text: seed.text,
          pillar: seed.pillar
        };
      }
    }

    return null;
  }

  /**
   * Publishes a micro-post (scheduled or manual trigger)
   */
  public async publishMicroPost(options: { 
    isManual?: boolean; 
    customContent?: string; 
    customPillar?: ContentPillar 
  } = {}): Promise<{ 
    success: boolean; 
    post?: any; 
    error?: string; 
    rejectionReason?: string 
  }> {
    const isManual = !!options.isManual;

    // 1. Authorization Verification
    const authUser = await this.getAuthorizedUser();
    if (!authUser) {
      return {
        success: false,
        error: 'UNAUTHORIZED: Only talentxcelpro@gmail.com or authorized admins can publish autonomous network posts.'
      };
    }

    // 2. Load Config & Check Daily Limits
    const config = await this.getConfig();

    if (!isManual && !config.enabled) {
      return {
        success: false,
        error: 'AUTOMATION_PAUSED: The autonomous posting engine is currently turned off.'
      };
    }

    if (config.posts_today_count >= config.max_daily_posts) {
      return {
        success: false,
        error: `DAILY_LIMIT_REACHED: Reached maximum ${config.max_daily_posts} posts for today. Paused until tomorrow.`
      };
    }

    // 3. Timing Check (for automated invocation)
    if (!isManual) {
      const scheduledTime = new Date(config.next_post_scheduled_at).getTime();
      if (Date.now() < scheduledTime) {
        return {
          success: false,
          error: `INTERVAL_NOT_ELAPSED: Next post is scheduled for ${config.next_post_scheduled_at}.`
        };
      }
    }

    // 4. Generate Candidate Post
    let candidateText = options.customContent;
    let candidatePillar = options.customPillar || 'careers';

    if (!candidateText) {
      const candidate = await this.generateCandidatePost();
      if (!candidate) {
        await this.recordAuditLog({
          user_id: authUser.id,
          content: 'N/A',
          pillar: 'careers',
          word_count: 0,
          status: 'rejected',
          rejection_reason: 'SKIPPED_CYCLE: No unique candidate passed 10-25 word and similarity checks.'
        });

        return {
          success: false,
          error: 'SKIPPED_CYCLE: No suitable unique post candidate found this cycle.'
        };
      }
      candidateText = candidate.text;
      candidatePillar = candidate.pillar;
    }

    // 5. Strict Validation Check
    const recentLogs = await this.getRecentAuditLogs(30);
    const recentTexts = recentLogs.map(l => l.content);
    const validation = validateMicroPost(candidateText, recentTexts);

    if (!validation.valid) {
      await this.recordAuditLog({
        user_id: authUser.id,
        content: candidateText,
        pillar: candidatePillar,
        word_count: validation.wordCount,
        status: 'rejected',
        rejection_reason: validation.reason,
        similarity_hash: normalizeText(candidateText)
      });

      return {
        success: false,
        rejectionReason: validation.reason,
        error: `VALIDATION_FAILED: ${validation.reason}`
      };
    }

    // 6. Claim Slot & Publish to 'posts' table (canonical structure)
    try {
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          content: candidateText,
          post_type: 'text',
          author_id: authUser.id,
          user_id: authUser.id,
          media_urls: [],
          location: null,
          visibility: 'public',
          origin: 'feed',
          tags: []
        })
        .select()
        .single();

      if (postError) {
        throw postError;
      }

      // 7. Calculate Next Dynamic Interval (120m to 180m randomized)
      const intervalMinutes = Math.floor(
        Math.random() * (config.max_interval_minutes - config.min_interval_minutes + 1)
      ) + config.min_interval_minutes;

      const nextScheduledAt = new Date(Date.now() + intervalMinutes * 60000).toISOString();
      const newPostsTodayCount = config.posts_today_count + 1;

      // 8. Update Persistent Config
      await this.updateConfig({
        posts_today_count: newPostsTodayCount,
        last_post_timestamp: new Date().toISOString(),
        next_post_scheduled_at: nextScheduledAt
      });

      // 9. Record Successful Audit Log
      await this.recordAuditLog({
        post_id: postData?.id || null,
        user_id: authUser.id,
        content: candidateText,
        pillar: candidatePillar,
        word_count: validation.wordCount,
        status: 'published',
        similarity_hash: normalizeText(candidateText),
        published_at: new Date().toISOString(),
        scheduled_at: config.next_post_scheduled_at
      });

      return {
        success: true,
        post: postData
      };
    } catch (err: any) {
      console.error('Error publishing auto post:', err);
      
      await this.recordAuditLog({
        user_id: authUser.id,
        content: candidateText,
        pillar: candidatePillar,
        word_count: validation.wordCount,
        status: 'failed',
        rejection_reason: err?.message || 'Database insert failed'
      });

      return {
        success: false,
        error: `PUBLISHING_FAILED: ${err?.message || 'Unknown database error'}`
      };
    }
  }
}

export const networkAutoPostEngine = NetworkAutoPostEngine.getInstance();

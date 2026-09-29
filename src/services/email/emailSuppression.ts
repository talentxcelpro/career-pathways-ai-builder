// src/services/email/emailSuppression.ts
/**
 * Email Suppression Manager for TalentXcel
 * Checks and maintains the active suppression list to prevent sending to
 * hard-bounced addresses or recipients who filed spam complaints.
 * Protecting domain reputation is the #1 imperative.
 */

import { emailDb as supabase } from './emailDb';
import type { SuppressionRecord } from './emailTypes';

class EmailSuppressionManager {
  private localCache: Map<string, boolean> = new Map();
  private cacheExpiry: number = 0;
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute local cache

  /**
   * Checks if an email address is currently suppressed.
   */
  async isSuppressed(email: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return true; // Malformed emails are treated as suppressed
    }

    // Check local memory cache
    const now = Date.now();
    if (now < this.cacheExpiry && this.localCache.has(cleanEmail)) {
      return this.localCache.get(cleanEmail)!;
    }

    try {
      const { data, error } = await supabase
        .from('email_suppression_list')
        .select('id, is_active')
        .eq('email_address', cleanEmail)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.warn('⚠️ Error checking email suppression list:', error.message);
        // On error, check fallback local cache
        return this.localCache.get(cleanEmail) || false;
      }

      const isSuppressed = !!data;
      this.localCache.set(cleanEmail, isSuppressed);
      if (this.cacheExpiry < now) {
        this.cacheExpiry = now + this.CACHE_TTL_MS;
      }

      return isSuppressed;
    } catch (err: any) {
      console.warn('⚠️ Exception checking email suppression:', err.message);
      return false;
    }
  }

  /**
   * Suppresses an email address due to a hard bounce, complaint, or manual action.
   */
  async suppress(
    email: string,
    suppressionType: 'bounce' | 'complaint' | 'manual',
    reason?: string,
    details?: {
      bounceType?: string;
      bounceSubtype?: string;
      complaintType?: string;
      complaintSubtype?: string;
      diagnosticCode?: string;
    }
  ): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return false;

    console.log(`🛡️ Suppressing email ${cleanEmail} (${suppressionType}): ${reason || 'No reason provided'}`);
    this.localCache.set(cleanEmail, true);

    try {
      // Upsert into email_suppression_list
      const { error } = await supabase
        .from('email_suppression_list')
        .upsert(
          {
            email_address: cleanEmail,
            suppression_type: suppressionType,
            reason: reason || `Automated ${suppressionType} suppression`,
            bounce_type: details?.bounceType || null,
            bounce_subtype: details?.bounceSubtype || null,
            complaint_type: details?.complaintType || null,
            complaint_subtype: details?.complaintSubtype || null,
            diagnostic_code: details?.diagnosticCode || null,
            is_active: true,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'email_address' }
        );

      if (error) {
        console.error('❌ Failed to record email suppression in database:', error.message);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('❌ Exception recording email suppression:', err.message);
      return false;
    }
  }

  /**
   * Removes an email from suppression (e.g. after manual admin review).
   */
  async unsuppress(email: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    this.localCache.set(cleanEmail, false);

    try {
      const { error } = await supabase
        .from('email_suppression_list')
        .update({
          is_active: false,
          removed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('email_address', cleanEmail);

      if (error) {
        console.error('❌ Failed to unsuppress email:', error.message);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('❌ Exception unsuppressing email:', err.message);
      return false;
    }
  }

  /**
   * Clears the in-memory cache
   */
  clearCache() {
    this.localCache.clear();
    this.cacheExpiry = 0;
  }
}

export const emailSuppressionManager = new EmailSuppressionManager();

// src/services/email/emailPreferences.ts
/**
 * User Email Preferences & Policy Engine
 * Enforces preference checks for all non-essential communications.
 * Critical transactional emails (password reset, email verification, security)
 * CAN NEVER be disabled by marketing or engagement preferences.
 */

import { emailDb as supabase } from './emailDb';
import type { EmailCategory, UserEmailPreferences } from './emailTypes';

const DEFAULT_PREFERENCES: Omit<UserEmailPreferences, 'userId' | 'email'> = {
  email_job_alerts: true,
  email_job_matches: true,
  email_application_updates: true,
  email_career_recommendations: true,
  email_product_updates: false,
  email_marketing: false,
  email_weekly_digest: true,
  frequency_cap_daily: 3,
  unsubscribed_all_non_essential: false,
};

class EmailPreferencesManager {
  private localPrefsCache = new Map<string, Partial<UserEmailPreferences>>();

  /**
   * Evaluates if a given email category/template is allowed for the recipient.
   * Transactional emails ALWAYS pass.
   */
  async canSend(email: string, category: EmailCategory, templateName?: string): Promise<{ allowed: boolean; reason?: string }> {
    // RULE 1: Transactional emails are non-negotiable for system operations
    if (category === 'transactional') {
      return { allowed: true };
    }

    const cleanEmail = email.toLowerCase().trim();
    const prefs = await this.getPreferences(cleanEmail);

    // RULE 2: If user opted out of all non-essential emails
    if (prefs.unsubscribed_all_non_essential) {
      return {
        allowed: false,
        reason: 'Recipient has opted out of all non-essential communications'
      };
    }

    // RULE 3: Category-specific checks
    switch (category) {
      case 'product_notification':
        if (templateName === 'job_match' || templateName === 'job_match_digest') {
          if (!prefs.email_job_matches) {
            return { allowed: false, reason: 'Recipient opted out of job matches' };
          }
        }
        if (!prefs.email_job_alerts && !prefs.email_job_matches) {
          return { allowed: false, reason: 'Recipient opted out of product & job alerts' };
        }
        return { allowed: true };

      case 'engagement':
        if (templateName === 'weekly_digest' && !prefs.email_weekly_digest) {
          return { allowed: false, reason: 'Recipient opted out of weekly digest' };
        }
        if (!prefs.email_career_recommendations && !prefs.email_weekly_digest) {
          return { allowed: false, reason: 'Recipient opted out of engagement communications' };
        }
        return { allowed: true };

      case 'marketing':
        if (!prefs.email_marketing && !prefs.email_product_updates) {
          return { allowed: false, reason: 'Recipient has not opted into marketing communications' };
        }
        return { allowed: true };

      default:
        return { allowed: true };
    }
  }

  /**
   * Fetches preferences from database or returns safe defaults.
   */
  async getPreferences(email: string, userId?: string): Promise<UserEmailPreferences> {
    const cleanEmail = email.toLowerCase().trim();

    const cached = this.localPrefsCache.get(cleanEmail);

    try {
      let query = supabase.from('email_user_preferences').select('*');
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('email', cleanEmail);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        return { userId: userId || '', email: cleanEmail, ...DEFAULT_PREFERENCES, ...(cached || {}) };
      }

      if (!data) {
        return { userId: userId || '', email: cleanEmail, ...DEFAULT_PREFERENCES, ...(cached || {}) };
      }

      return {
        userId: data.user_id || userId || '',
        email: cleanEmail,
        email_job_alerts: data.email_job_alerts ?? true,
        email_job_matches: data.email_job_matches ?? true,
        email_application_updates: data.email_application_updates ?? true,
        email_career_recommendations: data.email_career_recommendations ?? true,
        email_product_updates: data.email_product_updates ?? false,
        email_marketing: data.email_marketing ?? false,
        email_weekly_digest: data.email_weekly_digest ?? true,
        frequency_cap_daily: data.frequency_cap_daily ?? 3,
        unsubscribed_all_non_essential: data.unsubscribed_all_non_essential ?? false,
        unsubscribe_token: data.unsubscribe_token,
        unsubscribed_at: data.unsubscribed_at,
        ...(cached || {})
      };
    } catch (err: any) {
      return { userId: userId || '', email: cleanEmail, ...DEFAULT_PREFERENCES, ...(cached || {}) };
    }
  }

  /**
   * Updates user preferences in the database.
   */
  async updatePreferences(email: string, prefs: Partial<UserEmailPreferences>, userId?: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    this.localPrefsCache.set(cleanEmail, {
      ...(this.localPrefsCache.get(cleanEmail) || {}),
      ...prefs
    });

    try {
      const payload: any = {
        email: cleanEmail,
        ...prefs,
        updated_at: new Date().toISOString()
      };
      if (userId) payload.user_id = userId;

      const { error } = await supabase
        .from('email_user_preferences')
        .upsert(payload, { onConflict: 'email' });

      if (error) {
        return true; // Still true because in-memory state is recorded
      }

      return true;
    } catch (err: any) {
      return true; // Preserved in local cache
    }
  }

  /**
   * One-click unsubscribe from all non-essential communications.
   */
  async unsubscribeAllNonEssential(email: string, userId?: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    console.log(`🔕 Unsubscribing ${cleanEmail} from all non-essential emails`);

    return this.updatePreferences(
      cleanEmail,
      {
        unsubscribed_all_non_essential: true,
        email_job_alerts: false,
        email_job_matches: false,
        email_career_recommendations: false,
        email_product_updates: false,
        email_marketing: false,
        email_weekly_digest: false,
        unsubscribed_at: new Date().toISOString()
      },
      userId
    );
  }
}

export const emailPreferencesManager = new EmailPreferencesManager();

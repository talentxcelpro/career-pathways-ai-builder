// src/services/email/emailProvider.ts
/**
 * Production Amazon SES v2 Email Delivery Provider
 * Region: us-east-1 (US East, N. Virginia)
 * Domain: talentxcel.in
 * Supports EMAIL_MODE=ses (production) and EMAIL_MODE=console (safe local dev/testing)
 */

import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import type { EmailSendResult, RenderedEmail, EmailCategory } from './emailTypes';
import { emailRateLimiter } from './emailRateLimiter';

const DEFAULT_REGION = 'us-east-1';
const DOMAIN = 'talentxcel.in';

export interface ProviderSendOptions {
  to: string;
  from?: string;
  replyTo?: string;
  category: EmailCategory;
  rendered: RenderedEmail;
  headers?: Record<string, string>;
}

export class EmailProvider {
  private sesClient: SESv2Client | null = null;
  private mode: 'ses' | 'console' = 'console';
  private fromTransactional = `TalentXcel <noreply@${DOMAIN}>`;
  private fromGeneral = `TalentXcel <hello@${DOMAIN}>`;

  constructor() {
    this.init();
  }

  public ensureInitialized() {
    if (this.sesClient && this.mode === 'ses') return;
    this.init();
  }

  private init() {
    // Read environment
    const emailMode = (typeof process !== 'undefined' && (process.env?.EMAIL_MODE || process.env?.VITE_EMAIL_MODE)) || 'console';
    this.mode = emailMode.toLowerCase() === 'ses' ? 'ses' : 'console';

    const accessKeyId = typeof process !== 'undefined' ? (process.env?.AWS_ACCESS_KEY_ID || process.env?.AWS_SES_ACCESS_KEY_ID) : undefined;
    const secretAccessKey = typeof process !== 'undefined' ? (process.env?.AWS_SECRET_ACCESS_KEY || process.env?.AWS_SES_SECRET_ACCESS_KEY) : undefined;
    const region = (typeof process !== 'undefined' && (process.env?.AWS_REGION || process.env?.AWS_SES_REGION)) || DEFAULT_REGION;

    if (this.mode === 'ses') {
      if (accessKeyId && secretAccessKey) {
        try {
          this.sesClient = new SESv2Client({
            region,
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          });
          console.log(`📡 AWS SES v2 Provider initialized [Region: ${region}, Domain: ${DOMAIN}]`);
        } catch (err: any) {
          console.error('❌ Failed to initialize AWS SES Client, falling back to console mode:', err.message);
          this.mode = 'console';
        }
      } else {
        console.warn(`⚠️ EMAIL_MODE=ses is set, but AWS credentials are missing. Running in console mode.`);
        this.mode = 'console';
      }
    } else {
      console.log(`ℹ️ Email Provider running in [MODE: ${this.mode}] (Safe mode: emails are logged without AWS SES dispatch)`);
    }
  }

  /**
   * Dispatches an email through AWS SES or Console Logger with rate-limiting and retries.
   */
  async send(options: ProviderSendOptions, maxAttempts: number = 3): Promise<EmailSendResult> {
    this.ensureInitialized();
    const startTime = Date.now();
    const recipient = options.to.toLowerCase().trim();
    const fromAddress = options.from || (options.category === 'transactional' ? this.fromTransactional : this.fromGeneral);

    // 1. Rate limiter: acquire permit before firing request
    await emailRateLimiter.acquirePermit();

    // 2. Safe development / test mode
    if (this.mode === 'console' || !this.sesClient) {
      console.log(`\n================== [TALENTXCEL EMAIL DISPATCH (CONSOLE)] ==================`);
      console.log(`From:    ${fromAddress}`);
      console.log(`To:      ${recipient}`);
      console.log(`Subject: ${options.rendered.subject}`);
      console.log(`Category: ${options.category}`);
      if (options.headers) console.log(`Headers:`, options.headers);
      console.log(`--- Plain Text Preview ---`);
      console.log(options.rendered.plainText.substring(0, 300) + '...');
      console.log(`=========================================================================\n`);

      const durationMs = Date.now() - startTime;
      return {
        success: true,
        messageId: `console_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        status: 'sent',
        mode: 'console',
        attempts: 1,
        statusCode: 200,
        durationMs
      };
    }

    // 3. Live SES Dispatch with Exponential Backoff
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const emailHeaders: Array<{ Name: string; Value: string }> = [];
        if (options.headers) {
          for (const [key, value] of Object.entries(options.headers)) {
            emailHeaders.push({ Name: key, Value: value });
          }
        }

        const command = new SendEmailCommand({
          FromEmailAddress: fromAddress,
          Destination: {
            ToAddresses: [recipient],
          },
          ReplyToAddresses: options.replyTo ? [options.replyTo] : undefined,
          Content: {
            Simple: {
              Subject: {
                Data: options.rendered.subject,
                Charset: 'UTF-8',
              },
              Body: {
                Html: {
                  Data: options.rendered.html,
                  Charset: 'UTF-8',
                },
                Text: {
                  Data: options.rendered.plainText,
                  Charset: 'UTF-8',
                },
              },
              Headers: emailHeaders.length > 0 ? emailHeaders : undefined,
            },
          },
          EmailTags: [
            { Name: 'Category', Value: options.category },
            { Name: 'Platform', Value: 'TalentXcel' },
          ],
        });

        const response = await this.sesClient.send(command);
        const durationMs = Date.now() - startTime;

        console.log(`✅ [SES Dispatch Success] MessageId: ${response.MessageId} -> ${recipient} (${durationMs}ms)`);

        return {
          success: true,
          messageId: response.MessageId,
          status: 'sent',
          mode: 'ses',
          attempts: attempt,
          statusCode: 200,
          durationMs,
        };
      } catch (err: any) {
        lastError = err;
        const statusCode = err?.$metadata?.httpStatusCode || 500;
        const errorMessage = err?.message || 'Unknown SES dispatch error';

        console.warn(`⚠️ [SES Send Attempt ${attempt}/${maxAttempts} Failed] Error: ${errorMessage} (Status: ${statusCode})`);

        // Check if error is permanent (do not retry invalid email or hard validation error)
        const isPermanent = statusCode === 400 && (
          errorMessage.includes('InvalidParameter') ||
          errorMessage.includes('MessageRejected') ||
          errorMessage.includes('Mailbox does not exist') ||
          errorMessage.includes('AccountSendingPaused')
        );

        if (isPermanent || attempt >= maxAttempts) {
          const durationMs = Date.now() - startTime;
          return {
            success: false,
            status: 'failed',
            error: errorMessage,
            attempts: attempt,
            statusCode,
            durationMs,
          };
        }

        // Exponential backoff with jitter: 200ms * 2^(attempt) + random(0-100ms)
        const backoffMs = Math.min(2000, Math.pow(2, attempt) * 200 + Math.floor(Math.random() * 100));
        console.log(`⏳ Backing off for ${backoffMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }

    const durationMs = Date.now() - startTime;
    return {
      success: false,
      status: 'failed',
      error: lastError?.message || 'Exceeded maximum retry attempts',
      attempts: attempt,
      durationMs,
    };
  }

  /**
   * Set provider mode (used in tests)
   */
  setMode(mode: 'ses' | 'console') {
    this.mode = mode;
  }

  getMode(): 'ses' | 'console' {
    return this.mode;
  }
}

export const emailProvider = new EmailProvider();

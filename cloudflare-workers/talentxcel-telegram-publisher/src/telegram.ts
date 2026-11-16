import { TelegramApiResponse } from './types';

/**
 * Escapes characters for Telegram HTML parse_mode.
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export class TelegramClient {
  private botToken: string;
  private channelId: string;

  constructor(botToken: string, channelId: string = '@TalentXcelJobs') {
    this.botToken = botToken;
    this.channelId = channelId;
  }

  private get apiUrl(): string {
    return `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Health check / validation of bot permissions and credentials.
   */
  async getMe(): Promise<TelegramApiResponse> {
    const res = await fetch(`${this.apiUrl}/getMe`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return res.json() as Promise<TelegramApiResponse>;
  }

  /**
   * Sends an HTML formatted post to the target Telegram channel.
   * Includes exponential backoff retry for HTTP 429 (rate limits) and 5xx errors.
   */
  async sendChannelMessage(
    htmlText: string,
    options: {
      disableWebPagePreview?: boolean;
      inlineButtons?: Array<{ text: string; url: string }>;
    } = {}
  ): Promise<{ response: TelegramApiResponse; attempts: number; latencyMs: number }> {
    const startTime = Date.now();
    const endpoint = `${this.apiUrl}/sendMessage`;

    const payload: Record<string, unknown> = {
      chat_id: this.channelId,
      text: htmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: options.disableWebPagePreview ?? true
    };

    if (options.inlineButtons && options.inlineButtons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: [
          options.inlineButtons.map(btn => ({ text: btn.text, url: btn.url }))
        ]
      };
    }

    const maxRetries = 3;
    let attempts = 0;
    let lastError: TelegramApiResponse | null = null;

    while (attempts < maxRetries) {
      attempts++;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = (await response.json()) as TelegramApiResponse;

        if (response.ok && data.ok) {
          return {
            response: data,
            attempts,
            latencyMs: Date.now() - startTime
          };
        }

        lastError = data;

        // If rate limited (HTTP 429), respect retry_after
        if (response.status === 429 && data.parameters?.retry_after) {
          const waitSec = Math.min(data.parameters.retry_after, 10);
          console.warn(`[TelegramClient] Rate limited (429). Retrying after ${waitSec}s...`);
          await new Promise(r => setTimeout(r, waitSec * 1000));
          continue;
        }

        // Transient 5xx server error, back off and retry
        if (response.status >= 500 && attempts < maxRetries) {
          const backoffMs = attempts * 1000;
          console.warn(`[TelegramClient] Telegram 5xx server error. Retrying in ${backoffMs}ms...`);
          await new Promise(r => setTimeout(r, backoffMs));
          continue;
        }

        // Permanent client error (e.g. 400 Bad Request / chat not found)
        return {
          response: data,
          attempts,
          latencyMs: Date.now() - startTime
        };
      } catch (err: unknown) {
        console.error(`[TelegramClient] Network dispatch exception:`, err);
        if (attempts >= maxRetries) {
          return {
            response: {
              ok: false,
              description: err instanceof Error ? err.message : 'Unknown network failure'
            },
            attempts,
            latencyMs: Date.now() - startTime
          };
        }
        await new Promise(r => setTimeout(r, attempts * 1000));
      }
    }

    return {
      response: lastError || { ok: false, description: 'Max retry attempts exhausted' },
      attempts,
      latencyMs: Date.now() - startTime
    };
  }
}

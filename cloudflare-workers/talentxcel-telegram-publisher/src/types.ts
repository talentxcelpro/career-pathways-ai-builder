export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export interface ScheduledEvent {
  cron: string;
  type: string;
  scheduledTime: number;
}

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  TELEGRAM_CHANNEL?: string;
  ADMIN_API_KEY?: string;
  TALENTXCEL_PORTAL_URL?: string;
  TALENTXCEL_JOBS_URL?: string;
  WHATSAPP_CHANNEL_URL?: string;
  TELEGRAM_INVITE_URL?: string;
}

export interface EligibleJob {
  id: string;
  job_title: string;
  company_name: string;
  location: string | null;
  location_city: string | null;
  location_state: string | null;
  experience_level: string | null;
  salary_range: string | null;
  salary_min: number | null;
  salary_max: number | null;
  external_url: string | null;
  seo_slug: string | null;
  is_remote: boolean;
  is_government_job: boolean;
  posted_at: string | null;
  match_score: number;
}

export type DistributionCategory = 
  | 'tech_high_growth'
  | 'fresher_entry'
  | 'city_spotlight'
  | 'remote_executive'
  | 'govt_psu'
  | 'non_it_business';

export interface GeneratedPost {
  category: DistributionCategory;
  slot_time: string;
  title: string;
  telegramHtml: string;
  whatsappText: string;
  jobs: EligibleJob[];
  idempotencyKey: string;
}

export interface TelegramApiResponse {
  ok: boolean;
  result?: {
    message_id: number;
    chat: {
      id: number;
      title: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
  };
  description?: string;
  error_code?: number;
  parameters?: {
    retry_after?: number;
  };
}

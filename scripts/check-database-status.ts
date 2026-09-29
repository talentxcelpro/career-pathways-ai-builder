// scripts/check-database-status.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPaths = ['.env.local', '.env'];
  for (const envFile of envPaths) {
    const fullPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...rest] = trimmed.split('=');
          if (key && rest.length > 0 && !process.env[key.trim()]) {
            process.env[key.trim()] = rest.join('=').replace(/^["'](.*)["']$/, '$1').trim();
          }
        }
      });
    }
  }
}
loadEnv();

const url = process.env.TX_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false }
});

async function main() {
  console.log('Connecting to Supabase at:', url);
  const tables = ['email_automation_queue', 'email_user_preferences', 'email_suppression_list', 'email_audit_ledger'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ONLINE (row count: ${count ?? 0})`);
      }
    } catch (e: any) {
      console.log(`⚠️ ${table}: ${e.message}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

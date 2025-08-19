import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Simple CSV parser that supports quoted fields with commas/newlines
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell.trim());
        cell = '';
      } else if (char === '\n') {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = '';
      } else if (char === '\r') {
        // ignore CR
      } else {
        cell += char;
      }
    }
  }
  // push last cell/row
  row.push(cell.trim());
  rows.push(row);
  return rows.filter(r => r.length && r.some(c => c !== ''));
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 bulk-job-upload invoked');

  try {
    const body = await req.json();
    const { csvData, batchName } = body || {};

    if (!csvData || !batchName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing csvData or batchName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse CSV
    const rows = parseCsv(csvData.trim());
    if (!rows.length) {
      return new Response(
        JSON.stringify({ success: false, error: 'Empty CSV' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const headers = rows[0].map(h => h.replace(/"/g, '').trim());
    console.log('📝 Headers:', headers);

    const index = (name: string) => headers.findIndex(h => h.toLowerCase() === name.toLowerCase());

    const idx = {
      title: index('title'),
      company_name: index('company_name'),
      location: index('location'),
      location_type: index('location_type'),
      employment_type: index('employment_type'),
      description: index('description'),
      experience_level: index('experience_level'),
      salary_min: index('salary_min'),
      salary_max: index('salary_max'),
      salary_currency: index('salary_currency'),
      is_remote: index('is_remote'),
      skills_required: index('skills_required'),
      skills_keywords: index('skills_keywords'),
      external_url: index('external_url'),
      priority: index('priority'),
      job_posted_at: index('job_posted_at'),
      expires_at: index('expires_at')
    };

    const sanitize = (val?: string) => {
      if (!val) return '';
      const v = val.trim();
      return ['#NAME?', '#N/A', 'NA', 'N/A'].includes(v) ? '' : v;
    };

    const parseList = (str?: string) => (str || '')
      .split(/[,;|]/)
      .map(s => s.trim())
      .filter(Boolean);

    const normalizeBool = (val?: string) => ['true','yes','y','1'].includes((val || '').toLowerCase());

    const normalizeUrl = (val?: string) => {
      if (!val) return null;
      const v = val.trim();
      return /^https?:\/\//i.test(v) ? v : null; // treat non-URLs as internal
    };

    const parseDateFlexible = (str?: string) => {
      if (!str) return null;
      const s = str.trim();
      const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
      if (m) {
        const d = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10);
        const y = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
        const dt = new Date(y, mo - 1, d);
        if (!isNaN(dt.getTime())) return dt.toISOString();
      }
      const dt = new Date(s);
      return isNaN(dt.getTime()) ? null : dt.toISOString();
    };

    const toInt = (v?: string) => {
      const s = (v ?? '').toString().replace(/[^0-9]/g, '');
      return s ? parseInt(s, 10) : null;
    };

    const nowIso = new Date().toISOString();
    const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const jobs: any[] = [];
    const rowErrors: any[] = [];

    for (let r = 1; r < rows.length; r++) {
      const line = rows[r];
      try {
        const get = (i: number) => (i >= 0 && i < line.length) ? line[i] : '';

        // Salary handling (must exist per DB trigger)
        let salaryMin = toInt(get(idx.salary_min));
        let salaryMax = toInt(get(idx.salary_max));
        if (salaryMin === null && salaryMax !== null) salaryMin = salaryMax;
        if (salaryMax === null && salaryMin !== null) salaryMax = salaryMin;
        if (salaryMin === null && salaryMax === null) { salaryMin = 150000; salaryMax = 250000; }
        if ((salaryMax as number) < (salaryMin as number)) salaryMax = salaryMin;

        const nf = typeof Intl !== 'undefined' ? new Intl.NumberFormat('en-IN') : null;
        const salaryRange = (salaryMin && salaryMax)
          ? `₹${nf ? nf.format(salaryMin) : salaryMin} - ₹${nf ? nf.format(salaryMax) : salaryMax}`
          : (salaryMin ? `₹${nf ? nf.format(salaryMin) : salaryMin}+` : 'Not disclosed');

        const employment = sanitize(get(idx.employment_type));
        const mapped: any = {
          title: sanitize(get(idx.title)) || 'Untitled Position',
          company_name: sanitize(get(idx.company_name)) || 'Company',
          location: sanitize(get(idx.location)) || 'India',
          description: sanitize(get(idx.description)) || 'Job description not provided.',
          employment_type: employment || 'Full-time',
          experience_level: sanitize(get(idx.experience_level)) || 'Fresher',
          salary_min: salaryMin,
          salary_max: salaryMax,
          salary_range: salaryRange,
          skills_required: parseList(sanitize(get(idx.skills_required)) || sanitize(get(idx.skills_keywords))),
          is_remote: normalizeBool(get(idx.is_remote)) || (sanitize(get(idx.location_type)).toLowerCase() === 'remote'),
          external_url: normalizeUrl(get(idx.external_url)),
          posted_at: parseDateFlexible(get(idx.job_posted_at)) || nowIso,
          expires_at: parseDateFlexible(get(idx.expires_at)) || defaultExpiry,
          job_status: 'open',
          is_active: true,
          is_featured: (sanitize(get(idx.priority)).toLowerCase() === 'high'),
          source: batchName,
          views_count: 0,
          applications_count: 0,
          created_at: nowIso,
          updated_at: nowIso
        };

        jobs.push(mapped);
      } catch (e) {
        rowErrors.push({ row: r, error: (e as Error).message });
      }
    }

    console.log(`📦 Prepared ${jobs.length} jobs for insertion`);

    // Insert in batches
    const batchSize = 100;
    let success = 0;
    const insertErrors: any[] = [];

    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      const { data, error } = await supabase.from('jobs').insert(batch).select('id');
      if (error) {
        console.error('❌ Batch insert error:', error);
        insertErrors.push({ batch: Math.floor(i / batchSize) + 1, error: error.message });
      } else {
        success += data?.length || 0;
        console.log(`✅ Inserted ${data?.length || 0} jobs in batch ${Math.floor(i / batchSize) + 1}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        batchId: crypto.randomUUID(),
        totalJobs: jobs.length,
        successfulJobs: success,
        failedJobs: jobs.length - success,
        errors: [...rowErrors, ...insertErrors]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('❌ bulk-job-upload error:', e);
    return new Response(
      JSON.stringify({ success: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('🚀 Bulk Job Upload V2 function called');

  try {
    const body = await req.json();
    const { csvData, batchName } = body || {};

    if (!csvData || !batchName) {
      return new Response(JSON.stringify({ success: false, error: 'csvData and batchName are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));

    const toMap: any[] = [];
    const errors: any[] = [];

    const mapEmploymentType = (type: string) => {
      if (!type) return 'Full-time';
      const map: Record<string, string> = {
        'full-time': 'Full-time',
        'full_time': 'Full-time',
        'part-time': 'Part-time',
        'part_time': 'Part-time',
        'contract': 'Contract',
        'freelance': 'Freelance',
        'internship': 'Internship',
        'temporary': 'Temporary',
        'remote': 'Remote',
        'hybrid': 'Hybrid'
      };
      const k = type.toLowerCase().trim();
      return map[k] || 'Full-time';
    };

    const sanitize = (val?: string) => {
      if (!val) return '';
      const v = val.trim();
      return (v === '#NAME?' || v === '#N/A' || v === 'NA' || v === 'N/A') ? '' : v;
    };

    const parseList = (str?: string) => (str || '')
      .split(/[,;|]/)
      .map(s => s.trim())
      .filter(Boolean);

    const normalizeBool = (val: any) => ['true','yes','y','1'].includes(String(val ?? '').toLowerCase().trim());

    const normalizeUrl = (val?: string) => {
      if (!val) return null;
      const v = val.trim();
      return /^https?:\/\//i.test(v) ? v : null;
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

    const toInt = (v: any) => {
      const s = (v ?? '').toString().replace(/[^0-9]/g, '');
      return s ? parseInt(s, 10) : null;
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      try {
        const values = line.split(',').map((v: string) => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h: any, idx: number) => row[h] = values[idx] || '');

        let salaryMin = toInt(row['salary_min']);
        let salaryMax = toInt(row['salary_max']);
        if (salaryMin === null && salaryMax !== null) salaryMin = salaryMax;
        if (salaryMax === null && salaryMin !== null) salaryMax = salaryMin;
        if (salaryMin === null && salaryMax === null) { salaryMin = 150000; salaryMax = 250000; }
        if (salaryMax! < salaryMin!) salaryMax = salaryMin;

        const nf = typeof Intl !== 'undefined' ? new Intl.NumberFormat('en-IN') : null;
        const salaryRange = (salaryMin && salaryMax)
          ? `₹${nf ? nf.format(salaryMin) : salaryMin} - ₹${nf ? nf.format(salaryMax) : salaryMax}`
          : (salaryMin ? `₹${nf ? nf.format(salaryMin) : salaryMin}+` : 'Not disclosed');

        const mapped: any = {
          title: row['title'] || 'Untitled Position',
          company_name: row['company_name'] || 'Company',
          location: row['location'] || 'India',
          description: sanitize(row['description']) || 'Job description not provided.',
          employment_type: mapEmploymentType(row['employment_type']),
          experience_level: row['experience_level'] || 'Fresher',
          salary_min: salaryMin,
          salary_max: salaryMax,
          salary_currency: row['salary_currency'] || 'INR',
          salary_range: salaryRange,
          skills_required: parseList(row['skills_required'] || row['skills_keywords']),
          job_tags: parseList(row['job_tags']),
          benefits: parseList(row['benefits']),
          is_remote: normalizeBool(row['is_remote']) || (row['location_type']?.toLowerCase() === 'remote'),
          external_url: normalizeUrl(row['external_url']),
          application_email: row['application_email'] || null,
          application_method: row['application_method'] || null,
          job_type_detail: row['job_type_detail'] || null,
          job_status: 'open',
          is_active: true,
          is_featured: (row['priority'] || '').toString().toLowerCase() === 'high',
          posted_at: parseDateFlexible(row['job_posted_at']) || new Date().toISOString(),
          expires_at: parseDateFlexible(row['expires_at']) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          source: batchName,
          views_count: 0,
          applications_count: 0,
          organization_logo_url: (row['company_name'] || '').toLowerCase() === 'talentxcel' ? '/src/assets/talentxcel-logo.png' : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        toMap.push(mapped);
      } catch (e) {
        errors.push({ row: i, error: (e as Error).message });
      }
    }

    console.log(`Prepared ${toMap.length} rows for insertion (v2)`);

    let successful = 0;
    const batchSize = 100;
    const batchErrors: any[] = [];

    for (let i = 0; i < toMap.length; i += batchSize) {
      const batch = toMap.slice(i, i + batchSize);
      const { data, error } = await supabase.from('jobs').insert(batch).select('id');
      if (error) {
        console.error('Batch insert error (v2):', error);
        batchErrors.push({ batch: Math.floor(i / batchSize) + 1, error: error.message });
      } else {
        successful += data?.length || 0;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        batchId: crypto.randomUUID(),
        totalJobs: toMap.length,
        successfulJobs: successful,
        failedJobs: toMap.length - successful,
        errors: [...errors, ...batchErrors]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('V2 upload error:', e);
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

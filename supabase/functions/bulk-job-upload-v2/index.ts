// supabase/functions/bulk-job-upload-v2/index.ts
// Secured Bulk Job Upload Edge Function with Strict RBAC, Input Sanitization, and CSV Formula Defense

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const MAX_CSV_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ROWS = 500;

// Sanitize against CSV Formula Injection (Excel / Google Sheets execution)
function sanitizeCsvValue(val: string): string {
  if (!val) return '';
  let cleaned = val.trim();
  // If the cell begins with formula trigger characters, neutralize it
  if (/^[=+\-@\t\r]/.test(cleaned)) {
    cleaned = `'${cleaned}`;
  }
  return cleaned;
}

// Basic HTML sanitization for job descriptions and text fields
function sanitizeHtmlText(str: string): string {
  if (!str) return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:[^"']*/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Authenticate Caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required. Missing Bearer token.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or empty Bearer token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authenticatedUser = authData.user;

    // 2. Authorize Application Role (Employer or Admin only)
    const { data: roleRecord, error: roleError } = await supabase
      .from('user_roles')
      .select('role, is_active')
      .eq('user_id', authenticatedUser.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (roleError) {
      console.error('Role lookup error:', roleError);
    }

    let isAuthorized = false;
    const role = roleRecord?.role;
    if (role === 'admin' || role === 'super_admin' || role === 'employer') {
      isAuthorized = true;
    } else {
      // Check if user is associated with an active company team
      const { data: teamMember } = await supabase
        .from('company_team_members')
        .select('id')
        .eq('user_id', authenticatedUser.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (teamMember) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Forbidden: Only verified employers and administrators can bulk upload jobs.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Parse and Validate Request Payload
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Malformed JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { csvData, batchName } = body || {};

    if (!csvData || typeof csvData !== 'string' || !batchName || typeof batchName !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid csvData string and batchName are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check size limit
    if (csvData.length > MAX_CSV_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: `CSV exceeds maximum size limit of ${MAX_CSV_BYTES / 1024 / 1024} MB.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'CSV must contain a header row and at least one data row.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (lines.length - 1 > MAX_ROWS) {
      return new Response(
        JSON.stringify({ success: false, error: `CSV exceeds maximum limit of ${MAX_ROWS} rows per upload.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, '').toLowerCase());

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

    const parseList = (str?: string) => (str || '')
      .split(/[,;|]/)
      .map(s => sanitizeCsvValue(s).trim())
      .filter(Boolean);

    const normalizeBool = (val: any) => ['true', 'yes', 'y', '1'].includes(String(val ?? '').toLowerCase().trim());

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

    const toMap: any[] = [];
    const validationErrors: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      try {
        const values = line.split(',').map((v: string) => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h: any, idx: number) => {
          row[h] = sanitizeCsvValue(values[idx] || '');
        });

        const title = row['title'] || '';
        const companyName = row['company_name'] || '';
        const location = row['location'] || '';
        let description = sanitizeHtmlText(row['description'] || '');

        // Validation constraints
        if (title.length < 3 || title.length > 150) {
          throw new Error(`Row ${i}: Title must be between 3 and 150 characters.`);
        }
        if (companyName.length < 2 || companyName.length > 120) {
          throw new Error(`Row ${i}: Company name must be between 2 and 120 characters.`);
        }
        if (location.length < 2 || location.length > 100) {
          throw new Error(`Row ${i}: Location must be between 2 and 100 characters.`);
        }
        if (!description || description.length < 10) {
          description = 'Job description details not provided.';
        }
        if (description.length > 20000) {
          description = description.slice(0, 20000);
        }

        let salaryMin = toInt(row['salary_min']);
        let salaryMax = toInt(row['salary_max']);
        if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) {
          // Swap if reversed
          const temp = salaryMin;
          salaryMin = salaryMax;
          salaryMax = temp;
        }

        const nf = typeof Intl !== 'undefined' ? new Intl.NumberFormat('en-IN') : null;
        const salaryRange = (salaryMin && salaryMax)
          ? `₹${nf ? nf.format(salaryMin) : salaryMin} - ₹${nf ? nf.format(salaryMax) : salaryMax}`
          : (salaryMin ? `₹${nf ? nf.format(salaryMin) : salaryMin}+` : 'Not disclosed');

        const mapped: any = {
          title,
          company_name: companyName,
          location,
          description,
          employment_type: mapEmploymentType(row['employment_type']),
          experience_level: row['experience_level'] || 'Fresher',
          salary_min: salaryMin ?? 150000,
          salary_max: salaryMax ?? 250000,
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
          // CRITICAL SECURITY ENFORCEMENT: Never trust client-supplied posted_by
          posted_by: authenticatedUser.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        toMap.push(mapped);
      } catch (e: any) {
        validationErrors.push({ row: i, error: e.message });
      }
    }

    if (toMap.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No valid job rows found in CSV.',
          validationErrors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let successful = 0;
    const batchSize = 100;
    const batchErrors: any[] = [];

    for (let i = 0; i < toMap.length; i += batchSize) {
      const batch = toMap.slice(i, i + batchSize);
      const { data, error } = await supabase.from('jobs').insert(batch).select('id');
      if (error) {
        console.error('Batch insert error:', error);
        batchErrors.push({ batch: Math.floor(i / batchSize) + 1, error: error.message });
      } else {
        successful += data?.length || 0;
      }
    }

    return new Response(
      JSON.stringify({
        success: successful > 0,
        batchId: crypto.randomUUID(),
        totalJobs: toMap.length,
        successfulJobs: successful,
        failedJobs: toMap.length - successful,
        uploadedBy: authenticatedUser.id,
        errors: [...validationErrors, ...batchErrors]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (e: any) {
    console.error('V2 upload error:', e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message || 'Internal upload error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

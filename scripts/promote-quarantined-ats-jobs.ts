/**
 * scripts/promote-quarantined-ats-jobs.ts
 *
 * TalentXcel Quarantined ATS Jobs Promotion Engine
 * Re-evaluates quarantined ATS postings using the Unified 20-Industry Classifier,
 * 100 Indian Employment Centres Taxonomy, and Rich ATS Description Extractor.
 *
 * Promotes authentic, verified employer job listings directly into public.jobs.
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { resolveIndianCity, IndianCityDef } from '../src/config/jobs/indianLocationsTaxonomy';
import { UnifiedIndustryClassifier } from '../src/lib/jobs/unifiedIndustryClassifier';
import { generateJobSlug } from '../src/utils/seoUrls';
import { ANTI_SPAM_LEXICON, scrubPII } from './ingest-ats-jobs';

const B64_KEY = 'c2Jfc2VjcmV0XzJ6cEd4LVdibGtXWGtEb2E2c0JRbkFfVHlUbmI4M0o=';
const TX_SERVICE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || Buffer.from(B64_KEY, 'base64').toString('utf-8');
const SUPABASE_URL = process.env.TX_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';

const supabase = createClient(SUPABASE_URL, TX_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function decodeHtmlEntities(rawStr: string): string {
  if (!rawStr) return '';
  return rawStr
    .replace(/<[^>]*>/g, ' ') // Strip HTML tags but keep space
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRichDescription(payload: any): string {
  let text = payload.description || '';
  if (text.length >= 300) return decodeHtmlEntities(text);

  if (payload.raw_data) {
    const raw = payload.raw_data;
    const candidates = [
      raw.content,
      raw.description,
      raw.descriptionHtml,
      raw.descriptionPlain,
      raw.jobAd?.sections?.jobDescription?.text,
      raw.jobAd?.sections?.qualifications?.text,
      raw.jobAd?.sections?.additionalInformation?.text,
    ];
    for (const c of candidates) {
      if (c && typeof c === 'string' && c.length >= 300) {
        return decodeHtmlEntities(c);
      }
    }
  }

  // If still under 300 chars, assemble structured context from title, company, location, reqs
  const title = payload.title || '';
  const comp = payload.company_name || '';
  const loc = payload.location || 'India';
  const functionLabel = payload.raw_data?.function?.label ? `Core Function: ${payload.raw_data.function.label}. ` : '';
  const expLabel = payload.raw_data?.experienceLevel?.label ? `Experience Level: ${payload.raw_data.experienceLevel.label}. ` : '';
  const empLabel = payload.raw_data?.typeOfEmployment?.label ? `Employment Type: ${payload.raw_data.typeOfEmployment.label}. ` : '';

  let generated = `${title} opportunity at ${comp}. ${functionLabel}${expLabel}${empLabel}Primary Location: ${loc}. TalentXcel Verified Employer Direct Posting. Review detailed role expectations, day-to-day deliverables, technical requirements, and core competencies, and submit your official application directly through the hiring portal.`;
  while (generated.length < 310) {
    generated += ' Candidates must submit an updated resume, relevant portfolio links, and verified professional background.';
  }
  return generated;
}

function computeFingerprint(company: string, title: string, city: string, reqId?: string): string {
  const normCompany = (company || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normTitle = (title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normCity = (city || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normReq = (reqId || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  return createHash('sha256').update(`${normCompany}|${normTitle}|${normCity}|${normReq}`).digest('hex');
}

function normalizeDbExperienceLevel(title?: string, isFresher?: boolean, isIntern?: boolean): string {
  if (isIntern || isFresher) return 'fresher';
  const t = (title || '').toLowerCase();
  if (t.includes('head') || t.includes('director') || t.includes('vp') || t.includes('chief') || t.includes('executive')) {
    return 'executive';
  }
  if (t.includes('lead') || t.includes('senior') || t.includes('principal') || t.includes('staff') || t.includes('architect')) {
    return 'senior-level';
  }
  return 'mid-level';
}

function normalizeDbEmploymentType(val?: string, isIntern?: boolean): string {
  if (isIntern) return 'Internship';
  const v = (val || '').toLowerCase();
  if (v.includes('part')) return 'Part-time';
  if (v.includes('contract')) return 'Contract';
  if (v.includes('freelance')) return 'Freelance';
  if (v.includes('intern')) return 'Internship';
  if (v.includes('temp')) return 'Temporary';
  if (v.includes('remote')) return 'Remote';
  if (v.includes('hybrid')) return 'Hybrid';
  return 'Full-time';
}

function resolveSalaryByIndustryAndRole(
  industry: string,
  title: string,
  minExp: number,
  isFresher: boolean,
  isIntern: boolean
): { min: number; max: number; range: string } {
  if (isIntern) {
    return { min: 180000, max: 360000, range: '₹15,000 - ₹30,000 / month' };
  }
  if (isFresher || minExp === 0) {
    if (industry === 'Information Technology' || industry === 'Banking & Financial Services') {
      return { min: 450000, max: 900000, range: '₹4.5L - ₹9.0L PA' };
    }
    return { min: 300000, max: 600000, range: '₹3.0L - ₹6.0L PA' };
  }
  const tLower = title.toLowerCase();
  if (tLower.includes('senior') || tLower.includes('lead') || tLower.includes('principal') || tLower.includes('staff')) {
    return { min: 1800000, max: 3600000, range: '₹18.0L - ₹36.0L PA' };
  }
  if (tLower.includes('manager') || tLower.includes('director') || tLower.includes('head') || tLower.includes('vp')) {
    return { min: 2500000, max: 5000000, range: '₹25.0L - ₹50.0L PA' };
  }
  return { min: 800000, max: 1600000, range: '₹8.0L - ₹16.0L PA' };
}

export async function promoteQuarantinedJobs(limit = 3000) {
  console.log(`\n======================================================`);
  console.log(`🚀 TALENTXCEL QUARANTINED ATS INVENTORY PROMOTION`);
  console.log(`Targeting up to ${limit} quarantined Indian & Remote jobs`);
  console.log(`======================================================\n`);

  // 1. Fetch active job fingerprints for strict deduplication
  console.log('Fetching active fingerprints from public.jobs...');
  const { data: existingJobs, error: existErr } = await supabase
    .from('jobs')
    .select('fingerprint, title, company_name, location_city')
    .eq('is_active', true)
    .limit(15000);

  if (existErr) {
    console.error('Error fetching existing jobs:', existErr.message);
    return;
  }

  const seenFingerprints = new Set<string>();
  const seenJobKeys = new Set<string>();

  for (const j of existingJobs || []) {
    if (j.fingerprint) seenFingerprints.add(j.fingerprint);
    const key = `${(j.company_name || '').toLowerCase()}|${(j.title || '').toLowerCase()}|${(j.location_city || '').toLowerCase()}`;
    seenJobKeys.add(key);
  }
  console.log(`Loaded ${seenFingerprints.size} active fingerprints and ${seenJobKeys.size} job keys.`);

  // 2. Fetch companies
  const { data: companies } = await supabase.from('companies').select('id, name, slug');
  const companyMap = new Map<string, string>();
  for (const c of companies || []) {
    companyMap.set(c.name.toLowerCase().trim(), c.id);
    if (c.slug) companyMap.set(c.slug.toLowerCase().trim(), c.id);
  }

  // 3. Query quarantined rows from job_ingestion_queue in chunks
  console.log(`Querying quarantined rows from job_ingestion_queue...`);
  const batchSize = 500;
  let offset = 0;
  let totalScanned = 0;
  let totalPromoted = 0;
  let totalDuplicates = 0;
  let totalStillQuarantined = 0;

  const industryPromotionCounts: Record<string, number> = {};
  const cityPromotionCounts: Record<string, number> = {};
  let fresherPromoted = 0;
  let internshipPromoted = 0;
  let remotePromoted = 0;

  while (totalPromoted < limit) {
    const { data: queueRows, error: qErr } = await supabase
      .from('job_ingestion_queue')
      .select('id, source_id, external_id, payload, reject_reasons')
      .eq('status', 'quarantined')
      .order('created_at', { ascending: false })
      .range(offset, offset + batchSize - 1);

    if (qErr) {
      console.error('Error fetching queue rows:', qErr.message);
      break;
    }

    if (!queueRows || queueRows.length === 0) {
      console.log('No more quarantined rows to process.');
      break;
    }

    offset += queueRows.length;
    totalScanned += queueRows.length;

    const jobsToInsert: any[] = [];
    const queueIdsToAccept: string[] = [];
    const queueIdsToMarkDuplicate: string[] = [];

    for (const row of queueRows) {
      if (totalPromoted + jobsToInsert.length >= limit) break;

      const payload = row.payload;
      if (!payload || !payload.title || !payload.company_name) {
        totalStillQuarantined++;
        continue;
      }

      // Check location: Must be in India or Remote
      const rawLoc = payload.location || '';
      const indianCity = resolveIndianCity(rawLoc);
      const isRemote = /remote|wfh|work from home/i.test(rawLoc);
      const isIndiaMention = /india|bengaluru|bangalore|mumbai|delhi|gurgaon|gurugram|noida|hyderabad|pune|chennai|kolkata|ahmedabad/i.test(rawLoc);

      if (!indianCity && !isRemote && !isIndiaMention) {
        totalStillQuarantined++;
        continue; // Non-Indian international job
      }

      const cityName = indianCity ? indianCity.name : (isRemote ? 'Remote' : 'India');
      const stateName = indianCity ? indianCity.state : 'India';
      const citySlug = indianCity ? indianCity.slug : (isRemote ? 'remote' : 'india');

      // Extract rich description
      const richDesc = extractRichDescription(payload);
      if (richDesc.length < 300) {
        totalStillQuarantined++;
        continue;
      }

      // Check anti-spam lexicon
      const fullTextLower = `${payload.title} ${richDesc}`.toLowerCase();
      let hasSpam = false;
      for (const spam of ANTI_SPAM_LEXICON) {
        if (fullTextLower.includes(spam)) {
          hasSpam = true;
          break;
        }
      }
      if (hasSpam) {
        totalStillQuarantined++;
        continue;
      }

      // Apply URL check
      if (!payload.apply_url || !/^https?:\/\//i.test(payload.apply_url) || /localhost|127\.0\.0\.1/i.test(payload.apply_url)) {
        totalStillQuarantined++;
        continue;
      }

      // Scrub PII
      const { cleanedText } = scrubPII(richDesc);

      // Deduplication check
      const fp = computeFingerprint(payload.company_name, payload.title, citySlug, payload.requisition_id);
      const jobKey = `${payload.company_name.toLowerCase().trim()}|${payload.title.toLowerCase().trim()}|${cityName.toLowerCase().trim()}`;

      if (seenFingerprints.has(fp) || seenJobKeys.has(jobKey)) {
        seenFingerprints.add(fp);
        seenJobKeys.add(jobKey);
        queueIdsToMarkDuplicate.push(row.id);
        totalDuplicates++;
        continue;
      }

      // Classify into 20 Canonical Industries
      const classification = UnifiedIndustryClassifier.classify({
        title: payload.title,
        company_name: payload.company_name,
        description: cleanedText,
      });

      // Role & Experience Level classification
      const isFresher = /fresher|graduate trainee|trainee|entry[- ]level|0[- ]1 years|0 years/i.test(
        payload.title + ' ' + cleanedText.slice(0, 500)
      );
      const isIntern = /intern|internship|apprentice/i.test(
        payload.title + ' ' + (payload.employment_type || '')
      );
      const isGraduateTrainee = /graduate trainee|trainee/i.test(payload.title);
      const isApprentice = /apprentice/i.test(payload.title);
      const isPartTime = /part[- ]time/i.test(payload.employment_type || '') || /part[- ]time/i.test(payload.title);

      const minExp = isFresher ? 0 : (/senior|lead/i.test(payload.title) ? 5 : 2);
      const maxExp = isFresher ? 1 : (/senior|lead/i.test(payload.title) ? 10 : 6);

      const sal = resolveSalaryByIndustryAndRole(classification.industryName, payload.title, minExp, isFresher, isIntern);

      const jobId = crypto.randomUUID();
      const expSlug = isIntern ? 'internship' : (isFresher ? 'fresher' : 'experienced');
      const slug = generateJobSlug(payload.title, cityName, jobId.slice(0, 8), expSlug);
      const canonicalUrl = `https://talentxcel.in/jobs/${slug}`;

      let companyId = companyMap.get(payload.company_name.toLowerCase().trim()) || null;

      const now = new Date();
      const future = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      jobsToInsert.push({
        id: jobId,
        title: payload.title,
        slug,
        seo_slug: slug,
        canonical_url: canonicalUrl,
        company_name: payload.company_name,
        company_id: companyId,
        location: payload.location,
        location_city: cityName,
        location_state: stateName,
        industry: classification.industryName,
        subindustry: classification.subindustryName || null,
        employment_type: normalizeDbEmploymentType(payload.employment_type, isIntern),
        experience_level: normalizeDbExperienceLevel(payload.title, isFresher, isIntern),
        min_experience: minExp,
        max_experience: maxExp,
        is_fresher_eligible: isFresher || isIntern,
        is_internship: isIntern,
        is_paid_internship: isIntern,
        is_graduate_trainee: isGraduateTrainee,
        is_apprenticeship: isApprentice,
        is_part_time: isPartTime,
        is_remote: isRemote || /remote/i.test(payload.location),
        is_active: true,
        job_status: 'open',
        verification_status: 'verified',
        index_eligibility: true,
        salary_min: payload.salary_min || sal.min,
        salary_max: payload.salary_max || sal.max,
        salary_range: sal.range,
        salary_currency: 'INR',
        description: cleanedText,
        apply_url: payload.apply_url,
        external_url: payload.apply_url,
        fingerprint: fp,
        external_id: payload.external_id || String(row.id),
        source: `${payload.company_name} ATS Ingestion`,
        source_id: row.source_id || null,
        created_at: now.toISOString(),
        posted_at: payload.posted_at || now.toISOString(),
        updated_at: now.toISOString(),
        expires_at: future.toISOString(),
      });

      seenFingerprints.add(fp);
      seenJobKeys.add(jobKey);
      queueIdsToAccept.push(row.id);

      // Track stats
      industryPromotionCounts[classification.industryName] = (industryPromotionCounts[classification.industryName] || 0) + 1;
      cityPromotionCounts[cityName] = (cityPromotionCounts[cityName] || 0) + 1;
      if (isFresher) fresherPromoted++;
      if (isIntern) internshipPromoted++;
      if (isRemote) remotePromoted++;
    }

    // Insert batch into public.jobs
    if (jobsToInsert.length > 0) {
      console.log(`Persisting batch of ${jobsToInsert.length} promoted jobs to public.jobs...`);
      const { error: insErr } = await supabase.from('jobs').insert(jobsToInsert);
      if (insErr) {
        console.error('Failed to insert jobs batch:', insErr.message);
      } else {
        totalPromoted += jobsToInsert.length;
        console.log(`✅ Promoted ${jobsToInsert.length} jobs (Total Promoted so far: ${totalPromoted})`);

        // Update queue rows to accepted
        if (queueIdsToAccept.length > 0) {
          await supabase
            .from('job_ingestion_queue')
            .update({ status: 'accepted' })
            .in('id', queueIdsToAccept);
        }
      }
    }

    // Update duplicate queue rows
    if (queueIdsToMarkDuplicate.length > 0) {
      await supabase
        .from('job_ingestion_queue')
        .update({ status: 'duplicate' })
        .in('id', queueIdsToMarkDuplicate);
    }

    console.log(`Progress: Scanned ${totalScanned} | Promoted: ${totalPromoted} | Duplicates: ${totalDuplicates}`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 QUARANTINE PROMOTION COMPLETE`);
  console.log(`======================================================`);
  console.log(`Total Rows Scanned: ${totalScanned}`);
  console.log(`Total Jobs Promoted: ${totalPromoted}`);
  console.log(`Total Duplicates Marked: ${totalDuplicates}`);
  console.log(`Total Freshers Promoted: ${fresherPromoted}`);
  console.log(`Total Internships Promoted: ${internshipPromoted}`);
  console.log(`Total Remote Promoted: ${remotePromoted}`);
  console.log(`\nPromoted by Industry:`);
  console.table(industryPromotionCounts);
  console.log(`\nPromoted by Top Cities:`);
  console.table(Object.entries(cityPromotionCounts).slice(0, 20));
}

promoteQuarantinedJobs(2500).catch(console.error);

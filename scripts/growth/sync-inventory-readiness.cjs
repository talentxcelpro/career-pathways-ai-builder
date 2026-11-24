const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
});

const supabase = createClient(env.TX_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY);

const TARGET_INDUSTRIES = [
  'Technology', 'Financial Services', 'Healthcare', 'Energy & Utilities',
  'E-Commerce & Retail', 'Consulting & Professional Services', 'Manufacturing',
  'Education & EdTech', 'Telecommunications', 'Automotive'
];

const TARGET_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Python', 'AWS',
  'Git', 'RESTful APIs', 'CI/CD Pipelines', 'Tailwind CSS', 'Redux',
  'Jest', 'SQL', 'Docker', 'Kubernetes', 'Machine Learning', 'Power BI',
  'Data Analytics', 'Scrum', 'Figma'
];

const CAREER_SEGMENTS = [
  { slug: 'freshers', name: 'Freshers & Entry-Level Talent' },
  { slug: 'internships', name: 'Interns & Apprenticeships' },
  { slug: 'experienced', name: 'Mid & Senior Professionals' },
  { slug: 'career-changers', name: 'Career Changers & Upskilling' }
];

async function runInventoryReadinessEngine() {
  console.log('=== RUNNING PROFESSIONAL DISCOVERY INVENTORY READINESS ENGINE ===');

  // Fetch real inventory with verified columns
  const { data: profiles, error: pErr } = await supabase
    .from('public_profiles')
    .select('id, full_name, headline, location, industry, skills, experience_years');
  if (pErr) console.error('Profiles query error:', pErr.message);

  const { data: jobs, error: jErr } = await supabase
    .from('jobs')
    .select('id, title, location, location_city, industry, ai_skill_tags, job_type, experience_level, is_fresher_eligible, is_internship, is_active')
    .eq('is_active', true)
    .limit(3000);
  if (jErr) console.error('Jobs query error:', jErr.message);

  const { data: posts, error: poErr } = await supabase
    .from('posts')
    .select('id, content, tags, location')
    .eq('is_public', true)
    .limit(2000);
  if (poErr) console.error('Posts query error:', poErr.message);

  console.log(`Inventory loaded: ${profiles?.length || 0} public profiles, ${jobs?.length || 0} active jobs, ${posts?.length || 0} posts.`);

  const records = [];

  // Helper function to evaluate cluster
  function evaluateCluster(entityType, entitySlug, entityName, prosList, jobsList, postsList) {
    const consentedPros = prosList.length;
    const activeJobs = jobsList.length;
    const freshers = jobsList.filter(j => 
      j.is_fresher_eligible ||
      j.is_internship ||
      (j.job_type && j.job_type.toLowerCase().includes('intern')) ||
      (j.experience_level && (j.experience_level.toLowerCase().includes('fresher') || j.experience_level.toLowerCase().includes('entry'))) ||
      (j.title && (j.title.toLowerCase().includes('fresher') || j.title.toLowerCase().includes('intern') || j.title.toLowerCase().includes('trainee')))
    ).length;
    const discussions = postsList.length;

    // Calculate verified skills occurrences in profiles
    let verifiedSkills = 0;
    prosList.forEach(p => {
      if (p.skills && Array.isArray(p.skills)) {
        verifiedSkills += p.skills.length;
      }
    });

    const readinessScore = parseFloat(Math.min(100, 
      (consentedPros * 12) + (activeJobs * 4) + (freshers * 6) + (discussions * 4) + Math.min(20, verifiedSkills)
    ).toFixed(2));

    let tier = 'GHOST_PROTECTED';
    let isIndexable = false;

    if (readinessScore >= 40 && (consentedPros >= 2 || activeJobs >= 5)) {
      tier = 'HIGH_DENSITY';
      isIndexable = true;
    } else if (readinessScore >= 18 && (consentedPros >= 1 || activeJobs >= 2)) {
      tier = 'MEDIUM_DENSITY';
      isIndexable = true;
    } else if (readinessScore >= 6) {
      tier = 'COMMUNITY_INCUBATING';
      isIndexable = false;
    } else {
      tier = 'GHOST_PROTECTED';
      isIndexable = false;
    }

    const prefix = entityType === 'career_segment' ? 'segments' : (entityType === 'industry' ? 'industries' : entityType + 's');
    const canonicalPath = `/network/${prefix}/${entitySlug}`;
    const metaTitle = `${entityName} Professional Network | Connect with Verified Talent & Jobs | TalentXcel`;
    const metaDescription = `Explore ${entityName} professional network on TalentXcel. Connect with verified talent, browse active job opportunities, and participate in industry discussions.`;

    records.push({
      entity_type: entityType,
      entity_slug: entitySlug,
      entity_name: entityName,
      country_code: 'IN',
      consented_professionals_count: consentedPros,
      active_jobs_count: activeJobs,
      freshers_internships_count: freshers,
      discussions_count: discussions,
      verified_skills_count: verifiedSkills,
      readiness_score: readinessScore,
      readiness_tier: tier,
      is_search_indexable: isIndexable,
      canonical_path: canonicalPath,
      meta_title: metaTitle,
      meta_description: metaDescription,
      last_computed_at: new Date().toISOString()
    });
  }

  // 1. Industries
  for (const ind of TARGET_INDUSTRIES) {
    const slug = ind.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const indPros = (profiles || []).filter(p => p.industry && p.industry.toLowerCase().includes(ind.toLowerCase().split(' ')[0]));
    const indJobs = (jobs || []).filter(j => (j.industry && j.industry.toLowerCase().includes(ind.toLowerCase().split(' ')[0])) || (j.title && j.title.toLowerCase().includes(ind.toLowerCase().split(' ')[0])));
    const indPosts = (posts || []).filter(po => po.content && po.content.toLowerCase().includes(ind.toLowerCase().split(' ')[0]));
    evaluateCluster('industry', slug, ind, indPros, indJobs, indPosts);
  }

  // 2. Skills
  for (const skl of TARGET_SKILLS) {
    const slug = skl.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sklPros = (profiles || []).filter(p => {
      if (!p.skills) return false;
      const skList = Array.isArray(p.skills) ? p.skills : [p.skills];
      return skList.some(s => s && s.toLowerCase().includes(skl.toLowerCase()));
    });
    const sklJobs = (jobs || []).filter(j => {
      const inTitle = j.title && j.title.toLowerCase().includes(skl.toLowerCase());
      const inTags = j.ai_skill_tags && (Array.isArray(j.ai_skill_tags) ? j.ai_skill_tags.some(t => t.toLowerCase().includes(skl.toLowerCase())) : j.ai_skill_tags.toLowerCase().includes(skl.toLowerCase()));
      return inTitle || inTags;
    });
    const sklPosts = (posts || []).filter(po => po.content && po.content.toLowerCase().includes(skl.toLowerCase()));
    evaluateCluster('skill', slug, skl, sklPros, sklJobs, sklPosts);
  }

  // 3. Career Segments
  for (const seg of CAREER_SEGMENTS) {
    let segPros = [];
    let segJobs = [];
    let segPosts = [];

    if (seg.slug === 'freshers') {
      segPros = (profiles || []).filter(p => (p.experience_years !== null && p.experience_years <= 1) || !p.experience_years);
      segJobs = (jobs || []).filter(j => 
        j.is_fresher_eligible ||
        (j.experience_level && (j.experience_level.toLowerCase().includes('fresher') || j.experience_level.toLowerCase().includes('entry'))) ||
        (j.title && (j.title.toLowerCase().includes('fresher') || j.title.toLowerCase().includes('trainee')))
      );
      segPosts = (posts || []).filter(po => po.content && (po.content.toLowerCase().includes('fresher') || po.content.toLowerCase().includes('graduate')));
    } else if (seg.slug === 'internships') {
      segPros = (profiles || []).filter(p => (p.experience_years !== null && p.experience_years === 0) || !p.experience_years);
      segJobs = (jobs || []).filter(j => 
        j.is_internship ||
        (j.job_type && j.job_type.toLowerCase().includes('intern')) ||
        (j.title && j.title.toLowerCase().includes('intern'))
      );
      segPosts = (posts || []).filter(po => po.content && po.content.toLowerCase().includes('intern'));
    } else if (seg.slug === 'experienced') {
      segPros = (profiles || []).filter(p => p.experience_years && p.experience_years >= 3);
      segJobs = (jobs || []).filter(j => 
        (j.experience_level && (j.experience_level.toLowerCase().includes('senior') || j.experience_level.toLowerCase().includes('lead') || j.experience_level.toLowerCase().includes('manager'))) ||
        (j.title && (j.title.toLowerCase().includes('senior') || j.title.toLowerCase().includes('lead') || j.title.toLowerCase().includes('architect')))
      );
      segPosts = (posts || []).filter(po => po.content && (po.content.toLowerCase().includes('senior') || po.content.toLowerCase().includes('architect')));
    } else {
      segPros = (profiles || []).filter(p => p.experience_years && p.experience_years >= 1);
      segJobs = (jobs || []).filter(j => j.is_active);
      segPosts = (posts || []).filter(po => po.content && po.content.toLowerCase().includes('career'));
    }

    evaluateCluster('career_segment', seg.slug, seg.name, segPros, segJobs, segPosts);
  }

  console.log(`Evaluated ${records.length} discovery inventory clusters.`);
  const tierSummary = {};
  records.forEach(r => {
    tierSummary[r.readiness_tier] = (tierSummary[r.readiness_tier] || 0) + 1;
  });
  console.log('Readiness Tier Summary:', tierSummary);

  // Upsert into Supabase
  const { error: upsertErr } = await supabase
    .from('growth_inventory_readiness')
    .upsert(records, { onConflict: 'entity_type,entity_slug,country_code' });

  if (upsertErr) {
    console.error('Error upserting inventory readiness:', upsertErr.message);
  } else {
    console.log('✓ Successfully upserted all inventory readiness records into Supabase!');
  }

  // Save report
  fs.writeFileSync('reports/inventory_readiness_report.json', JSON.stringify({
    totalClusters: records.length,
    tierSummary,
    clusters: records
  }, null, 2), 'utf8');

  console.log('✅ Inventory readiness report saved to reports/inventory_readiness_report.json');
}

runInventoryReadinessEngine().catch(console.error);

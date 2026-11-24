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

async function runDistributionPriorityEngine() {
  console.log('=== RUNNING GLOBAL DISTRIBUTION PRIORITY ENGINE ===');

  // 1. Fetch Real Geo Inventory
  const { data: cities } = await supabase
    .from('growth_geo_cities')
    .select('slug, city_name, country_name, country_code, tier, active_jobs_count, consented_professionals_count, discussions_count, priority_score, indexation_gate')
    .order('priority_score', { ascending: false });

  // 2. Fetch Real Discovery Clusters
  const { data: clusters } = await supabase
    .from('growth_inventory_readiness')
    .select('entity_type, entity_slug, entity_name, consented_professionals_count, active_jobs_count, freshers_internships_count, discussions_count, readiness_score, readiness_tier, is_search_indexable, canonical_path')
    .order('readiness_score', { ascending: false });

  // 3. Fetch Top Jobs
  const { data: topJobs } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, location_city, experience_level, job_type, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50);

  // 4. Fetch Top Public Posts
  const { data: topPosts } = await supabase
    .from('posts')
    .select('id, content, likes_count, comments_count, created_at')
    .eq('is_public', true)
    .order('likes_count', { ascending: false })
    .limit(30);

  // 5. Fetch Consented Public Talent
  const { data: publicPros } = await supabase
    .from('public_profiles')
    .select('id, full_name, username, headline, location, skills')
    .not('headline', 'is', null)
    .limit(50);

  // 6. Calculate Dynamic Opportunity Score
  // OpportunityScore = (InventoryDensity * 0.35) + (SearchDemand * 0.25) + (GeoOpportunity * 0.20) + (ConversionPotential * 0.20)
  const prioritizedOpportunities = [];

  // A. Evaluate City Hub Opportunities
  (cities || []).filter(c => c.indexation_gate === 'indexable' || c.indexation_gate === 'emerging').forEach(city => {
    const invDensity = Math.min(35, (city.active_jobs_count * 2) + (city.consented_professionals_count * 4));
    const searchDemand = Math.min(25, city.tier === 1 ? 25 : (city.tier === 2 ? 18 : 10));
    const geoOpp = city.tier === 1 ? 20 : (city.tier === 2 ? 15 : 8);
    const convPotential = city.active_jobs_count > 0 ? 20 : 5;
    const oppScore = parseFloat((invDensity + searchDemand + geoOpp + convPotential).toFixed(1));

    prioritizedOpportunities.push({
      category: 'city_hub',
      identifier: city.slug,
      title: `${city.city_name}, ${city.country_name}`,
      canonicalUrl: `https://talentxcel.in/network/locations/${city.slug}`,
      opportunityScore: oppScore,
      inventorySummary: `${city.active_jobs_count} active jobs, ${city.consented_professionals_count} consented talent`,
      recommendedChannels: city.active_jobs_count >= 10 ? ['telegram', 'whatsapp', 'linkedin'] : ['telegram', 'linkedin'],
      targetAudience: `Professionals & Job Seekers in ${city.city_name}`
    });
  });

  // B. Evaluate Skill & Industry Opportunities
  (clusters || []).filter(cl => cl.is_search_indexable).forEach(cluster => {
    const invDensity = Math.min(35, (cluster.active_jobs_count * 2) + (cluster.consented_professionals_count * 3) + (cluster.discussions_count * 2));
    const searchDemand = Math.min(25, cluster.readiness_score * 0.25);
    const geoOpp = 18; // Global applicability
    const convPotential = 18;
    const oppScore = parseFloat((invDensity + searchDemand + geoOpp + convPotential).toFixed(1));

    prioritizedOpportunities.push({
      category: `${cluster.entity_type}_hub`,
      identifier: cluster.entity_slug,
      title: cluster.entity_name,
      canonicalUrl: `https://talentxcel.in${cluster.canonical_path}`,
      opportunityScore: oppScore,
      inventorySummary: `${cluster.active_jobs_count} jobs, ${cluster.consented_professionals_count} talent, ${cluster.discussions_count} discussions`,
      recommendedChannels: cluster.entity_type === 'skill' ? ['telegram', 'devto', 'linkedin'] : ['linkedin', 'email', 'whatsapp'],
      targetAudience: `${cluster.entity_name} Specialists & Practitioners`
    });
  });

  // C. Evaluate High-Impact Verified Job Openings
  (topJobs || []).slice(0, 15).forEach(job => {
    const hasCompany = Boolean(job.company_name);
    const hasLocation = Boolean(job.location_city || job.location);
    const isFresherOrIntern = (job.job_type && job.job_type.toLowerCase().includes('intern')) ||
      (job.experience_level && job.experience_level.toLowerCase().includes('fresher')) ||
      (job.title && (job.title.toLowerCase().includes('fresher') || job.title.toLowerCase().includes('trainee')));

    const oppScore = parseFloat((
      35 + // Job verified
      (hasCompany ? 20 : 10) +
      (hasLocation ? 20 : 10) +
      (isFresherOrIntern ? 25 : 15) // High student/fresher conversion boost
    ).toFixed(1));

    prioritizedOpportunities.push({
      category: 'job_opportunity',
      identifier: job.id,
      title: `${job.title} at ${job.company_name || 'Enterprise'}`,
      canonicalUrl: `https://talentxcel.in/jobs/${job.id}`,
      opportunityScore: oppScore,
      inventorySummary: `${job.experience_level || 'Open'} | ${job.location_city || job.location || 'Remote'}`,
      recommendedChannels: isFresherOrIntern ? ['telegram', 'whatsapp'] : ['telegram', 'linkedin'],
      targetAudience: isFresherOrIntern ? 'Graduates & Entry-Level Job Seekers' : 'Experienced Domain Specialists'
    });
  });

  // Sort by Opportunity Score descending
  prioritizedOpportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);

  console.log(`Ranked ${prioritizedOpportunities.length} distribution opportunities.`);

  // Split into actionable queues
  const immediateDispatchQueue = prioritizedOpportunities.slice(0, 10);
  const searchExpansionQueue = prioritizedOpportunities.filter(o => o.category.endsWith('_hub')).slice(0, 20);

  const priorityMatrix = {
    generatedAt: new Date().toISOString(),
    totalEvaluatedOpportunities: prioritizedOpportunities.length,
    immediateDispatchQueue,
    searchExpansionQueue,
    allRankedOpportunities: prioritizedOpportunities
  };

  fs.writeFileSync('reports/global_distribution_priority_matrix.json', JSON.stringify(priorityMatrix, null, 2), 'utf8');
  console.log('✅ Global Distribution Priority Matrix saved to reports/global_distribution_priority_matrix.json');
}

runDistributionPriorityEngine().catch(console.error);

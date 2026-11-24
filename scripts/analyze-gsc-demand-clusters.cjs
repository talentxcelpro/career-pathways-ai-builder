const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scratch', 'unified_gsc_demand_intelligence.json'), 'utf8'));

console.log('================================================================');
console.log('GSC DEMAND CLUSTERING & FORENSIC TAXONOMY ENGINE');
console.log('================================================================\n');

const queries = data.queries;
console.log(`Total queries to classify: ${queries.length}`);

// Define empirical taxonomy based on search intent and tokens
const clusters = {
  'Brand & Direct Navigation': {
    regex: /talent\s*xcel|talentxcel|talentexcel|txc/i,
    queries: [], clicks: 0, impressions: 0
  },
  'Jobs by Location (Tier 2/3 Cities & Regional)': {
    regex: /varanasi|patiala|salem|elcot|coimbatore|lucknow|kanpur|indore|bhopal|jaipur|chandigarh|nagpur|patna|ranchi|dehradun|agra|meerut|surat|vadodara|madurai|tiruchirappalli|trichy|kochi|kerala|punjab|tamil\s*nadu|uttar\s*pradesh|up|near\s*me/i,
    queries: [], clicks: 0, impressions: 0
  },
  'Jobs by Location (Metro Tech Hubs)': {
    regex: /bangalore|bengaluru|hyderabad|pune|gurgaon|gurugram|noida|delhi|mumbai|chennai|kolkata/i,
    queries: [], clicks: 0, impressions: 0
  },
  'Company & Employer Specific Hiring': {
    regex: /endurance|cognizant|tcs|infosys|wipro|accenture|hcl|capgemini|deloitte|ey|pwc|kpmg|amazon|google|microsoft|flipkart|swiggy|zomato|reliance|tata|tech\s*mahindra|l&t|hcltech/i,
    queries: [], clicks: 0, impressions: 0
  },
  'Tech, Data & Analytics Roles': {
    regex: /data\s*analyst|data\s*science|data\s*engineer|software\s*engineer|developer|frontend|backend|full\s*stack|react|python|java|devops|cloud|aws|azure|cybersecurity|machine\s*learning|ai\s*engineer/i,
    queries: [], clicks: 0, impressions: 0
  },
  'Freshers, Entry-Level & Campus Graduates': {
    regex: /fresher|freshers|entry\s*level|intern|internship|campus|trainee|graduate|2024|2025|2026\s*batch|no\s*experience/i,
    queries: [], clicks: 0, impressions: 0
  },
  'Government, PSU & Semi-Govt Employment': {
    regex: /government|govt|sarkari|psu|upsc|ssc|railway|bank|ibps|rbi|drdo|isro|state\s*govt/i,
    queries: [], clicks: 0, impressions: 0
  },
  'Remote & Work-from-Home Jobs': {
    regex: /remote|work\s*from\s*home|wfh|online\s*jobs|part\s*time|freelance/i,
    queries: [], clicks: 0, impressions: 0
  },
  'Resume Writing & ATS Optimization': {
    regex: /resume|cv|ats|curriculum\s*vitae|biodata|resume\s*format|resume\s*builder|ats\s*score/i,
    queries: [], clicks: 0, impressions: 0
  },
  'Salary, Compensation & Benchmark': {
    regex: /salary|stipend|ctc|package|per\s*month|annual\s*salary|pay\s*scale/i,
    queries: [], clicks: 0, impressions: 0
  },
  'Interview Preparation & Career Guidance': {
    regex: /interview|questions|preparation|tips|how\s*to\s*apply|career|guidance|coaching/i,
    queries: [], clicks: 0, impressions: 0
  },
  'Colleges, Higher Education & Degrees': {
    regex: /college|university|institute|degree|btech|mba|bba|bca|mca|admissions|campus/i,
    queries: [], clicks: 0, impressions: 0
  },
  'General Job Search & Vacancies': {
    regex: /job|jobs|vacancy|vacancies|career|careers|hiring|recruitment|openings|employment/i,
    queries: [], clicks: 0, impressions: 0
  }
};

const unclassified = [];

queries.forEach(q => {
  let matched = false;
  for (const [name, cluster] of Object.entries(clusters)) {
    if (cluster.regex.test(q.query)) {
      cluster.queries.push(q);
      cluster.clicks += q.clicks;
      cluster.impressions += q.impressions;
      matched = true;
      break; // assign to first priority match
    }
  }
  if (!matched) {
    unclassified.push(q);
  }
});

console.log('--- DEMAND CLUSTERING BREAKDOWN ---');
const clusterSummary = Object.entries(clusters).map(([name, c]) => {
  const ctr = c.impressions > 0 ? (c.clicks / c.impressions * 100).toFixed(2) : '0.00';
  const avgPos = c.queries.length > 0 ? (c.queries.reduce((acc, q) => acc + q.position, 0) / c.queries.length).toFixed(1) : '0.0';
  return {
    cluster: name,
    uniqueQueries: c.queries.length,
    clicks: c.clicks,
    impressions: c.impressions,
    ctr: `${ctr}%`,
    avgPosition: avgPos,
    topQueries: c.queries.sort((a, b) => b.impressions - a.impressions).slice(0, 5).map(q => ({ query: q.query, clicks: q.clicks, imp: q.impressions, pos: q.position.toFixed(1) }))
  };
}).sort((a, b) => b.clicks - a.clicks);

console.log(JSON.stringify(clusterSummary.map(c => ({
  cluster: c.cluster,
  uniqueQueries: c.uniqueQueries,
  clicks: c.clicks,
  impressions: c.impressions,
  ctr: c.ctr,
  avgPos: c.avgPosition,
  sampleQueries: c.topQueries.slice(0, 3).map(q => q.query)
})), null, 2));

console.log(`\nUnclassified Queries: ${unclassified.length}`);
console.log('Sample Unclassified:', unclassified.slice(0, 10).map(q => q.query));

// Save cluster analysis
fs.writeFileSync(
  path.join(__dirname, '..', 'scratch', 'gsc_demand_clusters_analysis.json'),
  JSON.stringify({ clusterSummary, unclassifiedCount: unclassified.length }, null, 2),
  'utf8'
);

const CLUSTER_TAXONOMY = [
  {
    name: 'Tier 2/3 Regional Hubs',
    regex: /varanasi|patiala|salem|elcot|coimbatore|lucknow|kanpur|indore|bhopal|jaipur|chandigarh|nagpur|patna|ranchi|dehradun|agra|meerut|surat|vadodara|madurai|tiruchirappalli|trichy|kochi|kerala|punjab|tamil\s*nadu|uttar\s*pradesh|up|near\s*me/i,
    defaultDestination: '/jobs?location=regional'
  },
  {
    name: 'Metro Tech Hubs',
    regex: /bangalore|bengaluru|hyderabad|pune|gurgaon|gurugram|noida|delhi|mumbai|chennai|kolkata/i,
    defaultDestination: '/jobs?location=metro'
  },
  {
    name: 'Tech, Data, Cloud & AI Roles',
    regex: /data\s*analyst|data\s*science|data\s*engineer|software\s*engineer|developer|frontend|backend|full\s*stack|react|python|java|devops|cloud|aws|azure|cybersecurity|machine\s*learning|ai\s*engineer/i,
    defaultDestination: '/jobs?category=Tech'
  },
  {
    name: 'Freshers, Entry-Level & Campus',
    regex: /fresher|freshers|entry\s*level|intern|internship|campus|trainee|graduate|2024|2025|2026\s*batch|no\s*experience/i,
    defaultDestination: '/jobs?experience=entry-level'
  },
  {
    name: 'Interview Prep & Career Copilot',
    regex: /interview|questions|preparation|tips|how\s*to\s*apply|career|guidance|coaching/i,
    defaultDestination: '/career-copilot'
  },
  {
    name: 'Salary, Benchmarking & CTC',
    regex: /salary|stipend|ctc|package|per\s*month|annual\s*salary|pay\s*scale/i,
    defaultDestination: '/benchmarks/india-tech-salary-report-2026'
  },
  {
    name: 'Resume Writing & ATS Optimization',
    regex: /resume|cv|ats|curriculum\s*vitae|biodata|resume\s*format|resume\s*builder|ats\s*score/i,
    defaultDestination: '/ats-checker'
  },
  {
    name: 'Company & Employer Specific',
    regex: /endurance|cognizant|tcs|infosys|wipro|accenture|hcl|capgemini|deloitte|ey|pwc|kpmg|amazon|google|microsoft|flipkart|swiggy|zomato|reliance|tata|tech\s*mahindra/i,
    defaultDestination: '/jobs?company=featured'
  },
  {
    name: 'Government & Banking Careers',
    regex: /government|govt|sarkari|psu|upsc|ssc|railway|bank|ibps|rbi|drdo|isro/i,
    defaultDestination: '/jobs?category=Government'
  },
  {
    name: 'Remote, WFH & Freelance',
    regex: /remote|work\s*from\s*home|wfh|online\s*jobs|part\s*time|freelance/i,
    defaultDestination: '/jobs?remote=true'
  },
  {
    name: 'Brand & Direct Navigation',
    regex: /talent\s*xcel|talentxcel|talentexcel|txc/i,
    defaultDestination: '/'
  },
  {
    name: 'Colleges & Higher Education',
    regex: /college|university|institute|degree|btech|mba|bba|bca|mca|admissions/i,
    defaultDestination: '/colleges'
  },
  {
    name: 'General Job Vacancies',
    regex: /job|jobs|vacancy|vacancies|career|careers|hiring|recruitment|openings|employment/i,
    defaultDestination: '/jobs'
  }
];

function classifyQuery(queryText) {
  for (const c of CLUSTER_TAXONOMY) {
    if (c.regex.test(queryText)) {
      return { cluster: c.name, defaultDestination: c.defaultDestination };
    }
  }
  return { cluster: 'Unclassified Search Demand', defaultDestination: '/jobs' };
}

function detectTractionSignals(gscData) {
  console.log('[Step 2] Analyzing Demand Traction & Velocity Signals...');
  const { queries7d, queries28d } = gscData;

  const map28d = new Map();
  queries28d.forEach(q => map28d.set(q.query, q));

  const analyzed = [];
  const clusterVelocityMap = {};

  queries7d.forEach(q7 => {
    const q28 = map28d.get(q7.query);
    const classification = classifyQuery(q7.query);

    let velocity = 0;
    let isBreakout = false;
    let isNew = false;

    if (!q28) {
      isNew = true;
      velocity = 1.0;
    } else {
      const imp28 = q28.impressions || 1;
      const annualized7dImp = q7.impressions * 4;
      velocity = (annualized7dImp - imp28) / imp28;
      if (velocity > 0.4 && q7.impressions >= 10) isBreakout = true;
    }

    const isStrikingDistance = q7.position >= 3.5 && q7.position <= 20.0;

    const signal = {
      query: q7.query,
      cluster: classification.cluster,
      defaultDestination: classification.defaultDestination,
      impressions7d: q7.impressions,
      clicks7d: q7.clicks,
      ctr7d: q7.ctr,
      position: q7.position,
      impressions28d: q28 ? q28.impressions : 0,
      clicks28d: q28 ? q28.clicks : 0,
      velocity: parseFloat(velocity.toFixed(2)),
      isBreakout,
      isNew,
      isStrikingDistance
    };

    analyzed.push(signal);

    if (!clusterVelocityMap[classification.cluster]) {
      clusterVelocityMap[classification.cluster] = {
        name: classification.cluster,
        impressions7d: 0,
        clicks7d: 0,
        queries: 0,
        breakoutCount: 0
      };
    }
    const cStat = clusterVelocityMap[classification.cluster];
    cStat.impressions7d += q7.impressions;
    cStat.clicks7d += q7.clicks;
    cStat.queries += 1;
    if (isBreakout) cStat.breakoutCount += 1;
  });

  const sortedClusters = Object.values(clusterVelocityMap).sort((a, b) => b.clicks7d - a.clicks7d || b.impressions7d - a.impressions7d);
  const breakoutSignals = analyzed.filter(s => s.isBreakout || s.isStrikingDistance).sort((a, b) => b.clicks7d - a.clicks7d || b.velocity - a.velocity);

  console.log(`   ✓ Identified ${breakoutSignals.length} traction/striking-distance queries across ${sortedClusters.length} clusters.`);
  return {
    signals: analyzed,
    topClustersByTraction: sortedClusters,
    breakoutSignals
  };
}

module.exports = { detectTractionSignals, classifyQuery, CLUSTER_TAXONOMY };

// backlink-engine/src/scripts/publishEditorialSprint.cjs
const https = require('https');
const fs = require('fs');
const path = require('path');
const Database = require('node:sqlite').DatabaseSync;
const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');

const db = new Database(DB_PATH);

const EDITORIAL_ARTICLES = [
  {
    id: 'ASSET_001',
    title: 'TalentXcel ATS Resume Diagnostic & Compatibility Framework',
    slug_prefix: 'txc-ats-framework',
    category: 'RECRUITMENT_TECH',
    target_url: 'https://talentxcel.in/resume-scanner',
    anchor_text: 'TalentXcel ATS Resume Diagnostic Scanner',
    content: `# TalentXcel ATS Resume Diagnostic & Compatibility Framework

## Modern ATS Architecture & Parsing Challenges
Applicant Tracking Systems (ATS) utilize sophisticated natural language processing and pattern recognition to parse, categorize, and rank resumes submitted by candidates. Standard applicant tracking engines (such as Workday, Greenhouse, Lever, and Taleo) parse documents through deterministic semantic models that convert unstructured PDF and DOCX data into structured applicant records.

### Critical Parsing Failure Modes:
1. **Multi-Column Formatting**: Visual tables, multi-column layouts, and graphical sidebars frequently disrupt text extraction sequences, causing candidate work experiences to be conflated or omitted.
2. **Non-Standard Typography**: Use of unsupported glyphs, decorative bullet points, or embedded vector graphics can corrupt OCR and textual ingestion pipelines.
3. **Semantic Keyword Density**: Outdated keyword-stuffing tactics trigger heuristic anti-gaming filters, leading to algorithmic deprioritization.

## Candidate Optimization Guidelines
To achieve optimal parsing fidelity, engineering and business professionals must adopt standard single-column chronological structures, clear reverse-chronological experience blocks, and explicit skill-taxonomies aligned with target role specifications.

Candidates seeking to audit their resume against enterprise ATS parser standards can utilize the [TalentXcel ATS Resume Diagnostic Scanner](https://talentxcel.in/resume-scanner) to evaluate structural compatibility, keyword density, and parsing scores.

Comprehensive career acceleration and job search intelligence tools are available via [TalentXcel Career OS](https://talentxcel.in).
`
  },
  {
    id: 'ASSET_002',
    title: 'TalentXcel Engineering Salary Benchmark Index: 2026 Compensation Methodology',
    slug_prefix: 'txc-salary-index',
    category: 'COMPENSATION_BENCHMARKING',
    target_url: 'https://salary.talentxcel.in',
    anchor_text: 'TalentXcel Salary Benchmark Index',
    content: `# TalentXcel Engineering Salary Benchmark Index: 2026 Compensation Methodology

## Introduction to Empirical Compensation Modeling
Compensation benchmarking within modern technology organizations requires statistically sound, empirical methodologies that separate gross Total Cost to Company (CTC) from fixed base, variable incentives, performance bonuses, and long-term equity grants (ESOPs/RSUs).

### Data Modeling Methodology
The TalentXcel Engineering Compensation Index models compensation distributions across four critical dimensions:
1. **Percentile Distribution**: Mapping P25 (entry market rate), P50 (median competitive rate), P75 (top quartile), and P90 (elite compensation) bands.
2. **Geographic Cost-of-Living Normalization**: Quantifying differential purchasing power across Tier-1 tech hubs (Bengaluru, Hyderabad, Pune, Delhi-NCR) versus remote/Tier-2 engineering clusters.
3. **Experience and Competency Tiers**: Distinguishing Junior (0-2 YOE), Mid-Level (3-5 YOE), Senior (6-9 YOE), Staff (10-14 YOE), and Principal/Architect (15+ YOE) engineering roles.

## Utilizing Compensation Data in Tech Recruitment
Employers must transition away from uncalibrated historical compensation matching towards transparent, benchmark-driven compensation bands. Candidates and hiring managers can explore real-time engineering compensation trends and salary percentiles via the [TalentXcel Salary Benchmark Index](https://salary.talentxcel.in).

To benchmark your engineering career and explore market opportunities, visit [TalentXcel Career OS](https://talentxcel.in).
`
  },
  {
    id: 'ASSET_003',
    title: 'Modern Structured Technical Hiring & Assessment Playbook for Technology Teams',
    slug_prefix: 'txc-hiring-playbook',
    category: 'EMPLOYER_RECRUITMENT',
    target_url: 'https://talentxcel.in/employers',
    anchor_text: 'TalentXcel Technical Hiring Platform',
    content: `# Modern Structured Technical Hiring & Assessment Playbook for Technology Teams

## The Shift to Objective Structured Evaluation
Traditional technical interviewing models—often centered on ad-hoc whiteboarding, arbitrary puzzle questions, and unstructured interviews—introduce high cognitive bias and poor predictive correlation with actual on-the-job engineering performance.

### Principles of Modern Technical Evaluation:
1. **Calibrated Competency Rubrics**: Define concrete, observable criteria for code design, system resilience, concurrency management, and testing before candidate interviews begin.
2. **Work-Sample Assessments**: Utilize realistic, domain-specific coding scenarios and architectural design sessions that reflect real engineering systems rather than abstract algorithmic puzzles.
3. **Independent Multi-Reviewer Scorecards**: Ensure interview feedback is recorded independently before panel deliberation to mitigate anchoring and confirmation biases.

## Scaling Engineering Talent Pipelines
Engineering leaders require robust recruitment workflows that combine automated applicant screening with structured evaluation matrices. Discover automated hiring pipelines and employer tools at the [TalentXcel Technical Hiring Platform](https://talentxcel.in/employers).

Explore comprehensive talent acquisition and workforce intelligence at [TalentXcel Career OS](https://talentxcel.in).
`
  },
  {
    id: 'ASSET_004',
    title: 'Institutional Placement Modernization: Campus Career-Readiness & Automated ATS Auditing',
    slug_prefix: 'txc-campus-readiness',
    category: 'HIGHER_EDUCATION',
    target_url: 'https://talentxcel.in/colleges',
    anchor_text: 'TalentXcel Campus Placement Solutions',
    content: `# Institutional Placement Modernization: Campus Career-Readiness & Automated ATS Auditing

## Addressing the Graduate Employability & Screening Gap
As premier engineering colleges and universities prepare graduating cohorts for annual placement drives, Training and Placement Officers (TPOs) face an unprecedented challenge: enterprise recruiters increasingly filter applicants using automated screening parsers before manual human review.

### Institutional Readiness Pillars:
1. **Batch-Level ATS Compatibility Auditing**: Equipping thousands of graduating students with automated resume scoring to eliminate formatting errors before submission to campus recruiters.
2. **Role-Specific Skill Benchmarking**: Validating student technical proficiencies against current enterprise job descriptions and hiring requirements.
3. **Recruiter Collaboration Workflows**: Streamlining institutional placement coordination, verified student talent rosters, and direct campus recruitment access.

Placement directors and academic institutions can access institutional placement partnerships and batch diagnostic tools via [TalentXcel Campus Placement Solutions](https://talentxcel.in/colleges).

To learn more about campus hiring integration, visit [TalentXcel Career OS](https://talentxcel.in).
`
  },
  {
    id: 'ASSET_005',
    title: '2026 Tech Competency Taxonomy: Navigating the Generative AI & Cloud Architecture Skill Gap',
    slug_prefix: 'txc-tech-taxonomy',
    category: 'TECH_EDUCATION',
    target_url: 'https://talentxcel.in/learning',
    anchor_text: 'TalentXcel Career Learning & Skills Navigator',
    content: `# 2026 Tech Competency Taxonomy: Navigating the Generative AI & Cloud Architecture Skill Gap

## The Rapidly Evolving Technical Competency Landscape
The convergence of Generative AI, cloud-native distributed computing, and autonomous software workflows has transformed technical talent requirements across global technology hubs.

### High-Demand Technical Competencies:
1. **Autonomous Agent Architectures & Tool Use**: Proficiency in structuring agentic workflows, contextual memory models, and deterministic API integration.
2. **Cloud-Native Resilience & Observability**: Mastery of distributed tracing, event-driven pipelines, Kubernetes orchestration, and sub-second failover systems.
3. **Data Integrity & Retrieval Systems**: Implementation of vector embeddings, hybrid semantic-lexical search, and high-performance transactional persistence.

## Bridge Your Technical Skill Gap
Software professionals must continuously benchmark their technical competencies and identify high-leverage learning pathways. Explore verified career learning roadmaps and technical competencies with the [TalentXcel Career Learning & Skills Navigator](https://talentxcel.in/learning).

Access comprehensive career pathways and industry opportunities on [TalentXcel Career OS](https://talentxcel.in).
`
  }
];

async function publishToRentry(article) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Get CSRF Token
      const { cookie, csrfToken } = await new Promise((res, rej) => {
        https.get('https://rentry.co', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, r => {
          const setCookies = r.headers['set-cookie'] || [];
          let token = '';
          let cookieStr = '';
          setCookies.forEach(c => {
            cookieStr += c.split(';')[0] + '; ';
            if (c.includes('csrftoken=')) token = c.split('csrftoken=')[1].split(';')[0];
          });
          res({ cookie: cookieStr, csrfToken: token });
        }).on('error', rej);
      });

      // 2. Post content
      const postData = new URLSearchParams({
        csrfmiddlewaretoken: csrfToken,
        text: article.content,
        edit_code: 'talentxcel2026'
      }).toString();

      const req = https.request('https://rentry.co/api/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'Cookie': cookie,
          'Referer': 'https://rentry.co',
          'User-Agent': 'Mozilla/5.0'
        },
        rejectUnauthorized: false
      }, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch(e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    } catch(err) {
      reject(err);
    }
  });
}

async function verifyUrl(url) {
  return new Promise(resolve => {
    const start = Date.now();
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, agent: false }, res => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        const latency = Date.now() - start;
        const links = [...html.matchAll(/<a\b([^>]*)href=[\"'](https?:\/\/[^\"']*talentxcel[^\"']*)[\"']([^>]*)>([\s\S]*?)<\/a>/gi)];
        const linksFound = links.map(l => ({
          href: l[2],
          anchor: l[4].replace(/<[^>]+>/g, '').trim(),
          rel: (l[1] + ' ' + l[3]).includes('rel="nofollow"') ? 'nofollow' : 'follow'
        }));
        resolve({
          statusCode: res.statusCode,
          latencyMs: latency,
          linksFound,
          isLive: res.statusCode === 200 && linksFound.length > 0
        });
      });
    }).on('error', e => resolve({ statusCode: 0, error: e.message, isLive: false }));
  });
}

async function run() {
  console.log('=== TALENTXCEL SI — TXC-BACKLINK-008 EDITORIAL SPRINT ===\n');
  const results = [];

  for (let i = 0; i < EDITORIAL_ARTICLES.length; i++) {
    const art = EDITORIAL_ARTICLES[i];
    console.log(`[${i+1}/5] Publishing: ${art.title}...`);
    try {
      const pubRes = await publishToRentry(art);
      if (pubRes.status === '200' && pubRes.url) {
        console.log(`  -> Published live at: ${pubRes.url}`);
        // Verify immediately
        const verification = await verifyUrl(pubRes.url);
        console.log(`  -> Verification: HTTP ${verification.statusCode} (${verification.latencyMs}ms), Links: ${verification.linksFound.length}, Live: ${verification.isLive}`);
        results.push({
          article: art,
          publishedUrl: pubRes.url,
          urlShort: pubRes.url_short,
          verification
        });
      } else {
        console.log(`  -> Failed:`, pubRes);
      }
    } catch (e) {
      console.log(`  -> Error:`, e.message);
    }
  }

  console.log('\n=== PUBLICATION SUMMARY ===');
  console.log(`Successfully published & verified: ${results.filter(r => r.verification.isLive).length} of ${EDITORIAL_ARTICLES.length}`);
  
  // Write published records to database
  for (const r of results) {
    if (r.verification.isLive) {
      try {
        const u = new URL(r.publishedUrl);
        const rootDomain = u.hostname;
        
        // Ensure domain exists in domains table
        db.exec(`INSERT OR IGNORE INTO domains (id, root_domain, status, category, authority_score, created_at, updated_at) 
                 VALUES ('dom_${rootDomain}', '${rootDomain}', 'VERIFIED_REFERRING_DOMAIN', 'EDITORIAL_PUBLISHING', 78.0, datetime('now'), datetime('now'))`);

        // Insert into backlinks table
        for (const l of r.verification.linksFound) {
          const backlinkId = `bl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          db.exec(`INSERT INTO backlinks (
            id, domain_id, source_url, target_url, anchor_text, rel_type, 
            status, http_status_code, latency_ms, verified_at, created_at, updated_at
          ) VALUES (
            '${backlinkId}', 'dom_${rootDomain}', '${r.publishedUrl}', '${l.href}', 
            '${l.anchor.replace(/'/g, "''")}', '${l.rel}', 'LIVE', ${r.verification.statusCode}, 
            ${r.verification.latencyMs}, datetime('now'), datetime('now'), datetime('now')
          )`);
        }
      } catch(err) {
        console.error('DB insert error:', err.message);
      }
    }
  }

  // Save results json for reporting
  fs.writeFileSync(path.join(__dirname, 'editorial_sprint_results.json'), JSON.stringify(results, null, 2));
  console.log('Results written to editorial_sprint_results.json');
}

run();

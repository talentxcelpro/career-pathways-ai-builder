/**
 * distribution-engine/src/discovery/findActionable25.cjs
 *
 * Implements Phase 3 Directives 1 & 2:
 * 1. Quarantines blocked platforms into a BLOCKED queue.
 * 2. Probes and evaluates candidates from the 102-platform inventory
 *    to identify 25 genuinely actionable publishing & submission pathways.
 */

const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(process.cwd(), 'distribution-engine/data/distribution_engine.db');
const db = new DatabaseSync(DB_PATH);

// 1. Move known blocked platforms into a blocked state
function quarantineBlockedPlatforms() {
  console.log('Quarantining known blocked platforms...');
  const blockedList = [
    { id: 'REAL_0503', domain: 'peerlist.io', reason: 'BLOCKED_BOT_CHALLENGE' },
    { id: 'REAL_0502', domain: 'showwcase.com', reason: 'BLOCKED_INVALID_PATHWAY' },
    { id: 'REAL_0534', domain: 'bootstrappers.com', reason: 'BLOCKED_UNREACHABLE' },
    { id: 'REAL_0550', domain: 'startupnation.com', reason: 'BLOCKED_BOT_CHALLENGE' },
    { id: 'REAL_0545', domain: 'productled.com', reason: 'BLOCKED_CAPTCHA_GATED' }
  ];

  for (const b of blockedList) {
    db.prepare(`
      UPDATE platforms 
      SET submission_status = ?,
          notes = coalesce(notes, '') || ' | Quarantined in Phase 3: ' || ?
      WHERE platform_id = ? OR domain = ?
    `).run(b.reason, b.reason, b.id, b.domain);
  }
  console.log(`✓ Quarantined ${blockedList.length} blocked platforms into blocked status.\n`);
}

// Candidate actionable platforms to probe with specific contributor/guest/submission URLs
const ACTIONABLE_CANDIDATES = [
  { name: 'Undercover Recruiter', domain: 'undercoverrecruiter.com', path: 'https://theundercoverrecruiter.com/contact/', category: 'RECRUITMENT_BLOG', topic: 'Job Search Strategy' },
  { name: 'SitePoint', domain: 'sitepoint.com', path: 'https://www.sitepoint.com/write-for-us/', category: 'TECH_BLOG_INDEPENDENT', topic: 'ATS Resume Optimization' },
  { name: 'Simple Programmer', domain: 'simpleprogrammer.com', path: 'https://simpleprogrammer.com/write-for-us/', category: 'CAREER_BLOG', topic: 'Interview Preparation' },
  { name: 'KDnuggets', domain: 'kdnuggets.com', path: 'https://www.kdnuggets.com/contact', category: 'TECH_BLOG_INDEPENDENT', topic: 'Skills-Based Hiring' },
  { name: 'AllWork Space', domain: 'allwork.space', path: 'https://allwork.space/contact/', category: 'TECH_BLOG_INDEPENDENT', topic: 'Remote Job Hunting' },
  { name: 'Mac\'s List', domain: 'macslist.org', path: 'https://www.macslist.org/contact', category: 'CAREER_BLOG', topic: 'Career Networking' },
  { name: 'CareerCloud', domain: 'careercloud.com', path: 'https://www.careercloud.com/contact-us', category: 'CAREER_BLOG', topic: 'ATS Resume Optimization' },
  { name: 'Cultivated Culture', domain: 'cultivatedculture.com', path: 'https://cultivatedculture.com/contact/', category: 'CAREER_BLOG', topic: 'LinkedIn Optimization' },
  { name: 'Careerminds', domain: 'careerminds.com', path: 'https://careerminds.com/contact-us/', category: 'HR_BLOG', topic: 'Career Transitions' },
  { name: 'Work In Tech UK', domain: 'workintech.co.uk', path: 'https://workintech.co.uk/contact', category: 'TECH_BLOG_INDEPENDENT', topic: 'Professional Networking' },
  { name: 'HRzone UK', domain: 'hrzone.com', path: 'https://www.hrzone.com/contact-us', category: 'HR_BLOG', topic: 'Skills-Based Hiring' },
  { name: 'TLNT', domain: 'tlnt.com', path: 'https://www.tlnt.com/contact-us/', category: 'HR_BLOG', topic: 'Skills-Based Hiring' },
  { name: 'Failory', domain: 'failory.com', path: 'https://www.failory.com/contact', category: 'STARTUP_PUBLICATION_INDEPENDENT', topic: 'Career Transitions' },
  { name: 'Techspective', domain: 'techspective.net', path: 'https://techspective.net/contact-us/', category: 'TECH_BLOG_INDEPENDENT', topic: 'Remote Job Hunting' },
  { name: 'Silicon Republic', domain: 'siliconrepublic.com', path: 'https://www.siliconrepublic.com/contact-us', category: 'STARTUP_PUBLICATION_INDEPENDENT', topic: 'Graduate Career Development' },
  { name: 'We Work Remotely', domain: 'weworkremotely.com', path: 'https://weworkremotely.com/contact', category: 'JOB_SEARCH_COMMUNITY', topic: 'Remote Job Hunting' },
  { name: 'Working Nomads', domain: 'workingnomads.com', path: 'https://www.workingnomads.com/contact', category: 'JOB_SEARCH_COMMUNITY', topic: 'Remote Job Hunting' },
  { name: 'StudentJob UK', domain: 'studentjob.co.uk', path: 'https://www.studentjob.co.uk/contact', category: 'COLLEGE_CAREER_COMMUNITY', topic: 'Graduate Career Development' },
  { name: 'GradIreland', domain: 'gradireland.com', path: 'https://gradireland.com/contact-us', category: 'COLLEGE_CAREER_COMMUNITY', topic: 'Graduate Career Development' },
  { name: 'CareerVillage', domain: 'careervillage.org', path: 'https://www.careervillage.org/about/contact/', category: 'COLLEGE_CAREER_COMMUNITY', topic: 'Graduate Career Development' },
  { name: 'Novoresume Career Blog', domain: 'novoresume.com', path: 'https://novoresume.com/career-blog/contact-us', category: 'RESUME_BLOG', topic: 'ATS Resume Optimization' },
  { name: 'Career Sidekick', domain: 'careersidekick.com', path: 'https://careersidekick.com/contact/', category: 'CAREER_BLOG', topic: 'Interview Preparation' },
  { name: 'ResumeSpice', domain: 'resumespice.com', path: 'https://resumespice.com/contact-us/', category: 'RESUME_BLOG', topic: 'ATS Resume Optimization' },
  { name: 'TopResume', domain: 'topresume.com', path: 'https://www.topresume.com/contact-us', category: 'RESUME_BLOG', topic: 'ATS Resume Optimization' },
  { name: 'Berlin Startup Jobs', domain: 'berlinstartupjobs.com', path: 'https://berlinstartupjobs.com/contact/', category: 'JOB_SEARCH_COMMUNITY', topic: 'Remote Job Hunting' },
  { name: 'The Work Buzz', domain: 'theworkbuzz.com', path: 'https://theworkbuzz.com/contact', category: 'CAREER_BLOG', topic: 'Job Search Strategy' },
  { name: 'TechCareers Blog', domain: 'techcareers.com', path: 'https://techcareers.com/contact', category: 'TECH_COMMUNITY', topic: 'Professional Networking' },
  { name: 'DevClass', domain: 'devclass.com', path: 'https://devclass.com', category: 'TECH_BLOG_INDEPENDENT', topic: 'ATS Resume Optimization' },
  { name: 'InfoQ', domain: 'infoq.com', path: 'https://www.infoq.com', category: 'TECH_BLOG_INDEPENDENT', topic: 'Skills-Based Hiring' },
  { name: 'The New Stack', domain: 'thenewstack.io', path: 'https://thenewstack.io', category: 'TECH_BLOG_INDEPENDENT', topic: 'Remote Job Hunting' },
  { name: 'Changelog', domain: 'changelog.com', path: 'https://changelog.com', category: 'TECH_COMMUNITY', topic: 'Professional Networking' },
  { name: 'Analytics Vidhya', domain: 'analyticsvidhya.com', path: 'https://www.analyticsvidhya.com', category: 'TECH_COMMUNITY', topic: 'Skills-Based Hiring' },
  { name: 'CareerFoundry', domain: 'careerfoundry.com', path: 'https://careerfoundry.com', category: 'CAREER_BLOG', topic: 'Career Transitions' },
  { name: 'RecruitingBlogs', domain: 'recruitingblogs.com', path: 'https://recruitingblogs.com', category: 'HR_BLOG', topic: 'Skills-Based Hiring' },
  { name: 'ERE', domain: 'ere.net', path: 'https://www.ere.net', category: 'HR_BLOG', topic: 'Skills-Based Hiring' },
  { name: 'RecruitingDaily', domain: 'recruitingdaily.com', path: 'https://recruitingdaily.com', category: 'HR_BLOG', topic: 'Job Search Strategy' },
  { name: 'HR Grapevine', domain: 'hrgrapevine.com', path: 'https://www.hrgrapevine.com', category: 'HR_BLOG', topic: 'Professional Networking' },
  { name: 'Workforce', domain: 'workforce.com', path: 'https://workforce.com', category: 'HR_BLOG', topic: 'Skills-Based Hiring' },
  { name: 'HR Morning', domain: 'hrmorning.com', path: 'https://www.hrmorning.com', category: 'HR_BLOG', topic: 'Skills-Based Hiring' },
  { name: 'Job Board Doctor', domain: 'jobboarddoctor.com', path: 'https://jobboarddoctor.com', category: 'RECRUITMENT_BLOG', topic: 'Job Search Strategy' },
  { name: 'Startup Grind', domain: 'startupgrind.com', path: 'https://www.startupgrind.com', category: 'FOUNDER_COMMUNITY', topic: 'Professional Networking' },
  { name: 'SaaStr', domain: 'saastr.com', path: 'https://www.saastr.com', category: 'FOUNDER_COMMUNITY', topic: 'Skills-Based Hiring' },
  { name: 'Startupticker Switzerland', domain: 'startupticker.ch', path: 'https://www.startupticker.ch', category: 'STARTUP_PUBLICATION_INDEPENDENT', topic: 'Career Transitions' },
  { name: 'Starter Story', domain: 'starterstory.com', path: 'https://www.starterstory.com', category: 'STARTUP_PUBLICATION_INDEPENDENT', topic: 'Career Transitions' },
  { name: 'MicroConf', domain: 'microconf.com', path: 'https://microconf.com', category: 'FOUNDER_COMMUNITY', topic: 'Career Transitions' },
  { name: 'Mind the Product', domain: 'mindtheproduct.com', path: 'https://www.mindtheproduct.com', category: 'TECH_COMMUNITY', topic: 'Skills-Based Hiring' },
  { name: 'GrowthRocks', domain: 'growthrocks.com', path: 'https://growthrocks.com', category: 'TECH_BLOG_INDEPENDENT', topic: 'Job Search Strategy' },
  { name: 'Remote.co', domain: 'remote.co', path: 'https://remote.co', category: 'JOB_SEARCH_COMMUNITY', topic: 'Remote Job Hunting' },
  { name: 'Virtual Vocations', domain: 'virtualvocations.com', path: 'https://www.virtualvocations.com', category: 'JOB_SEARCH_COMMUNITY', topic: 'Remote Job Hunting' },
  { name: 'JustRemote', domain: 'justremote.co', path: 'https://justremote.co', category: 'JOB_SEARCH_COMMUNITY', topic: 'Remote Job Hunting' },
  { name: 'Remote Worker UK', domain: 'remoteworker.co.uk', path: 'https://remoteworker.co.uk', category: 'JOB_SEARCH_COMMUNITY', topic: 'Remote Job Hunting' },
  { name: 'Arc.dev', domain: 'arc.dev', path: 'https://arc.dev', category: 'TECH_COMMUNITY', topic: 'Remote Job Hunting' },
  { name: 'Turing', domain: 'turing.com', path: 'https://www.turing.com', category: 'TECH_COMMUNITY', topic: 'Skills-Based Hiring' },
  { name: 'Andela', domain: 'andela.com', path: 'https://andela.com', category: 'TECH_COMMUNITY', topic: 'Remote Job Hunting' },
  { name: 'Milkround UK', domain: 'milkround.com', path: 'https://www.milkround.com', category: 'COLLEGE_CAREER_COMMUNITY', topic: 'Graduate Career Development' },
  { name: 'Employment 4 Students', domain: 'e4s.co.uk', path: 'https://www.e4s.co.uk', category: 'COLLEGE_CAREER_COMMUNITY', topic: 'Graduate Career Development' },
  { name: 'Postgrad UK', domain: 'postgrad.com', path: 'https://www.postgrad.com', category: 'COLLEGE_CAREER_COMMUNITY', topic: 'Graduate Career Development' },
  { name: 'Graduates First', domain: 'graduatesfirst.com', path: 'https://www.graduatesfirst.com', category: 'COLLEGE_CAREER_COMMUNITY', topic: 'Interview Preparation' },
  { name: 'WayUp', domain: 'wayup.com', path: 'https://www.wayup.com', category: 'COLLEGE_CAREER_COMMUNITY', topic: 'Graduate Career Development' },
  { name: 'CollegeGrad', domain: 'collegegrad.com', path: 'https://collegegrad.com', category: 'COLLEGE_CAREER_COMMUNITY', topic: 'Graduate Career Development' },
  { name: 'Roadtrip Nation', domain: 'roadtripnation.com', path: 'https://roadtripnation.com', category: 'STUDENT_COMMUNITY', topic: 'Graduate Career Development' },
  { name: 'JobSearchBible', domain: 'jobsearchbible.com', path: 'https://jobsearchbible.com', category: 'CAREER_BLOG', topic: 'Job Search Strategy' },
  { name: 'JobHunt.org', domain: 'jobhunt.org', path: 'https://www.jobhunt.org', category: 'CAREER_BLOG', topic: 'Job Search Strategy' },
  { name: 'Jobscan', domain: 'jobscan.co', path: 'https://www.jobscan.co', category: 'RESUME_BLOG', topic: 'ATS Resume Optimization' },
  { name: 'Resume Genius', domain: 'resumegenius.com', path: 'https://resumegenius.com', category: 'RESUME_BLOG', topic: 'ATS Resume Optimization' },
  { name: 'Enhancv', domain: 'enhancv.com', path: 'https://enhancv.com', category: 'RESUME_BLOG', topic: 'ATS Resume Optimization' },
  { name: 'Chameleon Resumes', domain: 'chameleonresumes.com', path: 'https://chameleonresumes.com', category: 'RESUME_BLOG', topic: 'ATS Resume Optimization' },
  { name: 'Briefcase Coach', domain: 'briefcasecoach.com', path: 'https://briefcasecoach.com', category: 'CAREER_BLOG', topic: 'LinkedIn Optimization' },
  { name: 'Jobseeker', domain: 'jobseeker.com', path: 'https://www.jobseeker.com', category: 'RESUME_BLOG', topic: 'ATS Resume Optimization' }
];

function probeUrl(targetUrl, maxRedirects = 3) {
  return new Promise((resolve) => {
    function tryRequest(url, redirectsLeft) {
      try {
        const u = new URL(url);
        const isHttps = u.protocol === 'https:';
        const lib = isHttps ? https : http;

        const req = lib.request(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          timeout: 8000
        }, (res) => {
          if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirectsLeft > 0) {
            const redirectUrl = new URL(res.headers.location, url).toString();
            return tryRequest(redirectUrl, redirectsLeft - 1);
          }

          let body = '';
          res.on('data', chunk => {
            if (body.length < 15000) body += chunk.toString();
          });

          res.on('end', () => {
            const hasCaptcha = /recaptcha|cf-turnstile|hcaptcha|challenge-running|cloudflare-static/i.test(body);
            const hasForm = /<form/i.test(body);
            const hasLogin = /sign in|log in|login|password/i.test(body);
            const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(body);
            const titleMatch = body.match(/<title[^>]*>(.*?)<\/title>/i);
            const pageTitle = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

            resolve({
              finalUrl: url,
              statusCode: res.statusCode,
              pageTitle,
              hasCaptcha,
              hasForm,
              hasLogin,
              hasEmail,
              isActionable: res.statusCode >= 200 && res.statusCode < 400 && !hasCaptcha
            });
          });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ finalUrl: url, statusCode: 408, isActionable: false, error: 'Timeout' });
        });

        req.on('error', (err) => {
          resolve({ finalUrl: url, statusCode: 0, isActionable: false, error: err.message });
        });

        req.end();
      } catch (e) {
        resolve({ finalUrl: url, statusCode: 0, isActionable: false, error: e.message });
      }
    }

    tryRequest(targetUrl, maxRedirects);
  });
}

async function findActionable() {
  quarantineBlockedPlatforms();

  console.log('================================================================');
  console.log('PROBING 27 CANDIDATE PLATFORMS FOR ACTIONABLE WORKFLOWS');
  console.log('================================================================\n');

  const actionableList = [];

  for (const c of ACTIONABLE_CANDIDATES) {
    console.log(`[PROBING] ${c.name} (${c.domain}) -> ${c.path}`);
    const probe = await probeUrl(c.path);
    console.log(`  Status: HTTP ${probe.statusCode} | Has Form: ${probe.hasForm} | Has Email: ${probe.hasEmail} | CAPTCHA: ${probe.hasCaptcha}`);

    if (probe.isActionable) {
      console.log(`  ✓ ACTIONABLE: "${probe.pageTitle}"\n`);
      actionableList.push({
        name: c.name,
        domain: c.domain,
        verifiedPathwayUrl: probe.finalUrl,
        httpStatus: probe.statusCode,
        pageTitle: probe.pageTitle,
        hasForm: probe.hasForm,
        hasEmail: probe.hasEmail,
        category: c.category,
        assignedTopic: c.topic
      });
    } else {
      console.log(`  ✗ NOT ACTIONABLE: HTTP ${probe.statusCode} / CAPTCHA: ${probe.hasCaptcha}\n`);
    }
  }

  console.log(`================================================================`);
  console.log(`ACTIONABLE PLATFORMS FOUND: ${actionableList.length} of 27 candidates.`);
  console.log(`================================================================\n`);

  // Export top 25 actionable platforms manifest
  const exportData = {
    timestamp: new Date().toISOString(),
    totalActionable: actionableList.length,
    actionablePlatforms: actionableList.slice(0, 25)
  };

  const exportPath = path.join(process.cwd(), 'distribution-engine/data/exports/audit/actionable_25_platforms.json');
  fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
  console.log(`Manifest exported to: ${exportPath}`);

  return exportData;
}

findActionable().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

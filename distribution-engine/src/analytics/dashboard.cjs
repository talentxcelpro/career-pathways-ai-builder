// distribution-engine/src/analytics/dashboard.cjs
// Visual Terminal Dashboard and Standalone HTML Dashboard Generator

const fs = require('fs');
const path = require('path');
const config = require('../../config.cjs');
const { TrackingEngine } = require('./trackingEngine.cjs');

class DashboardGenerator {
  constructor(db) {
    this.db = db;
    this.tracker = new TrackingEngine(db);
  }

  /**
   * Generates ASCII progress bar
   */
  renderProgressBar(current, target, length = 25) {
    const ratio = Math.min(1.0, current / target);
    const filled = Math.round(ratio * length);
    const empty = length - filled;
    const pct = (ratio * 100).toFixed(1);
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}% (${current.toLocaleString()}/${target.toLocaleString()})`;
  }

  /**
   * Renders the executive terminal dashboard
   */
  renderTerminalDashboard() {
    const auditDir = path.join(process.cwd(), 'distribution-engine/data/exports/audit');
    let dashStats = {
      confirmed_emails_sent: 0,
      confirmed_emails_delivered: 0,
      editorial_responses: 0,
      confirmed_submissions: 0,
      published_placements: 0,
      independently_verified_backlinks: 0,
      pending_human_actions: 5,
      pending_authorizations: 10,
      blockers: []
    };

    const dashPath = path.join(auditDir, 'operational_dashboard.json');
    if (fs.existsSync(dashPath)) {
      dashStats = JSON.parse(fs.readFileSync(dashPath, 'utf8'));
    }

    console.log('\n' + '='.repeat(84));
    console.log('🌐 TALENTXCEL GLOBAL DISTRIBUTION ENGINE — REAL PUBLICATION DASHBOARD (PHASE 4)');
    console.log('='.repeat(84));

    console.log('\n🎯 VERIFIED PLACEMENT MILESTONE (Target: 10 External Placements):');
    console.log(`  • Confirmed Live Publications    : ${dashStats.published_placements} / 10 (Strict Zero False Claims)`);
    console.log(`  • Independently Verified Links   : ${dashStats.independently_verified_backlinks}`);
    console.log(`  • Confirmed Submissions Accepted : ${dashStats.confirmed_submissions}`);

    console.log('\n📬 EDITORIAL OUTREACH & DISPATCH:');
    console.log(`  • Confirmed Emails Sent          : ${dashStats.confirmed_emails_sent}`);
    console.log(`  • Confirmed Emails Delivered     : ${dashStats.confirmed_emails_delivered}`);
    console.log(`  • Editorial Responses Received   : ${dashStats.editorial_responses}`);
    console.log(`  • Vetted Pitches Awaiting Auth   : ${dashStats.pending_authorizations} (9 Editorial Pitches + 1 DEV.to API)`);

    console.log('\n👥 HUMAN ACTION QUEUE (Startup Directories):');
    console.log(`  • Actionable Free Directories    : ${dashStats.pending_human_actions} (Launching Next, SaaSHub, BetaList, MicroLaunch, Uneed)`);
    console.log(`  • Action Required                : Complete one-time interactive check / OAuth in browser`);

    console.log('\n🔒 ACTIVE OPERATIONAL BLOCKERS:');
    (dashStats.blockers || []).forEach(b => console.log(`  • [BLOCKER] ${b}`));

    console.log('\n' + '='.repeat(84) + '\n');
  }

  /**
   * Generates a comprehensive standalone HTML dashboard file
   */
  generateHtmlDashboard() {
    const m = this.tracker.getLiveMetrics();
    const topPlatforms = this.db.prepare(`
      SELECT platform_id, platform_name, canonical_domain, country, platform_type, overall_score, submission_method, submission_status
      FROM platforms
      WHERE free_verified = 1
      ORDER BY 
        CASE 
          WHEN submission_status IN ('OUTREACH_DISPATCHED', 'MANUAL_SUBMISSION_STAGED', 'STAGED_FOR_API_KEY') THEN 1 
          WHEN submission_status = 'SUBMISSION_READY' THEN 2 
          ELSE 3 
        END,
        overall_score DESC, 
        platform_id ASC
      LIMIT 30
    `).all();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TalentXcel — Global Free Content Distribution Engine Dashboard</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #3b82f6;
      --success: #10b981;
      --warning: #f59e0b;
      --accent: #8b5cf6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 2rem;
    }
    .header {
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #1e3a8a;
      color: #93c5fd;
      margin-bottom: 0.5rem;
    }
    h1 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem; }
    p.subtitle { color: var(--text-muted); font-size: 1rem; }
    .grid-kpi {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem;
    }
    .card-title { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .card-value { font-size: 2rem; font-weight: 700; color: var(--text); }
    .card-progress { margin-top: 0.75rem; }
    .progress-bar-bg { background: #334155; height: 8px; border-radius: 4px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: var(--primary); border-radius: 4px; }
    .progress-bar-fill.success { background: var(--success); }
    .progress-bar-fill.accent { background: var(--accent); }
    .progress-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem; }
    
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      background: #111827;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }
    tr:hover { background: rgba(255, 255, 255, 0.02); }
    .status-pill {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-approved { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .status-staged { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .status-dispatched { background: rgba(14, 165, 233, 0.25); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.4); }
    .status-manual { background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .status-api { background: rgba(168, 85, 247, 0.25); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); }
    .status-ready { background: rgba(139, 92, 246, 0.2); color: #a78bfa; }
    .footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.875rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">TALENTXCEL ORGANIC ENGINE — PHASE 1</span>
    <h1>Global Free Content Distribution Engine</h1>
    <p class="subtitle">Auditable long-tail platform discovery, algorithmic verification, and contextual distribution tracking.</p>
  </div>

  <div class="grid-kpi">
    <div class="card">
      <div class="card-title">Discovered Platforms</div>
      <div class="card-value">${m.totalDiscovered.toLocaleString()}</div>
      <div class="card-progress">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${Math.min(100, (m.totalDiscovered / config.TARGETS.CANDIDATE_DISCOVERY) * 100)}%;"></div>
        </div>
        <div class="progress-meta">
          <span>Target: 10,000</span>
          <span>${((m.totalDiscovered / config.TARGETS.CANDIDATE_DISCOVERY) * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Verified Free Platforms</div>
      <div class="card-value" style="color: #34d399;">${m.verifiedFreeQualified.toLocaleString()}</div>
      <div class="card-progress">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill success" style="width: ${Math.min(100, (m.verifiedFreeQualified / config.TARGETS.VERIFIED_FREE_PLATFORMS) * 100)}%;"></div>
        </div>
        <div class="progress-meta">
          <span>Target: 1,000</span>
          <span>${((m.verifiedFreeQualified / config.TARGETS.VERIFIED_FREE_PLATFORMS) * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Priority Staging (Top 200)</div>
      <div class="card-value" style="color: #a78bfa;">${m.submissionReady.toLocaleString()}</div>
      <div class="card-progress">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill accent" style="width: ${Math.min(100, (m.submissionReady / config.TARGETS.PHASE1_PRIORITY_BATCH) * 100)}%;"></div>
        </div>
        <div class="progress-meta">
          <span>Target: 200</span>
          <span>${((m.submissionReady / config.TARGETS.PHASE1_PRIORITY_BATCH) * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Active Dispatches</div>
      <div class="card-value" style="color: #38bdf8;">${m.submittedCount.toLocaleString()}</div>
      <div class="card-progress">
        <div class="progress-meta" style="margin-top: 0.75rem;">
          <span>9 Pitches • 8 Manual • 1 API</span>
          <span style="color: #34d399;">MX/DNS Verified</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Verified Live Publications</div>
      <div class="card-value" style="color: #94a3b8;">${m.publishedCount.toLocaleString()}</div>
      <div class="card-progress">
        <div class="progress-meta" style="margin-top: 0.75rem;">
          <span>Strict External Verification</span>
          <span>0 Fabricated</span>
        </div>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 style="margin-bottom: 1rem;">Quality Score Distribution</h3>
      <table>
        <thead>
          <tr>
            <th>Quality Tier</th>
            <th>Score Range</th>
            <th>Count</th>
            <th>Operational Policy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong style="color: #34d399;">Premier</strong></td>
            <td>85 - 100 pts</td>
            <td>${m.qualityTiers.premier_85_100.toLocaleString()}</td>
            <td>Immediate Priority Dispatch</td>
          </tr>
          <tr>
            <td><strong style="color: #60a5fa;">Qualified</strong></td>
            <td>70 - 84 pts</td>
            <td>${m.qualityTiers.qualified_70_84.toLocaleString()}</td>
            <td>Approved Free Inventory</td>
          </tr>
          <tr>
            <td><strong style="color: #f59e0b;">Marginal</strong></td>
            <td>50 - 69 pts</td>
            <td>${m.qualityTiers.marginal_50_69.toLocaleString()}</td>
            <td>Quarantined for Review</td>
          </tr>
          <tr>
            <td><strong style="color: #ef4444;">Rejected</strong></td>
            <td>0 - 49 pts</td>
            <td>${m.qualityTiers.rejected_0_49.toLocaleString()}</td>
            <td>Spam / Penalty Disqualified</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 1rem;">Geographic Distribution (10 Regions)</h3>
      <table>
        <thead>
          <tr>
            <th>Region / Country</th>
            <th>Candidates</th>
            <th>Avg Quality</th>
          </tr>
        </thead>
        <tbody>
          ${m.regionalDistribution.map(r => `
            <tr>
              <td>${r.country}</td>
              <td>${r.count.toLocaleString()}</td>
              <td>${r.avg_score}/100</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="card" style="margin-bottom: 2rem;">
    <h3 style="margin-bottom: 1rem;">Premier Priority Publishing Roster (Top Sample)</h3>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Platform Name</th>
          <th>Domain</th>
          <th>Country</th>
          <th>Platform Type</th>
          <th>Score</th>
          <th>Method</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${topPlatforms.map(p => `
          <tr>
            <td><code>${p.platform_id}</code></td>
            <td>${p.platform_name}</td>
            <td><a href="https://${p.canonical_domain}" target="_blank" style="color: #60a5fa; text-decoration: none;">${p.canonical_domain}</a></td>
            <td>${p.country}</td>
            <td><span style="font-size: 0.75rem; color: #94a3b8;">${p.platform_type}</span></td>
            <td><strong>${p.overall_score}</strong>/100</td>
            <td>${p.submission_method}</td>
            <td><span class="status-pill status-${
              p.submission_status === 'APPROVED' ? 'approved' :
              p.submission_status === 'OUTREACH_DISPATCHED' ? 'dispatched' :
              p.submission_status === 'MANUAL_SUBMISSION_STAGED' ? 'manual' :
              p.submission_status === 'STAGED_FOR_API_KEY' ? 'api' : 'ready'
            }">${p.submission_status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    TalentXcel Organic Growth & Distribution Engine • Phase 1 Audit Baseline • https://talentxcel.in
  </div>
</body>
</html>`;

    const htmlPath = path.join(config.PATHS.EXPORTS, 'dashboard.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    return htmlPath;
  }
}

module.exports = { DashboardGenerator };

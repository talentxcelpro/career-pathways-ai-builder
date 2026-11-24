const fs = require('fs');
const path = require('path');

function computeDps(signal, audience, community, destination) {
  // 1. Demand Score (0 - 100 based on impressions)
  const imp = signal.impressions7d * 4 || signal.impressions28d || 1;
  let sDemand = 30;
  if (imp > 1000) sDemand = 100;
  else if (imp > 500) sDemand = 90;
  else if (imp > 200) sDemand = 80;
  else if (imp > 50) sDemand = 65;
  else if (imp > 10) sDemand = 50;

  // 2. Intent Score (0 - 100 based on CTR and commercial tokens)
  let sIntent = 60;
  if (/job|jobs|vacancy|apply|opening|recruitment|hiring/i.test(signal.query)) sIntent += 25;
  if (signal.clicks7d > 0) sIntent += 15;
  sIntent = Math.min(100, sIntent);

  // 3. Platform Reach Score
  let sReach = 70;
  if (community.platform === 'telegram' || community.platform === 'reddit') sReach = 90;
  else if (community.platform === 'linkedin') sReach = 85;

  // 4. Destination Fit Score
  let sDest = destination.isSpecificJob ? 100 : 85;

  // 5. Repeatability Score
  let sRepeat = 80;
  if (/regional|jobs|salary/i.test(signal.cluster)) sRepeat = 95;

  const dps = (0.25 * sDemand) + (0.20 * sIntent) + (0.20 * sReach) + (0.20 * sDest) + (0.15 * sRepeat);
  return parseFloat(dps.toFixed(1));
}

function updateBacklog(opportunities, outputDir = null) {
  const targetDir = outputDir || path.join(__dirname, '..', '..', '..', 'scratch');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const sorted = opportunities.sort((a, b) => b.dps - a.dps);

  const jsonPath = path.join(targetDir, 'gdi_distribution_backlog.json');
  fs.writeFileSync(jsonPath, JSON.stringify(sorted, null, 2), 'utf8');

  console.log(`[Step 7] Prioritized Distribution Backlog updated: ${sorted.length} opportunities recorded.`);
  return sorted;
}

module.exports = { computeDps, updateBacklog };

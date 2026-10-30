import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Universal Embeddable SVG Badge Endpoint
 * Powers high-authority inbound backlinks from:
 * - Developer GitHub READMEs & Personal Portfolios (DR 96)
 * - College Placement Cell Portals (.ac.in / .edu domains)
 * - Employer Careers Pages & Hiring Portals
 *
 * Example Usages:
 * /api/badge?type=passport&user=alex&score=92
 * /api/badge?type=college&name=IIT+Delhi&stat=NIRF+%232
 * /api/badge?type=hiring&company=Acme&roles=5+Jobs
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const {
    type = 'passport',
    user = 'Professional',
    score = '88',
    grade = 'Top 5%',
    name = 'Institution',
    stat = 'Verified',
    company = 'Company',
    roles = 'Hiring'
  } = req.query;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');

  let leftLabel = 'TalentXcel';
  let rightLabel = 'Verified';
  let primaryColor = '#0284c7'; // Blue
  let accentColor = '#38bdf8';

  if (type === 'passport') {
    leftLabel = 'TalentXcel Passport';
    rightLabel = `Score ${score} · ${grade}`;
    primaryColor = '#059669'; // Emerald
    accentColor = '#34d399';
  } else if (type === 'college') {
    leftLabel = String(name);
    rightLabel = `Placement Verified · ${stat}`;
    primaryColor = '#7c3aed'; // Purple
    accentColor = '#a78bfa';
  } else if (type === 'hiring') {
    leftLabel = String(company);
    rightLabel = `We're Hiring · ${roles}`;
    primaryColor = '#2563eb'; // Royal Blue
    accentColor = '#60a5fa';
  }

  // Calculate approximate SVG widths based on label lengths
  const leftWidth = Math.max(80, leftLabel.length * 7.5 + 24);
  const rightWidth = Math.max(90, rightLabel.length * 7.2 + 24);
  const totalWidth = leftWidth + rightWidth;
  const height = 28;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" role="img" aria-label="${leftLabel}: ${rightLabel}">
  <title>${leftLabel}: ${rightLabel}</title>
  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#090d16" />
    <stop offset="100%" stop-color="#0f172a" />
  </linearGradient>
  <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="${primaryColor}" />
    <stop offset="100%" stop-color="${accentColor}" />
  </linearGradient>
  <clipPath id="rounded">
    <rect width="${totalWidth}" height="${height}" rx="6" />
  </clipPath>
  <g clip-path="url(#rounded)">
    <!-- Left background -->
    <rect width="${leftWidth}" height="${height}" fill="url(#bg)" />
    <!-- Right background -->
    <rect x="${leftWidth}" width="${rightWidth}" height="${height}" fill="url(#bg)" />
    <!-- Bottom highlight line -->
    <rect y="${height - 2}" width="${totalWidth}" height="2" fill="url(#glow)" />
    <!-- Divider -->
    <line x1="${leftWidth}" y1="4" x2="${leftWidth}" y2="${height - 4}" stroke="#334155" stroke-width="1" />
    <!-- Left Logo Dot -->
    <circle cx="12" cy="14" r="4" fill="${accentColor}" />
    <!-- Left Text -->
    <text x="22" y="18" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="0.2">
      ${escapeXml(leftLabel)}
    </text>
    <!-- Right Text -->
    <text x="${leftWidth + 12}" y="18" fill="${accentColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="0.2">
      ${escapeXml(rightLabel)}
    </text>
  </g>
</svg>
`.trim();

  return res.status(200).send(svg);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * src/lib/email/designSystem.ts
 *
 * TalentXcel Next-Generation Email Design System (Apple-inspired Aesthetic)
 *
 * Features:
 * - Minimalist, refined visual hierarchy inspired by Apple transactional notifications
 * - Crisp transparent brand mark with calibrated padding and optical balance
 * - Soft neutral background (#fbfbfd / #ffffff) with subtle border contrast (#e5e5ea)
 * - Ultra-clean typography stack (-apple-system, SF Pro Display, SF Pro Text)
 * - Restrained, elegant accent colors (Electric Blue #0071e3 / Emerald #34c759)
 * - Zero physical address disclosure
 * - Fully responsive with high-contrast readability in all email clients
 */

export const CANONICAL_URL = 'https://talentxcel.in';
export const DOMAIN = 'talentxcel.in';
export const LOGO_URL = 'https://talentxcel.in/assets/talentxcel-brand-logo.png';
export const FAVICON_URL = 'https://talentxcel.in/favicon.png';
export const FAVICON_ICO = 'https://talentxcel.in/favicon.ico';

export interface EmailRenderOutput {
  subject: string;
  preheader: string;
  html: string;
  plainText: string;
  category: 'transactional' | 'engagement' | 'marketing';
}

export function escapeHtml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  const str = String(unsafe);
  return str
    .replace(/&(?!(amp|lt|gt|quot|#039);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Render a software-native pill button with subtle gradient and inner border (Linear/Apple standard)
 */
export function renderButton(label: string, url: string, variant: 'primary' | 'success' | 'dark' = 'primary'): string {
  const bgStyles = {
    primary: 'background-color: #0071e3; background-image: linear-gradient(180deg, #0077ed 0%, #0066cc 100%); border: 1px solid #005bb5; box-shadow: 0 4px 16px rgba(0, 113, 227, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.2);',
    success: 'background-color: #34c759; background-image: linear-gradient(180deg, #34c759 0%, #2cb14e 100%); border: 1px solid #249642; box-shadow: 0 4px 14px rgba(52, 199, 89, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);',
    dark: 'background-color: #0f172a; background-image: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1px solid #020617; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1);'
  };
  const style = bgStyles[variant] || bgStyles.primary;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 30px auto 12px auto; text-align: center;">
      <tr>
        <td align="center" style="border-radius: 980px; ${style}">
          <a href="${escapeHtml(url)}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 13px 34px; border-radius: 980px; display: inline-block; letter-spacing: -0.2px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;">
            ${escapeHtml(label)} &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Render a refined, macOS-style status pill with live status dot
 */
export function renderBadge(label: string, variant: 'info' | 'success' | 'warning' | 'purple' = 'info'): string {
  const styles = {
    info: { bg: '#f0f7ff', color: '#0071e3', border: '#d0e7ff', dot: '#0071e3' },
    success: { bg: '#f2fbf4', color: '#1e824c', border: '#c8ecd3', dot: '#34c759' },
    warning: { bg: '#fff9f0', color: '#b25e00', border: '#ffe6c3', dot: '#ff9500' },
    purple: { bg: '#fbf5ff', color: '#7828c8', border: '#ebd8ff', dot: '#af52de' }
  };
  const style = styles[variant] || styles.info;

  return `
    <span style="display: inline-block; padding: 5px 14px; border-radius: 980px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; background-color: ${style.bg}; color: ${style.color}; border: 1px solid ${style.border}; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;">
      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${style.dot}; margin-right: 6px; vertical-align: middle;"></span>
      <span style="vertical-align: middle;">${escapeHtml(label)}</span>
    </span>
  `;
}

/**
 * Render interactive action tiles (Command Palette / Software Extension UI with rich illustration support)
 */
export interface ActionTileItem {
  icon?: string;
  image?: string;
  title: string;
  description: string;
  url: string;
}

export function renderActionTiles(items: ActionTileItem[]): string {
  const cards = items.map(item => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 12px 0; background-color: #ffffff; border: 1.5px solid #dce7f5; border-radius: 16px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); border-collapse: separate;">
      <tr>
        <td style="padding: 10px 14px;">
          <a href="${escapeHtml(item.url)}" target="_blank" style="text-decoration: none; display: block; color: inherit;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${item.image ? `
                <td width="138" valign="middle" class="action-tile-img-cell" style="width: 138px; padding-right: 14px;">
                  <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" width="138" style="display: block; width: 138px; max-width: 138px; height: auto; border-radius: 12px; border: 1px solid rgba(0, 102, 204, 0.08);" />
                </td>` : item.icon ? `
                <td width="42" valign="middle" style="width: 42px; padding-right: 14px;">
                  <div style="width: 38px; height: 38px; border-radius: 10px; background-color: #eff6ff; border: 1px solid #dbeafe; color: #0071e3; font-size: 18px; text-align: center; line-height: 38px; display: inline-block;">
                    ${escapeHtml(item.icon)}
                  </div>
                </td>` : ''}
                <td valign="middle" style="text-align: left;">
                  <div style="font-size: 15px; font-weight: 800; color: #0a192f; letter-spacing: -0.2px; line-height: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${escapeHtml(item.title)}
                  </div>
                  <div style="font-size: 12.5px; color: #475569; margin-top: 4px; line-height: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${escapeHtml(item.description)}
                  </div>
                </td>
                <td width="88" align="right" valign="middle" class="action-tile-btn-cell" style="width: 88px; padding-left: 10px;">
                  <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: #ffffff; border: 1.5px solid #0066cc; color: #0066cc; font-size: 12px; font-weight: 700; letter-spacing: 0.1px; white-space: nowrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    Launch &rarr;
                  </span>
                </td>
              </tr>
            </table>
          </a>
        </td>
      </tr>
    </table>
  `).join('');

  return `
    <div style="margin: 22px 0 16px 0;">
      ${cards}
    </div>
  `;
}

/**
 * Render a software telemetry card with hairline dividers (Responsive Stacked on Mobile)
 */
export function renderDataCard(items: Array<{ label: string; value: string; icon?: string }>): string {
  const rows = items.map((item, idx) => `
    <tr class="data-row">
      <td class="data-cell-label" style="padding: 12px 16px; ${idx !== items.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : ''} font-size: 12.5px; color: #64748b; font-weight: 500; width: 42%; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;">
        ${escapeHtml(item.label)}
      </td>
      <td class="data-cell-value" style="padding: 12px 16px; ${idx !== items.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : ''} font-size: 13.5px; color: #0f172a; font-weight: 600; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;">
        ${escapeHtml(item.value)}
      </td>
    </tr>
  `).join('');

  return `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 22px 0; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        ${rows}
      </table>
    </div>
  `;
}

/**
 * Next-Generation Platform Software Layout Wrapper (with Favicon, Native App Bar & Precision Beam)
 */
export function wrapInMasterLayout(options: {
  title: string;
  preheader: string;
  contentHtml: string;
  category: string;
  recipientEmail: string;
  unsubscribeUrl?: string;
}): string {
  const showUnsubscribe = options.category !== 'transactional';
  const unsubUrl = options.unsubscribeUrl || `${CANONICAL_URL}/unsubscribe?email=${encodeURIComponent(options.recipientEmail)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(options.title)}</title>
  
  <!-- FAVICON SUITE (All major webmail, desktop & mobile clients) -->
  <link rel="icon" type="image/png" sizes="32x32" href="${FAVICON_URL}">
  <link rel="shortcut icon" href="${FAVICON_ICO}">
  <link rel="apple-touch-icon" sizes="180x180" href="${FAVICON_URL}">

  <!--[if mso]>
  <style type="text/css">
    table, td, p, a, span { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f4f5f8; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    table { border-collapse: separate; }
    a { color: #0071e3; text-decoration: none; }
    img { -ms-interpolation-mode: bicubic; }
    @media only screen and (max-width: 620px) {
      .email-wrapper { width: 100% !important; padding: 4px !important; }
      .email-card-inner { padding: 26px 16px 32px 16px !important; }
      .hero-title { font-size: 20px !important; line-height: 27px !important; letter-spacing: -0.4px !important; }
      .action-tile-img-cell { width: 88px !important; padding-right: 10px !important; }
      .action-tile-img-cell img { width: 88px !important; max-width: 88px !important; }
      .action-tile-btn-cell { display: none !important; }
      .data-row { display: block !important; border-bottom: 1px solid #f1f5f9 !important; }
      .data-row:last-child { border-bottom: none !important; }
      .data-cell-label {
        display: block !important;
        width: 100% !important;
        padding: 10px 14px 2px 14px !important;
        text-align: left !important;
        font-size: 11px !important;
        color: #64748b !important;
        border-bottom: none !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }
      .data-cell-value {
        display: block !important;
        width: 100% !important;
        padding: 0 14px 10px 14px !important;
        text-align: left !important;
        font-size: 13.5px !important;
        font-weight: 600 !important;
        color: #0f172a !important;
        border-bottom: none !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f8; color: #0f172a;">
  <!-- Invisible Preheader -->
  <span style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">
    ${escapeHtml(options.preheader)}
  </span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f5f8; width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 12px 52px 12px;">
        <table role="presentation" class="email-wrapper" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%;">
          
          <!-- NATIVE PRODUCT APP BAR (Favicon Squircle + Platform Identity) -->
          <tr>
            <td style="padding: 0 4px 18px 4px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="padding-right: 12px;">
                    <a href="${CANONICAL_URL}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${FAVICON_URL}" alt="TalentXcel" width="36" height="36" style="display: block; width: 36px; height: 36px; border-radius: 9px; border: 1px solid rgba(0, 0, 0, 0.08); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);" />
                    </a>
                  </td>
                  <td valign="middle">
                    <a href="${CANONICAL_URL}" target="_blank" style="text-decoration: none;">
                      <span style="font-size: 15px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; display: block; line-height: 18px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;">TalentXcel</span>
                      <span style="font-size: 10.5px; font-weight: 500; color: #64748b; letter-spacing: 0.3px; display: block; line-height: 14px;">Super Intelligence &bull; Career OS</span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CONTAINER CARD WITH PRECISION GRADIENT ACCENT BEAM -->
          <tr>
            <td class="email-card" style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 0; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 18px 36px -8px rgba(0, 0, 0, 0.06);">
              <!-- Top 3px Precision Color Beam -->
              <div style="height: 3px; background: linear-gradient(90deg, #0071e3 0%, #34c759 50%, #5856d6 100%); line-height: 3px; font-size: 1px;">&nbsp;</div>
              <!-- Inner Card Content -->
              <div class="email-card-inner" style="padding: 38px 36px 42px 36px;">
                ${options.contentHtml}
              </div>
            </td>
          </tr>

          <!-- MINIMALIST SOFTWARE-GRADE FOOTER -->
          <tr>
            <td style="padding: 24px 16px; text-align: center; font-size: 11.5px; line-height: 19px; color: #94a3b8;">
              <div style="margin: 0 0 12px 0;">
                <a href="${CANONICAL_URL}" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">Platform</a>
                &bull;
                <a href="${CANONICAL_URL}/jobs" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">Jobs</a>
                &bull;
                <a href="${CANONICAL_URL}/network" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">Network</a>
                &bull;
                <a href="${CANONICAL_URL}/resume/ats-check" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">ATS Diagnostics</a>
                &bull;
                <a href="${CANONICAL_URL}/refer-and-earn" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">Refer &amp; Earn</a>
                &bull;
                <a href="${CANONICAL_URL}/privacy" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">Privacy</a>
                ${showUnsubscribe ? `
                  &bull;
                  <a href="${unsubUrl}" style="color: #94a3b8; text-decoration: underline; margin: 0 7px;">Unsubscribe</a>
                ` : ''}
              </div>
              <div style="margin: 0; color: #64748b; font-size: 11px; font-weight: 500;">
                Copyright &copy; TalentXcel Technologies. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

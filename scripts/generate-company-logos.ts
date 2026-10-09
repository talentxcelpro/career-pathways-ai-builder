import * as fs from 'fs';
import * as path from 'path';

const outDir = path.join(process.cwd(), 'public', 'assets', 'company-logos');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const logos: Record<string, string> = {
  // 1. Google / Google DeepMind
  'google.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
</svg>`,

  // 2. Microsoft / Microsoft Azure
  'microsoft.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect x="2" y="2" width="20" height="20" fill="#F25022"/>
  <rect x="26" y="2" width="20" height="20" fill="#7FBA00"/>
  <rect x="2" y="26" width="20" height="20" fill="#00A4EF"/>
  <rect x="26" y="26" width="20" height="20" fill="#FFB900"/>
</svg>`,

  // 3. Amazon Web Services (AWS)
  'aws.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" width="64" height="48">
  <rect width="64" height="48" rx="8" fill="#232F3E"/>
  <text x="32" y="24" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">aws</text>
  <path d="M16 32 C26 38, 38 38, 48 32" stroke="#FF9900" stroke-width="3" fill="none" stroke-linecap="round"/>
  <polygon points="49,30 46,35 44,30" fill="#FF9900"/>
</svg>`,

  // 4. Apple India
  'apple.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <path fill="#1A1A1A" d="M37.5 24.3c-.1-5.6 4.6-8.3 4.8-8.4-2.6-3.8-6.7-4.4-8.1-4.4-3.4-.4-6.8 2-8.5 2-1.8 0-4.5-2-7.4-1.9-3.8.1-7.4 2.3-9.3 5.7-4 6.9-1 17.2 2.8 22.8 1.9 2.7 4.1 5.8 7.1 5.7 2.8-.1 3.9-1.8 7.3-1.8 3.4 0 4.4 1.8 7.4 1.7 3.1-.1 5-2.7 6.9-5.5 2.2-3.2 3.1-6.3 3.1-6.5-.1-.1-6.1-2.4-6.2-9.1z"/>
  <path fill="#1A1A1A" d="M30.6 8.3c1.5-1.9 2.6-4.5 2.3-7.1-2.2.1-4.9 1.5-6.5 3.4-1.4 1.6-2.6 4.3-2.3 6.8 2.5.2 5-1.2 6.5-3.1z"/>
</svg>`,

  // 5. Stripe India
  'stripe.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="10" fill="#635BFF"/>
  <path fill="#FFFFFF" d="M21.5 19.8c0-1.8 1.5-2.5 3.9-2.5 3.5 0 8 1.1 11.5 3.1V12.7c-3.8-1.6-7.8-2.2-11.5-2.2-9.4 0-15.6 4.9-15.6 13.2 0 12.8 17.7 10.8 17.7 16.3 0 2.2-1.9 2.9-4.6 2.9-4.1 0-9.2-1.7-13.4-4v7.9c4.5 2 9.3 2.7 13.4 2.7 9.8 0 16.4-4.8 16.4-13.4-.1-13.8-17.8-11.4-17.8-16.3z"/>
</svg>`,

  // 6. JPMorgan Chase & Co.
  'jpmorgan.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#117ACA"/>
  <polygon points="12,18 24,6 36,18 36,30 24,42 12,30" fill="none" stroke="#FFFFFF" stroke-width="3"/>
  <text x="24" y="27" font-family="Georgia, serif" font-weight="bold" font-size="11" fill="#FFFFFF" text-anchor="middle">JPM</text>
</svg>`,

  // 7. Deloitte Consulting
  'deloitte.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" width="64" height="48">
  <rect width="64" height="48" rx="8" fill="#000000"/>
  <text x="29" y="30" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.5">Deloitte</text>
  <circle cx="53" cy="27" r="3.2" fill="#86BC25"/>
</svg>`,

  // 8. McKinsey & Company
  'mckinsey.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#051C2C"/>
  <text x="24" y="26" font-family="Baskerville, Georgia, serif" font-weight="bold" font-size="15" fill="#FFFFFF" text-anchor="middle">McK</text>
  <line x1="12" y1="32" x2="36" y2="32" stroke="#1F69FF" stroke-width="2"/>
</svg>`,

  // 9. CrowdStrike
  'crowdstrike.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#E01E26"/>
  <path fill="#FFFFFF" d="M12 28 C16 16, 26 10, 36 12 C30 18, 28 22, 34 26 C28 26, 22 28, 12 36 Z"/>
  <circle cx="28" cy="18" r="2" fill="#E01E26"/>
</svg>`,

  // 10. Atlassian
  'atlassian.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#0052CC"/>
  <path fill="#2684FF" d="M22.8 12.5c-.4-.6-1.3-.6-1.7 0L10.3 27.6c-.5.8.1 1.9 1.1 1.9h8.7c.6 0 1.1-.3 1.4-.8l3.1-4.8c.4-.6.4-1.3-.1-1.9l-1.7-9.5z"/>
  <path fill="#FFFFFF" d="M25.2 35.5c.4.6 1.3.6 1.7 0l10.8-15.1c.5-.8-.1-1.9-1.1-1.9h-8.7c-.6 0-1.1.3-1.4.8l-3.1 4.8c-.4.6-.4 1.3.1 1.9l1.7 9.5z"/>
</svg>`,

  // 11. Zoho Corporation
  'zoho.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#FFFFFF" stroke="#E2E8F0"/>
  <rect x="8" y="10" width="14" height="13" rx="3" fill="#E42528"/>
  <rect x="26" y="10" width="14" height="13" rx="3" fill="#226AB2"/>
  <rect x="8" y="25" width="14" height="13" rx="3" fill="#3AA543"/>
  <rect x="26" y="25" width="14" height="13" rx="3" fill="#F4A21C"/>
</svg>`,

  // 12. DHL Supply Chain
  'dhl.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" width="64" height="48">
  <rect width="64" height="48" rx="8" fill="#FFCC00"/>
  <text x="32" y="30" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-style="italic" font-size="20" fill="#D40511" text-anchor="middle" letter-spacing="1">DHL</text>
  <line x1="8" y1="36" x2="56" y2="36" stroke="#D40511" stroke-width="2.5"/>
</svg>`,

  // 13. Taj Hotels & Resorts
  'taj-hotels.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#1C1B1A"/>
  <path d="M24 8 L32 20 L24 28 L16 20 Z" fill="#D4AF37"/>
  <path d="M24 16 L29 24 L24 32 L19 24 Z" fill="#FFF8DC"/>
  <text x="24" y="42" font-family="Times New Roman, serif" font-weight="bold" font-size="9" fill="#D4AF37" text-anchor="middle" letter-spacing="2">TAJ</text>
</svg>`,

  // 14. Apollo Hospitals Group
  'apollo-hospitals.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#0066B2"/>
  <path d="M24 8 L24 40 M8 24 L40 24" stroke="#ED1C24" stroke-width="6" stroke-linecap="round"/>
  <circle cx="24" cy="24" r="5" fill="#FFFFFF"/>
</svg>`,

  // 15. Tata Elxsi
  'tata.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#0B4B8B"/>
  <text x="24" y="27" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" text-anchor="middle">TATA</text>
  <text x="24" y="38" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="8" fill="#90CDF4" text-anchor="middle" letter-spacing="1">ELXSI</text>
</svg>`,

  // 16. Tower Research Capital
  'tower-research.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#0A192F"/>
  <polygon points="16,36 24,10 32,36 28,36 24,18 20,36" fill="#64FFDA"/>
  <circle cx="24" cy="8" r="2.5" fill="#64FFDA"/>
</svg>`,

  // 17. ISRO (Indian Space Research Organisation)
  'isro.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#002D62"/>
  <circle cx="24" cy="24" r="16" fill="#F47920"/>
  <path d="M14 26 L24 10 L34 26 L24 20 Z" fill="#FFFFFF"/>
  <circle cx="24" cy="24" r="4" fill="#002D62"/>
  <path d="M12 36 Q24 28 36 36" stroke="#FFFFFF" stroke-width="2" fill="none"/>
</svg>`,

  // 18. DRDO (Defence Research and Development Organisation)
  'drdo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#1C3F6E"/>
  <polygon points="24,6 40,16 40,32 24,42 8,32 8,16" fill="none" stroke="#D4AF37" stroke-width="2.5"/>
  <path d="M12 24 L24 12 L36 24" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
  <circle cx="24" cy="24" r="5" fill="#D4AF37"/>
  <text x="24" y="37" font-family="system-ui" font-weight="900" font-size="7" fill="#FFFFFF" text-anchor="middle">DRDO</text>
</svg>`,

  // 19. RBI (Reserve Bank of India)
  'rbi.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#1B365D"/>
  <circle cx="24" cy="24" r="18" fill="none" stroke="#D4AF37" stroke-width="2.5"/>
  <circle cx="24" cy="24" r="14" fill="#D4AF37"/>
  <circle cx="24" cy="24" r="10" fill="#1B365D"/>
  <text x="24" y="27" font-family="system-ui, sans-serif" font-weight="900" font-size="10" fill="#D4AF37" text-anchor="middle">RBI</text>
</svg>`,

  // 20. IOCL (Indian Oil Corporation Ltd)
  'iocl.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#FF8200"/>
  <circle cx="24" cy="24" r="16" fill="#002D62"/>
  <rect x="12" y="21" width="24" height="6" fill="#FF8200"/>
  <circle cx="24" cy="24" r="7" fill="#FFFFFF"/>
</svg>`,

  // 21. UPSC / Govt of India
  'upsc.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#0D233A"/>
  <circle cx="24" cy="24" r="18" fill="none" stroke="#C59B27" stroke-width="2"/>
  <circle cx="24" cy="24" r="8" fill="none" stroke="#C59B27" stroke-width="2"/>
  <line x1="24" y1="8" x2="24" y2="40" stroke="#C59B27" stroke-width="1.5"/>
  <line x1="8" y1="24" x2="40" y2="24" stroke="#C59B27" stroke-width="1.5"/>
  <text x="24" y="44" font-family="system-ui" font-weight="800" font-size="6" fill="#C59B27" text-anchor="middle">UPSC</text>
</svg>`,

  // 22. NASA (JPL / Goddard)
  'nasa.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#0B3D91"/>
  <circle cx="24" cy="24" r="17" fill="#0B3D91"/>
  <path d="M10 28 Q24 6 38 20" stroke="#FC3D21" stroke-width="2.5" fill="none"/>
  <text x="24" y="28" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="12" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">NASA</text>
  <circle cx="16" cy="16" r="1" fill="#FFFFFF"/>
  <circle cx="32" cy="14" r="1" fill="#FFFFFF"/>
  <circle cx="30" cy="32" r="1" fill="#FFFFFF"/>
</svg>`,

  // 23. UK Government (DSIT & Cabinet Office)
  'uk-government.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#000000"/>
  <!-- St Edward's Crown stylized -->
  <path d="M12 32 L36 32 L34 36 L14 36 Z" fill="#D4AF37"/>
  <path d="M14 30 C14 22, 18 16, 24 16 C30 16, 34 22, 34 30 Z" fill="none" stroke="#D4AF37" stroke-width="2.5"/>
  <line x1="24" y1="12" x2="24" y2="16" stroke="#D4AF37" stroke-width="3"/>
  <line x1="21" y1="14" x2="27" y2="14" stroke="#D4AF37" stroke-width="3"/>
  <circle cx="16" cy="22" r="2" fill="#D4AF37"/>
  <circle cx="32" cy="22" r="2" fill="#D4AF37"/>
  <circle cx="24" cy="19" r="2" fill="#D4AF37"/>
</svg>`,

  // 24. US CDC
  'cdc.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#005596"/>
  <circle cx="24" cy="24" r="16" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <text x="24" y="28" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" text-anchor="middle">CDC</text>
</svg>`,

  // 25. US CISA
  'cisa.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#0C2340"/>
  <path d="M24 8 L38 14 V26 C38 34, 24 40, 24 40 C24 40, 10 34, 10 26 V14 Z" fill="#1D70B8"/>
  <text x="24" y="27" font-family="system-ui" font-weight="900" font-size="9" fill="#FFFFFF" text-anchor="middle">CISA</text>
</svg>`,

  // 26. US Department of Energy
  'us-doe.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#004333"/>
  <circle cx="24" cy="24" r="16" fill="none" stroke="#D4AF37" stroke-width="2"/>
  <polygon points="24,14 27,21 34,22 29,27 30,34 24,30 18,34 19,27 14,22 21,21" fill="#D4AF37"/>
</svg>`,

  // 27. ESA (European Space Operations Centre)
  'esa.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#003247"/>
  <circle cx="24" cy="24" r="16" fill="#003247" stroke="#FFFFFF" stroke-width="1.5"/>
  <circle cx="20" cy="20" r="8" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <text x="24" y="38" font-family="system-ui" font-weight="900" font-size="9" fill="#FFFFFF" text-anchor="middle">ESA</text>
</svg>`,

  // 28. European Commission
  'european-commission.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#003399"/>
  <!-- Circle of stars -->
  <g fill="#FFCC00">
    <circle cx="24" cy="11" r="1.8"/>
    <circle cx="30.5" cy="12.7" r="1.8"/>
    <circle cx="35.3" cy="17.5" r="1.8"/>
    <circle cx="37" cy="24" r="1.8"/>
    <circle cx="35.3" cy="30.5" r="1.8"/>
    <circle cx="30.5" cy="35.3" r="1.8"/>
    <circle cx="24" cy="37" r="1.8"/>
    <circle cx="17.5" cy="35.3" r="1.8"/>
    <circle cx="12.7" cy="30.5" r="1.8"/>
    <circle cx="11" cy="24" r="1.8"/>
    <circle cx="12.7" cy="17.5" r="1.8"/>
    <circle cx="17.5" cy="12.7" r="1.8"/>
  </g>
</svg>`,

  // 29. GovTech Singapore
  'govtech-singapore.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#EE2C38"/>
  <rect x="12" y="14" width="24" height="20" rx="4" fill="#FFFFFF"/>
  <path d="M16 24 L22 30 L32 18" stroke="#EE2C38" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`,

  // 30. MAS Singapore
  'mas-singapore.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#1C355E"/>
  <circle cx="24" cy="24" r="16" fill="none" stroke="#D4AF37" stroke-width="2"/>
  <text x="24" y="28" font-family="system-ui" font-weight="900" font-size="12" fill="#D4AF37" text-anchor="middle">MAS</text>
</svg>`,

  // 31. Australian Signals Directorate (ASD)
  'asd-australia.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#0A2240"/>
  <polygon points="24,8 38,16 38,32 24,40 10,32 10,16" fill="none" stroke="#00A3E0" stroke-width="2.5"/>
  <text x="24" y="27" font-family="system-ui" font-weight="900" font-size="10" fill="#FFFFFF" text-anchor="middle">ASD</text>
</svg>`,

  // 32. CSIRO Australia
  'csiro.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#005A9C"/>
  <circle cx="24" cy="18" r="6" fill="#00A3E0"/>
  <circle cx="16" cy="30" r="5" fill="#78BE20"/>
  <circle cx="32" cy="30" r="5" fill="#78BE20"/>
</svg>`,

  // 33. Canada Government
  'canada-government.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#FFFFFF" stroke="#E2E8F0"/>
  <path d="M24 10 L26 18 L33 16 L29 23 L36 26 L29 30 L31 36 L24 32 L17 36 L19 30 L12 26 L19 23 L15 16 L22 18 Z" fill="#FF0000"/>
</svg>`,

  // 34. Dubai Government (Digital Dubai / RTA)
  'dubai-government.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#8B1D2C"/>
  <circle cx="24" cy="24" r="16" fill="none" stroke="#D4AF37" stroke-width="2"/>
  <text x="24" y="28" font-family="system-ui, Arial" font-weight="900" font-size="10" fill="#D4AF37" text-anchor="middle">DUBAI</text>
</svg>`,

  // 35. Savantis Solutions
  'savantis.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#1E3A8A"/>
  <polygon points="14,14 34,14 24,34" fill="#3B82F6"/>
  <circle cx="24" cy="22" r="5" fill="#FFFFFF"/>
</svg>`,

  // 36. TalentXcel
  'talentxcel.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <defs>
    <linearGradient id="txcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="10" fill="url(#txcGrad)"/>
  <path d="M14 16 L34 16 M24 16 L24 34 M20 34 L28 34" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>
</svg>`
};

for (const [filename, content] of Object.entries(logos)) {
  fs.writeFileSync(path.join(outDir, filename), content.trim());
}

console.log(`✅ Successfully generated ${Object.keys(logos).length} official vector company logos in public/assets/company-logos/`);

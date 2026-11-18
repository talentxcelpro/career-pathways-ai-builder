// api/sitemap-passport.ts
// Dynamic Supabase-Driven Sitemap for all qualifying Career Passports (isIndexReady === true)
// Serves real-time XML with zero static build steps or GitHub commits.

export const config = {
  runtime: 'edge',
};

function getSupabaseAnonKey(): string {
  return process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
}

function getSupabaseRestUrl(): string {
  const base = process.env.SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
  return `${base.replace(/\/$/, '')}/rest/v1`;
}

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export default async function handler(req: Request): Promise<Response> {
  const url = `${getSupabaseRestUrl()}/public_profiles?select=username,skills,headline,about,title,experience_years,current_company,created_at&order=created_at.desc&limit=2500`;
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  try {
    const res = await fetch(url, {
      headers: {
        'apikey': getSupabaseAnonKey(),
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      },
    });

    if (res.ok) {
      const profiles = await res.json();
      if (Array.isArray(profiles)) {
        const nowIso = new Date().toISOString().split('T')[0];
        
        for (const p of profiles) {
          if (!p.username) continue;
          const skills = Array.isArray(p.skills) ? p.skills.filter(Boolean) : [];
          const bio = (p.headline || p.about || p.title || '').trim();
          const hasEnoughSkills = skills.length >= 3;
          const hasRich = bio.length >= 40 || (p.experience_years && Number(p.experience_years) > 0) || Boolean(p.current_company && p.current_company.trim().length > 0);
          
          if (hasEnoughSkills && hasRich) {
            const loc = `https://talentxcel.in/u/${encodeURIComponent(p.username)}`;
            xml += `  <url>\n`;
            xml += `    <loc>${escapeXml(loc)}</loc>\n`;
            xml += `    <lastmod>${nowIso}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.7</priority>\n`;
            xml += `  </url>\n`;
          }
        }
      }
    }
  } catch {
    // Non-fatal edge fallback
  }

  xml += '</urlset>';

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': 'noindex, follow',
      'X-Render-Engine': 'TalentXcel-Dynamic-Passport-Sitemap'
    },
  });
}

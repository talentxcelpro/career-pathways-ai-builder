import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const baseUrl = "https://talentxcel.in";
const xmlHeaders = {
  "Content-Type": "application/xml",
  "Cache-Control": "public, max-age=300", // 5 min cache
};
const BATCH_SIZE = 1000; // batch size for large datasets

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Master sitemap index
  if (path === "/sitemap.xml") return new Response(await generateSitemapIndex(), { headers: xmlHeaders });

  // Static pages
  if (path === "/sitemap-static.xml") return new Response(generateStaticSitemap(), { headers: xmlHeaders });

  // Dynamic sitemaps with batching
  if (path.startsWith("/sitemap-jobs-")) return new Response(await generateJobsSitemap(path), { headers: xmlHeaders });
  if (path.startsWith("/sitemap-companies-")) return new Response(await generateCompaniesSitemap(path), { headers: xmlHeaders });
  if (path.startsWith("/sitemap-profiles-")) return new Response(await generateProfilesSitemap(path), { headers: xmlHeaders });
  if (path.startsWith("/sitemap-posts-")) return new Response(await generatePostsSitemap(path), { headers: xmlHeaders });
  if (path.startsWith("/sitemap-blogs-")) return new Response(await generateBlogsSitemap(path), { headers: xmlHeaders });

  return new Response("Not found", { status: 404 });
});

// ---------------- Helpers ----------------
function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 100);
}

function generateEmptySitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
}

// ---------------- Static Pages ----------------
function generateStaticSitemap() {
  const now = new Date().toISOString();
  const pages = [
    "", "network", "jobs", "employer", "companies", "resume-builder", "career-tools",
    "services", "learning", "colleges", "career-map", "career-passport", "blog"
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  pages.forEach(p => {
    sitemap += `
  <url>
    <loc>${baseUrl}/${p}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="canonical" href="${baseUrl}/${p}" />
  </url>`;
  });

  sitemap += "\n</urlset>";
  return sitemap;
}

// ---------------- Master Sitemap Index ----------------
async function generateSitemapIndex() {
  const now = new Date().toISOString();

  // Get counts for batching
  const jobsCount = (await supabase.from("jobs").select("id", { count: "exact", head: true })).count ?? 0;
  const companiesCount = (await supabase.from("companies").select("id", { count: "exact", head: true })).count ?? 0;
  const profilesCount = (await supabase.from("profiles").select("id", { count: "exact", head: true })).count ?? 0;
  const postsCount = (await supabase.from("posts").select("id", { count: "exact", head: true })).count ?? 0;
  const blogsCount = (await supabase.from("blogs").select("id", { count: "exact", head: true })).count ?? 0;

  const jobsBatches = Math.ceil(jobsCount / BATCH_SIZE);
  const companiesBatches = Math.ceil(companiesCount / BATCH_SIZE);
  const profilesBatches = Math.ceil(profilesCount / BATCH_SIZE);
  const postsBatches = Math.ceil(postsCount / BATCH_SIZE);
  const blogsBatches = Math.ceil(blogsCount / BATCH_SIZE);

  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${baseUrl}/sitemap-static.xml</loc><lastmod>${now}</lastmod></sitemap>`;

  for (let i = 1; i <= jobsBatches; i++) sitemapIndex += `\n<sitemap><loc>${baseUrl}/sitemap-jobs-${i}.xml</loc><lastmod>${now}</lastmod></sitemap>`;
  for (let i = 1; i <= companiesBatches; i++) sitemapIndex += `\n<sitemap><loc>${baseUrl}/sitemap-companies-${i}.xml</loc><lastmod>${now}</lastmod></sitemap>`;
  for (let i = 1; i <= profilesBatches; i++) sitemapIndex += `\n<sitemap><loc>${baseUrl}/sitemap-profiles-${i}.xml</loc><lastmod>${now}</lastmod></sitemap>`;
  for (let i = 1; i <= postsBatches; i++) sitemapIndex += `\n<sitemap><loc>${baseUrl}/sitemap-posts-${i}.xml</loc><lastmod>${now}</lastmod></sitemap>`;
  for (let i = 1; i <= blogsBatches; i++) sitemapIndex += `\n<sitemap><loc>${baseUrl}/sitemap-blogs-${i}.xml</loc><lastmod>${now}</lastmod></sitemap>`;

  sitemapIndex += "\n</sitemapindex>";
  return sitemapIndex;
}

// ---------------- Generic Sitemap Generator ----------------
async function generateBatchSitemap(table: string, path: string, includeMedia: boolean = false) {
  const batch = parseInt(path.split("-").pop() || "1", 10);
  const from = (batch - 1) * BATCH_SIZE;

  const { data: items } = await supabase
    .from(table)
    .select("*")
    .range(from, from + BATCH_SIZE - 1);

  if (!items?.length) return generateEmptySitemap();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        ${includeMedia ? 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"' : ''}>`;

  items.forEach(item => {
    const lastmod = item.updated_at || item.created_at || new Date().toISOString();
    let slug = item.id;
    let urlPath = table.replace(/s$/, "");
    
    // Handle different table types
    if (table === "jobs") {
      slug = item.seo_slug || generateSlug(`${item.title}-${item.id}`);
      urlPath = "jobs";
    } else if (table === "blogs") {
      slug = item.slug || generateSlug(`${item.title}-${item.id}`);
      urlPath = "blog";
    } else if (table === "profiles") {
      slug = item.username || item.id;
      urlPath = "profile";
    } else if (table === "posts") {
      slug = generateSlug(`${item.headline || 'post'}-${item.id}`);
      urlPath = "posts";
    } else if (table === "companies") {
      slug = generateSlug(`${item.name}-${item.id}`);
      urlPath = "companies";
    }

    sitemap += `
  <url>
    <loc>${baseUrl}/${urlPath}/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="canonical" href="${baseUrl}/${urlPath}/${slug}" />`;

    if (includeMedia) {
      item.images?.forEach((img: string) => {
        sitemap += `<image:image><image:loc>${img}</image:loc><image:title>${item.title || slug}</image:title></image:image>`;
      });
      item.videos?.forEach((v: string) => {
        sitemap += `<video:video><video:content_loc>${v}</video:content_loc><video:title>${item.title || slug}</video:title></video:video>`;
      });
    }

    sitemap += "\n  </url>";
  });

  sitemap += "\n</urlset>";
  return sitemap;
}

// ---------------- Specific Generators ----------------
async function generateJobsSitemap(path: string) { return generateBatchSitemap("jobs", path); }
async function generateCompaniesSitemap(path: string) { return generateBatchSitemap("companies", path); }
async function generateProfilesSitemap(path: string) { return generateBatchSitemap("profiles", path, true); }
async function generatePostsSitemap(path: string) { return generateBatchSitemap("posts", path, true); }
async function generateBlogsSitemap(path: string) { return generateBatchSitemap("blogs", path, true); }
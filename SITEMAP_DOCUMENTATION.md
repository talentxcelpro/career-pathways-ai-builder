# TalentXcel Sitemap System

## Overview
TalentXcel uses a comprehensive sitemap infrastructure to ensure all content is discoverable by search engines. The system combines static XML files with dynamic generation via Supabase Edge Functions.

## Architecture

### 1. Master Sitemap Index
**File:** `/public/sitemap-index.xml`
- Lists all module-specific sitemaps
- Updated: 2025-10-01
- URL: https://talentxcel.in/sitemap-index.xml

### 2. Module-Specific Sitemaps
Each major module has its own sitemap:

| Module | File | Priority | Update Frequency | Dynamic |
|--------|------|----------|------------------|---------|
| Jobs | sitemap-jobs.xml | 0.9 | Daily | ✅ Yes |
| Companies | sitemap-companies.xml | 0.8 | Weekly | ✅ Yes |
| Learning | sitemap-learning.xml | 0.9 | Weekly | ✅ Yes |
| Network | sitemap-network.xml | 0.6 | Weekly | ✅ Yes |
| Resume | sitemap-resume.xml | 0.8 | Weekly | ❌ Static |
| Tools | sitemap-tools.xml | 0.8 | Weekly | ❌ Static |
| Colleges | sitemap-colleges.xml | 0.8 | Weekly | ⏳ Pending |
| Career Map | sitemap-careermap.xml | 0.9 | Weekly | ❌ Static |
| Career Passport | sitemap-careerpassport.xml | 0.9 | Weekly | ❌ Static |
| Employer | sitemap-employer.xml | 0.8 | Weekly | ❌ Static |
| Marketplace | sitemap-marketplace.xml | 0.7 | Weekly | ✅ Yes |
| Events | sitemap-events.xml | 0.7 | Weekly | ⏳ Pending |

## Dynamic Sitemap Generation

### Edge Function
**Location:** `supabase/functions/generate-sitemap/index.ts`

The edge function generates XML sitemaps by querying the database for:
- Active jobs with slugs
- Company profiles
- Learning courses
- User profiles (public)
- Services in marketplace
- Events

### API Endpoint
```
GET https://talentxcel.in/api/sitemap?module=<MODULE_NAME>&page=<PAGE_NUMBER>
```

**Parameters:**
- `module`: jobs, companies, learning, network, marketplace, events
- `page`: Page number for pagination (default: 1, max 50,000 URLs per page)

**Example:**
```bash
curl https://talentxcel.in/api/sitemap?module=jobs&page=1
```

## How It Works

### Static Sitemaps
1. XML files in `/public/` directory
2. Served directly by the web server
3. Contain core pages and main landing pages
4. Manually updated when new features are added

### Dynamic Sitemaps
1. Edge function queries database tables
2. Generates XML on-the-fly
3. Includes latest content with correct `lastmod` dates
4. Automatically splits into multiple files if > 50k URLs

### URL Structure
All URLs follow SEO-friendly patterns:

**Jobs:**
```
/jobs/{job-title-company-location}
Example: /jobs/backend-developer-medicore-hyderabad-india
```

**Companies:**
```
/companies/{company-slug}
Example: /companies/medicore
```

**Learning:**
```
/learning/courses/{course-slug}
Example: /learning/courses/python-foundations
```

**Network:**
```
/{username}
Example: /talentxcel
```

**Marketplace:**
```
/marketplace/services/{service-slug}
Example: /marketplace/services/resume-writing
```

## robots.txt Integration
The optimized `/public/robots.txt` file includes:
```
Sitemap: https://talentxcel.in/sitemap-index.xml
```

And references all module sitemaps.

## Maintenance

### Updating Static Sitemaps
1. Edit XML files in `/public/`
2. Update `<lastmod>` date to current date
3. Commit and deploy

### Adding New Dynamic Content
1. Add query logic to `generate-sitemap/index.ts`
2. Update `switch` statement with new module case
3. Ensure proper slug generation
4. Deploy edge function (automatic)

### Monitoring
- Check Google Search Console for indexing status
- Monitor edge function logs for errors
- Verify XML validation: https://www.xml-sitemaps.com/validate-xml-sitemap.html

## SEO Best Practices Implemented

✅ **XML Validation:** All sitemaps follow sitemap.org schema
✅ **50k URL Limit:** Automatic pagination for large datasets
✅ **Priority Tags:** Higher priority for job listings (0.9) vs static pages (0.6-0.8)
✅ **Change Frequency:** Daily for jobs, weekly for most other content
✅ **Last Modified Dates:** Dynamic dates based on database timestamps
✅ **Gzip Support:** Edge functions return compressed XML for faster crawling
✅ **CORS Headers:** Allows sitemap testing tools to fetch

## Google Ping (Automated)
After updates, ping Google:
```bash
https://www.google.com/ping?sitemap=https://talentxcel.in/sitemap-index.xml
```

This can be automated via:
- Cron job (recommended for daily updates)
- Post-deploy hook
- Database trigger for new content

## Troubleshooting

### Sitemap Not Updating
1. Check edge function logs in Supabase dashboard
2. Verify database queries return data
3. Test directly: `/api/sitemap?module=jobs`

### URLs Not Indexed
1. Verify URL is in sitemap
2. Check robots.txt allows crawling
3. Submit sitemap to Google Search Console
4. Wait 1-2 weeks for indexing

### Edge Function Errors
1. Check Supabase function logs
2. Verify environment variables are set
3. Test database connectivity
4. Check for SQL errors in queries

## Future Enhancements
- [ ] Automated daily regeneration via cron
- [ ] Image sitemaps for company logos, course thumbnails
- [ ] Video sitemaps for learning content
- [ ] News sitemap for blog posts
- [ ] Internationalization (multilingual sitemaps)
- [ ] Sitemap analytics dashboard

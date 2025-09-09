import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Target, Users, Wrench, BarChart3, Shield, DollarSign, Calendar } from 'lucide-react';

const ProductRequirementDocument = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Helmet>
        <title>Product Requirement Document - TalentXcel SEO Suite</title>
        <meta name="description" content="Complete PRD for TalentXcel SEO Suite - AI-driven SEO automation with career branding tools" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Product Requirement Document (PRD)</h1>
          <p className="text-muted-foreground">TalentXcel SEO Suite - v1.0</p>
        </div>
        <Badge variant="secondary" className="ml-auto">Pro Tools Division</Badge>
      </div>

      {/* Vision & Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>🎯 Vision & Goals</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            TalentXcel SEO Suite empowers professionals, employers, and startups to optimize their visibility across search engines and the TalentXcel network. It blends AI-driven SEO automation with career branding tools, giving users the power of ThatWare + SEMrush, but tailored for jobs, careers, and talent branding.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-primary">For Professionals</h4>
              <p className="text-sm text-muted-foreground">SEO-optimized TalentXcel profile & resume</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-primary">For Employers</h4>
              <p className="text-sm text-muted-foreground">SEO-ready job postings & career brand reports</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-primary">For Startups/SMEs</h4>
              <p className="text-sm text-muted-foreground">Full SEO SaaS suite: audits, keywords, backlinks, reports</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-primary">For Agencies</h4>
              <p className="text-sm text-muted-foreground">White-label SEO dashboards & reporting</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Personas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>👥 User Personas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              title: "Jobseekers / Professionals",
              wants: "Higher profile visibility, personal branding, more recruiter discovery",
              pain: "Not ranking on Google/TalentXcel searches"
            },
            {
              title: "Employers / Recruiters", 
              wants: "Optimized job postings, more applicants, employer brand SEO",
              pain: "Jobs not appearing on Google Jobs, weak career branding"
            },
            {
              title: "Startups / SMEs",
              wants: "Compete with big brands on SEO with affordable AI-powered tools",
              pain: "Expensive SEO agencies, lack of in-house SEO talent"
            },
            {
              title: "Agencies / Consultants",
              wants: "White-label SEO tools to resell to clients", 
              pain: "Complex SaaS stack (Ahrefs, SEMrush) → needs integrated TalentXcel solution"
            }
          ].map((persona, index) => (
            <div key={index} className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold text-lg">{persona.title}</h4>
              <p className="text-sm"><span className="font-medium text-green-600">Wants:</span> {persona.wants}</p>
              <p className="text-sm"><span className="font-medium text-red-600">Pain:</span> {persona.pain}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Core Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle>🔑 Core Features (Phase-wise)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Phase A */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-green-100 text-green-800">Phase A</Badge>
              <h3 className="text-xl font-semibold">MVP – Visibility & Optimization</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Profile SEO Optimization (Individuals)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• SEO scorecard for profiles</li>
                  <li>• AI keyword suggestions (headline, summary, skills)</li>
                  <li>• Structured data for profiles (talentxcel.in/username)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Job SEO Optimization (Employers)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Job schema (Google Jobs optimization)</li>
                  <li>• AI keyword insertion suggestions</li>
                  <li>• SEO score for job ads</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-primary">Basic Reports</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• "SEO Health" score (0–100)</li>
                <li>• Downloadable PDF report</li>
              </ul>
            </div>
          </div>

          {/* Phase B */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-blue-100 text-blue-800">Phase B</Badge>
              <h3 className="text-xl font-semibold">Growth – AI SEO Tools for SMEs</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary">Keyword Research & Clustering</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• AI-driven keyword opportunities</li>
                    <li>• Competitor keyword gap</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Content Brief Generator</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• AI generates optimized blog outlines</li>
                    <li>• Title/meta/schema auto-suggestions</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary">Site Audit (SMEs/Employers)</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Crawl website (pages, speed, errors)</li>
                    <li>• Core Web Vitals, broken links, metadata</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Rank Tracking</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Monitor keyword positions across Google/Bing</li>
                    <li>• Geo-location tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Phase C */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-purple-100 text-purple-800">Phase C</Badge>
              <h3 className="text-xl font-semibold">Enterprise & Agency Features</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-primary">Backlink & Authority Tracking</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Monitor gained/lost backlinks</li>
                  <li>• Competitor link profile</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary">White-Label Reporting (Agencies)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Custom branding</li>
                  <li>• Automated weekly/monthly reports</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary">Workflow Automation</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Scheduled audits</li>
                  <li>• SEO tasks assigned to team members</li>
                  <li>• Notifications (Slack, email)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>📊 Success Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Professionals: % of profiles with SEO score > 70 within 30 days",
              "Employers: % of job ads indexed in Google Jobs",
              "Startups: Traffic uplift from TalentXcel SEO Suite vs baseline",
              "Agencies: Number of clients onboarded per agency"
            ].map((metric, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{metric}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Requirements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle>🛠️ Technical Requirements</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p><span className="font-semibold">Frontend:</span> Extend TalentXcel dashboard (Lovable.dev, Next.js)</p>
              <p><span className="font-semibold">Backend:</span> Supabase (DB), Node.js API layer</p>
              <p><span className="font-semibold">AI Engine:</span> DeepSeek + OpenAI (keyword clustering, AI content briefs)</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Crawling:</span> Python microservice workers for site audits</p>
              <p><span className="font-semibold">Reports:</span> PDF generation (reportlab)</p>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Integrations:</h4>
            <ul className="text-sm space-y-1">
              <li>• Google Search Console API</li>
              <li>• Google Analytics (GA4)</li>
              <li>• Bing Webmaster Tools (optional)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Security & Compliance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>🔒 Security & Compliance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>• Profiles & job data: encrypted at rest (Supabase)</li>
            <li>• GDPR/CCPA compliance for employer analytics</li>
            <li>• OAuth2 for Google integrations</li>
            <li>• API rate limiting for crawlers</li>
          </ul>
        </CardContent>
      </Card>

      {/* Pricing Model */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>💰 Pricing Model</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-green-600">Free</h4>
              <p className="text-sm text-muted-foreground">Basic profile SEO score + 1 job ad optimization</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-blue-600">Pro</h4>
              <p className="text-sm text-muted-foreground">₹999–₹2,999/mo</p>
              <p className="text-xs text-muted-foreground">Profile + job SEO + 10 tracked keywords</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-purple-600">Startup</h4>
              <p className="text-sm text-muted-foreground">₹4,999–₹9,999/mo</p>
              <p className="text-xs text-muted-foreground">Site audits, AI content briefs, 100 keywords</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-orange-600">Agency</h4>
              <p className="text-sm text-muted-foreground">Custom Pricing</p>
              <p className="text-xs text-muted-foreground">White-label + multiple clients</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>📅 Roadmap</CardTitle>
          </div>
          <CardDescription>Development phases (no specific timeline)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Badge className="bg-green-100 text-green-800">Phase A</Badge>
              <p className="text-sm">Profiles + Job SEO + Basic Reports</p>
            </div>
            <div className="flex items-start gap-4">
              <Badge className="bg-blue-100 text-blue-800">Phase B</Badge>
              <p className="text-sm">Keyword research + Site audits + Rank tracking</p>
            </div>
            <div className="flex items-start gap-4">
              <Badge className="bg-purple-100 text-purple-800">Phase C</Badge>
              <p className="text-sm">Backlink analysis + White-label reporting + Automations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductRequirementDocument;
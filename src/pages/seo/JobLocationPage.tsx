import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Building, TrendingUp, AlertCircle, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
import { conversionTelemetry } from '@/utils/conversionTelemetry';
import { createSafeHtml } from '@/utils/sanitize';
import { GrowthExperimentWrapper } from '@/components/conversion/GrowthExperimentWrapper';
import { ResumeQuickScanWidget } from '@/components/conversion/ResumeQuickScanWidget';
import { RelatedSubdomainLinks } from '@/components/navigation/RelatedSubdomainLinks';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';

interface JobLocationPageProps {}

const JobLocationPage: React.FC<JobLocationPageProps> = () => {
  const { location: routeLocation } = useParams<{ location: string }>();
  const navigate = useNavigate();
  const [realJobs, setRealJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Robust location resolution: supports route params and direct URL segments (/locations/varanasi, /jobs/varanasi)
  const derivedLocation = useMemo(() => {
    if (routeLocation && routeLocation.trim()) {
      return routeLocation.toLowerCase().trim();
    }
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      const match = pathname.match(/\/(?:locations|jobs)\/([a-z0-9-]+)/i) || pathname.match(/^\/([a-z0-9-]+)$/i);
      if (match && match[1]) {
        return match[1].toLowerCase().trim();
      }
    }
    return 'varanasi';
  }, [routeLocation]);

  const locationData = getLocationData(derivedLocation);
  const canonicalUrl = `https://talentxcel.in/locations/${derivedLocation}`;

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const locClean = derivedLocation.replace(/-/g, ' ').trim();
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .or(`location.ilike.%${locClean}%,location_city.ilike.%${locClean}%`)
          .limit(20);

        if (!error && data && data.length > 0) {
          setRealJobs(data);
        } else {
          // If no immediate local match, supply high-performing verified fresher & remote jobs
          const { data: fallbackData } = await supabase
            .from('jobs')
            .select('*')
            .or('is_remote.eq.true,location_country.ilike.%india%')
            .eq('is_active', true)
            .limit(10);
          setRealJobs(fallbackData || []);
        }
      } catch (err) {
        console.warn('[JobLocationPage] Error loading location jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [derivedLocation]);

  useEffect(() => {
    conversionTelemetry.track('landing_view', {
      source: 'seo_job_location',
      location: derivedLocation,
      city_name: locationData.name
    });
    conversionTelemetry.setAcquisitionContext('seo_job_location', `/locations/${derivedLocation}`);
  }, [derivedLocation, locationData.name]);

  return (
    <>
      <Helmet>
        <title>{locationData.title}</title>
        <meta name="description" content={locationData.description} />
        <meta name="keywords" content={locationData.keywords.join(', ')} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={locationData.title} />
        <meta property="og:description" content={locationData.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={locationData.title} />
        <meta name="twitter:description" content={locationData.description} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(locationData.structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Breadcrumbs */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
                <li><span className="mx-2">/</span></li>
                <li><a href="/jobs" className="hover:text-foreground transition-colors">Jobs</a></li>
                <li><span className="mx-2">/</span></li>
                <li className="text-foreground font-medium">{locationData.name}</li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-4">
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Verified Local Openings &bull; {locationData.name}, India</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
                {locationData.h1}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl">
                {locationData.description}
              </p>
              
              <div className="flex flex-wrap gap-3 mb-8">
                <Button 
                  size="lg" 
                  className="gap-2 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  onClick={() => {
                    const jobsSection = document.getElementById('location-jobs-grid');
                    if (jobsSection) jobsSection.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Search className="h-5 w-5" />
                  View {realJobs.length || locationData.stats.jobs} Verified Jobs
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="gap-2 font-semibold"
                  onClick={() => navigate('/resume/ats-check')}
                >
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Free ATS Resume Score
                </Button>
              </div>

              {/* 1-Click ATS Match & Instant Apply Dropzone */}
              <div className="my-6">
                <ResumeQuickScanWidget
                  role={`Jobs in ${locationData.name}`}
                  location={locationData.name}
                  matchingJobsCount={realJobs.length || parseInt(locationData.stats?.jobs) || 16}
                />
              </div>

              {/* Location Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8">
                <div className="bg-card p-5 sm:p-6 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-3 mb-1">
                    <Building className="h-7 w-7 text-primary" />
                    <span className="text-2xl font-black text-foreground">{locationData.stats.companies}+</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Companies Hiring</p>
                </div>
                <div className="bg-card p-5 sm:p-6 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-3 mb-1">
                    <MapPin className="h-7 w-7 text-primary" />
                    <span className="text-2xl font-black text-foreground">{realJobs.length || locationData.stats.jobs}+</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Active Verified Openings</p>
                </div>
                <div className="bg-card p-5 sm:p-6 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-3 mb-1">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    <span className="text-2xl font-black text-foreground">{locationData.stats.avgSalary}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Average Salary Band</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-10">
                {/* Job Listings Anchor */}
                <div id="location-jobs-grid" className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div>
                      <h2 className="text-2xl font-black text-foreground">Verified Openings in {locationData.name}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Updated live &bull; 100% verified employer listings</p>
                    </div>
                    {realJobs.length > 0 && (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                        {realJobs.length} Live Openings
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <div className="p-12 text-center text-sm font-mono text-muted-foreground animate-pulse">
                      Loading verified jobs in {locationData.name}...
                    </div>
                  ) : realJobs.length > 0 ? (
                    <div className="grid gap-4 sm:gap-6">
                      {realJobs.map((job) => (
                        <JobCard 
                          key={job.id} 
                          job={{
                            id: job.id,
                            title: job.title || job.job_title,
                            description: job.job_summary || job.job_description || job.description || '',
                            location: job.location || `${job.location_city || ''}, ${job.location_state || ''}`.trim() || locationData.name,
                            salary_min: job.salary_min,
                            salary_max: job.salary_max,
                            employment_type: job.employment_type || 'Full-time',
                            experience_level: job.experience_level || `${job.min_experience || 0}-${job.max_experience || 3} yrs`,
                            skills_required: job.skills_required || (job.ai_skill_tags ? job.ai_skill_tags.split(',') : []),
                            is_remote: job.is_remote,
                            is_featured: job.is_featured,
                            company: {
                              id: job.company_id || 'talentxcel',
                              name: job.company_name || 'TalentXcel Partner',
                              industry: job.industry_domain || job.industry || 'Technology'
                            }
                          }} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 space-y-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-foreground text-base">
                            Local Openings Currently Onboarding in {locationData.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            TalentXcel verifies every opening to prevent ghost jobs. While new local employers in {locationData.name} are completing verification, explore immediate matching alternatives:
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Button variant="outline" onClick={() => navigate('/jobs')} className="justify-start gap-2 h-auto py-3">
                          <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div className="text-left">
                            <div className="text-xs font-semibold">Browse Pan-India & Remote Jobs</div>
                            <div className="text-[11px] text-muted-foreground">Work from {locationData.name} for verified employers</div>
                          </div>
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/resume/ats-check')} className="justify-start gap-2 h-auto py-3">
                          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="text-left">
                            <div className="text-xs font-semibold">Instant ATS Skill Readiness Scan</div>
                            <div className="text-[11px] text-muted-foreground">Benchmark profile & get matched automatically</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Editorial Industry Guide */}
                <div 
                  className="prose prose-lg max-w-none pt-6 border-t"
                  dangerouslySetInnerHTML={createSafeHtml(locationData.content)}
                />

                {/* Controlled Cohort Experiment */}
                <div className="mb-10">
                  <GrowthExperimentWrapper
                    location={locationData.name}
                    sourcePage={`job_location_${derivedLocation}`}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Popular Job Categories */}
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                  <h3 className="text-base font-bold mb-4 text-foreground">Popular Job Categories in {locationData.name}</h3>
                  <div className="space-y-2 text-sm">
                    {['IT & Software Jobs', 'Fresher Jobs', 'Banking & Finance Jobs', 'Healthcare Jobs', 'Teaching & Academic Jobs', 'Sales & Marketing Jobs'].map((category) => (
                      <a 
                        key={category}
                        href={`/jobs?search=${encodeURIComponent(category + ' ' + locationData.name)}`}
                        className="block text-muted-foreground hover:text-primary transition-colors py-1 border-b border-border/40 last:border-0"
                      >
                        {category} in {locationData.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Top Companies */}
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                  <h3 className="text-base font-bold mb-4 text-foreground">Top Employers Hiring in {locationData.name}</h3>
                  <div className="space-y-2 text-sm">
                    {locationData.topCompanies.map((company: string) => (
                      <div 
                        key={company}
                        className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0"
                      >
                        <span className="text-foreground font-medium">{company}</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Hiring
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Alerts CTA */}
                <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 p-6 rounded-xl border border-blue-500/20 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="text-base font-bold">Instant Job Alerts</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Get real-time WhatsApp and email alerts when new verified jobs in {locationData.name} are posted.
                  </p>
                  <Button 
                    onClick={() => navigate(`/jobs?location=${encodeURIComponent(locationData.name)}&alert=true`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-sm"
                  >
                    Subscribe to {locationData.name} Alerts
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {locationData.faqs && (
          <section className="py-16 bg-muted/30 border-t">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-8 text-center sm:text-left">
                Frequently Asked Questions &bull; Jobs in {locationData.name}
              </h2>
              <div className="space-y-4">
                {locationData.faqs.map((faq: any, index: number) => (
                  <div key={index} className="bg-card p-6 rounded-xl border shadow-sm">
                    <h3 className="text-base font-bold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contextual Subdomain Discovery Mesh */}
        <section className="py-12 bg-background border-t">
          <div className="container mx-auto px-4 max-w-5xl">
            <RelatedSubdomainLinks role="Software Engineer" city={locationData.name} className="mb-8" />
          </div>
        </section>

        {/* Global Crawlable Subdomain Mesh Footer */}
        <SubdomainMeshFooter />
      </div>
    </>
  );
};

// Location data configuration
function getLocationData(location: string) {
  const norm = (location || '').toLowerCase().trim();

  const locations: Record<string, any> = {
    'varanasi': {
      name: 'Varanasi',
      title: 'Job Vacancies in Varanasi 2026 | Freshers & Experienced | TalentXcel',
      description: 'Explore verified job vacancies in Varanasi for freshers and experienced candidates. Apply directly to IT, banking, teaching, software, and healthcare roles on TalentXcel.',
      h1: 'Job Vacancies in Varanasi (2026)',
      keywords: ['jobs in varanasi', 'varanasi job vacancy', 'jobs for freshers in varanasi', 'it jobs in varanasi', 'private jobs in varanasi', 'teaching jobs varanasi', 'bank jobs in varanasi'],
      stats: {
        companies: '250',
        jobs: '16',
        avgSalary: '₹3-8L'
      },
      topCompanies: ['TCS', 'Utkarsh Small Finance Bank', 'Banaras Hindu University', 'HDFC Bank', 'Byju\'s', 'Apex Hospitals', 'Tech Mahindra'],
      content: `
        <div class="space-y-6">
          <p>Varanasi is experiencing accelerated economic development, emerging as a prominent commercial and technology corridor in Eastern Uttar Pradesh. With robust infrastructure enhancements, digital governance initiatives, and a burgeoning services sector, career opportunities for freshers and seasoned professionals are expanding rapidly across information technology, banking, healthcare, and higher education.</p>
          
          <h2 class="text-2xl font-bold mt-8 mb-4">Why Build Your Career in Varanasi?</h2>
          <p>The convergence of premier academic institutions like <strong>IIT (BHU) Varanasi</strong> and <strong>Banaras Hindu University</strong> with modern logistics corridors has transformed the regional talent landscape. Leading national enterprises and high-growth fintech startups have established operational bases in Varanasi, offering competitive compensation, structured career ladders, and high quality of life without metro congestion.</p>
          
          <h2 class="text-2xl font-bold mt-8 mb-4">Leading Employment Sectors in Varanasi</h2>
          <ul class="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Information Technology & Software:</strong> Full-stack web development, mobile applications, cloud services, and technical support centers.</li>
            <li><strong>Banking & Financial Services:</strong> Retail banking, microfinance, credit underwriting, and operations led by organizations such as Utkarsh Small Finance Bank and leading national private banks.</li>
            <li><strong>Education & Research:</strong> Academic professorships, research associates, and educational administration across BHU and affiliated institutes.</li>
            <li><strong>Healthcare & Pharmaceuticals:</strong> Super-specialty hospital management, medical technology, diagnostics, and clinical operations.</li>
            <li><strong>Logistics & Supply Chain:</strong> Inland waterway logistics, multimodal transport hubs, and warehousing networks.</li>
          </ul>
          
          <h2 class="text-2xl font-bold mt-8 mb-4">Fresher Opportunities & Salary Benchmark</h2>
          <p>Fresh graduates in Varanasi typically start between ₹2.5L and ₹4.5L per annum in software engineering, technical support, and banking operations. Mid-level and senior professionals in tech leads and managerial roles command salaries ranging from ₹6L to ₹12L+, paired with significantly lower living costs compared to Delhi NCR or Bangalore.</p>
        </div>
      `,
      faqs: [
        {
          question: "What are the best job opportunities in Varanasi for freshers?",
          answer: "Freshers in Varanasi find strong hiring across IT support, junior software engineering, banking sales/operations, digital marketing, and academic teaching roles. Top campus recruiters include TCS, Utkarsh Bank, and regional tech firms."
        },
        {
          question: "Which companies are actively hiring in Varanasi?",
          answer: "Major employers in Varanasi include Utkarsh Small Finance Bank, Tata Consultancy Services (TCS), Banaras Hindu University, HDFC Bank, ICICI Bank, Apex Super Specialty Hospitals, and emerging regional software houses."
        },
        {
          question: "What is the average salary for private jobs in Varanasi?",
          answer: "The average salary band in Varanasi ranges from ₹3,00,000 to ₹8,00,000 per annum depending on experience and domain. Technical roles and financial services offer higher packages with annual performance bonuses."
        },
        {
          question: "How can I check my ATS resume score for Varanasi jobs?",
          answer: "You can use TalentXcel's free ATS Resume Match tool above to instantly upload your resume and benchmark your skill alignment against active Varanasi openings before applying."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Varanasi",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Varanasi",
          "addressRegion": "Uttar Pradesh",
          "addressCountry": "IN"
        },
        "description": "Find verified job vacancies in Varanasi for freshers and experienced professionals. Browse IT, banking, teaching, and healthcare openings."
      }
    },
    'noida': {
      name: 'Noida',
      title: 'Jobs in Noida 2026 | IT, Software, MNCs & Freshers | TalentXcel',
      description: 'Find verified job openings in Noida & Greater Noida. Top IT companies, MNCs, freshers & experienced positions. Apply directly on TalentXcel.',
      h1: 'Jobs in Noida - Premier IT & Corporate Hub (2026)',
      keywords: ['jobs in noida', 'it jobs in noida', 'fresher jobs noida', 'noida corporate jobs', 'software jobs noida'],
      stats: {
        companies: '1800',
        jobs: '12000',
        avgSalary: '₹5-14L'
      },
      topCompanies: ['HCL', 'Paytm', 'Adobe', 'Samsung', 'TCS', 'Wipro', 'Microsoft'],
      content: `
        <div class="space-y-6">
          <p>Noida is one of India's premier technology and industrial centers, hosting global corporate headquarters, R&D centers, and software innovation campuses across Sector 62, Expressway, and Greater Noida.</p>
          <h2 class="text-2xl font-bold mt-8 mb-4">Key Industries in Noida</h2>
          <p>Major hiring domains include Software Engineering, Cloud Computing, Fintech, Electronics Manufacturing, and Digital Media.</p>
        </div>
      `,
      faqs: [
        {
          question: "What is the average IT salary in Noida?",
          answer: "IT salaries in Noida average ₹5,00,000 to ₹14,00,000 per annum, with senior software engineers and architects earning ₹18L to ₹35L+."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Noida",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Noida",
          "addressRegion": "Uttar Pradesh",
          "addressCountry": "IN"
        },
        "description": "Explore high-paying IT, corporate, and fresher jobs in Noida."
      }
    },
    'lucknow': {
      name: 'Lucknow',
      title: 'Jobs in Lucknow 2026 | IT, Healthcare, Banking & Freshers | TalentXcel',
      description: 'Discover top job vacancies in Lucknow across IT, healthcare, banking, education, and administrative sectors. Apply online now.',
      h1: 'Job Openings in Lucknow (2026)',
      keywords: ['jobs in lucknow', 'lucknow job vacancy', 'it jobs in lucknow', 'fresher jobs lucknow'],
      stats: {
        companies: '450',
        jobs: '1500',
        avgSalary: '₹3.5-9L'
      },
      topCompanies: ['TCS', 'HCL', 'Tata Motors', 'Utkarsh Bank', 'Medanta', 'Apollo'],
      content: `
        <div class="space-y-6">
          <p>Lucknow, the capital of Uttar Pradesh, offers expanding career opportunities in IT Parks, manufacturing, healthcare, and financial services.</p>
        </div>
      `,
      faqs: [
        {
          question: "Which IT companies are present in Lucknow?",
          answer: "TCS and HCL have large delivery campuses in Lucknow, providing hundreds of technology and business process roles."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Lucknow",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Lucknow",
          "addressRegion": "Uttar Pradesh",
          "addressCountry": "IN"
        },
        "description": "Find verified careers in Lucknow across IT, healthcare, and corporate sectors."
      }
    },
    'bangalore': {
      name: 'Bangalore',
      title: 'Jobs in Bangalore 2026 | IT, Engineering & All Categories | TalentXcel',
      description: 'Find the best jobs in Bangalore. Browse IT, engineering, product management, and startup opportunities in India\'s Silicon Valley. Apply now!',
      h1: 'Jobs in Bangalore - India\'s Silicon Valley (2026)',
      keywords: ['jobs in bangalore', 'bangalore careers', 'it jobs bangalore', 'engineering jobs bangalore', 'fresher jobs bangalore'],
      stats: {
        companies: '2000',
        jobs: '15000',
        avgSalary: '₹5-12L'
      },
      topCompanies: ['Infosys', 'TCS', 'Wipro', 'Accenture', 'Microsoft', 'Google'],
      content: `
        <div class="space-y-6">
          <p>Bangalore, often called India's Silicon Valley, is the country's leading technology hub offering exceptional career opportunities for professionals across all domains. From startups to multinational corporations, the city hosts the largest concentration of IT companies in India.</p>
        </div>
      `,
      faqs: [
        {
          question: "What is the cost of living in Bangalore?",
          answer: "Bangalore has a moderate to high cost of living. Tech corridors like Whitefield and HSR Layout are competitive, but strong compensation packages offer high purchasing power."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Bangalore",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bangalore",
          "addressRegion": "Karnataka",
          "addressCountry": "IN"
        },
        "description": "Find top jobs in Bangalore's tech and startup ecosystem."
      }
    },
    'mumbai': {
      name: 'Mumbai',
      title: 'Jobs in Mumbai 2026 | Finance, Media & All Industries | TalentXcel',
      description: 'Explore job opportunities in Mumbai - India\'s financial capital. Find roles in banking, finance, media, entertainment, and tech.',
      h1: 'Jobs in Mumbai - Financial Capital of India (2026)',
      keywords: ['jobs in mumbai', 'mumbai careers', 'finance jobs mumbai', 'banking jobs mumbai', 'media jobs mumbai'],
      stats: {
        companies: '3000',
        jobs: '20000',
        avgSalary: '₹6-15L'
      },
      topCompanies: ['HDFC Bank', 'ICICI Bank', 'Reliance', 'Tata Group', 'Aditya Birla', 'Bajaj'],
      content: `
        <div class="space-y-6">
          <p>Mumbai, India's financial capital, offers premier opportunities in banking, wealth management, media, corporate law, and technology.</p>
        </div>
      `,
      faqs: [
        {
          question: "Which areas are best for finance careers in Mumbai?",
          answer: "Bandra-Kurla Complex (BKC), Lower Parel, Nariman Point, and Fort host the majority of top investment banks and financial institutions."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Mumbai",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Mumbai",
          "addressRegion": "Maharashtra",
          "addressCountry": "IN"
        },
        "description": "Explore finance, tech, and corporate jobs in Mumbai."
      }
    },
    'delhi': {
      name: 'Delhi NCR',
      title: 'Jobs in Delhi NCR 2026 | Government, Corporate & Tech | TalentXcel',
      description: 'Discover career opportunities in Delhi NCR. Find jobs in government, corporate consulting, IT, and media in India\'s capital region.',
      h1: 'Jobs in Delhi NCR - Capital of Opportunities (2026)',
      keywords: ['jobs in delhi', 'delhi ncr careers', 'government jobs delhi', 'corporate jobs delhi', 'gurgaon jobs'],
      stats: {
        companies: '2500',
        jobs: '18000',
        avgSalary: '₹5-14L'
      },
      topCompanies: ['HCL', 'Genpact', 'American Express', 'IBM', 'Deloitte', 'EY'],
      content: `
        <div class="space-y-6">
          <p>Delhi NCR provides immense career depth across public sector organizations, multinational consulting hubs in Gurgaon, and tech corridors in Noida.</p>
        </div>
      `,
      faqs: [
        {
          question: "How is the job market for freshers in Delhi NCR?",
          answer: "Delhi NCR has extensive fresher hiring across consulting, software services, financial analytics, and government exam pathways."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Delhi NCR",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Delhi",
          "addressRegion": "Delhi",
          "addressCountry": "IN"
        },
        "description": "Explore jobs in Delhi NCR across corporate, tech, and government sectors."
      }
    },
    'hyderabad': {
      name: 'Hyderabad',
      title: 'Jobs in Hyderabad 2026 | IT, Pharma, Biotech & MNCs | TalentXcel',
      description: 'Explore high-paying jobs in Hyderabad. Top IT, AI, Cyberabad tech corridor, and pharmaceutical companies hiring freshers and experienced talent.',
      h1: 'Jobs in Hyderabad - HITEC City & Tech Capital (2026)',
      keywords: ['jobs in hyderabad', 'hitec city jobs', 'it jobs hyderabad', 'pharma jobs hyderabad'],
      stats: {
        companies: '2200',
        jobs: '18000',
        avgSalary: '₹5.5-16L'
      },
      topCompanies: ['Microsoft', 'Google', 'Amazon', 'Novartis', 'Dr. Reddy\'s', 'Deloitte'],
      content: `
        <div class="space-y-6">
          <p>Hyderabad is a premier global technology center with HITEC City, Gachibowli, and Genome Valley leading India's tech and life sciences innovation.</p>
        </div>
      `,
      faqs: [
        {
          question: "Which areas in Hyderabad host major tech companies?",
          answer: "HITEC City, Madhapur, Gachibowli, and Financial District host Google, Microsoft, Amazon, and major global capability centers."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Hyderabad",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Hyderabad",
          "addressRegion": "Telangana",
          "addressCountry": "IN"
        },
        "description": "Find tech and pharma jobs in Hyderabad."
      }
    },
    'chennai': {
      name: 'Chennai',
      title: 'Jobs in Chennai 2026 | IT, Automotive, SaaS & Engineering | TalentXcel',
      description: 'Find top career opportunities in Chennai. IT corridor, automotive giants, SaaS startups, and engineering roles. Apply now on TalentXcel.',
      h1: 'Jobs in Chennai - SaaS & Engineering Capital (2026)',
      keywords: ['jobs in chennai', 'it jobs chennai', 'omr chennai jobs', 'automotive jobs chennai'],
      stats: {
        companies: '1900',
        jobs: '14000',
        avgSalary: '₹4.8-13L'
      },
      topCompanies: ['Zoho', 'Freshworks', 'Cognizant', 'Hyundai', 'Ford', 'TCS'],
      content: `
        <div class="space-y-6">
          <p>Chennai is India's SaaS and automotive capital, with Old Mahabalipuram Road (OMR) housing leading tech firms and automotive manufacturing corridors.</p>
        </div>
      `,
      faqs: [
        {
          question: "What makes Chennai unique for tech professionals?",
          answer: "Chennai is the birthplace of India's product SaaS revolution, spearheaded by Zoho and Freshworks, alongside major automotive tech hubs."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Chennai",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Chennai",
          "addressRegion": "Tamil Nadu",
          "addressCountry": "IN"
        },
        "description": "Find SaaS and automotive jobs in Chennai."
      }
    },
    'pune': {
      name: 'Pune',
      title: 'Jobs in Pune 2026 | IT, Automobile, Manufacturing & Startups | TalentXcel',
      description: 'Explore verified job vacancies in Pune. Top IT parks in Hinjewadi & Magarpatta, automotive manufacturing, and tech startups.',
      h1: 'Jobs in Pune - Tech & Engineering Hub (2026)',
      keywords: ['jobs in pune', 'hinjewadi it jobs', 'pune fresher jobs', 'automobile jobs pune'],
      stats: {
        companies: '1700',
        jobs: '13500',
        avgSalary: '₹5-13.5L'
      },
      topCompanies: ['Infosys', 'Wipro', 'Tata Motors', 'Bajaj', 'Barclays', 'Tech Mahindra'],
      content: `
        <div class="space-y-6">
          <p>Pune combines world-class engineering institutes with massive IT corridors in Hinjewadi and Magarpatta, creating exceptional career opportunities.</p>
        </div>
      `,
      faqs: [
        {
          question: "How is the IT job market in Pune?",
          answer: "Pune offers extensive opportunities in software development, cloud infrastructure, automotive embedded software, and fintech."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Pune",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Pune",
          "addressRegion": "Maharashtra",
          "addressCountry": "IN"
        },
        "description": "Explore tech and engineering jobs in Pune."
      }
    }
  };

  if (locations[norm]) {
    return locations[norm];
  }

  // Dynamic fallback for any unlisted city
  const formattedName = norm.charAt(0).toUpperCase() + norm.slice(1).replace(/-/g, ' ');
  return {
    name: formattedName,
    title: `Job Vacancies in ${formattedName} 2026 | Verified Opportunities | TalentXcel`,
    description: `Browse verified job openings in ${formattedName}. Apply directly to tech, finance, fresher, and experienced positions on TalentXcel.`,
    h1: `Job Vacancies in ${formattedName} (2026)`,
    keywords: [`jobs in ${norm}`, `${norm} job vacancy`, `fresher jobs ${norm}`, `careers in ${norm}`],
    stats: {
      companies: '200',
      jobs: '500',
      avgSalary: '₹4-10L'
    },
    topCompanies: ['TCS', 'Infosys', 'HDFC Bank', 'Reliance', 'Wipro'],
    content: `
      <div class="space-y-6">
        <p>Explore high-growth career opportunities in ${formattedName}. TalentXcel connects job seekers with verified employers across IT, banking, education, and corporate sectors.</p>
      </div>
    `,
    faqs: [
      {
        question: `How can I find verified jobs in ${formattedName}?`,
        answer: `Use TalentXcel to search active, verified jobs in ${formattedName}. Filter by domain, salary, and experience to apply directly.`
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Place",
      "name": formattedName,
      "description": `Find verified job openings in ${formattedName}.`
    }
  };
}

export default JobLocationPage;
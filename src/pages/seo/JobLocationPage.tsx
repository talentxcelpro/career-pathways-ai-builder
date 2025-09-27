import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Building, TrendingUp } from 'lucide-react';

interface JobLocationPageProps {}

const JobLocationPage: React.FC<JobLocationPageProps> = () => {
  const { location } = useParams<{ location: string }>();
  
  const locationData = getLocationData(location || '');
  
  // Mock job data - in production, this would come from API
  const mockJobs = [
    {
      id: '1',
      title: 'Software Developer Fresher',
      description: 'Exciting opportunity for fresh graduates...',
      location: locationData.name,
      salary_min: 300000,
      salary_max: 500000,
      employment_type: 'full_time',
      is_remote: false,
      posted_at: new Date().toISOString(),
      company: {
        id: 'techcorp',
        name: 'TechCorp',
        logo_url: '/images/company-logo.png',
        industry: 'Technology'
      }
    }
  ];

  return (
    <>
      <Helmet>
        <title>{locationData.title}</title>
        <meta name="description" content={locationData.description} />
        <meta name="keywords" content={locationData.keywords.join(', ')} />
        <link rel="canonical" href={`https://talentxcel.in/jobs/${location}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={locationData.title} />
        <meta property="og:description" content={locationData.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://talentxcel.in/jobs/${location}`} />
        
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
        <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
                <li><span className="mx-2">/</span></li>
                <li><a href="/jobs" className="hover:text-foreground transition-colors">Jobs</a></li>
                <li><span className="mx-2">/</span></li>
                <li className="text-foreground font-medium">{locationData.name}</li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {locationData.h1}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {locationData.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
                  Find Jobs
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Filter className="h-5 w-5" />
                  Filter by Role
                </Button>
              </div>

              {/* Location Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-card p-6 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{locationData.stats.companies}+</span>
                  </div>
                  <p className="text-muted-foreground">Companies Hiring</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{locationData.stats.jobs}+</span>
                  </div>
                  <p className="text-muted-foreground">Active Jobs</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{locationData.stats.avgSalary}</span>
                  </div>
                  <p className="text-muted-foreground">Average Salary</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div 
                  className="prose prose-lg max-w-none mb-12"
                  dangerouslySetInnerHTML={{ __html: locationData.content }}
                />

                {/* Job Listings */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-foreground">Latest Jobs in {locationData.name}</h2>
                  <div className="grid gap-6">
                    {mockJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Popular Job Categories */}
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Popular Job Categories</h3>
                  <div className="space-y-2">
                    {['IT Jobs', 'Engineering Jobs', 'Marketing Jobs', 'Sales Jobs', 'Finance Jobs', 'HR Jobs'].map((category) => (
                      <a 
                        key={category}
                        href={`/jobs/${category.toLowerCase().replace(' ', '-')}`}
                        className="block text-muted-foreground hover:text-primary transition-colors"
                      >
                        {category} in {locationData.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Top Companies */}
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Top Companies in {locationData.name}</h3>
                  <div className="space-y-2">
                    {locationData.topCompanies.map((company) => (
                      <a 
                        key={company}
                        href={`/companies/${company.toLowerCase().replace(' ', '-')}`}
                        className="block text-muted-foreground hover:text-primary transition-colors"
                      >
                        {company}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Job Alerts */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Get Job Alerts</h3>
                  <p className="text-muted-foreground mb-4">
                    Get notified about new job openings in {locationData.name}
                  </p>
                  <Button className="w-full">
                    Create Job Alert
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {locationData.faqs && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl">
                <h2 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {locationData.faqs.map((faq, index) => (
                    <div key={index} className="bg-card p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

// Location data configuration
function getLocationData(location: string) {
  const locations: Record<string, any> = {
    'bangalore': {
      name: 'Bangalore',
      title: 'Jobs in Bangalore 2025 | IT, Engineering & All Categories | TalentXcel',
      description: 'Find the best jobs in Bangalore. Browse IT, engineering, marketing, and other career opportunities in India\'s Silicon Valley. Apply now!',
      h1: 'Jobs in Bangalore - India\'s Silicon Valley',
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
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Why Choose Bangalore for Your Career?</h2>
          <p>Bangalore offers unparalleled professional growth opportunities with its thriving startup ecosystem, established IT giants, and emerging technology sectors. The city provides excellent infrastructure, international exposure, and networking opportunities that can accelerate your career.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Major Industry Sectors</h2>
          <ul class="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Information Technology:</strong> Software development, product engineering, R&D centers</li>
            <li><strong>Biotechnology:</strong> Research, pharmaceuticals, healthcare innovation</li>
            <li><strong>Aerospace:</strong> HAL, ISRO, defense manufacturing</li>
            <li><strong>Startups:</strong> E-commerce, fintech, edtech, logistics</li>
            <li><strong>Manufacturing:</strong> Electronics, automotive components</li>
          </ul>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Salary Landscape</h2>
          <p>Bangalore offers competitive salaries across industries. IT professionals can expect ₹4-15 lakhs for freshers to seniors, while specialized roles in product companies and startups offer even higher compensation packages including ESOPs.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Work Culture & Lifestyle</h2>
          <p>The city is known for its cosmopolitan culture, pleasant weather, and vibrant nightlife. Most companies follow international work practices with emphasis on work-life balance, professional development, and inclusive workplace culture.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Career Growth Opportunities</h2>
          <p>Bangalore's diverse job market allows for excellent career mobility. The presence of global companies, consulting firms, and startups provides multiple pathways for career advancement and skill development.</p>
        </div>
      `,
      faqs: [
        {
          question: "What is the cost of living in Bangalore?",
          answer: "Bangalore has a moderate cost of living compared to Mumbai and Delhi. Accommodation costs vary by area, with tech corridors being more expensive. Overall, the salary-to-cost ratio remains favorable for most professionals."
        },
        {
          question: "Which areas are best for IT professionals in Bangalore?",
          answer: "Electronic City, Whitefield, Koramangala, HSR Layout, and Marathahalli are popular among IT professionals due to proximity to major tech companies and good connectivity."
        },
        {
          question: "How is the job market for freshers in Bangalore?",
          answer: "Bangalore has an excellent job market for freshers, especially in IT and startups. Many companies have dedicated fresher hiring programs with comprehensive training and mentorship."
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
        "description": "Find the best jobs in Bangalore. Browse IT, engineering, marketing, and other career opportunities in India's Silicon Valley."
      }
    },
    'mumbai': {
      name: 'Mumbai',
      title: 'Jobs in Mumbai 2025 | Finance, Media & All Industries | TalentXcel',
      description: 'Explore job opportunities in Mumbai - India\'s financial capital. Find roles in banking, finance, media, entertainment, and more. Apply today!',
      h1: 'Jobs in Mumbai - Financial Capital of India',
      keywords: ['jobs in mumbai', 'mumbai careers', 'finance jobs mumbai', 'banking jobs mumbai', 'media jobs mumbai'],
      stats: {
        companies: '3000',
        jobs: '20000',
        avgSalary: '₹6-15L'
      },
      topCompanies: ['HDFC Bank', 'ICICI Bank', 'Reliance', 'Tata Group', 'Aditya Birla', 'Bajaj'],
      content: `
        <div class="space-y-6">
          <p>Mumbai, India's financial and commercial capital, offers diverse career opportunities across banking, finance, entertainment, and business sectors. The city hosts the headquarters of major banks, stock exchanges, and multinational corporations.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Financial Hub Advantages</h2>
          <p>As home to BSE, NSE, RBI, and major banks, Mumbai provides unmatched opportunities in finance, investment banking, insurance, and fintech sectors. The city's financial ecosystem offers excellent career growth for finance professionals.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Key Industry Sectors</h2>
          <ul class="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Banking & Finance:</strong> Investment banking, retail banking, insurance, mutual funds</li>
            <li><strong>Entertainment & Media:</strong> Bollywood, television, advertising, digital media</li>
            <li><strong>Information Technology:</strong> Fintech, software development, IT services</li>
            <li><strong>Pharmaceuticals:</strong> Drug manufacturing, research, healthcare</li>
            <li><strong>Textiles & Diamonds:</strong> Trading, manufacturing, export</li>
          </ul>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Business Environment</h2>
          <p>Mumbai's business culture is fast-paced and professional. The city operates with efficiency and time consciousness, making it ideal for ambitious professionals seeking rapid career advancement.</p>
        </div>
      `,
      faqs: [
        {
          question: "Is Mumbai expensive for young professionals?",
          answer: "Mumbai has a higher cost of living, especially housing. However, salaries are generally higher to compensate, and the city offers excellent career growth opportunities that justify the investment."
        },
        {
          question: "Which areas are best for finance professionals?",
          answer: "Bandra-Kurla Complex (BKC), Lower Parel, Nariman Point, and Fort areas are financial hubs with proximity to major banks and financial institutions."
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
        "description": "Explore job opportunities in Mumbai - India's financial capital. Find roles in banking, finance, media, entertainment, and more."
      }
    },
    'delhi': {
      name: 'Delhi',
      title: 'Jobs in Delhi NCR 2025 | Government, Corporate & All Sectors | TalentXcel',
      description: 'Discover career opportunities in Delhi NCR. Find jobs in government, corporate, consulting, and all major industries in India\'s capital region.',
      h1: 'Jobs in Delhi NCR - Capital of Opportunities',
      keywords: ['jobs in delhi', 'delhi ncr careers', 'government jobs delhi', 'corporate jobs delhi', 'gurgaon jobs'],
      stats: {
        companies: '2500',
        jobs: '18000',
        avgSalary: '₹5-14L'
      },
      topCompanies: ['HCL', 'Genpact', 'American Express', 'IBM', 'Deloitte', 'EY'],
      content: `
        <div class="space-y-6">
          <p>Delhi NCR, India's political and administrative capital, offers diverse career opportunities in government, corporate, consulting, and emerging sectors. The region combines traditional governance roles with modern business opportunities.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Government & Public Sector</h2>
          <p>Delhi offers numerous opportunities in central government, public sector undertakings, diplomatic services, and policy organizations. These roles provide job security, structured growth, and the opportunity to serve the nation.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Corporate Landscape</h2>
          <p>Gurgaon and Noida have emerged as major corporate hubs hosting IT services, consulting firms, financial services, and multinational corporations. The region offers excellent infrastructure and business environment.</p>
        </div>
      `,
      faqs: [
        {
          question: "How is the work culture in Delhi NCR?",
          answer: "Delhi NCR has a diverse work culture ranging from formal government environments to dynamic corporate setups in Gurgaon and Noida. Most organizations follow professional practices with good work-life balance."
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
        "description": "Discover career opportunities in Delhi NCR. Find jobs in government, corporate, consulting, and all major industries."
      }
    }
  };

  return locations[location] || locations['bangalore'];
}

export default JobLocationPage;
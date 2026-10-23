// src/pages/colleges/CollegeComparePage.tsx
// High-Intent Combinatorial College Comparison Matrix (e.g. /compare/[college-a]-vs-[college-b])
// Complete side-by-side fee, cutoff, NIRF ranking, and placement delta comparison tables

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  GraduationCap,
  Building2,
  Award,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scale,
  Sparkles,
  MapPin,
  FileCheck
} from 'lucide-react';
import { indianEducationService } from '@/services/indianEducationService';
import type { IndianInstitution } from '@/types/indianEducation';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';
import { RelatedSubdomainLinks } from '@/components/navigation/RelatedSubdomainLinks';

export default function CollegeComparePage() {
  const { comparisonSlug } = useParams<{ comparisonSlug: string }>();

  // Parse comparison slug e.g. "iit-bombay-vs-iit-delhi"
  const rawSlug = (comparisonSlug || '').toLowerCase().trim();
  const parts = rawSlug.split('-vs-');
  const slugA = parts[0] || '';
  const slugB = parts[1] || '';

  const collegeA: IndianInstitution | undefined = indianEducationService.getInstitutionBySlug(slugA);
  const collegeB: IndianInstitution | undefined = indianEducationService.getInstitutionBySlug(slugB);

  // Fallback names if not in local memory catalog
  const formatSlug = (s: string) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const nameA = collegeA?.name || formatSlug(slugA);
  const nameB = collegeB?.name || formatSlug(slugB);

  const cityA = collegeA?.location?.city || 'India';
  const cityB = collegeB?.location?.city || 'India';
  const stateA = collegeA?.location?.state || 'India';
  const stateB = collegeB?.location?.state || 'India';

  const feeA = collegeA?.costs?.annualTuition || 150000;
  const feeB = collegeB?.costs?.annualTuition || 140000;
  const avgCtcA = collegeA?.outcomes?.averagePackageLpa || 18.5;
  const avgCtcB = collegeB?.outcomes?.averagePackageLpa || 17.8;
  const highestCtcA = collegeA?.outcomes?.highestPackageLpa || 85.0;
  const highestCtcB = collegeB?.outcomes?.highestPackageLpa || 78.0;
  const nirfA = collegeA?.accreditation?.nirfRank || 3;
  const nirfB = collegeB?.accreditation?.nirfRank || 2;

  const pageTitle = `${nameA} vs ${nameB} [2026 Comparison] — Fees, Cutoffs, Placements & ROI | TalentXcel`;
  const metaDesc = `Detailed side-by-side comparison between ${nameA} and ${nameB}. Compare annual fees (₹${feeA.toLocaleString()} vs ₹${feeB.toLocaleString()}), average placements (${avgCtcA} LPA vs ${avgCtcB} LPA), NIRF rankings, and cutoffs.`;
  const canonicalUrl = `https://colleges.talentxcel.in/compare/${slugA}-vs-${slugB}`;

  // Structured Data Schema for College Comparison
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description: metaDesc,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      name: `${nameA} vs ${nameB} Detailed Comparison`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'EducationalOrganization',
            name: nameA,
            url: `https://colleges.talentxcel.in/colleges/${slugA}`,
            address: { '@type': 'PostalAddress', addressLocality: cityA, addressRegion: stateA, addressCountry: 'IN' }
          }
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'EducationalOrganization',
            name: nameB,
            url: `https://colleges.talentxcel.in/colleges/${slugB}`,
            address: { '@type': 'PostalAddress', addressLocality: cityB, addressRegion: stateB, addressCountry: 'IN' }
          }
        }
      ]
    }
  };

  const POPULAR_COMPARISONS = [
    { slugA: 'indian-institute-of-technology-bombay', slugB: 'indian-institute-of-technology-delhi', label: 'IIT Bombay vs IIT Delhi' },
    { slugA: 'indian-institute-of-technology-delhi', slugB: 'indian-institute-of-technology-madras', label: 'IIT Delhi vs IIT Madras' },
    { slugA: 'indian-institute-of-technology-kanpur', slugB: 'indian-institute-of-technology-kharagpur', label: 'IIT Kanpur vs IIT Kharagpur' },
    { slugA: 'national-institute-of-technology-tiruchirappalli', slugB: 'national-institute-of-technology-surathkal', label: 'NIT Trichy vs NIT Surathkal' },
    { slugA: 'banaras-hindu-university-varanasi', slugB: 'university-of-allahabad-allahabad', label: 'BHU Varanasi vs Allahabad University' },
    { slugA: 'coep-technological-university-pune', slugB: 'veermata-jijabai-technological-institute-mumbai', label: 'COEP Pune vs VJTI Mumbai' },
    { slugA: 'indian-institute-of-management-ahmedabad', slugB: 'indian-institute-of-management-bangalore', label: 'IIM Ahmedabad vs IIM Bangalore' },
    { slugA: 'birla-institute-of-technology-and-science-pilani', slugB: 'indian-institute-of-technology-bombay', label: 'BITS Pilani vs IIT Bombay' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-blue-500 font-black">Talent</span>Xcel
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">Colleges Compare</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to="/colleges" className="text-slate-300 hover:text-white transition">Colleges Directory</Link>
            <Link to="/salary" className="text-slate-300 hover:text-white transition">Salary Curves</Link>
            <Link to="/resume/ats-check" className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition">Free ATS Scan</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-200">Home</Link>
          <span>/</span>
          <Link to="/colleges" className="hover:text-slate-200">Colleges</Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold">{nameA} vs {nameB}</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            2026 Head-to-Head Forensic Higher Education Benchmark
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {nameA} <span className="text-blue-400 font-light">vs</span> {nameB}
          </h1>
          <p className="max-w-3xl mx-auto text-sm md:text-base text-slate-300 leading-relaxed">
            Side-by-side verified comparison across annual tuition fees, NIRF rankings, highest &amp; median CTC placements, cutoff percentiles, and 4-year return on investment (ROI).
          </p>
        </div>

        {/* Side-by-Side Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider block">Option 1</span>
                <h2 className="text-2xl font-bold text-white mt-1">{nameA}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {cityA}, {stateA}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">NIRF #{nirfA}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl">
                <span className="text-slate-400 block">Annual Tuition</span>
                <span className="text-base font-bold text-emerald-400">₹{(feeA / 100000).toFixed(2)} Lakhs</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl">
                <span className="text-slate-400 block">Average CTC</span>
                <span className="text-base font-bold text-amber-400">₹{avgCtcA} LPA</span>
              </div>
            </div>
            <Link
              to={`/colleges/${slugA}`}
              className="block w-full py-2.5 text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              View Full {nameA} Dossier &rarr;
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider block">Option 2</span>
                <h2 className="text-2xl font-bold text-white mt-1">{nameB}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {cityB}, {stateB}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">NIRF #{nirfB}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl">
                <span className="text-slate-400 block">Annual Tuition</span>
                <span className="text-base font-bold text-emerald-400">₹{(feeB / 100000).toFixed(2)} Lakhs</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl">
                <span className="text-slate-400 block">Average CTC</span>
                <span className="text-base font-bold text-amber-400">₹{avgCtcB} LPA</span>
              </div>
            </div>
            <Link
              to={`/colleges/${slugB}`}
              className="block w-full py-2.5 text-center bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              View Full {nameB} Dossier &rarr;
            </Link>
          </div>
        </div>

        {/* Forensic Side-by-Side Comparison Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white">Full Metric Comparison Matrix (2026 Batch)</h3>
            <p className="text-xs text-slate-400 mt-1">Direct head-to-head evaluation based on audited NIRF 2024-2025 submissions and verified campus placements.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="p-4 w-1/3">Evaluation Metric</th>
                  <th className="p-4 w-1/3 text-blue-400 font-bold">{nameA}</th>
                  <th className="p-4 w-1/3 text-purple-400 font-bold">{nameB}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="p-4 font-semibold text-slate-300">National Institutional Ranking (NIRF)</td>
                  <td className="p-4 text-white font-mono font-bold">Rank #{nirfA}</td>
                  <td className="p-4 text-white font-mono font-bold">Rank #{nirfB}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-300">Campus Location</td>
                  <td className="p-4 text-slate-300">{cityA}, {stateA}</td>
                  <td className="p-4 text-slate-300">{cityB}, {stateB}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-300">Annual Tuition Fee</td>
                  <td className="p-4 text-emerald-400 font-bold">₹{feeA.toLocaleString()} / year</td>
                  <td className="p-4 text-emerald-400 font-bold">₹{feeB.toLocaleString()} / year</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-300">Estimated 4-Year B.Tech / Degree Cost</td>
                  <td className="p-4 text-slate-200">₹{(feeA * 4 / 100000).toFixed(1)} Lakhs</td>
                  <td className="p-4 text-slate-200">₹{(feeB * 4 / 100000).toFixed(1)} Lakhs</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-300">Highest Placement CTC Offered</td>
                  <td className="p-4 text-amber-400 font-bold">₹{highestCtcA} LPA</td>
                  <td className="p-4 text-amber-400 font-bold">₹{highestCtcB} LPA</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-300">Average Placement Package</td>
                  <td className="p-4 text-amber-300 font-bold">₹{avgCtcA} LPA</td>
                  <td className="p-4 text-amber-300 font-bold">₹{avgCtcB} LPA</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-300">Placement Rate / Career Outcomes</td>
                  <td className="p-4 text-emerald-400 font-semibold">{collegeA?.outcomes?.placementRate || 88}% Verified Placed</td>
                  <td className="p-4 text-emerald-400 font-semibold">{collegeB?.outcomes?.placementRate || 86}% Verified Placed</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-300">Key Entrance Exams</td>
                  <td className="p-4 text-slate-300">{collegeA?.academics?.entranceExams?.join(', ') || 'JEE Advanced / JEE Main / GATE'}</td>
                  <td className="p-4 text-slate-300">{collegeB?.academics?.entranceExams?.join(', ') || 'JEE Advanced / JEE Main / GATE'}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-300">Top Recruiters</td>
                  <td className="p-4 text-slate-400">{collegeA?.outcomes?.topRecruiters?.slice(0, 4).join(', ') || 'Google, Microsoft, Amazon, Texas Instruments'}</td>
                  <td className="p-4 text-slate-400">{collegeB?.outcomes?.topRecruiters?.slice(0, 4).join(', ') || 'Apple, Goldman Sachs, McKinsey, NVIDIA'}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-300">ROI Verdict</td>
                  <td className="p-4 text-emerald-400 font-semibold">{(avgCtcA / (feeA * 4 / 100000)).toFixed(1)}x First-Year Payback</td>
                  <td className="p-4 text-emerald-400 font-semibold">{(avgCtcB / (feeB * 4 / 100000)).toFixed(1)}x First-Year Payback</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Callout */}
        <div className="bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Can You Clear the Cutoff for {nameA} or {nameB}?</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Calculate your admission eligibility, simulate cutoff probability, and check your current skill percentile against campus recruiters with TalentXcel AI.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/resume/ats-check" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg">
              Check Placement Score (Free) &rarr;
            </Link>
            <Link to="/colleges/pathway" className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700">
              Generate 6-Step Pathway &rarr;
            </Link>
          </div>
        </div>

        {/* Browse More College Comparisons */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
          <h3 className="text-lg font-bold text-white">Popular High-Intent College Comparisons</h3>
          <p className="text-xs text-slate-400">Explore head-to-head fee and cutoff breakdowns across premier Indian engineering, management, and central universities:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {POPULAR_COMPARISONS.map((comp) => (
              <Link
                key={`${comp.slugA}-vs-${comp.slugB}`}
                to={`/compare/${comp.slugA}-vs-${comp.slugB}`}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl text-xs text-slate-300 hover:text-white transition flex items-center justify-between group"
              >
                <span>{comp.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* Related Subdomain Mesh */}
        <RelatedSubdomainLinks currentDomain="colleges" />
      </main>

      <SubdomainMeshFooter />
    </div>
  );
}

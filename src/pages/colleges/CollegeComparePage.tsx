import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { indianEducationService } from '@/services/indianEducationService';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';

export default function CollegeComparePage() {
  const { comparisonSlug = '' } = useParams<{ comparisonSlug: string }>();
  const parts = comparisonSlug.toLowerCase().trim().split('-vs-');
  const slugA = parts[0] || '';
  const slugB = parts[1] || '';
  const formatSlug = (slug: string) => slug.split('-').filter(Boolean).map((word) =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  const collegeA = indianEducationService.getInstitutionBySlug(slugA);
  const collegeB = indianEducationService.getInstitutionBySlug(slugB);
  const nameA = collegeA?.name || formatSlug(slugA);
  const nameB = collegeB?.name || formatSlug(slugB);
  const pageTitle = `${nameA} vs ${nameB} | TalentXcel`;
  const metaDescription = `Review available profile information for ${nameA} and ${nameB} on TalentXcel.`;
  const canonicalUrl = `https://talentxcel.in/compare/${slugA}-vs-${slugB}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-200">Home</Link>
          <span>/</span>
          <Link to="/colleges" className="hover:text-slate-200">Colleges</Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold">{nameA} vs {nameB}</span>
        </nav>

        <header className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-10 space-y-4">
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <GraduationCap className="w-5 h-5" aria-hidden="true" />
            Institution profiles
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{nameA} vs {nameB}</h1>
          <p className="text-sm leading-relaxed text-slate-300">
            Review the available information on each institution profile.
          </p>
        </header>

        <section aria-label="Institution profiles" className="grid gap-4 sm:grid-cols-2">
          {[{ slug: slugA, name: nameA }, { slug: slugB, name: nameB }].map(({ slug, name }) => (
            <Link
              key={slug}
              to={`/colleges/${slug}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-blue-500/60"
            >
              <span className="font-semibold text-white">Review {name} profile</span>
              <ArrowRight className="w-4 h-4 shrink-0 text-blue-300" aria-hidden="true" />
            </Link>
          ))}
        </section>
      </main>

      <SubdomainMeshFooter />
    </div>
  );
}

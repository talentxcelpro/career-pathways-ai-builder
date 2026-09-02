
import React from 'react';
import { Link } from 'react-router-dom';
import { SocialConnect } from '../social/SocialConnect';
import {
  CANDIDATE_SERVICES,
  EMPLOYER_SERVICES,
  INDUSTRY_HUBS,
  LOCATION_HUBS,
  RESOURCE_HUBS,
} from '@/config/publicIA';

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center p-1 border border-slate-700">
                <img 
                  src="/talentxcel-official-logo.png" 
                  alt="TalentXcel Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-bold text-xl">TalentXcel</span>
            </div>
            <p className="text-background/70 mb-4 text-sm leading-relaxed">
              India's AI career platform for jobs, resumes, colleges, learning, career passports and professional networking.
            </p>
            <p className="text-background/50 text-xs">
              © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
            </p>
          </div>

          {/* Platform Hub Links */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-background/70 hover:text-background transition-colors text-sm">
                  Search Verified Jobs
                </Link>
              </li>
              <li>
                <Link to="/resume" className="text-background/70 hover:text-background transition-colors text-sm">
                  AI Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/colleges" className="text-background/70 hover:text-background transition-colors text-sm">
                  Indian Colleges &amp; Universities
                </Link>
              </li>
              <li>
                <Link to="/learning" className="text-background/70 hover:text-background transition-colors text-sm">
                  Career Learning Hub
                </Link>
              </li>
              <li>
                <Link to="/passport" className="text-background/70 hover:text-background transition-colors text-sm">
                  Career Passport
                </Link>
              </li>
              <li>
                <Link to="/network" className="text-background/70 hover:text-background transition-colors text-sm">
                  Professional Network
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-background/70 hover:text-background transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-background/70 hover:text-background transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-background/70 hover:text-background transition-colors">
                  News &amp; Press
                </Link>
              </li>
              <li>
                <a 
                  href="https://chatrchat.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-background/70 hover:text-background transition-colors inline-flex items-center gap-1 text-sm font-medium text-emerald-400"
                >
                  ChatrChat for Business ↗
                </a>
              </li>
              <li>
                <a 
                  href="https://talentxcel.co.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-background/70 hover:text-background transition-colors inline-flex items-center gap-1 text-sm"
                >
                  TalentXcel Corporate ↗
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 hover:text-background transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-background/70 hover:text-background transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacypolicy" className="text-background/70 hover:text-background transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-background/70 hover:text-background transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/return-refund-policy" className="text-background/70 hover:text-background transition-colors">
                  Return &amp; Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Connect */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Connect With Us</h3>
            <div className="text-background/70">
              <SocialConnect
                showDescription={false}
                variant="compact"
                size="sm"
              />
              <p className="text-sm text-background/50 mt-3">
                Follow us for career tips, job updates, and industry insights.
              </p>
            </div>
          </div>
        </div>

        {/* Public information architecture — sitewide crawlable links */}
        <nav aria-label="Site directory" className="border-t border-background/20 mt-8 pt-8 grid grid-cols-2 md:grid-cols-5 gap-8">
          {[
            { heading: 'For Candidates', links: CANDIDATE_SERVICES.map((s) => ({ to: `/${s.slug}`, label: s.title })) },
            { heading: 'For Employers', links: [{ to: '/employers', label: 'Hiring Solutions' }, ...EMPLOYER_SERVICES.map((s) => ({ to: `/${s.slug}`, label: s.title }))] },
            { heading: 'Industries', links: [...INDUSTRY_HUBS.slice(0, 6).map((i) => ({ to: `/industries/${i.slug}`, label: i.name })), { to: '/industries', label: 'All industries' }] },
            { heading: 'Locations', links: [...LOCATION_HUBS.slice(1, 7).map((l) => ({ to: `/locations/${l.slug}`, label: l.name })), { to: '/locations', label: 'All locations' }] },
            { heading: 'Resources', links: [...RESOURCE_HUBS.map((r) => ({ to: `/resources/${r.slug}`, label: r.name })), { to: '/company-info', label: 'Company' }] },
          ].map((col) => (
            <div key={col.heading}>
              <h3 className="font-semibold text-sm mb-3">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-background/70 hover:text-background transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Divider and bottom corporate address section */}
        <div className="border-t border-background/20 mt-8 pt-8 text-center space-y-2">
          <p className="text-background/70 text-sm font-medium">
            TalentXcel Services Private Limited
          </p>
          <p className="text-background/50 text-xs max-w-xl mx-auto">
            19th Floor, E-Square Building, Corp. Office 1917, Noida Expressway Service Rd, Sector 96, Noida, Uttar Pradesh, India
          </p>
          <p className="text-background/40 text-xs pt-2">
            Ecosystem: <a href="https://chatrchat.in" target="_blank" rel="noopener noreferrer" className="hover:underline text-background/70 font-semibold">ChatrChat for Business</a> • <a href="https://talentxcel.co.in" target="_blank" rel="noopener noreferrer" className="hover:underline text-background/70">TalentXcel Corporate</a> • <a href="https://chatr.chat" target="_blank" rel="noopener noreferrer" className="hover:underline text-background/70">Chatr Messenger</a>
          </p>
          <p className="text-background/40 text-xs">
            © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

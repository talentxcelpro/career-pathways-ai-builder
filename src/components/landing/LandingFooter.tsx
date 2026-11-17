import React from 'react';
import { Link } from 'react-router-dom';
import { SocialConnect } from '@/components/social/SocialConnect';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';

export const LandingFooter: React.FC = () => {
  const platformLinks = [
    { name: 'Search Verified Jobs', href: '/jobs' },
    { name: 'Free ATS Resume Checker', href: '/ats-check' },
    { name: 'AI Resume Builder', href: '/resume-builder' },
    { name: 'Professional Network & Directory', href: '/network' },
    { name: 'Career Passport & TalentScore', href: '/passport' },
    { name: 'Salary Intelligence & Curves', href: '/salary' },
    { name: 'Career Pathways & Roadmaps', href: '/career-paths' },
    { name: 'Top Companies & Employers', href: '/companies' },
    { name: 'Colleges & Institutions', href: '/colleges' },
    { name: 'Government & PSU Jobs', href: '/government' },
    { name: 'Recruiter OS for Employers', href: '/recruiters' },
    { name: 'Career Reels', href: '/reels' },
  ];

  const companyLinks = [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'News & Press', href: '/news' },
    { name: 'Contact', href: '/contact' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Return & Refund Policy', href: '/return-refund-policy' },
  ];

  return (
    <footer className="bg-foreground text-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-2xl font-bold">TalentXcel</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              The high-velocity Career Operating System & Professional Network. 
              Search verified jobs, benchmark technology salaries, build ATS-optimized resumes, and claim your verified Career Passport.
            </p>
            <div className="pt-2">
              <SocialConnect />
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Career Ecosystem</h4>
            <ul className="space-y-2 text-sm">
              {platformLinks.slice(0, 6).map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Intelligence Hubs</h4>
            <ul className="space-y-2 text-sm">
              {platformLinks.slice(6).map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Support Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Company & Trust</h4>
            <ul className="space-y-2 text-sm">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* High-Authority Cross-Subdomain Internal Mesh */}
        <div className="mt-12 pt-8 border-t border-muted/20">
          <SubdomainMeshFooter />
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-muted/20 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TalentXcel. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

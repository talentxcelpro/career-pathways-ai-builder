import React from 'react';
import { Link } from 'react-router-dom';
import { SocialConnect } from '@/components/social/SocialConnect';

export const LandingFooter: React.FC = () => {
  const platformLinks = [
    { name: 'Search Verified Jobs', href: '/jobs' },
    { name: 'AI Resume Builder', href: '/resume' },
    { name: 'Indian Colleges & Universities', href: '/colleges' },
    { name: 'Career Learning Hub', href: '/learning' },
    { name: 'Career Passport', href: '/passport' },
    { name: 'Professional Network', href: '/network' },
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
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                alt="TalentXcel Logo" 
                className="h-8 w-8 rounded-sm"
              />
              <span className="font-bold text-xl">TalentXcel</span>
            </div>
            <p className="text-background/70 mb-4 text-sm leading-relaxed">
              India's AI career platform connecting Jobs, Resumes, Colleges, Learning, Career Passports and Professional Networking.
            </p>
            <p className="text-background/50 text-xs">
              © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
            </p>
          </div>

          {/* Platform Hub Links */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Platform</h3>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Connect */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Connect With Us</h3>
            <div className="text-background/70">
              <SocialConnect
                showDescription={false}
                variant="compact"
                size="sm"
              />
              <p className="text-xs text-background/50 mt-3">
                Follow us for career opportunities, college updates, and skill roadmaps.
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom copyright */}
        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-background/50 text-xs">
            © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

export const BrandedFooter: React.FC = () => {
  const moduleLinks = [
    { name: 'Companies', href: '/companies' },
    { name: 'Tools', href: '/tools' },
    { name: 'Services', href: '/services' },
    { name: 'Learning', href: '/learning' },
    { name: 'Colleges', href: '/colleges' },
    { name: 'Career Map', href: '/career-map' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground py-12 px-4 mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4 font-display">TalentXcel</h3>
            <p className="text-primary-foreground/80 mb-4">
              Empowering careers with AI-powered insights and professional tools.
            </p>
          </div>

          {/* Modules */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-display">Modules</h4>
            <ul className="space-y-2">
              {moduleLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-display">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© 2026 TalentXcel. All rights reserved. Powered by AI.</p>
        </div>
      </div>
    </footer>
  );
};
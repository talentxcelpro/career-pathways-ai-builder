import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

export const ComprehensiveFooter = () => {
  const productLinks = [
    { name: 'Resume Builder', href: '/tools/resume-builder' },
    { name: 'Career Map', href: '/career-map' },
    { name: 'Job Search', href: '/jobs' },
    { name: 'Learning Hub', href: '/learning' },
    { name: 'Networking', href: '/network' },
  ];

  const companyLinks = [
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Become a Provider', href: '/provider' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Security', href: '/security' },
    { name: 'API', href: '/api' },
    { name: 'Return & Refund Policy', href: '/refund-policy' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'YouTube', icon: Youtube, href: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-6">
              <span className="text-2xl font-bold text-white">TalentXcel</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering professionals worldwide to achieve their career goals through AI-powered insights and meaningful connections.
            </p>
            
            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Connect With Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Follow us for career tips, job updates, and industry insights.
              </p>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-500">
              © 2025 TalentXcel. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 mt-2 md:mt-0">
              Empowering professionals with AI-powered tools for career growth, job discovery, and skill development.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
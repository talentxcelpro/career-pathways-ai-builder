
import React from 'react';
import { Link } from 'react-router-dom';
import { SocialConnect } from '../social/SocialConnect';

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                alt="TalentXcel Logo" 
                className="h-8 w-8 rounded-sm"
              />
              <span className="font-bold text-xl">TalentXcel</span>
            </div>
            <p className="text-background/70 mb-4">
              Empowering professionals with AI-powered tools for career growth, job discovery, and skill development.
            </p>
            <p className="text-background/50 text-sm">
              © 2026 TalentXcel Technologies Pvt Ltd. All rights reserved.
            </p>
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
                  News & Press
                </Link>
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
                  Return & Refund Policy
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
        
        {/* Divider and bottom section */}
        <div className="border-t border-background/20 mt-8 pt-8">
          <div className="flex justify-center">
            <p className="text-background/50 text-sm text-center">
              © 2026 TalentXcel Technologies Pvt Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

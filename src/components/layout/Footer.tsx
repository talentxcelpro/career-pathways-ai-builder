
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Help Center', href: '/help' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/5a3d4a06-3cd5-45aa-b2bd-897e40811280.png" 
              alt="TalentXcel Logo" 
              className="h-6 w-auto"
            />
            <span className="text-sm text-gray-600">© 2025 TalentXcel. All rights reserved.</span>
          </div>
          
          <nav className="flex flex-wrap justify-center md:justify-end gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '../auth/AuthDialog';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TalentXcelNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'About', href: '#about' },
    { name: 'Network', href: '/network' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'Learning', href: '/learning' },
    { name: 'Tools', href: '/tools' },
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Empty brand space */}
          <div className="flex items-center">
            {/* No logo or text */}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <AuthDialog>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10 border border-white/20"
              >
                Sign In
              </Button>
            </AuthDialog>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-white/90 hover:text-white transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/20">
                <AuthDialog>
                  <Button 
                    className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold"
                  >
                    Sign In
                  </Button>
                </AuthDialog>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
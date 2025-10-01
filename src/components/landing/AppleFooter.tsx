import React from 'react';
import { Link } from 'react-router-dom';

export const AppleFooter = () => {
  return (
    <footer className="bg-slate-50 py-16 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main footer content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                alt="TalentXcel" 
                className="h-8 w-8 rounded-sm"
              />
              <span className="text-xl font-semibold text-slate-900">TalentXcel</span>
            </div>
            <p className="text-slate-600 font-light leading-relaxed">
              Empowering professionals worldwide to achieve their career goals through AI-powered insights and meaningful connections.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Product</h3>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link to="/resume" className="hover:text-slate-900 transition-colors font-light">
                  TalentXcel Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/career-map" className="hover:text-slate-900 transition-colors font-light">
                  Career Map
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-slate-900 transition-colors font-light">
                  Job Search
                </Link>
              </li>
              <li>
                <Link to="/learning" className="hover:text-slate-900 transition-colors font-light">
                  Learning Hub
                </Link>
              </li>
              <li>
                <Link to="/network" className="hover:text-slate-900 transition-colors font-light">
                  Networking
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link to="/about" className="hover:text-slate-900 transition-colors font-light">
                  About
                </Link>
              </li>
              <li>
                <Link to="/marketplace/post-service" className="hover:text-primary transition-colors font-medium">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-slate-900 transition-colors font-light">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-slate-900 transition-colors font-light">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-slate-900 transition-colors font-light">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Support</h3>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link to="/help" className="hover:text-slate-900 transition-colors font-light">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-slate-900 transition-colors font-light">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-slate-900 transition-colors font-light">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-slate-900 transition-colors font-light">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/api" className="hover:text-slate-900 transition-colors font-light">
                  API
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center space-x-6 mb-8">
          <a href="#" className="w-10 h-10 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </a>
          <a href="#" className="w-10 h-10 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="#" className="w-10 h-10 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.093.112.107.21.079.323-.085.356-.274 1.129-.311 1.287-.049.21-.402.085-.402.085-1.499-.696-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
            </svg>
          </a>
          <a href="#" className="w-10 h-10 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-slate-200">
          <p className="text-slate-500 font-light">
            © 2025 TalentXcel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
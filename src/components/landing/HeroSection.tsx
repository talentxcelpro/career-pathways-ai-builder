
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Menu, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleEmailSignIn = () => {
    if (email) {
      navigate('/auth/login', { state: { email } });
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      <div className="absolute top-0 right-0 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20"></div>
      </div>

      {/* Top-right Auth Buttons */}
      <div className="absolute top-4 right-4 z-10 hidden md:flex gap-2">
        <Button 
          variant="outline"
          onClick={() => navigate('/auth/login')}
          className="border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/auth/login')}
          className="border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          <svg className="w-4 h-4" fill="#0077B5" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </Button>
        <Button 
          variant="ghost"
          onClick={() => navigate('/auth/login')}
          className="text-gray-700 px-4 py-2 hover:bg-white/80"
        >
          Sign In
        </Button>
        <Button 
          onClick={() => navigate('/auth/register')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Join Now
        </Button>
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 right-4 z-10 md:hidden p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 min-w-[200px]">
          <div className="flex flex-col space-y-3">
            <Button 
              variant="outline"
              onClick={() => {
                navigate('/auth/login');
                setIsMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                navigate('/auth/login');
                setIsMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2"
            >
              <svg className="w-4 h-4" fill="#0077B5" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                navigate('/auth/login');
                setIsMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => {
                navigate('/auth/register');
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Join Now
            </Button>
          </div>
        </div>
      )}

      {/* Main Hero Section */}
      <section className="relative pt-20 pb-20 sm:pt-24 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-screen flex flex-col md:flex-row items-center">
            {/* Left Section - Text + CTA */}
            <div className="flex-1 flex flex-col justify-center px-4 md:px-10 py-10 md:py-20">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Powering Global
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Career Growth
                </span>
              </h1>
              
              <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
                Your all-in-one platform for networking, skill-building, and finding the perfect career opportunities tailored to your unique journey.
              </p>
              
              {/* Email Sign-In */}
              <div className="space-y-4 mb-8">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full max-w-md p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button 
                  onClick={handleEmailSignIn}
                  className="w-full max-w-md bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 text-base font-semibold"
                >
                  Sign In with Email
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Divider + Alt Sign-up */}
              <div className="max-w-md space-y-3">
                <div className="text-sm text-gray-500 mb-2">New to TalentXcel?</div>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/auth/register')}
                  className="w-full max-w-md border-2 border-blue-600 text-blue-600 p-4 rounded-lg hover:bg-blue-50 transition-all duration-300 text-base font-semibold"
                >
                  Join Now
                </Button>
              </div>
            </div>

            {/* Right Section - Visual Appeal */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
                    alt="Professional handshake representing career growth and networking"
                    className="w-full h-auto object-cover max-w-lg"
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full opacity-20 blur-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

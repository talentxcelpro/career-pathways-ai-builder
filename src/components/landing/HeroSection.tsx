
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Menu, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { SocialLogin } from '../auth/SocialLogin';

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

      {/* Top-right Enhanced Auth Buttons */}
      <div className="absolute top-4 right-4 z-10 hidden md:flex flex-col gap-2 min-w-[200px]">
        <SocialLogin showText={false} />
        <div className="flex gap-2">
          <Button 
            variant="ghost"
            onClick={() => navigate('/auth/login')}
            className="text-gray-700 px-4 py-2 hover:bg-white/80 flex-1"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate('/auth/register')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-1"
          >
            Join Now
          </Button>
        </div>
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

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 right-4 z-10 md:hidden p-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 min-w-[250px]">
          <div className="flex flex-col space-y-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Quick Sign In</div>
            <SocialLogin />
            <div className="flex gap-2 pt-2 border-t">
              <Button 
                variant="ghost" 
                onClick={() => {
                  navigate('/auth/login');
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => {
                  navigate('/auth/register');
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Join Now
              </Button>
            </div>
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
              
              {/* Enhanced Social Login for Hero */}
              <div className="space-y-6 mb-8 max-w-md">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Get started in seconds</h3>
                  <SocialLogin variant="prominent" />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or with email</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button 
                    onClick={handleEmailSignIn}
                    className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 text-base font-semibold"
                  >
                    Continue with Email
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="max-w-md">
                <div className="text-sm text-gray-500 mb-2">New to TalentXcel?</div>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/auth/register')}
                  className="w-full border-2 border-blue-600 text-blue-600 p-4 rounded-lg hover:bg-blue-50 transition-all duration-300 text-base font-semibold"
                >
                  Create Free Account
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

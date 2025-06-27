
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, CheckCircle, Shield, Globe, Menu, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      <div className="absolute top-0 right-0 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20"></div>
      </div>

      {/* Hero Section with integrated navigation */}
      <section className="relative pt-8 pb-20 sm:pt-12 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand and Auth Section */}
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">TX</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  TalentXcel
                </span>
                <p className="text-sm text-gray-600 mt-1">Your Career. One Platform. Endless Possibilities.</p>
              </div>
            </div>
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth/login')}
                className="text-gray-600 hover:text-gray-900 px-6"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth/register')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-6"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mb-8 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
              <div className="flex flex-col space-y-3">
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
          
          {/* Hero Content */}
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-50 border border-blue-200 mb-8 shadow-sm">
              <Zap className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-blue-800">AI-Powered Career Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Career Journey
              </span>
              <span className="block text-4xl md:text-5xl text-gray-700 mt-2">
                with AI Excellence
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Build your professional profile, discover opportunities, learn new skills, and let AI guide your career growth - all in one comprehensive platform.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl"
                onClick={() => navigate('/auth/register')}
              >
                Start Your Journey
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-10 py-7 text-lg border-2 hover:bg-gray-50 rounded-xl shadow-lg"
              >
                Watch Demo
              </Button>
            </div>

            {/* Enhanced Social Proof */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[
                { icon: CheckCircle, text: "10,000+ Professionals", color: "text-green-500" },
                { icon: Shield, text: "500+ Companies", color: "text-blue-500" },
                { icon: Globe, text: "98% Success Rate", color: "text-purple-500" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

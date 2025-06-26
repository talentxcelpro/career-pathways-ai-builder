
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-bold text-white mb-8">Ready to Accelerate Your Career?</h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of professionals who have transformed their careers with TalentXcel.
        </p>
        <Button 
          size="lg" 
          className="bg-white text-blue-600 hover:bg-gray-50 px-10 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl"
          onClick={() => navigate('/auth/register')}
        >
          Get Started Today
          <ArrowRight className="ml-3 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, TrendingUp, Shield } from "lucide-react";

export const TrustSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎯 Why Use TalentXcel?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Trusted by thousands of professionals across India
          </p>
          
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">2,430</h3>
                <p className="text-gray-600">People found jobs this month</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Verified</h3>
                <p className="text-gray-600">By Experts</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">10,000+</h3>
                <p className="text-gray-600">Applications submitted</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Badge className="bg-primary text-white px-4 py-2 text-sm">
              🔐 Verified by Experts
            </Badge>
            <Badge className="bg-green text-white px-4 py-2 text-sm">
              🧠 AI Personalized
            </Badge>
            <Badge className="bg-orange text-white px-4 py-2 text-sm">
              ⚡ Applied by 10,000+
            </Badge>
          </div>
          
          {/* Reviews */}
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-lg font-semibold">4.7</span>
            </div>
            <p className="text-gray-600 italic">
              "TalentXcel's AI matching helped me find my dream job in just 2 weeks. 
              The personalized recommendations were spot on!"
            </p>
            <p className="text-sm text-gray-500 mt-2">
              - Based on 2,500+ user reviews
            </p>
          </div>
          
          {/* FOMO Section */}
          <div className="mt-12 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-2">
              ⚠️ Don't Miss Out!
            </h3>
            <p className="text-red-50">
              📢 Most job posts get their first 5 applications within 6-12 hours.
              <br />
              🔥 Early applicants have 3x higher chance of getting shortlisted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
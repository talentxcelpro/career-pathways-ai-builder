import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Crown, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  TrendingUp,
  Star,
  Users,
  Zap
} from "lucide-react";

interface SubscriptionGateProps {
  title?: string;
  description?: string;
  feature?: string;
  currentTier?: string;
  requiredTier?: string;
  benefits?: string[];
  onUpgrade?: () => void;
}

export function SubscriptionGate({
  title = "Unlock Premium Features",
  description = "Upgrade to access advanced features and grow your business",
  feature = "service creation",
  currentTier = "Free",
  requiredTier = "Pro",
  benefits = [
    "Create unlimited services",
    "Featured service listings",
    "Advanced analytics",
    "Priority support",
    "Custom branding",
    "Portfolio showcase"
  ],
  onUpgrade
}: SubscriptionGateProps) {
  const defaultUpgrade = () => {
    window.location.href = "/pro/subscription";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 opacity-50" />
          
          {/* Premium Badge */}
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white border-none px-3 py-1">
              <Crown className="h-3 w-3 mr-1" />
              Premium Feature
            </Badge>
          </div>

          <CardHeader className="relative text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
              {title}
            </CardTitle>
            
            <p className="text-slate-600 text-lg leading-relaxed">
              {description}
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-center">
                <p className="text-xs text-slate-500">Current Plan</p>
                <Badge variant="outline" className="text-sm">
                  {currentTier}
                </Badge>
              </div>
              
              <ArrowRight className="h-4 w-4 text-slate-400" />
              
              <div className="text-center">
                <p className="text-xs text-slate-500">Required Plan</p>
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white border-none text-sm">
                  <Crown className="h-3 w-3 mr-1" />
                  {requiredTier}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative pt-0">
            {/* Benefits Grid */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">
                What you'll get with {requiredTier}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/60 border border-slate-200/50"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 rounded-lg bg-white/60 border border-slate-200/50">
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-800">500+</p>
                <p className="text-xs text-slate-500">Active Providers</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/60 border border-slate-200/50">
                <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-800">₹2.5L+</p>
                <p className="text-xs text-slate-500">Monthly Revenue</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/60 border border-slate-200/50">
                <Star className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-800">4.9</p>
                <p className="text-xs text-slate-500">Average Rating</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center space-y-4">
              <Button 
                onClick={onUpgrade || defaultUpgrade}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-semibold py-4 px-8 rounded-xl"
              >
                <Zap className="h-5 w-5 mr-2" />
                Upgrade to {requiredTier} Plan
              </Button>
              
              <p className="text-sm text-slate-500">
                Join thousands of professionals earning on TalentXcel
              </p>
              
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Shield className="h-3 w-3" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
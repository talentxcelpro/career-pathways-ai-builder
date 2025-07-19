
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppleButton } from "@/components/ui/apple-button";
import { AppleCard, AppleCardContent, AppleCardHeader, AppleCardTitle } from "@/components/ui/apple-card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, PlusCircle, CheckCircle, Download, Edit, Sparkles, TrendingUp, Award, ArrowRight, Star, Zap, Palette, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useScroll, useTransform } from "framer-motion";

const AppleResumeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  const quickActions = [
    {
      title: "Create New Resume",
      description: "Start fresh with AI-powered suggestions",
      icon: <PlusCircle className="h-6 w-6" />,
      path: "/resume-builder/new",
      gradient: "from-blue-500 to-cyan-400",
      badge: "Popular"
    },
    {
      title: "Upload Resume",
      description: "Enhance your existing resume with AI",
      icon: <Upload className="h-6 w-6" />,
      path: "/resume-builder/upload",
      gradient: "from-green-500 to-emerald-400"
    },
    {
      title: "AI Resume Score",
      description: "Get instant feedback and improvements",
      icon: <Brain className="h-6 w-6" />,
      path: "/resume-builder/checker",
      gradient: "from-purple-500 to-pink-400",
      badge: "AI Powered"
    },
    {
      title: "Browse Templates",
      description: "Professional designs for every industry",
      icon: <Palette className="h-6 w-6" />,
      path: "/resume-builder/templates",
      gradient: "from-orange-500 to-red-400"
    }
  ];

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Enhancement",
      description: "Intelligent content suggestions and industry-specific improvements",
      color: "text-blue-500"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "ATS Optimization",
      description: "Ensure your resume passes applicant tracking systems with 95% success rate",
      color: "text-green-500"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Professional Templates",
      description: "Curated designs by hiring managers and career experts",
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <motion.div 
        style={{ y, opacity }}
        className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-apple-medium">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                TalentXcel
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl mb-4 text-text-primary font-medium"
            >
              AI-Powered Resume Builder
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg mb-12 max-w-3xl mx-auto text-text-secondary leading-relaxed"
            >
              Create professional resumes with intelligent AI assistance, ATS optimization, and beautiful templates designed by industry experts
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <AppleButton 
                size="xl" 
                variant="premium"
                onClick={() => navigate('/resume-builder/checker')}
                className="shadow-apple-heavy"
              >
                <Brain className="h-5 w-5" />
                Get Free AI Score
                <Sparkles className="h-4 w-4" />
              </AppleButton>
              
              <AppleButton 
                size="xl" 
                variant="glass"
                onClick={() => navigate('/resume-builder/new')}
              >
                <PlusCircle className="h-5 w-5" />
                Create Resume
                <ArrowRight className="h-4 w-4" />
              </AppleButton>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-6">
            What would you like to do?
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Choose your starting point to build the perfect resume with AI assistance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative group"
            >
              <AppleCard 
                className="cursor-pointer h-full bg-white/80 backdrop-blur-sm hover:bg-white/90 border-0 shadow-apple-light hover:shadow-apple-heavy transition-all duration-300"
                onClick={() => navigate(action.path)}
              >
                {action.badge && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-apple-light">
                    <Star className="w-3 h-3 mr-1" />
                    {action.badge}
                  </Badge>
                )}
                
                <AppleCardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mx-auto mb-6 shadow-apple-medium group-hover:shadow-apple-heavy transition-all duration-300`}>
                    <div className="text-white">{action.icon}</div>
                  </div>
                  <AppleCardTitle className="text-lg">{action.title}</AppleCardTitle>
                </AppleCardHeader>
                
                <AppleCardContent className="text-center pt-0">
                  <p className="text-text-secondary leading-relaxed">{action.description}</p>
                </AppleCardContent>
              </AppleCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/50 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-text-primary mb-6">
              Why Choose TalentXcel?
            </h3>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Powered by advanced AI and designed with industry insights
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-apple-light group-hover:shadow-apple-medium transition-all duration-300`}>
                  <div className={feature.color}>{feature.icon}</div>
                </div>
                <h4 className="text-xl font-semibold text-text-primary mb-4">{feature.title}</h4>
                <p className="text-text-secondary leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Resumes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between mb-12"
        >
          <h3 className="text-3xl font-bold text-text-primary">Recent Resumes</h3>
          <AppleButton variant="outline" onClick={() => navigate('/resume-builder/new')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New
          </AppleButton>
        </motion.div>
        
        <AppleCard className="text-center py-16 bg-gradient-to-br from-gray-50/50 to-blue-50/30 border-dashed">
          <AppleCardContent>
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h4 className="text-2xl font-semibold text-text-primary mb-4">No resumes yet</h4>
            <p className="text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
              Start building your professional resume with AI-powered suggestions and beautiful templates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AppleButton size="lg" onClick={() => navigate('/resume-builder/new')}>
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Resume
              </AppleButton>
              <AppleButton size="lg" variant="outline" onClick={() => navigate('/resume-builder/upload')}>
                <Upload className="h-5 w-5 mr-2" />
                Upload Existing
              </AppleButton>
            </div>
          </AppleCardContent>
        </AppleCard>
      </div>
    </div>
  );
};

export default AppleResumeDashboard;

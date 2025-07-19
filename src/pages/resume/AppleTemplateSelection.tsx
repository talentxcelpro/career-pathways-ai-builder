
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppleButton } from "@/components/ui/apple-button";
import { AppleCard, AppleCardContent } from "@/components/ui/apple-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Star, CheckCircle, FileText, Palette, Briefcase, Code, Heart, Zap, Users, BookOpen, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AppleTemplateSelection = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const categories = [
    { id: 'All', name: 'All Templates', icon: <Palette className="w-4 h-4" /> },
    { id: 'Modern', name: 'Modern', icon: <Zap className="w-4 h-4" /> },
    { id: 'Executive', name: 'Executive', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'Creative', name: 'Creative', icon: <Heart className="w-4 h-4" /> },
    { id: 'Technical', name: 'Technical', icon: <Code className="w-4 h-4" /> },
    { id: 'Academic', name: 'Academic', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'Sales', name: 'Sales', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  const templates = [
    { 
      id: 'modern-tech', 
      name: 'Modern Tech', 
      description: 'Clean, contemporary design perfect for tech professionals',
      category: 'Modern',
      popular: true,
      gradient: 'from-blue-500 to-purple-500',
      features: ['ATS Optimized', 'Clean Layout', 'Modern Typography']
    },
    { 
      id: 'executive-classic', 
      name: 'Executive Classic', 
      description: 'Traditional, authoritative template for senior roles',
      category: 'Executive',
      popular: false,
      gradient: 'from-gray-700 to-gray-900',
      features: ['Professional', 'Authority', 'Conservative']
    },
    { 
      id: 'creative-designer', 
      name: 'Creative Designer', 
      description: 'Vibrant, creative template for design professionals',
      category: 'Creative',
      popular: true,
      gradient: 'from-pink-500 to-orange-500',
      features: ['Visual Impact', 'Creative Flair', 'Portfolio Ready']
    },
    { 
      id: 'minimal-clean', 
      name: 'Minimal Clean', 
      description: 'Ultra-clean, minimalist design focusing on content',
      category: 'Modern',
      popular: false,
      gradient: 'from-green-500 to-teal-500',
      features: ['Minimal', 'Content Focus', 'Elegant']
    },
    { 
      id: 'technical-dev', 
      name: 'Technical Developer', 
      description: 'Perfect for developers and technical professionals',
      category: 'Technical',
      popular: true,
      gradient: 'from-indigo-500 to-cyan-500',
      features: ['Code Friendly', 'Technical Skills', 'GitHub Ready']
    },
    { 
      id: 'academic-research', 
      name: 'Academic Research', 
      description: 'Designed for academics and researchers',
      category: 'Academic',
      popular: false,
      gradient: 'from-purple-600 to-blue-600',
      features: ['Publication Ready', 'Research Focus', 'Academic Standard']
    },
    { 
      id: 'sales-performance', 
      name: 'Sales Performance', 
      description: 'Results-driven template for sales professionals',
      category: 'Sales',
      popular: true,
      gradient: 'from-red-500 to-orange-500',
      features: ['Results Driven', 'Achievement Focus', 'Performance']
    },
    { 
      id: 'startup-growth', 
      name: 'Startup Growth', 
      description: 'Dynamic template for startup and growth roles',
      category: 'Modern',
      popular: false,
      gradient: 'from-emerald-500 to-blue-500',
      features: ['Dynamic', 'Growth Mindset', 'Innovation']
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setTimeout(() => {
      navigate(`/resume-builder/edit/new?template=${templateId}`);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <AppleButton variant="ghost" onClick={() => navigate('/resume-builder')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </AppleButton>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Palette className="w-3 h-3 mr-1" />
              Professional Templates
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Choose Your Perfect Template
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Professional designs crafted by hiring managers and optimized for ATS systems
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-gray-200 bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <AppleButton
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full ${selectedCategory === category.id ? 'shadow-apple-light' : ''}`}
              >
                {category.icon}
                {category.name}
              </AppleButton>
            ))}
          </div>
        </motion.div>

        {/* Templates Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence>
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredTemplate(template.id)}
                onHoverEnd={() => setHoveredTemplate(null)}
                className="group"
              >
                <AppleCard 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-apple-heavy bg-white/80 backdrop-blur-sm border-0 ${
                    selectedTemplate === template.id ? 'ring-2 ring-blue-500 shadow-apple-heavy' : 'shadow-apple-light'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <AppleCardContent className="p-0">
                    <div className="relative">
                      {/* Template Preview */}
                      <div className={`w-full h-64 bg-gradient-to-br ${template.gradient} rounded-t-2xl flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative z-10 text-white">
                          <FileText className="w-16 h-16 opacity-80" />
                        </div>
                        
                        {/* Animated overlay on hover */}
                        <AnimatePresence>
                          {hoveredTemplate === template.id && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-black/20 flex items-center justify-center"
                            >
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                className="bg-white/90 backdrop-blur-sm rounded-xl p-3"
                              >
                                <CheckCircle className="w-8 h-8 text-blue-600" />
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Popular Badge */}
                        {template.popular && (
                          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-apple-light">
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      
                      {/* Template Info */}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                          {template.name}
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed mb-4">
                          {template.description}
                        </p>
                        
                        {/* Features */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {template.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        <AppleButton
                          variant={selectedTemplate === template.id ? "default" : "outline"}
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplateSelect(template.id);
                          }}
                        >
                          {selectedTemplate === template.id ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Selected
                            </>
                          ) : (
                            'Use This Template'
                          )}
                        </AppleButton>
                      </div>
                    </div>
                  </AppleCardContent>
                </AppleCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No templates found</h3>
            <p className="text-text-secondary">Try adjusting your search or category filter</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AppleTemplateSelection;

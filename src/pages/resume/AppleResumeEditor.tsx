
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppleButton } from "@/components/ui/apple-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Download, Share2, Sparkles, Eye, EyeOff, Zap, Brain, FileText, Plus, Settings, History, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const AppleResumeEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const template = searchParams.get('template');
  const { toast } = useToast();

  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    professionalSummary: '',
    experience: [],
    education: [],
    skills: [],
    projects: []
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [aiScore, setAiScore] = useState(85);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  // Auto-save simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoSaveStatus('saved');
    }, 2000);
    return () => clearTimeout(timer);
  }, [resumeData]);

  const handleSave = useCallback(() => {
    setAutoSaveStatus('saving');
    toast({
      title: "Resume Saved",
      description: "Your changes have been saved successfully.",
    });
  }, [toast]);

  const handleExport = useCallback(() => {
    toast({
      title: "Export Started",
      description: "Your resume is being prepared for download.",
    });
  }, [toast]);

  const sidebarSections = [
    { id: 'personal', name: 'Personal Info', icon: <FileText className="w-4 h-4" /> },
    { id: 'summary', name: 'Summary', icon: <Brain className="w-4 h-4" /> },
    { id: 'experience', name: 'Experience', icon: <Zap className="w-4 h-4" /> },
    { id: 'education', name: 'Education', icon: <Plus className="w-4 h-4" /> },
    { id: 'skills', name: 'Skills', icon: <Settings className="w-4 h-4" /> },
    { id: 'projects', name: 'Projects', icon: <History className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-40 h-16">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-4">
            <AppleButton variant="ghost" onClick={() => navigate('/resume-builder')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </AppleButton>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-text-primary">Resume Editor</h1>
              <Badge variant="secondary" className={`${autoSaveStatus === 'saving' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                {autoSaveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border">
              <Brain className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-text-primary">AI Score: {aiScore}%</span>
            </div>
            
            <AppleButton variant="ghost" onClick={() => setPreviewMode(!previewMode)}>
              {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </AppleButton>
            
            <AppleButton variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </AppleButton>
            
            <AppleButton variant="premium" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </AppleButton>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <motion.div 
        animate={{ width: sidebarCollapsed ? 60 : 280 }}
        className="fixed left-0 top-16 bottom-0 bg-white/80 backdrop-blur-sm border-r border-gray-200 z-30"
      >
        <div className="p-4">
          <AppleButton 
            variant="ghost" 
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full justify-start mb-4"
          >
            <Settings className="h-4 w-4 mr-2" />
            {!sidebarCollapsed && 'Collapse'}
          </AppleButton>

          <div className="space-y-2">
            {sidebarSections.map((section) => (
              <AppleButton
                key={section.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                {section.icon}
                {!sidebarCollapsed && <span className="ml-2">{section.name}</span>}
              </AppleButton>
            ))}
          </div>

          {!sidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-text-primary">AI Assistant</span>
              </div>
              <p className="text-xs text-text-secondary mb-3">
                Get AI-powered suggestions to improve your resume
              </p>
              <AppleButton size="sm" variant="default" className="w-full">
                <Brain className="w-3 h-3 mr-1" />
                Enhance
              </AppleButton>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-72'} mt-16`}>
        <div className="flex h-full">
          {/* Editor Panel */}
          <div className={`${previewMode ? 'w-1/2' : 'w-full'} p-8 overflow-y-auto`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              {/* Personal Info Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-apple-light">
                <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-500" />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
                    <Input
                      value={resumeData.personalInfo.fullName}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                      }))}
                      className="rounded-xl bg-white/80 border-gray-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                    <Input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                      className="rounded-xl bg-white/80 border-gray-200"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Phone</label>
                    <Input
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                      className="rounded-xl bg-white/80 border-gray-200"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                    <Input
                      value={resumeData.personalInfo.location}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, location: e.target.value }
                      }))}
                      className="rounded-xl bg-white/80 border-gray-200"
                      placeholder="City, State"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-apple-light">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-500" />
                    Professional Summary
                  </h2>
                  <AppleButton size="sm" variant="outline">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Enhance
                  </AppleButton>
                </div>
                
                <Textarea
                  value={resumeData.professionalSummary}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    professionalSummary: e.target.value
                  }))}
                  className="rounded-xl bg-white/80 border-gray-200 min-h-32"
                  placeholder="Write a compelling professional summary that highlights your key achievements and career goals..."
                />
              </div>
            </motion.div>
          </div>

          {/* Preview Panel */}
          <AnimatePresence>
            {previewMode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '50%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-gray-200 bg-gray-50/80 backdrop-blur-sm overflow-y-auto"
              >
                <div className="p-8">
                  <div className="bg-white rounded-2xl shadow-apple-light p-8 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-text-primary">
                        {resumeData.personalInfo.fullName || 'Your Name'}
                      </h1>
                      <div className="text-text-secondary mt-2">
                        {resumeData.personalInfo.email} • {resumeData.personalInfo.phone}
                      </div>
                      <div className="text-text-secondary">
                        {resumeData.personalInfo.location}
                      </div>
                    </div>

                    {resumeData.professionalSummary && (
                      <div className="mb-8">
                        <h2 className="text-xl font-semibold text-text-primary mb-4 border-b border-gray-200 pb-2">
                          Professional Summary
                        </h2>
                        <p className="text-text-secondary leading-relaxed">
                          {resumeData.professionalSummary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AppleResumeEditor;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone,
  HelpCircle,
  User,
  FileText,
  Briefcase,
  Brain,
  GraduationCap,
  Building,
  ChevronRight,
  Clock
} from 'lucide-react';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      title: "Getting Started",
      icon: User,
      color: "text-blue-600 bg-blue-100",
      description: "Creating an account, onboarding",
      articles: 12,
      topics: ["Account Creation", "Profile Setup", "First Steps", "Platform Tour"]
    },
    {
      title: "Profile & Resume", 
      icon: FileText,
      color: "text-green-600 bg-green-100",
      description: "Uploading, editing, downloading",
      articles: 18,
      topics: ["Resume Builder", "Profile Editing", "Download Options", "Templates"]
    },
    {
      title: "Job Applications",
      icon: Briefcase,
      color: "text-purple-600 bg-purple-100", 
      description: "Smart Apply, saved jobs, AI assistant",
      articles: 24,
      topics: ["Smart Apply", "Saved Jobs", "Application Status", "AI Assistant"]
    },
    {
      title: "AI Career Planner",
      icon: Brain,
      color: "text-orange-600 bg-orange-100",
      description: "How to use it, interpretation tips",
      articles: 15,
      topics: ["Career Mapping", "AI Insights", "Goal Setting", "Progress Tracking"]
    },
    {
      title: "Learning Hub",
      icon: GraduationCap,
      color: "text-pink-600 bg-pink-100",
      description: "Enrolling, tracking progress",
      articles: 21,
      topics: ["Course Enrollment", "Progress Tracking", "Certifications", "Learning Paths"]
    },
    {
      title: "Employers & Recruiters",
      icon: Building,
      color: "text-indigo-600 bg-indigo-100",
      description: "Posting jobs, viewing applicants",
      articles: 16,
      topics: ["Job Posting", "Applicant Management", "Company Profile", "Hiring Tools"]
    }
  ];

  const faqs = [
    {
      question: "How do I create my first resume?",
      answer: "Navigate to the Resume Builder from your dashboard and follow our step-by-step guide.",
      category: "Profile & Resume"
    },
    {
      question: "What is Smart Apply and how does it work?",
      answer: "Smart Apply uses AI to automatically fill job applications with your profile information.",
      category: "Job Applications"
    },
    {
      question: "How accurate is the AI Career Planner?",
      answer: "Our AI uses industry data and your profile to provide personalized career insights with 85% accuracy.",
      category: "AI Career Planner"
    },
    {
      question: "Can I download my certificates?",
      answer: "Yes, all completed course certificates can be downloaded in PDF format from your Learning Hub.",
      category: "Learning Hub"
    },
    {
      question: "How do I post a job as an employer?",
      answer: "Go to your employer dashboard and click 'Post New Job' to create your job listing.",
      category: "Employers & Recruiters"
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to the TalentXcel Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to your questions and get the help you need to succeed
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg bg-white/60 backdrop-blur-sm border-0 shadow-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Help Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {categories.map((category, index) => (
                <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <category.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                        <p className="text-gray-600 mb-3">{category.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{category.articles} articles</Badge>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {category.topics.slice(0, 2).map((topic, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {category.topics.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{category.topics.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Searchable FAQs */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                          <p className="text-gray-600 mb-3">{faq.answer}</p>
                          <Badge variant="secondary" className="text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Live Chat / Support */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <span>Get Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Live Chat</span>
                </Button>
                <Button variant="outline" className="w-full flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Submit a Ticket</span>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg mb-6">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">support@talentxcel.in</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Support Hours</p>
                    <p className="text-sm text-gray-600">Mon–Fri, 10 AM – 6 PM IST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-left">
                    Getting Started Guide
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-left">
                    Video Tutorials
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-left">
                    API Documentation
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-left">
                    Community Forum
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;

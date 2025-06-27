
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle, User, Briefcase, Brain, GraduationCap, Building2, MessageCircle } from "lucide-react";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      icon: <User className="h-8 w-8 text-blue-600" />,
      title: "Getting Started",
      description: "Creating an account, onboarding",
      faqs: [
        "How do I create an account?",
        "How do I complete my profile?",
        "What information do I need to provide?"
      ]
    },
    {
      icon: <HelpCircle className="h-8 w-8 text-green-600" />,
      title: "Profile & Resume",
      description: "Uploading, editing, downloading",
      faqs: [
        "How do I upload my resume?",
        "Can I edit my resume after uploading?",
        "How do I download my updated resume?"
      ]
    },
    {
      icon: <Briefcase className="h-8 w-8 text-purple-600" />,
      title: "Job Applications",
      description: "Smart Apply, saved jobs, AI assistant",
      faqs: [
        "How does Smart Apply work?",
        "Where can I view my saved jobs?",
        "How do I track my applications?"
      ]
    },
    {
      icon: <Brain className="h-8 w-8 text-orange-600" />,
      title: "AI Career Planner",
      description: "How to use it, interpretation tips",
      faqs: [
        "How accurate is the AI career planner?",
        "How do I interpret my career path suggestions?",
        "Can I customize my career goals?"
      ]
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-red-600" />,
      title: "Learning Hub",
      description: "Enrolling, tracking progress",
      faqs: [
        "How do I enroll in a course?",
        "Can I track my learning progress?",
        "Are certificates provided upon completion?"
      ]
    },
    {
      icon: <Building2 className="h-8 w-8 text-indigo-600" />,
      title: "Employers & Recruiters",
      description: "Posting jobs, viewing applicants",
      faqs: [
        "How do I post a job?",
        "How can I view job applicants?",
        "What are the pricing plans for employers?"
      ]
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.faqs.some(faq => faq.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to the TalentXcel Help Center</h1>
          <p className="text-xl text-blue-100">Find answers to your questions and get the support you need</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search for help articles, FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-4 text-lg"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {category.icon}
                </div>
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <p className="text-gray-600">{category.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.faqs.map((faq, faqIndex) => (
                    <div key={faqIndex} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      • {faq}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              Need More Help?
            </CardTitle>
            <p className="text-gray-600">Can't find what you're looking for? Get in touch with our support team</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
              <Button variant="outline">
                Submit a Ticket
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <p>Our support team typically responds within 24 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;

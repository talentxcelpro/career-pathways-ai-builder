import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  HelpCircle, 
  User, 
  Briefcase, 
  Brain, 
  GraduationCap, 
  Building2, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const helpContent = {
    "getting-started": {
      icon: <User className="h-8 w-8 text-blue-600" />,
      title: "Creating an account and onboarding",
      color: "blue",
      subtitle: "Account setup and profile completion",
      faqs: [
        {
          question: "How do I create an account?",
          answer: (
            <div className="space-y-2">
              <p>To create an account:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Visit TalentXcel.in</li>
                <li>Click on "Sign Up" on the top right corner</li>
                <li>Choose your role (Job Seeker, Employer, Mentor, etc.)</li>
                <li>Fill in your name, email, password, and verify via OTP</li>
                <li>Agree to Terms of Use and Privacy Policy</li>
                <li>Submit to complete registration</li>
              </ol>
            </div>
          )
        },
        {
          question: "How do I complete my profile?",
          answer: (
            <div className="space-y-2">
              <p>After logging in:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Navigate to "My Profile"</li>
                <li>Upload a profile photo, video resume, and documents</li>
                <li>Add personal details, education, work experience, and skills</li>
                <li>Link your social profiles (LinkedIn, portfolio, etc.)</li>
                <li>Save your progress</li>
              </ol>
            </div>
          )
        },
        {
          question: "What information do I need to provide?",
          answer: (
            <div className="space-y-2">
              <p>You'll need to provide:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Full name, contact info</li>
                <li>Resume (PDF/Word)</li>
                <li>Education background</li>
                <li>Work history</li>
                <li>Skills, certifications, projects</li>
                <li>Career preferences</li>
              </ul>
            </div>
          )
        }
      ]
    },
    "profile-resume": {
      icon: <HelpCircle className="h-8 w-8 text-green-600" />,
      title: "Profile & Resume",
      color: "green",
      subtitle: "Managing your resume and personal branding",
      faqs: [
        {
          question: "How do I upload my resume?",
          answer: (
            <div className="space-y-2">
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Go to "Create {'>'} Resume Builder"</li>
                <li>Click "Upload Resume"</li>
                <li>Upload PDF, DOCX, or TXT format</li>
                <li>The AI will extract and structure your data</li>
              </ol>
            </div>
          )
        },
        {
          question: "Can I edit my resume after uploading?",
          answer: (
            <div className="space-y-2">
              <p>Yes. After upload, you can:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Edit content section-wise (Experience, Skills, etc.)</li>
                <li>Use AI suggestions to enhance it</li>
                <li>Apply ATS optimizations</li>
              </ul>
            </div>
          )
        },
        {
          question: "How do I download my updated resume?",
          answer: (
            <div className="space-y-2">
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Go to "Resume Builder"</li>
                <li>Click "Preview & Export"</li>
                <li>Choose a template</li>
                <li>Click "Download PDF" or "Download Word"</li>
              </ol>
            </div>
          )
        }
      ]
    },
    "job-applications": {
      icon: <Briefcase className="h-8 w-8 text-purple-600" />,
      title: "Job Applications",
      color: "purple",
      subtitle: "Using Smart Apply, saving jobs, tracking",
      faqs: [
        {
          question: "How does Smart Apply work?",
          answer: (
            <div className="space-y-2">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>AI reviews your resume and job posting</li>
                <li>It tailors your application</li>
                <li>Suggests changes and highlights for better matching</li>
                <li>Submits your application with one click (if enabled)</li>
              </ul>
            </div>
          )
        },
        {
          question: "Where can I view my saved jobs?",
          answer: (
            <div className="space-y-2">
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Go to "Jobs" section</li>
                <li>Click on "Saved Jobs"</li>
                <li>Review and apply anytime</li>
              </ol>
            </div>
          )
        },
        {
          question: "How do I track my applications?",
          answer: (
            <div className="space-y-2">
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Navigate to "Applications {'>'} My Applications"</li>
                <li>See status: Applied, Shortlisted, Interviewing, Offer</li>
                <li>Receive notifications on status updates</li>
              </ol>
            </div>
          )
        }
      ]
    },
    "ai-career": {
      icon: <Brain className="h-8 w-8 text-orange-600" />,
      title: "AI Career Planner",
      color: "orange",
      subtitle: "Personalized career insights and growth paths",
      faqs: [
        {
          question: "How accurate is the AI career planner?",
          answer: (
            <div className="space-y-2">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>It uses data from your resume, goals, and job market trends</li>
                <li>Analyzes your skills vs. market demand</li>
                <li>It's up-to-date, customizable, and predictive</li>
              </ul>
            </div>
          )
        },
        {
          question: "How do I interpret my career path suggestions?",
          answer: (
            <div className="space-y-2">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Each roadmap has roles, required skills, milestones, and timeline</li>
                <li>View suggested certifications, courses, and salary estimates</li>
              </ul>
            </div>
          )
        },
        {
          question: "Can I customize my career goals?",
          answer: (
            <div className="space-y-2">
              <p>Yes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Add/edit long-term goals</li>
                <li>Adjust timeline preferences</li>
                <li>Set learning targets and track skill gaps</li>
              </ul>
            </div>
          )
        }
      ]
    },
    "learning": {
      icon: <GraduationCap className="h-8 w-8 text-red-600" />,
      title: "Learning Hub",
      color: "red",
      subtitle: "Upskilling and progress tracking",
      faqs: [
        {
          question: "How do I enroll in a course?",
          answer: (
            <div className="space-y-2">
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Go to "Learning Hub"</li>
                <li>Browse or search for a course</li>
                <li>Click "Enroll" — Free or Paid</li>
                <li>Start learning immediately</li>
              </ol>
            </div>
          )
        },
        {
          question: "Can I track my learning progress?",
          answer: (
            <div className="space-y-2">
              <p>Yes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>See progress bars on enrolled courses</li>
                <li>Get reminders for incomplete modules</li>
                <li>Earn points or badges on milestones</li>
              </ul>
            </div>
          )
        },
        {
          question: "Are certificates provided upon completion?",
          answer: (
            <div className="space-y-2">
              <p>Yes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Most courses offer downloadable certificates</li>
                <li>They can be added to your resume profile</li>
                <li>Verifiable via unique certificate ID</li>
              </ul>
            </div>
          )
        }
      ]
    },
    "employers": {
      icon: <Building2 className="h-8 w-8 text-indigo-600" />,
      title: "Employers & Recruiters",
      color: "indigo",
      subtitle: "Job posting, applicant tracking, and pricing",
      faqs: [
        {
          question: "How do I post a job?",
          answer: (
            <div className="space-y-2">
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Log in as an Employer</li>
                <li>Go to "Jobs {'>'} Post a Job"</li>
                <li>Fill job title, description, location, salary, etc.</li>
                <li>Select listing plan (Free or Paid)</li>
                <li>Publish</li>
              </ol>
            </div>
          )
        },
        {
          question: "How can I view job applicants?",
          answer: (
            <div className="space-y-2">
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Visit "Jobs {'>'} My Listings"</li>
                <li>Click on any job</li>
                <li>View list of applicants, filters by experience, skill match, etc.</li>
              </ol>
            </div>
          )
        },
        {
          question: "What are the pricing plans for employers?",
          answer: (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-900">Basic Listing</div>
                  <div className="text-blue-700">₹99 per job</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-semibold text-purple-900">Featured Job</div>
                  <div className="text-purple-700">₹299 per job</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-semibold text-orange-900">Resume Writing</div>
                  <div className="text-orange-700">₹999 per applicant</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-semibold text-green-900">Premium Access</div>
                  <div className="text-green-700">₹199/month</div>
                  <div className="text-xs text-green-600">(includes 2 free listings & 1 resume service)</div>
                </div>
              </div>
            </div>
          )
        }
      ]
    }
  };

  const categories = Object.entries(helpContent);

  const filteredCategories = categories.filter(([key, category]) =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.subtitle && category.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    category.faqs.some(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleLiveChat = () => {
    toast.info("Live chat will be available during support hours (10:00 AM - 6:00 PM IST)");
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/919717161809', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-blue-100">Find answers to your questions and get the support you need</p>
          <p className="text-sm text-blue-200 mt-2">
            <strong>Effective:</strong> July 01, 2025
          </p>
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

        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCategories.map(([key, category]) => (
            <Card 
              key={key} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {category.icon}
                </div>
                <CardTitle className="text-xl">{category.title}</CardTitle>
                {category.subtitle && (
                  <p className="text-gray-600 text-sm">{category.subtitle}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center">
                    {category.faqs.length} articles
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed FAQ Sections */}
        <div className="space-y-8">
          {filteredCategories.map(([key, category]) => (
            <Card key={key} className={selectedCategory === key || !selectedCategory ? 'block' : 'hidden'}>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <div className="mr-3">{category.icon}</div>
                  {category.title}
                </CardTitle>
                {category.subtitle && (
                  <p className="text-gray-600">{category.subtitle}</p>
                )}
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`${key}-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="max-w-4xl mx-auto mt-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              Need More Help?
            </CardTitle>
            <p className="text-gray-600">If you couldn't find what you're looking for:</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Email Support */}
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">📧 Email Support</h3>
                <p className="text-blue-700 font-medium">info@talentxcel.co.in</p>
                <p className="text-blue-600 text-sm">Typically responds within 24 hours</p>
              </div>

              {/* Live Chat */}
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-2">🔴 Live Chat Support</h3>
                <Button 
                  onClick={handleLiveChat}
                  className="w-full mb-2"
                  variant="outline"
                >
                  Start Live Chat
                </Button>
                <p className="text-green-600 text-sm">Available during support hours</p>
              </div>

              {/* WhatsApp */}
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <Phone className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-purple-900 mb-2">📱 Chat on WhatsApp</h3>
                <Button 
                  onClick={handleWhatsApp}
                  className="w-full mb-2"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  (+91 9717161809)
                </Button>
                <p className="text-purple-600 text-sm">Quick responses</p>
              </div>
            </div>

            {/* Support Hours */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">
                📍 <strong>Address:</strong> TalentXcel Services, Noida, India
              </p>
              <p className="text-gray-700 font-medium">
                🕒 <strong>Support Hours:</strong> Monday to Friday, 10:00 AM – 6:00 PM IST
              </p>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    </div>
  );
};

export default Help;
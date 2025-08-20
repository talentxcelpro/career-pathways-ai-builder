import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, CheckCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CollegeInquiryProps {
  collegeId: string;
  collegeName: string;
  responseTime?: string;
}

export const CollegeInquiry: React.FC<CollegeInquiryProps> = ({
  collegeId,
  collegeName,
  responseTime = "24 hours"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inquiry, setInquiry] = useState({
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inquiryCategories = [
    { value: 'admissions', label: 'Admissions' },
    { value: 'fees', label: 'Fees & Scholarships' },
    { value: 'placements', label: 'Placements' },
    { value: 'courses', label: 'Courses & Programs' },
    { value: 'hostel', label: 'Hostel & Facilities' },
    { value: 'general', label: 'General Inquiry' }
  ];

  const handleSubmitInquiry = async () => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to send inquiries');
        return;
      }

      const { error } = await supabase
        .from('college_inquiries')
        .insert({
          college_id: collegeId,
          student_id: user.id,
          inquiry_type: inquiry.category,
          subject: inquiry.subject,
          message: inquiry.message,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Inquiry sent successfully! The college will respond soon.');
      setInquiry({ subject: '', message: '', category: 'general' });
      setIsExpanded(false);
    } catch (error: any) {
      toast.error('Failed to send inquiry: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "What are the admission requirements?",
      answer: "Contact admissions office for detailed requirements based on your program of interest."
    },
    {
      question: "What is the fee structure?",
      answer: "Fee details vary by program. Request specific information for accurate costs."
    },
    {
      question: "What is the placement record?",
      answer: "View our placement statistics and connect with alumni for insights."
    }
  ];

  if (!isExpanded) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Ask {collegeName}</div>
                <div className="text-sm text-gray-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Avg. response: {responseTime}
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setIsExpanded(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ask Question
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <span>Contact {collegeName}</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Response time: {responseTime}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Direct to college
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Inquiry Category
          </label>
          <select
            value={inquiry.category}
            onChange={(e) => setInquiry(prev => ({ ...prev, category: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {inquiryCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Subject
          </label>
          <Input
            value={inquiry.subject}
            onChange={(e) => setInquiry(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="What would you like to know?"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Your Question
          </label>
          <Textarea
            value={inquiry.message}
            onChange={(e) => setInquiry(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Please provide details about your inquiry..."
            rows={4}
          />
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleSubmitInquiry}
            disabled={!inquiry.subject || !inquiry.message || isSubmitting}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sending...' : 'Send Inquiry'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(false)}
          >
            Cancel
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-3">Frequently Asked Questions</h4>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium text-gray-800 mb-1">{faq.question}</div>
                <div className="text-gray-600">{faq.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
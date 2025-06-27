
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Send,
  CheckCircle,
  User,
  Building
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to a server
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "support@talentxcel.in",
      description: "Get a response within 24 hours"
    },
    {
      icon: MapPin,
      title: "Address",
      content: "TalentXcel Services, Bengaluru, India",
      description: "Our headquarters location"
    },
    {
      icon: Clock,
      title: "Support Hours",
      content: "Mon–Fri, 10 AM – 6 PM IST",
      description: "We're here when you need us"
    }
  ];

  const subjects = [
    "General Inquiry",
    "Technical Support",
    "Account Issues",
    "Billing Questions",
    "Feature Request",
    "Partnership Opportunity",
    "Press & Media",
    "Other"
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h2>
            <p className="text-gray-600">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            We're Here to Help
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have a question or need assistance? Get in touch with our friendly support team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-6 w-6 text-blue-600" />
                  <span>Send us a Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        className="bg-white/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        className="bg-white/80"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={formData.subject} onValueChange={(value) => handleChange('subject', value)}>
                      <SelectTrigger className="bg-white/80">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                      rows={6}
                      className="bg-white/80"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto px-8 py-3"
                    disabled={!formData.name || !formData.email || !formData.subject || !formData.message}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <info.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{info.title}</h3>
                      <p className="text-gray-700 font-medium">{info.content}</p>
                      <p className="text-sm text-gray-500 mt-1">{info.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Support Options */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Quick Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full flex items-center justify-start space-x-3 h-12">
                  <MessageCircle className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Live Chat</div>
                    <div className="text-xs opacity-80">Available now</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="w-full flex items-center justify-start space-x-3 h-12">
                  <Phone className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">WhatsApp Support</div>
                    <div className="text-xs opacity-80">Quick responses</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-xl">
              <CardContent className="p-6 text-center text-white">
                <h3 className="text-lg font-semibold mb-2">Need Quick Answers?</h3>
                <p className="text-blue-100 mb-4">Check our Help Center for instant solutions.</p>
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Visit Help Center
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Office Hours Notice */}
        <Card className="bg-yellow-50 border-yellow-200 mt-12">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Support Hours</h3>
            <p className="text-yellow-800">
              Our support team is available Monday through Friday, 10 AM to 6 PM IST. 
              Messages received outside these hours will be responded to on the next business day.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;

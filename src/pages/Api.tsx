import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Zap, Shield, Globe, Database, Webhook } from 'lucide-react';

const Api = () => {
  const apiFeatures = [
    {
      icon: <Database className="h-8 w-8 text-blue-600" />,
      title: "Job Search API",
      description: "Access millions of job listings with advanced filtering and real-time updates."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "AI Resume Analysis", 
      description: "Integrate our AI-powered resume scoring and optimization recommendations."
    },
    {
      icon: <Globe className="h-8 w-8 text-green-600" />,
      title: "Company Data API",
      description: "Get comprehensive company information, culture insights, and hiring trends."
    },
    {
      icon: <Webhook className="h-8 w-8 text-purple-600" />,
      title: "ATS Integration",
      description: "Seamlessly connect with popular ATS platforms for recruitment workflows."
    }
  ];

  const endpoints = [
    {
      method: "GET",
      endpoint: "/api/v1/jobs",
      description: "Search and filter job listings"
    },
    {
      method: "POST", 
      endpoint: "/api/v1/resume/analyze",
      description: "Analyze resume and get AI recommendations"
    },
    {
      method: "GET",
      endpoint: "/api/v1/companies",
      description: "Get company information and insights"
    },
    {
      method: "POST",
      endpoint: "/api/v1/candidates/match", 
      description: "Find matching candidates for job requirements"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Code className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
            TalentXcel API
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Build powerful career and recruitment applications with our comprehensive API suite. 
            Access job data, AI-powered insights, and seamless integrations.
          </p>
        </div>

        {/* API Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {apiFeatures.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* API Endpoints */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Code className="h-6 w-6" />
              Popular Endpoints
            </CardTitle>
            <CardDescription>
              Start building with these commonly used API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono bg-white px-2 py-1 rounded">
                      {endpoint.endpoint}
                    </code>
                  </div>
                  <p className="text-sm text-slate-600 hidden md:block">
                    {endpoint.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Shield className="h-8 w-8 text-green-600" />
              Enterprise Ready
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">99.9% Uptime SLA</h3>
                <p className="text-slate-600">
                  Reliable, scalable infrastructure built for mission-critical applications.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Rate Limiting</h3>
                <p className="text-slate-600">
                  Flexible rate limits with burst capacity for high-volume applications.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Comprehensive Monitoring</h3>
                <p className="text-slate-600">
                  Real-time monitoring, analytics, and detailed usage reports.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Zap className="h-8 w-8 text-yellow-600" />
              Developer Experience
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">RESTful Design</h3>
                <p className="text-slate-600">
                  Clean, intuitive API design following REST principles and industry standards.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">SDK Libraries</h3>
                <p className="text-slate-600">
                  Official SDKs for Python, JavaScript, PHP, and other popular languages.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Interactive Documentation</h3>
                <p className="text-slate-600">
                  Test API endpoints directly in our documentation with live examples.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-12">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers building the future of career technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              View Documentation
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
              Get API Key
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Api;
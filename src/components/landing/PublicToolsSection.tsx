import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Briefcase, TrendingUp, MessageSquare, ArrowRight } from 'lucide-react';

export const PublicToolsSection: React.FC = () => {
  const publicTools = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Free Resume Builder",
      description: "Create professional resumes instantly",
      link: "/public/resume-builder"
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: "Job Search",
      description: "Find opportunities that match your skills",
      link: "/public/jobs"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Career Insights",
      description: "Get market data and career guidance",
      link: "/public/market-insights"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Interview Prep",
      description: "Practice with AI-powered mock interviews",
      link: "/public/interview-prep"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Try Our Free Career Tools</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access powerful career tools without signing up. Experience the TalentXcel difference.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {publicTools.map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                  {tool.icon}
                </div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center mb-4">
                  {tool.description}
                </p>
                <Link to={tool.link}>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Try Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/public-tools">
            <Button size="lg" className="group">
              View All Free Tools
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
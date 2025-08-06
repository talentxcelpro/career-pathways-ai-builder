import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Code, Briefcase } from 'lucide-react';

const JobCategories = () => {
  const roleCategories = [
    { name: 'Software Engineer', slug: 'software-engineer', count: '2.5K+' },
    { name: 'Data Scientist', slug: 'data-scientist', count: '1.8K+' },
    { name: 'Product Manager', slug: 'product-manager', count: '950+' },
    { name: 'DevOps Engineer', slug: 'devops-engineer', count: '1.2K+' },
    { name: 'UI/UX Designer', slug: 'ui-ux-designer', count: '800+' },
    { name: 'Business Analyst', slug: 'business-analyst', count: '1.1K+' },
    { name: 'Full Stack Developer', slug: 'full-stack-developer', count: '3.2K+' },
    { name: 'Frontend Developer', slug: 'frontend-developer', count: '2.1K+' },
    { name: 'Backend Developer', slug: 'backend-developer', count: '1.9K+' },
    { name: 'Machine Learning Engineer', slug: 'machine-learning-engineer', count: '720+' }
  ];

  const locationCategories = [
    { name: 'Bangalore', slug: 'bangalore', count: '5.2K+' },
    { name: 'Mumbai', slug: 'mumbai', count: '4.8K+' },
    { name: 'Delhi', slug: 'delhi', count: '3.9K+' },
    { name: 'Hyderabad', slug: 'hyderabad', count: '3.1K+' },
    { name: 'Chennai', slug: 'chennai', count: '2.8K+' },
    { name: 'Pune', slug: 'pune', count: '2.5K+' },
    { name: 'Kolkata', slug: 'kolkata', count: '1.8K+' },
    { name: 'Gurgaon', slug: 'gurgaon', count: '2.2K+' },
    { name: 'Noida', slug: 'noida', count: '1.9K+' },
    { name: 'Ahmedabad', slug: 'ahmedabad', count: '1.5K+' }
  ];

  const skillCategories = [
    { name: 'JavaScript', slug: 'javascript', count: '4.2K+' },
    { name: 'Python', slug: 'python', count: '3.8K+' },
    { name: 'React', slug: 'react', count: '3.5K+' },
    { name: 'Java', slug: 'java', count: '3.1K+' },
    { name: 'AWS', slug: 'aws', count: '2.8K+' },
    { name: 'Machine Learning', slug: 'machine-learning', count: '2.2K+' },
    { name: 'Node.js', slug: 'nodejs', count: '2.9K+' },
    { name: 'SQL', slug: 'sql', count: '4.5K+' },
    { name: 'Docker', slug: 'docker', count: '1.8K+' },
    { name: 'Kubernetes', slug: 'kubernetes', count: '1.5K+' },
    { name: 'TypeScript', slug: 'typescript', count: '2.1K+' },
    { name: 'Angular', slug: 'angular', count: '1.9K+' }
  ];

  return (
    <div className="space-y-8 py-8">
      {/* Jobs by Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Jobs by Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {roleCategories.map((role) => (
              <Link
                key={role.slug}
                to={`/jobs/role/${role.slug}`}
                className="group"
              >
                <div className="p-4 rounded-lg border hover:border-primary transition-colors">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {role.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{role.count} jobs</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/jobs">
              <Button variant="outline" className="group">
                View all roles
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Jobs by Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Jobs by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {locationCategories.map((location) => (
              <Link
                key={location.slug}
                to={`/jobs/location/${location.slug}`}
                className="group"
              >
                <div className="p-4 rounded-lg border hover:border-primary transition-colors">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    Jobs in {location.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{location.count} jobs</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/jobs">
              <Button variant="outline" className="group">
                View all cities
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Jobs by Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Jobs by Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {skillCategories.map((skill) => (
              <Link
                key={skill.slug}
                to={`/jobs/skill/${skill.slug}`}
                className="group"
              >
                <div className="p-4 rounded-lg border hover:border-primary transition-colors">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {skill.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{skill.count} jobs</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/jobs">
              <Button variant="outline" className="group">
                View all skills
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { JobCategories };
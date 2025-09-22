import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  Code, 
  TrendingUp, 
  Palette, 
  Database, 
  Shield,
  Rocket,
  Users,
  Clock,
  BookOpen,
  Target
} from 'lucide-react';

interface CourseTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedHours: number;
  modules: number;
  icon: React.ComponentType<any>;
  color: string;
  skills: string[];
  objectives: string[];
  targetAudience: string[];
  modules_structure: {
    title: string;
    duration_hours: number;
    lessons: number;
    description: string;
  }[];
}

const courseTemplates: CourseTemplate[] = [
  {
    id: 'aws-complete',
    title: 'Complete AWS Cloud Computing Mastery',
    description: 'Comprehensive 10-hour course covering AWS fundamentals to advanced deployment strategies',
    category: 'cloud-computing',
    difficulty: 'beginner',
    estimatedHours: 10,
    modules: 6,
    icon: Cloud,
    color: 'bg-orange-500',
    skills: [
      'AWS Core Services',
      'EC2 & Load Balancing',
      'VPC & Networking',
      'IAM & Security',
      'CloudFormation',
      'DevOps Practices'
    ],
    objectives: [
      'Master AWS fundamental concepts and architecture',
      'Deploy and manage scalable applications',
      'Implement security best practices',
      'Automate infrastructure with Infrastructure as Code',
      'Monitor and optimize cloud resources',
      'Design fault-tolerant systems'
    ],
    targetAudience: [
      'Developers transitioning to cloud',
      'IT professionals',
      'DevOps engineers',
      'Students learning cloud computing'
    ],
    modules_structure: [
      {
        title: 'AWS Fundamentals & Core Services',
        duration_hours: 1.5,
        lessons: 8,
        description: 'Introduction to cloud computing, AWS global infrastructure, and core services overview'
      },
      {
        title: 'Compute Services Mastery',
        duration_hours: 2,
        lessons: 12,
        description: 'Deep dive into EC2, Auto Scaling, Load Balancers, and compute optimization'
      },
      {
        title: 'Storage & Database Services',
        duration_hours: 1.5,
        lessons: 10,
        description: 'S3, EBS, RDS, DynamoDB, and data management strategies'
      },
      {
        title: 'Networking & Security Architecture',
        duration_hours: 2,
        lessons: 14,
        description: 'VPC, subnets, security groups, IAM, and security best practices'
      },
      {
        title: 'Monitoring, Automation & DevOps',
        duration_hours: 2,
        lessons: 12,
        description: 'CloudWatch, CloudFormation, CI/CD pipelines, and automation'
      },
      {
        title: 'Real-World Project Implementation',
        duration_hours: 1,
        lessons: 6,
        description: 'Build and deploy a complete 3-tier web application'
      }
    ]
  },
  {
    id: 'react-advanced',
    title: 'Advanced React Development',
    description: 'Master modern React patterns, state management, and performance optimization',
    category: 'development',
    difficulty: 'intermediate',
    estimatedHours: 8,
    modules: 5,
    icon: Code,
    color: 'bg-blue-500',
    skills: [
      'React Hooks',
      'State Management',
      'Performance Optimization',
      'Testing',
      'TypeScript',
      'Next.js'
    ],
    objectives: [
      'Master advanced React patterns and hooks',
      'Implement efficient state management solutions',
      'Optimize application performance',
      'Write comprehensive tests',
      'Build production-ready applications'
    ],
    targetAudience: [
      'Frontend developers',
      'React developers',
      'Full-stack developers'
    ],
    modules_structure: [
      {
        title: 'Advanced React Patterns',
        duration_hours: 2,
        lessons: 10,
        description: 'Custom hooks, compound components, render props, and advanced patterns'
      },
      {
        title: 'State Management Deep Dive',
        duration_hours: 2,
        lessons: 8,
        description: 'Context API, Redux Toolkit, Zustand, and state management best practices'
      },
      {
        title: 'Performance Optimization',
        duration_hours: 1.5,
        lessons: 7,
        description: 'React.memo, useMemo, useCallback, lazy loading, and optimization techniques'
      },
      {
        title: 'Testing & Quality Assurance',
        duration_hours: 1.5,
        lessons: 6,
        description: 'Unit testing, integration testing, and testing best practices'
      },
      {
        title: 'Production Deployment',
        duration_hours: 1,
        lessons: 5,
        description: 'Build optimization, deployment strategies, and monitoring'
      }
    ]
  },
  {
    id: 'data-science-python',
    title: 'Data Science with Python',
    description: 'Complete data science workflow from data collection to machine learning deployment',
    category: 'data-science',
    difficulty: 'beginner',
    estimatedHours: 12,
    modules: 7,
    icon: TrendingUp,
    color: 'bg-green-500',
    skills: [
      'Python Programming',
      'Data Analysis',
      'Machine Learning',
      'Data Visualization',
      'Statistical Analysis',
      'Model Deployment'
    ],
    objectives: [
      'Master Python for data science',
      'Perform comprehensive data analysis',
      'Build and evaluate machine learning models',
      'Create compelling data visualizations',
      'Deploy models to production'
    ],
    targetAudience: [
      'Aspiring data scientists',
      'Analysts',
      'Python developers',
      'Students'
    ],
    modules_structure: [
      {
        title: 'Python for Data Science',
        duration_hours: 2,
        lessons: 12,
        description: 'Python basics, NumPy, Pandas, and data manipulation fundamentals'
      },
      {
        title: 'Data Collection & Cleaning',
        duration_hours: 1.5,
        lessons: 8,
        description: 'Web scraping, APIs, data cleaning, and preprocessing techniques'
      },
      {
        title: 'Exploratory Data Analysis',
        duration_hours: 2,
        lessons: 10,
        description: 'Statistical analysis, hypothesis testing, and data exploration'
      },
      {
        title: 'Data Visualization',
        duration_hours: 1.5,
        lessons: 7,
        description: 'Matplotlib, Seaborn, Plotly, and creating impactful visualizations'
      },
      {
        title: 'Machine Learning Fundamentals',
        duration_hours: 3,
        lessons: 15,
        description: 'Supervised and unsupervised learning, model evaluation, and optimization'
      },
      {
        title: 'Advanced ML & Deep Learning',
        duration_hours: 1.5,
        lessons: 8,
        description: 'Neural networks, deep learning, and advanced algorithms'
      },
      {
        title: 'Model Deployment & Production',
        duration_hours: 0.5,
        lessons: 4,
        description: 'Model deployment, APIs, and production considerations'
      }
    ]
  },
  {
    id: 'ui-ux-design',
    title: 'Complete UI/UX Design',
    description: 'Master user experience design from research to prototyping and testing',
    category: 'design',
    difficulty: 'beginner',
    estimatedHours: 9,
    modules: 6,
    icon: Palette,
    color: 'bg-purple-500',
    skills: [
      'User Research',
      'Wireframing',
      'Prototyping',
      'Visual Design',
      'Usability Testing',
      'Design Systems'
    ],
    objectives: [
      'Conduct effective user research',
      'Create wireframes and prototypes',
      'Design intuitive user interfaces',
      'Test and iterate designs',
      'Build scalable design systems'
    ],
    targetAudience: [
      'Aspiring designers',
      'Product managers',
      'Developers interested in design'
    ],
    modules_structure: [
      {
        title: 'UX Research & Strategy',
        duration_hours: 1.5,
        lessons: 8,
        description: 'User research methods, personas, journey mapping, and strategy development'
      },
      {
        title: 'Information Architecture',
        duration_hours: 1,
        lessons: 6,
        description: 'Site mapping, user flows, and content organization'
      },
      {
        title: 'Wireframing & Prototyping',
        duration_hours: 2,
        lessons: 10,
        description: 'Low-fi to high-fi prototypes, interactive prototyping tools'
      },
      {
        title: 'Visual Design Principles',
        duration_hours: 2,
        lessons: 12,
        description: 'Typography, color theory, layout, and visual hierarchy'
      },
      {
        title: 'Design Systems & Components',
        duration_hours: 1.5,
        lessons: 8,
        description: 'Creating consistent design systems and component libraries'
      },
      {
        title: 'Testing & Iteration',
        duration_hours: 1,
        lessons: 6,
        description: 'Usability testing, A/B testing, and design iteration'
      }
    ]
  }
];

interface CourseTemplatesProps {
  onSelectTemplate: (template: CourseTemplate) => void;
}

export const CourseTemplates: React.FC<CourseTemplatesProps> = ({ onSelectTemplate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Course Templates</h3>
        <p className="text-muted-foreground">
          Get started quickly with pre-designed course structures based on industry standards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courseTemplates.map((template) => {
          const IconComponent = template.icon;
          return (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${template.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{template.difficulty}</Badge>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{template.estimatedHours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{template.modules} modules</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{template.targetAudience.length} audiences</span>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-sm mb-2">Key Skills</h5>
                  <div className="flex flex-wrap gap-1">
                    {template.skills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {template.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-sm mb-2">Course Structure</h5>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {template.modules_structure.slice(0, 3).map((module, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{module.title}</span>
                        <span>{module.duration_hours}h</span>
                      </div>
                    ))}
                    {template.modules_structure.length > 3 && (
                      <div className="text-center text-xs text-muted-foreground">
                        +{template.modules_structure.length - 3} more modules
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => onSelectTemplate(template)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
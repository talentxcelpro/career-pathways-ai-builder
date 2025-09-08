import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, MapPin, DollarSign, Users, Award, 
  Building, Target, Star, AlertTriangle 
} from 'lucide-react';

interface IndustryData {
  name: string;
  growth: number;
  avgSalary: number;
  jobOpenings: number;
  competitionLevel: 'low' | 'medium' | 'high';
  remoteOpportunities: number;
  topCompanies: string[];
  inDemandSkills: Array<{
    skill: string;
    demand: number;
    salaryBoost: number;
  }>;
}

interface CompetitorProfile {
  name: string;
  experience: string;
  skills: string[];
  certifications: string[];
  salary: string;
  location: string;
  strengthScore: number;
}

const IndustryBenchmarking: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('technology');

  const industryData: Record<string, IndustryData> = {
    technology: {
      name: 'Technology',
      growth: 8.2,
      avgSalary: 145000,
      jobOpenings: 2400000,
      competitionLevel: 'high',
      remoteOpportunities: 85,
      topCompanies: ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta'],
      inDemandSkills: [
        { skill: 'Cloud Architecture', demand: 95, salaryBoost: 35 },
        { skill: 'AI/ML', demand: 92, salaryBoost: 42 },
        { skill: 'DevOps', demand: 88, salaryBoost: 28 },
        { skill: 'Cybersecurity', demand: 87, salaryBoost: 31 },
        { skill: 'React/Frontend', demand: 82, salaryBoost: 18 }
      ]
    },
    healthcare: {
      name: 'Healthcare',
      growth: 6.8,
      avgSalary: 78000,
      jobOpenings: 1800000,
      competitionLevel: 'medium',
      remoteOpportunities: 45,
      topCompanies: ['Kaiser Permanente', 'Mayo Clinic', 'Johns Hopkins', 'Cleveland Clinic'],
      inDemandSkills: [
        { skill: 'Telehealth', demand: 89, salaryBoost: 25 },
        { skill: 'Health Informatics', demand: 85, salaryBoost: 30 },
        { skill: 'Patient Care', demand: 92, salaryBoost: 15 },
        { skill: 'Medical Technology', demand: 78, salaryBoost: 22 }
      ]
    },
    finance: {
      name: 'Finance',
      growth: 4.1,
      avgSalary: 125000,
      jobOpenings: 900000,
      competitionLevel: 'high',
      remoteOpportunities: 65,
      topCompanies: ['JPMorgan Chase', 'Goldman Sachs', 'BlackRock', 'Morgan Stanley'],
      inDemandSkills: [
        { skill: 'FinTech', demand: 91, salaryBoost: 38 },
        { skill: 'Risk Management', demand: 86, salaryBoost: 28 },
        { skill: 'Blockchain', demand: 79, salaryBoost: 45 },
        { skill: 'Quantitative Analysis', demand: 84, salaryBoost: 35 }
      ]
    }
  };

  const competitorProfiles: CompetitorProfile[] = [
    {
      name: 'Sarah Chen',
      experience: '8 years',
      skills: ['React', 'Node.js', 'AWS', 'Python', 'Machine Learning'],
      certifications: ['AWS Solutions Architect', 'Google Cloud Professional'],
      salary: '$165,000',
      location: 'San Francisco, CA',
      strengthScore: 92
    },
    {
      name: 'Michael Rodriguez',
      experience: '6 years',
      skills: ['Java', 'Spring Boot', 'Docker', 'Kubernetes', 'DevOps'],
      certifications: ['CKA', 'Jenkins Certified'],
      salary: '$148,000',
      location: 'Austin, TX',
      strengthScore: 88
    },
    {
      name: 'Emily Johnson',
      experience: '5 years',
      skills: ['Python', 'TensorFlow', 'Data Science', 'SQL', 'Analytics'],
      certifications: ['Google Data Analytics', 'AWS Machine Learning'],
      salary: '$142,000',
      location: 'Remote',
      strengthScore: 85
    }
  ];

  const salaryBenchmarkData = [
    { experience: '0-2 years', industry: 85000, market: 82000, yourRange: 78000 },
    { experience: '3-5 years', industry: 125000, market: 118000, yourRange: 115000 },
    { experience: '6-8 years', industry: 165000, market: 158000, yourRange: 155000 },
    { experience: '9+ years', industry: 210000, market: 195000, yourRange: 185000 }
  ];

  const skillsDemandData = industryData[selectedIndustry].inDemandSkills.map(skill => ({
    name: skill.skill,
    demand: skill.demand,
    salaryBoost: skill.salaryBoost
  }));

  const competitionLevelColors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50'
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Industry Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Industry Benchmarking Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Select Industry:</label>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Industry Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Industry Growth</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              +{industryData[selectedIndustry].growth}%
            </div>
            <div className="text-xs text-muted-foreground">Year over year</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Avg Salary</span>
            </div>
            <div className="text-2xl font-bold">
              ${(industryData[selectedIndustry].avgSalary / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-muted-foreground">Industry median</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Job Openings</span>
            </div>
            <div className="text-2xl font-bold">
              {(industryData[selectedIndustry].jobOpenings / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-muted-foreground">Currently available</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Remote Work</span>
            </div>
            <div className="text-2xl font-bold">
              {industryData[selectedIndustry].remoteOpportunities}%
            </div>
            <div className="text-xs text-muted-foreground">Of positions</div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Benchmarking */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Benchmarking by Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryBenchmarkData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="experience" />
              <YAxis tickFormatter={(value) => `$${value / 1000}K`} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
              <Bar dataKey="industry" fill="#3b82f6" name="Industry Average" />
              <Bar dataKey="market" fill="#10b981" name="Market Rate" />
              <Bar dataKey="yourRange" fill="#f59e0b" name="Your Target" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skills Demand Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>High-Demand Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillsDemandData.map((skill, index) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600">+{skill.salaryBoost}% salary</span>
                      <Badge variant="secondary">{skill.demand}% demand</Badge>
                    </div>
                  </div>
                  <Progress value={skill.demand} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competition Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Market Competition</span>
                <Badge className={competitionLevelColors[industryData[selectedIndustry].competitionLevel]}>
                  {industryData[selectedIndustry].competitionLevel} competition
                </Badge>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Top Companies Hiring</h4>
                <div className="flex flex-wrap gap-2">
                  {industryData[selectedIndustry].topCompanies.map((company) => (
                    <Badge key={company} variant="outline">{company}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Market Insight</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      {industryData[selectedIndustry].competitionLevel === 'high' 
                        ? 'High competition means you need to differentiate. Focus on niche skills and certifications.'
                        : industryData[selectedIndustry].competitionLevel === 'medium'
                        ? 'Moderate competition allows for steady growth. Build strong fundamentals and network.'
                        : 'Low competition creates opportunities. Move quickly to establish yourself in this space.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Competitor Profile Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {competitorProfiles.map((competitor, index) => (
              <Card key={index} className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{competitor.name}</h4>
                      <p className="text-sm text-muted-foreground">{competitor.experience} experience</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{competitor.strengthScore}</div>
                      <div className="text-xs text-muted-foreground">Strength Score</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Salary</p>
                      <p className="text-sm text-muted-foreground">{competitor.salary}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Location</p>
                      <p className="text-sm text-muted-foreground">{competitor.location}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Key Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                        {competitor.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{competitor.skills.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Certifications</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.certifications.map((cert) => (
                          <Badge key={cert} variant="outline" className="text-xs">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Immediate Actions (Next 30 days)</h4>
              <ul className="text-sm space-y-1">
                <li>• Target {skillsDemandData[0].name} certification - highest ROI</li>
                <li>• Connect with professionals at top 3 target companies</li>
                <li>• Update LinkedIn with industry keywords</li>
                <li>• Apply to 5-8 positions weekly</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Long-term Strategy (Next 6 months)</h4>
              <ul className="text-sm space-y-1">
                <li>• Build portfolio showcasing {skillsDemandData[1].name} skills</li>
                <li>• Attend 2-3 industry conferences for networking</li>
                <li>• Consider relocation to higher-paying markets</li>
                <li>• Develop thought leadership content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndustryBenchmarking;
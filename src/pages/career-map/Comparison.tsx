
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, TrendingUp, DollarSign, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Comparison = () => {
  const [path1, setPath1] = useState('');
  const [path2, setPath2] = useState('');

  // Mock career paths data
  const careerPaths = {
    'frontend-specialist': {
      title: 'Frontend Specialist',
      description: 'Deep expertise in modern frontend technologies',
      timeToRole: '12-18 months',
      salaryRange: '₹70k - ₹120k',
      demandLevel: 'High',
      skills: ['React', 'Vue.js', 'TypeScript', 'CSS/SASS', 'Testing'],
      pros: ['High demand', 'Creative work', 'Remote-friendly', 'Continuous learning'],
      cons: ['Tech changes rapidly', 'UI/UX dependency', 'Limited backend knowledge'],
      companies: ['Google', 'Facebook', 'Airbnb', 'Netflix'],
      growth: 'Linear with specialization depth'
    },
    'fullstack-engineer': {
      title: 'Full-Stack Engineer',
      description: 'End-to-end web development expertise',
      timeToRole: '18-24 months',
      salaryRange: '₹80k - ₹140k',
      demandLevel: 'Very High',
      skills: ['React', 'Node.js', 'Databases', 'DevOps', 'System Design'],
      pros: ['Versatile', 'High demand', 'Better understanding of systems', 'More opportunities'],
      cons: ['Need to master multiple technologies', 'Can be overwhelming', 'Jack of all trades'],
      companies: ['Startups', 'Medium companies', 'Consulting firms'],
      growth: 'Multiple paths available'
    },
    'backend-engineer': {
      title: 'Backend Engineer',
      description: 'Server-side and infrastructure specialist',
      timeToRole: '15-20 months',
      salaryRange: '₹85k - ₹150k',
      demandLevel: 'High',
      skills: ['Node.js', 'Python', 'Databases', 'API Design', 'Cloud Services'],
      pros: ['High salaries', 'System thinking', 'Infrastructure focus', 'Scalability challenges'],
      cons: ['Less visual feedback', 'Complex debugging', 'Performance pressure'],
      companies: ['Big Tech', 'Fintech', 'Enterprise companies'],
      growth: 'Path to architecture roles'
    }
  };

  const selectedPath1 = path1 ? careerPaths[path1] : null;
  const selectedPath2 = path2 ? careerPaths[path2] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/career-map" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Career Map
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Path Comparison</h1>
          <p className="text-gray-600">Compare different career paths side by side</p>
        </div>

        {/* Path Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Career Paths to Compare</CardTitle>
            <CardDescription>Choose two career paths to see a detailed comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Career Path 1</label>
                <Select value={path1} onValueChange={setPath1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select first career path" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend-specialist">Frontend Specialist</SelectItem>
                    <SelectItem value="fullstack-engineer">Full-Stack Engineer</SelectItem>
                    <SelectItem value="backend-engineer">Backend Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Career Path 2</label>
                <Select value={path2} onValueChange={setPath2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select second career path" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend-specialist">Frontend Specialist</SelectItem>
                    <SelectItem value="fullstack-engineer">Full-Stack Engineer</SelectItem>
                    <SelectItem value="backend-engineer">Backend Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Results */}
        {selectedPath1 && selectedPath2 ? (
          <div className="space-y-8">
            {/* Overview Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-600">{selectedPath1.title}</CardTitle>
                  <CardDescription>{selectedPath1.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Time to Role</span>
                      </div>
                      <Badge variant="outline">{selectedPath1.timeToRole}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Salary Range</span>
                      </div>
                      <Badge variant="secondary">{selectedPath1.salaryRange}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Market Demand</span>
                      </div>
                      <Badge variant="default">{selectedPath1.demandLevel}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-green-600">{selectedPath2.title}</CardTitle>
                  <CardDescription>{selectedPath2.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Time to Role</span>
                      </div>
                      <Badge variant="outline">{selectedPath2.timeToRole}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Salary Range</span>
                      </div>
                      <Badge variant="secondary">{selectedPath2.salaryRange}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Market Demand</span>
                      </div>
                      <Badge variant="default">{selectedPath2.demandLevel}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-blue-600 mb-3">{selectedPath1.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPath1.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-blue-600 border-blue-600">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-green-600 mb-3">{selectedPath2.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPath2.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-green-600 border-green-600">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">{selectedPath1.title} - Pros & Cons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-green-600 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Advantages
                      </h5>
                      <ul className="space-y-1">
                        {selectedPath1.pros.map((pro, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-red-600 mb-2 flex items-center">
                        <XCircle className="h-4 w-4 mr-2" />
                        Challenges
                      </h5>
                      <ul className="space-y-1">
                        {selectedPath1.cons.map((con, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">{selectedPath2.title} - Pros & Cons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-green-600 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Advantages
                      </h5>
                      <ul className="space-y-1">
                        {selectedPath2.pros.map((pro, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-red-600 mb-2 flex items-center">
                        <XCircle className="h-4 w-4 mr-2" />
                        Challenges
                      </h5>
                      <ul className="space-y-1">
                        {selectedPath2.cons.map((con, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Link to="/career-map/generate">
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Generate Roadmap for {selectedPath1.title}
                </Button>
              </Link>
              <Link to="/career-map/generate">
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Generate Roadmap for {selectedPath2.title}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <ArrowRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select Two Career Paths</h3>
              <p className="text-gray-600">Choose two career paths above to see a detailed comparison</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Comparison;

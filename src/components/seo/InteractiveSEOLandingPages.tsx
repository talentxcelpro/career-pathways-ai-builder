
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Briefcase, 
  Code, 
  Building, 
  GraduationCap, 
  DollarSign,
  Search,
  Filter,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Star,
  ArrowRight
} from 'lucide-react';

export const InteractiveSEOLandingPages = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const locations = [
    { name: 'Bangalore', jobs: 1250, companies: 340, avgSalary: '12.5L', growth: '+15%' },
    { name: 'Mumbai', jobs: 980, companies: 280, avgSalary: '14.2L', growth: '+12%' },
    { name: 'Delhi', jobs: 870, companies: 245, avgSalary: '13.8L', growth: '+18%' },
    { name: 'Hyderabad', jobs: 650, companies: 180, avgSalary: '11.2L', growth: '+22%' },
    { name: 'Chennai', jobs: 540, companies: 155, avgSalary: '10.8L', growth: '+16%' },
    { name: 'Pune', jobs: 420, companies: 125, avgSalary: '11.5L', growth: '+14%' },
  ];

  const roles = [
    { name: 'Software Engineer', jobs: 850, demand: 'Very High', avgSalary: '15.2L', skills: ['JavaScript', 'Python', 'React'] },
    { name: 'Data Scientist', jobs: 320, demand: 'High', avgSalary: '18.5L', skills: ['Python', 'ML', 'SQL'] },
    { name: 'Product Manager', jobs: 180, demand: 'High', avgSalary: '22.8L', skills: ['Strategy', 'Analytics', 'Leadership'] },
    { name: 'DevOps Engineer', jobs: 240, demand: 'Very High', avgSalary: '16.8L', skills: ['AWS', 'Docker', 'Kubernetes'] },
    { name: 'UI/UX Designer', jobs: 160, demand: 'Medium', avgSalary: '12.4L', skills: ['Figma', 'Design', 'Prototyping'] },
    { name: 'Business Analyst', jobs: 290, demand: 'Medium', avgSalary: '13.2L', skills: ['Excel', 'SQL', 'Analytics'] },
  ];

  const skills = [
    { name: 'JavaScript', jobs: 1200, trend: 'up', difficulty: 'Medium', courses: 45 },
    { name: 'Python', jobs: 980, trend: 'up', difficulty: 'Easy', courses: 38 },
    { name: 'React', jobs: 750, trend: 'up', difficulty: 'Medium', courses: 32 },
    { name: 'Java', jobs: 680, trend: 'stable', difficulty: 'Medium', courses: 28 },
    { name: 'AWS', jobs: 520, trend: 'up', difficulty: 'Hard', courses: 25 },
    { name: 'Machine Learning', jobs: 410, trend: 'up', difficulty: 'Hard', courses: 22 },
  ];

  const companies = [
    { name: 'Tech Mahindra', location: 'Bangalore', jobs: 45, employees: '5000+', rating: 4.2 },
    { name: 'Infosys', location: 'Hyderabad', jobs: 38, employees: '10000+', rating: 4.1 },
    { name: 'Wipro', location: 'Mumbai', jobs: 32, employees: '8000+', rating: 4.0 },
    { name: 'TCS', location: 'Chennai', jobs: 42, employees: '15000+', rating: 4.3 },
    { name: 'Accenture', location: 'Delhi', jobs: 28, employees: '6000+', rating: 4.2 },
    { name: 'HCL', location: 'Pune', jobs: 25, employees: '4000+', rating: 3.9 },
  ];

  const courseCategories = [
    { name: 'Data Science', courses: 24, students: 3200, rating: 4.6, duration: '12 weeks' },
    { name: 'Web Development', courses: 18, students: 2800, rating: 4.5, duration: '10 weeks' },
    { name: 'Digital Marketing', courses: 15, students: 2100, rating: 4.4, duration: '8 weeks' },
    { name: 'Machine Learning', courses: 12, students: 1900, rating: 4.7, duration: '14 weeks' },
    { name: 'Cloud Computing', courses: 16, students: 1600, rating: 4.5, duration: '12 weeks' },
    { name: 'Cybersecurity', courses: 10, students: 1200, rating: 4.6, duration: '16 weeks' },
  ];

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Interactive SEO Landing Pages</h1>
        <p className="text-gray-600 text-lg">Explore jobs, companies, and learning opportunities</p>
        <div className="max-w-md mx-auto mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search locations, roles, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Salary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        {location.name}
                      </h3>
                      <p className="text-gray-600">Jobs in {location.name}</p>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {location.growth}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available Jobs</span>
                      <span className="font-semibold">{location.jobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Companies</span>
                      <span className="font-semibold">{location.companies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Salary</span>
                      <span className="font-semibold">₹{location.avgSalary}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Explore Jobs in {location.name}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRoles.map((role, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-green-600" />
                        {role.name}
                      </h3>
                      <Badge variant={role.demand === 'Very High' ? 'default' : 'secondary'}>
                        {role.demand} Demand
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₹{role.avgSalary}</p>
                      <p className="text-sm text-gray-600">Average Salary</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available Jobs</span>
                      <span className="font-semibold">{role.jobs}</span>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">Key Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {role.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View {role.name} Jobs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Code className="h-5 w-5 text-purple-600" />
                        {skill.name}
                      </h3>
                      <Badge variant="outline">{skill.difficulty}</Badge>
                    </div>
                    <div className="text-right">
                      {skill.trend === 'up' ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 bg-gray-300 rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Job Openings</span>
                      <span className="font-semibold">{skill.jobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Learning Courses</span>
                      <span className="font-semibold">{skill.courses}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1">
                      Find Jobs
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Learn Skill
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((company, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Building className="h-5 w-5 text-orange-600" />
                        {company.name}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {company.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{company.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Open Positions</span>
                      <span className="font-semibold">{company.jobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employees</span>
                      <span className="font-semibold">{company.employees}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Company Profile
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        {category.name}
                      </h3>
                      <p className="text-gray-600">{category.duration} Duration</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{category.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Courses Available</span>
                      <span className="font-semibold">{category.courses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students Enrolled</span>
                      <span className="font-semibold">{category.students}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Explore {category.name} Courses
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="salary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Salary by Role</CardTitle>
                <CardDescription>Average salary ranges for different roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roles.slice(0, 4).map((role, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{role.name}</span>
                      <span className="text-green-600 font-semibold">₹{role.avgSalary}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Salary by Location</CardTitle>
                <CardDescription>Average salary ranges across different cities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.slice(0, 4).map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{location.name}</span>
                      <span className="text-green-600 font-semibold">₹{location.avgSalary}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

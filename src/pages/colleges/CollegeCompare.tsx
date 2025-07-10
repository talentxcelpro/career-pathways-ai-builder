import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search,
  Plus,
  X,
  Star,
  MapPin,
  Users,
  GraduationCap,
  DollarSign,
  Award,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  BookOpen,
  Wifi,
  Utensils,
  Home,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface College {
  id: string;
  name: string;
  type: string;
  location: string;
  logo_url: string;
  ranking: number;
  rating: number;
  established: number;
  students_count: number;
  faculty_count: number;
  acceptance_rate: number;
  average_fees: number;
  placement_rate: number;
  average_package: number;
  courses_offered: number;
  campus_size: number;
  hostel_available: boolean;
  wifi_available: boolean;
  library_books: number;
  sports_facilities: boolean;
  canteen_available: boolean;
  notable_programs: string[];
  accreditation: string;
}

const CollegeCompare = () => {
  const [searchParams] = useSearchParams();
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Sample colleges data
  const sampleColleges: College[] = [
    {
      id: '1',
      name: 'Indian Institute of Technology Delhi',
      type: 'Government',
      location: 'New Delhi, Delhi',
      logo_url: '/placeholder.svg',
      ranking: 2,
      rating: 4.8,
      established: 1961,
      students_count: 8500,
      faculty_count: 650,
      acceptance_rate: 2.1,
      average_fees: 200000,
      placement_rate: 92,
      average_package: 1200000,
      courses_offered: 45,
      campus_size: 325,
      hostel_available: true,
      wifi_available: true,
      library_books: 120000,
      sports_facilities: true,
      canteen_available: true,
      notable_programs: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering'],
      accreditation: 'NAAC A++'
    },
    {
      id: '2',
      name: 'Jawaharlal Nehru University',
      type: 'Government',
      location: 'New Delhi, Delhi',
      logo_url: '/placeholder.svg',
      ranking: 12,
      rating: 4.5,
      established: 1969,
      students_count: 9500,
      faculty_count: 550,
      acceptance_rate: 5.8,
      average_fees: 50000,
      placement_rate: 78,
      average_package: 600000,
      courses_offered: 78,
      campus_size: 1000,
      hostel_available: true,
      wifi_available: true,
      library_books: 800000,
      sports_facilities: true,
      canteen_available: true,
      notable_programs: ['International Relations', 'Economics', 'Political Science'],
      accreditation: 'NAAC A++'
    },
    {
      id: '3',
      name: 'Delhi Technological University',
      type: 'Government',
      location: 'New Delhi, Delhi',
      logo_url: '/placeholder.svg',
      ranking: 28,
      rating: 4.2,
      established: 1941,
      students_count: 7200,
      faculty_count: 420,
      acceptance_rate: 8.5,
      average_fees: 180000,
      placement_rate: 85,
      average_package: 800000,
      courses_offered: 35,
      campus_size: 164,
      hostel_available: true,
      wifi_available: true,
      library_books: 85000,
      sports_facilities: true,
      canteen_available: true,
      notable_programs: ['Computer Engineering', 'Electronics', 'Software Engineering'],
      accreditation: 'NAAC A+'
    }
  ];

  const addCollege = (college: College) => {
    if (selectedColleges.length >= 4) {
      toast.error('You can compare maximum 4 colleges at a time');
      return;
    }
    
    if (selectedColleges.find(c => c.id === college.id)) {
      toast.error('College already added for comparison');
      return;
    }

    setSelectedColleges([...selectedColleges, college]);
    setShowSearch(false);
    setSearchTerm('');
    toast.success(`${college.name} added for comparison`);
  };

  const removeCollege = (collegeId: string) => {
    setSelectedColleges(selectedColleges.filter(c => c.id !== collegeId));
    toast.success('College removed from comparison');
  };

  const filteredColleges = sampleColleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedColleges.find(c => c.id === college.id)
  );

  const comparisonCategories = [
    {
      title: 'Basic Information',
      fields: [
        { key: 'type', label: 'Type', format: (value: any) => value },
        { key: 'location', label: 'Location', format: (value: any) => value },
        { key: 'established', label: 'Established', format: (value: any) => value },
        { key: 'accreditation', label: 'Accreditation', format: (value: any) => value }
      ]
    },
    {
      title: 'Rankings & Ratings',
      fields: [
        { key: 'ranking', label: 'National Ranking', format: (value: any) => `#${value}` },
        { key: 'rating', label: 'Rating', format: (value: any) => `${value}/5` },
        { key: 'acceptance_rate', label: 'Acceptance Rate', format: (value: any) => `${value}%` }
      ]
    },
    {
      title: 'Academic Details',
      fields: [
        { key: 'students_count', label: 'Total Students', format: (value: any) => value.toLocaleString() },
        { key: 'faculty_count', label: 'Faculty Count', format: (value: any) => value.toLocaleString() },
        { key: 'courses_offered', label: 'Courses Offered', format: (value: any) => value },
        { key: 'library_books', label: 'Library Books', format: (value: any) => value.toLocaleString() }
      ]
    },
    {
      title: 'Fees & Placements',
      fields: [
        { key: 'average_fees', label: 'Annual Fees', format: (value: any) => `₹${(value / 100000).toFixed(1)}L` },
        { key: 'placement_rate', label: 'Placement Rate', format: (value: any) => `${value}%` },
        { key: 'average_package', label: 'Average Package', format: (value: any) => `₹${(value / 100000).toFixed(1)}L` }
      ]
    },
    {
      title: 'Campus Facilities',
      fields: [
        { key: 'campus_size', label: 'Campus Size', format: (value: any) => `${value} acres` },
        { key: 'hostel_available', label: 'Hostel', format: (value: any) => value ? 'Available' : 'Not Available' },
        { key: 'wifi_available', label: 'WiFi', format: (value: any) => value ? 'Available' : 'Not Available' },
        { key: 'sports_facilities', label: 'Sports', format: (value: any) => value ? 'Available' : 'Not Available' },
        { key: 'canteen_available', label: 'Canteen', format: (value: any) => value ? 'Available' : 'Not Available' }
      ]
    }
  ];

  const getBestValue = (field: string, colleges: College[]) => {
    if (colleges.length === 0) return null;
    
    const values = colleges.map(c => (c as any)[field]);
    
    // Higher is better for these fields
    const higherIsBetter = ['rating', 'placement_rate', 'average_package', 'students_count', 'faculty_count', 'courses_offered', 'library_books', 'campus_size'];
    // Lower is better for these fields
    const lowerIsBetter = ['ranking', 'acceptance_rate', 'average_fees'];
    
    if (higherIsBetter.includes(field)) {
      return Math.max(...values);
    } else if (lowerIsBetter.includes(field)) {
      return Math.min(...values);
    }
    
    return null;
  };

  const isFieldBest = (field: string, value: any, colleges: College[]) => {
    const bestValue = getBestValue(field, colleges);
    return bestValue !== null && value === bestValue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Compare Colleges
            </CardTitle>
            <p className="text-gray-600">
              Compare colleges side by side to make an informed decision
            </p>
          </CardHeader>
        </Card>

        {/* Add College Section */}
        {selectedColleges.length < 4 && (
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowSearch(!showSearch)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add College to Compare
                </Button>
                <span className="text-sm text-gray-600">
                  {selectedColleges.length}/4 colleges selected
                </span>
              </div>

              {showSearch && (
                <div className="mt-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search colleges..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredColleges.map((college) => (
                      <div
                        key={college.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => addCollege(college)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={college.logo_url} alt={college.name} />
                            <AvatarFallback>{college.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-gray-900">{college.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              {college.location}
                              <Badge variant="outline">#{college.ranking}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Comparison Table */}
        {selectedColleges.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* College Headers */}
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="p-4 text-left font-medium text-gray-600 min-w-[200px]">
                        Comparison Criteria
                      </th>
                      {selectedColleges.map((college) => (
                        <th key={college.id} className="p-4 text-center min-w-[250px]">
                          <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={college.logo_url} alt={college.name} />
                                <AvatarFallback className="text-lg">
                                  {college.name.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={() => removeCollege(college.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-center">
                              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                                {college.name}
                              </h3>
                              <div className="flex items-center justify-center gap-1 mt-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600">{college.rating}</span>
                              </div>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Comparison Data */}
                  <tbody>
                    {comparisonCategories.map((category, categoryIndex) => (
                      <React.Fragment key={categoryIndex}>
                        <tr className="bg-blue-50/50">
                          <td colSpan={selectedColleges.length + 1} className="p-3">
                            <h4 className="font-semibold text-blue-800">{category.title}</h4>
                          </td>
                        </tr>
                        {category.fields.map((field, fieldIndex) => (
                          <tr key={fieldIndex} className="border-b hover:bg-gray-50/50">
                            <td className="p-4 font-medium text-gray-700">
                              {field.label}
                            </td>
                            {selectedColleges.map((college) => {
                              const value = (college as any)[field.key];
                              const isBest = isFieldBest(field.key, value, selectedColleges);
                              
                              return (
                                <td key={college.id} className="p-4 text-center">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                                    isBest ? 'bg-green-100 text-green-800' : 'text-gray-700'
                                  }`}>
                                    {isBest && <CheckCircle className="h-4 w-4" />}
                                    <span className="font-medium">
                                      {field.format(value)}
                                    </span>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}

                    {/* Notable Programs */}
                    <tr className="bg-purple-50/50">
                      <td colSpan={selectedColleges.length + 1} className="p-3">
                        <h4 className="font-semibold text-purple-800">Notable Programs</h4>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium text-gray-700">Top Programs</td>
                      {selectedColleges.map((college) => (
                        <td key={college.id} className="p-4">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {college.notable_programs.slice(0, 3).map((program, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {program}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {selectedColleges.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Start Comparing Colleges
                </h3>
                <p className="text-gray-600 mb-6">
                  Add colleges to compare their rankings, fees, facilities, and more side by side.
                </p>
                <Button
                  onClick={() => setShowSearch(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First College
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CollegeCompare;
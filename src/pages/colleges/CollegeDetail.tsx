
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { School, MapPin, Users, Star, GraduationCap } from 'lucide-react';

const CollegeDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* College Header */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-green-600 to-blue-600"></div>
          <CardContent className="relative -mt-16 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center border-4 border-white">
                <School className="h-12 w-12 text-green-600" />
              </div>
              <div className="flex-1 mt-4">
                <h1 className="text-2xl font-bold text-gray-900">College Name</h1>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>10,000+ students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>4.5 rating</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Save
                </Button>
                <Button size="sm">View Programs</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* College Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  College description and details will be displayed here. This is a placeholder for college information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Programs</CardTitle>
                <CardDescription>Available academic programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Computer Science</h4>
                      <p className="text-sm text-gray-600">Bachelor's Degree</p>
                    </div>
                    <Badge>4 years</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Business Administration</h4>
                      <p className="text-sm text-gray-600">Bachelor's Degree</p>
                    </div>
                    <Badge>4 years</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Founded</span>
                  <span>1950</span>
                </div>
                <div className="flex justify-between">
                  <span>Students</span>
                  <span>10,000+</span>
                </div>
                <div className="flex justify-between">
                  <span>Programs</span>
                  <span>50+</span>
                </div>
                <div className="flex justify-between">
                  <span>Type</span>
                  <span>Public</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Majors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Computer Science</Badge>
                  <Badge variant="secondary">Business</Badge>
                  <Badge variant="secondary">Engineering</Badge>
                  <Badge variant="secondary">Medicine</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeDetail;


import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Users, Globe, Heart } from 'lucide-react';

const CompanyDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Company Header */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <CardContent className="relative -mt-16 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center border-4 border-white">
                <Building className="h-12 w-12 text-blue-600" />
              </div>
              <div className="flex-1 mt-4">
                <h1 className="text-2xl font-bold text-gray-900">Company Name</h1>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>1000+ employees</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>Technology</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Follow
                </Button>
                <Button size="sm">View Jobs</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Company description and details will be displayed here. This is a placeholder for company information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Positions</CardTitle>
                <CardDescription>Current job openings at this company</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  No open positions available at the moment.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Founded</span>
                  <span>2020</span>
                </div>
                <div className="flex justify-between">
                  <span>Employees</span>
                  <span>1000+</span>
                </div>
                <div className="flex justify-between">
                  <span>Open Jobs</span>
                  <span>15</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Python</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
